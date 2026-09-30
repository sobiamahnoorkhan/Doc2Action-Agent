import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const API = import.meta.env.VITE_API_URL || "";
const DEMO_PROCUREMENT = `PROCUREMENT POLICY
1. Purchases above PKR 100,000 require at least three vendor quotations.
2. The requesting department prepares a comparison of quotations.
3. The department head approves the selected vendor before a purchase order is issued.
4. Procurement sends the purchase order to the approved vendor.
5. Finance verifies the invoice against the approved purchase order.`;

const DEMO_LEAVE = `EMPLOYEE LEAVE POLICY
1. Employees submit leave requests to their reporting manager.
2. Leave requests longer than 3 working days require HR review.
3. The manager approves or rejects the request.
4. Approved leave is recorded by HR.
5. The employee receives an approval or rejection message.`;

function App() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const agentSteps = [
    ["01", "Requirements Agent", "Extracts source-grounded rules"],
    ["02", "Task Agent", "Creates actionable work"],
    ["03", "Decision Agent", "Maps explicit conditions"],
    ["04", "Workflow Agent", "Builds the executable sequence"],
    ["05", "Communication Agent", "Grounds required communications"],
    ["06", "Verification Agent", "Audits source traceability"],
  ];

  function clearInput() {
    setFile(null);
    setText("");
    setData(null);
    setError("");
    const input = document.getElementById("document-file");
    if (input) input.value = "";
  }

  async function analyze() {
    setLoading(true);
    setError("");
    setData(null);
    try {
      let r;
      if (file) {
        const f = new FormData();
        f.append("file", file);
        r = await fetch(API + "/api/analyze", { method: "POST", body: f });
      } else {
        r = await fetch(API + "/api/analyze-text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
      }
      const b = await r.json();
      if (!r.ok) throw Error(b.detail || b.error || "Analysis failed");
      setData(b.result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">D</div>
          <div>
            <b>Doc2<span>Action</span></b>
            <small>AGENTIC WORKFLOW ENGINE</small>
          </div>
        </div>
        <div className={"top-status " + (loading ? "is-processing" : "")}><span className="status-dot" /> {loading ? "Agents Processing" : data ? "Workflow Verified" : "AI Engine Ready"}</div>
      </header>

      <main>
        <section className="hero">
          <div className="eyebrow">DOCUMENT → DECISION → ACTION → AUTOMATION</div>
          <h1>Turn business documents into <em>executable workflows.</em></h1>
          <p>Upload a policy or SOP and let specialized agents extract requirements, assign work, map decisions, build the process, and audit every generated step against the source.</p>
          <div className="hero-flow">
            {["Understand", "Plan", "Decide", "Execute", "Communicate", "Verify"].map((x, i) => (
              <React.Fragment key={x}>
                <span>{x}</span>{i < 4 && <b>→</b>}
              </React.Fragment>
            ))}
          </div>
        </section>

        <section className="workspace">
          <div className="card input-card">
            <div className="section-kicker">01 · INPUT</div>
            <h2>Provide a business document</h2>
            <label className="drop">
              <input
                id="document-file"
                type="file"
                accept=".pdf,.docx,.xlsx,.txt,.md"
                onChange={(e) => {
                  setFile(e.target.files ? e.target.files[0] : null);
                  setText("");
                  setData(null);
                  setError("");
                }}
              />
              <span className="upload-icon">↑</span>
              <strong>{file ? file.name : "Drop your document here"}</strong>
              <small>{file ? "Ready for analysis" : "PDF · DOCX · XLSX · TXT · MD"}</small>
            </label>
            <div className="or"><span>OR PASTE TEXT</span></div>
            <textarea value={text} onChange={(e) => { setText(e.target.value); setFile(null); setData(null); setError(""); }} placeholder="Paste a policy, SOP, procedure, or business document..." />
            <div className="demo-bar">
              <button type="button" className="demo-btn" onClick={() => { setFile(null); setText(DEMO_PROCUREMENT); setData(null); setError(""); }}>Procurement demo</button>
              <button type="button" className="demo-btn" onClick={() => { setFile(null); setText(DEMO_LEAVE); setData(null); setError(""); }}>Leave demo</button>
              <button type="button" className="clear-btn" onClick={clearInput}>Clear</button>
            </div>
            <button className="primary-btn" disabled={loading || (!file && !text.trim())} onClick={analyze}>
              {loading ? "Agents are processing…" : "Run Agent Workflow  →"}
            </button>
            {error && <p className="error">{error}</p>}
          </div>

          <div className="card pipeline-card">
            <div className="section-kicker">02 · AGENT PIPELINE</div>
            <h2>From document to action</h2>
            {agentSteps.map(([n, title, desc]) => (
              <div className={"pipeline-item " + (loading ? "processing-step" : data ? "completed-step" : "")} key={n}>
                <span>{n}</span><div><strong>{title}</strong><small>{desc}</small></div>
                {data && <b className="agent-check">✓</b>}
              </div>
            ))}
            <div className="safe-note"><span>✓</span><div><strong>Safe local automation</strong><small>Tasks and approvals are queued for demo execution — no external actions are sent.</small></div></div>
          </div>
        </section>

        {loading && <div className="processing"><span className="spinner" /> Agents are analyzing the document and building the workflow…</div>}
        {data && <Results d={data} />}
      </main>
    </div>
  );
}

function Results({ d }) {
  const counts = useMemo(() => ({
    requirements: (d.requirements || []).length,
    tasks: (d.tasks || []).length,
    decisions: (d.decisions || []).length,
    workflow: (d.workflow || []).length,
  }), [d]);

  return (
    <section className="results-wrap">
      <div className="result-head">
        <div className="result-context"><span className="live-dot" /> Multi-agent analysis complete · 6 specialized agents</div>
        <div>
          <div className="eyebrow">03 · GENERATED BUSINESS PROCESS</div>
          <h2>{d.document_summary || "Generated Action Plan"}</h2>
        </div>
        <span className="grounded-badge"><i /> Source Grounded</span>
      </div>

      <div className="metric-grid">
        <Metric n={counts.requirements} label="Requirements" />
        <Metric n={counts.tasks} label="Tasks" />
        <Metric n={counts.decisions} label="Decisions" />
        <Metric n={counts.workflow} label="Workflow steps" />
      </div>

      <div className="result-nav">
        {["Overview", "Workflow", "Tasks", "Decisions", "Communications", "Automation", "Verification"].map((x) => <a key={x} href={"#" + x.toLowerCase()}>{x}</a>)}
      </div>

      <div className="result-grid">
        <div className="result-main">
          <ResultSection id="overview" number="01" title="Requirements">
            <div className="requirement-list">
              {(d.requirements || []).map((x, i) => <div className="requirement" key={i}><span>✓</span><div>{x}<small>Source-Grounded</small></div></div>)}
            </div>
          </ResultSection>

          <ResultSection id="workflow" number="02" title="Workflow">
            <div className="workflow">
              {(d.workflow || []).map((x, i) => (
                <div className="workflow-step" key={i}>
                  <div className="step-no">{String(x.step || i + 1).padStart(2, "0")}</div>
                  <div className="step-body"><strong>{x.action}</strong><small>{x.agent || "Workflow Agent"} · {x.automation || "manual_review"}</small></div>
                  {i < (d.workflow || []).length - 1 && <div className="connector" />}
                </div>
              ))}
            </div>
          </ResultSection>

          <ResultSection id="tasks" number="03" title="Tasks">
            <div className="task-grid">
              {(d.tasks || []).map((x, i) => (
                <div className="task-card" key={i}>
                  <div className="task-top"><span>TASK-{String(i + 1).padStart(2, "0")}</span><b>{x.owner || "Not specified in source"}</b></div>
                  <h3>{x.title}</h3>
                  <p>{x.description}</p>
                  <div className="task-meta"><span>Priority <b>{x.priority || "Not specified in source"}</b></span><span>Deadline <b>{x.deadline || "Not specified in source"}</b></span></div>
                </div>
              ))}
            </div>
          </ResultSection>

          <ResultSection id="decisions" number="04" title="Decision Points">
            {(d.decisions || []).map((x, i) => (
              <div className="decision-card" key={i}>
                <div className="decision-title"><span>?</span><strong>{x.condition}</strong></div>
                <div className="routes"><div className="yes"><b>YES</b><span>{x.yes_action}</span></div><div className="no"><b>NO</b><span>{x.no_action}</span></div></div>
              </div>
            ))}
          </ResultSection>

          <ResultSection id="communications" number="05" title="Communications">
            {(d.communications || []).map((x, i) => (
              <div className="communication" key={i}><div><strong>{x.type || "Notification"}</strong><small>Audience · {x.audience}</small></div><div><small>Trigger · {x.trigger}</small><p>{x.draft || "Not specified in source"}</p></div></div>
            ))}
          </ResultSection>
        </div>

        <aside className="result-side">
          <div className="side-card" id="automation">
            <div className="side-kicker">AUTOMATION</div><h3>Safe Local Demo</h3>
            <div className="execution"><span>Execution</span><b>{d.automation?.execution_id || "LOCAL-DEMO"}</b></div>
            {(d.automation?.task_queue || []).map((x, i) => <div className="queue" key={i}><span className="queue-status">{x.status}</span><div><strong>{x.task_id} · {x.title}</strong><small>{x.owner || "Owner not specified"}</small></div></div>)}
            <p className="side-note">No real emails, purchase orders, or external system changes are executed.</p>
          </div>

          <div className="side-card" id="verification">
            <div className="side-kicker">VERIFICATION</div><h3>Source Traceability</h3>
            {(d.verification || []).map((x, i) => <div className="check" key={i}><span>✓</span>{x}</div>)}
            <div className={d.verified ? "audit good" : "audit warning"}>{d.verification_statement || (d.verified ? "Workflow checked against the provided source." : "Review verification findings before execution.")}</div>
          </div>

          {(d.recommendations || []).length > 0 && <div className="side-card recommendations">
            <div className="side-kicker purple">AI RECOMMENDATIONS</div><h3>Operational suggestions</h3>
            <small>AI-generated · Not in source</small>
            {(d.recommendations || []).map((x, i) => <div className="recommendation" key={i}>{x}</div>)}
          </div>}
        </aside>
      </div>
    </section>
  );
}

function Metric({ n, label }) { return <div className="metric"><strong>{n}</strong><span>{label}</span></div>; }
function ResultSection({ id, number, title, children }) { return <section className="result-section" id={id}><div className="section-title"><span>{number}</span><h2>{title}</h2></div>{children}</section>; }

createRoot(document.getElementById("root")).render(<App />);
