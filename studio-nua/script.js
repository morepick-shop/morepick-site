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
    if (val('f-type')) lines.push('원하는 유형: ' + val('f-type'));
    if (val('f-budget')) lines.push('예산 범위: ' + val('f-budget'));
    if (val('f-date')) lines.push('희망 오픈일: ' + val('f-date'));
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

  /* ---------- shared: tagged message line + form view ---------- */
  function setTaggedLine(tag, line) {
    var msg = doc.getElementById('f-message');
    if (!msg) return;
    var marker = '[' + tag + ']';
    var idx = msg.value.indexOf(marker);
    if (idx !== -1) {
      var end = msg.value.indexOf('\n', idx);
      msg.value = msg.value.slice(0, idx) + line + (end === -1 ? '' : msg.value.slice(end));
    } else {
      msg.value = msg.value ? (line + '\n' + msg.value) : line;
    }
  }

  function showFormView() {
    if (!form || !done) return;
    if (form.hidden) {
      form.hidden = false;
      done.hidden = true;
    }
  }

  function setBudget(total) {
    var budget = doc.getElementById('f-budget');
    if (!budget) return;
    var bucket = total <= 500000 ? '50만 원 이하'
      : total <= 1000000 ? '50~100만 원'
      : total <= 1500000 ? '100~150만 원'
      : total <= 2000000 ? '150~200만 원' : '200만 원 이상';
    budget.value = bucket;
  }

  /* ---------- free diagnosis CTA ---------- */
  var diagCta = doc.getElementById('diagCta');
  if (diagCta) {
    diagCta.addEventListener('click', function () {
      var typeSel = doc.getElementById('f-type');
      if (typeSel) typeSel.value = '아직 모름';
      showFormView();
      setTaggedLine('무료 진단', '[무료 진단] 5항목 체크를 신청합니다. 지금 사이트 주소를 함께 적어 주세요.');
    });
  }

  /* ---------- estimate calculator ---------- */
  var calc = doc.getElementById('calc');
  if (calc) {
    var planData = {};
    doc.querySelectorAll('.plan[data-plan]').forEach(function (card) {
      planData[card.getAttribute('data-plan')] = {
        name: card.getAttribute('data-name') || '',
        price: Number(card.getAttribute('data-price')) || 0,
        offer: Number(card.getAttribute('data-offer')) || 0,
        term: card.getAttribute('data-term') || '',
        rev: card.getAttribute('data-rev') || ''
      };
    });

    var calcSteps = calc.querySelectorAll('.calc__step');
    var calcPanels = calc.querySelectorAll('.calc__panel');
    var calcPrev = doc.getElementById('calcPrev');
    var calcNext = doc.getElementById('calcNext');
    var calcHint = doc.getElementById('calcHint');
    var typeInputs = calc.querySelectorAll('input[name="calc-type"]');
    var pageInputs = calc.querySelectorAll('input[name="calc-pages"]');
    var optInputs = calc.querySelectorAll('input[name="calc-opt"]');
    var extraPage = Number(calc.getAttribute('data-extra-page')) || 0;
    var calcStep = 1;

    var calcOut = {
      total: doc.getElementById('calcTotal'),
      regular: doc.getElementById('calcRegular'),
      term: doc.getElementById('calcTerm'),
      rev: doc.getElementById('calcRev'),
      breakdown: doc.getElementById('calcBreakdown'),
      monthly: doc.getElementById('calcMonthly'),
      quote: doc.getElementById('calcQuote'),
      save: doc.getElementById('calcSave'),
      bar: doc.getElementById('calcBar'),
      live: doc.getElementById('calcLive'),
      sms: doc.getElementById('calcSms'),
      cta: doc.getElementById('calcCta')
    };

    var HINTS = [
      '',
      '1 / 3 — 유형을 고르면 금액이 바로 바뀝니다.',
      '2 / 3 — 추가 페이지는 1페이지 ' + moneyHelper(extraPage) + '원입니다.',
      '3 / 3 — 옵션은 나중에 따로 추가하셔도 됩니다.'
    ];

    function moneyHelper(n) { return Number(n).toLocaleString('ko-KR'); }

    function calcState() {
      var type = 'landing';
      typeInputs.forEach(function (i) { if (i.checked) type = i.value; });
      var pages = 0;
      pageInputs.forEach(function (i) { if (i.checked) pages = Number(i.value) || 0; });
      var plan = planData[type] || { name: '', price: 0, offer: 0, term: '', rev: '' };
      var labels = [];
      var add = 0;
      var monthly = 0;
      var quote = false;
      optInputs.forEach(function (i) {
        if (!i.checked) return;
        labels.push(i.getAttribute('data-label') || i.value);
        add += Number(i.getAttribute('data-add')) || 0;
        monthly += Number(i.getAttribute('data-monthly')) || 0;
        if (i.getAttribute('data-quote') === '1') quote = true;
      });
      var extras = pages * extraPage;
      var parts = [plan.name];
      if (pages) parts.push('추가 ' + pages + '페이지');
      if (labels.length) parts.push(labels.join(' · '));
      return {
        type: type,
        plan: plan,
        pages: pages,
        labels: labels,
        quote: quote,
        monthly: monthly,
        breakdown: parts.join(' + '),
        total: (plan.offer || plan.price) + extras + add,
        regular: plan.price + extras + add
      };
    }

    function calcText(s) {
      var lines = ['[스튜디오 누아 견적]'];
      lines.push('유형: ' + s.plan.name);
      if (s.pages) lines.push('추가 페이지: ' + s.pages + 'p');
      if (s.labels.length) lines.push('옵션: ' + s.labels.join(', '));
      lines.push('예상 금액: ' + moneyHelper(s.total) + '원 (오픈 특가 적용 · 부가세 포함)');
      lines.push('정가: ' + moneyHelper(s.regular) + '원');
      lines.push('기간: ' + s.plan.term + ' · 수정 ' + s.plan.rev);
      if (s.monthly) lines.push('월 유지보수: ' + moneyHelper(s.monthly) + '원 / 월 (별도)');
      if (s.quote) lines.push('예약·결제 기능은 별도 견적');
      return lines.join('\n');
    }

    function renderCalc() {
      var s = calcState();
      calcOut.total.textContent = moneyHelper(s.total);
      if (calcOut.live) calcOut.live.textContent = moneyHelper(s.total);
      calcOut.regular.textContent = moneyHelper(s.regular) + '원';
      calcOut.term.textContent = s.plan.term + (s.pages ? ' · 추가 일정 협의' : '');
      calcOut.rev.textContent = s.plan.rev;
      calcOut.breakdown.textContent = s.breakdown;
      if (calcOut.save) {
        var save = s.regular - s.total;
        calcOut.save.hidden = save <= 0;
        calcOut.save.textContent = save > 0 ? '정가에서 ' + moneyHelper(save) + '원 줄어든 금액입니다' : '';
      }
      if (s.monthly) {
        calcOut.monthly.hidden = false;
        calcOut.monthly.textContent = '월 유지보수 ' + moneyHelper(s.monthly) + '원 / 월 (합계와 별도)';
      } else {
        calcOut.monthly.hidden = true;
      }
      calcOut.quote.hidden = !s.quote;
      if (calcOut.sms) calcOut.sms.href = 'sms:' + PHONE + '?&body=' + encodeURIComponent(calcText(s));
      return s;
    }

    function setCalcStep(n) {
      calcStep = Math.min(3, Math.max(1, n));
      calcSteps.forEach(function (btn) {
        var i = Number(btn.getAttribute('data-step'));
        var active = i === calcStep;
        btn.classList.toggle('is-active', active);
        btn.classList.toggle('is-done', i < calcStep);
        btn.setAttribute('aria-selected', active ? 'true' : 'false');
        btn.setAttribute('tabindex', active ? '0' : '-1');
      });
      calcPanels.forEach(function (panel, idx) { panel.hidden = idx !== calcStep - 1; });
      if (calcPrev) calcPrev.hidden = calcStep === 1;
      if (calcNext) {
        calcNext.innerHTML = calcStep === 3
          ? '이 견적으로 상담 <span aria-hidden="true">→</span>'
          : '다음 <span aria-hidden="true">→</span>';
      }
      if (calcHint) calcHint.textContent = HINTS[calcStep];
      if (calcOut.bar) calcOut.bar.style.width = (calcStep / 3 * 100) + '%';
    }

    function applyEstimate(s) {
      showFormView();
      var typeSel = doc.getElementById('f-type');
      if (typeSel) {
        var want = s.type === 'landing' ? '랜딩 원페이지' : '브랜드 5페이지';
        for (var i = 0; i < typeSel.options.length; i++) {
          if (typeSel.options[i].value === want) { typeSel.value = want; break; }
        }
      }
      setBudget(s.total);
      setTaggedLine('견적 계산기', '[견적 계산기] ' + s.breakdown + ' → ' + moneyHelper(s.total) + '원 (정가 ' + moneyHelper(s.regular) + '원)');
    }

    function goContact() {
      var target = doc.getElementById('contact');
      if (!target) return;
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      if (history.replaceState) history.replaceState(null, '', '#contact');
    }

    [].forEach.call(typeInputs, function (i) { i.addEventListener('change', renderCalc); });
    [].forEach.call(pageInputs, function (i) { i.addEventListener('change', renderCalc); });
    [].forEach.call(optInputs, function (i) { i.addEventListener('change', renderCalc); });

    [].forEach.call(calcSteps, function (btn) {
      btn.addEventListener('click', function () { setCalcStep(Number(btn.getAttribute('data-step'))); });
      btn.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        var nextStep = e.key === 'ArrowRight' ? calcStep + 1 : calcStep - 1;
        setCalcStep(nextStep);
        var activeBtn = calc.querySelector('.calc__step.is-active');
        if (activeBtn) activeBtn.focus();
      });
    });

    if (calcPrev) {
      calcPrev.addEventListener('click', function () { setCalcStep(calcStep - 1); });
    }
    if (calcNext) {
      calcNext.addEventListener('click', function () {
        if (calcStep < 3) {
          setCalcStep(calcStep + 1);
          return;
        }
        applyEstimate(renderCalc());
        goContact();
      });
    }
    if (calcOut.cta) {
      calcOut.cta.addEventListener('click', function () { applyEstimate(renderCalc()); });
    }

    renderCalc();
    setCalcStep(1);
  }

  /* ---------- year ---------- */
  var year = doc.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
