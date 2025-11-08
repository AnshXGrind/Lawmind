"""
Vercel-compatible ASGI application wrapper
"""
import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(__file__))

from main import app

# Vercel serverless function handler
def handler(request, context):
    return app(request, context)

# For direct import
__all__ = ['app', 'handler']
