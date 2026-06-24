export type SourceKind = "rss" | "email" | "notification";

export interface FeedItem {
  id: string;
  source: SourceKind;
  sourceName: string;
  title: string;
  summary: string;
  link: string | null;
  author: string | null;
  image: string | null;
  published: string | null;
  unread: boolean;
}

export interface WeatherNow {
  tempC: number;
  feelsLikeC: number;
  code: number;
  isDay: boolean;
  windKmh: number;
  humidity: number;
}

export interface WeatherDay {
  date: string;
  maxC: number;
  minC: number;
  code: number;
  precipProb: number;
  sunrise: string;
  sunset: string;
}

export interface WeatherHour {
  time: string;
  tempC: number;
  code: number;
  precipProb: number;
}

export interface Weather {
  place: string;
  now: WeatherNow;
  today: WeatherDay;
  hourly: WeatherHour[];
  daily: WeatherDay[];
}

export interface FeedSourceConfig {
  name: string;
  url: string;
  enabled: boolean;
}

export interface EmailConfig {
  enabled: boolean;
  host: string;
  port: number;
  username: string;
  password: string;
  mailbox: string;
}

export interface NotificationsConfig {
  enabled: boolean;
  ntfyServer: string;
  topics: string[];
}

export interface LocationConfig {
  auto: boolean;
  place: string;
  lat: number;
  lon: number;
}

export interface BriefConfig {
  slideSeconds: number;
  greetingName: string;
  newsPerSlide: number;
  maxNewsSlides: number;
}

export interface Config {
  location: LocationConfig;
  feeds: FeedSourceConfig[];
  email: EmailConfig;
  notifications: NotificationsConfig;
  brief: BriefConfig;
}

export type SlideKind =
  | "greeting"
  | "weather"
  | "news"
  | "emails"
  | "notifications"
  | "outro";

export interface Slide {
  id: string;
  kind: SlideKind;
  items?: FeedItem[];
}

export const DEFAULT_FEEDS: FeedSourceConfig[] = [
  { name: "Le Monde", url: "https://www.lemonde.fr/rss/une.xml", enabled: true },
  {
    name: "Hacker News",
    url: "https://hnrss.org/frontpage",
    enabled: true,
  },
  {
    name: "BBC World",
    url: "http://feeds.bbci.co.uk/news/world/rss.xml",
    enabled: true,
  },
  {
    name: "The Verge",
    url: "https://www.theverge.com/rss/index.xml",
    enabled: true,
  },
];

export const DEFAULT_CONFIG: Config = {
  location: { auto: true, place: "", lat: 0, lon: 0 },
  feeds: DEFAULT_FEEDS,
  email: {
    enabled: false,
    host: "",
    port: 993,
    username: "",
    password: "",
    mailbox: "INBOX",
  },
  notifications: { enabled: false, ntfyServer: "https://ntfy.sh", topics: [] },
  brief: {
    slideSeconds: 8,
    greetingName: "",
    newsPerSlide: 4,
    maxNewsSlides: 3,
  },
};
