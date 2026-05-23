# config.py
# The ONLY place the model is set. Change this one line to switch
# providers — nothing else in the project needs to change.
#
# Confirmed working "provider/model" strings (from Agentspan docs):
#   "anthropic/claude-sonnet-4-6"      <- needs ANTHROPIC_API_KEY
#   "openai/gpt-4o"                    <- needs OPENAI_API_KEY
#   "google_gemini/gemini-2.0-flash"  <- needs GEMINI_API_KEY
#   "ollama/llama3.1"                 <- local, no key (needs Ollama running)
#

MODEL = "ollama/llama3.1"