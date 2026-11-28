/* =========================================================
   OAT & OAK — interactions (sample)
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------------------------------------------------------
     Header state
     ------------------------------------------------------- */
  var header = document.getElementById('siteHeader');
  var hero = document.querySelector('.hero');

  function syncHeader() {
    if (!header) return;
    var threshold = hero ? Math.max(120, hero.offsetHeight - 90) : 80;
    header.classList.toggle('is-scrolled', window.scrollY > threshold);
  }
  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });
  window.addEventListener('resize', syncHeader);
  window.addEventListener('scroll', function () {
    if (window.scrollY < 60) {
      document.querySelectorAll('.nav__link.is-active').forEach(function (l) {
        l.classList.remove('is-active');
      });
    }
  }, { passive: true });

  /* -------------------------------------------------------
     Mobile menu
     ------------------------------------------------------- */
  var toggle = document.getElementById('menuToggle');
  var nav = document.getElementById('primaryNav');

  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    nav.classList.toggle('is-open', open);
    header.classList.toggle('menu-open', open);
    document.body.classList.toggle('menu-locked', open);
    if (open) {
      var first = nav.querySelector('.nav__link');
      if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 420);
    }
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      setMenu(!nav.classList.contains('is-open'));
    });
  }
  if (nav) {
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
  }
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav && nav.classList.contains('is-open')) {
      setMenu(false);
      toggle.focus();
    }
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 900 && nav && nav.classList.contains('is-open')) setMenu(false);
  });

  /* -------------------------------------------------------
     Reveal on scroll
     ------------------------------------------------------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  revealEls.forEach(function (el) {
    var siblings = Array.prototype.filter.call(el.parentNode.children, function (c) {
      return c.classList && c.classList.contains('reveal');
    });
    var i = siblings.indexOf(el);
    if (i > 0) el.style.transitionDelay = Math.min(i * 80, 300) + 'ms';
  });

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* -------------------------------------------------------
     Nav scrollspy
     ------------------------------------------------------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__link[href^="#"]'));
  var spyTargets = navLinks.map(function (link) {
    var id = link.getAttribute('href');
    return { link: link, el: id.length > 1 ? document.querySelector(id) : null };
  }).filter(function (t) { return t.el; });

  if (spyTargets.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        spyTargets.forEach(function (t) {
          t.link.classList.toggle('is-active', t.el === entry.target);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    spyTargets.forEach(function (t) { spy.observe(t.el); });
  }

  /* -------------------------------------------------------
     Counters
     ------------------------------------------------------- */
  function formatNumber(v, d) {
    var n = d > 0 ? v.toFixed(d) : Math.round(v).toString();
    var parts = n.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  function runCounter(el) {
    var target = parseFloat(el.getAttribute('data-to')) || 0;
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);

    if (reduceMotion) {
      el.textContent = formatNumber(target, decimals);
      return;
    }

    var duration = 1500;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatNumber(target * eased, decimals);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = formatNumber(target, decimals);
    }
    requestAnimationFrame(step);
  }

  var counters = Array.prototype.slice.call(document.querySelectorAll('.counter'));
  if (counters.length) {
    if (!('IntersectionObserver' in window)) {
      counters.forEach(runCounter);
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            cio.unobserve(entry.target);
          }
        });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { cio.observe(el); });
    }
  }

  /* -------------------------------------------------------
     Menu tabs
     ------------------------------------------------------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.menu-tab'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('.menu-panel'));

  function activateTab(tab, focusPanel) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach(function (p) {
      var on = p.id === tab.getAttribute('aria-controls');
      p.classList.toggle('is-active', on);
      p.hidden = !on;
    });
    if (focusPanel) {
      var panel = document.getElementById(tab.getAttribute('aria-controls'));
      if (panel) panel.focus({ preventScroll: true });
    }
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () { activateTab(tab, false); });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight') next = tabs[(index + 1) % tabs.length];
      else if (e.key === 'ArrowLeft') next = tabs[(index - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') next = tabs[0];
      else if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) {
        e.preventDefault();
        next.focus();
        activateTab(next, false);
      }
    });
  });

  /* -------------------------------------------------------
     Reservation form
     ------------------------------------------------------- */
  var form = document.getElementById('reserveForm');
  var done = document.getElementById('formDone');
  var doneSummary = document.getElementById('doneSummary');
  var resetBtn = document.getElementById('resetForm');

  var dateInput = document.getElementById('date');
  if (dateInput) {
    var now = new Date();
    var today = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0');
    dateInput.min = today;
  }

  function fieldOf(el) { return el.closest('.field'); }

  function setError(el, on) {
    var field = fieldOf(el);
    if (field) field.classList.toggle('is-invalid', on);
    el.setAttribute('aria-invalid', on ? 'true' : 'false');
  }

  function validPhone(v) {
    var digits = v.replace(/[^0-9]/g, '');
    return /^0\d{8,10}$/.test(digits);
  }

  function prettyDate(value) {
    if (!value) return '';
    var parts = value.split('-');
    if (parts.length !== 3) return value;
    return Number(parts[1]) + '월 ' + Number(parts[2]) + '일';
  }

  if (form) {
    var agree = document.getElementById('agree');
    var agreeError = document.querySelector('[data-error-for="agree"]');
    var required = ['date', 'time', 'people', 'name', 'phone'];

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var invalid = [];

      required.forEach(function (id) {
        var el = document.getElementById(id);
        var ok = el.value.trim().length > 0;
        if (id === 'phone') ok = validPhone(el.value);
        if (id === 'date' && ok && el.min && el.value < el.min) ok = false;
        setError(el, !ok);
        if (!ok) invalid.push(el);
      });

      var agreeOk = agree.checked;
      agreeError.classList.toggle('is-invalid', !agreeOk);
      if (!agreeOk) invalid.push(agree);

      if (invalid.length) {
        invalid[0].focus({ preventScroll: false });
        return;
      }

      var type = form.querySelector('input[name="type"]:checked').value;
      var summary = [
        type,
        prettyDate(document.getElementById('date').value),
        document.getElementById('time').value,
        document.getElementById('people').value
      ].join(' · ');
      var name = document.getElementById('name').value.trim();

      doneSummary.innerHTML = '<strong>' + name + '</strong> 님의 예약 신청<br>' + summary;
      form.hidden = true;
      done.hidden = false;
      done.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    });

    required.forEach(function (id) {
      var el = document.getElementById(id);
      var evt = el.tagName === 'SELECT' ? 'change' : 'input';
      el.addEventListener(evt, function () {
        if (el.value.trim()) setError(el, false);
      });
    });

    agree.addEventListener('change', function () {
      if (agree.checked) agreeError.classList.remove('is-invalid');
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        form.reset();
        form.querySelectorAll('.field.is-invalid').forEach(function (f) { f.classList.remove('is-invalid'); });
        agreeError.classList.remove('is-invalid');
        form.hidden = false;
        done.hidden = true;
        var first = document.getElementById('date');
        if (first) first.focus();
        form.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      });
    }
  }

  /* -------------------------------------------------------
     Footer year
     ------------------------------------------------------- */
  var yearEl = document.querySelector('.footer__base span');
  if (yearEl) {
    yearEl.textContent = yearEl.textContent.replace(/\d{4}/, new Date().getFullYear());
  }
})();
