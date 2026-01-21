"use server";

import { createClient } from "@/lib/supabase/server";

export type JournalLog = {
  id: string;
  logDate: string;
  content: string;
  updatedAt: string;
};

// Helper to map DB row to JournalLog type
const mapToJournalLog = (row: any): JournalLog => ({
  id: row.id,
  logDate: row.log_date,
  content: row.content,
  updatedAt: row.updated_at,
});

export async function getJournalLog(date: string): Promise<JournalLog | null> {
  const supabase = await createClient();
  const user = (await supabase.auth.getUser()).data.user;
  
  if (!user) return null;

  const { data, error } = await supabase
    .from("journal_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("log_date", date)
    .single();

  if (error) {
    // It's normal to not have a log for a specific date
    return null;
  }

  return mapToJournalLog(data);
}

export async function getRecentJournalLogs(limit: number = 10): Promise<JournalLog[]> {
  const supabase = await createClient();
  const user = (await supabase.auth.getUser()).data.user;
  
  if (!user) return [];

  const { data, error } = await supabase
    .from("journal_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("log_date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching journal logs:", error);
    return [];
  }

  return data.map(mapToJournalLog);
}

export async function upsertJournalLog(date: string, content: string): Promise<JournalLog | null> {
  const supabase = await createClient();
  const user = (await supabase.auth.getUser()).data.user;

  if (!user) throw new Error("User not found");

  // Upsert relies on the unique constraint (user_id, log_date)
  const { data, error } = await supabase
    .from("journal_logs")
    .upsert(
      {
        user_id: user.id,
        log_date: date,
        content: content,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id, log_date",
      }
    )
    .select()
    .single();

  if (error) {
    console.error("Error upserting journal log:", error);
    return null;
  }

  return mapToJournalLog(data);
}
