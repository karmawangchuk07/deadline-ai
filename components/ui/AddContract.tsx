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

  const steps = ["what", "blocker", "sacrifice"];
  const stepIndex = steps.indexOf(step);

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.85)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      zIndex: 50
    }}>
      <div style={{
        background: "var(--surface)",
        border: "0.5px solid var(--border-bright)",
        borderRadius: "16px",
        padding: "2rem",
        width: "100%",
        maxWidth: "500px",
        boxShadow: "0 0 0 1px rgba(88,166,255,0.05), 0 24px 48px rgba(0,0,0,0.4)"
      }}>

        {step !== "done" && (
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ display: "flex", gap: "6px", marginBottom: "1.5rem" }}>
              {steps.map((s, i) => (
                <div key={s} style={{
                  height: "2px",
                  flex: 1,
                  borderRadius: "2px",
                  background: i <= stepIndex
                    ? "var(--accent)"
                    : "var(--surface-3)",
                  transition: "background 0.3s"
                }} />
              ))}
            </div>
            <p style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "0.75rem"
            }}>
              {step === "what" && "Step 1 of 3 — The commitment"}
              {step === "blocker" && "Step 2 of 3 — The truth"}
              {step === "sacrifice" && "Step 3 of 3 — The stakes"}
            </p>
          </div>
        )}

        {step === "what" && (
          <div>
            <h2 style={{
              fontSize: "22px",
              fontWeight: "600",
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              marginBottom: "1.5rem"
            }}>
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

            <p style={labelStyle}>When is it due?</p>
            <input
              type="datetime-local"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              style={inputStyle}
            />

            <p style={labelStyle}>Priority</p>
            <div style={{ display: "flex", gap: "8px" }}>
              {(["high", "medium", "low"] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  style={{
                    flex: 1,
                    padding: "0.6rem",
                    borderRadius: "8px",
                    border: `0.5px solid ${priority === p
                      ? p === "high" ? "var(--danger)"
                        : p === "medium" ? "var(--warning)"
                        : "var(--success)"
                      : "var(--border)"}`,
                    background: priority === p
                      ? p === "high" ? "var(--danger-dim)"
                        : p === "medium" ? "var(--warning-dim)"
                        : "var(--success-dim)"
                      : "transparent",
                    color: priority === p
                      ? p === "high" ? "var(--danger)"
                        : p === "medium" ? "var(--warning)"
                        : "var(--success)"
                      : "var(--text-muted)",
                    fontSize: "12px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    letterSpacing: "0.03em"
                  }}
                >
                  {p === "high" ? "🔴 high" : p === "medium" ? "🟡 medium" : "🟢 low"}
                </button>
              ))}
            </div>

            <div style={footerStyle}>
              <button onClick={onClose} style={cancelStyle}>cancel</button>
              <button
                onClick={() => setStep("blocker")}
                disabled={!title.trim() || !deadline}
                style={primaryButton(!title.trim() || !deadline)}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {step === "blocker" && (
          <div>
            <h2 style={{
              fontSize: "22px",
              fontWeight: "600",
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              marginBottom: "0.5rem"
            }}>
              Why haven't you started?
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "1.5rem", lineHeight: "1.5" }}>
              Don't say "busy". What's <em>actually</em> stopping you?
            </p>

            <textarea
              placeholder={'Be specific. "I don\'t know where to start" is an answer. "Busy" is not.'}
              value={blocker}
              onChange={e => setBlocker(e.target.value)}
              rows={4}
              autoFocus
              style={{ ...inputStyle, resize: "none", lineHeight: "1.6" }}
            />

            <div style={footerStyle}>
              <button onClick={() => setStep("what")} style={cancelStyle}>← back</button>
              <button
                onClick={() => setStep("sacrifice")}
                disabled={!blocker.trim()}
                style={primaryButton(!blocker.trim())}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {step === "sacrifice" && (
          <div>
            <h2 style={{
              fontSize: "22px",
              fontWeight: "600",
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              marginBottom: "0.5rem"
            }}>
              What are the stakes?
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "1.5rem", lineHeight: "1.5" }}>
              What will you sacrifice if you don't do this? Make it real.
            </p>

            <textarea
              placeholder="e.g. I'll skip my weekend plans / I'll delete Netflix for a week"
              value={sacrifice}
              onChange={e => setSacrifice(e.target.value)}
              rows={4}
              autoFocus
              style={{ ...inputStyle, resize: "none", lineHeight: "1.6" }}
            />

            <div style={footerStyle}>
              <button onClick={() => setStep("blocker")} style={cancelStyle}>← back</button>
              <button
                onClick={handleSubmit}
                disabled={!sacrifice.trim() || loading}
                style={{
                  ...primaryButton(!sacrifice.trim() || loading),
                  background: !sacrifice.trim() || loading ? "var(--surface-3)" : "var(--accent)",
                  color: !sacrifice.trim() || loading ? "var(--text-muted)" : "#0D1117",
                }}
              >
                {loading ? "interrogating your excuses..." : "Sign the contract →"}
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "1.5rem"
            }}>
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "var(--accent-dim)",
                border: "0.5px solid var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px"
              }}>
                ⚡
              </div>
              <div>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Contract signed
                </p>
                <p style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)" }}>
                  AXIS has something to say.
                </p>
              </div>
            </div>

            <div style={{
              background: "var(--surface-2)",
              border: "0.5px solid var(--border-bright)",
              borderLeft: "3px solid var(--accent)",
              borderRadius: "8px",
              padding: "1.25rem",
              marginBottom: "1.5rem"
            }}>
              <p style={{
                fontSize: "14px",
                color: "var(--text-secondary)",
                lineHeight: "1.8",
                fontStyle: "italic"
              }}>
                "{aiNote || "Contract saved. AXIS is watching."}"
              </p>
            </div>

            <button onClick={onClose} style={{
              width: "100%",
              padding: "0.875rem",
              background: "var(--accent)",
              color: "#0D1117",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              letterSpacing: "0.01em"
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
  border: "0.5px solid var(--border-bright)",
  borderRadius: "8px",
  padding: "0.875rem 1rem",
  fontSize: "14px",
  color: "var(--text-primary)",
  outline: "none",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "var(--text-secondary)",
  marginTop: "1.25rem",
  marginBottom: "0.5rem"
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
  fontSize: "13px",
  cursor: "pointer",
  padding: "0.5rem"
};

function primaryButton(disabled: boolean): React.CSSProperties {
  return {
    padding: "0.75rem 1.5rem",
    background: disabled ? "var(--surface-3)" : "var(--surface-2)",
    color: disabled ? "var(--text-muted)" : "var(--text-primary)",
    border: `0.5px solid ${disabled ? "var(--border)" : "var(--border-bright)"}`,
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "500",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.2s"
  };
}