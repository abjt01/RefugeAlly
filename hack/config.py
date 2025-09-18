import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Application settings
DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
SECRET_KEY = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key-change-in-production')
PORT = int(os.getenv('PORT', 5000))
HOST = os.getenv('HOST', '0.0.0.0')

# Gemini API Configuration (replacing OpenAI)
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

# Other settings with defaults
MAX_FILE_SIZE = int(os.getenv('MAX_FILE_SIZE', 10485760))
ENABLE_VOICE_INPUT = os.getenv('ENABLE_VOICE_INPUT', 'True').lower() == 'true'
