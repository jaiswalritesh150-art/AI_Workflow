import os
from dotenv import load_dotenv
from google import genai

# Load environment variables
load_dotenv()

# Get Gemini API key
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError(
        "GEMINI_API_KEY is not set in the .env file."
    )

# Create Gemini client
client = genai.Client(api_key=api_key)


def ask_gemini(question: str) -> str:
    """
    Send a question to Gemini and return the generated answer.
    """

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=question
    )

    return response.text