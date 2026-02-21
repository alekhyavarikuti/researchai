from .paper_service import PaperService
from .search_service import SearchService
from .llm_service import LLMService
from .news_service import NewsService
from .collaboration_service import CollaborationService

paper_service = PaperService()
search_service = SearchService(paper_service)
llm_service = LLMService()
news_service = NewsService()
collaboration_service = CollaborationService()
