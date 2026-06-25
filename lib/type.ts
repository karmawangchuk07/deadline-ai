export type Contract = {
  id: string;
  title: string;
  deadline: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "completed" | "overdue";
  blocker: string;
  sacrifice: string;
  rescheduleCount: number;
  createdAt: string;
  completedAt?: string;
  aiNote: string;
  axisScore: number;
};

export type ProcrastinationProfile = {
  biggestPostponement: string;
  idealDay: string;
  sabotagePattern: string;
  aiSummary: string;
};