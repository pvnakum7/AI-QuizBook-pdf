import React from "react";

export default function Loader() {
  return (
    <div style={{ marginTop: "20px", textAlign: "center" }}>
      <div className="spinner" />
      <p style={{ marginTop: "10px", color: "#555" }}>Processing your request...</p>
      <style>
        {`
          .spinner {
            display: inline-block;
            width: 32px;
            height: 32px;
            border: 3px solid #007bff;
            border-top-color: transparent;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
