# Doc2Action-Agent

Turn business documents into executable workflows with Generative AI, Agentic AI, Multi-Agent Systems, AI Workflows and Business Process Automation.

## What makes it different
A normal document chatbot answers questions about a file. Doc2Action converts the document into a traceable business process: requirements -> tasks -> decisions -> workflow -> communications -> safe automation queue -> verification.

## Multi-Agent Architecture
1. Document & Requirement Agent - extracts source-grounded rules.
2. Task Agent - converts requirements into actionable tasks.
3. Decision Agent - identifies conditional routes and approvals.
4. Workflow Agent - sequences dependencies and automation types.
5. Communication Agent - prepares triggered business messages.
6. Verification Agent - checks generated outputs against the original source.
7. Automation Executor - safely queues local task, approval and communication actions.

Each agent receives structured output from earlier agents instead of one prompt pretending to be multiple agents.

## Business Process Automation
The MVP demonstrates automation without requiring paid external services:
- task queue creation
- approval routing
- dependency-aware workflow steps
- communication queue
- automation statuses such as QUEUED, READY, WAITING_FOR_INPUT and DRAFT_READY
- workflow JSON export
- source verification before execution

External email, calendar, ERP, Slack or webhook connectors can be added later.

## Supported documents
PDF, DOCX, XLSX, TXT and Markdown.

## Hackathon Skill Mapping
| Required skill | Concrete implementation |
|---|---|
| Generative AI | Gemini generates structured requirements, tasks, decisions, workflows and communications |
| Agentic AI | Specialized agents perform sequential reasoning and pass outputs to downstream agents |
| Multi-Agent Systems | Six independent agent stages plus an automation executor |
| AI Workflows | Document rules become a dependency-aware process |
| Business Process Automation AI | Tasks, approvals, communications and execution states are automatically queued |

## Stack
React + Vite, FastAPI, Gemini API, PyMuPDF, python-docx, openpyxl.

## Run
Backend: cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload
Frontend: cd frontend && npm install && npm run dev

Set GEMINI_API_KEY in backend/.env.

## Demo
Use Load Demo Policy in the UI for a procurement-policy example, then click Run Agent Workflow. No external dataset or database is required.

## Safety
The automation executor is intentionally safe and local: it creates queues and routes but does not send real emails, purchase orders or external system changes without a future integration and explicit configuration.
