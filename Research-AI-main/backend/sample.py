from groq import Groq
import os
import dotenv

dotenv.load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    # Fallback to direct key if env not loaded (like in original sample) or print error
    print("Please set GROQ_API_KEY in .env")
    try:
        # Try to read directly from .env line if python-dotenv fails (unlikely)
        with open(".env", "r") as f:
            for line in f:
                if line.startswith("GROQ_API_KEY="):
                    api_key = line.split("=", 1)[1].strip()
                    break
    except:
        pass

if not api_key:
    print("Error: GROQ_API_KEY not found.")
    exit(1)

client = Groq(api_key=api_key)

try:
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": "Hello"}
        ]
    )
    print(response.choices[0].message.content)
except Exception as e:
    print(f"Error: {e}")