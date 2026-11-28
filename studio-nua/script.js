/* STUDIO NUA — interactions */
(function () {
  'use strict';

  var doc = document;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- header state ---------- */
  var header = doc.getElementById('siteHeader');
  var lastY = -1;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (y === lastY) return;
    lastY = y;
    if (y > 24) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- mobile menu ---------- */
  var toggle = doc.getElementById('menuToggle');
  var nav = doc.getElementById('primaryNav');
  var navLinks = nav ? nav.querySelectorAll('a') : [];

  function setMenu(open) {
    if (!toggle || !nav) return;
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    doc.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      var first = nav.querySelector('a');
      if (first) first.focus({ preventScroll: true });
    }
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    navLinks.forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setMenu(false);
        toggle.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 980 && nav.classList.contains('is-open')) setMenu(false);
    });
  }

  /* ---------- reveal on scroll ---------- */
  var revealEls = doc.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || reduceMotion) {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = (i % 3) * 70 + 'ms';
      io.observe(el);
    });
  }

  /* ---------- subtle hero parallax ---------- */
  var heroVisual = doc.querySelector('.hero__visual');
  if (heroVisual && !reduceMotion && window.innerWidth > 980) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, window.innerHeight);
        heroVisual.style.transform = 'translate3d(0,' + (y * 0.06) + 'px,0)';
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- faq: one open at a time ---------- */
  var faqItems = doc.querySelectorAll('.faq__item');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      faqItems.forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });

  /* ---------- inquiry form ---------- */
  var form = doc.getElementById('inquiryForm');
  var done = doc.getElementById('formDone');
  var summary = doc.getElementById('formSummary');
  var smsLink = doc.getElementById('smsLink');
  var copyBtn = doc.getElementById('copyBtn');
  var editBtn = doc.getElementById('editBtn');

  var PHONE = '+821022947561';

  function val(id) {
    var el = doc.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function setError(id, bad) {
    var el = doc.getElementById(id);
    if (!el) return;
    var field = el.closest('.field');
    var err = doc.getElementById(id + '-err');
    if (field) field.classList.toggle('is-invalid', bad);
    if (err) err.hidden = !bad;
    el.setAttribute('aria-invalid', bad ? 'true' : 'false');
  }

  function buildSummary() {
    var lines = ['[스튜디오 누아 문의]'];
    lines.push('상호/브랜드: ' + val('f-name'));
    lines.push('연락처: ' + val('f-phone'));
    if (val('f-industry')) lines.push('업종: ' + val('f-industry'));
    if (val('f-plan')) lines.push('관심 패키지: ' + val('f-plan'));
    if (val('f-site')) lines.push('현재 사이트: ' + val('f-site'));
    if (val('f-message')) {
      lines.push('');
      lines.push(val('f-message'));
    }
    return lines.join('\n');
  }

  if (form && done && summary) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      /* honeypot: silently stop bots */
      if (val('f-company')) return;

      var nameBad = val('f-name').length < 1;
      var phoneRaw = val('f-phone').replace(/[^0-9+]/g, '');
      var phoneBad = phoneRaw.replace(/\+/g, '').length < 9 || phoneRaw.replace(/\+/g, '').length > 12;

      setError('f-name', nameBad);
      setError('f-phone', phoneBad);

      if (nameBad || phoneBad) {
        var firstBad = doc.getElementById(nameBad ? 'f-name' : 'f-phone');
        if (firstBad) firstBad.focus();
        return;
      }

      var text = buildSummary();
      summary.textContent = text;
      smsLink.href = 'sms:' + PHONE + '?&body=' + encodeURIComponent(text);

      form.hidden = true;
      done.hidden = false;
      done.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      var heading = done.querySelector('h3');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
    });

    ['f-name', 'f-phone'].forEach(function (id) {
      var el = doc.getElementById(id);
      if (!el) return;
      el.addEventListener('input', function () { setError(id, false); });
    });

    if (editBtn) {
      editBtn.addEventListener('click', function () {
        done.hidden = true;
        form.hidden = false;
        var name = doc.getElementById('f-name');
        if (name) name.focus();
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var text = summary.textContent;
        var show = function (ok) {
          copyBtn.textContent = ok ? '복사했습니다' : '길게 눌러 복사하세요';
          if (!ok) {
            try {
              var range = doc.createRange();
              range.selectNodeContents(summary);
              var sel = window.getSelection();
              sel.removeAllRanges();
              sel.addRange(range);
            } catch (err) { /* selection not available */ }
          }
          setTimeout(function () { copyBtn.textContent = '내용 복사'; }, 2600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () { show(true); }, function () { show(false); });
        } else {
          var ta = doc.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          doc.body.appendChild(ta);
          ta.select();
          var ok = false;
          try { ok = doc.execCommand('copy'); } catch (err) { ok = false; }
          doc.body.removeChild(ta);
          show(ok);
        }
      });
    }
  }

  /* ---------- year ---------- */
  var year = doc.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
