from tavily import TavilyClient
import os
from dotenv import load_dotenv

# Load dotenv from backend root
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path)

class NewsService:
    def __init__(self):
        self.api_key = os.getenv("TAVILY_API_KEY")
        if self.api_key:
            self.client = TavilyClient(api_key=self.api_key)
        else:
            self.client = None

    def get_latest_news(self, query="Latest academic research news"):
        if not self.client:
            return []
        try:
            # Tavily search with images
            response = self.client.search(query, search_depth="advanced", max_results=8, include_images=True)
            images = response.get('images', [])
            results = response.get('results', [])
            
            articles = []
            for i, result in enumerate(results):
                articles.append({
                    "title": result.get("title"),
                    "url": result.get("url"),
                    "content": result.get("content"),
                    "image": images[i] if i < len(images) else None,
                    "published_date": result.get("published_date", "Recently")
                })
            return articles
        except Exception as e:
            print(f"Error fetching news: {e}")
            return []

    def get_conferences(self, topic="Computer Science"):
        if not self.client:
            return []
        try:
            query = f"upcoming {topic} academic conferences call for papers 2026"
            response = self.client.search(query, search_depth="advanced", max_results=6, include_images=True)
            images = response.get('images', [])
            results = response.get('results', [])
            
            conferences = []
            for i, result in enumerate(results):
                conferences.append({
                    "title": result.get("title"),
                    "url": result.get("url"),
                    "content": result.get("content"),
                    "image": images[i] if i < len(images) else None,
                    "deadline": "Check website for Call for Papers"
                })
            return conferences
        except Exception as e:
            print(f"Error fetching conferences: {e}")
            return []
