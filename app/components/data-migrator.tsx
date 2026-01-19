"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/app/providers/auth-provider";
import { loadEntries, loadPreferences, loadTemplates, type Template, type Entry } from "@/lib/storage";
import { useAddTemplateMutation, useAddEntryMutation, useUpdateDedicationMutation } from "@/hooks/use-queries";

export default function DataMigrator() {
  const { user } = useAuth();
  const ranRef = useRef(false);
  
  const addTemplateMutation = useAddTemplateMutation();
  const addEntryMutation = useAddEntryMutation();
  const updateDedicationMutation = useUpdateDedicationMutation();

  useEffect(() => {
    // Only run if user is logged in (including anonymous) and haven't run yet
    if (!user || ranRef.current) return;

    const localTemplates = loadTemplates();
    const localEntries = loadEntries();
    const localPrefs = loadPreferences();

    // Check if we have local data and if we haven't migrated yet
    const hasMigrated = localStorage.getItem("ptxmb_migrated");

    if (localTemplates.length === 0 && localEntries.length === 0 && !localPrefs) {
      return;
    }

    if (hasMigrated) {
       // Optional: Cleaning up old keys could happen here, but safer to keep for a bit
       return;
    }

    console.log("Starting data migration...");
    ranRef.current = true;

    // 1. Migrate Templates
    // We create a map of OldID -> NewID (Cloud ID) because cloud generates new UUIDs usually,
    // although our server action might respect ID if we sent it? 
    // Actually our addTemplate action generates a new ID: `default gen_random_uuid()`.
    // So we must handle the ID mapping if we want to keep entry relationships.
    // However, our `addTemplate` action implementation currently IGNORES the passed ID and makes a new one.
    // AND our `addEntry` action takes `templateId`.
    
    // PROBLEM: We need to map old template IDs to new Cloud IDs to link entries correctly.
    // Solution: We will handle this by migrating templates sequentially, getting the new ID, 
    // then uploading entries for that template.
    
    const migrate = async () => {
        try {
            const templateIdMap = new Map<string, string>();

            // Migrate Templates
            for (const t of localTemplates) {
                // We assume exact name match isn't an issue or we just duplicate.
                // Since this is fresh cloud account, duplication is unlikely unless run twice.
                const newT = await new Promise<Template | null>((resolve) => {
                    // We need to call the mutation but wait for result? 
                    // React Query mutations are async.
                    // Actually `mutateAsync` fits better here.
                    addTemplateMutation.mutateAsync({
                        name: t.name,
                        category: t.category,
                        unit: t.unit,
                        dailyTarget: t.dailyTarget,
                        minimumTarget: t.minimumTarget,
                        totalTarget: t.totalTarget,
                        initialTotal: t.initialTotal,
                    }).then((res) => {
                         // The mutation returns... wait, our hook returns what? 
                         // Our hook returns whatever `addTemplate` server action returns?
                         // Let's check `useAddTemplateMutation`.
                         // mutationFn returns Promise<Template | null>.
                         resolve(res);
                    });
                });

                if (newT) {
                    templateIdMap.set(t.id, newT.id);
                }
            }

            // Migrate Entries
            for (const e of localEntries) {
                const newTemplateId = templateIdMap.get(e.templateId);
                // If template didn't migrate or wasn't found, we preserve it? 
                // Or if it was deleted locally but entries remain? 
                // Let's skip if no parent template found to ensure data integrity.
                if (newTemplateId) {
                    await addEntryMutation.mutateAsync({
                        templateId: newTemplateId,
                        amount: e.amount,
                        unit: e.unit,
                        entryDate: e.entryDate,
                    });
                }
            }

            // Migrate Preferences
            if (localPrefs?.dedicationText) {
                await updateDedicationMutation.mutateAsync(localPrefs.dedicationText);
            }

            // Mark completed
            localStorage.setItem("ptxmb_migrated", "true");
            console.log("Migration completed.");
            
            // Optional: Clear legacy keys to avoid confusion?
            // localStorage.removeItem("templates");
            // localStorage.removeItem("entries");
        } catch (err) {
            console.error("Migration failed", err);
        }
    };

    migrate();

  }, [user, addTemplateMutation, addEntryMutation, updateDedicationMutation]);

  return null; // Invisible component
}
