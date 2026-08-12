(function () {
  'use strict';

  // Progressive enhancement: every section is visible-by-default in CSS.
  // If GSAP fails to load for any reason (blocked script, flaky network),
  // the page still renders fully — it just won't animate. Nothing below
  // this guard is allowed to leave content permanently hidden.
  if (typeof gsap === 'undefined') return;

  var reduced = window.__reduceMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
  }

  /* ---------------------------------------------------------------------
     Typing-effect engine (used by hero + dev terminal)
  --------------------------------------------------------------------- */
  function typeLines(el, lines, opts) {
    opts = opts || {};
    var loop = !!opts.loop;
    var typeSpeed = reduced ? 0 : opts.typeSpeed || 28;
    var lineDelay = reduced ? 0 : opts.lineDelay || 450;
    var restartDelay = opts.restartDelay || 3200;

    if (!el) return;

    function escapeHtml(str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    if (reduced) {
      el.innerHTML = lines
        .map(function (line) {
          var cls = line.prompt ? 'term-prompt' : 'term-output';
          var prefix = line.prompt ? '$ ' : '';
          return '<span class="' + cls + '">' + escapeHtml(prefix + line.text) + '</span>';
        })
        .join('\n');
      return;
    }

    var cancelled = false;

    function run() {
      el.textContent = '';
      var lineIndex = 0;

      function typeNextLine() {
        if (cancelled) return;
        if (lineIndex >= lines.length) {
          if (loop) {
            setTimeout(run, restartDelay);
          }
          return;
        }

        var line = lines[lineIndex];
        if (lineIndex > 0) el.appendChild(document.createTextNode('\n'));
        var span = document.createElement('span');
        span.className = line.prompt ? 'term-prompt' : 'term-output';
        el.appendChild(span);

        var charIndex = 0;
        var prefix = line.prompt ? '$ ' : '';
        var full = prefix + line.text;

        (function typeChar() {
          if (cancelled) return;
          if (charIndex <= full.length) {
            span.textContent = full.slice(0, charIndex);
            charIndex++;
            setTimeout(typeChar, typeSpeed);
          } else {
            lineIndex++;
            setTimeout(typeNextLine, lineDelay);
          }
        })();
      }

      typeNextLine();
    }

    run();
    return function stop() {
      cancelled = true;
    };
  }

  /* ---------------------------------------------------------------------
     Loading sequence → nav entrance → hero reveal
     All sections are visible by default in CSS; here we explicitly set
     the pre-animation "hidden" state via gsap.set() right before we
     animate out of it — only ever reachable once GSAP has loaded.
  --------------------------------------------------------------------- */
  function runLoader() {
    var loader = document.getElementById('site-loader');
    var nav = document.getElementById('site-nav');

    if (reduced) {
      if (loader) loader.classList.add('is-hidden');
      revealHero();
      return;
    }

    if (nav) gsap.set(nav, { opacity: 0, y: -30, scale: 0.96 });

    var tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: function () {
        if (loader) loader.classList.add('is-hidden');
        if (nav) gsap.to(nav, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out' });
        revealHero();
      },
    });

    tl.to('.loader-mark', { opacity: 1, duration: 0.5 })
      .to('.loader-role', { opacity: 1, duration: 0.4 }, '-=0.15')
      .to('.loader-bar', { opacity: 1, duration: 0.3 }, '-=0.1')
      .to('.loader-bar-fill', { width: '100%', duration: 0.7, ease: 'power2.inOut' })
      .to(loader, { opacity: 0, duration: 0.45, delay: 0.15 });
  }

  /* ---------------------------------------------------------------------
     Hero reveal + letter stagger + terminal typing + parallax
  --------------------------------------------------------------------- */
  function revealHero() {
    var titleLine = document.querySelector('[data-hero-stagger]');
    if (titleLine) {
      var text = titleLine.textContent;
      titleLine.innerHTML = text
        .split('')
        .map(function (ch) {
          return '<span class="hero-char" style="display:inline-block">' + ch + '</span>';
        })
        .join('');
    }

    if (!reduced) {
      gsap.set('.floating-chip', { opacity: 0 });

      var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.hero-status', { opacity: 0, y: -14, duration: 0.5 })
        .from(
          '.hero-char',
          { opacity: 0, y: 40, rotateX: -60, stagger: 0.035, duration: 0.7 },
          '-=0.2'
        )
        .from('.hero-role', { opacity: 0, y: 16, duration: 0.5 }, '-=0.3')
        .from('.hero-copy-text', { opacity: 0, y: 16, duration: 0.5 }, '-=0.3')
        .from('.hero-ctas', { opacity: 0, y: 16, duration: 0.5 }, '-=0.3')
        .from('.hero-visual', { opacity: 0, scale: 0.92, duration: 0.7 }, '-=0.5')
        .to('.floating-chip', { opacity: 1, duration: 0.5, stagger: 0.12 }, '-=0.3');

      gsap.to('.floating-chip--1', { y: -14, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.to('.floating-chip--2', { y: 12, duration: 3.6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 0.3 });
      gsap.to('.floating-chip--3', { y: -10, duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 0.6 });
      gsap.to('.floating-chip--4', { y: 14, duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 0.2 });
    }

    typeLines(
      document.getElementById('hero-terminal-body'),
      [
        { prompt: true, text: 'whoami' },
        { text: 'Maxime — Software Engineer & Full-Stack Developer' },
        { prompt: true, text: 'role' },
        { text: 'Full-Stack Developer / Software Engineering Student' },
        { prompt: true, text: 'current_focus' },
        { text: 'Building real-world web apps & business systems' },
        { prompt: true, text: 'stack' },
        { text: 'Node.js · JavaScript · React · PHP · MySQL' },
        { prompt: true, text: 'status' },
        { text: 'Available for opportunities ●' },
      ],
      { loop: true, restartDelay: 2600 }
    );

    // Mouse parallax
    if (!reduced && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      var visual = document.querySelector('[data-parallax]');
      if (visual) {
        document.querySelector('.hero').addEventListener('mousemove', function (e) {
          var rect = document.querySelector('.hero').getBoundingClientRect();
          var relX = (e.clientX - rect.left) / rect.width - 0.5;
          var relY = (e.clientY - rect.top) / rect.height - 0.5;
          gsap.to(visual, { x: relX * 24, y: relY * 18, duration: 0.6, ease: 'power2.out' });
        });
      }
    }
  }

  runLoader();

  /* ---------------------------------------------------------------------
     ScrollTrigger reveals — everything below the fold
  --------------------------------------------------------------------- */
  if (!window.ScrollTrigger || reduced) return;

  function batchReveal(selector, fromVars, staggerAmount) {
    var els = gsap.utils.toArray(selector);
    if (!els.length) return;

    els.forEach(function (el, i) {
      gsap.set(el, fromVars);
      gsap.to(
        el,
        Object.assign(
          { opacity: 1, y: 0, x: 0, scale: 1 },
          {
            duration: 0.7,
            ease: 'power3.out',
            delay: (i % 4) * (staggerAmount || 0.08),
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      );
    });
  }

  // Intro steps — activate as each crosses the viewport center
  gsap.utils.toArray('[data-intro-step]').forEach(function (step) {
    ScrollTrigger.create({
      trigger: step,
      start: 'top 65%',
      end: 'bottom 35%',
      onEnter: function () {
        step.classList.add('is-active');
      },
      onEnterBack: function () {
        step.classList.add('is-active');
      },
      onLeave: function () {
        step.classList.remove('is-active');
      },
      onLeaveBack: function () {
        step.classList.remove('is-active');
      },
    });
  });

  // Technical journey timeline
  gsap.utils.toArray('[data-timeline-item]').forEach(function (item) {
    gsap.set(item, { opacity: 0, y: 30 });
    ScrollTrigger.create({
      trigger: item,
      start: 'top 78%',
      onEnter: function () {
        item.classList.add('is-active');
        gsap.to(item, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
      },
      onLeaveBack: function () {
        item.classList.remove('is-active');
        gsap.to(item, { opacity: 0, y: 30, duration: 0.4 });
      },
    });
  });

  var timelineFill = document.querySelector('[data-timeline-fill]');
  var timelineTrack = document.querySelector('.timeline');
  if (timelineFill && timelineTrack) {
    gsap.to(timelineFill, {
      height: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: timelineTrack,
        start: 'top 60%',
        end: 'bottom 80%',
        scrub: 0.6,
      },
    });
  }

  // Project cards, more-project cards, cert cards, service cards, experience cards
  batchReveal('[data-reveal]', { opacity: 0, y: 26 }, 0.08);

  // Skills groups
  batchReveal('[data-skills-group]', { opacity: 0, y: 24 }, 0.1);

  // Dev terminal reveal + typing on scroll-in
  var devTerminal = document.querySelector('.dev-terminal');
  if (devTerminal) {
    gsap.set(devTerminal, { opacity: 0, y: 30 });
    gsap.to(devTerminal, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: { trigger: devTerminal, start: 'top 85%', toggleActions: 'play none none reverse' },
    });

    var devTyped = false;
    ScrollTrigger.create({
      trigger: devTerminal,
      start: 'top 85%',
      onEnter: function () {
        if (devTyped) return;
        devTyped = true;
        typeLines(
          document.getElementById('dev-terminal-body'),
          [
            { prompt: true, text: 'git status' },
            { text: 'Projects:' },
            { text: '✓ Grite SMS' },
            { text: '✓ TouchTech Hub' },
            { text: '✓ TrendSpark AI' },
            { prompt: true, text: 'npm run build' },
            { text: 'Building digital experiences...' },
          ],
          { loop: false }
        );
      },
    });
  }

  // Contact form reveal
  var contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    gsap.set(contactForm, { opacity: 0, y: 30 });
    gsap.to(contactForm, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: { trigger: contactForm, start: 'top 88%', toggleActions: 'play none none reverse' },
    });
  }

  // Section heads — subtle fade/slide-in for eyebrow + title on every section
  gsap.utils.toArray('.section-head').forEach(function (head) {
    gsap.from(head, {
      opacity: 0,
      y: 24,
      duration: 0.6,
      ease: 'power3.out',
      scrollTrigger: { trigger: head, start: 'top 85%', toggleActions: 'play none none reverse' },
    });
  });
})();
