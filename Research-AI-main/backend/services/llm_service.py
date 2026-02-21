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
                "You are 'ResearchAI', a professional advanced AI research assistant developed by the 'Zencoders AI Team' from Bapatla Engineering College (BEC). "
                "Your expertise lies in analyzing academic papers, technical documents, and providing deep insights. "
                "Always maintain a professional, academic, yet helpful tone. "
                "When a document is provided in your context, prioritize its content for answering queries. "
                "If asked about your identity, always state you were developed by the Zencoders AI Team from BEC."
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

    def generate_response_stream_with_history(self, messages: List[dict]) -> Generator[str, None, None]:
        """
        Generates a streaming response based on conversation history.
        messages: List of objects with 'role' and 'content'.
        """
        if not self.client:
            yield "AI service is not configured."
            return

        # Prepare messages including system prompt
        formatted_messages = [{"role": "system", "content": self.system_prompt}]
        
        # Ensure only supported roles and fields are passed to the API
        for msg in messages:
            if msg.get('role') in ['user', 'assistant', 'system']:
                formatted_messages.append({
                    "role": msg['role'],
                    "content": msg['content']
                })

        try:
            stream = self.client.chat.completions.create(
                messages=formatted_messages,
                model=self.model,
                stream=True,
            )
            for chunk in stream:
                content = chunk.choices[0].delta.content
                if content:
                    yield content
        except Exception as e:
            logger.error(f"Stream error with history: {e}")
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

    def extract_knowledge_graph(self, text: str):
        """
        Analyzes the text and extracts a knowledge graph (nodes and edges).
        Optimized for scholars to visualize paper connections.
        """
        prompt = f"""
        Act as an Advanced Knowledge Architect. Analyze the following academic text and extract a high-fidelity knowledge graph.
        
        Focus on:
        - Key Concepts (Nodes)
        - Theories/Models (Nodes)
        - Relationships/Influences (Edges)
        - Methodologies (Nodes)
        
        TEXT SNIPPET:
        {text[:4000]}
        
        Return ONLY a JSON object with this structure:
        {{
            "nodes": [{{ "id": "1", "label": "Concept Name", "type": "theory/concept/method/entity" }}],
            "edges": [{{ "from": "1", "to": "2", "label": "relationship description" }}]
        }}
        
        Constraint: Return valid JSON ONLY. No markdown, no preamble.
        """
        response = self._generate_response(prompt)
        try:
            import json
            clean_json = response.replace("```json", "").replace("```", "").strip()
            return json.loads(clean_json)
        except Exception as e:
            logger.error(f"Graph extraction error: {e}")
            return {"nodes": [], "edges": []}

    def web_search_augment(self, query: str, context: str = ""):
        """
        Performs a deep research search using Tavily and synthesizes an academic response.
        """
        tavily_key = os.getenv("TAVILY_API_KEY")
        if not tavily_key:
            return None
            
        try:
            from tavily import TavilyClient
            t_client = TavilyClient(api_key=tavily_key)
            
            # Focused academic search
            search_query = f"scholarly research and latest findings on {query}"
            search_results = t_client.search(search_query, search_depth="advanced", max_results=5)
            
            web_context = "\n\n".join([f"Source: {r['url']}\nContent: {r['content']}" for r in search_results.get('results', [])])
            
            synthesis_prompt = f"""
            Act as a Senior Research Fellow. You are helping a student prepare a paper for a hackathon.
            
            USER QUERY: {query}
            LOCAL DOCUMENT CONTEXT: {context[:2000] if context else "None"}
            LATEST WEB RESEARCH: 
            {web_context}
            
            Synthesize a comprehensive, scholarly response. 
            - Compare local context with latest web findings.
            - Provide citations for web sources.
            - Identify gaps in current research that can be explored.
            
            Format with markdown. Use 'Source' links properly.
            """
            
            answer = self._generate_response(synthesis_prompt)
            return {
                "answer": answer,
                "sources": search_results.get('results', [])
            }
        except Exception as e:
            logger.error(f"Web research error: {e}")
            return None

    def match_journals(self, abstract: str):
        """
        Analyzes the abstract and matches it with top-tier journals.
        """
        prompt = f"""
        Act as a Publication Strategist. Analyze this research abstract and suggest 3-5 high-impact journals for publication.
        
        ABSTRACT:
        {abstract[:3000]}
        
        For each journal, provide:
        - Name
        - Estimated Impact Factor (0.0 - 50.0)
        - Average Review Time (e.g. 2-4 months)
        - Acceptance Probability (High/Medium/Low) based on topic fit.
        
        Return ONLY a JSON array of objects. No markdown.
        Example: [{{ "name": "Nature", "impact": 42.1, "review_time": "3 months", "prob": "Low" }}]
        """
        response = self._generate_response(prompt)
        try:
            import json
            clean_json = response.replace("```json", "").replace("```", "").strip()
            return json.loads(clean_json)
        except: return []

    def get_research_trends(self, topic: str):
        """
        Analyzes the 'market value' and volume of a research topic.
        """
        tavily_key = os.getenv("TAVILY_API_KEY")
        web_info = ""
        if tavily_key:
            try:
                from tavily import TavilyClient
                t_client = TavilyClient(api_key=tavily_key)
                search_res = t_client.search(f"publication volume and research trends for {topic} 2020-2026", max_results=3)
                web_info = "\n".join([r['content'] for r in search_res.get('results', [])])
            except: pass

        prompt = f"""
        Act as a Research Analyst. Based on this topic and web data, estimate the research 'market' interest.
        TOPIC: {topic}
        WEB DATA: {web_info}
        
        Return ONLY a JSON object:
        {{
            "trend_score": <int 0-100>,
            "market_status": "Emerging / Saturated / High Growth",
            "yearly_volume": [{{ "year": 2021, "count": 100 }}, {{ "year": 2022, "count": 150 }}, ...],
            "analysis": "2-3 sentence trend summary"
        }}
        """
        response = self._generate_response(prompt)
        try:
            import json
            clean_json = response.replace("```json", "").replace("```", "").strip()
            return json.loads(clean_json)
        except: return {"trend_score": 50, "market_status": "Stable", "yearly_volume": []}

    def scout_funding(self, keywords: str):
        """
        Searches for active grants and funding opportunities.
        """
        tavily_key = os.getenv("TAVILY_API_KEY")
        if not tavily_key: return []
        
        try:
            from tavily import TavilyClient
            t_client = TavilyClient(api_key=tavily_key)
            # Focused search for open grants
            search_query = f"open research grants and funding opportunities for {keywords} 2025 2026"
            search_results = t_client.search(search_query, search_depth="advanced", max_results=5)
            
            funding_data = []
            for r in search_results.get('results', []):
                funding_data.append({
                    "title": r.get('title', 'Funding Opportunity'),
                    "source": r.get('url', '#'),
                    "snippet": r.get('content', '')[:200]
                })
            return funding_data
        except: return []

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

            return {
                "prompt": f"Visualizing {keywords}...",
                "image_url": f"https://image.pollinations.ai/prompt/{keywords.replace(' ', '%20')}?width=1024&height=1024&nologo=true"
            }
        except Exception as e:
            return None

    def check_ieee_compliance(self, text: str):
        """
        Analyzes the text structure against IEEE formatting standards.
        """
        prompt = f"""
        Act as an IEEE Peer Reviewer. Analyze the follow research paper text for structural compliance with IEEE standards.
        
        TEXT:
        {text[:5000]}
        
        Check for:
        1. Presence of 'Abstract'
        2. Presence of 'Index Terms' or 'Keywords' (Required for IEEE)
        3. Roman numeral section numbering (I. Introduction, II. Literature Survey, etc.)
        4. References section consistency.
        5. Figure/Table citation style.
        
        Return ONLY a JSON object:
        {{
            "is_eligible": <boolean>,
            "score": <int 0-100>,
            "feedback": "A concise summary of status",
            "required_changes": ["Change 1", "Change 2", ...],
            "strengths": ["Point 1", ...]
        }}
        """
        response = self._generate_response(prompt)
        try:
            import json
            clean_json = response.replace("```json", "").replace("```", "").strip()
            return json.loads(clean_json)
        except:
            return {"is_eligible": False, "score": 0, "feedback": "Unrecognized format", "required_changes": []}

    def draft_academic_section(self, topic: str, section_type: str, context: str = ""):
        """
        Drafts professional academic sections like Abstract or Literature Survey.
        """
        prompt = f"""
        Act as a Principal Research Scientist. Draft a highly professional '{section_type}' for a research paper.
        
        TOPIC: {topic}
        CONTEXT/DATA: {context}
        
        Style Guide:
        - Use formal academic English.
        - Ensure a logical flow of arguments.
        - For Literature Survey, mention hypothetical or general research trends if specific ones aren't provided.
        - For Abstract, follow the (Problem - Method - Results - Impact) structure.
        
        Return ONLY the drafted text.
        """
        return self._generate_response(prompt)

    def synthesize_multiple_papers(self, papers: list):
        """
        Generates a comparative analysis of multiple research papers.
        Each item in 'papers' should be a dict with 'filename' and 'content'.
        """
        papers_context = ""
        for i, paper in enumerate(papers):
            # Limiting each to 2000 chars to avoid prompt bloat
            content = paper.get('content', '')[:2000]
            papers_context += f"\n--- PAPER {i+1}: {paper.get('filename')} ---\n{content}\n"

        prompt = f"""
        Act as a Senior Research Analyst. Synthesize the following research papers into a comparative literature grid.
        
        DATA:
        {papers_context}
        
        Compare them across:
        1. Primary Objective
        2. Methodology Used
        3. Key Findings
        4. Unique Contribution/Novelty
        
        Return ONLY a JSON list of objects:
        [
            {{
                "paper": "Filename",
                "objective": "...",
                "methodology": "...",
                "findings": "...",
                "novelty": "..."
            }},
            ...
        ]
        """
        response = self._generate_response(prompt)
        try:
            import json
            clean_json = response.replace("```json", "").replace("```", "").strip()
            # Find the first [ and last ] to be extra safe with LLM output
            start = clean_json.find('[')
            end = clean_json.rfind(']') + 1
            if start != -1 and end != -1:
                return json.loads(clean_json[start:end])
            return json.loads(clean_json)
        except:
            return []
