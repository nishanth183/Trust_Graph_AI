import os
import uvicorn

# Import the existing TrustGraph AI FastAPI application
from backend.main import app as fastapi_app

try:
    import gradio as gr
    with gr.Blocks(title="TrustGraph AI Backend API") as demo:
        gr.Markdown("# 🛡️ TrustGraph AI — Production API Service")
        gr.Markdown("FastAPI evidentiary scam detection engine is active. Access `/docs` for interactive API documentation.")
    
    # Mount Gradio onto the existing FastAPI application
    app = gr.mount_gradio_app(fastapi_app, demo, path="/status")
except Exception:
    app = fastapi_app

if __name__ == "__main__":
    port = int(os.getenv("PORT", "7860"))
    uvicorn.run(app, host="0.0.0.0", port=port)
