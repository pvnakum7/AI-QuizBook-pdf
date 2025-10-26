import React, { useState, useEffect } from "react";
import { uploadPdf, askQuestion } from "../utils/api";
import Loader from "./Loader";
import { Document, Page, pdfjs } from "react-pdf";
import {
  renderAnswerWithCitations,
  attachCitationClickHandler,
  highlightPageText,
} from "../utils/enhancedCitationUtils";
import "../App.css";
import "../styles/citation-highlighting.css";

// ✅ Proper worker setup for Vite + pdfjs-dist v4.4.168
// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   "pdfjs-dist/build/pdf.worker.min.mjs",
//   import.meta.url
// ).toString();

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function ChatBox() {
  const [file, setFile] = useState(null);
  const [documentId, setDocumentId] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [citations, setCitations] = useState([]);
  const [pdfUrl, setPdfUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [numPages, setNumPages] = useState(0);

  /** 📂 Upload PDF and load as Blob */
  const handleUpload = async () => {
    if (!file) return alert("Select a PDF first");
    setLoading(true);
    try {
      const res = await uploadPdf(file);
      setDocumentId(res.file);

      const backendBase = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      const fileUrl = `${backendBase}/data/${res.file}`;

      // ✅ Fetch file as blob to avoid CORS issues
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("PDF fetch failed");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      setPdfUrl(blobUrl);

      alert(`✅ Uploaded and ready: ${res.file}`);
    } catch (err) {
      console.error("❌ Upload or fetch failed:", err);
      alert("Upload failed or PDF fetch issue."+ err.message);
    } finally {
      setLoading(false);
    }
  };

  /** 💬 Ask a question using backend AI */
  const handleAsk = async () => {
    if (!question.trim()) return alert("Type a question");
    if (!documentId) return alert("Upload a PDF first");
    setLoading(true);
    try {
      const res = await askQuestion(question, documentId);
      setAnswer(res.answer || "No answer found");
      setCitations(res.citations || []);
    } catch (err) {
      console.error("❌ Ask error:", err);
      alert("Error getting answer"+ err.message);
    } finally {
      setLoading(false);
    }
  };

  /** 🧠 Handle citation click → scroll + highlight */
  useEffect(() => {
    attachCitationClickHandler((page) => {
      const el = document.querySelector(`.react-pdf__Page[data-page-number="${page}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        const citation = citations.find((c) => c.page === page);
        highlightPageText(el, citation);
      }
    });
  }, [citations]);

  return (
    <div className="app-wrapper">
      <div className="header">🤖 AI PDF Assistant</div>
      <div className="content-area">
        <p style={{ textAlign: "center", marginBottom: "20px" }}>
          Upload a PDF, then ask anything about it!
        </p>

        {/* Upload Section */}
        <div className="upload-section">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button onClick={handleUpload}>Upload</button>
        </div>

        {/* Question Section */}
        <div className="question-section">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question..."
            style={{
              flexGrow: 1,
              maxWidth: "400px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              padding: "8px",
            }}
          />
          <button onClick={handleAsk}>Ask</button>
        </div>

        {/* Loader */}
        {loading && <Loader />}

        {/* AI Answer */}
        {answer && (
          <div
            className="answer-box"
            dangerouslySetInnerHTML={{
              __html: renderAnswerWithCitations(answer, citations),
            }}
          />
        )}

        {/* PDF Viewer */}
        {pdfUrl && (
          <div className="pdf-viewer">
            <Document
              file={pdfUrl}
              loading={<p style={{ textAlign: "center" }}>Loading PDF...</p>}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              onLoadError={(err) => {
                console.error("❌ PDF load error:", err);
                alert("Failed to load PDF file."+  err.message);
              }}
            >
              {Array.from({ length: numPages }, (_, i) => (
                <Page
                  key={i + 1}
                  pageNumber={i + 1}
                  renderAnnotationLayer={false}
                  renderTextLayer={true}
                  width={1367}
                  data-page-number={i + 1}
                  className="pdf-page"
                />
              ))}
            </Document>
          </div>
        )}
      </div>
    </div>
  );
}
