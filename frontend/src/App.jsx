import { useState } from "react";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const askAI = async () => {
    if (!question.trim() || loading) return;

    setLoading(true);
    setResult(null);
    setError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/ask`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: question.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const data = await response.json();

      console.log(
        "FULL BACKEND RESPONSE:",
        JSON.stringify(data, null, 2)
      );

      setResult(data);
    } catch (error) {
      console.error("ERROR:", error);

      setError(
        "Unable to connect to the backend. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExample = (text) => {
    setQuestion(text);
    setResult(null);
    setError("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askAI();
    }
  };

  // ---------------------------------------------
  // RESPONSE DATA
  // ---------------------------------------------

  const responseData = result?.data || {};

  const intent = String(
    result?.intent ||
      result?.response?.intent ||
      responseData.intent ||
      "unknown"
  ).toLowerCase();

  const workflow = String(
    result?.workflow ||
      result?.response?.workflow ||
      responseData.workflow ||
      "unknown"
  ).toLowerCase();

  const status = String(
    result?.status ||
      result?.response?.status ||
      responseData.status ||
      ""
  ).toLowerCase();

  const message =
    result?.message ||
    result?.response?.message ||
    responseData.message ||
    "";

  // ---------------------------------------------
  // GENERAL AI ANSWER
  // ---------------------------------------------

  const aiAnswer =
    responseData.answer ||
    result?.response?.data?.answer ||
    "";

  // ---------------------------------------------
  // TASK DATA
  // ---------------------------------------------

  const taskName = responseData.task || "";
  const taskPriority = responseData.priority || "";
  const taskCreatedAt = responseData.created_at || "";
  const taskStatus = responseData.status || "";

  // ---------------------------------------------
  // DISPLAY VALUES
  // ---------------------------------------------

  const workflowName =
    workflow.charAt(0).toUpperCase() + workflow.slice(1);

  const workflowIcon = {
    general: "✦",
    task: "✓",
    email: "✉",
    document: "▤",
  };

  const icon = workflowIcon[workflow] || "✦";

  return (
    <div className="app-container">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">✦</div>

          <div>
            <h2>Workflow AI</h2>
            <span>AI Automation Assistant</span>
          </div>
        </div>

        <nav className="sidebar-nav">

          <button className="nav-item active">
            <span>⌂</span>
            Dashboard
          </button>

          <button className="nav-item">
            <span>⚡</span>
            Workflows
          </button>

          <button className="nav-item">
            <span>◷</span>
            History
          </button>

          <button className="nav-item">
            <span>⚙</span>
            Settings
          </button>

        </nav>

        <div className="sidebar-bottom">

          <div className="sidebar-info">
            <div className="info-dot"></div>

            <div>
              <strong>AI Assistant</strong>
              <span>Ready to process</span>
            </div>
          </div>

        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">

        {/* TOP BAR */}
        <header className="topbar">

          <div className="topbar-title">
            <span className="mobile-brand-icon">✦</span>
            <span>AI Workflow Assistant</span>
          </div>

          <div className="status-badge">
            <span className="status-dot"></span>
            System Ready
          </div>

        </header>

        {/* HERO */}
        <section className="hero-section">

          <div className="hero-badge">
            <span>✦</span>
            Intelligent Workflow Automation
          </div>

          <h1>
            Turn your requests into
            <span> intelligent workflows.</span>
          </h1>

          <p>
            Ask anything. The assistant identifies your request
            and routes it to the appropriate workflow automatically.
          </p>

        </section>

        {/* WORKFLOW CARDS */}
        <section className="workflow-section">

          <div className="section-label">
            Available workflows
          </div>

          <div className="workflow-grid">

            <button
              className="workflow-card"
              onClick={() =>
                handleExample(
                  "What is artificial intelligence?"
                )
              }
            >
              <div className="workflow-card-icon general-icon">
                ✦
              </div>

              <div>
                <strong>General</strong>
                <span>Ask questions and get answers</span>
              </div>
            </button>

            <button
              className="workflow-card"
              onClick={() =>
                handleExample(
                  "Create a task to prepare my resume"
                )
              }
            >
              <div className="workflow-card-icon task-icon">
                ✓
              </div>

              <div>
                <strong>Task</strong>
                <span>Create and organize tasks</span>
              </div>
            </button>

            <button
              className="workflow-card"
              onClick={() =>
                handleExample(
                  "Write an email for an internship application"
                )
              }
            >
              <div className="workflow-card-icon email-icon">
                ✉
              </div>

              <div>
                <strong>Email</strong>
                <span>Generate professional emails</span>
              </div>
            </button>

            <button
              className="workflow-card"
              onClick={() =>
                handleExample(
                  "Summarize this document"
                )
              }
            >
              <div className="workflow-card-icon document-icon">
                ▤
              </div>

              <div>
                <strong>Document</strong>
                <span>Process and summarize documents</span>
              </div>
            </button>

          </div>

        </section>

        {/* AI INPUT */}
        <section className="assistant-section">

          <div className="input-header">

            <div>
              <span className="input-title">
                What would you like to automate?
              </span>

              <span className="input-subtitle">
                Describe your request in natural language
              </span>
            </div>

          </div>

          <div className="input-wrapper">

            <textarea
              className="question-input"
              value={question}
              onChange={(e) =>
                setQuestion(e.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="e.g. What is artificial intelligence?"
              rows="4"
            />

            <div className="input-footer">

              <span className="input-hint">
                Press Enter to submit · Shift + Enter for new line
              </span>

              <button
                className="ask-button"
                onClick={askAI}
                disabled={
                  loading || !question.trim()
                }
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Processing
                  </>
                ) : (
                  <>
                    Ask AI
                    <span className="button-arrow">→</span>
                  </>
                )}
              </button>

            </div>

          </div>

        </section>

        {/* ERROR */}
        {error && (
          <section className="error-box">

            <div className="error-icon">
              !
            </div>

            <div>
              <strong>Something went wrong</strong>
              <p>{error}</p>
            </div>

          </section>
        )}

        {/* RESULT */}
        {result && !error && (
          <section className="result-section">

            <div className="result-header">

              <div>
                <span className="section-label">
                  Workflow result
                </span>

                <h2>
                  Your request has been processed
                </h2>
              </div>

              <div className="success-badge">
                <span>✓</span>
                {status === "error" ? "Error" : "Success"}
              </div>

            </div>

            <div className="result-card">

              {/* WORKFLOW HEADER */}
              <div className="result-card-header">

                <div className="result-workflow">

                  <div className="result-workflow-icon">
                    {icon}
                  </div>

                  <div>
                    <span>Detected workflow</span>
                    <strong>{workflowName}</strong>
                  </div>

                </div>

                {status && (
                  <span className="result-status">
                    {status}
                  </span>
                )}

              </div>

              {/* METADATA */}
              <div className="result-metadata">

                <div>
                  <span>Intent</span>
                  <strong>{intent}</strong>
                </div>

                <div>
                  <span>Workflow</span>
                  <strong>{workflowName}</strong>
                </div>

              </div>

              {/* GENERAL AI ANSWER */}
              {workflow === "general" && aiAnswer && (
                <div className="result-message">

                  <span>AI Response</span>

                  <div className="ai-answer">
                    {aiAnswer}
                  </div>

                </div>
              )}

              {/* GENERAL ERROR */}
              {workflow === "general" &&
                !aiAnswer &&
                status === "error" && (
                  <div className="result-message">

                    <span>Response</span>

                    <p>
                      {message ||
                        "Unable to generate an AI response right now."}
                    </p>

                  </div>
                )}

              {/* NORMAL MESSAGE */}
              {workflow !== "general" && message && (
                <div className="result-message">

                  <span>Response</span>

                  <p>{message}</p>

                </div>
              )}

              {/* TASK DETAILS */}
              {workflow === "task" && taskName && (
                <div className="task-details">

                  <div className="task-detail-header">
                    <span>Task Details</span>
                  </div>

                  <div className="task-detail-grid">

                    <div className="task-detail-item">
                      <span>Task</span>
                      <strong>{taskName}</strong>
                    </div>

                    <div className="task-detail-item">
                      <span>Priority</span>
                      <strong>{taskPriority}</strong>
                    </div>

                    <div className="task-detail-item">
                      <span>Status</span>
                      <strong>{taskStatus}</strong>
                    </div>

                    <div className="task-detail-item">
                      <span>Created</span>
                      <strong>{taskCreatedAt}</strong>
                    </div>

                  </div>

                </div>
              )}

            </div>

          </section>
        )}

      </main>

    </div>
  );
}

export default App;

