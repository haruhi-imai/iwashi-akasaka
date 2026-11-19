const video = document.getElementById("fv-video");
const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (video && !motion.matches) {
  const hero = video.closest(".hero");
  const whiteFrameTime = 2.35;

  function updateTextColor(time) {
    hero.classList.toggle("has-light-frame", time >= whiteFrameTime);
  }

  if (typeof video.requestVideoFrameCallback === "function") {
    const updateFrame = (_, frame) => {
      updateTextColor(frame.mediaTime);
      if (frame.mediaTime < whiteFrameTime) video.requestVideoFrameCallback(updateFrame);
    };
    video.requestVideoFrameCallback(updateFrame);
  } else {
    video.addEventListener("timeupdate", () => updateTextColor(video.currentTime));
  }

  video.addEventListener("ended", () => updateTextColor(video.currentTime), { once: true });
  video.muted = true;
  video.src = "assets/iwashi-fv.mp4";
  video.play().catch(() => {
    video.removeAttribute("src");
    video.load();
  });
}
