"""
WSGI configuration for PythonAnywhere deployment
"""

from app import app

if __name__ == "__main__":
    app.run()