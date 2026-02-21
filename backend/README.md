# AI Research Agent Backend

This is the backend for the AI Research Agent, built with Python Flask.

## Features
- **Paper Upload**: Upload PDF or text files.
- **Intelligent Search**: Semantic search using vector embeddings (FAISS + HuggingFace).
- **Summarization & UI**: Automated summaries and question answering using Groq (Llama 3).
- **News Integration**: Real-time research news via Tavily API.
- **Collaboration**: Basic research rooms for sharing insights.
- **Voice announcer**

## Setup

1.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

2.  **Environment Variables**:
    Ensure `.env` file exists in `backend/` with:
    ```
    GROQ_API_KEY=...
    TAVILY_API_KEY=...

    ```

3.  **Run the Server**:
    ```bash
    python app.py
    ```
    The server will start on `http://localhost:5000`.

## API Endpoints

-   `POST /api/upload`: Upload a file (`file` form-data).
-   `GET /api/papers`: List uploaded papers.
-   `POST /api/search`: Search papers (`{"query": "..."}`).
-   `POST /api/summarize`: Summarize content (`{"content": "..."}` or `{"filename": "..."}`).
-   `POST /api/qa`: Ask a question (`{"question": "...", "context": "..."}`).
-   `GET /api/news`: Get news (`?topic=...`).
-   `POST /api/compare`: Compare papers (`{"filenames": ["p1.pdf", "p2.pdf"]}`).
-   `POST /api/rooms`: Create a room (`{"name": "..."}`).
-   `GET /api/rooms/<room_id>`: Get room details.
-   `POST /api/rooms/<room_id>/messages`: Add message (`{"user": "...", "content": "..."}`).

