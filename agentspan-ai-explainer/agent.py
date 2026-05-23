# agent.py
# Simplified for Ollama / local models:
# - No tools (the previous decorative tool caused looping on small models)
# - No structured output (Pydantic schemas are unreliable on small local models)
# The agent returns a plain-text explanation. Web app handles rendering.

from agentspan.agents import Agent
from config import MODEL


explainer = Agent(
    name="ai_explainer",
    model=MODEL,
    instructions=(
        "You are an AI learning assistant. "
        "When given an AI concept, explain it clearly using this exact format:\n\n"
        "**Plain English:**\n"
        "[A 2-3 sentence beginner-friendly explanation]\n\n"
        "**Practical Example:**\n"
        "[One concrete real-world example, 2-3 sentences]\n\n"
        "**Related Concepts:**\n"
        "[A short comma-separated list of 3-5 related terms]\n\n"
        "Keep it focused. Do not add extra sections."
    ),
)