import {
  Database,
  StakeRecipientType,
  CheckInFrequency,
  GoalStatus,
  CheckInStatus,
  TransactionStatus,
  TransactionType,
} from "./database.types";

export type {
  Database,
  StakeRecipientType,
  CheckInFrequency,
  GoalStatus,
  CheckInStatus,
  TransactionStatus,
  TransactionType,
};

// Extracted types from database
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Goal = Database["public"]["Tables"]["goals"]["Row"];
export type CheckIn = Database["public"]["Tables"]["check_ins"]["Row"];
export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

// Insert types
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type GoalInsert = Database["public"]["Tables"]["goals"]["Insert"];
export type CheckInInsert = Database["public"]["Tables"]["check_ins"]["Insert"];
export type TransactionInsert =
  Database["public"]["Tables"]["transactions"]["Insert"];

// Update types
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
export type GoalUpdate = Database["public"]["Tables"]["goals"]["Update"];
export type CheckInUpdate = Database["public"]["Tables"]["check_ins"]["Update"];
export type TransactionUpdate =
  Database["public"]["Tables"]["transactions"]["Update"];

// Extended types with relations
export interface GoalWithCheckIns extends Goal {
  check_ins?: CheckIn[];
  transactions?: Transaction[];
}

export interface DashboardStats {
  activeGoals: number;
  completedGoals: number;
  failedGoals: number;
  totalStaked: number;
  totalRefunded: number;
  totalPenalties: number;
  successRate: number;
}

// Data aggregation settings
export type AggregationMethod = "sum" | "max" | "min" | "last" | "first" | "average";

// Trajectory segment for multi-rate goals
export interface TrajectorySegment {
  id?: string;
  goal_id: string;
  start_date: string;
  end_date: string;
  start_value: number;
  end_value: number;
  rate: number;
  created_at?: string;
}

