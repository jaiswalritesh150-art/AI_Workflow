from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import re

app = FastAPI(title="AI Workflow Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QuestionRequest(BaseModel):
    question: str


@app.get("/")
def home():
    return {
        "message": "AI Workflow Assistant API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.post("/ask")
def ask_question(request: QuestionRequest):

    question = request.question.strip()
    text = question.lower()

    # TASK WORKFLOW
    if any(word in text for word in [
    "create task",
    "create a task",
    "add task",
    "add a task",
    "remind me",
    "todo",
    "to-do",
    "schedule"
    ]):

        priority = "Medium"

        if "high priority" in text or "urgent" in text:
            priority = "High"

        elif "low priority" in text:
            priority = "Low"

        return {
            "intent": "task",
            "workflow": "task",
            "status": "success",
            "message": "Task workflow selected successfully.",
            "data": {
                "task": question,
                "priority": priority,
                "created_at": datetime.now().strftime("%d %b %Y, %I:%M %p"),
                "status": "Pending"
            }
        }

    # EMAIL WORKFLOW
    elif any(word in text for word in [
        "write email",
        "send email",
        "draft email",
        "professional email",
        "email to"
    ]):

        return {
            "intent": "email",
            "workflow": "email",
            "status": "success",
            "message": "Email workflow selected successfully.",
            "data": {
                "subject": "Professional Email",
                "body": f"Hello,\n\nRegarding your request: {question}\n\nThank you."
            }
        }

    # DOCUMENT / SUMMARY WORKFLOW
    elif any(word in text for word in [
        "summarize",
        "summary",
        "document",
        "pdf",
        "key points"
    ]):

        return {
            "intent": "document",
            "workflow": "document",
            "status": "success",
            "message": "Document workflow selected. Document processing can be connected in the next version.",
            "data": {
                "action": "Document Summary"
            }
        }

    # GENERAL WORKFLOW
    else:
        return {
            "intent": "general",
            "workflow": "general",
            "status": "success",
            "message": "General AI workflow selected successfully.",
            "data": {
                "question": question
            }
        }
