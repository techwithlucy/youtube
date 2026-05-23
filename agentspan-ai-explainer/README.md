# AI Concept Explainer

A demonstration agent built on [Agentspan](https://agentspan.ai/) — explains any
AI concept in plain English with a practical example and related concepts.

This project accompanies the video tutorial showing how to build durable AI agents
that survive crashes mid-run.

## What it does

- **Web app** (`app.py`) — A clean UI to ask the agent to explain any AI term.
- **Crash demo** (`crash_demo.py` + `resume_demo.py`) — Shows the same agent
  surviving a process crash and resuming from where it stopped.

## Quick start

```bash
# 1. Install
pip install -r requirements.txt

# 2. Set your model API key (Claude in this example)
export ANTHROPIC_API_KEY=your_key_here

# 3. Start the Agentspan server (leave running)
agentspan server start

# 4. Run the web app
python app.py
# open http://localhost:5000
```

## Crash recovery demo

```bash
# Start the agent, then the script exits — simulating a crash
python crash_demo.py
# copy the execution ID it prints

# Check the agent is still alive on the server
agentspan agent status <execution-id>

# Reconnect and watch it finish from where it stopped
python resume_demo.py <execution-id>
```

## Project structure

```
.
├── agent.py            # The Agentspan agent + Pydantic structured output
├── app.py              # Flask web app
├── config.py           # Model configuration (one line to swap providers)
├── crash_demo.py       # Starts the agent, then exits
├── resume_demo.py      # Reconnects to the agent by execution ID
├── templates/
│   └── index.html      # The web UI
└── requirements.txt
```

## Configuration

The model is set in `config.py` in one line. Supported providers include
Anthropic, OpenAI, Gemini, and local Ollama models.

## License

MIT
