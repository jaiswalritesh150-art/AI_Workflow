
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // PDF states
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [documentResult, setDocumentResult] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [showPdfUpload, setShowPdfUpload] = useState(false);
  const [summaryCopied, setSummaryCopied] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;

  // ==========================================
  // GENERAL / TASK / EMAIL
  // ==========================================

  const askAI = async () => {
    if (!question.trim() || loading) return;

    setLoading(true);
    setResult(null);
    setError("");
    setCopied(false);

    try {
      if (!apiUrl) {
        throw new Error("VITE_API_URL is not configured.");
      }

      const response = await fetch(`${apiUrl}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const data = await response.json();

      console.log("FULL BACKEND RESPONSE:", data);
      setResult(data);
    } catch (err) {
      console.error("ERROR:", err);
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

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      askAI();
    }
  };

  // ==========================================
  // PDF WORKFLOW
  // ==========================================

  const openDocumentWorkflow = () => {
    setShowPdfUpload(true);
    setSelectedPdf(null);
    setDocumentResult(null);
    setUploadError("");
    setSummaryCopied(false);
    setResult(null);
    setError("");
    setQuestion("");

    const fileInput = document.getElementById("pdf-file-input");
    if (fileInput) fileInput.value = "";
  };

  const uploadDocument = async () => {
    if (uploadLoading) return;

    if (!selectedPdf) {
      setUploadError("Please select a PDF file first.");
      return;
    }

    const isPdf =
      selectedPdf.type === "application/pdf" ||
      selectedPdf.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setUploadError("Please select a valid PDF file.");
      return;
    }

    if (selectedPdf.size === 0) {
      setUploadError("The selected PDF file is empty.");
      return;
    }

    if (!apiUrl) {
      setUploadError("VITE_API_URL is not configured.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedPdf);

    setUploadLoading(true);
    setUploadError("");
    setDocumentResult(null);
    setSummaryCopied(false);

    try {
      const response = await fetch(`${apiUrl}/document`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      console.log("DOCUMENT RESPONSE:", data);

      if (!response.ok || data.status !== "success") {
        throw new Error(
          data.message || "Unable to summarize this PDF."
        );
      }

      if (!data.data?.summary) {
        throw new Error("The backend returned an empty summary.");
      }

      setDocumentResult(data.data);
    } catch (err) {
      console.error("DOCUMENT ERROR:", err);

      setUploadError(
        err.message === "Failed to fetch"
          ? "Unable to connect to the backend. Check the API URL and backend status."
          : err.message || "Unable to process this PDF."
      );
    } finally {
      setUploadLoading(false);
    }
  };

  const removeSelectedPdf = () => {
    setSelectedPdf(null);
    setDocumentResult(null);
    setUploadError("");
    setSummaryCopied(false);

    const fileInput = document.getElementById("pdf-file-input");
    if (fileInput) fileInput.value = "";
  };

  // ==========================================
  // CLIPBOARD HELPER
  // ==========================================

  const copyTextToClipboard = async (text) => {
    if (!text) {
      throw new Error("There is no text available to copy.");
    }

    // Modern clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch (err) {
        console.warn(
          "Modern clipboard API failed; trying fallback.",
          err
        );
      }
    }

    // Fallback for browsers where Clipboard API is unavailable
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    textArea.style.opacity = "0";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, textArea.value.length);

    let success = false;

    try {
      success = document.execCommand("copy");
    } finally {
      textArea.remove();
    }

    if (!success) {
      throw new Error(
        "Clipboard access was blocked by the browser."
      );
    }
  };

  // ==========================================
  // COPY SUMMARY
  // ==========================================

  const copySummary = async () => {
    if (!documentResult?.summary) {
      setUploadError("No summary available to copy.");
      return;
    }

    try {
      await copyTextToClipboard(documentResult.summary);
      setSummaryCopied(true);
      setUploadError("");

      // Reset confirmation after a short delay
      window.setTimeout(() => {
        setSummaryCopied(false);
      }, 2500);
    } catch (err) {
      console.error("Summary copy failed:", err);

      setUploadError(
        "Copy was blocked by your browser. Select the summary text and use Ctrl+C."
      );
    }
  };

  // ==========================================
  // COPY EMAIL
  // ==========================================

  const copyEmail = async () => {
    if (!emailContent) return;

    try {
      await copyTextToClipboard(emailContent);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Email copy failed:", err);
      setError("Could not copy the email. Please copy it manually.");
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

  const aiAnswer =
    responseData.answer ||
    result?.response?.data?.answer ||
    "";

  const emailContent =
    responseData.email ||
    result?.response?.data?.email ||
    "";

  let taskName = responseData.task || "";
  const taskPriority = responseData.priority || "";
  const taskCreatedAt = responseData.created_at || "";
  const taskStatus = responseData.status || "";

  // ==========================================
  // CLEAN TASK TITLE
  // ==========================================

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

    if (!cleaned) cleaned = "New Task";

    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  };

  taskName = cleanTaskTitle(taskName);

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
          <button
            className="nav-item active"
            onClick={() =>
              window.scrollTo({ top: 0, behavior: "smooth" })
            }
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className="nav-item"
            onClick={() =>
              document
                .querySelector(".workflow-section")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <span>⚡</span>
            Workflows
          </button>

          <button
            className="nav-item"
            onClick={() =>
              document
                .querySelector(
                  ".result-section, .document-summary"
                )
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <span>◷</span>
            Results
          </button>

          <button
            className="nav-item"
            onClick={() => {
              setQuestion("");
              setResult(null);
              setError("");
              setSelectedPdf(null);
              setDocumentResult(null);
              setUploadError("");
              setShowPdfUpload(false);
              setCopied(false);
              setSummaryCopied(false);

              const fileInput =
                document.getElementById("pdf-file-input");

              if (fileInput) fileInput.value = "";
            }}
          >
            <span>⚙</span>
            Reset
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
          <div className="section-label">Available workflows</div>

          <div className="workflow-grid">
            <button
              className="workflow-card"
              onClick={() => {
                setShowPdfUpload(false);
                handleExample("What is artificial intelligence?");
              }}
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
              onClick={() => {
                setShowPdfUpload(false);
                handleExample(
                  "Create a task to prepare my resume"
                );
              }}
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
              onClick={() => {
                setShowPdfUpload(false);
                handleExample(
                  "Write an email for an internship application"
                );
              }}
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
              onClick={openDocumentWorkflow}
            >
              <div className="workflow-card-icon document-icon">
                ▤
              </div>
              <div>
                <strong>Document</strong>
                <span>Upload a PDF and get an AI summary</span>
              </div>
            </button>
          </div>
        </section>

        {/* PDF UPLOAD */}

        {showPdfUpload && (
          <section className="pdf-upload-card">
            <h3 className="pdf-upload-heading">
              AI Document Summarizer
            </h3>

            <p className="pdf-upload-description">
              Upload a PDF to extract its text and generate a
              structured AI summary with key points and a conclusion.
            </p>

            <div className="pdf-dropzone">
              <div className="pdf-file-icon">📄</div>
              <strong>Select your PDF document</strong>
              <span>Choose a PDF file from your computer</span>

              <input
                id="pdf-file-input"
                className="pdf-file-input"
                type="file"
                accept="application/pdf,.pdf"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;

                  setSelectedPdf(file);
                  setDocumentResult(null);
                  setUploadError("");
                  setSummaryCopied(false);
                }}
              />
            </div>

            {selectedPdf && (
              <div className="pdf-selected-file">
                <div className="pdf-selected-file-icon">📑</div>

                <div className="pdf-selected-file-details">
                  <strong>{selectedPdf.name}</strong>
                  <span>
                    {(selectedPdf.size / 1024).toFixed(1)} KB
                  </span>
                </div>

                <button
                  type="button"
                  onClick={removeSelectedPdf}
                  disabled={uploadLoading}
                >
                  Remove
                </button>
              </div>
            )}

            {uploadError && (
              <div className="error-box" role="alert">
                <div className="error-icon">!</div>
                <div>
                  <strong>Document processing issue</strong>
                  <p>{uploadError}</p>
                </div>
              </div>
            )}

            <div className="pdf-upload-actions">
              <button
                type="button"
                className="pdf-upload-button"
                onClick={uploadDocument}
                disabled={!selectedPdf || uploadLoading}
              >
                {uploadLoading ? (
                  <>
                    <span className="spinner"></span>
                    Summarizing PDF...
                  </>
                ) : (
                  <>
                    Upload &amp; Summarize
                    <span>→</span>
                  </>
                )}
              </button>
            </div>

            {/* DOCUMENT SUMMARY */}

            {documentResult && (
              <div className="document-summary">
                <h3>AI Document Summary</h3>

                <div className="document-summary-metadata">
                  <span>
                    File:{" "}
                    {documentResult.filename || selectedPdf?.name}
                  </span>

                  <span>
                    Pages: {documentResult.pages ?? "N/A"}
                  </span>

                  <span>
                    Characters extracted:{" "}
                    {documentResult.characters_extracted?.toLocaleString() ??
                      "N/A"}
                  </span>
                </div>

                <div className="document-summary-content">
                  <ReactMarkdown>
                    {documentResult.summary}
                  </ReactMarkdown>
                </div>

                <button
                  type="button"
                  className="pdf-upload-button"
                  onClick={copySummary}
                >
                  {summaryCopied ? "✓ Summary Copied" : "Copy Summary"}
                </button>
              </div>
            )}
          </section>
        )}

        {/* GENERAL INPUT */}

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
              onChange={(event) => setQuestion(event.target.value)}
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
                disabled={loading || !question.trim()}
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

        {/* GENERAL ERROR */}

        {error && (
          <section className="error-box" role="alert">
            <div className="error-icon">!</div>
            <div>
              <strong>Something went wrong</strong>
              <p>{error}</p>
            </div>
          </section>
        )}

        {/* WORKFLOW RESULTS */}

        {result && !error && (
          <section className="result-section">
            <div className="result-header">
              <div>
                <span className="section-label">Workflow result</span>
                <h2>Your request has been processed</h2>
              </div>

              <div className="success-badge">
                <span>{status === "error" ? "!" : "✓"}</span>
                {status === "error" ? "Error" : "Success"}
              </div>
            </div>

            <div className="result-card">
              <div className="result-card-header">
                <div className="result-workflow">
                  <div className="result-workflow-icon">{icon}</div>

                  <div>
                    <span>Detected workflow</span>
                    <strong>{workflowName}</strong>
                  </div>
                </div>

                {status && (
                  <span className="result-status">{status}</span>
                )}
              </div>

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

              {/* GENERAL */}

              {workflow === "general" && aiAnswer && (
                <div className="result-message">
                  <span>AI Response</span>
                  <div className="ai-answer">
                    <ReactMarkdown>{aiAnswer}</ReactMarkdown>
                  </div>
                </div>
              )}

              {/* EMAIL */}

              {workflow === "email" && emailContent && (
                <div className="result-message email-result">
                  <div className="email-result-header">
                    <span>Generated Email</span>
                    <button
                      className="copy-email-button"
                      onClick={copyEmail}
                    >
                      {copied ? "✓ Copied" : "Copy Email"}
                    </button>
                  </div>

                  <div className="email-content">
                    <ReactMarkdown>{emailContent}</ReactMarkdown>
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

              {/* EMAIL ERROR */}

              {workflow === "email" &&
                !emailContent &&
                status === "error" && (
                  <div className="result-message">
                    <span>Response</span>
                    <p>
                      {message ||
                        "Unable to generate the email right now."}
                    </p>
                  </div>
                )}

              {/* TASK */}

              {workflow === "task" && taskName && (
                <div className="task-details">
                  <div className="task-detail-header">
                    <div className="task-success-icon">✓</div>

                    <div>
                      <span>Task Created</span>
                      <strong>
                        Successfully added to your workflow
                      </strong>
                    </div>
                  </div>

                  <div className="task-title-section">
                    <span>Task</span>
                    <h3>{taskName}</h3>
                  </div>

                  <div className="task-detail-grid">
                    <div className="task-detail-item">
                      <span>Priority</span>
                      <strong
                        className={
                          taskPriority.toLowerCase() === "high"
                            ? "priority-high"
                            : taskPriority.toLowerCase() === "low"
                            ? "priority-low"
                            : "priority-medium"
                        }
                      >
                        {taskPriority || "Medium"}
                      </strong>
                    </div>

                    <div className="task-detail-item">
                      <span>Status</span>
                      <strong>{taskStatus || "Pending"}</strong>
                    </div>

                    <div className="task-detail-item">
                      <span>Created</span>
                      <strong>{taskCreatedAt || "Just now"}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* DOCUMENT REQUEST VIA /ask */}

              {workflow === "document" && (
                <div className="result-message">
                  <span>Document Workflow</span>
                  <p>
                    {message ||
                      "Select the Document workflow above to upload a PDF."}
                  </p>

                  <button
                    className="pdf-upload-button"
                    onClick={openDocumentWorkflow}
                  >
                    Open PDF Upload
                  </button>
                </div>
              )}

              {/* FALLBACK */}

              {workflow !== "general" &&
                workflow !== "email" &&
                workflow !== "task" &&
                workflow !== "document" &&
                message && (
                  <div className="result-message">
                    <span>Response</span>
                    <p>{message}</p>
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
