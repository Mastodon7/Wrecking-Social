'use client';

export const PrintButton = () => (
  <button type="button" className="rpt-btn" onClick={() => window.print()}>
    Download PDF
  </button>
);
