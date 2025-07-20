<div align="center">
  <img src="https://img.shields.io/badge/Model%20Risk%20Manager-AI%20Powered-blue?style=for-the-badge&logo=shield" alt="Model Risk Manager" />
  <h1>🤖 Model Risk Manager</h1>
  <p><strong>AI-Powered Model Risk Management Assistant</strong></p>
  <p>Your intelligent companion for Model Risk Management queries, document analysis, and regulatory compliance guidance.</p>
  
  [![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green.svg)](https://fastapi.tiangolo.com)
  [![Next.js](https://img.shields.io/badge/Next.js-15.3+-black.svg)](https://nextjs.org)
  [![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-purple.svg)](https://openai.com)
  [![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
</div>

---

## 🎯 What is Model Risk Manager?

Model Risk Manager is a sophisticated AI-powered application designed to assist financial institutions, risk managers, and compliance officers with Model Risk Management (MRM) queries. It leverages advanced RAG (Retrieval-Augmented Generation) technology to provide accurate, context-aware responses based on comprehensive MRM documentation and regulatory frameworks.

### ✨ Key Features

- **📚 Intelligent Document Processing**: Upload and analyze MRM documents with advanced PDF processing
- **🔍 RAG-Powered Q&A**: Get precise answers from your MRM knowledge base using vector search
- **📋 Regulatory Compliance**: Access guidance on SR 11-7, Basel III, CCAR/DFAST, and other frameworks
- **🔄 Real-time Document Indexing**: Dynamic document processing with chunking and embedding
- **🎨 Modern Web Interface**: Clean, responsive UI built with Next.js and Tailwind CSS
- **⚡ Fast API Backend**: High-performance FastAPI server with streaming responses
- **🔒 Secure Processing**: Ephemeral document processing with no persistent storage

---

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   RAG System    │
│   (Next.js)     │◄──►│   (FastAPI)     │◄──►│   (LangGraph)   │
│                 │    │                 │    │                 │
│ • Chat Interface│    │ • REST API      │    │ • Document      │
│ • File Upload   │    │ • PDF Processing│    │   Processing    │
│ • Real-time     │    │ • Streaming     │    │ • Vector Search │
│   Responses     │    │   Responses     │    │ • Context       │
└─────────────────┘    └─────────────────┘    │   Generation    │
                                              └─────────────────┘
                                                       │
                                              ┌─────────────────┐
                                              │   Vector Store  │
                                              │   (Qdrant/FAISS)│
                                              └─────────────────┘
```

### 🔧 Technology Stack

**Backend:**
- **FastAPI** - High-performance web framework
- **LangGraph** - Workflow orchestration for RAG
- **LangChain** - LLM integration and document processing
- **OpenAI** - GPT-4o-mini for intelligent responses
- **Qdrant/FAISS** - Vector database for semantic search
- **PyMuPDF** - PDF document processing

**Frontend:**
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons

**Infrastructure:**
- **Vercel** - Deployment platform
- **Python 3.11+** - Backend runtime
- **Node.js** - Frontend runtime

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher
- OpenAI API key
- Git

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Model_Risk_Manager
```

### 2. Backend Setup

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -e .

# Set up environment variables
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd api
uvicorn app:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` to access the application!

---

## 📖 Usage Guide

### 🤖 Chat with MRM Knowledge Base

1. **Ask Questions**: Type your MRM-related questions in the chat interface
2. **Get Contextual Answers**: Receive responses based on your uploaded documents and built-in MRM guidelines
3. **Streaming Responses**: Watch answers generate in real-time

### 📄 Upload Documents

1. **Drag & Drop**: Upload PDF documents directly to the interface
2. **Automatic Processing**: Documents are automatically chunked, embedded, and indexed
3. **Instant Availability**: Start querying your documents immediately after upload

### 🎯 Supported Topics

- **Model Validation**: Best practices, frameworks, and methodologies
- **Risk Governance**: Three lines of defense, committees, and oversight
- **Regulatory Compliance**: SR 11-7, Basel III, CCAR/DFAST guidance
- **Data Management**: Quality standards, governance, and lineage
- **Technology Infrastructure**: System requirements and tools
- **Training & Competency**: Skill requirements and development programs

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
MODEL_NAME=gpt-4o-mini
EMBEDDING_MODEL=text-embedding-3-small
CHUNK_SIZE=750
CHUNK_OVERLAP=0
VECTOR_STORE_TYPE=qdrant
```

### API Configuration

The backend API supports the following endpoints:

- `POST /api/chat` - General chat with MRM knowledge
- `POST /api/upload_pdf` - Upload and index PDF documents
- `POST /api/pdf_chat` - Chat with specific uploaded documents
- `GET /api/health` - Health check endpoint

---

## 🏗️ Development

### Project Structure

```
Model_Risk_Manager/
├── api/                    # FastAPI backend
│   ├── app.py             # Main API application
│   ├── rag_system.py      # RAG implementation
│   └── requirements.txt   # Python dependencies
├── frontend/              # Next.js frontend
│   ├── src/app/          # App router pages
│   ├── package.json      # Node.js dependencies
│   └── next.config.ts    # Next.js configuration
├── docs/                  # MRM documentation
│   ├── sample_mrm_guidelines.md
│   └── pub-ch-model-risk.pdf
├── pyproject.toml        # Python project configuration
└── vercel.json           # Vercel deployment config
```

### Adding New Features

1. **Backend Changes**: Modify files in the `api/` directory
2. **Frontend Changes**: Update components in `frontend/src/app/`
3. **Documentation**: Add new MRM documents to the `docs/` directory
4. **Testing**: Use the provided test files for validation

### Code Style

- **Python**: Follow PEP 8 guidelines
- **TypeScript**: Use strict mode and proper typing
- **React**: Use functional components with hooks
- **Documentation**: Maintain comprehensive docstrings

---

## 🚀 Deployment

### Vercel Deployment

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Configure Build Settings**:
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/.next`
   - Install Command: `cd frontend && npm install`
3. **Set Environment Variables**: Add your `OPENAI_API_KEY` in Vercel dashboard
4. **Deploy**: Push to main branch for automatic deployment

### Environment Variables for Production

```env
OPENAI_API_KEY=your_production_openai_key
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Write clear, documented code
- Add tests for new features
- Follow the existing code style
- Update documentation as needed
- Ensure all tests pass before submitting

---

## 📚 Documentation

- **[API Documentation](api/README.md)** - Backend API reference
- **[Frontend Guide](frontend/README.md)** - Frontend development guide
- **[RAG System](PDF_RAG_README.md)** - Detailed RAG implementation
- **[Deployment Guide](MERGE.md)** - Deployment and merge instructions

---

## 🐛 Troubleshooting

### Common Issues

**OpenAI API Errors:**
- Verify your API key is correct and has sufficient credits
- Check rate limits and usage quotas

**PDF Upload Issues:**
- Ensure files are valid PDFs
- Check file size limits (recommended: < 50MB)
- Verify document is not password-protected

**Vector Store Errors:**
- Clear vector store cache if indexing fails
- Check available disk space
- Verify Qdrant/FAISS installation

### Getting Help

1. Check the [FAQ](FAQandCommonIssues.md)
2. Review existing [issues](../../issues)
3. Create a new issue with detailed error information

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **OpenAI** for providing the GPT models and embeddings
- **LangChain** for the excellent RAG framework
- **FastAPI** for the high-performance web framework
- **Next.js** for the React framework
- **Vercel** for seamless deployment

---

<div align="center">
  <p>Made with ❤️ for the Model Risk Management community</p>
  <p>
    <a href="#-what-is-model-risk-manager">Back to top</a>
  </p>
</div>
