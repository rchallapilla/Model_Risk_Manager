# MRM Documents Directory

This directory contains Model Risk Management (MRM) documents that will be processed by the RAG (Retrieval-Augmented Generation) system.

## Usage

### Adding Documents

1. **PDF Files**: Place PDF documents directly in this directory
2. **Supported Formats**: Currently supports PDF files only
3. **Naming**: Use descriptive names for easy identification

### Document Processing

The RAG system will automatically:
1. **Load** documents using PyMuPDF
2. **Chunk** documents into smaller segments (750 tokens by default)
3. **Embed** chunks using OpenAI's text-embedding-3-small model
4. **Store** embeddings in Qdrant vector database

### API Endpoints

- `POST /api/upload_pdf` - Upload and process a new PDF
- `POST /api/process_documents` - Process all documents in the directory
- `GET /api/documents` - List all uploaded documents
- `POST /api/rag_query` - Query the RAG system with document context

### Sample Documents

- `sample_mrm_guidelines.md` - Comprehensive MRM guidelines (convert to PDF for testing)

## Best Practices

1. **Document Quality**: Ensure documents are clear and well-structured
2. **File Size**: Large documents will be automatically chunked
3. **Content**: Focus on MRM-related content for best results
4. **Updates**: Re-process documents after significant changes

## System Information

- **Vector Store**: Qdrant (local storage)
- **Embedding Model**: text-embedding-3-small
- **Chunk Size**: 750 tokens (configurable)
- **Retrieval**: Top 8 most relevant chunks per query

## Troubleshooting

- **Processing Errors**: Check document format and size
- **Query Issues**: Ensure documents have been processed first
- **Performance**: Monitor chunk sizes and retrieval parameters 