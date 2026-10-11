import { useState } from "react";
import ReactMarkdown from "react-markdown";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const askAI = async () => {
    if (!question.trim() || loading) return;

    setLoading(true);
    setResult(null);
    setError("");
    setCopied(false);

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
    setCopied(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askAI();
    }
  };

  // ==========================================
  // RESPONSE DATA
  // ==========================================

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

  // ==========================================
  // GENERAL AI
  // ==========================================

  const aiAnswer =
    responseData.answer ||
    result?.response?.data?.answer ||
    "";

  // ==========================================
  // EMAIL
  // ==========================================

  const emailContent =
    responseData.email ||
    result?.response?.data?.email ||
    "";

  // ==========================================
  // TASK
  // ==========================================

  let taskName = responseData.task || "";
  const taskPriority = responseData.priority || "";
  const taskCreatedAt = responseData.created_at || "";
  const taskStatus = responseData.status || "";

  /*
    Clean task title for frontend display.

    Example:
    "Create a task to prepare my resume"
    becomes:
    "Prepare my resume"

    "Create a high priority task to prepare my resume"
    becomes:
    "Prepare my resume"
  */

  const cleanTaskTitle = (title) => {
    if (!title) return "";

    let cleaned = title.trim();

    const prefixes = [
      "create a task to ",
      "create a task ",
      "create task to ",
      "create task ",

      "add a task to ",
      "add a task ",
      "add task to ",
      "add task ",

      "make a task to ",
      "make a task ",
      "make task to ",
      "make task ",

      "set a task to ",
      "set a task ",

      "new task to ",
      "new task ",

      "remind me to ",
      "remind me ",
    ];

    const lowerCleaned = cleaned.toLowerCase();

    for (const prefix of prefixes) {
      if (lowerCleaned.startsWith(prefix)) {
        cleaned = cleaned.slice(prefix.length).trim();
        break;
      }
    }

    cleaned = cleaned
      .replace(/high priority/gi, "")
      .replace(/high-priority/gi, "")
      .replace(/low priority/gi, "")
      .replace(/urgent/gi, "")
      .trim();

    if (cleaned.toLowerCase().startsWith("to ")) {
      cleaned = cleaned.slice(3).trim();
    }

    if (!cleaned) {
      cleaned = "New Task";
    }

    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  };

  taskName = cleanTaskTitle(taskName);

  // ==========================================
  // COPY EMAIL
  // ==========================================

  const copyEmail = async () => {
    if (!emailContent) return;

    try {
      await navigator.clipboard.writeText(emailContent);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  // ==========================================
  // WORKFLOW DISPLAY
  // ==========================================

  const workflowName =
    workflow.charAt(0).toUpperCase() + workflow.slice(1);

  const workflowIcon = {
    general: "✦",
    task: "✓",
    email: "✉",
    document: "▤",
  };

  const icon = workflowIcon[workflow] || "✦";

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="app-container">

      {/* ======================================
          SIDEBAR
      ====================================== */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-icon">
            ✦
          </div>

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


      {/* ======================================
          MAIN CONTENT
      ====================================== */}

      <main className="main-content">

        {/* TOP BAR */}

        <header className="topbar">

          <div className="topbar-title">

            <span className="mobile-brand-icon">
              ✦
            </span>

            <span>
              AI Workflow Assistant
            </span>

          </div>


          <div className="status-badge">

            <span className="status-dot"></span>

            System Ready

          </div>

        </header>


        {/* ======================================
            HERO
        ====================================== */}

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


        {/* ======================================
            WORKFLOW CARDS
        ====================================== */}

        <section className="workflow-section">

          <div className="section-label">
            Available workflows
          </div>


          <div className="workflow-grid">

            {/* GENERAL */}

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
                <span>
                  Ask questions and get answers
                </span>
              </div>

            </button>


            {/* TASK */}

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
                <span>
                  Create and organize tasks
                </span>
              </div>

            </button>


            {/* EMAIL */}

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
                <span>
                  Generate professional emails
                </span>
              </div>

            </button>


            {/* DOCUMENT */}

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
                <span>
                  Process and summarize documents
                </span>
              </div>

            </button>

          </div>

        </section>


        {/* ======================================
            INPUT
        ====================================== */}

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
                    <span className="button-arrow">
                      →
                    </span>
                  </>
                )}

              </button>

            </div>

          </div>

        </section>


        {/* ======================================
            ERROR
        ====================================== */}

        {error && (

          <section className="error-box">

            <div className="error-icon">
              !
            </div>

            <div>

              <strong>
                Something went wrong
              </strong>

              <p>
                {error}
              </p>

            </div>

          </section>

        )}


        {/* ======================================
            RESULT
        ====================================== */}

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

                <span>
                  {status === "error" ? "!" : "✓"}
                </span>

                {status === "error"
                  ? "Error"
                  : "Success"}

              </div>

            </div>


            {/* ==================================
                RESULT CARD
            ================================== */}

            <div className="result-card">

              {/* HEADER */}

              <div className="result-card-header">

                <div className="result-workflow">

                  <div className="result-workflow-icon">
                    {icon}
                  </div>

                  <div>

                    <span>
                      Detected workflow
                    </span>

                    <strong>
                      {workflowName}
                    </strong>

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

                  <span>
                    Intent
                  </span>

                  <strong>
                    {intent}
                  </strong>

                </div>


                <div>

                  <span>
                    Workflow
                  </span>

                  <strong>
                    {workflowName}
                  </strong>

                </div>

              </div>


              {/* ==================================
                  GENERAL AI RESULT
              ================================== */}

              {workflow === "general" &&
                aiAnswer && (

                  <div className="result-message">

                    <span>
                      AI Response
                    </span>

                    <div className="ai-answer">

                      <ReactMarkdown>
                        {aiAnswer}
                      </ReactMarkdown>

                    </div>

                  </div>

                )}


              {/* ==================================
                  EMAIL RESULT
              ================================== */}

              {workflow === "email" &&
                emailContent && (

                  <div className="result-message email-result">

                    <div className="email-result-header">

                      <span>
                        Generated Email
                      </span>


                      <button
                        className="copy-email-button"
                        onClick={copyEmail}
                      >
                        {copied
                          ? "✓ Copied"
                          : "Copy Email"}
                      </button>

                    </div>


                    <div className="email-content">

                      <ReactMarkdown>
                        {emailContent}
                      </ReactMarkdown>

                    </div>

                  </div>

                )}


              {/* ==================================
                  GENERAL ERROR
              ================================== */}

              {workflow === "general" &&
                !aiAnswer &&
                status === "error" && (

                  <div className="result-message">

                    <span>
                      Response
                    </span>

                    <p>
                      {message ||
                        "Unable to generate an AI response right now."}
                    </p>

                  </div>

                )}


              {/* ==================================
                  EMAIL ERROR
              ================================== */}

              {workflow === "email" &&
                !emailContent &&
                status === "error" && (

                  <div className="result-message">

                    <span>
                      Response
                    </span>

                    <p>
                      {message ||
                        "Unable to generate the email right now."}
                    </p>

                  </div>

                )}


              {/* ==================================
                  TASK RESULT
              ================================== */}

              {workflow === "task" &&
                taskName && (

                  <div className="task-details">

                    {/* TASK HEADER */}

                    <div className="task-detail-header">

                      <div className="task-success-icon">
                        ✓
                      </div>

                      <div>

                        <span>
                          Task Created
                        </span>

                        <strong>
                          Successfully added to your workflow
                        </strong>

                      </div>

                    </div>


                    {/* TASK TITLE */}

                    <div className="task-title-section">

                      <span>
                        Task
                      </span>

                      <h3>
                        {taskName}
                      </h3>

                    </div>


                    {/* TASK INFO */}

                    <div className="task-detail-grid">

                      <div className="task-detail-item">

                        <span>
                          Priority
                        </span>

                        <strong
                          className={
                            taskPriority.toLowerCase() ===
                            "high"
                              ? "priority-high"
                              : taskPriority.toLowerCase() ===
                                "low"
                              ? "priority-low"
                              : "priority-medium"
                          }
                        >
                          {taskPriority || "Medium"}
                        </strong>

                      </div>


                      <div className="task-detail-item">

                        <span>
                          Status
                        </span>

                        <strong>
                          {taskStatus || "Pending"}
                        </strong>

                      </div>


                      <div className="task-detail-item">

                        <span>
                          Created
                        </span>

                        <strong>
                          {taskCreatedAt || "Just now"}
                        </strong>

                      </div>

                    </div>

                  </div>

                )}


              {/* ==================================
                  DOCUMENT RESULT
              ================================== */}

              {workflow === "document" && (

                <div className="result-message">

                  <span>
                    Document Workflow
                  </span>

                  <p>
                    {message ||
                      "Document workflow selected."}
                  </p>

                </div>

              )}


              {/* ==================================
                  FALLBACK RESPONSE
              ================================== */}

              {workflow !== "general" &&
                workflow !== "email" &&
                workflow !== "task" &&
                workflow !== "document" &&
                message && (

                  <div className="result-message">

                    <span>
                      Response
                    </span>

                    <p>
                      {message}
                    </p>

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