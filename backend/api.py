from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime

from llm import ask_gemini


app = FastAPI(title="AI Workflow Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

tasks = []

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


        task = {
            "task": question,
            "priority": priority,
            "created_at": datetime.now().strftime(
                "%d %b %Y, %I:%M %p"
            ),
            "status": "Pending"
        }


        tasks.append(task)


        return {
            "intent": "task",
            "workflow": "task",
            "status": "success",
            "message": "Task created successfully.",
            "data": task
        }

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
                "body": (
                    f"Hello,\n\n"
                    f"Regarding your request: {question}\n\n"
                    f"Thank you."
                )
            }
        }


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
            "message": (
                "Document workflow selected. "
                "Document processing can be connected "
                "in the next version."
            ),
            "data": {
                "action": "Document Summary"
            }
        }


    # =================================================
    # GENERAL AI WORKFLOW
    # =================================================

    else:

        try:

            ai_answer = ask_gemini(question)

            return {
                "intent": "general",
                "workflow": "general",
                "status": "success",
                "message": "AI response generated successfully.",
                "data": {
                    "question": question,
                    "answer": ai_answer
                }
            }

        except Exception as error:

            print("Gemini Error:", error)

            return {
                "intent": "general",
                "workflow": "general",
                "status": "error",
                "message": (
                    "Unable to generate an AI response right now."
                ),
                "data": {
                    "question": question
                }
            }