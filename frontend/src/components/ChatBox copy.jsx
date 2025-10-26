import React, { useState, useEffect } from "react";
import { uploadPdf, askQuestion } from "../utils/api";
import Loader from "./Loader";
import { Document, Page, pdfjs } from "react-pdf";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import {
  renderAnswerWithCitations,
  attachCitationClickHandler,
  highlightPageText,
} from "../utils/enhancedCitationUtils";
import "../App.css";
import "../styles/citation-highlighting.css";

//pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

export default function ChatBox() {
  const [file, setFile] = useState(null);
  const [documentId, setDocumentId] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [citations, setCitations] = useState([]);
  const [pdfUrl, setPdfUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [numPages, setNumPages] = useState(0);

  /** -----------------------------
   *  Upload PDF
   * ----------------------------*/
  const handleUpload = async () => {
    if (!file) return alert("Select a PDF first");
    setLoading(true);
    try {
      const res = await uploadPdf(file);
      setDocumentId(res.file);
      setPdfUrl(URL.createObjectURL(file));
      alert(`✅ Uploaded: ${res.file}`);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  /** -----------------------------
   *  Ask Question
   * ----------------------------*/
  const handleAsk = async () => {
    if (!question) return alert("Type a question");
    if (!documentId) return alert("Upload a PDF first");
    setLoading(true);
    try {
      const res = await askQuestion(question, documentId);
      setAnswer(res.answer || "No answer found");
      setCitations(res.citations || []);
    } catch (err) {
      console.error("Ask error:", err);
      alert("Error getting answer");
    } finally {
      setLoading(false);
    }
  };

  /** -----------------------------
   *  Handle Citation Clicks
   * ----------------------------*/
  useEffect(() => {
    attachCitationClickHandler((page) => {
      const el = document.querySelector(
        `.react-pdf__Page[data-page-number="${page}"]`
      );
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
        <p style={{ textAlign: "center" }}>
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
            style={{ flexGrow: 1, maxWidth: "400px" }}
          />
          <button onClick={handleAsk}>Ask</button>
        </div>

        {loading && <Loader />}

        {/* Answer Box */}
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
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              loading={<p>Loading PDF...</p>}
            >
              {Array.from({ length: numPages }, (_, i) => (
                <Page
                  key={i + 1}
                  pageNumber={i + 1}
                  renderTextLayer
                  renderAnnotationLayer={false}
                  data-page-number={i + 1}
                />
              ))}
            </Document>
          </div>
        )}
      </div>
    </div>
  );
}
