import os
from dotenv import load_dotenv
from app import create_app
from app.config import Config

load_dotenv()

app = create_app(Config)

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=True)
