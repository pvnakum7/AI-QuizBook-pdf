import React from "react";

export default function Loader() {
  return (
    <div style={{ marginTop: "20px" }}>
      <span
        style={{
          display: "inline-block",
          width: "30px",
          height: "30px",
          border: "3px solid #007bff",
          borderTopColor: "transparent",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      ></span>
      <p>Processing...</p>
      <style>
        {`@keyframes spin { from {transform: rotate(0deg);} to {transform: rotate(360deg);} }`}
      </style>
    </div>
  );
}
