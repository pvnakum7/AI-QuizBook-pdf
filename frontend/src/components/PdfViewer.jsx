import React, { useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

export default function PdfViewer({ pdfUrl, citations }) {
  useEffect(() => {
    if (citations?.length) {
      console.log("Highlight citations:", citations);
      // You can later add visual highlights here using positions data
    }
  }, [citations]);

  return (
    <div style={{ border: "1px solid #ccc", marginTop: "20px" }}>
      <Document file={pdfUrl}>
        {Array.from(new Array(5), (el, index) => (
          <Page key={`page_${index + 1}`} pageNumber={index + 1} />
        ))}
      </Document>
    </div>
  );
}
