"use client";

import { useEffect, useState } from "react";
import { getProfile, getContracts, updateContract, getAxisScore } from "@/lib/storage";
import { Contract, ProcrastinationProfile } from "@/lib/type";
import { getScoreLabel, getScoreColor, onContractCompleted, onContractRescheduled } from "@/lib/score";
import Onboarding from "@/components/ui/onboarding";
import AddContract from "@/components/ui/AddContract";
import Dashboard from "@/components/ui/Dashboard";
import EmergencyRoom from "@/components/ui/EmergencyRoom";
import WeeklyLetter from "@/components/ui/WeeklyLetter";
import InterrogationMode from "@/components/ui/InterrogationMode";
import { FileText, LayoutDashboard, Siren, Mail, TrendingUp } from "lucide-react";

export default function Home() {
  const [profile, setProfile] = useState<ProcrastinationProfile | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const existing = getProfile();
    setProfile(existing);
    setChecking(false);
  }, []);

  if (checking) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-muted)",
        fontSize: "13px",
        letterSpacing: "0.08em"
      }}>
        LOADING...
      </div>
    );
  }

  if (!profile) {
    return <Onboarding onComplete={(p) => setProfile(p)} />;
  }

  return <DashboardScreen />;
}

const navItems = [
  { name: "Contracts", icon: FileText },
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Emergency Room", icon: Siren },
  { name: "Weekly Letter", icon: Mail },
];

function DashboardScreen() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [activeTab, setActiveTab] = useState("Contracts");
  const [score, setScore] = useState(50);

  useEffect(() => {
    setContracts(getContracts());
    setScore(getAxisScore());
  }, []);

  function refresh() {
    setContracts(getContracts());
    setScore(getAxisScore());
  }

  function handleAdded() {
    refresh();
    setShowAdd(false);
  }

  const pending = contracts.filter(c => c.status === "pending").length;
  const scoreColor = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg)" }}>

      <aside style={{
        width: "260px",
        borderRight: "0.5px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        background: "var(--surface)",
        position: "sticky",
        top: 0,
        height: "100vh"
      }}>
        <div style={{
          padding: "1.75rem 1.5rem 1.25rem",
          borderBottom: "0.5px solid var(--border)"
        }}>
          <div style={{
            fontSize: "20px",
            fontWeight: "700",
            letterSpacing: "-0.03em",
            color: "var(--text-primary)",
            marginBottom: "3px"
          }}>
            AXIS
          </div>
          <div style={{
            fontSize: "10px",
            color: "var(--text-muted)",
            letterSpacing: "0.12em",
            fontWeight: "500"
          }}>
            YOUR WORD, QUANTIFIED
          </div>
        </div>

        <div style={{
          margin: "1rem 1rem 0",
          background: "var(--surface-2)",
          border: "0.5px solid var(--border-bright)",
          borderRadius: "10px",
          padding: "1rem",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "10px"
          }}>
            <div style={{ position: "relative", width: "44px", height: "44px", flexShrink: 0 }}>
              <svg width="44" height="44" viewBox="0 0 44 44">
                <circle cx="22" cy="22" r="18" fill="none" stroke="var(--surface-3)" strokeWidth="3" />
                <circle
                  cx="22" cy="22" r="18"
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="3"
                  strokeDasharray={`${(score / 100) * 113} 113`}
                  strokeLinecap="round"
                  transform="rotate(-90 22 22)"
                  style={{ transition: "stroke-dasharray 0.5s ease" }}
                />
              </svg>
              <div style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: "700",
                color: scoreColor
              }}>
                {score}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "600", color: scoreColor, marginBottom: "2px" }}>
                {scoreLabel}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                AXIS Score
              </div>
            </div>
          </div>

          <div style={{
            height: "4px",
            background: "var(--surface-3)",
            borderRadius: "2px",
            overflow: "hidden"
          }}>
            <div style={{
              height: "100%",
              width: `${score}%`,
              background: scoreColor,
              borderRadius: "2px",
              transition: "width 0.5s ease"
            }} />
          </div>
        </div>

        <nav style={{ padding: "1rem", flex: 1 }}>
          {navItems.map(({ name, icon: Icon }) => {
            const isActive = activeTab === name;
            return (
              <div
                key={name}
                onClick={() => setActiveTab(name)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "0.65rem 0.875rem",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: isActive ? "500" : "400",
                  color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                  background: isActive ? "var(--surface-3)" : "transparent",
                  border: isActive ? "0.5px solid var(--border-bright)" : "0.5px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  marginBottom: "2px"
                }}
              >
                <Icon
                  size={15}
                  strokeWidth={isActive ? 2 : 1.5}
                  color={isActive ? "var(--accent)" : "var(--text-muted)"}
                />
                {name}
              </div>
            );
          })}
        </nav>

        <div style={{
          padding: "1rem 1.5rem",
          borderTop: "0.5px solid var(--border)",
          fontSize: "11px",
          color: "var(--text-muted)",
          display: "flex",
          alignItems: "center",
          gap: "6px"
        }}>
          <TrendingUp size={12} strokeWidth={1.5} />
          {pending} pending · {contracts.length} total
        </div>
      </aside>

      <main style={{
        flex: 1,
        padding: "2.5rem 3rem",
        overflowY: "auto",
        display: "flex",
        justifyContent: "center"
      }}>
        <div style={{ width: "100%", maxWidth: "800px" }}>

          {activeTab === "Contracts" && (
            <div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "2rem"
              }}>
                <div>
                  <h1 style={{
                    fontSize: "26px",
                    fontWeight: "700",
                    color: "var(--text-primary)",
                    letterSpacing: "-0.02em",
                    marginBottom: "4px"
                  }}>
                    Your contracts
                  </h1>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    {contracts.length === 0
                      ? "Nothing here. Either you're on top of everything or you haven't been honest."
                      : `${pending} pending · ${contracts.filter(c => c.status === "completed").length} completed`}
                  </p>
                </div>
                <button
                  onClick={() => setShowAdd(true)}
                  style={{
                    padding: "0.625rem 1.25rem",
                    background: "var(--accent)",
                    color: "#060608",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    flexShrink: 0
                  }}
                >
                  + Add contract
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {contracts.map(contract => (
                  <ContractCard
                    key={contract.id}
                    contract={contract}
                    onUpdate={refresh}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === "Dashboard" && <Dashboard />}
          {activeTab === "Emergency Room" && <EmergencyRoom />}
          {activeTab === "Weekly Letter" && <WeeklyLetter />}

        </div>
      </main>

      {showAdd && (
        <AddContract
          onClose={() => setShowAdd(false)}
          onAdded={handleAdded}
        />
      )}
    </div>
  );
}

function ContractCard({ contract, onUpdate }: {
  contract: Contract;
  onUpdate: () => void;
}) {
  const [rescheduling, setRescheduling] = useState(false);
  const [newDeadline, setNewDeadline] = useState("");
  const [callout, setCallout] = useState("");
  const [completing, setCompleting] = useState(false);
  const [interrogating, setInterrogating] = useState(false);

  const deadline = new Date(contract.deadline);
  const now = new Date();
  const hoursLeft = Math.round((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));
  const isOverdue = hoursLeft < 0;
  const isUrgent = hoursLeft >= 0 && hoursLeft <= 24;
  const isCompleted = contract.status === "completed";

  async function handleComplete() {
    setCompleting(true);
    onContractCompleted(contract);
    updateContract(contract.id, {
      status: "completed",
      completedAt: new Date().toISOString()
    });
    onUpdate();
    setCompleting(false);
  }

  async function handleReschedule() {
    if (!newDeadline) return;
    try {
      const res = await fetch("/api/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: contract.title,
          rescheduleCount: contract.rescheduleCount + 1,
          blocker: contract.blocker
        }),
      });
      const data = await res.json();
      setCallout(data.callout);
    } catch {
      setCallout("Rescheduling again? Make sure this time is different.");
    }
    onContractRescheduled();
    updateContract(contract.id, {
      deadline: newDeadline,
      rescheduleCount: contract.rescheduleCount + 1
    });
    setRescheduling(false);
    onUpdate();
  }

  const borderColor = isCompleted ? "var(--border)" : isOverdue ? "var(--danger)" : isUrgent ? "var(--warning)" : "var(--border)";
  const accentColor = isOverdue ? "var(--danger)" : isUrgent ? "var(--warning)" : "transparent";

  return (
    <>
      <div style={{
        background: "var(--surface)",
        border: `0.5px solid ${borderColor}`,
        borderRadius: "10px",
        overflow: "hidden",
        opacity: isCompleted ? 0.45 : 1,
        transition: "opacity 0.3s"
      }}>
        {!isCompleted && (isOverdue || isUrgent) && (
          <div style={{ height: "2px", background: accentColor }} />
        )}

        <div style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: "15px",
                fontWeight: "600",
                color: "var(--text-primary)",
                letterSpacing: "-0.01em",
                marginBottom: "4px",
                textDecoration: isCompleted ? "line-through" : "none"
              }}>
                {contract.title}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "12px", color: isOverdue ? "var(--danger)" : isUrgent ? "var(--warning)" : "var(--text-muted)" }}>
                  {isCompleted ? "Completed ✓"
                    : isOverdue ? `Overdue by ${Math.abs(hoursLeft)}h`
                    : isUrgent ? `⚠ ${hoursLeft}h left`
                    : `Due ${deadline.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                </span>
                {contract.rescheduleCount > 0 && (
                  <span style={{
                    fontSize: "11px",
                    padding: "1px 8px",
                    borderRadius: "20px",
                    background: "var(--danger-dim)",
                    color: "var(--danger)",
                    border: "0.5px solid rgba(255,87,87,0.15)"
                  }}>
                    rescheduled {contract.rescheduleCount}×
                  </span>
                )}
              </div>
            </div>

            <span style={{
              fontSize: "10px",
              fontWeight: "600",
              padding: "3px 10px",
              borderRadius: "20px",
              letterSpacing: "0.05em",
              background: contract.priority === "high" ? "var(--danger-dim)" : contract.priority === "medium" ? "var(--warning-dim)" : "var(--success-dim)",
              color: contract.priority === "high" ? "var(--danger)" : contract.priority === "medium" ? "var(--warning)" : "var(--success)",
              flexShrink: 0,
              marginLeft: "12px"
            }}>
              {contract.priority.toUpperCase()}
            </span>
          </div>

          {contract.aiNote && (
            <div style={{
              padding: "0.75rem",
              background: "var(--surface-2)",
              borderRadius: "6px",
              borderLeft: "2px solid var(--accent-dim)",
              marginTop: "8px"
            }}>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.7", fontStyle: "italic" }}>
                "{contract.aiNote}"
              </p>
            </div>
          )}

          {callout && (
            <div style={{
              padding: "0.75rem",
              background: "var(--danger-dim)",
              borderRadius: "6px",
              borderLeft: "2px solid var(--danger)",
              marginTop: "8px"
            }}>
              <p style={{ fontSize: "12px", color: "var(--danger)", lineHeight: "1.7" }}>
                {callout}
              </p>
            </div>
          )}

          {!isCompleted && (
            <div style={{
              display: "flex",
              gap: "8px",
              marginTop: "1rem",
              paddingTop: "0.875rem",
              borderTop: "0.5px solid var(--border)",
              flexWrap: "wrap"
            }}>
              <button
                onClick={handleComplete}
                disabled={completing}
                style={{
                  padding: "0.4rem 1rem",
                  background: "var(--success-dim)",
                  border: "0.5px solid rgba(74,222,128,0.3)",
                  color: "var(--success)",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "500",
                  cursor: "pointer"
                }}
              >
                {completing ? "saving..." : "✓ Complete"}
              </button>

              {(isOverdue || isUrgent) && (
                <button
                  onClick={() => setInterrogating(true)}
                  style={{
                    padding: "0.4rem 1rem",
                    background: "var(--danger-dim)",
                    border: "0.5px solid rgba(255,87,87,0.3)",
                    color: "var(--danger)",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "500",
                    cursor: "pointer"
                  }}
                >
                  ⚡ Interrogate
                </button>
              )}

              {!rescheduling ? (
                <button
                  onClick={() => setRescheduling(true)}
                  style={{
                    padding: "0.4rem 1rem",
                    background: "transparent",
                    border: "0.5px solid var(--border-bright)",
                    color: "var(--text-muted)",
                    borderRadius: "6px",
                    fontSize: "12px",
                    cursor: "pointer"
                  }}
                >
                  Reschedule
                </button>
              ) : (
                <div style={{ display: "flex", gap: "6px", alignItems: "center", flex: 1 }}>
                  <input
                    type="datetime-local"
                    value={newDeadline}
                    onChange={e => setNewDeadline(e.target.value)}
                    style={{
                      flex: 1,
                      background: "var(--surface-2)",
                      border: "0.5px solid var(--border-bright)",
                      borderRadius: "6px",
                      padding: "0.375rem 0.5rem",
                      fontSize: "12px",
                      color: "var(--text-primary)",
                      outline: "none",
                      fontFamily: "inherit"
                    }}
                  />
                  <button
                    onClick={handleReschedule}
                    disabled={!newDeadline}
                    style={{
                      padding: "0.375rem 0.75rem",
                      background: "var(--danger)",
                      border: "none",
                      color: "white",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "500",
                      cursor: "pointer"
                    }}
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setRescheduling(false)}
                    style={{
                      padding: "0.375rem 0.75rem",
                      background: "transparent",
                      border: "0.5px solid var(--border)",
                      color: "var(--text-muted)",
                      borderRadius: "6px",
                      fontSize: "12px",
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {interrogating && (
        <InterrogationMode
          contract={contract}
          onClose={() => setInterrogating(false)}
        />
      )}
    </>
  );
}