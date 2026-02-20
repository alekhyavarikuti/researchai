import os
import time
import logging
from typing import Optional, Generator, List, Union
from groq import Groq, APIConnectionError, RateLimitError, APIError
from dotenv import load_dotenv

# Load dotenv from backend root
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            logger.warning("GROQ_API_KEY not found. AI features will not work.")
            self.client = None
        else:
            self.client = Groq(api_key=self.api_key)
            self.model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
            self.vision_model = os.getenv("GROQ_VISION_MODEL", "llama-3.2-11b-vision-preview")
            
            self.system_prompt = (
                "You are an advanced AI assistant developed by the 'Zencoders AI Team' from BEC (Bapatla Engineering College). "
                "Your primary goal is to assist users with their queries, research, and analysis tasks. "
                "If asked about your identity, always state clearly that you were developed by the Zencoders AI Team from BEC. "
                "Be helpful, professional, and concise."
            )

    def _call_api_with_retry(self, messages: List[dict], model: str, retries: int = 3) -> Optional[str]:
        """
        Helper method to call Groq API with retry logic for rate limits.
        """
        if not self.client:
            return "AI service is not configured."

        for attempt in range(retries):
            try:
                chat_completion = self.client.chat.completions.create(
                    messages=messages,
                    model=model,
                )
                return chat_completion.choices[0].message.content
            except RateLimitError as e:
                wait_time = (2 ** attempt) + 1
                logger.warning(f"Rate limit hit. Retrying in {wait_time}s...")
                time.sleep(wait_time)
            except APIConnectionError as e:
                logger.error(f"Connection error: {e}")
                return "Network error: Unable to connect to AI service."
            except APIError as e:
                logger.error(f"API error: {e}")
                return f"AI Service Error: {str(e)}"
            except Exception as e:
                logger.error(f"Unexpected error: {e}")
                return "An unexpected error occurred."
        
        return "Service busy. Please try again later."

    def _generate_response(self, prompt: str) -> str:
        """Internal method to generate a response for a given prompt."""
        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": prompt}
        ]
        return self._call_api_with_retry(messages, self.model)

    def generate_response_stream(self, prompt: str) -> Generator[str, None, None]:
        if not self.client:
            yield "AI service is not configured."
            return

        try:
            stream = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": prompt}
                ],
                model=self.model,
                stream=True,
            )
            for chunk in stream:
                content = chunk.choices[0].delta.content
                if content:
                    yield content
        except Exception as e:
            logger.error(f"Stream error: {e}")
            yield f"Error: {str(e)}"

    def analyze_image_stream(self, prompt: str, image_data: str) -> Generator[str, None, None]:
        """
        Analyzes an image using the vision model.
        image_data: Base64 string or URL.
        """
        if not self.client:
            yield "AI service is not configured."
            return

        try:
            formatted_image_url = f"{image_data}" if image_data.startswith("http") else f"data:image/jpeg;base64,{image_data}"
            
            messages = [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": formatted_image_url}},
                    ],
                }
            ]
            
            stream = self.client.chat.completions.create(
                model=self.vision_model,
                messages=messages,
                stream=True,
            )
            
            for chunk in stream:
                content = chunk.choices[0].delta.content
                if content:
                    yield content
        except Exception as e:
            logger.error(f"Vision error: {e}")
            yield f"Error analyzing image: {str(e)}"

    def summarize_text(self, text: str) -> str:
        """Summarizes the provided text."""
        prompt = f"Please provide a concise summary of the following text:\n\n{text}"
        return self._generate_response(prompt)

    def answer_question(self, context: str, question: str) -> str:
        """Answers a question based on optional context."""
        if context:
            prompt = f"Context:\n{context}\n\nQuestion: {question}\n\nAnswer the question based on the context provided. If the answer is not in the context, use your general knowledge."
        else:
            prompt = f"Question: {question}\n\nAnswer the question clearly and concisely."
        return self._generate_response(prompt)

    def compare_papers(self, papers_content: List[str]) -> str:
        """Compares multiple papers."""
        combined_text = "\n\n---\n\n".join(papers_content)
        prompt = f"Compare the following papers (separated by ---) and highlight key similarities and differences:\n\n{combined_text}"
        return self._generate_response(prompt)

    def generate_insight(self, topic: str) -> str:
        """Generates a research insight for a topic."""
        prompt = f"Provide a key research insight or trend regarding: {topic}"
        return self._generate_response(prompt)

    def check_plagiarism(self, text: str, internal_context: str = "") -> str:
        """
        Performs an advanced forensic analysis of the text for plagiarism, 
        AI generation, and citation validity using linguistic fingerprints.
        """
        prompt = f"""
        Act as a Forensic Linguistic Auditor and Expert AI Detector. 
        Your task is to analyze the provided text for stylistic markers of Large Language Models and potential web-matches.

        {internal_context}

        Evaluation Criteria:
        1. **Perplexity Index**: Analyze how predictable the word sequences are. (Low Perplexity = Likely AI).
        2. **Burstiness Score**: Evaluate the variance in sentence length and structure. (Low Burstiness = Likely AI).
        3. **N-Gram Probability**: Identify common LLM-favored phrases and robotic transitions.
        4. **Forensic Web-Crosscheck**: Simulate a rigorous search across Google Scholar, ArXiv, and academic student archives.
        5. **Citation Integrity**: Flag citations that appear 'too perfect' or hallucinated.

        Return the result ONLY as a valid JSON object with the following structure:
        {{
            "originality_score": <int 0-100>,
            "plagiarism_score": <int 0-100>,
            "ai_detection_score": <int 0-100>,
            "perplexity": "Low / Medium / High",
            "burstiness": "Low / Medium / High",
            "flagged_segments": ["precise segment matched"],
            "citation_report": [{{ "citation": "...", "status": "...", "reason": "..." }}],
            "web_matches": [{{ "source": "...", "match_percentage": <int> }}],
            "assessment": "<detailed assessment>"
        }}

        Constraint: The sum of scores MUST equal exactly 100.

        Text to analyze:
        {text[:5000]}
        """
        return self._generate_response(prompt)

    def generate_visual_prompt(self, paper_content: str):
        """
        Synthesizes a visual concept and retrieves a matching image.
        Uses Tavily (Search) for real academic/scientific images for maximum reliability.
        """
        if not self.client:
            return None

        # Step 1: Generate keywords/concept from paper
        concept_prompt = f"""
        Analyze this research paper and extract 2-3 powerful scientific keywords 
        that represent its core invention.
        
        PAPER: {paper_content[:1500]}
        
        Return ONLY the keywords. Example: 'Quantum Computing'
        """
        
        try:
            keywords = self._generate_response(concept_prompt).strip().replace("'", "").replace('"', "")
            print(f"DEBUG: Visualization keywords: {keywords}")

            # Step 2: Use Tavily to find a REAL scientific/academic image (Highest Reliability)
            tavily_key = os.getenv("TAVILY_API_KEY")
            if tavily_key:
                try:
                    from tavily import TavilyClient
                    t_client = TavilyClient(api_key=tavily_key)
                    # Search specifically for scientific/abstract images of the concept
                    search_query = f"scientific academic abstract image of {keywords}"
                    t_res = t_client.search(search_query, search_depth="basic", max_results=3, include_images=True)
                    
                    if t_res.get('images'):
                        # Success! We found a real, stable image URL
                        image_url = t_res['images'][0]
                        return {
                            "prompt": f"Academic visual representation of {keywords}",
                            "image_url": image_url
                        }
                except Exception as t_err:
                    print(f"Tavily Visual Search failed: {t_err}")

            # Step 3: Fallback to Lexica (Pre-rendered AI Art)
            import requests
            try:
                lex_res = requests.get(f"https://lexica.art/api/v1/search?q={keywords}", timeout=5)
                lex_data = lex_res.json()
                if lex_data.get('images'):
                    return {
                        "prompt": f"AI interpretation of {keywords}",
                        "image_url": lex_data['images'][0]['src']
                    }
            except: pass

            # Step 4: Final Fallback to stable Pollinations
            return {
                "prompt": f"Visualizing {keywords}...",
                "image_url": f"https://image.pollinations.ai/prompt/{keywords.replace(' ', '%20')}?width=1024&height=1024&nologo=true"
            }
        except Exception as e:
            logger.error(f"Visualization error: {e}")
            return None
