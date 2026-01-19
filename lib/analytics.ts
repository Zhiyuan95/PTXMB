import { Template, Entry } from "./storage";
import { eachDayOfInterval, format, isSameDay, parseISO } from "date-fns";

export interface ChartDataPoint {
  dateKey: string; // The display label (e.g. "10-24")
  fullDate: Date;  // For sorting
  _total?: number; // Daily total for line chart
  [templateName: string]: any; // Dynamic keys: "金刚萨埵": 1000
}

export function aggregateChartData(
  templates: Template[],
  entries: Entry[],
  dateRange: { start: Date | null; end: Date }
): ChartDataPoint[] {
  // 1. Determine Start Date
  let start = dateRange.start;
  if (!start) {
    if (entries.length === 0) {
      start = new Date();
      start.setDate(start.getDate() - 7); // Default to last week if empty
    } else {
      // Find earliest entry
      const timestamps = entries.map((e) => parseISO(e.entryDate).getTime());
      start = new Date(Math.min(...timestamps));
    }
  }

  // 2. Generate Days Array
  let days: Date[] = [];
  try {
      days = eachDayOfInterval({ start, end: dateRange.end });
  } catch (e) {
      // Fallback if dates are invalid
      days = [new Date()];
  }

  // 3. Map Data
  return days.map((day) => {
    const point: ChartDataPoint = {
      dateKey: format(day, "MM/dd"),
      fullDate: day,
    };

    // Initialize all templates to 0 for this day (needed for Stacked Chart)
    templates.forEach(t => {
        point[t.name] = 0;
    });

    // Sum entries
    let dayTotal = 0;
    // Optimization: filtering entries inside loop is O(N*M), could be optimized but fine for <10k entries.
    entries.forEach((e) => {
        const entryDate = parseISO(e.entryDate);
        if (isSameDay(entryDate, day)) {
            // Find template name (assuming template exists)
            const template = templates.find(t => t.id === e.templateId);
            if (template) {
                const amount = e.amount;
                point[template.name] = (point[template.name] as number) + amount;
                dayTotal += amount;
            }
        }
    });

    point._total = dayTotal;
    return point;
  });
}

export function calculateSummary(
    entries: Entry[],
    dateRange: { start: Date | null; end: Date },
    templateIds?: string[]
) {
    let filteredEntries = entries;
    
    if (dateRange.start) {
        const startTime = dateRange.start.getTime();
        const endTime = dateRange.end.getTime();
        filteredEntries = entries.filter(e => {
            const t = parseISO(e.entryDate).getTime();
            const dateMatch = t >= startTime && t <= endTime;
            const templateMatch = templateIds && templateIds.length > 0 ? templateIds.includes(e.templateId) : true;
            return dateMatch && templateMatch;
        });
    } else if (templateIds && templateIds.length > 0) {
        filteredEntries = entries.filter(e => templateIds.includes(e.templateId));
    }

    const totalCount = filteredEntries.reduce((sum, e) => sum + e.amount, 0);
    
    // Estimate consistency (days practiced)
    const uniqueDays = new Set(filteredEntries.map(e => e.entryDate)).size;
    
    return {
        totalCount,
        uniqueDays,
        entryCount: filteredEntries.length
    };
}
