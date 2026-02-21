import os
import pypdf
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'txt'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

class PaperService:
    def __init__(self, upload_folder=UPLOAD_FOLDER):
        self.upload_folder = upload_folder

    def allowed_file(self, filename):
        return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

    def save_file(self, file):
        if file and self.allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(self.upload_folder, filename)
            file.save(filepath)
            return filepath
        return None

    def extract_text(self, filepath):
        try:
            if filepath.endswith('.pdf'):
                return self._extract_pdf_text(filepath)
            elif filepath.endswith('.txt'):
                with open(filepath, 'r', encoding='utf-8') as f:
                    return f.read()
            return ""
        except Exception as e:
            print(f"Error extracting text from {filepath}: {e}")
            return None

    def _extract_pdf_text(self, filepath):
        text = ""
        with open(filepath, 'rb') as f:
            pdf_reader = pypdf.PdfReader(f)
            for page in pdf_reader.pages:
                text += page.extract_text() or ""
        return text

    def list_papers(self):
        papers = []
        if os.path.exists(self.upload_folder):
            try:
                for filename in os.listdir(self.upload_folder):
                     if self.allowed_file(filename):
                         papers.append(filename)
            except Exception as e:
                print(f"Error listing papers: {e}")
        return papers

    def get_paper_path(self, filename):
        return os.path.join(self.upload_folder, filename)
