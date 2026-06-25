"use client";

import { useState } from "react";
import { getContracts } from "@/lib/storage";
import { Siren } from "lucide-react";

export default function EmergencyRoom() {
  const [hours, setHours] = useState(3);
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  async function generatePlan() {
    setLoading(true);
    setPlan("");
    try {
      const contracts = getContracts().filter(c => c.status === "pending");
      const res = await fetch("/api/emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hours, contracts }),
      });
      const data = await res.json();
      setPlan(data.plan);
      setGenerated(true);
    } catch {
      setPlan("Something went wrong. But you already know what you need to do. Start with the most overdue task.");
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
            background: "var(--danger-dim)",
            border: "0.5px solid rgba(255,87,87,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Siren size={18} color="var(--danger)" strokeWidth={1.5} />
          </div>
          <h1 style={{
            fontSize: "26px",
            fontWeight: "700",
            letterSpacing: "-0.02em",
            color: "var(--text-primary)"
          }}>
            Emergency Room
          </h1>
        </div>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginLeft: "48px" }}>
          Behind on everything. Tell AXIS how much time you have — it'll tell you exactly what to do.
        </p>
      </div>

      <div style={{
        background: "var(--surface)",
        border: "0.5px solid var(--border-bright)",
        borderRadius: "16px",
        padding: "2rem",
        marginBottom: "16px"
      }}>
        <p style={{
          fontSize: "13px",
          color: "var(--text-secondary)",
          marginBottom: "1.5rem"
        }}>
          How many hours do you have right now?
        </p>

        <div style={{ display: "flex", gap: "8px", marginBottom: "2rem", flexWrap: "wrap" }}>
          {[1, 2, 3, 4, 6, 8].map(h => (
            <button
              key={h}
              onClick={() => setHours(h)}
              style={{
                padding: "0.5rem 1.25rem",
                borderRadius: "8px",
                border: `0.5px solid ${hours === h ? "var(--danger)" : "var(--border-bright)"}`,
                background: hours === h ? "var(--danger-dim)" : "var(--surface-2)",
                color: hours === h ? "var(--danger)" : "var(--text-secondary)",
                fontSize: "14px",
                fontWeight: hours === h ? "600" : "400",
                cursor: "pointer",
                transition: "all 0.15s"
              }}
            >
              {h}h
            </button>
          ))}
        </div>

        <button
          onClick={generatePlan}
          disabled={loading}
          style={{
            width: "100%",
            padding: "1rem",
            background: loading ? "var(--danger-dim)" : "var(--danger)",
            color: loading ? "var(--danger)" : "white",
            border: `0.5px solid ${loading ? "rgba(255,87,87,0.3)" : "transparent"}`,
            borderRadius: "10px",
            fontSize: "15px",
            fontWeight: "700",
            cursor: loading ? "not-allowed" : "pointer",
            letterSpacing: "0.01em",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}
        >
          {loading ? (
            <>
              <span style={{ fontSize: "16px" }}>⚡</span>
              building your battle plan...
            </>
          ) : (
            <>
              <Siren size={16} strokeWidth={2} />
              I need a plan RIGHT NOW
            </>
          )}
        </button>
      </div>

      {generated && plan && (
        <div style={{
          background: "var(--surface)",
          border: "0.5px solid rgba(255,87,87,0.2)",
          borderTop: "3px solid var(--danger)",
          borderRadius: "16px",
          padding: "2rem",
          animation: "fadeIn 0.3s ease"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "1.5rem"
          }}>
            <span style={{ fontSize: "16px" }}>⚡</span>
            <p style={{
              fontSize: "12px",
              fontWeight: "600",
              color: "var(--danger)",
              letterSpacing: "0.08em",
              textTransform: "uppercase"
            }}>
              Your {hours}h battle plan
            </p>
          </div>

          <div style={{
            fontSize: "15px",
            color: "var(--text-secondary)",
            lineHeight: "1.9",
            whiteSpace: "pre-wrap"
          }}>
            {plan}
          </div>

          <button
            onClick={() => { setGenerated(false); setPlan(""); }}
            style={{
              marginTop: "1.5rem",
              padding: "0.5rem 1rem",
              background: "transparent",
              border: "0.5px solid var(--border-bright)",
              color: "var(--text-muted)",
              borderRadius: "6px",
              fontSize: "12px",
              cursor: "pointer"
            }}
          >
            Generate new plan
          </button>
        </div>
      )}

      {getContracts().filter(c => c.status === "pending").length === 0 && (
        <div style={{
          background: "var(--surface)",
          border: "0.5px solid var(--border-bright)",
          borderRadius: "12px",
          padding: "2rem",
          textAlign: "center"
        }}>
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
            No pending contracts. Add some commitments first.
          </p>
        </div>
      )}
    </div>
  );
}