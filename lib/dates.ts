const pad = (value: number) => value.toString().padStart(2, "0");

export const toISODate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const fromISODate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const todayISO = () => toISODate(new Date());

export const addDays = (value: string, delta: number) => {
  const date = fromISODate(value);
  date.setDate(date.getDate() + delta);
  return toISODate(date);
};

export const getWeekStart = (value: string) => {
  const date = fromISODate(value);
  const day = date.getDay();
  const diff = (day + 6) % 7;
  date.setDate(date.getDate() - diff);
  return toISODate(date);
};

export const isSameWeek = (value: string, compare: string) =>
  getWeekStart(value) === getWeekStart(compare);

export const formatShortDate = (value: string) => {
  const date = fromISODate(value);
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(
    date.getDate()
  )}`;
};

export const getWeekRangeLabel = (value: string) => {
  const start = fromISODate(getWeekStart(value));
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${formatShortDate(toISODate(start))} - ${formatShortDate(
    toISODate(end)
  )}`;
};
