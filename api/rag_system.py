"""
Comprehensive RAG System for Model Risk Management
Handles document processing, chunking, embedding, and retrieval using LangGraph
"""

import os
import json
import logging
from typing import List, Dict, Any, Optional
from pathlib import Path
import tiktoken
from datetime import datetime

# LangChain imports
from langchain_community.document_loaders import DirectoryLoader, PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Qdrant, FAISS
from langchain_core.documents import Document
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import LLMChainExtractor

# LangGraph imports
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MRMRAGSystem:
    """
    Comprehensive RAG System for Model Risk Management
    """
    
    def __init__(self, docs_dir: str = "docs", vector_store_path: str = "vector_storage"):
        self.docs_dir = Path(docs_dir)
        self.vector_store_path = Path(vector_store_path)
        self.vector_store_path.mkdir(exist_ok=True)
        
        # Initialize components
        self.embedding_model = OpenAIEmbeddings(model="text-embedding-3-small")
        self.llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
        
        # Initialize vector store
        self.vector_store = None
        self.retriever = None
        
        # Initialize LangGraph
        self.workflow = self._create_workflow()
        
        logger.info("MRM RAG System initialized")
    
    def _create_workflow(self) -> StateGraph:
        """
        Create LangGraph workflow for RAG processing
        """
        # Define the state schema
        class RAGState:
            def __init__(self, query: str = "", documents: List[Document] = None, 
                         context: str = "", answer: str = "", metadata: Dict = None):
                self.query = query
                self.documents = documents or []
                self.context = context
                self.answer = answer
                self.metadata = metadata or {}
        
        # Create the workflow graph
        workflow = StateGraph(RAGState)
        
        # Add nodes
        workflow.add_node("retrieve", self._retrieve_documents)
        workflow.add_node("contextualize", self._contextualize_query)
        workflow.add_node("generate", self._generate_answer)
        
        # Define edges
        workflow.set_entry_point("retrieve")
        workflow.add_edge("retrieve", "contextualize")
        workflow.add_edge("contextualize", "generate")
        workflow.add_edge("generate", END)
        
        return workflow.compile()
    
    def _retrieve_documents(self, state: Any) -> Dict:
        """
        Retrieve relevant documents from vector store
        """
        if not self.retriever:
            return {"documents": [], "metadata": {"error": "No retriever initialized"}}
        
        try:
            docs = self.retriever.get_relevant_documents(state.query)
            return {
                "documents": docs,
                "metadata": {
                    "retrieved_count": len(docs),
                    "timestamp": datetime.now().isoformat()
                }
            }
        except Exception as e:
            logger.error(f"Error retrieving documents: {e}")
            return {"documents": [], "metadata": {"error": str(e)}}
    
    def _contextualize_query(self, state: Any) -> Dict:
        """
        Contextualize the query with retrieved documents
        """
        if not state.documents:
            return {"context": "No relevant documents found."}
        
        # Create context from documents
        context_parts = []
        for i, doc in enumerate(state.documents[:5]):  # Limit to top 5 docs
            context_parts.append(f"Document {i+1}:\n{doc.page_content}\n")
        
        context = "\n".join(context_parts)
        return {"context": context}
    
    def _generate_answer(self, state: Any) -> Dict:
        """
        Generate answer using LLM with context - STRICTLY MRM-focused
        """
        try:
            # Check if we have relevant context
            if not state.context or state.context.strip() == "No relevant documents found.":
                return {
                    "answer": "I apologize, but I can only answer questions related to Model Risk Management (MRM) based on the documents I have access to. Your question appears to be outside the scope of my MRM knowledge base. Please ask a question specifically about Model Risk Management, model validation, risk governance, regulatory compliance (SR 11-7, Basel III, CCAR/DFAST), or other MRM-related topics that are covered in my document collection."
                }
            
            prompt = f"""
            You are a specialized Model Risk Management (MRM) AI assistant. You can ONLY answer questions that are:
            1. Directly related to Model Risk Management
            2. Covered in the provided document context
            3. About regulatory compliance (SR 11-7, Basel III, CCAR/DFAST, etc.)
            4. Related to model validation, governance, or risk assessment
            5. About MRM frameworks, policies, or procedures

            CRITICAL RULES:
            - If the question is NOT about MRM or NOT covered in the context, respond with: "I can only answer questions related to Model Risk Management based on my available documents. Please ask a question about MRM topics, model validation, risk governance, or regulatory compliance."
            - Only use information from the provided context
            - Do not provide general knowledge outside the context
            - Do not answer questions about other topics (coding, general AI, etc.)
            - Be specific and reference the document content

            Available Context from MRM Documents:
            {state.context}

            User Question: {state.query}

            Instructions:
            1. First, determine if this is an MRM-related question
            2. Check if the context contains relevant information
            3. If YES to both: Provide a detailed, professional MRM answer
            4. If NO to either: Politely decline and redirect to MRM topics
            5. Always cite specific information from the context when possible
            6. Use professional MRM terminology and frameworks

            Answer:
            """
            
            response = self.llm.invoke([HumanMessage(content=prompt)])
            return {"answer": response.content}
        except Exception as e:
            logger.error(f"Error generating answer: {e}")
            return {"answer": f"Error generating response: {str(e)}"}
    
    def load_documents(self, file_paths: Optional[List[str]] = None) -> List[Document]:
        """
        Load documents from the docs directory or specific file paths
        """
        documents = []
        
        if file_paths:
            # Load specific files
            for file_path in file_paths:
                if file_path.lower().endswith('.pdf'):
                    try:
                        loader = PyMuPDFLoader(file_path)
                        docs = loader.load()
                        documents.extend(docs)
                        logger.info(f"Loaded {len(docs)} pages from {file_path}")
                    except Exception as e:
                        logger.error(f"Error loading {file_path}: {e}")
        else:
            # Load all PDFs from docs directory
            if self.docs_dir.exists():
                try:
                    directory_loader = DirectoryLoader(
                        str(self.docs_dir), 
                        glob="**/*.pdf", 
                        loader_cls=PyMuPDFLoader
                    )
                    documents = directory_loader.load()
                    logger.info(f"Loaded {len(documents)} documents from {self.docs_dir}")
                except Exception as e:
                    logger.error(f"Error loading documents from directory: {e}")
        
        return documents
    
    def chunk_documents(self, documents: List[Document], chunk_size: int = 750, 
                       chunk_overlap: int = 0) -> List[Document]:
        """
        Chunk documents using RecursiveCharacterTextSplitter
        """
        def tiktoken_len(text: str) -> int:
            """Calculate token length using tiktoken"""
            tokens = tiktoken.encoding_for_model("gpt-4o").encode(text)
            return len(tokens)
        
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=tiktoken_len,
            separators=["\n\n", "\n", " ", ""]
        )
        
        try:
            chunks = text_splitter.split_documents(documents)
            logger.info(f"Created {len(chunks)} chunks from {len(documents)} documents")
            
            # Verify chunk sizes
            max_chunk_length = max(tiktoken_len(chunk.page_content) for chunk in chunks)
            logger.info(f"Maximum chunk length: {max_chunk_length} tokens")
            
            return chunks
        except Exception as e:
            logger.error(f"Error chunking documents: {e}")
            return []
    
    def create_vector_store(self, chunks: List[Document], 
                          store_type: str = "qdrant") -> bool:
        """
        Create and store embeddings in vector database
        """
        try:
            if store_type == "qdrant":
                # Use Qdrant for vector storage
                self.vector_store = Qdrant.from_documents(
                    documents=chunks,
                    embedding=self.embedding_model,
                    location=str(self.vector_store_path / "qdrant_db")
                )
            elif store_type == "faiss":
                # Use FAISS for vector storage
                self.vector_store = FAISS.from_documents(
                    documents=chunks,
                    embedding=self.embedding_model
                )
                # Save FAISS index
                self.vector_store.save_local(str(self.vector_store_path / "faiss_index"))
            
            # Create retriever with contextual compression
            compressor = LLMChainExtractor.from_llm(self.llm)
            self.retriever = ContextualCompressionRetriever(
                base_retriever=self.vector_store.as_retriever(
                    search_type="similarity",
                    search_kwargs={"k": 8}
                ),
                base_compressor=compressor
            )
            
            logger.info(f"Vector store created successfully with {len(chunks)} chunks")
            return True
            
        except Exception as e:
            logger.error(f"Error creating vector store: {e}")
            return False
    
    def load_existing_vector_store(self, store_type: str = "qdrant") -> bool:
        """
        Load existing vector store from disk
        """
        try:
            if store_type == "qdrant":
                if (self.vector_store_path / "qdrant_db").exists():
                    self.vector_store = Qdrant(
                        client=None,  # Will use local storage
                        collection_name="mrm_documents",
                        embedding_function=self.embedding_model,
                        location=str(self.vector_store_path / "qdrant_db")
                    )
            elif store_type == "faiss":
                faiss_path = self.vector_store_path / "faiss_index"
                if faiss_path.exists():
                    self.vector_store = FAISS.load_local(
                        str(faiss_path), 
                        self.embedding_model
                    )
            
            if self.vector_store:
                # Create retriever
                compressor = LLMChainExtractor.from_llm(self.llm)
                self.retriever = ContextualCompressionRetriever(
                    base_retriever=self.vector_store.as_retriever(
                        search_type="similarity",
                        search_kwargs={"k": 8}
                    ),
                    base_compressor=compressor
                )
                logger.info("Existing vector store loaded successfully")
                return True
            else:
                logger.warning("No existing vector store found")
                return False
                
        except Exception as e:
            logger.error(f"Error loading vector store: {e}")
            return False
    
    def process_documents(self, file_paths: Optional[List[str]] = None, 
                         chunk_size: int = 750, store_type: str = "qdrant") -> bool:
        """
        Complete document processing pipeline
        """
        try:
            # Step 1: Load documents
            logger.info("Step 1: Loading documents...")
            documents = self.load_documents(file_paths)
            if not documents:
                logger.error("No documents loaded")
                return False
            
            # Step 2: Chunk documents
            logger.info("Step 2: Chunking documents...")
            chunks = self.chunk_documents(documents, chunk_size)
            if not chunks:
                logger.error("No chunks created")
                return False
            
            # Step 3: Create vector store
            logger.info("Step 3: Creating vector store...")
            success = self.create_vector_store(chunks, store_type)
            
            if success:
                logger.info("Document processing completed successfully")
                return True
            else:
                logger.error("Failed to create vector store")
                return False
                
        except Exception as e:
            logger.error(f"Error in document processing pipeline: {e}")
            return False
    
    def query(self, question: str) -> Dict[str, Any]:
        """
        Query the RAG system using LangGraph workflow
        """
        try:
            # Initialize state
            initial_state = {
                "query": question,
                "documents": [],
                "context": "",
                "answer": "",
                "metadata": {}
            }
            
            # Run the workflow
            result = self.workflow.invoke(initial_state)
            
            return {
                "answer": result.answer,
                "context": result.context,
                "documents_retrieved": len(result.documents),
                "metadata": result.metadata,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in RAG query: {e}")
            return {
                "answer": f"Error processing query: {str(e)}",
                "context": "",
                "documents_retrieved": 0,
                "metadata": {"error": str(e)},
                "timestamp": datetime.now().isoformat()
            }
    
    def get_system_info(self) -> Dict[str, Any]:
        """
        Get system information and statistics
        """
        try:
            info = {
                "docs_directory": str(self.docs_dir),
                "vector_store_path": str(self.vector_store_path),
                "vector_store_type": "qdrant" if self.vector_store else "none",
                "retriever_initialized": self.retriever is not None,
                "embedding_model": "text-embedding-3-small",
                "llm_model": "gpt-4o-mini"
            }
            
            # Count documents in docs directory
            if self.docs_dir.exists():
                pdf_files = list(self.docs_dir.glob("**/*.pdf"))
                info["pdf_files_count"] = len(pdf_files)
                info["pdf_files"] = [str(f) for f in pdf_files]
            
            return info
            
        except Exception as e:
            logger.error(f"Error getting system info: {e}")
            return {"error": str(e)}

# Global instance
rag_system = MRMRAGSystem() 