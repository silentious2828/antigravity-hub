import os
import json
from crewai import Agent, Task, Crew
from langchain_community.llms import Ollama

# --- Configuration ---
MOCK_EMAILS_PATH = "mock_test/mock_emails.json"
RESULTS_PATH = "mock_test/mock_test_results.txt"
OMNIROUTE_ENDPOINT = "http://localhost:20128/v1"

# --- Environment Setup ---
os.environ["OPENAI_API_BASE"] = OMNIROUTE_ENDPOINT
os.environ["OPENAI_MODEL_NAME"] = "omniroute/logistics-priority"

# --- Load Mock Emails ---
def load_mock_emails():
    with open(MOCK_EMAILS_PATH, 'r') as f:
        return json.load(f)

# --- Define Test Agent ---
test_triage_agent = Agent(
    role="Simulation Triage Specialist",
    goal="Correctly identify if an email belongs to Gmail logistics or Outlook cleanup and assign the correct OmniRoute combo",
    backstory="A specialized agent for validating OmniRoute combo routing in a mock test environment.",
    verbose=True,
    allow_execution=True
)

# --- Define Test Task ---
test_task = Task(
    description=f"""
    Analyze the following mock email payloads and assign the correct OmniRoute routing strategy to each:
    
    {json.dumps(load_mock_emails(), indent=2)}
    
    For each email, determine:
    1. Correct routing chain (logistics-priority or outlook-cleanup-budget)
    2. Expected primary model
    3. Expected fallback model
    4. HITL compliance (draft-only, no send)
    
    Return a structured report mapping each test case ID to its routing strategy.
    """,
    expected_output="A structured report mapping each test case ID to its routing strategy, expected model, fallback, and HITL compliance.",
    agent=test_triage_agent,
    output_file=RESULTS_PATH
)

# --- Run Mock Crew ---
if __name__ == "__main__":
    print("=== Starting Mock Test ===")
    print(f"Mock emails: {MOCK_EMAILS_PATH}")
    print(f"Results will be saved to: {RESULTS_PATH}")
    print(f"OmniRoute endpoint: {OMNIROUTE_ENDPOINT}")
    print()
    
    mock_crew = Crew(agents=[test_triage_agent], tasks=[test_task])
    mock_crew.kickoff()
    
    print("\n=== Mock Test Complete ===")
    print(f"Results saved to: {RESULTS_PATH}")
