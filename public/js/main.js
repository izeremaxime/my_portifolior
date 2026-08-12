(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.documentElement.classList.add('reduce-motion');
  }
  window.__reduceMotion = prefersReducedMotion;

  /* ---------------------------------------------------------------------
     Safety net: the loader overlay must never permanently block the page.
     gsap.min.js / ScrollTrigger.min.js load via plain (non-deferred)
     <script> tags, so by the time this deferred script runs, the browser
     has already either loaded them or given up — window.gsap tells us
     definitively which, no guessing/timer race needed. If it's missing,
     drop the loader immediately (every section is visible-by-default in
     CSS, so there's nothing to wait for).
  --------------------------------------------------------------------- */
  function hideLoaderNow() {
    var loader = document.getElementById('site-loader');
    if (loader && !loader.classList.contains('is-hidden')) {
      loader.classList.add('is-hidden');
      loader.style.opacity = '0';
    }
  }

  if (typeof window.gsap === 'undefined') {
    hideLoaderNow();
  } else {
    // Last-resort catch-all in case animations.js throws partway through
    // (well past its own ~2.2s loader sequence).
    setTimeout(hideLoaderNow, 4000);
  }

  /* ---------------------------------------------------------------------
     Mobile menu
  --------------------------------------------------------------------- */
  var navToggle = document.getElementById('nav-toggle');
  var mobileMenu = document.getElementById('mobile-menu');

  function closeMobileMenu() {
    if (!navToggle || !mobileMenu) return;
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    mobileMenu.setAttribute('data-state', 'closed');
    document.body.style.overflow = '';
  }

  function openMobileMenu() {
    if (!navToggle || !mobileMenu) return;
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close menu');
    mobileMenu.setAttribute('data-state', 'open');
    document.body.style.overflow = 'hidden';
  }

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', function () {
      var isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    document.querySelectorAll('[data-nav-link]').forEach(function (link) {
      link.addEventListener('click', closeMobileMenu);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMobileMenu();
    });
  }

  /* ---------------------------------------------------------------------
     Nav scroll state + active link tracking
  --------------------------------------------------------------------- */
  var nav = document.getElementById('site-nav');
  var navLinks = document.querySelectorAll('.nav-link');
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));

  function updateNavScrollState() {
    if (!nav) return;
    if (window.scrollY > 60) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  }

  function updateActiveLink() {
    var scrollPos = window.scrollY + window.innerHeight * 0.35;
    var activeId = sections.length ? sections[0].id : null;

    sections.forEach(function (section) {
      if (section.offsetTop <= scrollPos) {
        activeId = section.id;
      }
    });

    navLinks.forEach(function (link) {
      var target = link.getAttribute('href').replace('#', '');
      link.classList.toggle('is-active', target === activeId);
    });
  }

  var scrollTicking = false;
  window.addEventListener('scroll', function () {
    if (!scrollTicking) {
      window.requestAnimationFrame(function () {
        updateNavScrollState();
        updateActiveLink();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  });

  updateNavScrollState();
  updateActiveLink();

  /* ---------------------------------------------------------------------
     Magnetic button hover
  --------------------------------------------------------------------- */
  if (!prefersReducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('[data-magnetic]').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = 'translate(' + x * 0.18 + 'px,' + y * 0.35 + 'px)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transform = '';
      });
    });
  }

  /* ---------------------------------------------------------------------
     Skills — connect/glow group on node hover
  --------------------------------------------------------------------- */
  document.querySelectorAll('[data-skills-group]').forEach(function (group) {
    var nodes = group.querySelectorAll('[data-skill-node]');
    nodes.forEach(function (node) {
      node.addEventListener('mouseenter', function () {
        group.classList.add('is-connected');
      });
      node.addEventListener('mouseleave', function () {
        group.classList.remove('is-connected');
      });
      node.addEventListener('focus', function () {
        group.classList.add('is-connected');
      });
      node.addEventListener('blur', function () {
        group.classList.remove('is-connected');
      });
    });
  });

  /* ---------------------------------------------------------------------
     ZUM Quiz mock — rotating question preview
  --------------------------------------------------------------------- */
  var quizQuestions = [
    'Which language runs in the browser?',
    'What does API stand for?',
    'Which HTTP method creates a resource?',
    'What tag defines a hyperlink in HTML?',
  ];
  var quizEl = document.getElementById('quiz-mock-question');
  if (quizEl && !prefersReducedMotion) {
    var quizIndex = 0;
    setInterval(function () {
      quizIndex = (quizIndex + 1) % quizQuestions.length;
      quizEl.style.opacity = '0';
      setTimeout(function () {
        quizEl.textContent = quizQuestions[quizIndex];
        quizEl.style.opacity = '1';
      }, 250);
    }, 3200);
  }

  /* ---------------------------------------------------------------------
     Project modals
  --------------------------------------------------------------------- */
  var lastFocusedEl = null;

  function openModal(id) {
    var modal = document.getElementById(id);
    if (!modal || typeof modal.showModal !== 'function') return;
    lastFocusedEl = document.activeElement;
    modal.showModal();
    var closeBtn = modal.querySelector('[data-modal-close]');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.close();
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
      lastFocusedEl.focus();
    }
  }

  document.querySelectorAll('[data-modal-open]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      openModal(btn.getAttribute('data-modal-open'));
    });
  });

  document.querySelectorAll('.project-modal').forEach(function (modal) {
    var closeBtn = modal.querySelector('[data-modal-close]');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        closeModal(modal);
      });
    }
    modal.addEventListener('click', function (e) {
      var rect = modal.querySelector('.project-modal-inner').getBoundingClientRect();
      var inBounds =
        e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      if (!inBounds) closeModal(modal);
    });
  });

  /* ---------------------------------------------------------------------
     Contact form — client-side UX validation + fetch submit
     (server always re-validates in controllers/contactController.js)
  --------------------------------------------------------------------- */
  var form = document.getElementById('contact-form');
  var statusEl = document.getElementById('form-status');

  function setFieldError(name, message) {
    var row = form.querySelector('[name="' + name + '"]').closest('.form-row');
    var errorEl = form.querySelector('[data-error-for="' + name + '"]');
    if (message) {
      row.classList.add('has-error');
      if (errorEl) errorEl.textContent = message;
    } else {
      row.classList.remove('has-error');
      if (errorEl) errorEl.textContent = '';
    }
  }

  function validateForm(data) {
    var errors = {};
    if (!data.name || data.name.trim().length < 2) {
      errors.name = 'Please enter your name (at least 2 characters).';
    }
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!data.message || data.message.trim().length < 10) {
      errors.message = 'Message should be at least 10 characters.';
    }
    return errors;
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var formData = {
        name: form.name.value,
        email: form.email.value,
        message: form.message.value,
        website: form.website.value,
      };

      var errors = validateForm(formData);
      ['name', 'email', 'message'].forEach(function (field) {
        setFieldError(field, errors[field] || '');
      });

      if (Object.keys(errors).length > 0) {
        statusEl.textContent = 'Please fix the highlighted fields.';
        statusEl.className = 'form-status is-error';
        return;
      }

      var submitBtn = form.querySelector('.contact-submit');
      submitBtn.setAttribute('disabled', 'true');
      statusEl.textContent = 'Sending…';
      statusEl.className = 'form-status';

      fetch('/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(formData),
      })
        .then(function (res) {
          return res.json().then(function (body) {
            return { ok: res.ok, body: body };
          });
        })
        .then(function (result) {
          submitBtn.removeAttribute('disabled');
          if (result.ok && result.body.success) {
            statusEl.textContent = result.body.message || "Thanks — I'll get back to you soon.";
            statusEl.className = 'form-status is-success';
            form.reset();
          } else if (result.body.errors) {
            Object.keys(result.body.errors).forEach(function (field) {
              setFieldError(field, result.body.errors[field]);
            });
            statusEl.textContent = 'Please fix the highlighted fields.';
            statusEl.className = 'form-status is-error';
          } else {
            statusEl.textContent = 'Something went wrong. Please try again.';
            statusEl.className = 'form-status is-error';
          }
        })
        .catch(function () {
          submitBtn.removeAttribute('disabled');
          statusEl.textContent = 'Network error — please try again.';
          statusEl.className = 'form-status is-error';
        });
    });
  }

  // Small helper polyfill for older browsers lacking Element.closest inside handlers above
  if (!Element.prototype.closest) {
    Element.prototype.closest = function (selector) {
      var el = this;
      while (el) {
        if (el.matches && el.matches(selector)) return el;
        el = el.parentElement;
      }
      return null;
    };
  }
})();
