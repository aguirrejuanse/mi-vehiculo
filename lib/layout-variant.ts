// A/B layout variants for the vehicle detail page.
// `?layout=a|b` overrides the assignment (manual comparison / debugging);
// otherwise a deterministic 50/50 bucket from the Clerk userId keeps each
// user on a stable variant across visits.
export type DetailLayout = "a" | "b";

export function resolveDetailLayout(
  userId: string,
  param: string | string[] | undefined,
): DetailLayout {
  if (param === "a" || param === "b") return param;

  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) | 0;
  }
  return (hash & 1) === 0 ? "a" : "b";
}
