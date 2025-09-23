import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Separator } from "./components/ui/separator";
import { Avatar, AvatarFallback } from "./components/ui/avatar";
import { Progress } from "./components/ui/progress";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { 
  Cloud, 
  TrendingUp, 
  BookOpen, 
  Award, 
  User, 
  LogOut, 
  Mail, 
  Lock, 
  Target, 
  CheckCircle, 
  Star,
  Calendar,
  Crown,
  Rocket,
  Brain,
  Heart,
  Users,
  ArrowRight,
  Menu,
  X,
  Clock
} from "lucide-react";
import "./App.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = React.createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/auth" />;
};

// Navigation Component
const Navigation = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <Cloud className="h-8 w-8 text-blue-600" />
            <span className="font-bold text-xl text-gray-900">CloudCareer</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <Link to="/assessment" className="text-gray-700 hover:text-blue-600 transition-colors">
              Assessment
            </Link>
            <Link to="/motivation" className="text-gray-700 hover:text-blue-600 transition-colors">
              Motivation
            </Link>
            <Link to="/premium" className="text-gray-700 hover:text-blue-600 transition-colors flex items-center">
              {user.is_premium ? <Crown className="h-4 w-4 mr-1 text-yellow-500" /> : null}
              Study Plans
            </Link>
            
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback>{user.full_name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
              <Link 
                to="/dashboard" 
                className="text-gray-700 hover:text-blue-600 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                to="/assessment" 
                className="text-gray-700 hover:text-blue-600 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Assessment
              </Link>
              <Link 
                to="/motivation" 
                className="text-gray-700 hover:text-blue-600 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Motivation
              </Link>
              <Link 
                to="/premium" 
                className="text-gray-700 hover:text-blue-600 transition-colors py-2 flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                {user.is_premium ? <Crown className="h-4 w-4 mr-1 text-yellow-500" /> : null}
                Study Plans
              </Link>
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">{user.full_name}</p>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="justify-start w-full">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Landing Page Component
const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Cloud className="h-8 w-8 text-blue-600" />
              <span className="font-bold text-xl text-gray-900">CloudCareer Coach</span>
            </div>
            <Button onClick={() => navigate('/auth')} className="bg-blue-600 hover:bg-blue-700">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="text-blue-700 bg-blue-100">
                  AI-Powered Career Coaching
                </Badge>
                <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                  10x Your Cloud Career with 
                  <span className="text-blue-600"> AI Guidance</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Get personalized career assessments, daily motivation, and premium study plans 
                  designed specifically for cloud professionals who want to advance their careers.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                  onClick={() => navigate('/auth')}
                >
                  Start Free Assessment <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-3">
                  Learn More
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1690627931320-16ac56eb2588"
                  alt="Cloud Career Development"
                  className="w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-blue-600/10"></div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 rounded-full p-2">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Career Roadmap Ready!</p>
                    <p className="text-sm text-gray-600">Personalized for your goals</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600">
              Professional-grade tools designed for cloud career advancement
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-6">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">AI Career Assessment</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  Get personalized career roadmaps based on your current skills, experience, and goals.
                </p>
                <ul className="text-sm text-gray-500 space-y-2">
                  <li>• Multi-step onboarding quiz</li>
                  <li>• Personalized recommendations</li>
                  <li>• Actionable next steps</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-6">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Daily Motivation</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  Stay motivated with daily quotes and practical tips specifically for cloud professionals.
                </p>
                <ul className="text-sm text-gray-500 space-y-2">
                  <li>• Cloud-focused content</li>
                  <li>• Daily inspiration</li>
                  <li>• Practical career tips</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-6">
                <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Crown className="h-8 w-8 text-yellow-600" />
                </div>
                <CardTitle className="text-xl">Premium Study Plans</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  AI-generated weekly study schedules tailored to your career goals and learning pace.
                </p>
                <ul className="text-sm text-gray-500 space-y-2">
                  <li>• Weekly structured plans</li>
                  <li>• Personalized content</li>
                  <li>• Progress tracking</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to 10x Your Cloud Career?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of cloud professionals who are advancing their careers with AI-powered guidance.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3"
            onClick={() => navigate('/auth')}
          >
            Start Your Free Assessment <Rocket className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Cloud className="h-6 w-6" />
            <span className="font-bold text-lg">CloudCareer Coach</span>
          </div>
          <p className="text-gray-400">
            Empowering cloud professionals to reach their full potential.
          </p>
        </div>
      </footer>
    </div>
  );
};

// Auth Component
const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const response = await axios.post(`${API}${endpoint}`, formData);
      
      login(response.data.access_token);
      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
      
      // Use setTimeout to ensure the token is set before navigation
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Cloud className="h-8 w-8 text-blue-600" />
            <span className="font-bold text-xl">CloudCareer</span>
          </div>
          <CardTitle className="text-2xl">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
          <CardDescription>
            {isLogin 
              ? 'Sign in to continue your cloud career journey' 
              : 'Start your cloud career transformation today'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="full_name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-blue-600 hover:underline"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Dashboard Component
const Dashboard = () => {
  const { user } = useAuth();
  const [assessment, setAssessment] = useState(null);
  const [motivation, setMotivation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [assessmentRes, motivationRes] = await Promise.all([
        axios.get(`${API}/assessment`),
        axios.get(`${API}/motivation/daily`)
      ]);
      
      setAssessment(assessmentRes.data);
      setMotivation(motivationRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Welcome back, {user.full_name}!
                </h1>
                <p className="text-blue-100">
                  Ready to advance your cloud career today?
                </p>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/10 rounded-lg p-4">
                  <Cloud className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Account Status</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {user.is_premium ? 'Premium' : 'Free'}
                  </p>
                </div>
                {user.is_premium ? (
                  <Crown className="h-8 w-8 text-yellow-500" />
                ) : (
                  <User className="h-8 w-8 text-gray-400" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Assessment</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {assessment ? 'Complete' : 'Pending'}
                  </p>
                </div>
                <Target className={`h-8 w-8 ${assessment ? 'text-green-500' : 'text-gray-400'}`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Daily Motivation</p>
                  <p className="text-2xl font-bold text-gray-900">Ready</p>
                </div>
                <Heart className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Assessment Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2 text-blue-600" />
                Career Assessment
              </CardTitle>
              <CardDescription>
                {assessment ? 'Your personalized career roadmap' : 'Get started with your career assessment'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assessment ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Your Career Roadmap</h4>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {assessment.career_roadmap}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Next Steps</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {assessment.next_steps.slice(0, 3).map((step, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/assessment">View Full Assessment</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Take our AI-powered assessment to get your personalized career roadmap.
                  </p>
                  <Button asChild>
                    <Link to="/assessment">Start Assessment</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Motivation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2 text-red-600" />
                Today's Motivation
              </CardTitle>
              <CardDescription>
                Daily inspiration for cloud professionals
              </CardDescription>
            </CardHeader>
            <CardContent>
              {motivation ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Quote of the Day</h4>
                    <blockquote className="text-gray-600 italic border-l-4 border-blue-500 pl-4">
                      "{motivation.quote}"
                    </blockquote>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Daily Tip</h4>
                    <p className="text-gray-600 text-sm">
                      {motivation.tip}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/motivation">View More</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Loading your daily motivation...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Premium CTA */}
        {!user.is_premium && (
          <Card className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Unlock Premium Study Plans
                  </h3>
                  <p className="text-gray-600">
                    Get AI-generated weekly study schedules tailored to your career goals.
                  </p>
                </div>
                <Button asChild className="bg-yellow-600 hover:bg-yellow-700">
                  <Link to="/premium">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade Now
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

// Assessment Component
const AssessmentPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [assessment, setAssessment] = useState(null);
  const [formData, setFormData] = useState({
    current_role: '',
    experience_level: '',
    skills: [],
    career_goals: ''
  });
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    fetchExistingAssessment();
  }, []);

  const fetchExistingAssessment = async () => {
    try {
      const response = await axios.get(`${API}/assessment`);
      if (response.data) {
        setAssessment(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch assessment:', error);
    } finally {
      setInitialLoad(false);
    }
  };

  const skillOptions = [
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform',
    'CloudFormation', 'CI/CD', 'DevOps', 'Python', 'Java', 'Node.js',
    'Monitoring', 'Security', 'Networking', 'Database Management'
  ];

  const handleSkillToggle = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/assessment`, formData);
      setAssessment(response.data);
      toast.success('Assessment completed successfully!');
    } catch (error) {
      toast.error('Failed to complete assessment');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: 'Current Role',
      content: (
        <div className="space-y-4">
          <Label htmlFor="role">What's your current role?</Label>
          <Input
            id="role"
            placeholder="e.g., Cloud Engineer, DevOps Engineer, Solutions Architect"
            value={formData.current_role}
            onChange={(e) => setFormData({...formData, current_role: e.target.value})}
          />
        </div>
      )
    },
    {
      title: 'Experience Level',
      content: (
        <div className="space-y-4">
          <Label>What's your experience level?</Label>
          <div className="grid grid-cols-1 gap-3">
            {['Beginner (0-2 years)', 'Intermediate (2-5 years)', 'Advanced (5+ years)'].map(level => (
              <button
                key={level}
                onClick={() => setFormData({...formData, experience_level: level})}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  formData.experience_level === level
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      )
    },
    {
      title: 'Skills',
      content: (
        <div className="space-y-4">
          <Label>Select your current skills (choose multiple)</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {skillOptions.map(skill => (
              <button
                key={skill}
                onClick={() => handleSkillToggle(skill)}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  formData.skills.includes(skill)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Selected: {formData.skills.length} skills
          </p>
        </div>
      )
    },
    {
      title: 'Career Goals',
      content: (
        <div className="space-y-4">
          <Label htmlFor="goals">What are your career goals?</Label>
          <textarea
            id="goals"
            className="w-full p-3 border border-gray-300 rounded-lg resize-none h-32"
            placeholder="e.g., I want to become a Senior Cloud Architect, specialize in security, or lead a DevOps team..."
            value={formData.career_goals}
            onChange={(e) => setFormData({...formData, career_goals: e.target.value})}
          />
        </div>
      )
    }
  ];

  if (initialLoad) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {assessment ? (
          // Show completed assessment
          <div className="space-y-8">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Your Career Assessment
              </h1>
              <p className="text-gray-600">
                Completed on {new Date(assessment.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="font-medium">Current Role</Label>
                    <p className="text-gray-600">{assessment.current_role}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Experience Level</Label>
                    <p className="text-gray-600">{assessment.experience_level}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Skills</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {assessment.skills.map(skill => (
                        <Badge key={skill} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="font-medium">Career Goals</Label>
                    <p className="text-gray-600 text-sm">{assessment.career_goals}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-blue-600" />
                    Career Roadmap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    {assessment.career_roadmap}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {assessment.next_steps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 text-sm">{step}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button 
                onClick={() => {
                  setAssessment(null);
                  setCurrentStep(0);
                  setFormData({
                    current_role: '',
                    experience_level: '',
                    skills: [],
                    career_goals: ''
                  });
                }}
                variant="outline"
              >
                Retake Assessment
              </Button>
            </div>
          </div>
        ) : (
          // Show assessment form
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Career Assessment
              </h1>
              <p className="text-gray-600">
                Let's understand your background to create your personalized roadmap
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Step {currentStep + 1} of {steps.length}</span>
                <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% complete</span>
              </div>
              <Progress value={((currentStep + 1) / steps.length) * 100} />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{steps[currentStep].title}</CardTitle>
              </CardHeader>
              <CardContent>
                {steps[currentStep].content}
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                Previous
              </Button>

              {currentStep === steps.length - 1 ? (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Processing...' : 'Complete Assessment'}
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                  disabled={
                    (currentStep === 0 && !formData.current_role) ||
                    (currentStep === 1 && !formData.experience_level) ||
                    (currentStep === 2 && formData.skills.length === 0) ||
                    (currentStep === 3 && !formData.career_goals)
                  }
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// Motivation Page Component
const MotivationPage = () => {
  const [motivation, setMotivation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMotivation();
  }, []);

  const fetchMotivation = async () => {
    try {
      const response = await axios.get(`${API}/motivation/daily`);
      setMotivation(response.data);
    } catch (error) {
      console.error('Failed to fetch motivation:', error);
      toast.error('Failed to load motivation content');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="text-center">
            <Heart className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Daily Motivation
            </h1>
            <p className="text-gray-600">
              Inspiration and tips to keep you moving forward in your cloud career
            </p>
          </div>

          {motivation && (
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-800">
                    <Star className="h-5 w-5 mr-2" />
                    Quote of the Day
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <blockquote className="text-xl text-blue-900 italic leading-relaxed">
                    "{motivation.quote}"
                  </blockquote>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-800">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Today's Career Tip
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-900 leading-relaxed">
                    {motivation.tip}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Rocket className="h-5 w-5 mr-2 text-purple-600" />
                Cloud Career Motivation Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Daily Habits</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      Learn something new about cloud technology daily
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      Practice hands-on skills with cloud platforms
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      Connect with other cloud professionals
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      Document your learning journey
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Weekly Goals</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                      Complete a cloud certification module
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                      Build or improve a cloud project
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                      Share knowledge with the community
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                      Review and plan next steps
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button onClick={fetchMotivation} variant="outline">
              <Heart className="h-4 w-4 mr-2" />
              Get New Motivation
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

// Premium/Study Plans Page Component
const PremiumPage = () => {
  const { user } = useAuth();
  const [studyPlans, setStudyPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.is_premium) {
      fetchStudyPlans();
    }
    
    // Check for payment success/failure
    const urlParams = new URLSearchParams(location.search);
    const sessionId = urlParams.get('session_id');
    if (sessionId) {
      checkPaymentStatus(sessionId);
    }
  }, [user, location]);

  const fetchStudyPlans = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/study-plans`);
      setStudyPlans(response.data);
    } catch (error) {
      console.error('Failed to fetch study plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateStudyPlan = async (weekNumber) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/study-plans/generate?week_number=${weekNumber}`);
      setStudyPlans(prev => [...prev.filter(p => p.week_number !== weekNumber), response.data]);
      toast.success(`Week ${weekNumber} study plan generated!`);
    } catch (error) {
      toast.error('Failed to generate study plan');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (packageId) => {
    setPaymentLoading(true);
    try {
      toast.info('Redirecting to secure checkout...', { duration: 2000 });
      
      const response = await axios.post(`${API}/payments/checkout?package_id=${packageId}`, {}, {
        headers: {
          'Origin': window.location.origin
        }
      });
      
      // Store payment info in sessionStorage for better UX
      sessionStorage.setItem('pendingPayment', JSON.stringify({
        packageId,
        packageName: packageId === 'monthly' ? 'Monthly Premium' : 'Yearly Premium',
        amount: packageId === 'monthly' ? '$29.99' : '$299.99',
        timestamp: Date.now()
      }));
      
      // Redirect to Stripe checkout
      window.location.href = response.data.url;
    } catch (error) {
      setPaymentLoading(false);
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.detail || 'Failed to start checkout process');
    }
  };

  const checkPaymentStatus = async (sessionId) => {
    setCheckingPayment(true);
    let attempts = 0;
    const maxAttempts = 10;
    const pollInterval = 2000; // 2 seconds

    const pollStatus = async () => {
      try {
        const response = await axios.get(`${API}/payments/status/${sessionId}`);
        const status = response.data;
        
        if (status.payment_status === 'paid') {
          setPaymentStatus({
            type: 'success',
            message: 'Payment successful! Welcome to Premium!',
            details: status
          });
          toast.success('Payment successful! Welcome to Premium!');
          
          // Clear any pending payment info
          sessionStorage.removeItem('pendingPayment');
          
          // Refresh user data after a short delay
          setTimeout(() => {
            window.location.reload();
          }, 2000);
          
        } else if (status.status === 'expired' || status.payment_status === 'failed') {
          setPaymentStatus({
            type: 'error',
            message: 'Payment was not completed. Please try again.',
            details: status
          });
          toast.error('Payment was not completed. Please try again.');
          
        } else if (attempts < maxAttempts) {
          // Continue polling
          attempts++;
          setTimeout(pollStatus, pollInterval);
          return;
        } else {
          setPaymentStatus({
            type: 'timeout',
            message: 'Payment status check timed out. Please check your email for confirmation.',
            details: status
          });
          toast.warning('Payment status check timed out. Please check your email for confirmation.');
        }
        
        setCheckingPayment(false);
      } catch (error) {
        console.error('Failed to check payment status:', error);
        setCheckingPayment(false);
        setPaymentStatus({
          type: 'error',
          message: 'Failed to verify payment. Please contact support if you were charged.',
          details: null
        });
        toast.error('Failed to verify payment. Please contact support if you were charged.');
      }
    };

    pollStatus();
  };

  // Payment Status Display Component
  const PaymentStatusCard = () => {
    if (!paymentStatus && !checkingPayment) return null;

    if (checkingPayment) {
      return (
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Verifying Payment</h3>
                <p className="text-blue-700">Please wait while we confirm your payment...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    const statusConfig = {
      success: {
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-900',
        iconColor: 'text-green-600',
        icon: CheckCircle
      },
      error: {
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-900',
        iconColor: 'text-red-600',
        icon: X
      },
      timeout: {
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-900',
        iconColor: 'text-yellow-600',
        icon: Clock
      }
    };

    const config = statusConfig[paymentStatus.type];
    const StatusIcon = config.icon;

    return (
      <Card className={`mb-8 ${config.borderColor} ${config.bgColor}`}>
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <StatusIcon className={`h-8 w-8 ${config.iconColor} mt-1`} />
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${config.textColor} mb-2`}>
                Payment Status
              </h3>
              <p className={`${config.textColor} mb-4`}>
                {paymentStatus.message}
              </p>
              
              {paymentStatus.details && (
                <div className="text-sm space-y-1">
                  <p className={config.textColor}>
                    <span className="font-medium">Amount:</span> ${(paymentStatus.details.amount_total / 100).toFixed(2)} {paymentStatus.details.currency.toUpperCase()}
                  </p>
                  <p className={config.textColor}>
                    <span className="font-medium">Status:</span> {paymentStatus.details.payment_status}
                  </p>
                </div>
              )}
              
              {paymentStatus.type === 'success' && (
                <div className="mt-4">
                  <Button onClick={() => navigate('/dashboard')} size="sm">
                    Go to Dashboard
                  </Button>
                </div>
              )}
              
              {paymentStatus.type === 'error' && (
                <div className="mt-4 space-x-2">
                  <Button onClick={() => window.location.href = '/premium'} size="sm" variant="outline">
                    Try Again
                  </Button>
                  <Button onClick={() => setPaymentStatus(null)} size="sm" variant="ghost">
                    Dismiss
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (user?.is_premium) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <main className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <PaymentStatusCard />
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Crown className="h-8 w-8 text-yellow-500 mr-3" />
                  Premium Study Plans
                </h1>
                <p className="text-gray-600">
                  AI-generated weekly study schedules tailored to your career goals
                </p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800 px-3 py-1">
                Premium Member
              </Badge>
            </div>

            {/* Generate New Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Generate New Study Plan</CardTitle>
                <CardDescription>
                  Create a personalized weekly study plan based on your assessment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Button 
                    onClick={() => generateStudyPlan(studyPlans.length + 1)}
                    disabled={loading}
                  >
                    {loading ? 'Generating...' : `Generate Week ${studyPlans.length + 1} Plan`}
                  </Button>
                  <p className="text-sm text-gray-600">
                    You have {studyPlans.length} study plans
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Study Plans */}
            <div className="grid gap-6">
              {studyPlans.map((plan) => (
                <Card key={plan.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                          Week {plan.week_number}: {plan.title}
                        </CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                      </div>
                      <Badge variant="outline">
                        {new Date(plan.created_at).toLocaleDateString()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="tasks" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="tasks">Daily Tasks</TabsTrigger>
                        <TabsTrigger value="resources">Resources</TabsTrigger>
                      </TabsList>
                      <TabsContent value="tasks" className="mt-6">
                        <div className="space-y-3">
                          {plan.daily_tasks.map((task, index) => (
                            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </div>
                              <p className="text-gray-700">{task}</p>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="resources" className="mt-6">
                        <div className="space-y-2">
                          {plan.resources.map((resource, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                              <BookOpen className="h-5 w-5 text-blue-600" />
                              <p className="text-gray-700">{resource}</p>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ))}
            </div>

            {studyPlans.length === 0 && !loading && (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Study Plans Yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Generate your first AI-powered study plan to get started!
                  </p>
                  <Button onClick={() => generateStudyPlan(1)}>
                    Generate Week 1 Plan
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Non-premium user - show upgrade options
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <PaymentStatusCard />
          
          <div className="text-center">
            <Crown className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Unlock Premium Study Plans
            </h1>
            <p className="text-gray-600">
              Get AI-generated weekly study schedules tailored to your career goals
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2 border-blue-200">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Monthly Premium</CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
                <div className="text-4xl font-bold text-blue-600 mt-4">
                  $29.99<span className="text-lg text-gray-600">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    AI-generated weekly study plans
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    Personalized based on your assessment
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    Daily tasks and resources
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    Progress tracking
                  </li>
                </ul>
                <Button 
                  className="w-full" 
                  onClick={() => handleUpgrade('monthly')}
                  disabled={paymentLoading}
                >
                  {paymentLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    'Upgrade to Monthly'
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-yellow-200 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-yellow-500 text-white px-3 py-1">
                  Best Value
                </Badge>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Yearly Premium</CardTitle>
                <CardDescription>Save with annual billing</CardDescription>
                <div className="text-4xl font-bold text-yellow-600 mt-4">
                  $299.99<span className="text-lg text-gray-600">/year</span>
                </div>
                <p className="text-sm text-green-600">Save $60 compared to monthly</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    Everything in Monthly Premium
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    2 months free (12 for the price of 10)
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    Priority support
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    Advanced analytics
                  </li>
                </ul>
                <Button 
                  className="w-full bg-yellow-600 hover:bg-yellow-700" 
                  onClick={() => handleUpgrade('yearly')}
                  disabled={paymentLoading}
                >
                  {paymentLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    'Upgrade to Yearly'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Features Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">What You'll Get</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">AI-Powered Plans</h3>
                  <p className="text-gray-600 text-sm">
                    Personalized study schedules generated by advanced AI based on your specific career goals and learning style.
                  </p>
                </div>
                <div>
                  <Target className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Goal-Oriented</h3>
                  <p className="text-gray-600 text-sm">
                    Every plan is tailored to your assessment results, focusing on the skills and knowledge you need most.
                  </p>
                </div>
                <div>
                  <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Track Progress</h3>
                  <p className="text-gray-600 text-sm">
                    Monitor your learning journey with detailed progress tracking and milestone achievements.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

// Checkout Success Page Component
const CheckoutSuccessPage = () => {
  const [verifying, setVerifying] = useState(true);
  const [paymentResult, setPaymentResult] = useState(null);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
      verifyPayment(sessionId);
    } else {
      // No session ID, redirect to premium page
      navigate('/premium');
    }
  }, [location, navigate]);

  const verifyPayment = async (sessionId) => {
    try {
      let attempts = 0;
      const maxAttempts = 15; // Wait up to 30 seconds
      const pollInterval = 2000;

      const checkStatus = async () => {
        try {
          const response = await axios.get(`${API}/payments/status/${sessionId}`);
          const status = response.data;

          if (status.payment_status === 'paid') {
            setPaymentResult({
              success: true,
              amount: (status.amount_total / 100).toFixed(2),
              currency: status.currency.toUpperCase(),
              sessionId: sessionId
            });
            setVerifying(false);
            
            // Show success message
            toast.success('Payment successful! Welcome to Premium!');
            
          } else if (status.status === 'expired' || status.payment_status === 'failed') {
            setPaymentResult({
              success: false,
              error: 'Payment was not completed or failed.'
            });
            setVerifying(false);
            
          } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(checkStatus, pollInterval);
          } else {
            setPaymentResult({
              success: false,
              error: 'Payment verification timed out. Please check your email for confirmation.'
            });
            setVerifying(false);
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          setPaymentResult({
            success: false,
            error: 'Failed to verify payment. Please contact support if you were charged.'
          });
          setVerifying(false);
        }
      };

      checkStatus();
    } catch (error) {
      console.error('Payment verification error:', error);
      setPaymentResult({
        success: false,
        error: 'Failed to verify payment. Please contact support if you were charged.'
      });
      setVerifying(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Verifying Payment
            </h2>
            <p className="text-gray-600 mb-4">
              Please wait while we confirm your payment...
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                This may take up to 30 seconds. Please don't close this page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentResult?.success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-lg">
          <CardContent className="p-8 text-center">
            <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Payment Successful!
            </h2>
            
            <p className="text-lg text-gray-600 mb-6">
              Welcome to CloudCareer Coach Premium! 🎉
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex justify-between">
                  <span>Amount Paid:</span>
                  <span className="font-semibold">${paymentResult.amount} {paymentResult.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-semibold text-green-600">Confirmed</span>
                </div>
                <div className="flex justify-between">
                  <span>Transaction ID:</span>
                  <span className="font-mono text-xs">{paymentResult.sessionId?.substring(0, 16)}...</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
                <ul className="text-sm text-blue-800 space-y-1 text-left">
                  <li>• Generate AI-powered weekly study plans</li>
                  <li>• Access premium career guidance</li>
                  <li>• Track your learning progress</li>
                  <li>• Get personalized recommendations</li>
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => navigate('/premium')}
                  className="flex-1"
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  Start Learning
                </Button>
                <Button 
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                  className="flex-1"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Payment failed or error
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardContent className="p-8 text-center">
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <X className="h-12 w-12 text-red-600" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Issue
          </h2>
          
          <p className="text-gray-600 mb-6">
            {paymentResult?.error || 'There was an issue processing your payment.'}
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              If you were charged, please contact our support team with your transaction details.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => navigate('/premium')}
              className="flex-1"
            >
              Try Again
            </Button>
            <Button 
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="flex-1"
            >
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/assessment" element={
              <ProtectedRoute>
                <AssessmentPage />
              </ProtectedRoute>
            } />
            <Route path="/motivation" element={
              <ProtectedRoute>
                <MotivationPage />
              </ProtectedRoute>
            } />
            <Route path="/premium" element={
              <ProtectedRoute>
                <PremiumPage />
              </ProtectedRoute>
            } />
            <Route path="/premium/success" element={
              <ProtectedRoute>
                <CheckoutSuccessPage />
              </ProtectedRoute>
            } />
          </Routes>
          <Toaster />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;