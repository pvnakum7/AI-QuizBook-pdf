import React, { useState } from "react";
import { uploadPdf, askQuestion } from "./utils/api";
import PdfViewer from "./components/PdfViewer";

export default function App() {
  const [file, setFile] = useState(null);
  const [documentId, setDocumentId] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [citations, setCitations] = useState([]);
  const [pdfUrl, setPdfUrl] = useState("");

  const handleUpload = async () => {
    if (!file) return alert("Select a PDF first");
    const res = await uploadPdf(file);
    setDocumentId(res.file);
    setPdfUrl(URL.createObjectURL(file));
    alert(`✅ Uploaded ${res.file}`);
  };

  const handleAsk = async () => {
    if (!question) return alert("Ask a question first");
    const res = await askQuestion(question, documentId);
    setAnswer(res.answer || "No answer");
    setCitations(res.citations || []);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>📄 AI PDF Q&A</h2>

      <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>

      <br /><br />
      <input
        type="text"
        value={question}
        onChange={e => setQuestion(e.target.value)}
        placeholder="Ask something about the PDF..."
        style={{ width: "400px" }}
      />
      <button onClick={handleAsk}>Ask</button>

      <br /><br />
      <h3>Answer:</h3>
      <p>{answer}</p>

      {pdfUrl && <PdfViewer pdfUrl={pdfUrl} citations={citations} />}
    </div>
  );
}
