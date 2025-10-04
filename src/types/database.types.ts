export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          stake_amount: number;
          stake_recipient_type: StakeRecipientType;
          stake_recipient_id: string | null;
          start_date: string;
          end_date: string;
          check_in_frequency: CheckInFrequency;
          status: GoalStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          stake_amount: number;
          stake_recipient_type: StakeRecipientType;
          stake_recipient_id?: string | null;
          start_date: string;
          end_date: string;
          check_in_frequency: CheckInFrequency;
          status?: GoalStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          stake_amount?: number;
          stake_recipient_type?: StakeRecipientType;
          stake_recipient_id?: string | null;
          start_date?: string;
          end_date?: string;
          check_in_frequency?: CheckInFrequency;
          status?: GoalStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      check_ins: {
        Row: {
          id: string;
          goal_id: string;
          user_id: string;
          check_in_date: string;
          status: CheckInStatus;
          notes: string | null;
          evidence_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          goal_id: string;
          user_id: string;
          check_in_date: string;
          status: CheckInStatus;
          notes?: string | null;
          evidence_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          goal_id?: string;
          user_id?: string;
          check_in_date?: string;
          status?: CheckInStatus;
          notes?: string | null;
          evidence_url?: string | null;
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          goal_id: string;
          user_id: string;
          amount: number;
          transaction_type: TransactionType;
          status: TransactionStatus;
          recipient_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          goal_id: string;
          user_id: string;
          amount: number;
          transaction_type: TransactionType;
          status?: TransactionStatus;
          recipient_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          goal_id?: string;
          user_id?: string;
          amount?: number;
          transaction_type?: TransactionType;
          status?: TransactionStatus;
          recipient_id?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

export type StakeRecipientType = "friend" | "charity" | "anti_charity" | "compel";
export type CheckInFrequency = "daily" | "weekly" | "biweekly" | "monthly";
export type GoalStatus = "active" | "completed" | "failed" | "paused";
export type CheckInStatus = "success" | "missed" | "pending";
export type TransactionStatus = "pending" | "completed" | "failed";
export type TransactionType = "stake" | "refund" | "penalty";

