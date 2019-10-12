import React from "react";

export default function LoadingSpinner({width = 24}) {
  return (
    <svg style={{width: `${width}px`, height: `${width}px`}} className="global-LoadingSpinner" viewBox="25 25 50 50">
      <circle className="loader-track" cx="50" cy="50" r="20" fill="none" stroke="white" strokeWidth="7.9" />
      <circle className="loader-path" cx="50" cy="50" r="20" fill="none" stroke="#ed9e37" strokeWidth="8" />
    </svg>
  );
}