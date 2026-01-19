"use server";

import { createClient } from "@/lib/supabase/server";
import { Template } from "@/lib/storage";

// Helper to map DB row to Template type
const mapToTemplate = (row: any): Template => ({
  id: row.id,
  name: row.name,
  category: row.category,
  unit: row.unit,
  dailyTarget: row.daily_target,
  minimumTarget: row.minimum_target,
  totalTarget: row.total_target,
  initialTotal: row.initial_total,
  isActive: row.is_active,
  color: row.color,
  createdAt: row.created_at,
});

export async function getTemplates(): Promise<Template[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching templates:", error);
    return [];
  }

  return data.map(mapToTemplate);
}

export async function addTemplate(
  template: Omit<Template, "id" | "createdAt" | "isActive">
): Promise<Template | null> {
  const supabase = await createClient();
  const user = (await supabase.auth.getUser()).data.user;

  if (!user) throw new Error("User not found");

  const { data, error } = await supabase
    .from("templates")
    .insert({
      user_id: user.id,
      name: template.name,
      category: template.category,
      unit: template.unit,
      daily_target: template.dailyTarget,
      minimum_target: template.minimumTarget,
      total_target: template.totalTarget,
      initial_total: template.initialTotal,
      is_active: true,
      color: template.color,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating template:", error);
    return null;
  }

  return mapToTemplate(data);
}

export async function updateTemplate(
  id: string,
  updates: Partial<Template>
): Promise<Template | null> {
  const supabase = await createClient();
  
  // Convert frontend camelCase to DB snake_case
  const dbUpdates: any = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.unit !== undefined) dbUpdates.unit = updates.unit;
  if (updates.dailyTarget !== undefined) dbUpdates.daily_target = updates.dailyTarget;
  if (updates.minimumTarget !== undefined) dbUpdates.minimum_target = updates.minimumTarget;
  if (updates.totalTarget !== undefined) dbUpdates.total_target = updates.totalTarget;
  if (updates.initialTotal !== undefined) dbUpdates.initial_total = updates.initialTotal;
  if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
  if (updates.color !== undefined) dbUpdates.color = updates.color;

  const { data, error } = await supabase
    .from("templates")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating template:", error);
    return null;
  }

  return mapToTemplate(data);
}
