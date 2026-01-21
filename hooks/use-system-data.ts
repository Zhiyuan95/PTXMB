"use client";

import { useMemo } from "react";
import {
  useTemplatesQuery,
  useEntriesQuery,
  usePreferencesQuery,
  useAddTemplateMutation,
  useUpdateTemplateMutation,
  useAddEntryMutation,
  useUpdateDedicationMutation,
  useDeleteTemplateMutation,
} from "@/hooks/use-queries";
import { Template, Unit } from "@/lib/storage";

export function useSystemData() {
  const { data: templates = [] } = useTemplatesQuery();
  const { data: entries = [] } = useEntriesQuery();
  const { data: preferences } = usePreferencesQuery();

  const addTemplateMutation = useAddTemplateMutation();
  const updateTemplateMutation = useUpdateTemplateMutation();
  const deleteTemplateMutation = useDeleteTemplateMutation();
  const addEntryMutation = useAddEntryMutation();
  const updateDedicationMutation = useUpdateDedicationMutation();

  const addEntry = (
    templateId: string,
    amount: number,
    unit: Unit,
    date: string,
    note?: string
  ) => {
    addEntryMutation.mutate({ templateId, amount, unit, entryDate: date, note });
  };

  const addTemplate = (
    data: Omit<Template, "id" | "isActive" | "createdAt">
  ) => {
    addTemplateMutation.mutate(data);
  };

  const updateTemplate = (id: string, updates: Partial<Template>) => {
    updateTemplateMutation.mutate({ id, updates });
  };

  const toggleTemplateActive = (id: string) => {
    // Find current status to toggle
    const current = templates.find((t) => t.id === id);
    if (current) {
      updateTemplateMutation.mutate({
        id,
        updates: { isActive: !current.isActive },
      });
    }
  };

  const updateDedication = (text: string) => {
    updateDedicationMutation.mutate(text);
  };

  const deleteTemplate = (id: string) => {
    deleteTemplateMutation.mutate(id);
  };

  const loading = false; // TanStack Query handles loading internals, but we can expose if needed.

  return {
    templates,
    entries,
    preferences: preferences || null,
    addEntry,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    toggleTemplateActive,
    updateDedication,
    loading,
  };
}
