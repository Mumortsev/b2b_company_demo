const video = document.getElementById('myVideo');
const button = document.getElementById('toggleBtn');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (video && button) {
  const playIcon = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');
  function state() {
    playIcon?.classList.toggle('hidden', !video.paused);
    pauseIcon?.classList.toggle('hidden', video.paused);
    button.setAttribute('aria-label', video.paused ? 'Воспроизвести иллюстративное видео' : 'Приостановить видео');
  }
  function source() { if (video.dataset.source && !video.getAttribute('src')) video.src = video.dataset.source === 'about' ? new URL('../../images/other/about-video.mp4', import.meta.url).href : new URL('../../images/other/video.mp4', import.meta.url).href; }
  if (reduced) { video.removeAttribute('autoplay'); video.pause(); }
  else if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { source(); video.play().catch(state); } else video.pause();
    }, { threshold: .15 });
    observer.observe(video);
    addEventListener('pagehide', () => observer.disconnect(), { once: true });
  }
  button.addEventListener('click', () => { source(); video.paused ? video.play().catch(state) : video.pause(); });
  video.addEventListener('play', state); video.addEventListener('pause', state); video.addEventListener('error', state); state();
}
