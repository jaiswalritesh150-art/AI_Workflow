
import os
import re
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY is not set in the .env file.")

client = genai.Client(api_key=api_key)

MODEL_NAME = "gemini-3.8-flash"


def ask_gemini(question: str) -> str:
    """Generate an answer using Gemini."""

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=question,
    )

    if not response.text:
        raise RuntimeError("Gemini returned an empty response.")

    return response.text.strip()


def detect_intent(question: str) -> dict:
    """
    Classify common requests locally without an extra Gemini API call.
    """

    text = question.lower().strip()

    # Document and PDF requests
    document_patterns = [
        r"\b(pdf|document|uploaded file)\b",
        r"\b(summarize|summarise|summary)\b.*\b(file|document|pdf)\b",
        r"\b(extract|find|get)\b.*\b(from|inside)\b.*\b(file|document|pdf)\b",
        r"\b(key points|important points)\b.*\b(document|pdf|file)\b",
    ]

    # Email requests
    email_patterns = [
        r"\b(write|draft|compose|send)\b.*\b(email|e-mail)\b",
        r"\b(reply|respond)\b.*\b(email|e-mail)\b",
        r"\b(email|e-mail)\b.*\b(to|for)\b",
    ]

    # Task and reminder requests
    task_patterns = [
        r"\b(create|add|make|schedule|organize|organise)\b.*\b(task|todo|to-do|reminder)\b",
        r"\b(remind|reminder)\b",
        r"\b(my tasks|my to-do|todo list|to-do list)\b",
        r"\b(plan my day|plan my week|make a plan)\b",
        r"\b(prepare|finish|complete)\b.*\b(tomorrow|today|task|assignment)\b",
    ]

    patterns_by_workflow = [
        ("document", document_patterns),
        ("email", email_patterns),
        ("task", task_patterns),
    ]

    for workflow, patterns in patterns_by_workflow:
        if any(re.search(pattern, text) for pattern in patterns):
            return {
                "intent": workflow,
                "workflow": workflow,
            }

    # General is the default; no classification API call is needed.
    return {
        "intent": "general",
        "workflow": "general",
    }
