# agent.py
# The AI concept explainer agent, built in Agentspan.
# One tool, structured output via a Pydantic model.

from pydantic import BaseModel
from agentspan.agents import Agent, tool

from config import MODEL


# --- Structured output shape -------------------------------------------------
# Defining this means every run returns the SAME fields, so the web UI
# always knows what to render. If the model returns something off-shape,
# Agentspan retries automatically.
class ConceptExplanation(BaseModel):
    concept: str
    plain_english: str
    practical_example: str
    related_concepts: list[str]


# --- Tool --------------------------------------------------------------------
# Agentspan reads the input schema from the signature + docstring.
@tool
def explain_concept(concept: str) -> str:
    """Break down an AI concept in simple terms with a practical example."""
    return f"Explaining the concept: {concept}"


# --- The agent ---------------------------------------------------------------
explainer = Agent(
    name="ai_explainer",
    model=MODEL,
    tools=[explain_concept],
    output_type=ConceptExplanation,
    instructions=(
        "You are an AI learning assistant. When given an AI concept, "
        "explain it clearly in plain English, then give one practical "
        "example of how it is used, and list a few related concepts. "
        "Keep it beginner friendly but do not oversimplify."
    ),
)
