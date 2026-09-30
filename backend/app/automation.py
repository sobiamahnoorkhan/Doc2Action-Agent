from datetime import date

def execute_workflow(result: dict) -> dict:
    """Run safe local business-process actions without external credentials."""
    tasks = result.get("tasks", [])
    decisions = result.get("decisions", [])
    workflow = result.get("workflow", [])
    communications = result.get("communications", [])

    return {
        "execution_id": f"LOCAL-{date.today().isoformat()}",
        "mode": "safe-local-demo",
        "started_at": date.today().isoformat(),
        "task_queue": [
            {
                "task_id": task.get("id", "UNKNOWN"),
                "title": task.get("title", "Untitled task"),
                "status": "READY",
                "owner": task.get("owner", "Unknown"),
                "priority": task.get("priority", "Unknown"),
                "depends_on": task.get("depends_on", []),
            } for task in tasks
        ],
        "approval_routes": [
            {
                "condition": item.get("condition", ""),
                "routes": {"YES": item.get("yes_action", ""), "NO": item.get("no_action", "")},
                "status": "WAITING_FOR_INPUT",
            } for item in decisions
        ],
        "queued_actions": [
            {
                "step": step.get("step"),
                "action": step.get("action"),
                "automation": step.get("automation", "manual_review"),
                "status": "QUEUED",
            } for step in workflow
        ],
        "communication_queue": [
            {
                "type": item.get("type"),
                "audience": item.get("audience"),
                "trigger": item.get("trigger"),
                "status": "DRAFT_READY",
            } for item in communications
        ],
        "next_action": "Execute QUEUED actions after required approvals and manual inputs.",
    }
