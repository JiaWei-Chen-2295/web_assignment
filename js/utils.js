// 工具函数库

// 防抖
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// 生成UUID
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// 格式化日期
function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString();
}

function formatWordCount(count) {
  const total = Number(count) || 0;
  if (total < 1000) return String(total);
  return `${Math.round(total / 100) / 10}k`;
}

function animateCount(el, target, options = {}) {
  if (!el || !Number.isFinite(target)) return;
  const duration = options.duration ?? 600;
  const formatter = options.formatter ?? ((value) => String(value));
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || duration <= 0) {
    el.textContent = formatter(target);
    return;
  }

  const start = performance.now();
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  const tick = (now) => {
    const progress = Math.min(1, (now - start) / duration);
    const value = Math.round(target * easeOut(progress));
    el.textContent = formatter(value);
    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

function animateCounts(root = document) {
  if (!root || !root.querySelectorAll) return;
  const elements = root.querySelectorAll('.stat-value[data-count], .global-stat-value[data-count]');
  elements.forEach((el) => {
    const target = Number(el.dataset.count);
    if (!Number.isFinite(target)) return;
    const format = el.dataset.format;
    const formatter = format === 'word' ? formatWordCount : null;
    el.textContent = '0';
    animateCount(el, target, { formatter: formatter || undefined });
  });
}

function escapeHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

globalThis.escapeHTML = escapeHTML;
globalThis.formatDate = formatDate;
globalThis.animateCounts = animateCounts;

// 下载文件
function downloadFile(content, filename, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// 读取文件
function readFile(file, callback) {
  const reader = new FileReader();
  reader.onload = e => callback(e.target.result);
  reader.readAsText(file);
}

function enableHorizontalWheelScroll(root = document) {
  if (!root) return;
  const targets = [];
  if (root.matches && root.matches('[data-wheel-scroll="x"]')) {
    targets.push(root);
  }
  if (root.querySelectorAll) {
    targets.push(...root.querySelectorAll('[data-wheel-scroll="x"]'));
  }

  targets.forEach(target => {
    if (target.dataset.wheelBound === 'true') return;
    target.dataset.wheelBound = 'true';
    target.addEventListener('wheel', (event) => {
      const maxScroll = target.scrollWidth - target.clientWidth;
      if (maxScroll <= 0) return;

      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (!delta) return;

      const next = Math.min(maxScroll, Math.max(0, target.scrollLeft + delta));
      if (next === target.scrollLeft) return;
      event.preventDefault();
      target.scrollLeft = next;
    }, { passive: false });
  });
}

globalThis.enableHorizontalWheelScroll = enableHorizontalWheelScroll;
