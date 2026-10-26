/**
 * 全站交互脚本
 *  0. 欢迎页珠帘生成（仅 index）
 *  1. 导航滚动投影 + 欢迎页深色主题切换
 *  2. 移动端汉堡菜单
 *  3. 锚点滚动高亮
 *  4. 内容区滚动浮现 + staggered
 *  5. 欢迎页视差
 *  6. 眼睛入口：电视闪屏 + 滚动到主页
 *  7. 作品下拉面板
 *  8. 鼠标跟随光斑
 *  9. 卡片三维倾斜（3D tilt）
 * 10. 按钮磁吸 + 点击波纹
 * 11. 爱好卡片波纹 + 主色联动
 * 12. 文字逐行淡入
 * 13. 页面转场（彩色条带擦除）
 * 14. 标题逐字浮现
 * 15. 阅读进度条
 */
(function () {
  'use strict';

  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  document.body.classList.add('js-enabled');

  /* ---------- 变量集中声明 ---------- */
  var nav = document.getElementById('site-nav');
  var curtain = document.getElementById('curtain');
  var curtainInner = document.getElementById('curtain-inner');
  var transition = document.getElementById('page-transition');
  var transitionLabel = transition ? transition.querySelector('.page-transition__label') : null;
  var landing = document.querySelector('.landing');
  var landingImage = document.querySelector('.landing__image');
  var enterBtn = document.querySelector('.landing__enter');
  var tvFlash = document.getElementById('tv-flash');
  var worksToggle = document.querySelector('.works-toggle');

  /* ---------- 0. 生成真实珠帘 ---------- */
  function buildCurtain() {
    if (!curtainInner) return;

    var count = window.innerWidth > 760 ? 16 : 10;
    var half = count / 2;
    var maxDelay = 0.35;

    for (var i = 0; i < count; i++) {
      var slat = document.createElement('div');
      slat.className = 'curtain__slat is-animating';
      slat.style.setProperty('--slat-w', (100 / count) + '%');
      slat.style.setProperty('--slat-x', (i * (100 / count)) + '%');

      var isLeft = i < half;
      var distance = Math.abs(i - half + 0.5);
      var delay = (distance / half) * maxDelay;
      var slideTo = isLeft
        ? 'calc(-120% - ' + (distance * 18) + '%)'
        : 'calc(120% + ' + (distance * 18) + '%)';

      slat.style.setProperty('--slat-origin', isLeft ? 'right center' : 'left center');
      slat.style.setProperty('--sway-dir', isLeft ? '-1' : '1');
      slat.style.setProperty('--slide-to', slideTo);
      slat.style.setProperty('--slat-delay', delay + 's');

      // 帘条上的珠串
      var line = document.createElement('div');
      line.className = 'curtain__beads-line';
      var beadsCount = 5 + Math.floor(Math.random() * 3);
      for (var b = 0; b < beadsCount; b++) {
        var bead = document.createElement('span');
        bead.className = 'curtain__bead';
        bead.style.top = (12 + b * 18 + Math.random() * 4) + '%';
        line.appendChild(bead);
      }
      slat.appendChild(line);
      curtainInner.appendChild(slat);
    }

    // 动画结束后隐藏，避免遮挡页面交互
    window.setTimeout(function () {
      if (curtain) curtain.classList.add('is-opened');
    }, (maxDelay + 1.45) * 1000);
  }

  buildCurtain();

  if (nav) {
    var toggle = nav.querySelector('.nav__toggle');
    var menuLinks = nav.querySelectorAll('.nav__list a');

    /* ---------- 1. 滚动投影 + 深浅主题 ---------- */
    function onScroll() {
      var y = window.scrollY;
      nav.classList.toggle('is-scrolled', y > 8);

      if (landing) {
        nav.classList.toggle('is-dark', y < landing.offsetHeight - nav.offsetHeight);
      }
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    /* ---------- 2. 移动端汉堡菜单 ---------- */
    function closeMenu() {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', '打开菜单');
    }

    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? '关闭菜单' : '打开菜单');
    });

    menuLinks.forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', function (event) {
      if (nav.classList.contains('is-open') && !nav.contains(event.target)) closeMenu();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 760) closeMenu();
    });

    /* ---------- 3. 锚点滚动高亮 ---------- */
    var spyTargets = [];
    menuLinks.forEach(function (link) {
      var hash = link.getAttribute('href');
      if (hash && hash.charAt(0) === '#') {
        var target = document.querySelector(hash);
        if (target) spyTargets.push({ link: link, target: target });
      }
    });

    if ('IntersectionObserver' in window && spyTargets.length) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          spyTargets.forEach(function (item) {
            item.link.classList.toggle('is-active', item.target === entry.target);
          });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });

      spyTargets.forEach(function (item) { spy.observe(item.target); });
    }
  }

  /* ---------- 4. 内容区滚动浮现 + staggered ---------- */
  var revealTargets = [];
  document.querySelectorAll('.hero, .section, .page__header').forEach(function (el, index) {
    el.style.transitionDelay = '0s';
    revealTargets.push({ el: el, index: index });
  });

  function revealAll() {
    revealTargets.forEach(function (item, i) {
      window.setTimeout(function () {
        item.el.classList.add('is-visible');
      }, i * 90);
    });
  }

  if ('IntersectionObserver' in window && revealTargets.length) {
    var firstBatch = true;
    var revealer = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        if (firstBatch && entry.target.classList.contains('hero')) {
          firstBatch = false;
          revealAll();
        } else {
          entry.target.classList.add('is-visible');
        }
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });

    revealTargets.forEach(function (item) { revealer.observe(item.el); });
  } else {
    revealAll();
  }

  /* ---------- 5. 欢迎页视差 ---------- */
  if (landingImage && !reduceMotion) {
    landingImage.classList.add('is-parallax');
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      landingImage.style.transform = 'translateY(' + (y * 0.18) + 'px) scale(' + (1 + y * 0.0002) + ')';
    }, { passive: true });
  }

  /* ---------- 6. 眼睛入口：电视闪屏 + 滚动到主页 ---------- */
  if (enterBtn) {
    enterBtn.addEventListener('click', function (event) {
      event.preventDefault();

      if (tvFlash) {
        tvFlash.classList.add('is-active');
        window.setTimeout(function () { tvFlash.classList.remove('is-active'); }, 360);
      }

      revealTargets.forEach(function (item) {
        item.el.classList.remove('is-visible');
      });

      var target = document.getElementById('home');
      if (target) target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });

      window.setTimeout(revealAll, 520);
    });
  }

  /* ---------- 7. 作品下拉面板 ---------- */
  if (worksToggle) {
    var panel = document.getElementById('works-panel');
    worksToggle.addEventListener('click', function () {
      var expanded = worksToggle.getAttribute('aria-expanded') === 'true';
      worksToggle.setAttribute('aria-expanded', String(!expanded));
      if (panel) panel.classList.toggle('is-collapsed', expanded);
    });
  }

  /* ---------- 8. 鼠标跟随光斑（聚光灯） ---------- */
  var spotlight = document.createElement('div');
  spotlight.className = 'cursor-spotlight';
  document.body.appendChild(spotlight);

  var mouseX = window.innerWidth / 2;
  var mouseY = window.innerHeight / 2;
  var spotX = mouseX;
  var spotY = mouseY;
  var isMoving = false;
  var moveTimeout;

  window.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    isMoving = true;
    window.clearTimeout(moveTimeout);
    moveTimeout = window.setTimeout(function () { isMoving = false; }, 100);
  }, { passive: true });

  (function animateSpotlight() {
    spotX += (mouseX - spotX) * 0.08;
    spotY += (mouseY - spotY) * 0.08;
    spotlight.style.left = spotX + 'px';
    spotlight.style.top = spotY + 'px';
    spotlight.style.opacity = isMoving ? '1' : '0.7';
    window.requestAnimationFrame(animateSpotlight);
  })();

  /* ---------- 9. 卡片三维倾斜 ---------- */
  function addTilt(selector, maxRotate, skipNested) {
    maxRotate = maxRotate || 8;

    document.querySelectorAll(selector).forEach(function (card) {
      var baseRotate = getComputedStyle(card).getPropertyValue('--base-rotate').trim() || '0deg';

      card.addEventListener('mousemove', function (e) {
        // 内层卡片自己有倾斜时，外层区块不重复响应
        if (skipNested && e.target.closest && e.target.closest('.portal-card, .hobby-card, .pin-card')) return;

        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var cx = rect.width / 2;
        var cy = rect.height / 2;
        var rx = ((y - cy) / cy) * -maxRotate;
        var ry = ((x - cx) / cx) * maxRotate;

        card.classList.add('is-tilted');
        card.style.transform = 'perspective(1000px) rotate(' + baseRotate + ') rotateX(' + rx +
          'deg) rotateY(' + ry + 'deg) translateZ(8px) scale(1.015)';
        card.style.setProperty('--shine-x', ((x / rect.width) * 100) + '%');
        card.style.setProperty('--shine-y', ((y / rect.height) * 100) + '%');
      });

      card.addEventListener('mouseleave', function () {
        card.classList.remove('is-tilted');
        card.style.transform = '';
        card.style.setProperty('--shine-x', '50%');
        card.style.setProperty('--shine-y', '50%');
      });
    });
  }

  addTilt('.section', 4, true);
  addTilt('.portal-card', 6);
  addTilt('.hobby-card', 10);
  addTilt('.pin-card', 7);

  /* ---------- 10. 按钮磁吸 + 波纹 ---------- */
  function spawnRipple(host, e, color, scale) {
    var rect = host.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height) * (scale || 1);
    var ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    if (color) ripple.style.background = color;
    host.appendChild(ripple);
    window.setTimeout(function () { ripple.remove(); }, 600);
  }

  document.querySelectorAll('.btn').forEach(function (btn) {
    btn.addEventListener('mousemove', function (e) {
      var rect = btn.getBoundingClientRect();
      var x = e.clientX - rect.left - rect.width / 2;
      var y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = 'translate(' + (x * 0.2) + 'px, ' + (y * 0.2) + 'px)';
    });

    btn.addEventListener('mouseleave', function () {
      btn.style.transform = '';
    });

    btn.addEventListener('click', function (e) {
      spawnRipple(btn, e);
    });
  });

  /* ---------- 11. 爱好卡片：点击波纹 + 主色联动 ---------- */
  document.querySelectorAll('.hobby-card').forEach(function (card) {
    var accent = card.getAttribute('data-accent');

    card.addEventListener('click', function (e) {
      spawnRipple(card, e, 'rgba(244, 211, 94, 0.18)', 1.2);
    });

    if (accent) {
      card.addEventListener('mouseenter', function () {
        document.body.style.setProperty('--page-accent', accent);
      });
      card.addEventListener('mouseleave', function () {
        document.body.style.removeProperty('--page-accent');
      });
    }
  });

  /* ---------- 12. 文字逐行淡入 ---------- */
  var revealLines = document.querySelectorAll('.reveal-line');

  if ('IntersectionObserver' in window && revealLines.length) {
    var lineObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, idx) {
        if (!entry.isIntersecting) return;
        window.setTimeout(function () {
          entry.target.classList.add('is-visible');
        }, idx * 120);
        lineObserver.unobserve(entry.target);
      });
    }, { threshold: 0.3 });

    revealLines.forEach(function (line) { lineObserver.observe(line); });
  } else {
    revealLines.forEach(function (line) { line.classList.add('is-visible'); });
  }

  /* ---------- 13. 页面转场（彩色条带擦除） ---------- */
  var TRANSITION_FLAG = 'xyf-page-transition';

  function playEnter() {
    if (!transition || reduceMotion) return;

    var continuing = false;
    try {
      continuing = window.sessionStorage.getItem(TRANSITION_FLAG) === '1';
      window.sessionStorage.removeItem(TRANSITION_FLAG);
    } catch (err) { /* 隐私模式下忽略 */ }

    if (continuing) {
      // 上一页已经把画面盖住，这里直接揭开
      transition.classList.add('is-active', 'is-covered');
      window.requestAnimationFrame(function () {
        transition.classList.remove('is-covered');
        transition.classList.add('is-revealing');
        window.setTimeout(function () {
          transition.classList.remove('is-active', 'is-revealing');
        }, 950);
      });
    } else {
      // 首次进入：一道彩色条带自上而下扫过
      transition.classList.add('is-active', 'is-entering');
      window.setTimeout(function () {
        transition.classList.remove('is-active', 'is-entering');
      }, 1250);
    }
  }

  function playLeave(label, url) {
    if (!transition || reduceMotion) {
      window.location.href = url;
      return;
    }

    if (transitionLabel && label) transitionLabel.textContent = label;

    transition.classList.remove('is-active', 'is-entering', 'is-revealing', 'is-covered');
    void transition.offsetWidth; // 强制重排，确保动画重新播放
    transition.classList.add('is-active', 'is-leaving');

    try {
      window.sessionStorage.setItem(TRANSITION_FLAG, '1');
    } catch (err) { /* 忽略 */ }

    window.setTimeout(function () {
      window.location.href = url;
    }, 520);
  }

  document.addEventListener('click', function (event) {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    var el = event.target;
    while (el && el.nodeType !== 1) el = el.parentNode;
    var link = el && el.closest ? el.closest('a[href]') : null;
    if (!link) return;
    if (link.target && link.target !== '_self') return;
    if (link.hasAttribute('download')) return;

    var href = link.getAttribute('href');
    if (!href || href.charAt(0) === '#') return;
    if (/^(mailto:|tel:)/i.test(href)) return;

    var url;
    try {
      url = new URL(link.href, window.location.href);
    } catch (err) {
      return;
    }
    if (url.origin !== window.location.origin) return;
    // 同页锚点交给浏览器原生处理
    if (url.pathname === window.location.pathname) return;

    event.preventDefault();
    playLeave(link.getAttribute('data-transition-label') || (link.textContent || '').trim(), url.href);
  });

  playEnter();

  /* ---------- 14. 标题逐字浮现 ---------- */
  if (!reduceMotion) {
    document.querySelectorAll('[data-split]').forEach(function (title) {
      var text = title.textContent;
      var frag = document.createDocumentFragment();
      var order = 0;

      for (var i = 0; i < text.length; i++) {
        var ch = text.charAt(i);
        if (ch === ' ' || ch === '\n' || ch === '\t') {
          frag.appendChild(document.createTextNode(ch));
          continue;
        }
        var span = document.createElement('span');
        span.className = 'split-char';
        span.textContent = ch;
        span.style.animationDelay = (order * 0.05) + 's';
        order++;
        frag.appendChild(span);
      }

      title.textContent = '';
      title.appendChild(frag);
    });
  }

  /* ---------- 15. 阅读进度条 ---------- */
  var progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  progressBar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progressBar);

  function updateProgress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    progressBar.style.setProperty('--progress', ratio.toFixed(4));
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
})();
