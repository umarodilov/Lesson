export function getInitials(fullName = "") {
  const s = String(fullName || "").trim().replace(/\s+/g, " ");
  if (!s) return "U";

  const parts = s.split(" ").filter(Boolean);

  // Агар ном + насаб бошад → НН
  if (parts.length >= 2) {
    const a = parts[0][0] || "";
    const b = parts[1][0] || "";
    return (a + b).toUpperCase();
  }

  // Агар танҳо ном бошад → 2 ҳарфи аввал
  const one = parts[0];
  const first2 = (one.slice(0, 2) || one.slice(0, 1)).toUpperCase();
  return first2;
}