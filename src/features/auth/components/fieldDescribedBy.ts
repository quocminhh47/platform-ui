export function fieldDescribedBy(id: string, error: string | undefined, hint?: string): string | undefined {
  if (error) {
    return `${id}-error`;
  }
  return hint ? `${id}-hint` : undefined;
}
