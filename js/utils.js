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
  return new Date(dateStr).toLocaleString();
}

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

// 防止事件冒泡
function preventDefault(e) {
  e && e.preventDefault();
}

// 读取文件
function readFile(file, callback) {
  const reader = new FileReader();
  reader.onload = e => callback(e.target.result);
  reader.readAsText(file);
}

// 简单弹窗
function simpleAlert(msg) {
  alert(msg);
}