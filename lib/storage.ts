import { Contract, ProcrastinationProfile } from "..//lib/type";

const CONTRACTS_KEY = "axis-contracts";
const PROFILE_KEY = "axis-profile";
const SCORE_KEY = "axis-score";

export function getContracts(): Contract[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(CONTRACTS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveContracts(contracts: Contract[]): void {
  localStorage.setItem(CONTRACTS_KEY, JSON.stringify(contracts));
}

export function addContract(contract: Contract): void {
  const contracts = getContracts();
  saveContracts([...contracts, contract]);
}

export function updateContract(id: string, updates: Partial<Contract>): void {
  const contracts = getContracts();
  saveContracts(contracts.map(c => c.id === id ? { ...c, ...updates } : c));
}

export function deleteContract(id: string): void {
  saveContracts(getContracts().filter(c => c.id !== id));
}

export function getProfile(): ProcrastinationProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PROFILE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function saveProfile(profile: ProcrastinationProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function getAxisScore(): number {
  if (typeof window === "undefined") return 50;
  const raw = localStorage.getItem(SCORE_KEY);
  return raw ? parseInt(raw) : 50;
}

export function saveAxisScore(score: number): void {
  localStorage.setItem(SCORE_KEY, Math.min(100, Math.max(0, score)).toString());
}