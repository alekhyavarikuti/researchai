from flask import Blueprint, request, jsonify, Response, stream_with_context
from services import paper_service, search_service, llm_service, news_service, collaboration_service
from models import db, History
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
from datetime import datetime

main_bp = Blueprint('main', __name__)



@main_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_paper():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    filepath = paper_service.save_file(file)
    if filepath:
        # Extract content for immediate use (like visualization)
        content = paper_service.extract_text(filepath)
        
        # Log history
        user_id = get_jwt_identity()
        new_history = History(user_id=user_id, action="Uploaded", item_name=file.filename)
        db.session.add(new_history)
        db.session.commit()
        
        return jsonify({
            'message': 'File uploaded successfully', 
            'filename': file.filename,
            'content': content
        }), 201
    else:
        return jsonify({'error': 'Invalid file type'}), 400

@main_bp.route('/papers', methods=['GET'])
@jwt_required()
def list_papers():
    # Helper debug print
    print(f"User {get_jwt_identity()} requesting papers list")
    papers = paper_service.list_papers()
    print(f"Found {len(papers)} papers")
    return jsonify({'papers': papers}), 200

@main_bp.route('/search', methods=['POST'])
@jwt_required()
def search_papers():
    data = request.get_json()
    query = data.get('query')
    if not query:
        return jsonify({'error': 'Query is required'}), 400
    
    results = search_service.search(query, k=5)
    return jsonify({'results': results}), 200

@main_bp.route('/summarize', methods=['POST'])
@jwt_required()
def summarize_paper():
    data = request.get_json()
    filename = data.get('filename')
    
    # If filename is provided, get content from file
    if filename:
        filepath = paper_service.get_paper_path(filename)
        if not os.path.exists(filepath):
             return jsonify({'error': 'File not found'}), 404
        content = paper_service.extract_text(filepath)
    else:
        # Otherwise use provided text content (if any, e.g. from search result)
        content = data.get('content')
    
    if not content:
        return jsonify({'error': 'Content or filename is required'}), 400

    summary = llm_service.summarize_text(content[:3000]) # Limit tokens
    
    # Log history
    try:
        user_identity = get_jwt_identity()
        user_id = int(str(user_identity)) if user_identity else None
    except:
        user_id = None
        
    if user_id:
        item_name = filename if filename else "Text Snippet"
        new_history = History(user_id=user_id, action="Summarized", item_name=item_name)
        db.session.add(new_history)
        db.session.commit()

    return jsonify({'summary': summary}), 200

@main_bp.route('/qa', methods=['POST'])
@jwt_required()
def answer_question():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'Invalid request body or Content-Type'}), 400
        
    question = data.get('question')
    context = data.get('context') 
    if not context:
        search_results = search_service.search(question, k=3)
        context = "\n".join([res['content'] for res in search_results])
    
    if not question:
        return jsonify({'error': 'Question is required'}), 400
        
    try:
        answer = llm_service.answer_question(context, question)
        return jsonify({'answer': answer}), 200
    except Exception as e:
        print(f"Error in answer_question: {e}")
        return jsonify({'error': str(e)}), 500

@main_bp.route('/qa-stream', methods=['POST'])
@jwt_required()
def stream_answer_question():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'Invalid request body'}), 400
        
    question = data.get('question')
    
    # Log history
    try:
        user_identity = get_jwt_identity()
        user_id = int(str(user_identity)) if user_identity else None
        if user_id:
            # Truncate prompt for history item
            item_name = (question[:30] + '...') if len(question) > 30 else question
            new_history = History(user_id=user_id, action="Chat", item_name=item_name)
            db.session.add(new_history)
            db.session.commit()
    except Exception as e:
        print(f"History Log Error: {e}")

    def generate():
        for chunk in llm_service.generate_response_stream(question):
            yield chunk

    return Response(stream_with_context(generate()), mimetype='text/plain')

@main_bp.route('/analyze-image', methods=['POST'])
@jwt_required()
def analyze_image():
    data = request.get_json(silent=True)
    image_data = data.get('image') # Base64 string or URL
    prompt = data.get('prompt', 'Describe this image')
    
    if not image_data:
        return jsonify({'error': 'Image data required'}), 400

    # Log history
    try:
        user_identity = get_jwt_identity()
        user_id = int(str(user_identity)) if user_identity else None
        if user_id:
            item_name = (prompt[:30] + '...') if len(prompt) > 30 else prompt
            new_history = History(user_id=user_id, action="Image Analysis", item_name=item_name)
            db.session.add(new_history)
            db.session.commit()
    except Exception as e:
        print(f"History Log Error: {e}")

    def generate():
        for chunk in llm_service.analyze_image_stream(prompt, image_data):
            yield chunk

    return Response(stream_with_context(generate()), mimetype='text/plain')

@main_bp.route('/news', methods=['GET'])
def get_news():
    topic = request.args.get('topic', 'Academic Research')
    articles = news_service.get_latest_news(topic)
    return jsonify({'articles': articles}), 200

@main_bp.route('/conferences', methods=['GET'])
def get_conferences():
    topic = request.args.get('topic', 'Computer Science')
    conferences = news_service.get_conferences(topic)
    return jsonify({'conferences': conferences}), 200

@main_bp.route('/visualize-paper', methods=['POST'])
@jwt_required()
def visualize_paper():
    data = request.get_json()
    content = data.get('content')
    filename = data.get('filename', 'Unknown Document')
    
    if not content:
        return jsonify({'error': 'Paper content required'}), 400
        
    # Use LLMService (Groq + Pollinations) for free, robust visualization
    result = llm_service.generate_visual_prompt(content)
    if not result:
        return jsonify({'error': 'Failed to generate visualization. Ensure your Groq key is valid.'}), 500

    # Log history
    try:
        user_identity = get_jwt_identity()
        user_id = int(str(user_identity)) if user_identity else None
        if user_id:
            new_history = History(user_id=user_id, action="Visual Abstract", item_name=filename)
            db.session.add(new_history)
            db.session.commit()
    except Exception as e:
        print(f"History Log Error: {e}")

    return jsonify(result), 200

@main_bp.route('/compare', methods=['POST'])
@jwt_required()
def compare_papers():
    data = request.get_json()
    filenames = data.get('filenames', [])
    
    papers_content = []
    for filename in filenames:
        filepath = paper_service.get_paper_path(filename)
        if os.path.exists(filepath):
            content = paper_service.extract_text(filepath)
            papers_content.append(content[:2000] if content else "") # Limit tokens per paper
            
    if len(papers_content) < 2:
        return jsonify({'error': 'At least two valid papers required for comparison'}), 400
        
    comparison = llm_service.compare_papers(papers_content)
    
    # Log history
    user_id = get_jwt_identity()
    new_history = History(user_id=user_id, action="Compared", item_name=", ".join(filenames))
    db.session.add(new_history)
    db.session.commit()
    
    return jsonify({'comparison': comparison}), 200

@main_bp.route('/check-plagiarism', methods=['POST'])
@jwt_required()
def check_plagiarism():
    # Check for text in form data or json
    content = None
    filename = "Pasted Text"
    
    # Handle file upload
    if 'file' in request.files:
        file = request.files['file']
        if file.filename != '':
            filepath = paper_service.save_file(file)
            if filepath:
                content = paper_service.extract_text(filepath)
                filename = file.filename
            else:
                return jsonify({'error': 'Invalid file type'}), 400
    
    # If no file content, check for raw text
    if not content:
        data = request.get_json(silent=True) or request.form
        content = data.get('text')
        
    if not content:
        return jsonify({'error': 'Text or file content is required'}), 400
        
    # Step 1: Internal Database Check (TF-IDF Similarity Algorithm)
    internal_matches = []
    internal_context = ""
    try:
        # Check for similarity in our own repository
        # Use first 1000 chars for a robust search
        internal_matches = search_service.search(content[:1000], k=3)
        # Filter out current file
        internal_matches = [m for m in internal_matches if m['source'] != filename]
        
        if internal_matches:
            internal_context = "Matches found in our internal database:\n"
            for m in internal_matches:
                internal_context += f"- Source: {m['source']} (Similarity: {m['score']}%)\n  Snippet: {m['content']}\n"
    except Exception as e:
        print(f"Internal search error: {e}")

    # Step 2: Advanced Forensic Analysis with LLM
    result_str = llm_service.check_plagiarism(content, internal_context)
    
    # Step 3: Parse Result
    import json
    try:
        clean_json = result_str.replace("```json", "").replace("```", "").strip()
        result_data = json.loads(clean_json)
    except Exception as e:
        print(f"JSON Parse Error: {e}")
        result_data = {"assessment": result_str, "originality_score": 0}

    # Include internal matches in the final response for the UI to show
    result_data['internal_matches'] = internal_matches
    
    # Log history
    try:
        user_id = get_jwt_identity()
        if user_id:
            new_history = History(user_id=int(user_id), action="Forensic Audit", item_name=filename)
            db.session.add(new_history)
            db.session.commit()
    except Exception as e:
        print(f"History Log Error: {e}")
        
    return jsonify({'result': result_data}), 200

@main_bp.route('/rooms', methods=['POST'])
@jwt_required()
def create_room():
    data = request.get_json()
    name = data.get('name')
    if not name:
        return jsonify({'error': 'Room name is required'}), 400
    
    room_id = collaboration_service.create_room(name)
    return jsonify({'room_id': room_id, 'name': name}), 201

@main_bp.route('/rooms/<room_id>', methods=['GET'])
@jwt_required()
def get_room(room_id):
    room = collaboration_service.get_room(room_id)
    if not room:
        return jsonify({'error': 'Room not found'}), 404
    return jsonify(room), 200

@main_bp.route('/rooms/<room_id>/messages', methods=['POST'])
@jwt_required()
def add_message(room_id):
    data = request.get_json()
    user_identity = get_jwt_identity()
    # Ideally fetch username from DB, here just use ID or passed name if simple
    content = data.get('content')
    username = data.get('user', f"User {user_identity}")

    if not content:
        return jsonify({'error': 'Message content is required'}), 400
        
    message = collaboration_service.add_message(room_id, username, content)
    if not message:
         return jsonify({'error': 'Room not found'}), 404
         
    return jsonify(message), 201

@main_bp.route('/rooms/<room_id>/messages', methods=['GET'])
@jwt_required()
def get_messages(room_id):
    messages = collaboration_service.get_messages(room_id)
    return jsonify({'messages': messages}), 200

@main_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_data():
    user_id = get_jwt_identity()
    
    # Fetch real user history
    history = History.query.filter_by(user_id=user_id).order_by(History.timestamp.desc()).limit(10).all()
    recent_activity = []
    
    for item in history:
        # Calculate relative time if needed, or send ISO string
        recent_activity.append({
            "action": item.action,
            "item": item.item_name,
            "time": item.timestamp.strftime("%Y-%m-%d %H:%M"),
            "user": "You"
        })
    
    # Calculate stats
    papers = paper_service.list_papers()
    paper_count = len(papers)
    
    # Count specific user actions
    summary_count = History.query.filter_by(user_id=user_id, action="Summarized").count()
    
    research_hours_saved = (paper_count * 0.5) + (summary_count * 0.2)
    
    stats = [
        {"label": "Total Papers", "value": str(paper_count), "trend": "Global", "color": "#10b981"},
        {"label": "Summaries Generated", "value": str(summary_count), "trend": "Personal", "color": "#10b981"}, 
        {"label": "Active Collaborations", "value": str(len(collaboration_service.rooms)), "trend": "Active", "color": "#6b7280"},
        {"label": "Research Hours Saved", "value": f"{research_hours_saved:.1f}h", "trend": "Est.", "color": "#10b981"},
    ]
        
    return jsonify({
        "stats": stats,
        "recent_activity": recent_activity
    }), 200
