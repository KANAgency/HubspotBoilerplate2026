const VIDEO_DATA = "data-lazy";
const VIDEO_SELECTOR = `video[${VIDEO_DATA}]`;
const VIDEO_SRC = "data-src";

export default class VideoLazyLoader {
  constructor() {
    this.lazyVideos = Array.from(document.querySelectorAll(VIDEO_SELECTOR));
  }

  init() {
    if ("IntersectionObserver" in window) {
      this.lazyVideoObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.loadVideos(entry);
          }
        });
      });
      this.lazyVideos.forEach((lazyVideo) => {
        this.lazyVideoObserver.observe(lazyVideo);
      });
    } else {
      this.lazyVideos.forEach((lazyVideo) => {
        this.loadVideos(lazyVideo);
      });
    }

    window.addEventListener('pageshow', function (event) {
      if (event.persisted) {
        // Page was restored from bfcache
        document.querySelectorAll('video').forEach(function (video) {
          // Reset the src to force reload
          const source = video.querySelector('source');
          const dataSrc = source.getAttribute('data-src');

          if (dataSrc) {
            source.setAttribute('src', dataSrc);
          }
          video.load(); // Force reload
          video.play().catch(() => { }); // Autoplay may be blocked in some cases
        });
      }
    });
  }

  loadVideos(entry) {
    if (!entry) return;

    const video = entry?.target;
    const sources = video.children;

    for (const source of sources) {
      if (typeof source.tagName === "string" && source.tagName === "SOURCE") {
        source.src = source.dataset.src;
        source.removeAttribute(VIDEO_SRC);
      }
    }
    video.load();
    video.removeAttribute(VIDEO_DATA);
    if (entry.target) {
      this.lazyVideoObserver.unobserve(video);
    }
  }
}
