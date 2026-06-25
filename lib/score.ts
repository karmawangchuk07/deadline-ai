import { Contract } from "./type";
import { getAxisScore, saveAxisScore, getContracts, updateContract } from "./storage";

export function calculateAxisScore(): number {
  return getAxisScore();
}

export function onContractCompleted(contract: Contract): number {
  const current = getAxisScore();
  const now = new Date();
  const deadline = new Date(contract.deadline);
  const onTime = now <= deadline;

  let delta = onTime ? 10 : 4;
  if (contract.rescheduleCount >= 3) delta += 15;

  const newScore = Math.min(100, current + delta);
  saveAxisScore(newScore);
  return newScore;
}

export function onContractRescheduled(): number {
  const current = getAxisScore();
  const newScore = Math.max(0, current - 8);
  saveAxisScore(newScore);
  return newScore;
}

export function onBlockerAdded(): number {
  const current = getAxisScore();
  const newScore = Math.min(100, current + 2);
  saveAxisScore(newScore);
  return newScore;
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return "Reliable";
  if (score >= 60) return "Improving";
  if (score >= 40) return "Inconsistent";
  if (score >= 20) return "Struggling";
  return "Breaking promises";
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "#639922";
  if (score >= 60) return "#BA7517";
  if (score >= 40) return "#888888";
  return "#E24B4A";
}