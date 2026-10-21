/**
 * 导航交互：
 * 1. 页面滚动时给导航栏加投影
 * 2. 小屏汉堡菜单动画
 * 3. 主页锚点高亮当前区块
 * 4. 内容区滚动浮现
 */
(function () {
  'use strict';

  document.body.classList.add('js-enabled');

  var nav = document.getElementById('site-nav');
  if (!nav) return;

  var toggle = nav.querySelector('.nav__toggle');
  var menuLinks = nav.querySelectorAll('.nav__list a');

  /* 1. 滚动后加投影 */
  var landing = document.querySelector('.landing');
  function onScroll() {
    nav.classList.toggle('is-scrolled', window.scrollY > 8);
    if (landing) {
      var threshold = landing.offsetHeight - nav.offsetHeight;
      nav.classList.toggle('is-dark', window.scrollY < threshold);
    }
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* 2. 移动端汉堡菜单 */
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

  /* 3. 主页锚点滚动高亮 */
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

  /* 4. 内容区滚动浮现 */
  if ('IntersectionObserver' in window) {
    var revealTargets = document.querySelectorAll('.hero, .section');
    var revealer = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealTargets.forEach(function (el) { revealer.observe(el); });
  }
})();
