# Structure By PVNAKUM
ai-pdf-citation-system/
├── backend/                     # 🧠 Node.js + Express + PDF Processing (Server)
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   ├── lib/
│   │   ├── pdfProcessor.js      # PDF text + coordinate extractor
│   │   ├── langchainHelper.js   # (optional) LangChain chunking/vector helper
│   │   └── utils/
│   │       ├── logger.js
│   │       └── textUtils.js
│   ├── routes/
│   │   ├── upload.js            # Handles PDF upload -> processing
│   │   ├── ask.js               # Handles question answering
│   │   └── index.js             # Combines routes
│   ├── controllers/
│   │   ├── pdfController.js     # Wrapper for pdfProcessor usage
│   │   ├── chatController.js    # Q&A + citation generation logic
│   │   └── citationController.js# Optional: PDF page highlighting endpoints
│   ├── services/
│   │   ├── openaiService.js     # Handles API calls to OpenAI or other LLM
│   │   ├── embeddingService.js  # Creates and retrieves document embeddings
│   │   └── storageService.js    # Optional: Firebase / Local storage handler
│   ├── data/
│   │   ├── uploads/             # PDF upload storage
│   │   ├── vectors/             # Vectorized embeddings (if local)
│   │   └── cache/
│   └── README.md
│
├── frontend/                    # 💻 React + Vite + PDF Viewer (Client)
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── public/
│   │   ├── pdf.worker.min.js    # PDF.js worker
│   │   ├── favicon.ico
│   │   └── vite.svg
│   ├── src/
│   │   ├── main.jsx             # React entry point
│   │   ├── App.jsx              # App root component
│   │   ├── components/
│   │   │   ├── ChatBox.jsx      # Chat UI (Q&A + responses)
│   │   │   ├── PdfViewer.jsx    # Renders PDF using react-pdf
│   │   │   ├── CitationPanel.jsx# Shows list of all citations
│   │   │   ├── Loader.jsx
│   │   │   └── Header.jsx
│   │   ├── utils/
│   │   │   ├── api.js           # API calls to backend
│   │   │   ├── enhancedCitationUtils.js # Highlight + clickable logic
│   │   │   ├── highlightUtils.js# Optional advanced highlighting
│   │   │   └── textMatchUtils.js# Fuzzy match helpers
│   │   ├── styles/
│   │   │   ├── App.css
│   │   │   ├── ChatBox.css
│   │   │   ├── PdfViewer.css
│   │   │   ├── citation-highlighting.css
│   │   │   └── theme.css
│   │   ├── context/
│   │   │   ├── ChatContext.jsx
│   │   │   └── PdfContext.jsx
│   │   └── hooks/
│   │       ├── useChat.js
│   │       └── useHighlight.js
│   └── README.md
│
├── docs/                        # 📚 Project documentation
│   ├── CLICKABLE_CITATIONS_GUIDE.md
│   ├── COMPREHENSIVE_CITATION_SYSTEM.md
│   ├── DEVELOPER_HANDBOOK.md
│   ├── EXECUTIVE_SUMMARY.md
│   ├── INTEGRATION_GUIDE.md
│   ├── INTEGRATION_COMPLETE.md
│   ├── LANGCHAIN_INTEGRATION.md
│   └── FINAL_FIX_CONFIRMATION.md
│
├── scripts/
│   ├── integrate_enhancements.sh
│   └── deploy.sh
│
└── README.md                    # Root overview (setup + run commands)




# ⚙️ BACKEND EXPLANATION:
Folder / File	Purpose
server.js	Main entry point (Express setup, routes, middlewares).
lib/pdfProcessor.js	Handles all PDF extraction (text + coordinates) using pdfjs-dist & pdf-parse.
routes/	API route definitions (upload, ask, healthcheck).
controllers/	Core logic for each route (process PDF, handle LLM Q&A, manage citations).
services/	API integration helpers (OpenAI, embeddings, file storage).
data/uploads/	Temporarily stores uploaded PDFs.
data/vectors/	Stores pre-computed embeddings if not using Firebase or Pinecone.
lib/langchainHelper.js	Optional: LangChain embedding + document chunk management.


# 💻 FRONTEND EXPLANATION:
Folder / File	Purpose
App.jsx	Root component – loads ChatBox and PdfViewer.
components/ChatBox.jsx	Displays Q&A interface (question input, AI answers with citations).
components/PdfViewer.jsx	Renders PDF pages and supports highlighting.
utils/enhancedCitationUtils.js	Adds clickable citations + highlight overlay logic.
styles/citation-highlighting.css	Defines highlight overlay styling.
utils/api.js	Abstracts backend calls (/upload, /ask).
context/ChatContext.jsx	Provides shared message/citation state.
hooks/useHighlight.js	Manages highlight logic.
public/pdf.worker.min.js	Required worker file for react-pdf.





🧠 Data Flow (End-to-End):
[Frontend] User uploads PDF
        ↓
POST /upload
        ↓
[Backend] pdfProcessor.js extracts text + coordinates
        ↓
Chunks + Positions stored in memory or DB
        ↓
User asks a question → POST /ask
        ↓
LLM generates answer + citations (chunk references)
        ↓
Frontend renders [1], [2] links (processCitationsInText)
        ↓
User clicks [1] → highlightOnPage() → PDF page scroll + overlay highlight


🚀 STARTUP COMMANDS
Backend
    cd backend
    npm install
    npm start     # runs server.js

Frontend
    cd frontend
    npm install
    npm run dev   # launches Vite dev server


Open:
🔗 Frontend → http://localhost:5173

🔗 Backend → http://localhost:5000
 (or your configured port)



# Optional Integrations enhancement:

 | Feature                  | Where to integrate                        | Reference Doc                    |
| ------------------------ | ----------------------------------------- | -------------------------------- |
| LangChain Embeddings     | `backend/lib/langchainHelper.js`          | LANGCHAIN_INTEGRATION.md         |
| Citation Refinement      | `frontend/utils/enhancedCitationUtils.js` | CLICKABLE_CITATIONS_GUIDE.md     |
| AI Context Optimization  | `backend/controllers/chatController.js`   | COMPREHENSIVE_CITATION_SYSTEM.md |
| Logging & Error Recovery | `backend/lib/utils/logger.js`             | DEVELOPER_HANDBOOK.md            |
