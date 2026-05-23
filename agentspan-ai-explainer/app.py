# app.py
# The web UI. Type an AI term, the Agentspan agent explains it,
# and the explanation comes back as formatted text.

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

    with AgentRuntime() as runtime:
        result = runtime.run(explainer, f"Explain this AI concept: {term}")

    if result.is_failed:
        return jsonify({"error": "The agent run failed. Check the Agentspan UI for details."}), 500

    # Agent returns plain text now (no structured output for Ollama reliability).
    # The instructions format it with **Plain English:**, **Practical Example:**, **Related Concepts:**
    explanation = result.output if isinstance(result.output, str) else str(result.output)

    return jsonify({
        "concept": term,
        "explanation": explanation,
        "workflow_id": result.execution_id,
    })


if __name__ == "__main__":
    print("Open http://localhost:5000  (Agentspan UI is at http://localhost:6767)")
    app.run(port=5000, debug=False)