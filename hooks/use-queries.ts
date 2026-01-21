"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTemplates, addTemplate, updateTemplate, deleteTemplate } from "@/lib/actions/templates";
import { getEntries, addEntry } from "@/lib/actions/entries";
import { getPreferences, updateDedication } from "@/lib/actions/preferences";
import { Template, Entry, Preferences, Unit } from "@/lib/storage";

// Keys
export const queryKeys = {
  templates: ["templates"],
  entries: ["entries"],
  preferences: ["preferences"],
};

// --- Templates ---

export function useTemplatesQuery() {
  return useQuery({
    queryKey: queryKeys.templates,
    queryFn: () => getTemplates(),
  });
}

export function useAddTemplateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addTemplate,
    onMutate: async (newTemplateData) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.templates });
      const previousTemplates = queryClient.getQueryData<Template[]>(queryKeys.templates);

      const optimisticTemplate: Template = {
        id: "temp-" + Date.now(), // Temporary ID
        ...newTemplateData,
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Template[]>(queryKeys.templates, (old) => [
        ...(old || []),
        optimisticTemplate,
      ]);

      return { previousTemplates };
    },
    onError: (_err, _newTemplate, context) => {
      queryClient.setQueryData(queryKeys.templates, context?.previousTemplates);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates });
    },
  });
}

export function useUpdateTemplateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Template> }) =>
      updateTemplate(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.templates });
      const previousTemplates = queryClient.getQueryData<Template[]>(queryKeys.templates);

      queryClient.setQueryData<Template[]>(queryKeys.templates, (old) =>
        (old || []).map((t) => (t.id === id ? { ...t, ...updates } : t))
      );

      return { previousTemplates };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(queryKeys.templates, context?.previousTemplates);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates });
    },
  });
}

export function useDeleteTemplateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTemplate,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.templates });
      const previousTemplates = queryClient.getQueryData<Template[]>(queryKeys.templates);

      queryClient.setQueryData<Template[]>(queryKeys.templates, (old) =>
        (old || []).filter((t) => t.id !== id)
      );

      return { previousTemplates };
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(queryKeys.templates, context?.previousTemplates);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates });
    },
  });
}

// --- Entries ---

export function useEntriesQuery() {
  return useQuery({
    queryKey: queryKeys.entries,
    queryFn: () => getEntries(),
  });
}

export function useAddEntryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entry: { templateId: string; amount: number; unit: Unit; entryDate: string; note?: string }) =>
      addEntry(entry),
    onMutate: async (newEntry) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.entries });
      const previousEntries = queryClient.getQueryData<Entry[]>(queryKeys.entries);

      const optimisticEntry: Entry = {
        id: "temp-" + Date.now(),
        ...newEntry,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Entry[]>(queryKeys.entries, (old) => [
        optimisticEntry,
        ...(old || []),
      ]);

      return { previousEntries };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(queryKeys.entries, context?.previousEntries);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.entries });
    },
  });
}

// --- Preferences ---

export function usePreferencesQuery() {
  return useQuery({
    queryKey: queryKeys.preferences,
    queryFn: () => getPreferences(),
  });
}

export function useUpdateDedicationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDedication,
    onMutate: async (text) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.preferences });
      const previousPrefs = queryClient.getQueryData<Preferences>(queryKeys.preferences);

      queryClient.setQueryData<Preferences>(queryKeys.preferences, (old) => ({
        ...old,
        dedicationText: text,
      }));

      return { previousPrefs };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(queryKeys.preferences, context?.previousPrefs);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.preferences });
    },
  });
}
