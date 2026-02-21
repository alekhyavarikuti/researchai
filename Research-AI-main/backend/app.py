from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import timedelta
import os
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from models import db

if not os.path.exists('uploads'):
    os.makedirs('uploads')

load_dotenv()

from controllers.main_controller import main_bp
from controllers.auth_controller import auth_bp

app = Flask(__name__)

# Config
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///research_agent.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# Hardcoded key for debugging stability
app.config['JWT_SECRET_KEY'] = 'v8K9p2mN5qR4sL7tW3xY6zB1cA0dE9fG2hJ5kL8nQ4wP7sT3vX6yZ9bC1nA0dE'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=30) 

db.init_app(app)
jwt = JWTManager(app)
bcrypt = Bcrypt(app)

# Enhanced JWT Error Handling
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    print(f"JWT Error: Token expired")
    return jsonify({"msg": "Token has expired", "error": "token_expired"}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    print(f"JWT Error: Invalid token - {error}")
    return jsonify({"msg": "Signature verification failed", "error": "invalid_token"}), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    print(f"JWT Error: Missing token - {error}")
    return jsonify({"msg": "Request does not contain an access token", "error": "authorization_required"}), 401

with app.app_context():
    db.create_all()

# Relaxed CORS for development
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

app.register_blueprint(main_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api/auth')

@app.route('/')
def home():
    return "AI Research Agent Backend is Running!"

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
