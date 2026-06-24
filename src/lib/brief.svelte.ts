import { config } from "./config.svelte";
import { feed } from "./feed.svelte";
import type { Slide } from "./types";

class BriefStore {
  open = $state(false);
  slides = $state<Slide[]>([]);
  index = $state(0);
  playing = $state(false);
  progress = $state(0);

  #raf = 0;
  #last = 0;

  get current(): Slide | null {
    return this.slides[this.index] ?? null;
  }
  get count(): number {
    return this.slides.length;
  }

  build() {
    const c = config.data;
    const slides: Slide[] = [{ id: "greeting", kind: "greeting" }];

    if (feed.weather) slides.push({ id: "weather", kind: "weather" });

    const news = feed.news;
    if (news.length) {
      const per = Math.max(1, c.brief.newsPerSlide);
      const max = Math.max(1, c.brief.maxNewsSlides);
      for (let p = 0; p < max && p * per < news.length; p++) {
        slides.push({
          id: `news-${p}`,
          kind: "news",
          items: news.slice(p * per, p * per + per),
        });
      }
    }

    if (feed.emails.length) {
      slides.push({ id: "emails", kind: "emails", items: feed.emails.slice(0, 6) });
    }
    if (feed.notifications.length) {
      slides.push({
        id: "notifications",
        kind: "notifications",
        items: feed.notifications.slice(0, 6),
      });
    }

    slides.push({ id: "outro", kind: "outro" });

    this.slides = slides;
    this.index = 0;
    this.progress = 0;
  }

  start() {
    this.build();
    this.open = true;
    this.play();
  }

  stop() {
    this.pause();
    this.open = false;
    this.index = 0;
    this.progress = 0;
  }

  play() {
    this.playing = true;
    this.#last = performance.now();
    cancelAnimationFrame(this.#raf);
    const tick = (t: number) => {
      const dt = (t - this.#last) / 1000;
      this.#last = t;
      const dur = Math.max(2, config.data.brief.slideSeconds);
      this.progress += dt / dur;
      if (this.progress >= 1) {
        this.progress = 0;
        this.next();
      }
      if (this.playing) this.#raf = requestAnimationFrame(tick);
    };
    this.#raf = requestAnimationFrame(tick);
  }

  pause() {
    this.playing = false;
    cancelAnimationFrame(this.#raf);
  }

  toggle() {
    if (this.playing) this.pause();
    else this.play();
  }

  next() {
    if (this.index >= this.slides.length - 1) {
      this.stop();
      return;
    }
    this.index++;
    this.progress = 0;
    this.#last = performance.now();
  }

  prev() {
    this.progress = 0;
    this.#last = performance.now();
    if (this.index > 0) this.index--;
  }

  goto(i: number) {
    this.index = Math.max(0, Math.min(this.slides.length - 1, i));
    this.progress = 0;
    this.#last = performance.now();
  }
}

export const brief = new BriefStore();
