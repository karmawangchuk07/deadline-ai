"use client";

import { useEffect, useState } from "react";
import { getProfile, getContracts } from "@/lib/storage";
import { Contract, ProcrastinationProfile } from "@/lib/type";
import Onboarding from "@/components/ui/onboarding";
import AddContract from "@/components/ui/AddContract";

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
        color: "var(--text-secondary)",
        fontSize: "14px",
        letterSpacing: "0.05em"
      }}>
        loading...
      </div>
    );
  }

  if (!profile) {
    return <Onboarding onComplete={(p) => setProfile(p)} />;
  }

  return <DashboardScreen />;
}

function DashboardScreen() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [activeTab, setActiveTab] = useState("Contracts");

  useEffect(() => {
    setContracts(getContracts());
  }, []);

function handleAdded(contract: Contract) {
  setContracts(getContracts());
  setShowAdd(false);
}

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      <aside style={{
        width: "220px",
        borderRight: "0.5px solid var(--border)",
        padding: "2rem 1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
        flexShrink: 0
      }}>
        <div style={{
          fontSize: "16px",
          fontWeight: "500",
          letterSpacing: "-0.01em",
          marginBottom: "2rem",
          color: "var(--text-primary)"
        }}>
          AXIS
        </div>
        {["Contracts", "Dashboard", "Emergency Room", "Weekly Letter"].map(item => (
          <div
            key={item}
            onClick={() => setActiveTab(item)}
            style={{
              padding: "0.5rem 0.75rem",
              borderRadius: "6px",
              fontSize: "14px",
              color: activeTab === item ? "var(--text-primary)" : "var(--text-secondary)",
              background: activeTab === item ? "var(--surface)" : "transparent",
              cursor: "pointer",
              transition: "all 0.15s"
            }}
          >
            {item}
          </div>
        ))}
      </aside>

      <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
        {activeTab === "Contracts" && (
          <div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "2rem"
            }}>
              <div>
                <h2 style={{
                  fontSize: "22px",
                  fontWeight: "500",
                  color: "var(--text-primary)"
                }}>
                  Your contracts
                </h2>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                  {contracts.length === 0
                    ? "Nothing here yet. Either you're on top of everything or you haven't been honest."
                    : `${contracts.filter(c => c.status === "pending").length} pending`}
                </p>
              </div>
              <button
                onClick={() => setShowAdd(true)}
                style={{
                  padding: "0.625rem 1.25rem",
                  background: "var(--text-primary)",
                  color: "var(--bg)",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "500",
                  cursor: "pointer"
                }}
              >
                + Add contract
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {contracts.map(contract => (
                <ContractCard key={contract.id} contract={contract} />
              ))}
            </div>
          </div>
        )}

        {activeTab === "Dashboard" && (
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: "500", color: "var(--text-primary)" }}>Dashboard</h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>Coming soon.</p>
          </div>
        )}

        {activeTab === "Emergency Room" && (
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: "500", color: "var(--text-primary)" }}>Emergency Room</h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>Coming soon.</p>
          </div>
        )}

        {activeTab === "Weekly Letter" && (
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: "500", color: "var(--text-primary)" }}>Weekly Letter</h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>Coming soon.</p>
          </div>
        )}
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

function ContractCard({ contract }: { contract: Contract }) {
  const deadline = new Date(contract.deadline);
  const now = new Date();
  const hoursLeft = Math.round((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));
  const isOverdue = hoursLeft < 0;
  const isUrgent = hoursLeft >= 0 && hoursLeft <= 24;

  return (
    <div style={{
      background: "var(--surface)",
      border: `0.5px solid ${isOverdue ? "var(--danger)" : "var(--border)"}`,
      borderRadius: "10px",
      padding: "1.25rem",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <p style={{
            fontSize: "15px",
            fontWeight: "500",
            color: "var(--text-primary)",
            marginBottom: "4px"
          }}>
            {contract.title}
          </p>
          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            {isOverdue
              ? `Overdue by ${Math.abs(hoursLeft)}h`
              : isUrgent
              ? `⚠ ${hoursLeft}h left`
              : `Due ${deadline.toLocaleDateString()}`}
          </p>
        </div>
        <span style={{
          fontSize: "11px",
          padding: "3px 10px",
          borderRadius: "20px",
          background: contract.priority === "high" ? "#3A1A1A" : contract.priority === "medium" ? "#2A2A1A" : "var(--surface-2)",
          color: contract.priority === "high" ? "var(--danger)" : contract.priority === "medium" ? "var(--warning)" : "var(--text-muted)",
          border: "0.5px solid var(--border)"
        }}>
          {contract.priority}
        </span>
      </div>

      {contract.aiNote && (
        <p style={{
          fontSize: "13px",
          color: "var(--text-secondary)",
          marginTop: "0.75rem",
          paddingTop: "0.75rem",
          borderTop: "0.5px solid var(--border)",
          lineHeight: "1.6",
          fontStyle: "italic"
        }}>
          "{contract.aiNote}"
        </p>
      )}
    </div>
  );
}