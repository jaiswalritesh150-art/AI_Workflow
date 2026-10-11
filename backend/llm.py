import os
import json
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError(
        "GEMINI_API_KEY is not set in the .env file."
    )


client = genai.Client(api_key=api_key)

def ask_gemini(question: str) -> str:
    """
    Send a question to Gemini and return the generated answer.
    """

    response = client.models.generate_content(
        model="gemini-3.8-flash",
        contents=question
    )

    return response.text

def detect_intent(question: str) -> dict:
    """
    Understand the user's request and identify
    the most appropriate workflow.
    """

    prompt = f"""
You are an intent classification system for an AI Workflow Assistant.

Your job is to understand the user's request and classify it
into exactly ONE of these workflows:

1. general
   - General questions
   - Explanations
   - Learning questions
   - Normal conversations

2. task
   - Creating a task
   - Adding a task
   - Setting a reminder
   - Planning something to do
   - Todo-related requests

3. email
   - Writing an email
   - Drafting an email
   - Replying to an email
   - Creating a professional email

4. document
   - Summarizing a document
   - Summarizing a PDF
   - Extracting information from a document
   - Finding key points from a document

IMPORTANT:
Understand the meaning of the request, not just keywords.

For example:

"Prepare my resume tomorrow"
→ task

"I need to finish my resume"
→ task

"Can you explain Python?"
→ general

"Please write to HR asking about my internship"
→ email

"Give me the important points from this PDF"
→ document

Return ONLY valid JSON.

Use exactly this format:

{{
    "intent": "general",
    "workflow": "general"
}}

User request:
{question}
"""

    try:

        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=prompt
        )

        result = response.text.strip()

        # Remove markdown code fences if Gemini adds them
        result = result.replace("```json", "")
        result = result.replace("```", "")
        result = result.strip()

        data = json.loads(result)

        intent = str(
            data.get("intent", "general")
        ).lower()

        workflow = str(
            data.get("workflow", intent)
        ).lower()

        # Safety check
        allowed_workflows = {
            "general",
            "task",
            "email",
            "document"
        }

        if workflow not in allowed_workflows:
            workflow = "general"

        if intent not in allowed_workflows:
            intent = workflow

        return {
            "intent": intent,
            "workflow": workflow
        }

    except Exception as error:

        print(
            "Intent Detection Error:",
            error
        )

        # Safe fallback
        return {
            "intent": "general",
            "workflow": "general"
        }
