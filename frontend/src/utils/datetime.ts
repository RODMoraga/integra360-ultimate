const APP_LOCALE = import.meta.env.VITE_APP_LOCALE ?? "es-CL";
const APP_TIME_ZONE = import.meta.env.VITE_APP_TIME_ZONE ?? "America/Santiago";

const toIsoDateInAppTimeZone = (date: Date) => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  return formatter.format(date);
};

const toDate = (value: string | Date | null | undefined): Date | null => {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDate = (value: string | Date | null | undefined) => {
  const date = toDate(value);
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat(APP_LOCALE, {
    timeZone: APP_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
};

export const formatDateTime = (value: string | Date | null | undefined) => {
  const date = toDate(value);
  if (!date) {
    return "Sin registros";
  }

  return new Intl.DateTimeFormat(APP_LOCALE, {
    timeZone: APP_TIME_ZONE,
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
};

export const getAppTimeZone = () => APP_TIME_ZONE;

export const getTodayIsoDate = () => toIsoDateInAppTimeZone(new Date());

export const getFirstDayOfCurrentMonthIsoDate = () => {
  const todayIso = getTodayIsoDate();
  return `${todayIso.slice(0, 8)}01`;
};
