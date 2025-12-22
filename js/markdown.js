// Markdown解析器

const buildImageCard = (url, altText = '', width = '') => {
  const style = width ? `style="width: ${width}${isNaN(width) ? '' : 'px'}; max-width: 100%;"` : '';
  const caption = altText ? `<div class="image-caption">${altText}</div>` : '';
  return `<div class="media-container image-card">
    <div class="image-wrapper">
      <img src="${url}" alt="${altText}" ${style} loading="lazy">
    </div>
    ${caption}
  </div>`;
};

const buildAudioCard = (url) => {
  return `<div class="media-container audio-container"><audio src="${url}" controls></audio></div>`;
};

const buildBilibiliEmbed = (bvid) => {
  return `<div class="media-container video-container">
    <iframe src="//player.bilibili.com/player.html?isOutside=true&bvid=${bvid}&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
  </div>`;
};

const normalizeBvid = (raw) => {
  if (!raw) return null;
  const match = raw.match(/BV[a-zA-Z0-9]{10}/i);
  if (!match) return null;
  return `BV${match[0].slice(2)}`;
};

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

    // 图片 (支持 ![alt|width](url) 语法)
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, altText, url) => {
      let width = '';
      let alt = altText;

      // 解析 ![描述|300] 这种宽度语法
      if (altText.includes('|')) {
        const parts = altText.split('|');
        alt = parts[0];
        width = parts[1];
      }

      return buildImageCard(url, alt, width);
    });

    // 音频
    html = html.replace(/@\[(audio|mp3)\]\(([^)]+)\)/g, (match, type, url) => {
      return buildAudioCard(url);
    });

    // B站视频 (语法: @[bilibili](BV号))
    html = html.replace(/@\[bilibili\]\(([^)]+)\)/g, (match, raw) => {
      const bvid = normalizeBvid(raw);
      if (!bvid) return match;
      return buildBilibiliEmbed(bvid);
    });

    // B站视频 (直接输入 BV号，如果该行只有 BV号)
    html = html.replace(/^\s*(BV[a-zA-Z0-9]{10})\s*$/gim, (match, bvid) => {
      const normalized = normalizeBvid(bvid);
      if (!normalized) return match;
      return buildBilibiliEmbed(normalized);
    });

    // B站视频 (直接粘贴链接)
    html = html.replace(/^\s*(https?:\/\/[^\s]*bilibili\.com\/video\/[^\s]+)\s*$/gim, (match) => {
      const bvid = normalizeBvid(match);
      if (!bvid) return match;
      return buildBilibiliEmbed(bvid);
    });

    // 通用视频 (语法: @[video](URL))
    html = html.replace(/@\[video\]\(([^)]+)\)/g, '<div class="media-container video-container"><video src="$1" controls></video></div>');

    // MP3 直链 (独立一行)
    html = html.replace(/^\s*(https?:\/\/[^\s]+\.mp3(?:\?[^\s]+)?)\s*$/gim, (match, url) => {
      return buildAudioCard(url);
    });

    // 纯图片链接 (独立一行)
    html = html.replace(/^\s*(https?:\/\/[^\s]+?\.(?:png|jpe?g|gif|webp|svg)(?:\?[^\s]*)?)\s*$/gim, (match, url) => {
      return buildImageCard(url, '图片');
    });

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

  // 在渲染后强制把链接转换成媒体 DOM
  mountEmbeds(container) {
    if (!container || !container.querySelectorAll) return;
    const links = Array.from(container.querySelectorAll('a[href]'));
    links.forEach(link => {
      if (link.closest('code, pre')) return;
      const href = link.getAttribute('href');
      if (!href) return;

      if (/\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(href)) {
        const alt = link.textContent || '图片';
        link.outerHTML = buildImageCard(href, alt);
        return;
      }

      if (/\.mp3(\?|$)/i.test(href)) {
        link.outerHTML = buildAudioCard(href);
        return;
      }

      if (/bilibili\.com\/video\/|b23\.tv\//i.test(href)) {
        const bvid = normalizeBvid(href);
        if (bvid) link.outerHTML = buildBilibiliEmbed(bvid);
      }
    });
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

globalThis.MarkdownRenderer = MarkdownRenderer;
