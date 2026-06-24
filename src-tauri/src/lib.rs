use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::{Mutex, OnceLock};
use std::time::Duration;
use notify::Watcher;
use tauri::Emitter;

#[derive(Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
struct FeedItem {
    id: String,
    source: String,
    source_name: String,
    title: String,
    summary: String,
    link: Option<String>,
    author: Option<String>,
    image: Option<String>,
    published: Option<String>,
    unread: bool,
}

#[derive(Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
struct WeatherNow {
    temp_c: f64,
    feels_like_c: f64,
    code: i32,
    is_day: bool,
    wind_kmh: f64,
    humidity: f64,
}

#[derive(Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
struct WeatherDay {
    date: String,
    max_c: f64,
    min_c: f64,
    code: i32,
    precip_prob: f64,
    sunrise: String,
    sunset: String,
}

#[derive(Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
struct WeatherHour {
    time: String,
    temp_c: f64,
    code: i32,
    precip_prob: f64,
}

#[derive(Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
struct Weather {
    place: String,
    now: WeatherNow,
    today: WeatherDay,
    hourly: Vec<WeatherHour>,
    daily: Vec<WeatherDay>,
}

fn default_true() -> bool {
    true
}
fn default_port() -> u16 {
    993
}
fn default_ntfy() -> String {
    "https://ntfy.sh".into()
}
fn default_mailbox() -> String {
    "INBOX".into()
}
fn default_slide_seconds() -> f64 {
    8.0
}
fn default_news_per_slide() -> f64 {
    4.0
}
fn default_max_news_slides() -> f64 {
    3.0
}

#[derive(Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase", default)]
struct FeedSourceConfig {
    name: String,
    url: String,
    #[serde(default = "default_true")]
    enabled: bool,
}

#[derive(Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase", default)]
struct EmailConfig {
    enabled: bool,
    host: String,
    #[serde(default = "default_port")]
    port: u16,
    username: String,
    password: String,
    #[serde(default = "default_mailbox")]
    mailbox: String,
}

#[derive(Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase", default)]
struct NotificationsConfig {
    enabled: bool,
    #[serde(default = "default_ntfy")]
    ntfy_server: String,
    topics: Vec<String>,
}

#[derive(Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase", default)]
struct LocationConfig {
    #[serde(default = "default_true")]
    auto: bool,
    place: String,
    lat: f64,
    lon: f64,
}

#[derive(Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase", default)]
struct BriefConfig {
    #[serde(default = "default_slide_seconds")]
    slide_seconds: f64,
    greeting_name: String,
    #[serde(default = "default_news_per_slide")]
    news_per_slide: f64,
    #[serde(default = "default_max_news_slides")]
    max_news_slides: f64,
}

#[derive(Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase", default)]
struct Config {
    location: LocationConfig,
    feeds: Vec<FeedSourceConfig>,
    email: EmailConfig,
    notifications: NotificationsConfig,
    brief: BriefConfig,
}

fn config_path() -> Result<PathBuf, String> {
    let dir = dirs::home_dir().ok_or_else(|| "no home dir".to_string())?;
    Ok(dir.join(".aurore.yml"))
}

fn last_seen() -> &'static Mutex<String> {
    static LAST_SEEN: OnceLock<Mutex<String>> = OnceLock::new();
    LAST_SEEN.get_or_init(|| Mutex::new(String::new()))
}

#[tauri::command]
fn load_config() -> Result<Config, String> {
    let path = config_path()?;
    if !path.exists() {
        return Err("no config".into());
    }
    let data = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;
    if let Ok(mut guard) = last_seen().lock() {
        *guard = data.clone();
    }
    serde_yaml::from_str(&data).map_err(|e| e.to_string())
}

#[tauri::command]
fn save_config(config: Config) -> Result<(), String> {
    let path = config_path()?;
    let data = serde_yaml::to_string(&config).map_err(|e| e.to_string())?;
    if let Ok(mut guard) = last_seen().lock() {
        *guard = data.clone();
    }
    std::fs::write(&path, data).map_err(|e| e.to_string())
}

fn read_config_if_changed() -> Option<Config> {
    let path = config_path().ok()?;
    let data = std::fs::read_to_string(&path).ok()?;
    {
        let mut guard = last_seen().lock().ok()?;
        if *guard == data {
            return None;
        }
        *guard = data.clone();
    }
    serde_yaml::from_str(&data).ok()
}

fn client() -> Result<reqwest::Client, String> {
    reqwest::Client::builder()
        .user_agent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15")
        .timeout(Duration::from_secs(15))
        .connect_timeout(Duration::from_secs(6))
        .build()
        .map_err(|e| e.to_string())
}

fn yt_cache() -> &'static Mutex<HashMap<String, String>> {
    static C: OnceLock<Mutex<HashMap<String, String>>> = OnceLock::new();
    C.get_or_init(|| Mutex::new(HashMap::new()))
}

fn extract_channel_id(html: &str) -> Option<String> {
    for key in ["\"channelId\":\"", "\"externalId\":\"", "channel_id="] {
        if let Some(i) = html.find(key) {
            let rest = &html[i + key.len()..];
            let id: String = rest
                .chars()
                .take_while(|c| c.is_alphanumeric() || *c == '_' || *c == '-')
                .collect();
            if id.starts_with("UC") && id.len() >= 20 {
                return Some(id);
            }
        }
    }
    None
}

async fn resolve_feed_url(cl: &reqwest::Client, url: &str) -> String {
    let lower = url.to_lowercase();
    if !(lower.contains("youtube.com") || lower.contains("youtu.be")) {
        return url.to_string();
    }
    if lower.contains("/feeds/videos.xml") {
        return url.to_string();
    }
    if let Some(idx) = url.find("/channel/") {
        let id: String = url[idx + 9..]
            .chars()
            .take_while(|c| c.is_alphanumeric() || *c == '_' || *c == '-')
            .collect();
        if id.starts_with("UC") {
            return format!(
                "https://www.youtube.com/feeds/videos.xml?channel_id={}",
                id
            );
        }
    }
    if let Some(hit) = yt_cache().lock().ok().and_then(|m| m.get(url).cloned()) {
        return hit;
    }
    let html = match cl
        .get(url)
        .header("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15")
        .header("Cookie", "CONSENT=YES+1; SOCS=CAI")
        .send()
        .await
    {
        Ok(r) => r.text().await.unwrap_or_default(),
        Err(_) => return url.to_string(),
    };
    match extract_channel_id(&html) {
        Some(id) => {
            let feed = format!(
                "https://www.youtube.com/feeds/videos.xml?channel_id={}",
                id
            );
            if let Ok(mut m) = yt_cache().lock() {
                m.insert(url.to_string(), feed.clone());
            }
            feed
        }
        None => url.to_string(),
    }
}

#[tauri::command]
async fn fetch_url(url: String) -> Result<String, String> {
    let cl = client()?;
    let resp = cl.get(&url).send().await.map_err(|e| e.to_string())?;
    resp.text().await.map_err(|e| e.to_string())
}

fn strip_html(input: &str) -> String {
    let mut out = String::with_capacity(input.len());
    let mut in_tag = false;
    for c in input.chars() {
        match c {
            '<' => in_tag = true,
            '>' => in_tag = false,
            _ if !in_tag => out.push(c),
            _ => {}
        }
    }
    let out = out
        .replace("&amp;", "&")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&#39;", "'")
        .replace("&quot;", "\"")
        .replace("&nbsp;", " ");
    let collapsed: String = out.split_whitespace().collect::<Vec<_>>().join(" ");
    let trimmed = collapsed.trim();
    if trimmed.chars().count() > 280 {
        trimmed.chars().take(280).collect::<String>() + "…"
    } else {
        trimmed.to_string()
    }
}

#[tauri::command]
async fn fetch_weather(lat: f64, lon: f64, auto: bool) -> Result<Weather, String> {
    let cl = client()?;
    let mut place = String::new();
    let (lat, lon) = if auto || (lat == 0.0 && lon == 0.0) {
        let geo: Value = cl
            .get("http://ip-api.com/json/")
            .send()
            .await
            .map_err(|e| e.to_string())?
            .json()
            .await
            .map_err(|e| e.to_string())?;
        place = geo
            .get("city")
            .and_then(|v| v.as_str())
            .filter(|s| !s.is_empty())
            .or_else(|| geo.get("regionName").and_then(|v| v.as_str()))
            .unwrap_or("Ma position")
            .to_string();
        let glat = geo.get("lat").and_then(|v| v.as_f64()).unwrap_or(lat);
        let glon = geo.get("lon").and_then(|v| v.as_f64()).unwrap_or(lon);
        (glat, glon)
    } else {
        (lat, lon)
    };

    let url = format!(
        "https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max&timezone=auto&forecast_days=5"
    );
    let data: Value = cl
        .get(&url)
        .send()
        .await
        .map_err(|e| e.to_string())?
        .json()
        .await
        .map_err(|e| e.to_string())?;

    let cur = &data["current"];
    let now = WeatherNow {
        temp_c: cur["temperature_2m"].as_f64().unwrap_or(0.0),
        feels_like_c: cur["apparent_temperature"].as_f64().unwrap_or(0.0),
        code: cur["weather_code"].as_i64().unwrap_or(0) as i32,
        is_day: cur["is_day"].as_i64().unwrap_or(1) == 1,
        wind_kmh: cur["wind_speed_10m"].as_f64().unwrap_or(0.0),
        humidity: cur["relative_humidity_2m"].as_f64().unwrap_or(0.0),
    };
    let current_time = cur["time"].as_str().unwrap_or("").to_string();

    let daily = &data["daily"];
    let d_time = daily["time"].as_array().cloned().unwrap_or_default();
    let d_max = daily["temperature_2m_max"].as_array().cloned().unwrap_or_default();
    let d_min = daily["temperature_2m_min"].as_array().cloned().unwrap_or_default();
    let d_code = daily["weather_code"].as_array().cloned().unwrap_or_default();
    let d_prob = daily["precipitation_probability_max"].as_array().cloned().unwrap_or_default();
    let d_sunrise = daily["sunrise"].as_array().cloned().unwrap_or_default();
    let d_sunset = daily["sunset"].as_array().cloned().unwrap_or_default();

    let mut daily_vec: Vec<WeatherDay> = Vec::new();
    for i in 0..d_time.len().min(5) {
        daily_vec.push(WeatherDay {
            date: d_time[i].as_str().unwrap_or("").to_string(),
            max_c: d_max.get(i).and_then(|v| v.as_f64()).unwrap_or(0.0),
            min_c: d_min.get(i).and_then(|v| v.as_f64()).unwrap_or(0.0),
            code: d_code.get(i).and_then(|v| v.as_i64()).unwrap_or(0) as i32,
            precip_prob: d_prob.get(i).and_then(|v| v.as_f64()).unwrap_or(0.0),
            sunrise: d_sunrise.get(i).and_then(|v| v.as_str()).unwrap_or("").to_string(),
            sunset: d_sunset.get(i).and_then(|v| v.as_str()).unwrap_or("").to_string(),
        });
    }
    let today = daily_vec.first().cloned().unwrap_or_default();

    let hourly = &data["hourly"];
    let h_time = hourly["time"].as_array().cloned().unwrap_or_default();
    let h_temp = hourly["temperature_2m"].as_array().cloned().unwrap_or_default();
    let h_code = hourly["weather_code"].as_array().cloned().unwrap_or_default();
    let h_prob = hourly["precipitation_probability"].as_array().cloned().unwrap_or_default();

    let mut hourly_vec: Vec<WeatherHour> = Vec::new();
    for i in 0..h_time.len() {
        let t = h_time[i].as_str().unwrap_or("");
        if t < current_time.as_str() {
            continue;
        }
        hourly_vec.push(WeatherHour {
            time: t.to_string(),
            temp_c: h_temp.get(i).and_then(|v| v.as_f64()).unwrap_or(0.0),
            code: h_code.get(i).and_then(|v| v.as_i64()).unwrap_or(0) as i32,
            precip_prob: h_prob.get(i).and_then(|v| v.as_f64()).unwrap_or(0.0),
        });
        if hourly_vec.len() >= 12 {
            break;
        }
    }

    Ok(Weather {
        place,
        now,
        today,
        hourly: hourly_vec,
        daily: daily_vec,
    })
}

async fn fetch_one_feed(cl: &reqwest::Client, source: &FeedSourceConfig) -> Vec<FeedItem> {
    let url = resolve_feed_url(cl, &source.url).await;
    let resp = match cl
        .get(&url)
        .header(
            "Accept",
            "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
        )
        .send()
        .await
    {
        Ok(r) => r,
        Err(_) => return Vec::new(),
    };
    let bytes = match resp.bytes().await {
        Ok(b) => b,
        Err(_) => return Vec::new(),
    };
    let feed = match feed_rs::parser::parse(&bytes[..]) {
        Ok(f) => f,
        Err(_) => return Vec::new(),
    };
    let feed_title = feed
        .title
        .as_ref()
        .map(|t| t.content.clone())
        .unwrap_or_default();
    let source_name = if source.name.is_empty() {
        feed_title
    } else {
        source.name.clone()
    };
    let mut items = Vec::new();
    for entry in feed.entries.into_iter().take(20) {
        let title = entry
            .title
            .as_ref()
            .map(|t| t.content.trim().to_string())
            .unwrap_or_default();
        let raw_summary = entry
            .summary
            .as_ref()
            .map(|s| s.content.clone())
            .or_else(|| entry.content.as_ref().and_then(|c| c.body.clone()))
            .unwrap_or_default();
        let summary = strip_html(&raw_summary);
        let link = entry.links.first().map(|l| l.href.clone());
        let author = entry.authors.first().map(|a| a.name.clone());
        let image = entry
            .media
            .iter()
            .flat_map(|m| m.content.iter())
            .find_map(|c| c.url.as_ref().map(|u| u.to_string()));
        let published = entry.published.or(entry.updated).map(|d| d.to_rfc3339());
        let id = if entry.id.is_empty() {
            link.clone().unwrap_or_else(|| title.clone())
        } else {
            entry.id.clone()
        };
        items.push(FeedItem {
            id,
            source: "rss".into(),
            source_name: source_name.clone(),
            title,
            summary,
            link,
            author,
            image,
            published,
            unread: false,
        });
    }
    items
}

#[tauri::command]
async fn fetch_feeds(sources: Vec<FeedSourceConfig>) -> Result<Vec<FeedItem>, String> {
    let cl = client()?;
    let enabled: Vec<FeedSourceConfig> = sources.into_iter().filter(|s| s.enabled).collect();
    let futs = enabled.iter().map(|s| fetch_one_feed(&cl, s));
    let results = futures::future::join_all(futs).await;
    Ok(results.into_iter().flatten().collect())
}

#[tauri::command]
async fn fetch_emails(config: EmailConfig) -> Result<Vec<FeedItem>, String> {
    tauri::async_runtime::spawn_blocking(move || fetch_emails_blocking(config))
        .await
        .map_err(|e| e.to_string())?
}

fn fetch_emails_blocking(config: EmailConfig) -> Result<Vec<FeedItem>, String> {
    let host = config.host.clone();
    let tls = native_tls::TlsConnector::builder()
        .build()
        .map_err(|e| e.to_string())?;
    let cl = imap::connect((host.as_str(), config.port), host.as_str(), &tls)
        .map_err(|e| e.to_string())?;
    let mut session = cl
        .login(&config.username, &config.password)
        .map_err(|(e, _)| e.to_string())?;
    let mailbox = if config.mailbox.is_empty() {
        "INBOX".to_string()
    } else {
        config.mailbox.clone()
    };
    session.select(&mailbox).map_err(|e| e.to_string())?;
    let unseen = session.search("UNSEEN").map_err(|e| e.to_string())?;
    let mut seqs: Vec<u32> = unseen.into_iter().collect();
    seqs.sort_unstable();
    let recent: Vec<u32> = seqs.into_iter().rev().take(12).collect();

    let mut items: Vec<FeedItem> = Vec::new();
    if !recent.is_empty() {
        let set: String = recent
            .iter()
            .map(|n| n.to_string())
            .collect::<Vec<_>>()
            .join(",");
        let fetches = session
            .fetch(&set, "(ENVELOPE INTERNALDATE)")
            .map_err(|e| e.to_string())?;
        for msg in fetches.iter() {
            let env = match msg.envelope() {
                Some(e) => e,
                None => continue,
            };
            let subject = env
                .subject
                .as_ref()
                .map(|s| decode_words(&String::from_utf8_lossy(s)))
                .filter(|s| !s.is_empty())
                .unwrap_or_else(|| "(sans objet)".to_string());
            let sender = env
                .from
                .as_ref()
                .and_then(|addrs| addrs.first())
                .map(|addr| {
                    let name = addr
                        .name
                        .map(|n| decode_words(&String::from_utf8_lossy(n)))
                        .filter(|n| !n.is_empty());
                    if let Some(n) = name {
                        return n;
                    }
                    let mailbox = addr
                        .mailbox
                        .map(|m| String::from_utf8_lossy(m).to_string())
                        .unwrap_or_default();
                    let host = addr
                        .host
                        .map(|h| String::from_utf8_lossy(h).to_string())
                        .unwrap_or_default();
                    if host.is_empty() {
                        mailbox
                    } else {
                        format!("{mailbox}@{host}")
                    }
                })
                .unwrap_or_default();
            let published = msg
                .internal_date()
                .map(|d| d.to_rfc3339());
            let source_name = sender
                .rsplit('@')
                .next()
                .filter(|d| !d.is_empty() && d != &sender)
                .map(|d| d.to_string())
                .unwrap_or_else(|| "Mail".to_string());
            items.push(FeedItem {
                id: format!("mail-{}", msg.message),
                source: "email".into(),
                source_name,
                title: subject,
                summary: sender.clone(),
                link: None,
                author: if sender.is_empty() { None } else { Some(sender) },
                image: None,
                published,
                unread: true,
            });
        }
    }
    let _ = session.logout();
    Ok(items)
}

fn decode_words(s: &str) -> String {
    match mailparse::parse_header(format!("Subject: {s}").as_bytes()) {
        Ok((header, _)) => header.get_value(),
        Err(_) => s.to_string(),
    }
}

#[tauri::command]
async fn fetch_notifications(config: NotificationsConfig) -> Result<Vec<FeedItem>, String> {
    let cl = client()?;
    let server = config.ntfy_server.trim_end_matches('/').to_string();
    let mut items: Vec<FeedItem> = Vec::new();
    for topic in config.topics {
        let url = format!("{server}/{topic}/json?poll=1&since=12h");
        let body = match cl.get(&url).send().await {
            Ok(r) => match r.text().await {
                Ok(t) => t,
                Err(_) => continue,
            },
            Err(_) => continue,
        };
        for line in body.lines() {
            if line.trim().is_empty() {
                continue;
            }
            let msg: Value = match serde_json::from_str(line) {
                Ok(v) => v,
                Err(_) => continue,
            };
            let is_message = msg.get("event").and_then(|v| v.as_str()) == Some("message")
                || msg.get("message").is_some();
            if !is_message {
                continue;
            }
            let title = msg
                .get("title")
                .and_then(|v| v.as_str())
                .filter(|s| !s.is_empty())
                .unwrap_or("Notification")
                .to_string();
            let summary = msg
                .get("message")
                .and_then(|v| v.as_str())
                .unwrap_or_default()
                .to_string();
            let link = msg
                .get("click")
                .and_then(|v| v.as_str())
                .map(|s| s.to_string());
            let image = msg
                .get("attachment")
                .and_then(|a| a.get("url"))
                .and_then(|v| v.as_str())
                .map(|s| s.to_string());
            let published = msg
                .get("time")
                .and_then(|v| v.as_i64())
                .and_then(|secs| chrono::DateTime::from_timestamp(secs, 0))
                .map(|d| d.to_rfc3339());
            let id = msg
                .get("id")
                .and_then(|v| v.as_str())
                .map(|s| s.to_string())
                .unwrap_or_else(|| format!("ntfy-{topic}-{}", items.len()));
            items.push(FeedItem {
                id,
                source: "notification".into(),
                source_name: topic.clone(),
                title,
                summary,
                link,
                author: None,
                image,
                published,
                unread: true,
            });
        }
    }
    Ok(items)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            let handle = app.handle().clone();
            if let Some(home) = dirs::home_dir() {
                std::thread::spawn(move || {
                    let h = handle.clone();
                    let mut watcher = match notify::recommended_watcher(
                        move |res: notify::Result<notify::Event>| {
                            if let Ok(ev) = res {
                                let hit = ev.paths.iter().any(|p| {
                                    p.file_name().and_then(|f| f.to_str()) == Some(".aurore.yml")
                                });
                                if hit {
                                    if let Some(cfg) = read_config_if_changed() {
                                        let _ = h.emit("config-changed", cfg);
                                    }
                                }
                            }
                        },
                    ) {
                        Ok(w) => w,
                        Err(_) => return,
                    };
                    if watcher
                        .watch(&home, notify::RecursiveMode::NonRecursive)
                        .is_err()
                    {
                        return;
                    }
                    loop {
                        std::thread::park();
                    }
                });
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            load_config,
            save_config,
            fetch_weather,
            fetch_feeds,
            fetch_emails,
            fetch_notifications,
            fetch_url
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
