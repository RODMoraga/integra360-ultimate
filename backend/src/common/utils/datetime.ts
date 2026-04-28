export const toUtcIsoString = (value: Date | null | undefined): string | null => {
  if (!value) {
    return null;
  }

  return value.toISOString();
};
