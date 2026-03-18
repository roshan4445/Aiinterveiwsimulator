"""
AI Adaptive Interviewer - Flask Backend
Entry point: initializes and runs the Flask application.
"""

from flask import Flask
from flask_cors import CORS
from routes import register_routes
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Allow cross-origin requests from the React frontend
    CORS(app, resources={r"/api/*": {"origins": Config.CORS_ORIGINS}})

    # Register all API route blueprints
    register_routes(app)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)
