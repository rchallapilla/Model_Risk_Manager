"""
Enhanced FastAPI application with comprehensive RAG system using LangGraph
"""

from fastapi import FastAPI, HTTPException, Request, UploadFile, File
from fastapi.responses import StreamingResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import os
import shutil
import sys
from typing import Optional, List, Dict, Any
from pathlib import Path

# Import our RAG system
from rag_system import MRMRAGSystem

# Initialize FastAPI application
app = FastAPI(
    title="MRM AI Assistant API",
    description="Professional Model Risk Management AI Assistant with RAG capabilities",
    version="2.0.0"
)

# Get OpenAI API key from environment variable
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable is not set")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG system
rag_system = MRMRAGSystem()

# File upload directory
UPLOAD_DIR = Path("docs")
UPLOAD_DIR.mkdir(exist_ok=True)

# Pydantic models
class ChatRequest(BaseModel):
    user_message: str
    developer_message: Optional[str] = None
    model: Optional[str] = "gpt-4o-mini"

class RAGQueryRequest(BaseModel):
    question: str
    model: Optional[str] = "gpt-4o-mini"

class DocumentProcessRequest(BaseModel):
    chunk_size: Optional[int] = 750
    store_type: Optional[str] = "qdrant"
    file_paths: Optional[List[str]] = None

class SystemInfoResponse(BaseModel):
    docs_directory: str
    vector_store_path: str
    vector_store_type: str
    retriever_initialized: bool
    embedding_model: str
    llm_model: str
    pdf_files_count: int
    pdf_files: List[str]

# Health check endpoint
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "MRM AI Assistant API",
        "version": "2.0.0",
        "rag_system_ready": rag_system.retriever is not None
    }

# Main chat endpoint (streaming)
@app.post("/api/chat")
async def chat(request: ChatRequest):
    """Main chat endpoint with streaming response"""
    try:
        client = OpenAI(api_key=OPENAI_API_KEY)
        
        # Use developer message if provided, otherwise use strict MRM prompt
        system_message = request.developer_message or """You are a specialized Model Risk Management (MRM) AI assistant. 

CRITICAL RULES:
- You can ONLY answer questions related to Model Risk Management (MRM)
- You can ONLY provide information from your available MRM documents
- If a question is NOT about MRM or NOT covered in your documents, respond with: "I can only answer questions related to Model Risk Management based on my available documents. Please ask a question about MRM topics, model validation, risk governance, or regulatory compliance."
- Do not answer questions about coding, general AI, or other non-MRM topics
- Do not provide general knowledge outside your MRM document context
- Always be specific and reference your document content when possible

ACCEPTABLE TOPICS:
- Model Risk Management frameworks and policies
- Model validation and governance
- Regulatory compliance (SR 11-7, Basel III, CCAR/DFAST)
- Risk assessment and monitoring
- MRM best practices and procedures
- Model development standards
- Data quality and governance in MRM context

If the user asks about anything else, politely redirect them to MRM topics."""
        
        async def generate():
            stream = client.chat.completions.create(
                model=request.model,
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": request.user_message}
                ],
                stream=True
            )
            
            for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    yield chunk.choices[0].delta.content

        return StreamingResponse(generate(), media_type="text/plain")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Enhanced PDF upload endpoint
@app.post("/api/upload_pdf")
async def upload_pdf(file: UploadFile = File(...)):
    """Upload and process PDF documents"""
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
    
    try:
        # Save file to docs directory
        file_path = UPLOAD_DIR / file.filename
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Process the document using RAG system
        success = rag_system.process_documents(
            file_paths=[str(file_path)],
            chunk_size=750,
            store_type="qdrant"
        )
        
        if success:
            return {
                "filename": file.filename,
                "message": "PDF uploaded and processed successfully",
                "status": "processed",
                "file_path": str(file_path)
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to process PDF")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload PDF: {str(e)}")

# RAG query endpoint
@app.post("/api/rag_query")
async def rag_query(request: RAGQueryRequest):
    """Query the RAG system with document context"""
    try:
        if not rag_system.retriever:
            raise HTTPException(
                status_code=400, 
                detail="No documents have been processed yet. Please upload documents first."
            )
        
        # Query the RAG system
        result = rag_system.query(request.question)
        
        return {
            "answer": result["answer"],
            "context": result["context"],
            "documents_retrieved": result["documents_retrieved"],
            "metadata": result["metadata"],
            "timestamp": result["timestamp"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing RAG query: {str(e)}")

# Document processing endpoint
@app.post("/api/process_documents")
async def process_documents(request: DocumentProcessRequest):
    """Process documents in the docs directory"""
    try:
        success = rag_system.process_documents(
            file_paths=request.file_paths,
            chunk_size=request.chunk_size,
            store_type=request.store_type
        )
        
        if success:
            return {
                "message": "Documents processed successfully",
                "chunk_size": request.chunk_size,
                "store_type": request.store_type
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to process documents")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing documents: {str(e)}")

# System information endpoint
@app.get("/api/system_info")
async def get_system_info():
    """Get system information and statistics"""
    try:
        info = rag_system.get_system_info()
        return info
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting system info: {str(e)}")

# Load existing vector store endpoint
@app.post("/api/load_vector_store")
async def load_vector_store(store_type: str = "qdrant"):
    """Load existing vector store from disk"""
    try:
        success = rag_system.load_existing_vector_store(store_type)
        
        if success:
            return {
                "message": "Vector store loaded successfully",
                "store_type": store_type
            }
        else:
            raise HTTPException(
                status_code=404, 
                detail="No existing vector store found"
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading vector store: {str(e)}")

# List uploaded documents endpoint
@app.get("/api/documents")
async def list_documents():
    """List all uploaded documents"""
    try:
        if UPLOAD_DIR.exists():
            pdf_files = list(UPLOAD_DIR.glob("**/*.pdf"))
            documents = [
                {
                    "filename": f.name,
                    "path": str(f),
                    "size": f.stat().st_size,
                    "modified": f.stat().st_mtime
                }
                for f in pdf_files
            ]
            return {"documents": documents, "count": len(documents)}
        else:
            return {"documents": [], "count": 0}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing documents: {str(e)}")

# Delete document endpoint
@app.delete("/api/documents/{filename}")
async def delete_document(filename: str):
    """Delete a specific document"""
    try:
        file_path = UPLOAD_DIR / filename
        if file_path.exists() and file_path.suffix.lower() == '.pdf':
            file_path.unlink()
            return {"message": f"Document {filename} deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Document not found")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting document: {str(e)}")

# Legacy PDF chat endpoint for backward compatibility
@app.post("/api/pdf_chat")
async def pdf_chat(request: RAGQueryRequest):
    """Legacy PDF chat endpoint - redirects to RAG query"""
    return await rag_query(request)

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "service": "MRM AI Assistant API",
        "version": "2.0.0",
        "description": "Professional Model Risk Management AI Assistant with RAG capabilities",
        "endpoints": {
            "chat": "/api/chat",
            "rag_query": "/api/rag_query",
            "upload_pdf": "/api/upload_pdf",
            "process_documents": "/api/process_documents",
            "system_info": "/api/system_info",
            "documents": "/api/documents"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 