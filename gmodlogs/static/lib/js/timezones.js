function ApplyClientTimezone(value) {
  if (!value) return value;

  if (typeof value === "string") {
    let normalized = value;

    normalized = normalized.replace(/\.(\d{3})\d+/, ".$1");

    if (!normalized.endsWith("Z") && !normalized.includes("+")) {
      normalized += "Z";
    }

    const date = new Date(normalized);

    const pad = (n) => String(n).padStart(2, "0");

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` + `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.` + `${String(date.getMilliseconds()).padStart(3, "0")}`;
  }

  return value;
}
