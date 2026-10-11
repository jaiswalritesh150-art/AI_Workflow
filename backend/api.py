
import time
from datetime import datetime
from io import BytesIO

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pypdf import PdfReader

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


def generate_ai_response(prompt: str, workflow: str) -> str:
    """Generate a Gemini response and log its duration."""

    start_time = time.perf_counter()

    try:
        response = ask_gemini(prompt)
        elapsed = time.perf_counter() - start_time

        print(
            f"[TIMING] Workflow={workflow}, "
            f"Gemini response time={elapsed:.2f}s"
        )

        return response

    except Exception as error:
        elapsed = time.perf_counter() - start_time

        print(
            f"[ERROR] Workflow={workflow}, "
            f"after {elapsed:.2f}s: {error}"
        )

        raise


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

    request_start = time.perf_counter()
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

        task_title = task_title[0].upper() + task_title[1:]

        task = {
            "task": task_title,
            "priority": priority,
            "created_at": datetime.now().strftime(
                "%d %b %Y, %I:%M %p"
            ),
            "status": "Pending"
        }

        tasks.append(task)

        # No Gemini call needed for a simple confirmation.
        ai_response = (
            f"Task '{task_title}' created successfully. "
            f"Priority: {priority}. Status: Pending."
        )

        print(
            f"[TIMING] Workflow=task, total time="
            f"{time.perf_counter() - request_start:.3f}s"
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
Keep the email concise and useful.
"""

        try:
            email_response = generate_ai_response(
                email_prompt, "email"
            )

            result = {
                "intent": intent,
                "workflow": "email",
                "status": "success",
                "message": "Professional email generated successfully.",
                "data": {
                    "email": email_response
                }
            }

        except Exception:
            result = {
                "intent": "email",
                "workflow": "email",
                "status": "error",
                "message": "Unable to generate the email right now. Please try again.",
                "data": {}
            }

        print(
            f"[TIMING] Workflow=email, total time="
            f"{time.perf_counter() - request_start:.2f}s"
        )
        return result

    elif workflow == "document":

        print(
            f"[TIMING] Workflow=document, total time="
            f"{time.perf_counter() - request_start:.3f}s"
        )

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
            ai_answer = generate_ai_response(
                question, "general"
            )

            result = {
                "intent": "general",
                "workflow": "general",
                "status": "success",
                "message": "AI response generated successfully.",
                "data": {
                    "question": question,
                    "answer": ai_answer
                }
            }

        except Exception:
            result = {
                "intent": "general",
                "workflow": "general",
                "status": "error",
                "message": (
                    "Unable to generate an AI response right now. "
                    "Please try again shortly."
                ),
                "data": {
                    "question": question
                }
            }

        print(
            f"[TIMING] Workflow=general, total time="
            f"{time.perf_counter() - request_start:.2f}s"
        )
        return result


@app.post("/document")
async def process_document(file: UploadFile = File(...)):

    request_start = time.perf_counter()

    if (
        file.content_type != "application/pdf"
        and not (file.filename or "").lower().endswith(".pdf")
    ):
        return {
            "workflow": "document",
            "status": "error",
            "message": "Please upload a PDF file.",
            "data": {}
        }

    try:
        file_bytes = await file.read()

        pdf = PdfReader(BytesIO(file_bytes))
        extracted_pages = []

        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                extracted_pages.append(page_text)

        extracted_text = "\n".join(extracted_pages).strip()

        if not extracted_text:
            return {
                "workflow": "document",
                "status": "error",
                "message": "No readable text was found in the PDF.",
                "data": {}
            }

        max_chars = 30000
        document_text = extracted_text[:max_chars]

        summary_prompt = f"""
You are an AI document summarization assistant.

Summarize this document clearly and concisely.
Include:
1. Main topic
2. Key points
3. Important information
4. Short conclusion

Use headings and bullet points where helpful.
Avoid unnecessary repetition.

Document:
{document_text}
"""

        summary = generate_ai_response(
            summary_prompt, "document"
        )

        result = {
            "workflow": "document",
            "status": "success",
            "message": "PDF processed and summarized successfully.",
            "data": {
                "filename": file.filename,
                "pages": len(pdf.pages),
                "characters_extracted": len(extracted_text),
                "summary": summary
            }
        }

        print(
            f"[TIMING] Workflow=document, total time="
            f"{time.perf_counter() - request_start:.2f}s"
        )

        return result

    except Exception as error:
        print(f"[ERROR] Document processing failed: {error}")

        return {
            "workflow": "document",
            "status": "error",
            "message": (
                "Unable to process the PDF right now. "
                "Please try again."
            ),
            "data": {}
        }

    finally:
        await file.close()
