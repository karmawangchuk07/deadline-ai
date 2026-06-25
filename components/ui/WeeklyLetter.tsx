"use client";

import { useState } from "react";
import { getContracts, getAxisScore } from "@/lib/storage";
import { Mail } from "lucide-react";

export default function WeeklyLetter() {
  const [letter, setLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  async function generateLetter() {
    setLoading(true);
    setLetter("");
    try {
      const contracts = getContracts();
      const score = getAxisScore();
      const res = await fetch("/api/debrief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contracts, score }),
      });
      const data = await res.json();
      setLetter(data.letter);
      setGenerated(true);
    } catch {
      setLetter("AXIS couldn't generate your letter right now. Try again.");
      setGenerated(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: "800px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
          <div style={{
            width: "36px", height: "36px",
            borderRadius: "8px",
            background: "var(--accent-dim)",
            border: "0.5px solid var(--accent-border)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Mail size={18} color="var(--accent)" strokeWidth={1.5} />
          </div>
          <h1 style={{
            fontSize: "26px",
            fontWeight: "700",
            letterSpacing: "-0.02em",
            color: "var(--text-primary)"
          }}>
            Weekly Letter
          </h1>
        </div>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginLeft: "48px" }}>
          An honest letter from AXIS about your week. Not a chart. A conversation.
        </p>
      </div>

      {!generated ? (
        <div style={{
          background: "var(--surface)",
          border: "0.5px solid var(--border-bright)",
          borderRadius: "16px",
          padding: "3rem 2rem",
          textAlign: "center"
        }}>
          <div style={{
            width: "64px", height: "64px",
            borderRadius: "50%",
            background: "var(--accent-dim)",
            border: "0.5px solid var(--accent-border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1.5rem"
          }}>
            <Mail size={28} color="var(--accent)" strokeWidth={1.5} />
          </div>

          <h2 style={{
            fontSize: "20px",
            fontWeight: "600",
            color: "var(--text-primary)",
            letterSpacing: "-0.01em",
            marginBottom: "0.75rem"
          }}>
            Ready for your weekly debrief?
          </h2>
          <p style={{
            fontSize: "14px",
            color: "var(--text-secondary)",
            lineHeight: "1.7",
            maxWidth: "400px",
            margin: "0 auto 2rem"
          }}>
            AXIS will write you an honest letter about your week — what you did, what you avoided, and what it actually says about you.
          </p>

          <button
            onClick={generateLetter}
            disabled={loading}
            style={{
              padding: "0.875rem 2rem",
              background: loading ? "var(--accent-dim)" : "var(--accent)",
              color: loading ? "var(--accent)" : "#060608",
              border: `0.5px solid ${loading ? "var(--accent-border)" : "transparent"}`,
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s"
            }}
          >
            {loading ? "writing your letter..." : "Generate this week's letter →"}
          </button>
        </div>
      ) : (
        <div>
          <div style={{
            background: "var(--surface)",
            border: "0.5px solid var(--border-bright)",
            borderTop: "3px solid var(--accent)",
            borderRadius: "16px",
            padding: "2.5rem",
            marginBottom: "16px"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "2rem",
              paddingBottom: "1.5rem",
              borderBottom: "0.5px solid var(--border)"
            }}>
              <div style={{
                width: "40px", height: "40px",
                borderRadius: "50%",
                background: "var(--accent-dim)",
                border: "0.5px solid var(--accent-border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0
              }}>
                <Mail size={18} color="var(--accent)" strokeWidth={1.5} />
              </div>
              <div>
                <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>
                  From AXIS
                </p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
            </div>

            <div style={{
              fontSize: "15px",
              color: "var(--text-secondary)",
              lineHeight: "2",
              whiteSpace: "pre-wrap"
            }}>
              {letter}
            </div>
          </div>

          <button
            onClick={() => { setGenerated(false); setLetter(""); }}
            style={{
              padding: "0.5rem 1rem",
              background: "transparent",
              border: "0.5px solid var(--border-bright)",
              color: "var(--text-muted)",
              borderRadius: "6px",
              fontSize: "12px",
              cursor: "pointer"
            }}
          >
            Regenerate letter
          </button>
          <button
            onClick={() => {
                const subject = encodeURIComponent("Your AXIS Weekly Debrief");
                const body = encodeURIComponent(letter);
                window.open(`mailto:?subject=${subject}&body=${body}`);
            }}
            style={{
                marginLeft: "8px",
                padding: "0.5rem 1rem",
                background: "var(--accent-dim)",
                border: "0.5px solid var(--accent-border)",
                color: "var(--accent)",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "500",
                cursor: "pointer"
            }}
            >
            ✉ Send to my email
            </button>
        </div>
      )}
    </div>
  );
}