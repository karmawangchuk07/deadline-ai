"use client";

import { useState, useRef, useEffect } from "react";
import { Contract } from "@/lib/type";
import { getProfile } from "@/lib/storage";

type Message = {
  role: "axis" | "user";
  text: string;
};

export default function InterrogationMode({
  contract,
  onClose
}: {
  contract: Contract;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [turn, setTurn] = useState(0);
  const [sessionId] = useState(() => crypto.randomUUID());
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startInterrogation();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function startInterrogation() {
    setLoading(true);
    try {
      const res = await fetch("/api/interrogate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            sessionId,
            turn: 0,
            contractTitle: contract.title,
            deadline: contract.deadline,
            blocker: contract.blocker,
            rescheduleCount: contract.rescheduleCount,
            userMessage: null,
            history: [],
            profile: getProfile()  // ← add this
        }),
      });
      const data = await res.json();
      setMessages([{ role: "axis", text: data.response }]);
      setTurn(1);
    } catch {
      setMessages([{ role: "axis", text: "Why haven't you done this yet? Be specific." }]);
      setTurn(1);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    if (!input.trim() || loading || turn > 3) return;

    const userMsg = input.trim();
    setInput("");
    const newMessages = [...messages, { role: "user" as const, text: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/interrogate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          turn,
          contractTitle: contract.title,
          deadline: contract.deadline,
          blocker: contract.blocker,
          rescheduleCount: contract.rescheduleCount,
          userMessage: userMsg,
          history: newMessages
        }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: "axis", text: data.response }]);
      setTurn(t => t + 1);
    } catch {
      setMessages([...newMessages, { role: "axis", text: "Keep going. What's really stopping you?" }]);
    } finally {
      setLoading(false);
    }
  }

  const isDone = turn > 3;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.9)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      zIndex: 100
    }}>
      <div style={{
        background: "var(--surface)",
        border: "0.5px solid var(--border-bright)",
        borderTop: "3px solid var(--danger)",
        borderRadius: "16px",
        width: "100%",
        maxWidth: "560px",
        display: "flex",
        flexDirection: "column",
        maxHeight: "80vh"
      }}>
        <div style={{
          padding: "1.25rem 1.5rem",
          borderBottom: "0.5px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0
        }}>
          <div>
            <p style={{
              fontSize: "11px",
              color: "var(--danger)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "2px",
              fontWeight: "600"
            }}>
              ⚡ Interrogation Mode
            </p>
            <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>
              {contract.title}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "0.5px solid var(--border-bright)",
              color: "var(--text-muted)",
              borderRadius: "6px",
              padding: "0.3rem 0.75rem",
              fontSize: "12px",
              cursor: "pointer"
            }}
          >
            Close
          </button>
        </div>

        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem"
        }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: "flex",
              justifyContent: msg.role === "axis" ? "flex-start" : "flex-end"
            }}>
              <div style={{
                maxWidth: "85%",
                padding: "0.875rem 1rem",
                borderRadius: msg.role === "axis" ? "4px 12px 12px 12px" : "12px 4px 12px 12px",
                background: msg.role === "axis" ? "var(--surface-2)" : "var(--accent-dim)",
                border: `0.5px solid ${msg.role === "axis" ? "var(--border-bright)" : "var(--accent-border)"}`,
                fontSize: "14px",
                color: msg.role === "axis" ? "var(--text-secondary)" : "var(--text-primary)",
                lineHeight: "1.7"
              }}>
                {msg.role === "axis" && (
                  <p style={{
                    fontSize: "10px",
                    color: "var(--danger)",
                    fontWeight: "600",
                    letterSpacing: "0.08em",
                    marginBottom: "6px"
                  }}>
                    AXIS
                  </p>
                )}
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{
                padding: "0.875rem 1rem",
                borderRadius: "4px 12px 12px 12px",
                background: "var(--surface-2)",
                border: "0.5px solid var(--border-bright)",
                fontSize: "13px",
                color: "var(--text-muted)"
              }}>
                analyzing your response...
              </div>
            </div>
          )}

          {isDone && !loading && (
            <div style={{
              padding: "1rem",
              background: "var(--success-dim)",
              border: "0.5px solid rgba(74,222,128,0.2)",
              borderRadius: "8px",
              fontSize: "13px",
              color: "var(--success)",
              textAlign: "center"
            }}>
              Interrogation complete. Now go do the thing.
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {!isDone && (
          <div style={{
            padding: "1rem 1.5rem",
            borderTop: "0.5px solid var(--border)",
            display: "flex",
            gap: "8px",
            flexShrink: 0
          }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Be honest..."
              disabled={loading}
              autoFocus
              style={{
                flex: 1,
                background: "var(--surface-2)",
                border: "0.5px solid var(--border-bright)",
                borderRadius: "8px",
                padding: "0.75rem 1rem",
                fontSize: "14px",
                color: "var(--text-primary)",
                outline: "none",
                fontFamily: "inherit"
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              style={{
                padding: "0.75rem 1.25rem",
                background: input.trim() && !loading ? "var(--danger)" : "var(--surface-3)",
                color: input.trim() && !loading ? "white" : "var(--text-muted)",
                border: "none",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                transition: "all 0.15s"
              }}
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}