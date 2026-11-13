// Preserve the original fading project carousel, with touch and keyboard controls.
if (document.querySelector('.project-swiper')) {
  Promise.all([import('swiper'), import('swiper/modules')]).then(([{default: Swiper}, {Navigation, EffectFade, A11y, Keyboard}]) => {
    const carousel = new Swiper('.project-swiper', {
      modules: [Navigation, EffectFade, A11y, Keyboard],
      loop: true,
      speed: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 800,
      slidesPerView: 1,
      effect: 'fade',
      fadeEffect: {crossFade: true},
      spaceBetween: 30,
      allowTouchMove: true,
      keyboard: {enabled:true,onlyInViewport:true},
      navigation: {nextEl:'.swiper-button-next',prevEl:'.swiper-button-prev'},
      a11y: {prevSlideMessage:'Предыдущее решение',nextSlideMessage:'Следующее решение',slideLabelMessage:'Решение {{index}} из {{slidesLength}}'},
    });
    addEventListener('pagehide', () => carousel.destroy(), {once:true});
  });
}
