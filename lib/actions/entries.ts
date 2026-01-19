"use server";

import { createClient } from "@/lib/supabase/server";
import { Entry } from "@/lib/storage";

const mapToEntry = (row: any): Entry => ({
  id: row.id,
  templateId: row.template_id,
  amount: row.amount,
  unit: row.unit,
  entryDate: row.entry_date, // 'YYYY-MM-DD'
  note: row.note,
  createdAt: row.created_at,
});

export async function getEntries(): Promise<Entry[]> {
  const supabase = await createClient();
  // Fetch entries (maybe limit to last 365 days or similar in future)
  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching entries:", error);
    return [];
  }

  return data.map(mapToEntry);
}

export async function addEntry(
  entry: Omit<Entry, "id" | "createdAt">
): Promise<Entry | null> {
  const supabase = await createClient();
  const user = (await supabase.auth.getUser()).data.user;

  if (!user) throw new Error("User not found");

  const { data, error } = await supabase
    .from("entries")
    .insert({
      user_id: user.id,
      template_id: entry.templateId,
      amount: entry.amount,
      unit: entry.unit,
      entry_date: entry.entryDate,
      note: entry.note,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating entry:", error);
    return null;
  }

  return mapToEntry(data);
}
