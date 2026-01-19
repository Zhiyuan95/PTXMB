"use server";

import { createClient } from "@/lib/supabase/server";
import { Preferences } from "@/lib/storage";

const mapToPreferences = (row: any): Preferences => ({
  dedicationText: row.dedication_text || "",
});

export async function getPreferences(): Promise<Preferences | null> {
  const supabase = await createClient();
  const user = (await supabase.auth.getUser()).data.user;

  if (!user) return null;

  const { data, error } = await supabase
    .from("preferences")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "Row not found", which is fine for first time
    console.error("Error fetching preferences:", error);
  }

  if (!data) return null;

  return mapToPreferences(data);
}

export async function updateDedication(text: string): Promise<Preferences | null> {
  const supabase = await createClient();
  const user = (await supabase.auth.getUser()).data.user;

  if (!user) throw new Error("User not found");

  const { data, error } = await supabase
    .from("preferences")
    .upsert({
      user_id: user.id,
      dedication_text: text,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error updating dedication:", error);
    return null;
  }

  return mapToPreferences(data);
}
