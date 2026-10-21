/**
 * 待办事项清单 —— 原生 JavaScript 实现
 * 功能：增 / 删 / 标记完成 / 按分类筛选 / 截止时间排序 / localStorage 持久化
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'xyf-todo-v1';

  var CATEGORY_LABEL = {
    urgent: '临期',
    normal: '普通任务',
    resource: '资源整理'
  };

  /** 首次访问时的示例数据（来自真实群消息整理） */
  var SEED = [
    { id: 'demo-1', title: '填写《不购买回执单》', category: 'urgent', due: '', done: false },
    { id: 'demo-2', title: '打印心理期末作业：500-1000 字感悟心得', category: 'urgent', due: '', done: false },
    { id: 'demo-3', title: '准备综合英语 pre', category: 'normal', due: '', done: false },
    { id: 'demo-4', title: 'CSS 学习网站：xingyezn 的 web-lab', category: 'resource', due: '', done: false,
      link: 'https://xingyezn.github.io/web-lab/#/lesson/css-01', linkText: '练习 CSS' }
  ];

  var state = {
    items: load(),
    filter: 'all'
  };

  var $form = document.getElementById('todo-form');
  var $input = document.getElementById('todo-input');
  var $due = document.getElementById('todo-due');
  var $category = document.getElementById('todo-category');
  var $list = document.getElementById('todo-list');
  var $empty = document.getElementById('todo-empty');
  var $stats = document.getElementById('todo-stats');
  var $filters = document.querySelectorAll('.filter');

  /* ---------------- 数据 ---------------- */

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return SEED.slice();
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : SEED.slice();
    } catch (err) {
      console.warn('读取本地数据失败，使用示例数据。', err);
      return SEED.slice();
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch (err) {
      console.warn('保存失败（可能是隐私模式）。', err);
    }
  }

  function uid() {
    return 't-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  /* ---------------- 渲染 ---------------- */

  function visibleItems() {
    var items = state.items.slice();

    if (state.filter !== 'all') {
      items = items.filter(function (item) {
        return item.category === state.filter;
      });
    }

    // 未完成的排在前面；同组内按截止日期升序，没有日期的排在后面
    return items.sort(function (a, b) {
      if (a.done !== b.done) return a.done ? 1 : -1;
      if (a.due && b.due) return a.due < b.due ? -1 : 1;
      if (a.due) return -1;
      if (b.due) return 1;
      return 0;
    });
  }

  function formatDue(due) {
    if (!due) return '';
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var target = new Date(due + 'T00:00:00');
    var days = Math.round((target - today) / 86400000);

    if (days < 0) return '已逾期 ' + Math.abs(days) + ' 天';
    if (days === 0) return '今天截止';
    if (days === 1) return '明天截止';
    if (days <= 3) return days + ' 天后截止';
    return due.replace(/-/g, '/') + ' 截止';
  }

  function dueClass(due, done) {
    if (!due || done) return '';
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var days = Math.round((new Date(due + 'T00:00:00') - today) / 86400000);
    if (days < 0) return ' is-overdue';
    if (days <= 3) return ' is-soon';
    return '';
  }

  function render() {
    var items = visibleItems();
    $list.textContent = '';

    items.forEach(function (item) {
      var li = document.createElement('li');
      li.className = 'todo__item' + (item.done ? ' is-done' : '');
      li.dataset.id = item.id;

      // 完成按钮
      var toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'todo__toggle';
      toggle.setAttribute('aria-pressed', String(item.done));
      toggle.setAttribute('aria-label', item.done ? '标记为未完成' : '标记为已完成');
      toggle.dataset.action = 'toggle';

      // 正文
      var body = document.createElement('div');
      body.className = 'todo__body';

      var title = document.createElement('p');
      title.className = 'todo__title';
      title.textContent = item.title;
      body.appendChild(title);

      var meta = document.createElement('p');
      meta.className = 'todo__meta';

      var badge = document.createElement('span');
      badge.className = 'badge badge--' + item.category;
      badge.textContent = CATEGORY_LABEL[item.category] || '其他';
      meta.appendChild(badge);

      if (item.due) {
        var dueTag = document.createElement('span');
        dueTag.className = 'todo__due' + dueClass(item.due, item.done);
        dueTag.textContent = formatDue(item.due);
        meta.appendChild(dueTag);
      }

      if (item.link) {
        var link = document.createElement('a');
        link.href = item.link;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = item.linkText || '打开链接';
        meta.appendChild(link);
      }

      body.appendChild(meta);

      // 删除按钮
      var remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'todo__remove';
      remove.textContent = '删除';
      remove.dataset.action = 'remove';
      remove.setAttribute('aria-label', '删除任务：' + item.title);

      li.appendChild(toggle);
      li.appendChild(body);
      li.appendChild(remove);
      $list.appendChild(li);
    });

    $empty.hidden = items.length > 0;
    $stats.textContent = '共 ' + state.items.length + ' 项，待完成 ' +
      state.items.filter(function (i) { return !i.done; }).length + ' 项';
  }

  /* ---------------- 交互 ---------------- */

  $form.addEventListener('submit', function (event) {
    event.preventDefault();
    var title = $input.value.trim();
    if (!title) return;

    state.items.push({
      id: uid(),
      title: title,
      category: $category.value,
      due: $due.value || '',
      done: false
    });

    save();
    render();
    $form.reset();
    $category.value = 'normal';
    $input.focus();
  });

  $list.addEventListener('click', function (event) {
    var button = event.target.closest('button[data-action]');
    if (!button) return;

    var li = button.closest('.todo__item');
    var id = li && li.dataset.id;
    if (!id) return;

    if (button.dataset.action === 'toggle') {
      state.items.forEach(function (item) {
        if (item.id === id) item.done = !item.done;
      });
    } else if (button.dataset.action === 'remove') {
      state.items = state.items.filter(function (item) {
        return item.id !== id;
      });
    }

    save();
    render();
  });

  $filters.forEach(function (button) {
    button.addEventListener('click', function () {
      state.filter = button.dataset.filter;
      $filters.forEach(function (other) {
        other.classList.toggle('is-active', other === button);
      });
      render();
    });
  });

  render();
})();
