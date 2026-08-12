(function () {
  'use strict';

  var isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!isDesktop || prefersReducedMotion) return;

  document.documentElement.classList.add('has-custom-cursor');

  var dot = document.getElementById('cursor-dot');
  var ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  var mouseX = window.innerWidth / 2;
  var mouseY = window.innerHeight / 2;
  var ringX = mouseX;
  var ringY = mouseY;

  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  });

  function tick() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    window.requestAnimationFrame(tick);
  }
  window.requestAnimationFrame(tick);

  var interactiveSelector = 'a, button, [data-magnetic], .skill-node, input, textarea, [data-modal-open]';

  document.addEventListener('mouseover', function (e) {
    if (e.target.closest && e.target.closest(interactiveSelector)) {
      ring.classList.add('is-active');
    }
  });

  document.addEventListener('mouseout', function (e) {
    if (e.target.closest && e.target.closest(interactiveSelector)) {
      ring.classList.remove('is-active');
    }
  });

  document.addEventListener('mouseleave', function () {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });

  document.addEventListener('mouseenter', function () {
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  });
})();
