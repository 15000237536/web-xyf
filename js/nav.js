/**
 * 导航与页面交互：
 * 1. 页面滚动时给导航栏加投影并切换深浅主题
 * 2. 小屏汉堡菜单动画
 * 3. 主页锚点滚动高亮当前区块
 * 4. 内容区滚动浮现 + staggered 动画
 * 5. 欢迎页视差效果
 * 6. 眼睛入口点击后触发主页内容依次浮现
 */
(function () {
  'use strict';

  document.body.classList.add('js-enabled');

  var nav = document.getElementById('site-nav');
  if (!nav) return;

  var toggle = nav.querySelector('.nav__toggle');
  var menuLinks = nav.querySelectorAll('.nav__list a');
  var landing = document.querySelector('.landing');
  var landingImage = document.querySelector('.landing__image');
  var enterBtn = document.querySelector('.landing__enter');
  var main = document.getElementById('main');

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

  /* ---------- 6. 眼睛入口点击后触发主页 staggered 动画 ---------- */
  if (enterBtn && main) {
    enterBtn.addEventListener('click', function (event) {
      // 先重置所有内容区为未显示状态
      revealTargets.forEach(function (item) {
        item.el.classList.remove('is-visible');
      });

      // 让浏览器先完成滚动，再依次浮现
      window.setTimeout(function () {
        revealAll();
      }, 420);
    });
  }
})();
