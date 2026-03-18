"""
Route registration module.
Imports and registers all API blueprints onto the Flask app.
"""

from api.interview import interview_bp


def register_routes(app):
    """Register all route blueprints with URL prefix /api."""
    app.register_blueprint(interview_bp, url_prefix="/api")
