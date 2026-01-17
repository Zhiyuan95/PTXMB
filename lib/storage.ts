export type Unit = "times" | "minutes" | "sessions" | "pages";

export type Template = {
  id: string;
  name: string;
  category?: string;
  unit: Unit;
  dailyTarget?: number;
  minimumTarget?: number;
  initialTotal?: number;
  isActive: boolean;
  createdAt: string;
};

export type Entry = {
  id: string;
  templateId: string;
  amount: number;
  unit: Unit;
  entryDate: string;
  createdAt: string;
};

export type Preferences = {
  dedicationText: string;
};

export const unitLabels: Record<Unit, string> = {
  times: "次",
  minutes: "分钟",
  sessions: "座",
  pages: "页",
};

const STORAGE_KEYS = {
  templates: "ptxmb.templates.v1",
  entries: "ptxmb.entries.v1",
  prefs: "ptxmb.prefs.v1",
};

const defaultPreferences: Preferences = {
  dedicationText: "愿以此功德，回向法界众生，离苦得乐，菩提增长。",
};

const isBrowser = () => typeof window !== "undefined";

const read = <T,>(key: string, fallback: T): T => {
  if (!isBrowser()) {
    return fallback;
  }
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const write = <T,>(key: string, value: T) => {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.setItem(key, JSON.stringify(value));
};

export const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const loadTemplates = () => read<Template[]>(STORAGE_KEYS.templates, []);

export const saveTemplates = (templates: Template[]) =>
  write(STORAGE_KEYS.templates, templates);

export const loadEntries = () => read<Entry[]>(STORAGE_KEYS.entries, []);

export const saveEntries = (entries: Entry[]) =>
  write(STORAGE_KEYS.entries, entries);

export const loadPreferences = () =>
  read<Preferences>(STORAGE_KEYS.prefs, defaultPreferences);

export const savePreferences = (prefs: Preferences) =>
  write(STORAGE_KEYS.prefs, prefs);
