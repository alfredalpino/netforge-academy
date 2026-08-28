"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ background: "#0c0f14", color: "#e8eaed", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
          <div style={{ textAlign: "center", maxWidth: "28rem" }}>
            <p style={{ color: "#f59e0b", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Critical Error
            </p>
            <h1 style={{ marginTop: "0.75rem", fontSize: "1.5rem", fontWeight: 600 }}>NetForge failed to load</h1>
            <p style={{ marginTop: "0.5rem", color: "#8b95a8", fontSize: "0.875rem" }}>
              {error.message || "An unexpected error occurred."}
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                marginTop: "1.5rem",
                background: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                padding: "0.625rem 1rem",
                cursor: "pointer",
              }}
            >
              Reload app
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
