"use client";

import { useState } from "react";
import { addContract } from "@/lib/storage";
import { Contract } from "@/lib/type";

type Step = "what" | "blocker" | "sacrifice" | "done";

export default function AddContract({ onClose, onAdded }: {
  onClose: () => void;
  onAdded: (contract: Contract) => void;
}) {
  const [step, setStep] = useState<Step>("what");
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("high");
  const [blocker, setBlocker] = useState("");
  const [sacrifice, setSacrifice] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiNote, setAiNote] = useState("");

  async function handleSubmit() {
    setLoading(true);
    try {
      const res = await fetch("/api/contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, deadline, blocker, sacrifice }),
      });
      const data = await res.json();
      setAiNote(data.note);

      const contract: Contract = {
        id: crypto.randomUUID(),
        title,
        deadline,
        priority,
        status: "pending",
        blocker,
        sacrifice,
        rescheduleCount: 0,
        createdAt: new Date().toISOString(),
        aiNote: data.note,
        axisScore: 0,
      };

      addContract(contract);
      onAdded(contract);
      setStep("done");
    } catch {
      setStep("done");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.8)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      zIndex: 50
    }}>
      <div style={{
        background: "var(--surface)",
        border: "0.5px solid var(--border)",
        borderRadius: "12px",
        padding: "2rem",
        width: "100%",
        maxWidth: "480px"
      }}>

        {step === "what" && (
          <div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "1.5rem" }}>
              Step 1 of 3 — The commitment
            </p>
            <h2 style={{ fontSize: "20px", fontWeight: "500", color: "var(--text-primary)", marginBottom: "1.5rem" }}>
              What needs to get done?
            </h2>

            <input
              type="text"
              placeholder="e.g. Finish landing page copy"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
              style={inputStyle}
            />

            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "1.25rem", marginBottom: "0.5rem" }}>
              When is it due?
            </p>
            <input
              type="datetime-local"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              style={inputStyle}
            />

            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "1.25rem", marginBottom: "0.5rem" }}>
              Priority
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              {(["high", "medium", "low"] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  style={{
                    flex: 1,
                    padding: "0.5rem",
                    borderRadius: "6px",
                    border: `0.5px solid ${priority === p ? "var(--text-primary)" : "var(--border)"}`,
                    background: priority === p ? "var(--text-primary)" : "transparent",
                    color: priority === p ? "var(--bg)" : "var(--text-secondary)",
                    fontSize: "13px",
                    cursor: "pointer",
                    transition: "all 0.15s"
                  }}
                >
                  {p}
                </button>
              ))}
            </div>

            <div style={footerStyle}>
              <button onClick={onClose} style={cancelStyle}>cancel</button>
              <button
                onClick={() => setStep("blocker")}
                disabled={!title.trim() || !deadline}
                style={nextButtonStyle(!title.trim() || !deadline)}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {step === "blocker" && (
          <div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "1.5rem" }}>
              Step 2 of 3 — The truth
            </p>
            <h2 style={{ fontSize: "20px", fontWeight: "500", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
              Why haven't you started yet?
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
              Don't say "busy". What's actually stopping you?
            </p>

            <textarea
              placeholder="Be specific. 'I don't know where to start' is an answer. 'Busy' is not."
              value={blocker}
              onChange={e => setBlocker(e.target.value)}
              rows={4}
              autoFocus
              style={{ ...inputStyle, resize: "none" }}
            />

            <div style={footerStyle}>
              <button onClick={() => setStep("what")} style={cancelStyle}>← back</button>
              <button
                onClick={() => setStep("sacrifice")}
                disabled={!blocker.trim()}
                style={nextButtonStyle(!blocker.trim())}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {step === "sacrifice" && (
          <div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "1.5rem" }}>
              Step 3 of 3 — The stakes
            </p>
            <h2 style={{ fontSize: "20px", fontWeight: "500", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
              What will you sacrifice if you don't do this?
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
              Make it real. Something you'd actually miss.
            </p>

            <textarea
              placeholder="e.g. I'll skip my weekend plans / I'll delete my Netflix account for a week"
              value={sacrifice}
              onChange={e => setSacrifice(e.target.value)}
              rows={4}
              autoFocus
              style={{ ...inputStyle, resize: "none" }}
            />

            <div style={footerStyle}>
              <button onClick={() => setStep("blocker")} style={cancelStyle}>← back</button>
              <button
                onClick={handleSubmit}
                disabled={!sacrifice.trim() || loading}
                style={nextButtonStyle(!sacrifice.trim() || loading)}
              >
                {loading ? "interrogating your excuses..." : "Sign the contract →"}
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "1.5rem" }}>
              Contract signed
            </p>
            <h2 style={{ fontSize: "20px", fontWeight: "500", color: "var(--text-primary)", marginBottom: "1.5rem" }}>
              AXIS has something to say.
            </h2>
            <div style={{
              background: "var(--surface-2)",
              border: "0.5px solid var(--border)",
              borderRadius: "8px",
              padding: "1.25rem",
              marginBottom: "1.5rem",
              textAlign: "left"
            }}>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.7" }}>
                {aiNote || "Contract saved. AXIS is watching."}
              </p>
            </div>
            <button onClick={onClose} style={{
              width: "100%",
              padding: "0.875rem",
              background: "var(--text-primary)",
              color: "var(--bg)",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer"
            }}>
              Got it
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--surface-2)",
  border: "0.5px solid var(--border)",
  borderRadius: "8px",
  padding: "0.875rem 1rem",
  fontSize: "14px",
  color: "var(--text-primary)",
  outline: "none",
  fontFamily: "inherit",
};

const footerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: "1.5rem"
};

const cancelStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "var(--text-muted)",
  fontSize: "14px",
  cursor: "pointer",
  padding: "0.5rem"
};

function nextButtonStyle(disabled: boolean): React.CSSProperties {
  return {
    padding: "0.75rem 1.5rem",
    background: disabled ? "var(--surface-2)" : "var(--text-primary)",
    color: disabled ? "var(--text-muted)" : "var(--bg)",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.2s"
  };
}