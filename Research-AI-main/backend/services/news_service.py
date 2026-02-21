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

    def get_trending_research(self):
        """
        Fetches the most trending and breaking research news globally across all fields.
        """
        if not self.client: return []
        queries = ["latest major scientific breakthroughs 2026", "trending academic research news worldwide", "hottest topics in science and technology today"]
        results = []
        images = []
        for q in queries[:2]: # Try 2 broad queries
            try:
                res = self.client.search(q, search_depth="advanced", max_results=5, include_images=True)
                results.extend(res.get('results', []))
                images.extend(res.get('images', []))
                if len(results) >= 5: break
            except: continue
        
        articles = []
        for i, result in enumerate(results):
            articles.append({
                "title": result.get("title"),
                "url": result.get("url"),
                "content": result.get("content"),
                "image": images[i] if i < len(images) else None,
                "published_date": result.get("published_date", "Trending"),
                "is_trending": True
            })
        return articles

    def get_latest_news(self, query="Latest academic research news"):
        if not self.client:
            return []
        try:
            # Step 1: Specific Topic Search
            response = self.client.search(query, search_depth="advanced", max_results=8, include_images=True)
            images = response.get('images', [])
            results = response.get('results', [])
            
            # Step 2: If empty or low, Get Trending Research
            if len(results) < 3:
                return self.get_trending_research()

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
            return self.get_trending_research()

    def get_conferences(self, topic="Computer Science"):
        if not self.client:
            return []
        try:
            # Step 1: Specific Conference Search
            query = f"upcoming {topic} academic conferences call for papers 2026"
            response = self.client.search(query, search_depth="advanced", max_results=6, include_images=True)
            images = response.get('images', [])
            results = response.get('results', [])
            
            # Step 2: Global Academic Event Fallback if empty
            if len(results) < 2:
                fallback_query = "top upcoming global academic conferences 2026 for all research fields"
                fallback_res = self.client.search(fallback_query, max_results=6, include_images=True)
                results = fallback_res.get('results', [])
                images = fallback_res.get('images', [])

            conferences = []
            for i, result in enumerate(results):
                conferences.append({
                    "title": result.get("title"),
                    "url": result.get("url"),
                    "content": result.get("content"),
                    "image": images[i] if i < len(images) else None,
                    "deadline": "Check website for Call for Papers",
                    "is_trending": True if topic not in result.get("title", "").lower() else False
                })
            return conferences
        except Exception as e:
            print(f"Error fetching conferences: {e}")
            return []
