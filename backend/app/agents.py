import json, os
from google import genai

MODEL = "gemini-2.5-flash"

PROMPT = """You are Doc2Action-Agent, a multi-agent workflow engine.
Analyze ONLY the supplied source document. Never invent requirements.
Return valid JSON with:
document_summary: string
requirements: array of strings
tasks: array of objects {id,title,description,owner,priority,depends_on}
decisions: array of objects {condition,yes_action,no_action}
workflow: array of objects {step,action,agent}
communications: array of objects {type,audience,draft}
compliance_checklist: array of strings
verification: array of strings
Use "Unknown" where the source does not provide an owner or detail.
The workflow should transform document rules into practical actions.
"""

def run_document_workflow(source_text: str) -> dict:
    key = os.getenv("GEMINI_API_KEY")
    if not key:
        raise RuntimeError("GEMINI_API_KEY is not configured")
    client = genai.Client(api_key=key)
    response = client.models.generate_content(
        model=MODEL,
        contents=PROMPT + "\n\nSOURCE:\n" + source_text[:60000],
        config={"response_mime_type": "application/json"},
    )
    try:
        return json.loads(response.text)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"AI returned invalid JSON: {exc}")
