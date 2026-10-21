/**
 * 导航与页面交互：
 * 1. 页面滚动时给导航栏加投影并切换深浅主题
 * 2. 小屏汉堡菜单动画
 * 3. 主页锚点滚动高亮当前区块
 * 4. 内容区滚动浮现 + staggered 动画
 * 5. 欢迎页视差效果
 * 6. 眼睛入口点击后触发主页内容依次浮现
 * 7. 作品下拉面板切换
 */
(function () {
  'use strict';

  document.body.classList.add('js-enabled');

  /* ---------- 0. 生成真实珠帘 ---------- */
  function buildCurtain() {
    if (!curtainInner) return;
    var count = window.innerWidth > 760 ? 16 : 10;
    var half = count / 2;
    var beadColors = ['var(--yellow)', 'var(--red)', 'var(--green)'];

    curtainInner.style.setProperty('--slat-count', count);

    for (var i = 0; i < count; i++) {
      var slat = document.createElement('div');
      slat.className = 'curtain__slat is-animating';
      slat.style.setProperty('--slat-w', (100 / count) + '%');
      slat.style.setProperty('--slat-x', (i * (100 / count)) + '%');

      var isLeft = i < half;
      var distanceFromCenter = Math.abs(i - half + 0.5);
      var maxDelay = 0.35;
      var delay = (distanceFromCenter / half) * maxDelay;
      var slideTo = isLeft
        ? 'calc(-120% - ' + (distanceFromCenter * 18) + '%)'
        : 'calc(120% + ' + (distanceFromCenter * 18) + '%)';

      slat.style.setProperty('--slat-origin', isLeft ? 'right center' : 'left center');
      slat.style.setProperty('--sway-dir', isLeft ? '-1' : '1');
      slat.style.setProperty('--slide-to', slideTo);
      slat.style.setProperty('--slat-delay', delay + 's');

      // 珠串线
      var line = document.createElement('div');
      line.className = 'curtain__beads-line';
      var beadsCount = 5 + Math.floor(Math.random() * 3);
      for (var b = 0; b < beadsCount; b++) {
        var bead = document.createElement('span');
        bead.className = 'curtain__bead';
        bead.style.top = (12 + b * 18 + Math.random() * 4) + '%';
        bead.style.background = beadColors[b % 3];
        line.appendChild(bead);
      }
      slat.appendChild(line);
      curtainInner.appendChild(slat);
    }

    // 动画结束后隐藏 curtain
    var lastDelay = maxDelay + 1.45;
    window.setTimeout(function () {
      if (curtain) curtain.classList.add('is-opened');
    }, lastDelay * 1000);
  }
  buildCurtain();

  var nav = document.getElementById('site-nav');
  if (!nav) return;

  var toggle = nav.querySelector('.nav__toggle');
  var menuLinks = nav.querySelectorAll('.nav__list a');
  var landing = document.querySelector('.landing');
  var landingImage = document.querySelector('.landing__image');
  var enterBtn = document.querySelector('.landing__enter');
  var main = document.getElementById('main');
  var worksToggle = document.querySelector('.works-toggle');
  var tvFlash = document.getElementById('tv-flash');
  var curtain = document.getElementById('curtain');
  var curtainInner = document.getElementById('curtain-inner');

  /* ---------- 1. 滚动后加投影 + 深浅主题切换 ---------- */
  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 8);

    if (landing) {
      var threshold = landing.offsetHeight - nav.offsetHeight;
      nav.classList.toggle('is-dark', y < threshold);
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
    if (nav.classList.contains('is-open') && !nav.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 760) closeMenu();
  });

  /* ---------- 3. 主页锚点滚动高亮 ---------- */
  var spyTargets = [];
  menuLinks.forEach(function (link) {
    var hash = link.getAttribute('href');
    if (hash && hash.charAt(0) === '#') {
      var target = document.querySelector(hash);
      if (target) spyTargets.push({ link: link, target: target });
    }
  });

  if ('IntersectionObserver' in window && spyTargets.length) {
    function setActive(id) {
      spyTargets.forEach(function (item) {
        item.link.classList.toggle('is-active', item.target.id === id);
      });
    }

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    spyTargets.forEach(function (item) { spy.observe(item.target); });
  }

  /* ---------- 4. 内容区滚动浮现 + staggered ---------- */
  var revealTargets = [];
  document.querySelectorAll('.hero, .section').forEach(function (el, index) {
    el.style.transitionDelay = '0s';
    revealTargets.push({ el: el, index: index });
  });

  function revealAll() {
    revealTargets.forEach(function (item, i) {
      setTimeout(function () {
        item.el.classList.add('is-visible');
      }, i * 90);
    });
  }

  if ('IntersectionObserver' in window && revealTargets.length) {
    var firstBatch = true;
    var revealer = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          if (firstBatch && entry.target.classList.contains('hero')) {
            firstBatch = false;
            revealAll();
          } else {
            entry.target.classList.add('is-visible');
          }
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealTargets.forEach(function (item) { revealer.observe(item.el); });
  } else {
    revealAll();
  }

  /* ---------- 5. 欢迎页视差 ---------- */
  if (landingImage) {
    landingImage.classList.add('is-parallax');
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      var rate = y * 0.18;
      landingImage.style.transform = 'translateY(' + rate + 'px) scale(' + (1 + y * 0.0002) + ')';
    }, { passive: true });
  }

  /* ---------- 7. 作品下拉面板切换 ---------- */
  if (worksToggle) {
    var panel = document.getElementById('works-panel');
    worksToggle.addEventListener('click', function () {
      var expanded = worksToggle.getAttribute('aria-expanded') === 'true';
      worksToggle.setAttribute('aria-expanded', String(!expanded));
      if (panel) {
        panel.classList.toggle('is-collapsed', expanded);
      }
    });
  }

  /* ---------- 8. 鼠标跟随光斑 ---------- */
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

  function animateSpotlight() {
    spotX += (mouseX - spotX) * 0.08;
    spotY += (mouseY - spotY) * 0.08;
    spotlight.style.left = spotX + 'px';
    spotlight.style.top = spotY + 'px';
    spotlight.style.opacity = isMoving ? '1' : '0.7';
    window.requestAnimationFrame(animateSpotlight);
  }
  animateSpotlight();

  /* ---------- 9. 卡片 3D tilt 效果 ---------- */
  function addTilt(selector, maxRotate) {
    maxRotate = maxRotate || 8;
    document.querySelectorAll(selector).forEach(function (card) {
      var baseRotate = getComputedStyle(card).getPropertyValue('--base-rotate').trim() || '0deg';
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var cx = rect.width / 2;
        var cy = rect.height / 2;
        var rx = ((y - cy) / cy) * -maxRotate;
        var ry = ((x - cx) / cx) * maxRotate;
        card.classList.add('is-tilted');
        card.style.transform = 'perspective(1000px) rotate(' + baseRotate + ') rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateZ(8px) scale(1.015)';

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

  addTilt('.section', 4);
  addTilt('.hobby-card', 10);
  addTilt('.pin-card', 7);

  /* ---------- 10. 按钮磁吸效果 ---------- */
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
      var circle = document.createElement('span');
      circle.className = 'ripple';
      var rect = btn.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      circle.style.width = circle.style.height = size + 'px';
      circle.style.left = (e.clientX - rect.left - size / 2) + 'px';
      circle.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(circle);
      window.setTimeout(function () { circle.remove(); }, 600);
    });
  });

  /* ---------- 11. 爱好卡片点击波纹 ---------- */
  document.querySelectorAll('.hobby-card').forEach(function (card) {
    card.addEventListener('click', function (e) {
      var ripple = document.createElement('span');
      ripple.className = 'ripple';
      var rect = card.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height) * 1.2;
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      ripple.style.background = 'rgba(244, 211, 94, 0.18)';
      card.appendChild(ripple);
      window.setTimeout(function () { ripple.remove(); }, 600);
    });
  });

  /* ---------- 12. 文字逐行淡入 ---------- */
  var revealLines = document.querySelectorAll('.reveal-line');
  if ('IntersectionObserver' in window && revealLines.length) {
    var lineObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, idx) {
        if (entry.isIntersecting) {
          window.setTimeout(function () {
            entry.target.classList.add('is-visible');
          }, idx * 120);
          lineObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    revealLines.forEach(function (line) { lineObserver.observe(line); });
  } else {
    revealLines.forEach(function (line) { line.classList.add('is-visible'); });
  }

  /* ---------- 6. 眼睛入口点击后触发电视闪屏 + 主页 staggered 动画 ---------- */
  if (enterBtn) {
    enterBtn.addEventListener('click', function (event) {
      event.preventDefault();

      // 电视闪屏
      if (tvFlash) {
        tvFlash.classList.add('is-active');
        window.setTimeout(function () {
          tvFlash.classList.remove('is-active');
        }, 360);
      }

      // 先重置所有内容区为未显示状态
      revealTargets.forEach(function (item) {
        item.el.classList.remove('is-visible');
      });

      // 平滑滚动到主页
      var target = document.getElementById('home');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }

      // 让浏览器先完成滚动，再依次浮现
      window.setTimeout(function () {
        revealAll();
      }, 520);
    });
  }
})();
