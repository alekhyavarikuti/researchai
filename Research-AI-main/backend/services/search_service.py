import os
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class SearchService:
    def __init__(self, paper_service=None):
        self.paper_service = paper_service

    def get_all_paper_contents(self):
        """Fetches content and filenames for all papers in the knowledge base."""
        if not self.paper_service:
            return [], []
            
        filenames = self.paper_service.list_papers()
        contents = []
        valid_filenames = []
        
        for name in filenames:
            path = self.paper_service.get_paper_path(name)
            content = self.paper_service.extract_text(path)
            if content and len(content.strip()) > 50:
                contents.append(content)
                valid_filenames.append(name)
        
        return contents, valid_filenames

    def find_similar_documents(self, query_text, k=5, threshold=0.1):
        """
        Uses TF-IDF Vectorization and Cosine Similarity to find matching documents.
        This represents a 'correct algorithm' for document-level plagiarism detection.
        """
        contents, filenames = self.get_all_paper_contents()
        
        if not contents or not query_text:
            return []

        # Initialize TF-IDF Vectorizer
        # We use ngram_range=(1,2) to catch both words and short phrases
        vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
        
        try:
            # Fit and transform the document corpus + the query
            tfidf_matrix = vectorizer.fit_transform(contents + [query_text])
            
            # The query vector is the last one in the matrix
            query_vector = tfidf_matrix[-1]
            document_vectors = tfidf_matrix[:-1]
            
            # Calculate cosine similarity between query and all documents
            similarities = cosine_similarity(query_vector, document_vectors).flatten()
            
            # Sort by similarity score
            results = []
            for idx in np.argsort(similarities)[::-1]:
                score = similarities[idx]
                if score >= threshold:
                    content_snippet = contents[idx]
                    results.append({
                        "source": filenames[idx],
                        "score": round(float(score) * 100, 2),
                        "content": content_snippet[:300] + "..."
                    })
                
                if len(results) >= k:
                    break
            
            return results
        except Exception as e:
            print(f"Algorithm Error in Similarity Check: {e}")
            return []

    def search(self, query, k=5):
        """Original search method updated to use higher accuracy algorithm."""
        return self.find_similar_documents(query, k=k)
