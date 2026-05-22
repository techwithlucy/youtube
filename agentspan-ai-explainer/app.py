# app.py
# The web UI. Type an AI term, the Agentspan agent explains it,
# and the structured result comes back as a clean card.

from flask import Flask, render_template, request, jsonify
from agentspan.agents import AgentRuntime

from agent import explainer

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/explain", methods=["POST"])
def explain():
    term = (request.json or {}).get("term", "").strip()
    if not term:
        return jsonify({"error": "Please enter a concept."}), 400

    # Run the agent on the Agentspan server. Because output_type is a
    # Pydantic model, result.output comes back in a fixed shape every time,
    # which is what lets this UI render the same card reliably.
    with AgentRuntime() as runtime:
        result = runtime.run(explainer, f"Explain this AI concept: {term}")

    if result.is_failed:
        return jsonify({"error": "The agent run failed. Check the Agentspan UI."}), 500

    out = result.output  # ConceptExplanation
    return jsonify({
        "concept": out.concept,
        "plain_english": out.plain_english,
        "practical_example": out.practical_example,
        "related_concepts": out.related_concepts,
        "workflow_id": result.workflow_id,  # link this run in the Agentspan UI
    })


if __name__ == "__main__":
    print("Open http://localhost:5000  (Agentspan UI is at http://localhost:6767)")
    app.run(port=5000, debug=False)
