// Markdown解析器

const MarkdownRenderer = {
  // 基础解析
  render(text) {
    if (!text) return '<div class="empty-doc">开始写作...</div>';

    let html = text;

    // 标题
    html = html.replace(/^### (.*)$/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*)$/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*)$/gim, '<h1>$1</h1>');

    // 粗体
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // 代码块
    html = html.replace(/```([^`]+)```/g, (match, code) => {
      return `<pre><code>${code.trim()}</code></pre>`;
    });

    // 行内代码
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');

    // 链接
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

    // 引用
    html = html.replace(/^> (.*)$/gim, '<blockquote>$1</blockquote>');

    // 无序列表
    html = html.replace(/^\* (.*)$/gim, '<li>$1</li>');
    html = html.replace(/^\- (.*)$/gim, '<li>$1</li>');

    // 有序列表
    html = html.replace(/^\d+\. (.*)$/gim, '<li>$1</li>');

    // 包裹列表
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // 列表去重
    html = html.replace(/<\/ul>\s*<ul>/g, '');

    // 段落处理
    const lines = html.split('\n');
    const result = [];
    let inCodeBlock = false;

    lines.forEach(line => {
      if (line.trim().startsWith('<pre>')) {
        result.push(line);
        inCodeBlock = true;
        return;
      }
      if (line.trim().startsWith('</pre>')) {
        inCodeBlock = false;
        return;
      }

      if (inCodeBlock) {
        result.push(line);
      } else if (line.trim().startsWith('<') || line.trim() === '') {
        result.push(line);
      } else if (line.trim().match(/^<h|<ul|<li|<blockquote|<p/)) {
        result.push(line);
      } else {
        result.push(`<p>${line}</p>`);
      }
    });

    return result.join('\n');
  },

  // 搜索高亮
  highlight(text, keyword) {
    if (!keyword) return text;
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.replace(regex, '<mark class="search-hit">$1</mark>');
  },

  // 获取纯文本摘要
  getExcerpt(text, length = 80) {
    if (!text) return '';
    const clean = text.replace(/[#\*\>\`\[\]\(\)]/g, '').replace(/\n/g, ' ');
    return clean.length > length ? clean.slice(0, length) + '...' : clean;
  },

  // 获取纯文本
  getPlainText(text) {
    return text ? text.replace(/[#\*\>\`\[\]\(\)]/g, '').replace(/\n/g, ' ') : '';
  }
};