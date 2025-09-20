from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import JWTError, jwt
import json
from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# JWT settings
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 60  # 30 days

# LLM setup
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")

# Stripe setup
STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY")

# Create the main app without a prefix
app = FastAPI(title="Cloud Career Coach API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Premium subscription packages
SUBSCRIPTION_PACKAGES = {
    "monthly": {"amount": 29.99, "name": "Monthly Premium", "description": "AI-powered study plans for 1 month"},
    "yearly": {"amount": 299.99, "name": "Yearly Premium", "description": "AI-powered study plans for 1 year"}
}

# === MODELS ===

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    full_name: str
    hashed_password: str
    is_premium: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class Assessment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    current_role: str
    experience_level: str
    skills: List[str]
    career_goals: str
    career_roadmap: str
    next_steps: List[str]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AssessmentRequest(BaseModel):
    current_role: str
    experience_level: str
    skills: List[str]
    career_goals: str

class MotivationContent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    quote: str
    tip: str
    category: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StudyPlan(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    week_number: int
    title: str
    description: str
    daily_tasks: List[str]
    resources: List[str]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PaymentTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    session_id: str
    amount: float
    currency: str = "usd"
    payment_status: str = "pending"
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# === UTILITY FUNCTIONS ===

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"email": email})
    if user is None:
        raise credentials_exception
    return User(**user)

def serialize_for_mongo(data):
    """Convert datetime objects to ISO strings for MongoDB storage"""
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, datetime):
                data[key] = value.isoformat()
    return data

def parse_from_mongo(item):
    """Convert ISO strings back to datetime objects"""
    if isinstance(item, dict):
        for key, value in item.items():
            if isinstance(value, str) and key.endswith('_at'):
                try:
                    item[key] = datetime.fromisoformat(value)
                except ValueError:
                    pass
    return item

# === AUTHENTICATION ENDPOINTS ===

@api_router.post("/auth/register", response_model=Token)
async def register(user: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user.email.lower()})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    user_dict = {
        "id": str(uuid.uuid4()),
        "email": user.email.lower(),
        "full_name": user.full_name,
        "hashed_password": hashed_password,
        "is_premium": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(serialize_for_mongo(user_dict))
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email.lower()}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.post("/auth/login", response_model=Token)
async def login(user: UserLogin):
    # Find user
    db_user = await db.users.find_one({"email": user.email.lower()})
    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email.lower()}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.get("/auth/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

# === ASSESSMENT ENDPOINTS ===

@api_router.post("/assessment", response_model=Assessment)
async def create_assessment(assessment_req: AssessmentRequest, current_user: User = Depends(get_current_user)):
    # Use AI to generate career roadmap and next steps
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"assessment_{current_user.id}",
            system_message="You are a professional cloud career coach. Generate personalized career roadmaps and actionable next steps for cloud professionals."
        ).with_model("openai", "gpt-4o-mini")
        
        prompt = f"""
        Create a personalized career roadmap for a cloud professional with these details:
        - Current Role: {assessment_req.current_role}
        - Experience Level: {assessment_req.experience_level}
        - Current Skills: {', '.join(assessment_req.skills)}
        - Career Goals: {assessment_req.career_goals}
        
        Please provide:
        1. A comprehensive career roadmap (2-3 paragraphs)
        2. Top 5 next actionable steps they should take
        
        Format your response as JSON with keys: "roadmap", "next_steps" (array)
        """
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse AI response
        try:
            ai_data = json.loads(response)
            roadmap = ai_data.get("roadmap", "Your career roadmap is being generated...")
            next_steps = ai_data.get("next_steps", ["Continue learning cloud technologies", "Get certified in your chosen cloud platform"])
        except:
            roadmap = "Your personalized career roadmap will help you advance in cloud computing by focusing on your specific goals and building upon your current experience."
            next_steps = ["Get certified in AWS/Azure/GCP", "Build hands-on projects", "Network with cloud professionals", "Stay updated with latest technologies", "Consider specialization areas"]
        
    except Exception as e:
        logging.error(f"AI assessment error: {e}")
        roadmap = "Your personalized career roadmap will help you advance in cloud computing by focusing on your specific goals and building upon your current experience."
        next_steps = ["Get certified in AWS/Azure/GCP", "Build hands-on projects", "Network with cloud professionals", "Stay updated with latest technologies", "Consider specialization areas"]
    
    # Save assessment
    assessment = Assessment(
        user_id=current_user.id,
        current_role=assessment_req.current_role,
        experience_level=assessment_req.experience_level,
        skills=assessment_req.skills,
        career_goals=assessment_req.career_goals,
        career_roadmap=roadmap,
        next_steps=next_steps
    )
    
    await db.assessments.insert_one(serialize_for_mongo(assessment.dict()))
    return assessment

@api_router.get("/assessment", response_model=Optional[Assessment])
async def get_latest_assessment(current_user: User = Depends(get_current_user)):
    assessment = await db.assessments.find_one(
        {"user_id": current_user.id},
        sort=[("created_at", -1)]
    )
    if assessment:
        return Assessment(**parse_from_mongo(assessment))
    return None

# === MOTIVATION ENDPOINTS ===

@api_router.get("/motivation/daily", response_model=MotivationContent)
async def get_daily_motivation():
    # Check if we have today's content
    today = datetime.now(timezone.utc).date()
    existing_content = await db.motivation_content.find_one({
        "created_at": {
            "$gte": datetime.combine(today, datetime.min.time()),
            "$lt": datetime.combine(today + timedelta(days=1), datetime.min.time())
        }
    })
    
    if existing_content:
        return MotivationContent(**parse_from_mongo(existing_content))
    
    # Generate new daily content using AI
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"motivation_{today}",
            system_message="You are a motivational cloud career coach. Generate inspiring quotes and practical tips for cloud professionals."
        ).with_model("openai", "gpt-4o-mini")
        
        prompt = """
        Generate daily motivational content for cloud professionals including:
        1. An inspiring quote related to cloud computing, technology, or career growth
        2. A practical tip for advancing in cloud careers
        
        Format as JSON with keys: "quote", "tip"
        """
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        try:
            ai_data = json.loads(response)
            quote = ai_data.get("quote", "The cloud is not just a technology, it's a mindset that embraces infinite possibilities.")
            tip = ai_data.get("tip", "Focus on hands-on practice today - build something small but meaningful in the cloud.")
        except:
            quote = "The cloud is not just a technology, it's a mindset that embraces infinite possibilities."
            tip = "Focus on hands-on practice today - build something small but meaningful in the cloud."
            
    except Exception as e:
        logging.error(f"AI motivation error: {e}")
        quote = "The cloud is not just a technology, it's a mindset that embraces infinite possibilities."
        tip = "Focus on hands-on practice today - build something small but meaningful in the cloud."
    
    # Save and return content
    content = MotivationContent(
        quote=quote,
        tip=tip,
        category="daily"
    )
    
    await db.motivation_content.insert_one(serialize_for_mongo(content.dict()))
    return content

# === STUDY PLAN ENDPOINTS (PREMIUM) ===

@api_router.get("/study-plans", response_model=List[StudyPlan])
async def get_study_plans(current_user: User = Depends(get_current_user)):
    if not current_user.is_premium:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Premium subscription required"
        )
    
    study_plans = await db.study_plans.find({"user_id": current_user.id}).to_list(length=None)
    return [StudyPlan(**parse_from_mongo(plan)) for plan in study_plans]

@api_router.post("/study-plans/generate", response_model=StudyPlan)
async def generate_study_plan(week_number: int, current_user: User = Depends(get_current_user)):
    if not current_user.is_premium:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Premium subscription required"
        )
    
    # Check if plan already exists for this week
    existing_plan = await db.study_plans.find_one({
        "user_id": current_user.id,
        "week_number": week_number
    })
    
    if existing_plan:
        return StudyPlan(**parse_from_mongo(existing_plan))
    
    # Get user's latest assessment for personalization
    assessment = await db.assessments.find_one(
        {"user_id": current_user.id},
        sort=[("created_at", -1)]
    )
    
    # Generate study plan using AI
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"study_plan_{current_user.id}_{week_number}",
            system_message="You are an expert cloud career coach creating personalized weekly study plans."
        ).with_model("openai", "gpt-4o-mini")
        
        assessment_context = ""
        if assessment:
            assessment_context = f"""
            User's background:
            - Role: {assessment.get('current_role', 'Cloud Professional')}
            - Experience: {assessment.get('experience_level', 'Intermediate')}
            - Skills: {', '.join(assessment.get('skills', []))}
            - Goals: {assessment.get('career_goals', 'Advance in cloud career')}
            """
        
        prompt = f"""
        Create a personalized weekly study plan (Week {week_number}) for a cloud professional.
        
        {assessment_context}
        
        Generate:
        1. A compelling title for the week
        2. A brief description of what they'll accomplish
        3. 5-7 daily tasks/activities
        4. 3-5 recommended resources (courses, articles, hands-on labs)
        
        Format as JSON with keys: "title", "description", "daily_tasks" (array), "resources" (array)
        """
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        try:
            ai_data = json.loads(response)
            title = ai_data.get("title", f"Cloud Skills Development - Week {week_number}")
            description = ai_data.get("description", "This week focuses on building core cloud competencies and practical skills.")
            daily_tasks = ai_data.get("daily_tasks", [
                "Review cloud fundamentals",
                "Complete hands-on lab exercises",
                "Study for certification",
                "Practice with CLI tools",
                "Build a small project",
                "Network with cloud professionals",
                "Reflect on weekly progress"
            ])
            resources = ai_data.get("resources", [
                "AWS/Azure/GCP Documentation",
                "Cloud certification courses",
                "Hands-on lab platform",
                "Cloud community forums",
                "Industry blogs and articles"
            ])
        except:
            title = f"Cloud Skills Development - Week {week_number}"
            description = "This week focuses on building core cloud competencies and practical skills."
            daily_tasks = [
                "Review cloud fundamentals",
                "Complete hands-on lab exercises", 
                "Study for certification",
                "Practice with CLI tools",
                "Build a small project",
                "Network with cloud professionals",
                "Reflect on weekly progress"
            ]
            resources = [
                "AWS/Azure/GCP Documentation",
                "Cloud certification courses",
                "Hands-on lab platform",
                "Cloud community forums",
                "Industry blogs and articles"
            ]
            
    except Exception as e:
        logging.error(f"AI study plan error: {e}")
        title = f"Cloud Skills Development - Week {week_number}"
        description = "This week focuses on building core cloud competencies and practical skills."
        daily_tasks = [
            "Review cloud fundamentals",
            "Complete hands-on lab exercises",
            "Study for certification", 
            "Practice with CLI tools",
            "Build a small project",
            "Network with cloud professionals",
            "Reflect on weekly progress"
        ]
        resources = [
            "AWS/Azure/GCP Documentation",
            "Cloud certification courses",
            "Hands-on lab platform",
            "Cloud community forums",
            "Industry blogs and articles"
        ]
    
    # Save study plan
    study_plan = StudyPlan(
        user_id=current_user.id,
        week_number=week_number,
        title=title,
        description=description,
        daily_tasks=daily_tasks,
        resources=resources
    )
    
    await db.study_plans.insert_one(serialize_for_mongo(study_plan.dict()))
    return study_plan

# === PAYMENT ENDPOINTS ===

@api_router.post("/payments/checkout", response_model=CheckoutSessionResponse)
async def create_checkout_session(
    request: Request,
    package_id: str,
    current_user: User = Depends(get_current_user)
):
    # Validate package
    if package_id not in SUBSCRIPTION_PACKAGES:
        raise HTTPException(status_code=400, detail="Invalid subscription package")
    
    package = SUBSCRIPTION_PACKAGES[package_id]
    
    # Get host URL from request
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    
    # Initialize Stripe checkout
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    # Create success and cancel URLs
    frontend_origin = request.headers.get("origin", host_url.rstrip('/'))
    success_url = f"{frontend_origin}/premium/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{frontend_origin}/premium"
    
    # Create checkout session request
    checkout_request = CheckoutSessionRequest(
        amount=package["amount"],
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": current_user.id,
            "user_email": current_user.email,
            "package_id": package_id,
            "package_name": package["name"]
        }
    )
    
    # Create checkout session
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Save payment transaction
    transaction = PaymentTransaction(
        user_id=current_user.id,
        session_id=session.session_id,
        amount=package["amount"],
        currency="usd",
        payment_status="pending",
        metadata=checkout_request.metadata
    )
    
    await db.payment_transactions.insert_one(serialize_for_mongo(transaction.dict()))
    
    return session

@api_router.get("/payments/status/{session_id}", response_model=CheckoutStatusResponse)
async def get_payment_status(session_id: str, current_user: User = Depends(get_current_user)):
    # Find transaction
    transaction = await db.payment_transactions.find_one({"session_id": session_id})
    if not transaction or transaction["user_id"] != current_user.id:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Check with Stripe
    host_url = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001")
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    checkout_status = await stripe_checkout.get_checkout_status(session_id)
    
    # Update transaction if status changed
    if checkout_status.payment_status != transaction["payment_status"]:
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {
                "$set": {
                    "payment_status": checkout_status.payment_status,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        # Update user premium status if payment successful
        if checkout_status.payment_status == "paid" and not current_user.is_premium:
            await db.users.update_one(
                {"id": current_user.id},
                {"$set": {"is_premium": True}}
            )
    
    return checkout_status

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None)):
    body = await request.body()
    
    # Initialize Stripe checkout
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    try:
        # Handle webhook
        webhook_response = await stripe_checkout.handle_webhook(body, stripe_signature)
        
        # Update transaction
        if webhook_response.session_id:
            await db.payment_transactions.update_one(
                {"session_id": webhook_response.session_id},
                {
                    "$set": {
                        "payment_status": webhook_response.payment_status,
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
            
            # Update user premium status if payment successful
            if webhook_response.payment_status == "paid":
                transaction = await db.payment_transactions.find_one({"session_id": webhook_response.session_id})
                if transaction and transaction.get("user_id"):
                    await db.users.update_one(
                        {"id": transaction["user_id"]},
                        {"$set": {"is_premium": True}}
                    )
        
        return {"status": "success"}
        
    except Exception as e:
        logging.error(f"Webhook error: {e}")
        raise HTTPException(status_code=400, detail="Webhook failed")

# === BASIC ENDPOINTS ===

@api_router.get("/")
async def root():
    return {"message": "Cloud Career Coach API"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc)}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()