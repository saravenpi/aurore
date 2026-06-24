export function reveal(node: HTMLElement) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return {};

  node.style.opacity = "0";
  node.style.transform = "translateY(18px)";
  node.style.transition =
    "opacity 0.55s var(--ease-soft), transform 0.55s var(--ease-soft)";

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          node.style.opacity = "1";
          node.style.transform = "none";
          io.unobserve(node);
        }
      }
    },
    { threshold: 0.06, rootMargin: "0px 0px -40px 0px" },
  );
  io.observe(node);

  return {
    destroy() {
      io.disconnect();
    },
  };
}
