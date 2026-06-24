const longDate = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

const shortTime = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
});

export function greeting(d = new Date()): string {
  const h = d.getHours();
  if (h < 5) return "Bonne nuit";
  if (h < 12) return "Bonjour";
  if (h < 18) return "Bon après-midi";
  return "Bonsoir";
}

export function longDateLabel(d = new Date()): string {
  const s = longDate.format(d);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function timeLabel(d = new Date()): string {
  return shortTime.format(d);
}

export function relativeTime(iso: string | null): string {
  if (!iso) return "";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  const diff = Date.now() - t;
  const min = Math.round(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const days = Math.round(h / 24);
  if (days < 7) return `il y a ${days} j`;
  return shortTime.format(new Date(t));
}

export function clockHM(iso: string | null): string {
  if (!iso) return "";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  return shortTime.format(new Date(t));
}

export type WeatherBucket =
  | "clear"
  | "partly"
  | "cloud"
  | "fog"
  | "drizzle"
  | "rain"
  | "snow"
  | "storm";

export function weatherBucket(code: number): WeatherBucket {
  if (code === 0) return "clear";
  if (code === 1 || code === 2) return "partly";
  if (code === 3) return "cloud";
  if (code === 45 || code === 48) return "fog";
  if (code >= 51 && code <= 57) return "drizzle";
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if (code >= 95) return "storm";
  return "cloud";
}

export function weatherLabel(code: number): string {
  switch (weatherBucket(code)) {
    case "clear":
      return "Ciel dégagé";
    case "partly":
      return "Quelques nuages";
    case "cloud":
      return "Couvert";
    case "fog":
      return "Brouillard";
    case "drizzle":
      return "Bruine";
    case "rain":
      return "Pluie";
    case "snow":
      return "Neige";
    case "storm":
      return "Orage";
  }
}
