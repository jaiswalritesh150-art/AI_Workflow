\# AI Workflow Assistant



An AI-powered workflow assistant that analyzes user requests and routes them to the appropriate workflow such as General AI, Task, Email, or Document processing.



\## 🚀 Overview



AI Workflow Assistant is a simple workflow automation project built with \*\*FastAPI and React.js\*\*.



Instead of manually selecting what type of action is required, the user can enter a natural-language request. The backend identifies the appropriate workflow and returns a structured response.



For example:



\* "What is artificial intelligence?" → General workflow

\* "Create a task to prepare my resume" → Task workflow

\* "Write an email to HR" → Email workflow

\* "Summarize this document" → Document workflow



The project focuses on a clean architecture, structured API responses, and a simple user interface.



\## ✨ Features



\* Natural-language user input

\* Automatic workflow selection

\* General AI workflow

\* Task workflow

\* Email workflow

\* Document workflow

\* Structured JSON API responses

\* React-based frontend

\* FastAPI backend

\* CORS-enabled frontend/backend communication

\* Simple and beginner-friendly architecture



\## 🧩 Workflows



\### 1. General Workflow



Handles general questions and informational requests.



Example:



```text

What is artificial intelligence?

```



\### 2. Task Workflow



Handles task-related requests and returns task information such as priority, creation time, and status.



Example:



```text

Create a task to prepare my internship resume

```



\### 3. Email Workflow



Handles requests related to writing professional emails.



Example:



```text

Write a professional email to HR for internship

```



\### 4. Document Workflow



Handles document-related requests and provides the appropriate document action.



Example:



```text

Summarize this document

```



\## 🏗️ Project Architecture



```text

User

&#x20; │

&#x20; ▼

React Frontend

&#x20; │

&#x20; │ POST /ask

&#x20; ▼

FastAPI Backend

&#x20; │

&#x20; ▼

Workflow Detection

&#x20; │

&#x20; ├── General Workflow

&#x20; ├── Task Workflow

&#x20; ├── Email Workflow

&#x20; └── Document Workflow

&#x20; │

&#x20; ▼

Structured JSON Response

&#x20; │

&#x20; ▼

React Frontend

```



\## 🛠️ Tech Stack



\### Frontend



\* React.js

\* Vite

\* JavaScript

\* CSS



\### Backend



\* Python

\* FastAPI

\* Uvicorn



\### Development Tools



\* Git

\* GitHub

\* VS Code

\* REST API

\* Swagger / OpenAPI



\## 📁 Project Structure



```text

AI\_Workflow/

│

├── backend/

│   ├── api.py

│   ├── main.py

│   ├── llm.py

│   ├── workflow.py

│   ├── document\_loader.py

│   ├── requirements.txt

│   └── documents/

│       └── company\_policy.txt

│

├── frontend/

│   ├── src/

│   │   ├── App.jsx

│   │   ├── App.css

│   │   ├── index.css

│   │   └── main.jsx

│   │

│   ├── public/

│   ├── package.json

│   ├── package-lock.json

│   └── vite.config.js

│

├── .gitignore

└── README.md

```



\## ⚙️ Local Setup



\### 1. Clone the repository



```bash

git clone https://github.com/jaiswalritesh150-art/AI\_Workflow.git

cd AI\_Workflow

```



\### 2. Backend Setup



Open a terminal inside the backend directory:



```bash

cd backend

```



Create a virtual environment:



```bash

python -m venv venv

```



Activate it on Windows:



```powershell

venv\\Scripts\\Activate.ps1

```



Install dependencies:



```bash

pip install -r requirements.txt

```



Start the FastAPI server:



```bash

python -m uvicorn api:app --reload

```



Backend will run at:



```text

http://127.0.0.1:8000

```



Swagger API documentation:



```text

http://127.0.0.1:8000/docs

```



\### 3. Frontend Setup



Open another terminal:



```bash

cd frontend

```



Install dependencies:



```bash

npm install

```



Start the development server:



```bash

npm run dev

```



Frontend will run at:



```text

http://localhost:5173

```



\## 🔌 API



\### POST `/ask`



The main API endpoint accepts a user question and determines the appropriate workflow.



Request:



```json

{

&#x20; "question": "Create a task to prepare my internship resume"

}

```



Example response:



```json

{

&#x20; "intent": "task",

&#x20; "workflow": "task",

&#x20; "status": "success",

&#x20; "message": "Task workflow selected successfully.",

&#x20; "data": {

&#x20;   "task": "Create a task to prepare my internship resume",

&#x20;   "priority": "Medium",

&#x20;   "status": "Pending"

&#x20; }

}

```



\## 🔒 Security



Sensitive information such as API keys and environment variables should not be committed to GitHub.



The project uses `.gitignore` to exclude:



\* Virtual environments

\* `node\_modules`

\* `.env` files

\* Python cache files

\* Build files

\* Logs



\## 📌 Current Status



The current version provides a working workflow-routing MVP with a React frontend and FastAPI backend.



The project is designed so additional AI-powered workflows and integrations can be added in future versions.



\## 🔮 Future Improvements



\* Connect workflows with real AI/LLM APIs

\* Add persistent task storage

\* Add document upload and processing

\* Generate richer email drafts

\* Add authentication

\* Add workflow history

\* Add database integration

\* Add production deployment

\* Add monitoring and logging



\## 👨‍💻 Author



\*\*Ritesh Jaiswal\*\*



AI/ML Engineering Student



GitHub: https://github.com/jaiswalritesh150-art



