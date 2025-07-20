# 📚 MRM Documents Hub

Welcome to the **Model Risk Management Documents Hub**! 🎉 This is where all your MRM magic happens - think of it as your personal library of risk management wisdom that our AI assistant can read and learn from.

## 🚀 What's This All About?

Imagine having a super-smart assistant that can read through all your MRM documents and answer questions like a seasoned risk management expert. That's exactly what we've built here! 

### ✨ The Magic Behind the Scenes

When you drop a PDF in this folder, our AI system:
1. **📖 Reads** your documents using PyMuPDF (it's like having super-powered reading glasses)
2. **✂️ Chops** them into digestible chunks (750 tokens each - perfect for AI brain food)
3. **🧠 Learns** from them using OpenAI's fancy embedding model
4. **🗄️ Stores** all that knowledge in a super-fast vector database
5. **💡 Answers** your questions with context from your actual documents!

## 🎯 How to Use This Awesome Feature

### 📁 Adding Your Documents

**Step 1**: Find your MRM PDFs (the more the merrier!)
**Step 2**: Drop them right here in this `docs/` folder
**Step 3**: Watch the magic happen! ✨

```bash
# Your documents go here:
docs/
├── your_mrm_guidelines.pdf
├── risk_assessment_framework.pdf
├── regulatory_compliance_guide.pdf
└── model_validation_standards.pdf
```

### 🔧 Processing Your Documents

Once you've added your PDFs, the system will automatically process them. But if you want to be fancy and do it manually:

```bash
# Process all documents in the folder
curl -X POST http://localhost:8000/api/process_documents

# Or upload a specific document
curl -X POST -F "file=@your_document.pdf" http://localhost:8000/api/upload_pdf
```

### 🎤 Asking Questions

Now for the fun part! Ask your AI assistant anything about your MRM documents:

```bash
# Ask about model validation
curl -X POST http://localhost:8000/api/rag_query \
  -H "Content-Type: application/json" \
  -d '{"question": "What are the key steps in model validation?"}'

# Ask about regulatory compliance
curl -X POST http://localhost:8000/api/rag_query \
  -H "Content-Type: application/json" \
  -d '{"question": "How do we ensure SR 11-7 compliance?"}'
```

## 🛠️ API Endpoints (The Technical Stuff)

| Endpoint | What It Does | Cool Factor |
|----------|-------------|-------------|
| `POST /api/upload_pdf` | Uploads and processes a new PDF | 🚀 |
| `POST /api/process_documents` | Processes all docs in the folder | ⚡ |
| `GET /api/documents` | Lists all your uploaded documents | 📋 |
| `POST /api/rag_query` | Asks questions about your documents | 🧠 |
| `GET /api/system_info` | Shows system status and stats | 📊 |
| `DELETE /api/documents/{filename}` | Removes a document (if needed) | 🗑️ |

## 🎨 What Makes This Special

### 🧠 Smart Processing
- **Intelligent Chunking**: Documents are split into meaningful pieces, not random chunks
- **Context-Aware Retrieval**: The AI finds the most relevant information for your questions
- **Professional Responses**: Tailored specifically for Model Risk Management

### 🚀 Performance Features
- **Lightning Fast**: Vector search is super quick
- **Scalable**: Handles documents of any size
- **Persistent**: Your knowledge base stays intact between sessions

### 🎯 MRM-Focused
- **Regulatory Aware**: Knows about SR 11-7, Basel III, CCAR/DFAST
- **Risk Terminology**: Speaks the language of risk management
- **Best Practices**: Incorporates industry standards and guidelines

## 📊 System Specs (For the Tech Nerds)

- **Vector Store**: Qdrant (local storage, no cloud dependencies!)
- **Embedding Model**: OpenAI text-embedding-3-small
- **Chunk Size**: 750 tokens (optimized for context and performance)
- **Retrieval**: Top 8 most relevant chunks per query
- **Processing**: Handles documents of any size automatically

## 🎪 Sample Documents

We've included a sample MRM guidelines document to get you started:
- `sample_mrm_guidelines.md` - A comprehensive guide covering everything from governance to validation

**Pro Tip**: Convert this to PDF and upload it to test the system!

## 🚨 Troubleshooting (When Things Go Sideways)

### 🤔 "My documents aren't processing"
- Check that they're actual PDF files
- Make sure the files aren't corrupted
- Verify the API is running

### 😵 "The AI isn't finding relevant information"
- Try rephrasing your question
- Make sure your documents contain the information you're looking for
- Check that documents were processed successfully

### 🐌 "Everything is running slow"
- Large documents take time to process (that's normal!)
- The first query might be slower as the system warms up
- Check your internet connection for API calls

## 🎉 Success Stories

Once you've got this running, you'll be able to:
- ✅ Ask complex MRM questions and get instant, accurate answers
- ✅ Reference specific sections of your documents
- ✅ Get regulatory guidance based on your actual policies
- ✅ Validate models against your organization's standards
- ✅ Impress your colleagues with your AI-powered risk insights

## 🚀 Ready to Rock?

1. **Add your PDFs** to this folder
2. **Start the API** (it should already be running)
3. **Ask away**! Your AI assistant is ready to help

Remember: The more quality documents you add, the smarter your AI assistant becomes! 🧠✨

---

**Happy Document Processing! 📚✨** 