from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime

from llm import ask_gemini, detect_intent


app = FastAPI(title="AI Workflow Assistant API")


# =====================================================
# CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================
# TASK STORAGE
# =====================================================

tasks = []


# =====================================================
# REQUEST MODEL
# =====================================================

class QuestionRequest(BaseModel):
    question: str


# =====================================================
# HOME
# =====================================================

@app.get("/")
def home():
    return {
        "message": "AI Workflow Assistant API is running"
    }


# =====================================================
# HEALTH
# =====================================================

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# =====================================================
# ASK
# =====================================================

@app.post("/ask")
def ask_question(request: QuestionRequest):

    question = request.question.strip()

    if not question:
        return {
            "intent": "general",
            "workflow": "general",
            "status": "error",
            "message": "Please enter a question.",
            "data": {}
        }


    # =================================================
    # AI INTENT DETECTION
    # =================================================

    detected = detect_intent(question)

    intent = detected.get(
        "intent",
        "general"
    )

    workflow = detected.get(
        "workflow",
        intent
    )


    print(
        f"Detected Intent: {intent}"
    )

    print(
        f"Detected Workflow: {workflow}"
    )


    # =================================================
    # TASK WORKFLOW
    # =================================================

    if workflow == "task":

        text = question.lower()


        # ---------------------------------------------
        # PRIORITY
        # ---------------------------------------------

        priority = "Medium"

        if (
            "high priority" in text
            or "high-priority" in text
            or "urgent" in text
        ):
            priority = "High"

        elif "low priority" in text:
            priority = "Low"


        # ---------------------------------------------
        # TASK TITLE
        # ---------------------------------------------

        task_title = question.strip()


        # Remove priority phrases
        replacements = [
            "high priority",
            "High Priority",
            "HIGH PRIORITY",

            "high-priority",
            "High-Priority",
            "HIGH-PRIORITY",

            "low priority",
            "Low Priority",
            "LOW PRIORITY",

            "urgent",
            "Urgent",
            "URGENT"
        ]


        for phrase in replacements:

            task_title = task_title.replace(
                phrase,
                ""
            )


        task_title = task_title.strip()


        # Remove task command
        prefixes = [
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
            "remind me "
        ]


        lower_title = task_title.lower()


        for prefix in prefixes:

            if lower_title.startswith(prefix):

                task_title = task_title[
                    len(prefix):
                ].strip()

                break


        # Remove leading "to"
        if task_title.lower().startswith("to "):

            task_title = task_title[3:].strip()


        # Fallback
        if not task_title:

            task_title = "New Task"


        # Capitalize first letter
        task_title = (
            task_title[0].upper()
            + task_title[1:]
        )


        # ---------------------------------------------
        # CREATE TASK
        # ---------------------------------------------

        task = {
            "task": task_title,
            "priority": priority,
            "created_at": datetime.now().strftime(
                "%d %b %Y, %I:%M %p"
            ),
            "status": "Pending"
        }


        tasks.append(task)


        # ---------------------------------------------
        # AI CONFIRMATION
        # ---------------------------------------------

        try:

            ai_response = ask_gemini(
                f"""
The following task has just been created:

Task: {task_title}
Priority: {priority}
Status: Pending

Give a short, natural and helpful confirmation
to the user.

Do not repeat the task as a list.
Do not mention JSON.
Keep it to 2-3 sentences.
"""
            )

        except Exception as error:

            print(
                "Task Gemini Error:",
                error
            )

            ai_response = (
                f"I've created the task "
                f"'{task_title}' with {priority} priority. "
                f"The task is currently pending."
            )


        return {
            "intent": intent,
            "workflow": "task",
            "status": "success",
            "message": "Task created successfully.",
            "data": {
                **task,
                "answer": ai_response
            }
        }


    # =================================================
    # EMAIL WORKFLOW
    # =================================================

    elif workflow == "email":

        try:

            email_prompt = f"""
You are a professional email writing assistant.

Create a clear, polite and professional email based
on the user's request.

User request:
{question}

Return the email in exactly this format:

Subject: <email subject>

<email body>

Do not add explanations outside the email.
"""


            email_response = ask_gemini(
                email_prompt
            )


            return {
                "intent": intent,
                "workflow": "email",
                "status": "success",
                "message": (
                    "Professional email generated successfully."
                ),
                "data": {
                    "email": email_response
                }
            }


        except Exception as error:

            print(
                "Email Gemini Error:",
                error
            )


            return {
                "intent": "email",
                "workflow": "email",
                "status": "error",
                "message": (
                    "Unable to generate the email right now."
                ),
                "data": {}
            }


    # =================================================
    # DOCUMENT WORKFLOW
    # =================================================

    elif workflow == "document":

        return {
            "intent": intent,
            "workflow": "document",
            "status": "success",
            "message": (
                "Document workflow detected. "
                "PDF upload and document processing "
                "will be connected next."
            ),
            "data": {
                "action": "Document Processing"
            }
        }


    # =================================================
    # GENERAL AI WORKFLOW
    # =================================================

    else:

        try:

            ai_answer = ask_gemini(
                question
            )


            return {
                "intent": "general",
                "workflow": "general",
                "status": "success",
                "message": (
                    "AI response generated successfully."
                ),
                "data": {
                    "question": question,
                    "answer": ai_answer
                }
            }


        except Exception as error:

            print(
                "Gemini Error:",
                error
            )


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