# ==========================================
# AI WORKFLOW ROUTER
# ==========================================


def detect_intent(question: str):

    question = question.lower().strip()

    # -----------------------------
    # TASK
    # -----------------------------

    task_keywords = [
        "create a task",
        "create task",
        "make a task",
        "add a task",
        "remind me",
        "reminder",
        "todo",
        "to-do",
        "task"
    ]

    if any(keyword in question for keyword in task_keywords):
        return "task"


    # -----------------------------
    # DOCUMENT
    # -----------------------------

    document_keywords = [
        "summarize",
        "summary",
        "document",
        "pdf",
        "explain this document",
        "analyze this document"
    ]

    if any(keyword in question for keyword in document_keywords):
        return "document"


    # -----------------------------
    # EMAIL
    # -----------------------------

    email_keywords = [
        "write an email",
        "send an email",
        "compose email",
        "email",
        "mail"
    ]

    if any(keyword in question for keyword in email_keywords):
        return "email"


    # -----------------------------
    # GENERAL
    # -----------------------------

    return "general"


# ==========================================
# TASK WORKFLOW
# ==========================================

def create_task(question: str):

    task_text = question.strip()

    prefixes = [
        "create a task",
        "create task",
        "make a task",
        "add a task",
        "task"
    ]

    for prefix in prefixes:

        if task_text.lower().startswith(prefix):

            task_text = task_text[len(prefix):].strip()

            break

    task_text = task_text.lstrip(":,- ")

    if not task_text:
        task_text = "New Task"

    return {
        "status": "created",
        "title": task_text,
        "message": f"Task '{task_text}' created successfully."
    }


# ==========================================
# WORKFLOW ROUTER
# ==========================================

def route_request(question: str, intent: str):

    # TASK WORKFLOW

    if intent == "task":

        return create_task(question)


    # DOCUMENT WORKFLOW

    if intent == "document":

        return {
            "status": "selected",
            "workflow": "document",
            "message": "Document workflow selected."
        }


    # EMAIL WORKFLOW

    if intent == "email":

        return {
            "status": "selected",
            "workflow": "email",
            "message": "Email workflow selected."
        }


    # GENERAL WORKFLOW

    if intent == "general":

        return {
            "status": "selected",
            "workflow": "general",
            "message": "General AI workflow selected."
        }


    return {
        "status": "error",
        "message": "Unknown workflow."
    }