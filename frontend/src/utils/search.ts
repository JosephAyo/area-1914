export function resolveSearchSelection(
  query: string,
  suggestions: { title: string }[],
  selectedIndex: number,
): string | null {
  const trimmed = query.trim();
  if (!trimmed) return null;
  return suggestions[selectedIndex]?.title || suggestions[0]?.title || trimmed;
}
