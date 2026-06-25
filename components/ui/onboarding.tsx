"use client";

import { useState } from "react";
import { saveProfile } from "@/lib/storage";
import { ProcrastinationProfile } from "@/lib/type";

const questions = [
  {
    id: "biggestPostponement",
    question: "What's the one thing you keep postponing that you know matters most?",
    placeholder: "Be honest. Nobody's watching.",
  },
  {
    id: "idealDay",
    question: "What does your ideal productive day look like?",
    placeholder: "Walk me through it...",
  },
  {
    id: "sabotagePattern",
    question: "What's your biggest self-sabotage pattern?",
    placeholder: "The thing you do that kills your momentum...",
  },
];

export default function Onboarding({
  onComplete,
}: {
  onComplete: (p: ProcrastinationProfile) => void;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ biggestPostponement: "", idealDay: "", sabotagePattern: "" });
  const [current, setCurrent] = useState("");
  const [loading, setLoading] = useState(false);

  const isLast = step === questions.length - 1;

  async function handleNext() {
    if (!current.trim()) return;

    const key = questions[step].id as keyof typeof answers;
    const updated = { ...answers, [key]: current };
    setAnswers(updated);

    if (!isLast) {
      setCurrent("");
      setStep(step + 1);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      const profile: ProcrastinationProfile = { ...updated, aiSummary: data.summary };
      saveProfile(profile);
      onComplete(profile);
    } catch {
      const profile: ProcrastinationProfile = { ...updated, aiSummary: "Profile saved." };
      saveProfile(profile);
      onComplete(profile);
    } finally {
      setLoading(false);
    }
  }

  const q = questions[step];

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem"
    }}>
      <div style={{ maxWidth: "520px", width: "100%" }}>

        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{
            display: "flex",
            gap: "6px",
            marginBottom: "2rem"
          }}>
            {questions.map((_, i) => (
              <div key={i} style={{
                height: "2px",
                flex: 1,
                background: i <= step ? "var(--text-primary)" : "var(--border)",
                borderRadius: "2px",
                transition: "background 0.3s"
              }} />
            ))}
          </div>

          <p style={{
            fontSize: "12px",
            color: "var(--text-muted)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            marginBottom: "1rem"
          }}>
            Question {step + 1} of {questions.length}
          </p>

          <h2 style={{
            fontSize: "22px",
            fontWeight: "500",
            color: "var(--text-primary)",
            lineHeight: "1.4",
            letterSpacing: "-0.01em"
          }}>
            {q.question}
          </h2>
        </div>

        <textarea
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          placeholder={q.placeholder}
          rows={4}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.metaKey) handleNext();
          }}
          style={{
            width: "100%",
            background: "var(--surface)",
            border: "0.5px solid var(--border)",
            borderRadius: "8px",
            padding: "1rem",
            fontSize: "15px",
            color: "var(--text-primary)",
            resize: "none",
            outline: "none",
            lineHeight: "1.6",
            fontFamily: "inherit",
          }}
        />

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "1rem"
        }}>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            ⌘ + Enter to continue
          </span>
          <button
            onClick={handleNext}
            disabled={!current.trim() || loading}
            style={{
              padding: "0.75rem 1.5rem",
              background: current.trim() && !loading ? "var(--text-primary)" : "var(--surface-2)",
              color: current.trim() && !loading ? "var(--bg)" : "var(--text-muted)",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: current.trim() && !loading ? "pointer" : "not-allowed",
              transition: "all 0.2s"
            }}
          >
            {loading ? "building your profile..." : isLast ? "Build my profile →" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}