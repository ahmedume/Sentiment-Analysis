from pydantic import BaseModel, Field
from typing import Optional

class PredictRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Input text for sentiment analysis")
    model: str = Field(default="svm", pattern="^(svm|lr|both)$", description="Model to use: svm, lr, or both")

class PredictResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[dict] = None

class HealthResponse(BaseModel):
    success: bool
    data: dict
