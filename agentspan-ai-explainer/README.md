# AI Concept Explainer

A demonstration agent built on [Agentspan](https://agentspan.ai/) — explains any
AI concept in plain English with a practical example and related concepts.

This project accompanies the video tutorial showing how to build durable AI agents
that survive crashes mid-run.

## What it does

- **Web app** (`app.py`) — A clean UI to ask the agent to explain any AI term.
- **Crash demo** (`crash_demo.py` + `resume_demo.py`) — Shows the same agent
  surviving a process crash and resuming from where it stopped.

---

This guide shows you how to build a durable AI agent using **Agentspan** — an open-source runtime that keeps your agent's progress safe even when the script crashes. We're using **Ollama** to run the AI model locally, so no API keys or accounts are needed.

### Step 1: Install Python

Skip this step if you already have it.

- **Where to get it:** [python.org/downloads](https://python.org/downloads)
- **On Windows:** tick "Add Python to PATH" during install.
- **Verify:**

```bash
python --version
```

---

### Step 2: Install Agentspan

- **Command:**

```bash
pip install agentspan
```

- **What it does:** Installs the Agentspan SDK and CLI.

---

### Step 3: Install Ollama

Ollama runs an open-source AI model on your machine, so we don't need any API keys.

- **Where to get it:** [ollama.com/download](https://ollama.com/download) — download for your OS and install it.
- **On Mac:** you can also install with `brew install ollama`.

---

### Step 4: Pull the Model

- **Command:**

```bash
ollama pull llama3.1
```

- **What it does:** Downloads the Llama 3.1 model to your machine (around 5GB, one-time setup).
- **Verify:**

```bash
ollama list
```

You should see `llama3.1` in the list.

---

### Step 5: Clone the Project

- **Command:**

```bash
git clone https://github.com/techwithlucy/agentspan-ai-explainer
cd agentspan-ai-explainer
```

---

### Step 6: Install Dependencies

- **Command:**

```bash
pip install -r requirements.txt
```

---

### Step 7: Start the Agentspan Server

- **Command:**

```bash
agentspan server start
```

- **What it does:** Starts the local server on `http://localhost:6767`. Leave it running.

---

### Step 8: Run the Web App

In a new terminal tab, in the same folder:

- **Command:**

```bash
python app.py
```

- **Try it:** Open `http://localhost:5000`, type `RAG`, click Explain.
- **Note:** First responses may take 10–30 seconds since the model runs on your machine.

---

### Step 9: Open the Agentspan UI

- **Where:** `http://localhost:6767`
- **What you'll see:** Every step the agent took — LLM call, timings, the full execution history.

---

### Step 10: Run the Crash Demo

In a third terminal tab:

- **Command:**

```bash
python crash_demo.py
```

- **What it does:** Starts the agent, then the script exits. Copy the execution ID it prints.

---

### Step 11: Confirm the Agent Survived

- **Command:**

```bash
agentspan agent status <execution-id>
```

- **Expected:** Status is `RUNNING` — even though your script ended.

---

### Step 12: Reconnect and Finish

- **Command:**

```bash
python resume_demo.py <execution-id>
```

- **What it does:** Reconnects to the agent on the server and watches it finish from where it stopped.
