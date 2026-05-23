# crash_demo.py
# Crash-recovery demo, using the SAME agent the web app uses.
#
# Run this. It starts the agent on the Agentspan server, prints the
# execution ID, then exits. The script exiting IS the crash — the
# agent keeps running on the server with no process attached.
#
# Then run:  python resume_demo.py <execution-id>

import sys
from agentspan.agents import start

from agent import explainer

print("Starting agent on the Agentspan server...")

handle = start(
    explainer,
    "Give me a deep, thorough explanation of vector embeddings. Cover what they are, "
    "how they're created mathematically, why they're useful in modern AI, three different "
    "real-world applications (search, recommendations, RAG) with detailed examples for each, "
    "and how they differ from older text representation methods like bag-of-words and TF-IDF."
)

print()
print("=" * 60)
print(f"  Execution ID: {handle.execution_id}")
print(f"  Status:       {handle.get_status().status}")
print("=" * 60)
print()
print(">>> This script is now exiting. That's the crash. <<<")
print()
print("The agent is still running on the server.")
print(f"Check it:  agentspan agent status {handle.execution_id}")
print(f"Resume it: python resume_demo.py {handle.execution_id}")
print()

sys.exit(0)