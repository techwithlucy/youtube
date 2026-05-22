# resume_demo.py
# Run AFTER crash_demo.py has exited:
#   python resume_demo.py <execution-id>
#
# Reconnects to the agent that's still running on the server and
# watches it finish — from exactly where it was, not from the start.

import sys
from agentspan.agents import AgentRuntime, AgentHandle

from agent import explainer

if len(sys.argv) < 2:
    print("Usage: python resume_demo.py <execution-id>")
    sys.exit(1)

execution_id = sys.argv[1]

runtime = AgentRuntime()
# Docs are explicit: serve the workers BEFORE creating the handle,
# or tool tasks hang.
runtime.serve(explainer, blocking=False)

handle = AgentHandle(workflow_id=execution_id, runtime=runtime)
print(f"Reconnected to {execution_id}")
print("Status:", handle.get_status().status)

result = handle.stream().get_result()
print("\nFinal status:", result.status)
if result.output is not None:
    print("Result:", result.output)

print("\nIt resumed from where it stopped — not from the beginning.")
