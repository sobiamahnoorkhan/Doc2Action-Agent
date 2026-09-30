import json, os
from google import genai
from google.genai import types

MODEL = "gemini-2.5-flash"

_client_instance = None

def _client():
    global _client_instance
    key = os.getenv("GEMINI_API_KEY")
    if not key:
        raise RuntimeError("GEMINI_API_KEY is not configured")
    if _client_instance is None:
        _client_instance = genai.Client(api_key=key)
    return _client_instance

def _json_agent(name: str, instruction: str, context: str) -> dict:
    prompt = f"""You are the {name} in Doc2Action-Agent, a specialized business-process AI agent.
Follow the instruction exactly.
Use ONLY the supplied source/context. Never invent requirements, owners, deadlines, approvals, policies, or facts.
If information is missing, use "Unknown".
Return valid JSON only.

INSTRUCTION:
{instruction}

CONTEXT:
{context[:60000]}
"""
    response = _client().models.generate_content(
        model=MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(response_mime_type="application/json"),
    )
    try:
        return json.loads(response.text)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"{name} returned invalid JSON: {exc}")

def run_document_workflow(source_text: str) -> dict:
    requirements = _json_agent(
        "Document & Requirement Agent",
        """Extract the document purpose and every explicit business requirement/rule that can drive an action.
Return: document_summary (string), requirements (array of strings), constraints (array of strings).""",
        source_text,
    )
    tasks = _json_agent(
        "Task Agent",
        """Create actionable tasks from the extracted requirements.
Return: tasks: array of {id,title,description,owner,priority,depends_on}.
Only create tasks supported by the requirements.""",
        json.dumps({"source": source_text[:30000], "requirements": requirements}),
    )
    decisions = _json_agent(
        "Decision Agent",
        """Identify conditional business decisions and their routes.
Return: decisions: array of {condition,yes_action,no_action}.
Only include conditions explicitly supported by the document.""",
        json.dumps({"requirements": requirements, "tasks": tasks, "source": source_text[:30000]}),
    )
    workflow = _json_agent(
        "Workflow Agent",
        """Sequence the tasks into an executable process.
Return: workflow: array of {step,action,agent,depends_on,automation}.
automation must be one of: create_task, approval_route, generate_message, checklist, manual_review.
Make dependencies explicit.""",
        json.dumps({"requirements": requirements, "tasks": tasks, "decisions": decisions}),
    )
    communications = _json_agent(
        "Communication Agent",
        """Prepare communications required by the workflow.
Return: communications: array of {type,audience,trigger,draft}.
Draft messages only from facts present in the context.""",
        json.dumps({"requirements": requirements, "tasks": tasks, "decisions": decisions, "workflow": workflow}),
    )
    verification = _json_agent(
        "Verification Agent",
        """Audit the generated plan against the source document.
Return: verification: array of strings, risks: array of strings, verified: boolean.
Flag unsupported assumptions, missing requirements, or workflow steps that cannot be traced to the source.""",
        json.dumps({
            "source": source_text,
            "requirements": requirements,
            "tasks": tasks,
            "decisions": decisions,
            "workflow": workflow,
            "communications": communications,
        }),
    )
    return {
        "document_summary": requirements.get("document_summary", ""),
        "requirements": requirements.get("requirements", []),
        "constraints": requirements.get("constraints", []),
        "tasks": tasks.get("tasks", []),
        "decisions": decisions.get("decisions", []),
        "workflow": workflow.get("workflow", []),
        "communications": communications.get("communications", []),
        "verification": verification.get("verification", []),
        "risks": verification.get("risks", []),
        "verified": verification.get("verified", False),
    }
