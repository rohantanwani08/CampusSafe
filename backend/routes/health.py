from fastapi import APIRouter

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check():
    """
    Health check endpoint to wake up Render instances.
    """
    return {"status": "healthy"}
