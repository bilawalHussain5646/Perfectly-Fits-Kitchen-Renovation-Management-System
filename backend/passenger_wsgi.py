import sys
import os

# Add the application directory to the path FIRST
app_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, app_dir)

# Load environment variables from .env file if it exists
try:
    from dotenv import load_dotenv
    dotenv_path = os.path.join(app_dir, '.env')
    if os.path.exists(dotenv_path):
        load_dotenv(dotenv_path)
except ImportError:
    pass

# Import the Flask app
from app import app as application

# Required by Passenger
if __name__ == '__main__':
    application.run()
