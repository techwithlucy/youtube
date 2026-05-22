# crash_demo.py
# Crash-recovery, using the SAME agent the web app uses.
#
# Run this. It starts the agent on the Agentspan server, prints the
# execution ID, then exits. The script exiting IS the crash — the
# agent keeps running on the server with no process attached.
#
# Then run:  python resume_demo.py <execution-id>

import sys
from agentspan.agents import start

from agent import explainer

handle = start(explainer, "Explain this AI concept: vector embeddings")

print(f"\nexecution_id: {handle.workflow_id}")
print("Status:", handle.get_status().status)
print("\nScript is exiting now. That's the crash.")
print("The agent keeps running on the server.")
print(f"Reconnect with:  python resume_demo.py {handle.workflow_id}\n")

sys.exit(0)
