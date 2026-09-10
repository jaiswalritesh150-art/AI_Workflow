import { useState } from "react";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const askAI = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setResult(null);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/ask", {
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
    } catch (error) {
      console.error("ERROR:", error);

      setError(
        "Unable to connect to backend. Please check if the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // Backend response ko safely extract karna
  const workflow =
    result?.workflow ||
    result?.response?.workflow ||
    result?.data?.workflow ||
    "Unknown";

  const status =
    result?.status ||
    result?.response?.status ||
    result?.data?.status ||
    "";

  const message =
    result?.message ||
    result?.response?.message ||
    result?.data?.message ||
    "";

  return (
    <div className="app-container">
      <div className="app-card">

        <h1>AI Workflow Assistant</h1>

        <p className="subtitle">
          Ask a question and let AI choose the appropriate workflow.
        </p>

        <textarea
          className="question-input"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask something..."
        />

        <button
          className="ask-button"
          onClick={askAI}
          disabled={loading}
        >
          {loading ? "Processing..." : "Ask AI"}
        </button>

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        {result && !error && (
          <div className="result-box">

            <div className="result-item">
              <strong>Intent:</strong>
              <span>{result.intent || "Unknown"}</span>
            </div>

            <div className="result-item">
              <strong>Workflow:</strong>
              <span>{workflow}</span>
            </div>

            {status && (
              <div className="result-item">
                <strong>Status:</strong>
                <span>{status}</span>
              </div>
            )}

            <p>
              <strong>Response:</strong>
            </p>

            <div className="response-box">
              {message ? (
                <p>{message}</p>
              ) : typeof result.response === "string" ? (
                <p>{result.response}</p>
              ) : (
                <pre>
                  {JSON.stringify(
                    result.response || result,
                    null,
                    2
                  )}
                </pre>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default App;