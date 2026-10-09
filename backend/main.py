from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="CampusSafe API")

# Add CORS middleware to allow requests from the Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # We will restrict this to the Vercel URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    """
    Health check endpoint to wake up Render instances.
    """
    return {"status": "healthy"}
