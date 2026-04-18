export function buildDefaultFileName(prefix = "Excalidraw Drawing") {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  const datePart = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate())
  ].join("-");
  const timePart = [pad(now.getHours()), pad(now.getMinutes())].join("-");
  return `${prefix} ${datePart} ${timePart}.excalidraw`;
}
