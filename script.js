const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const scrollProgress = document.querySelector(".scroll-progress");
const animatedItems = document.querySelectorAll("[data-animate], [data-stagger], [data-scale]");
const heroScreen = document.querySelector(".screen");
const finalCta = document.querySelector(".final-cta-inner");
const faqItems = document.querySelectorAll(".faq-list details");

document.body.classList.add("motion-ready");

menuToggle?.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

mainNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

document.querySelectorAll("[data-stagger]").forEach((item, index) => {
  item.style.transitionDelay = `${(index % 6) * 100}ms`;
});

if (reduceMotion) {
  animatedItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.16,
    rootMargin: "0px 0px -8% 0px",
  });

  animatedItems.forEach((item) => revealObserver.observe(item));
}

let ticking = false;

const updateScrollEffects = () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;

  scrollProgress?.style.setProperty("transform", `scaleX(${Math.min(progress, 1)})`);

  if (!reduceMotion) {
    const heroOffset = window.scrollY * 0.035;
    heroScreen?.style.setProperty("--parallax-y", `${heroOffset}px`);

    if (finalCta) {
      const ctaRect = finalCta.getBoundingClientRect();
      const ctaOffset = (ctaRect.top - window.innerHeight * 0.5) * -0.045;
      finalCta.style.setProperty("--cta-bg-y", `${Math.max(-18, Math.min(18, ctaOffset))}px`);
    }
  }

  ticking = false;
};

const requestScrollUpdate = () => {
  if (!ticking) {
    window.requestAnimationFrame(updateScrollEffects);
    ticking = true;
  }
};

window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("resize", requestScrollUpdate);
updateScrollEffects();

faqItems.forEach((details) => {
  const summary = details.querySelector("summary");

  summary?.addEventListener("click", (event) => {
    if (reduceMotion) {
      return;
    }

    event.preventDefault();

    const startHeight = `${details.offsetHeight}px`;
    const summaryHeight = `${summary.offsetHeight}px`;

    details.style.height = startHeight;
    details.style.overflow = "hidden";

    window.requestAnimationFrame(() => {
      if (details.open) {
        details.classList.add("is-closing");
        details.style.height = summaryHeight;
      } else {
        details.open = true;
        details.classList.add("is-opening");
        details.style.height = `${details.scrollHeight}px`;
      }
    });

    const onTransitionEnd = () => {
      if (details.classList.contains("is-closing")) {
        details.open = false;
      }

      details.classList.remove("is-opening", "is-closing");
      details.style.height = "";
      details.style.overflow = "";
      details.removeEventListener("transitionend", onTransitionEnd);
    };

    details.addEventListener("transitionend", onTransitionEnd);
  });
});
