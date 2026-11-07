"""
Flask application entry point for Smart Campus Lost and Found System.
Oracle SQL backend with REST API.
"""
from flask import Flask
from flask_cors import CORS
from config import Config
from routes.auth import auth_bp
from routes.items import items_bp
from routes.claims import claims_bp
from routes.admin import admin_bp

app = Flask(__name__)
app.config.from_object(Config)
CORS(app, supports_credentials=True)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(items_bp, url_prefix='/api/items')
app.register_blueprint(claims_bp, url_prefix='/api/claims')
app.register_blueprint(admin_bp, url_prefix='/api/admin')


@app.route('/api/health')
def health():
    return {'status': 'ok', 'service': 'Campus Lost & Found API'}, 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
