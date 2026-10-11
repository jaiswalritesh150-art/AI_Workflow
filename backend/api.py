from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from pypdf import PdfReader
from io import BytesIO

from llm import ask_gemini, detect_intent


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

    if not question:
        return {
            "intent": "general",
            "workflow": "general",
            "status": "error",
            "message": "Please enter a question.",
            "data": {}
        }

    detected = detect_intent(question)

    intent = detected.get("intent", "general")
    workflow = detected.get("workflow", intent)

    print(f"Detected Intent: {intent}")
    print(f"Detected Workflow: {workflow}")

    if workflow == "task":

        text = question.lower()

        priority = "Medium"

        if (
            "high priority" in text
            or "high-priority" in text
            or "urgent" in text
        ):
            priority = "High"

        elif "low priority" in text:
            priority = "Low"

        task_title = question.strip()

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
            task_title = task_title.replace(phrase, "")

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
                task_title = task_title[len(prefix):].strip()
                break

        if task_title.lower().startswith("to "):
            task_title = task_title[3:].strip()

        if not task_title:
            task_title = "New Task"

        task_title = (
            task_title[0].upper()
            + task_title[1:]
        )

        task = {
            "task": task_title,
            "priority": priority,
            "created_at": datetime.now().strftime(
                "%d %b %Y, %I:%M %p"
            ),
            "status": "Pending"
        }

        tasks.append(task)

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

            print("Task Gemini Error:", error)

            ai_response = (
                f"I've created the task '{task_title}' "
                f"with {priority} priority. "
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

            email_response = ask_gemini(email_prompt)

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

            print("Email Gemini Error:", error)

            return {
                "intent": "email",
                "workflow": "email",
                "status": "error",
                "message": (
                    "Unable to generate the email right now."
                ),
                "data": {}
            }

    elif workflow == "document":

        return {
            "intent": intent,
            "workflow": "document",
            "status": "success",
            "message": (
                "Document workflow detected. "
                "Use the PDF upload feature to process a document."
            ),
            "data": {
                "action": "Document Processing"
            }
        }

    else:

        try:

            ai_answer = ask_gemini(question)

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


@app.post("/document")
async def process_document(
    file: UploadFile = File(...)
):

    if file.content_type != "application/pdf":

        return {
            "workflow": "document",
            "status": "error",
            "message": "Please upload a PDF file.",
            "data": {}
        }

    try:

        file_bytes = await file.read()

        pdf = PdfReader(
            BytesIO(file_bytes)
        )

        extracted_text = ""

        for page in pdf.pages:

            page_text = page.extract_text()

            if page_text:
                extracted_text += page_text + "\n"

        extracted_text = extracted_text.strip()

        if not extracted_text:

            return {
                "workflow": "document",
                "status": "error",
                "message": (
                    "No readable text was found in the PDF."
                ),
                "data": {}
            }

        max_chars = 30000

        document_text = extracted_text[:max_chars]

        summary_prompt = f"""
You are an AI document summarization assistant.

Read the following document and create a clear,
easy-to-understand summary.

Include:

1. Main topic
2. Key points
3. Important information
4. Short conclusion

Keep the summary structured and useful for a student.

Document:

{document_text}
"""

        summary = ask_gemini(summary_prompt)

        return {
            "workflow": "document",
            "status": "success",
            "message": (
                "PDF processed and summarized successfully."
            ),
            "data": {
                "filename": file.filename,
                "pages": len(pdf.pages),
                "characters_extracted": len(extracted_text),
                "summary": summary
            }
        }

    except Exception as error:

        print("Document Processing Error:", error)

        return {
            "workflow": "document",
            "status": "error",
            "message": (
                "Unable to process the PDF right now."
            ),
            "data": {}
        }