/* =========================================================
   ATELIER ON — interactions
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
    document.body.classList.toggle('is-locked', open);
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
    if (i > 0) el.style.transitionDelay = Math.min(i * 80, 320) + 'ms';
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
  var counters = Array.prototype.slice.call(document.querySelectorAll('.counter'));

  function runCounter(el) {
    var target = parseFloat(el.getAttribute('data-to')) || 0;
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var duration = 1500;
    var start = null;

    if (reduceMotion) {
      el.textContent = format(target, decimals);
      return;
    }

    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(target * eased, decimals);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = format(target, decimals);
    }
    function format(v, d) {
      var n = d > 0 ? v.toFixed(d) : Math.round(v).toString();
      var parts = n.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
    }
    requestAnimationFrame(step);
  }

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
     Portfolio data + modal
     ------------------------------------------------------- */
  var projects = [
    {
      eyebrow: 'RESIDENTIAL — HANNAM',
      title: '빛을 담는 거실',
      image: 'assets/img/hero.jpg',
      alt: '한남동 45평 거실 전경',
      desc: '남향의 큰 창을 그대로 살리고, 낮은 트래버틴 테이블과 오크 바닥으로 빛이 머무는 자리를 만들었습니다. 가구선을 최대한 낮춰 창 밖의 능선이 시선의 끝이 되도록 했고, 저녁에는 간접 조명만으로 공간이 닫히도록 배선을 나눴습니다.',
      specs: [
        ['지역', '서울 용산구 한남동'],
        ['면적', '45평 · 148㎡'],
        ['공정', '8주'],
        ['예산', '1억 2,000만 원'],
        ['스타일', '모던 뉴트럴'],
        ['자재', '트래버틴, 화이트 오크, 린넨']
      ]
    },
    {
      eyebrow: 'COMMERCIAL — SEONGSU',
      title: '머무는 쇼룸',
      image: 'assets/img/cafe.jpg',
      alt: '성수동 28평 카페 쇼룸 내부',
      desc: '판매보다 체류가 중요한 공간이라 동선을 일부러 길게 잡았습니다. 마이크로 시멘트 벽과 낮은 오크 진열장이 제품의 색을 가리지 않게 했고, 창가의 긴 테이블은 혼자 와도 어색하지 않은 간격으로 나눴습니다.',
      specs: [
        ['지역', '서울 성동구 성수동'],
        ['면적', '28평 · 92㎡'],
        ['공정', '5주'],
        ['예산', '6,800만 원'],
        ['스타일', '상업 · 미니멀'],
        ['자재', '마이크로 시멘트, 오크, 세라믹']
      ]
    },
    {
      eyebrow: 'RESIDENTIAL — SAMSEONG',
      title: '아침이 시작되는 주방',
      image: 'assets/img/kitchen.jpg',
      alt: '삼성동 34평 주방과 다이닝',
      desc: '좁은 주방과 거실 사이의 벽을 절반만 열어, 요리하는 사람과 기다리는 사람이 서로를 볼 수 있게 했습니다. 상판은 관리가 쉬운 호닝 라임스톤, 손이 닿는 수납은 오크로 마감해 매일 쓰는 가구처럼 편안하게 만들었습니다.',
      specs: [
        ['지역', '서울 강남구 삼성동'],
        ['면적', '34평 · 112㎡'],
        ['공정', '6주'],
        ['예산', '7,500만 원'],
        ['스타일', '웜 미니멀'],
        ['자재', '라임스톤, 오크, 무광 블랙']
      ]
    },
    {
      eyebrow: 'RESIDENTIAL — PANGGYO',
      title: '낮은 목재의 침실',
      image: 'assets/img/bedroom.jpg',
      alt: '판교 52평 타운하우스 침실',
      desc: '두 아이의 방과 부부의 방 사이에 가족실을 두고, 침실은 낮은 목재 헤드보드로 천장을 눌러 잠의 공간임을 알렸습니다. 커튼은 이중으로 달아 낮에는 빛만, 밤에는 온도만 남도록 했습니다.',
      specs: [
        ['지역', '경기 성남시 판교동'],
        ['면적', '52평 · 172㎡'],
        ['공정', '9주'],
        ['예산', '1억 4,000만 원'],
        ['스타일', '우드 톤'],
        ['자재', '월넛, 트래버틴, 울']
      ]
    },
    {
      eyebrow: 'RESIDENTIAL — YEONHUI',
      title: '창가의 서재',
      image: 'assets/img/study.jpg',
      alt: '연희동 40평 단독주택 서재',
      desc: '단독주택의 작은 방을 서재로 바꾸며, 창을 책상 앞이 아니라 옆에 두었습니다. 일하다 고개를 들면 마당이 보이도록. 석회 미장 벽은 시간이 지나며 조금씩 색이 변해, 집의 나이를 그대로 남깁니다.',
      specs: [
        ['지역', '서울 서대문구 연희동'],
        ['면적', '40평 · 132㎡'],
        ['공정', '7주'],
        ['예산', '9,200만 원'],
        ['스타일', '내추럴 모던'],
        ['자재', '오크, 석회 미장, 린넨']
      ]
    },
    {
      eyebrow: 'RESIDENTIAL — BANPO',
      title: '저녁이 길어지는 식탁',
      image: 'assets/img/dusk.jpg',
      alt: '반포동 39평 다이닝, 저녁 도시 야경',
      desc: '강변의 야경을 방해하지 않도록 창가 쪽 가구를 모두 낮추고, 식탁 위 조명만 남겼습니다. 브론즈 프레임과 대리석 상판은 낮에는 차분하게, 밤에는 조명을 받아 따뜻하게 보이도록 색온도를 맞췄습니다.',
      specs: [
        ['지역', '서울 서초구 반포동'],
        ['면적', '39평 · 128㎡'],
        ['공정', '7주'],
        ['예산', '8,900만 원'],
        ['스타일', '모던 클래식'],
        ['자재', '대리석, 오크, 브론즈']
      ]
    }
  ];

  var modal = document.getElementById('projectModal');
  var modalImage = document.getElementById('modalImage');
  var modalIndex = document.getElementById('modalIndex');
  var modalEyebrow = document.getElementById('modalEyebrow');
  var modalTitle = document.getElementById('modalTitle');
  var modalDesc = document.getElementById('modalDesc');
  var modalSpecs = document.getElementById('modalSpecs');
  var modalDialog = modal ? modal.querySelector('.modal__dialog') : null;
  var current = 0;
  var lastFocused = null;
  var closeTimer = null;

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function renderProject(i) {
    current = (i + projects.length) % projects.length;
    var p = projects[current];
    modalImage.src = p.image;
    modalImage.alt = p.alt;
    modalIndex.textContent = pad(current + 1) + ' / ' + pad(projects.length);
    modalEyebrow.textContent = p.eyebrow;
    modalTitle.textContent = p.title;
    modalDesc.textContent = p.desc;
    modalSpecs.innerHTML = p.specs.map(function (row) {
      return '<div><dt>' + row[0] + '</dt><dd>' + row[1] + '</dd></div>';
    }).join('');
  }

  function openModal(i) {
    if (!modal) return;
    clearTimeout(closeTimer);
    lastFocused = document.activeElement;
    renderProject(i);
    modal.hidden = false;
    document.body.classList.add('is-locked');
    requestAnimationFrame(function () {
      modal.classList.add('is-open');
      var closeBtn = modal.querySelector('.modal__close');
      if (closeBtn) closeBtn.focus({ preventScroll: true });
    });
  }

  function closeModal() {
    if (!modal || modal.hidden) return;
    modal.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    closeTimer = setTimeout(function () { modal.hidden = true; }, 380);
    if (lastFocused && lastFocused.focus) lastFocused.focus({ preventScroll: true });
  }

  document.querySelectorAll('.card').forEach(function (card) {
    var idx = parseInt(card.getAttribute('data-project'), 10) || 0;
    card.addEventListener('click', function () { openModal(idx); });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        openModal(idx);
      }
    });
  });

  if (modal) {
    modal.querySelectorAll('[data-close]').forEach(function (el) {
      el.addEventListener('click', function () { closeModal(); });
    });
    document.getElementById('modalPrev').addEventListener('click', function () {
      renderProject(current - 1);
    });
    document.getElementById('modalNext').addEventListener('click', function () {
      renderProject(current + 1);
    });

    document.addEventListener('keydown', function (e) {
      if (modal.hidden) return;
      if (e.key === 'Escape') { closeModal(); return; }
      if (e.key === 'ArrowLeft') { renderProject(current - 1); return; }
      if (e.key === 'ArrowRight') { renderProject(current + 1); return; }
      if (e.key === 'Tab') {
        var focusables = modal.querySelectorAll('button, a[href]');
        if (!focusables.length) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    });
  }

  /* -------------------------------------------------------
     Quote form
     ------------------------------------------------------- */
  var form = document.getElementById('quoteForm');
  var done = document.getElementById('formDone');
  var doneSummary = document.getElementById('doneSummary');
  var resetBtn = document.getElementById('resetForm');

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

  if (form) {
    var agree = document.getElementById('agree');
    var agreeError = document.querySelector('[data-error-for="agree"]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var invalid = [];

      ['area', 'region', 'budget', 'name', 'phone'].forEach(function (id) {
        var el = document.getElementById(id);
        var ok = el.value.trim().length > 0;
        if (id === 'phone') ok = validPhone(el.value);
        if (id === 'name') ok = el.value.trim().length >= 1;
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

      var summary = [
        document.getElementById('area').value,
        document.getElementById('region').value,
        document.getElementById('budget').value
      ].join(' · ');
      var name = document.getElementById('name').value.trim();
      doneSummary.innerHTML = '<strong>' + name + '</strong> 님의 상담 신청<br>' + summary;
      form.hidden = true;
      done.hidden = false;
      done.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    });

    ['area', 'region', 'budget', 'name', 'phone'].forEach(function (id) {
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
        var first = document.getElementById('area');
        first.focus();
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
