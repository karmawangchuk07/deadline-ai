"use client";

import { useEffect, useState } from "react";
import { getContracts, getAxisScore } from "@/lib/storage";
import { getScoreLabel, getScoreColor } from "@/lib/score";
import { Contract } from "@/lib/type";

export default function Dashboard() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [score, setScore] = useState(50);
  const [insight, setInsight] = useState("");
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => {
    setContracts(getContracts());
    setScore(getAxisScore());
  }, []);

  const completed = contracts.filter(c => c.status === "completed");
  const pending = contracts.filter(c => c.status === "pending");
  const overdue = contracts.filter(c => c.status !== "completed" && new Date(c.deadline) < new Date());
  const totalReschedules = contracts.reduce((sum, c) => sum + c.rescheduleCount, 0);
  const completionRate = contracts.length > 0 ? Math.round((completed.length / contracts.length) * 100) : 0;
  const mostAvoided = [...contracts].filter(c => c.status !== "completed").sort((a, b) => b.rescheduleCount - a.rescheduleCount)[0];
  const scoreColor = getScoreColor(score);

  async function generateInsight() {
    setLoadingInsight(true);
    try {
      const res = await fetch("/api/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completionRate, totalContracts: contracts.length, completed: completed.length, overdue: overdue.length, totalReschedules, mostAvoided: mostAvoided?.title || "none", axisScore: score }),
      });
      const data = await res.json();
      setInsight(data.insight);
    } catch {
      setInsight("Not enough data yet.");
    } finally {
      setLoadingInsight(false);
    }
  }

  const circumference = 2 * Math.PI * 54;

  return (
    <div style={{ maxWidth: "800px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "26px", fontWeight: "700", letterSpacing: "-0.02em", color: "var(--text-primary)", marginBottom: "4px" }}>
          Dashboard
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Your word, quantified.</p>
      </div>

      {/* AXIS Score Hero */}
      <div style={{
        background: "var(--surface)",
        border: "0.5px solid var(--border-bright)",
        borderRadius: "16px",
        padding: "2.5rem",
        marginBottom: "16px",
        display: "flex",
        alignItems: "center",
        gap: "2.5rem",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute",
          top: "-60px", right: "-60px",
          width: "200px", height: "200px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${scoreColor}08 0%, transparent 70%)`,
          pointerEvents: "none"
        }} />

        <div style={{ position: "relative", flexShrink: 0 }}>
          <svg width="130" height="130" viewBox="0 0 130 130">
            <circle cx="65" cy="65" r="54" fill="none" stroke="var(--surface-3)" strokeWidth="6" />
            <circle
              cx="65" cy="65" r="54"
              fill="none"
              stroke={scoreColor}
              strokeWidth="6"
              strokeDasharray={`${(score / 100) * circumference} ${circumference}`}
              strokeLinecap="round"
              transform="rotate(-90 65 65)"
              style={{ transition: "stroke-dasharray 0.8s ease" }}
            />
          </svg>
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center"
          }}>
            <span style={{ fontSize: "36px", fontWeight: "700", color: scoreColor, letterSpacing: "-0.03em", lineHeight: 1 }}>
              {score}
            </span>
            <span style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.05em", marginTop: "4px" }}>
              / 100
            </span>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>
            AXIS Score
          </p>
          <p style={{ fontSize: "32px", fontWeight: "700", color: scoreColor, letterSpacing: "-0.02em", marginBottom: "8px" }}>
            {getScoreLabel(score)}
          </p>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6", maxWidth: "320px" }}>
            {score >= 80
              ? "You do what you say. That's rare."
              : score >= 60
              ? "You're getting better. Keep showing up."
              : score >= 40
              ? "You make commitments you don't keep. That needs to change."
              : "You're breaking more promises than you're keeping."}
          </p>

          <div style={{ marginTop: "1.25rem", display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[
              { label: "Completed", value: completed.length, color: "var(--success)" },
              { label: "Pending", value: pending.length, color: "var(--accent)" },
              { label: "Overdue", value: overdue.length, color: "var(--danger)" },
            ].map(s => (
              <div key={s.label} style={{
                padding: "4px 12px",
                borderRadius: "20px",
                background: "var(--surface-2)",
                border: "0.5px solid var(--border-bright)",
                fontSize: "12px",
                color: "var(--text-secondary)"
              }}>
                <span style={{ color: s.color, fontWeight: "600" }}>{s.value}</span>
                {" "}{s.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "12px",
        marginBottom: "16px"
      }}>
        {[
          {
            label: "Completion rate",
            value: `${completionRate}%`,
            sub: completionRate >= 70 ? "On track" : completionRate >= 40 ? "Needs work" : "Struggling",
            color: completionRate >= 70 ? "var(--success)" : completionRate >= 40 ? "var(--warning)" : "var(--danger)",
            bg: completionRate >= 70 ? "var(--success-dim)" : completionRate >= 40 ? "var(--warning-dim)" : "var(--danger-dim)"
          },
          {
            label: "Completed",
            value: completed.length,
            sub: "contracts kept",
            color: "var(--success)",
            bg: "var(--success-dim)"
          },
          {
            label: "Overdue",
            value: overdue.length,
            sub: overdue.length === 0 ? "All clear" : "Need attention",
            color: overdue.length > 0 ? "var(--danger)" : "var(--success)",
            bg: overdue.length > 0 ? "var(--danger-dim)" : "var(--success-dim)"
          },
          {
            label: "Reschedules",
            value: totalReschedules,
            sub: totalReschedules === 0 ? "Clean record" : "Times avoided",
            color: totalReschedules > 3 ? "var(--warning)" : "var(--text-secondary)",
            bg: totalReschedules > 3 ? "var(--warning-dim)" : "var(--surface-2)"
          },
        ].map(stat => (
          <div key={stat.label} style={{
            background: "var(--surface)",
            border: "0.5px solid var(--border-bright)",
            borderRadius: "12px",
            padding: "1.25rem",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{
              position: "absolute",
              bottom: 0, right: 0,
              width: "60px", height: "60px",
              borderRadius: "50%",
              background: stat.bg,
              transform: "translate(20px, 20px)"
            }} />
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px", letterSpacing: "0.03em" }}>
              {stat.label}
            </p>
            <p style={{ fontSize: "30px", fontWeight: "700", color: stat.color, letterSpacing: "-0.02em", lineHeight: 1, marginBottom: "6px" }}>
              {stat.value}
            </p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Most Avoided */}
      {mostAvoided && (
        <div style={{
          background: "var(--surface)",
          border: "0.5px solid var(--border-bright)",
          borderLeft: "3px solid var(--danger)",
          borderRadius: "12px",
          padding: "1.25rem 1.5rem",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "6px" }}>
              Most avoided commitment
            </p>
            <p style={{ fontSize: "17px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "4px" }}>
              {mostAvoided.title}
            </p>
            <p style={{ fontSize: "12px", color: "var(--danger)" }}>
              Rescheduled {mostAvoided.rescheduleCount} times
            </p>
          </div>
          <div style={{
            width: "48px", height: "48px",
            borderRadius: "50%",
            background: "var(--danger-dim)",
            border: "0.5px solid rgba(255,87,87,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "20px"
          }}>
            🔁
          </div>
        </div>
      )}

      {/* AI Insight */}
      <div style={{
        background: "var(--surface)",
        border: "0.5px solid var(--border-bright)",
        borderRadius: "12px",
        padding: "1.5rem",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: insight ? "1.25rem" : "0" }}>
          <div>
            <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "2px" }}>
              AI pattern analysis
            </p>
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Honest look at your behavior
            </p>
          </div>
          <button
            onClick={generateInsight}
            disabled={loadingInsight || contracts.length === 0}
            style={{
              padding: "0.5rem 1rem",
              background: loadingInsight ? "var(--surface-2)" : "var(--accent-dim)",
              border: `0.5px solid ${loadingInsight ? "var(--border)" : "var(--accent-border)"}`,
              color: loadingInsight ? "var(--text-muted)" : "var(--accent)",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "500",
              cursor: loadingInsight ? "not-allowed" : "pointer",
              transition: "all 0.2s"
            }}
          >
            {loadingInsight ? "analyzing..." : "Generate →"}
          </button>
        </div>

        {insight && (
          <div style={{
            background: "var(--surface-2)",
            borderRadius: "8px",
            padding: "1.25rem",
            borderLeft: "2px solid var(--accent)"
          }}>
            <p style={{
              fontSize: "14px",
              color: "var(--text-secondary)",
              lineHeight: "1.8",
              fontStyle: "italic"
            }}>
              "{insight}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}