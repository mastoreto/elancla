export type MovementType = "income" | "expense";

export type Currency = "UYU" | "USD";

export type MovementReconciliation = "reconciled" | "pending" | "flagged";

export interface Movement {
  id: string;
  date: string;
  concept: string;
  type: MovementType;
  description: string;
  currency: Currency;
  amount: number;
  project?: string;
  reconciliation?: MovementReconciliation;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "treasurer" | "viewer";
  avatar?: string;
}

export type ProjectStatus = "planning" | "in_progress" | "finished" | "closed";

export interface ProjectDocument {
  id: string;
  name: string;
  type: "pdf" | "image" | "link";
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface ProjectHistoryEntry {
  id: string;
  action: "created" | "edited" | "status_changed" | "budget_updated";
  user: string;
  date: string;
  details?: string;
  previousValue?: string;
  newValue?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  ministries: string[];
  budget: number;
  currency: Currency;
  spent: number;
  status: ProjectStatus;
  startDate: string;
  endDate?: string;
  createdBy: string;
  documents: ProjectDocument[];
  history: ProjectHistoryEntry[];
}

export type RequestStatus = "pending" | "approved" | "rejected";

export interface Ministry {
  id: string;
  name: string;
  budget: number;
  budgetCurrency: Currency;
}

export interface Leader {
  id: string;
  name: string;
  ministryId: string;
}

export interface MoneyRequest {
  id: string;
  date: string;
  concept: string;
  description?: string;
  ministry: string;
  leader: string;
  currency: Currency;
  amount: number;
  status: RequestStatus;
  timeline: RequestTimelineEntry[];
}

export interface RequestTimelineEntry {
  id: string;
  action: "created" | "approved" | "rejected" | "comment";
  user: string;
  date: string;
  comment?: string;
}
