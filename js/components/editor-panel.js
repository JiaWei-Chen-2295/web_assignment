// 3. 编辑器面板组件（含预览）
class EditorPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._isPreview = false;
  }

  set data(value) {
    this._data = value;
    this._doc = this.getCurrentDoc();
    this.render();
  }

  get data() {
    return this._data;
  }

  setMarkdownRenderer(renderer) {
    this._markdownRenderer = renderer;
  }

  getCurrentDoc() {
    if (!this._data) return null;
    const ws = this._data.workspaces.find(w => w.id === this._data.active.workspaceId);
    if (!ws) return null;
    for (let book of ws.books) {
      const doc = book.docs.find(d => d.id === this._data.active.docId);
      if (doc) return doc;
    }
    return null;
  }

  togglePreview() {
    this._isPreview = !this._isPreview;
    this.render();
    this.dispatchEvent(new CustomEvent('preview-toggled', { detail: { isPreview: this._isPreview } }));
  }

  insertText(content) {
    const editor = this.shadowRoot.querySelector('.editor-area');
    if (!editor) return;
    const value = editor.value || '';
    const start = editor.selectionStart ?? value.length;
    const end = editor.selectionEnd ?? value.length;
    const nextValue = value.slice(0, start) + content + value.slice(end);
    const cursor = start + content.length;
    editor.value = nextValue;
    editor.setSelectionRange(cursor, cursor);
    editor.focus();
    this.dispatchEvent(new CustomEvent('editor-input', { detail: { content: nextValue } }));

    if (this._markdownRenderer && !this._isPreview) {
      const preview = this.shadowRoot.querySelector('#preview-area');
      if (preview) {
        preview.innerHTML = this._markdownRenderer.render(nextValue);
        if (this._markdownRenderer.mountEmbeds) {
          this._markdownRenderer.mountEmbeds(preview);
        }
      }
    }
    this.updateFooterStats(nextValue);
  }

  updateStats(words, time, status, tags, updated) {
    const footer = this.shadowRoot.querySelector('.editor-footer');
    if (footer) {
      footer.innerHTML = `
        <span>字数: ${words}</span>
        <span>阅读: ${time}分钟</span>
        <span>更新: ${updated}</span>
        <span>状态: ${status === 'published' ? '已发布' : '草稿'}</span>
        ${tags && tags.length ? `<span>标签: ${tags.join(', ')}</span>` : ''}
      `;
    }
  }

  _formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString();
  }

  render() {
    if (!this._doc) {
      this.shadowRoot.innerHTML = `
        <style>
          :host { display: block; height: 100%; }
          .empty-state { display: flex; align-items: center; justify-content: center; height: 100%; padding: 40px; text-align: center; color: var(--text-muted, #6B7280); }
          .welcome h2 { font-size: 20px; font-weight: 700; color: var(--text, #111827); margin-bottom: 8px; }
          .welcome p { color: var(--text-muted, #6B7280); margin-bottom: 16px; line-height: 1.6; }
          .btn-primary { background: var(--primary, #10B981); color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 600; }
          .btn-primary:hover { background: var(--primary-hover, #059669); }
        </style>
        <div class="empty-state">
          <div class="welcome">
            <h2>语雀 Lite</h2>
            <p>极简知识管理工具<br>支持 Markdown、搜索、备份</p>
            <button class="btn-primary" data-action="create">开始写作</button>
          </div>
        </div>
      `;
      this.shadowRoot.querySelector('[data-action="create"]').addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('create-doc'));
      });
      return;
    }

    const content = this._doc.content || '';
    const previewHTML = this._markdownRenderer ? this._markdownRenderer.render(content) : '';
    const viewStyle = this._isPreview ? 'grid-template-columns: 0 1fr;' : 'grid-template-columns: 1fr 1fr;';

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; height: 100%; }
        .editor-header { padding: 12px 16px; border-bottom: 1px solid var(--border, #E5E7EB); display: flex; align-items: center; gap: 8px; background: var(--bg, #FFFFFF); }
        .title-input { flex: 1; padding: 8px 10px; border: 1px solid var(--border, #E5E7EB); border-radius: 4px; font-size: 16px; font-weight: 600; background: var(--bg, #FFFFFF); color: var(--text, #111827); }
        .title-input:focus { border-color: var(--primary, #10B981); outline: none; }
        .editor-actions { display: flex; gap: 6px; flex-wrap: wrap; }
        .btn { padding: 6px 10px; border: 1px solid var(--border, #E5E7EB); border-radius: 4px; background: var(--bg, #FFFFFF); color: var(--text, #111827); font-size: 12px; cursor: pointer; }
        .btn:hover { background: var(--bg-contrast, #F9FAFB); }
        .btn-primary { background: var(--primary, #10B981); color: white; border-color: var(--primary, #10B981); }
        .btn-primary:hover { background: var(--primary-hover, #059669); border-color: var(--primary-hover, #059669); }
        .btn-danger { color: var(--text-muted, #6B7280); border-color: var(--border-hover, #D1D5DB); }
        .btn-danger:hover { background: var(--bg-contrast, #F9FAFB); border-color: var(--text-muted, #6B7280); }
        .split-view { display: grid; ${viewStyle} height: calc(100% - 80px); border-bottom: 1px solid var(--border, #E5E7EB); }
        .editor-area { height: 100%; overflow-y: auto; padding: 16px; border: none; resize: none; background: var(--bg, #FFFFFF); color: var(--text, #111827); font-family: 'Consolas', monospace; font-size: 14px; line-height: 1.6; border-right: 1px solid var(--border, #E5E7EB); }
        .editor-area:focus { background: var(--bg-contrast, #F9FAFB); outline: none; }
        .preview-area { height: 100%; overflow-y: auto; padding: 16px; background: var(--bg, #FFFFFF); color: var(--text, #111827); }
        .preview-area h1 { font-size: 20px; font-weight: 700; margin: 12px 0; padding-bottom: 6px; border-bottom: 1px solid var(--border, #E5E7EB); }
        .preview-area h2 { font-size: 16px; font-weight: 600; margin: 10px 0; }
        .preview-area h3 { font-size: 14px; font-weight: 600; margin: 8px 0; color: var(--text-muted, #6B7280); }
        .preview-area p { line-height: 1.7; margin-bottom: 8px; }
        .preview-area ul, .preview-area ol { padding-left: 18px; margin: 6px 0 8px 0; line-height: 1.7; }
        .preview-area strong { font-weight: 700; }
        .preview-area code { background: var(--bg-contrast, #F9FAFB); padding: 2px 6px; border-radius: 3px; font-size: 13px; font-family: monospace; }
        .preview-area pre { background: var(--bg-contrast, #F9FAFB); padding: 10px; overflow-x: auto; margin: 8px 0; border-radius: 4px; }
        .preview-area blockquote { border-left: 2px solid var(--primary, #10B981); padding-left: 10px; color: var(--text-muted, #6B7280); margin: 8px 0; }
        .preview-area a { color: var(--primary, #10B981); text-decoration: none; border-bottom: 1px solid var(--border, #E5E7EB); }
        .editor-footer { padding: 8px 16px; background: var(--bg-contrast, #F9FAFB); font-size: 12px; color: var(--text-muted, #6B7280); border-top: 1px solid var(--border, #E5E7EB); display: flex; gap: 16px; height: 36px; align-items: center; flex-wrap: nowrap; overflow-x: auto; overflow-y: hidden; }
        .editor-footer::-webkit-scrollbar { height: 6px; }
        .editor-footer::-webkit-scrollbar-thumb { background: var(--border, #E5E7EB); border-radius: 999px; }
        .editor-footer::-webkit-scrollbar-track { background: transparent; }
        .media-container { margin: 16px 0; border-radius: 8px; overflow: hidden; background: var(--bg-contrast, #F9FAFB); border: 1px solid var(--border, #E5E7EB); }
        .image-card { background: var(--bg, #FFFFFF); }
        .image-wrapper { display: flex; justify-content: center; background: var(--bg, #FFFFFF); }
        .image-wrapper img { display: block; max-width: 100%; height: auto; }
        .image-caption { padding: 6px 10px; font-size: 12px; color: var(--text-muted, #6B7280); border-top: 1px solid var(--border, #E5E7EB); }
        .audio-container { padding: 12px; display: flex; justify-content: center; }
        .audio-container audio { width: 100%; max-width: 500px; }
        .video-container { position: relative; width: 100%; aspect-ratio: 16/9; background: #000; }
        .video-container iframe, .video-container video { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; }
      </style>

      <div class="editor-header">
        <input type="text" class="title-input" value="${this._doc.title}" placeholder="文档标题...">
        <div class="editor-actions">
          <button class="btn" data-action="insert-image" title="插入图片">图片</button>
          <button class="btn" data-action="insert-audio" title="插入音频/MP3">音频/MP3</button>
          <button class="btn" data-action="insert-video" title="插入本地/通用视频">视频文件</button>
          <button class="btn" data-action="insert-bilibili" title="插入B站视频">B站视频</button>
          <span style="border-right: 1px solid var(--border, #E5E7EB); margin: 0 4px;"></span>
          <button class="btn" data-action="toggle-status">${this._doc.status === 'published' ? '草稿' : '发布'}</button>
          <button class="btn" data-action="toggle-preview">${this._isPreview ? '编辑' : '预览'}</button>
          <button class="btn btn-primary" data-action="save">保存</button>
          <button class="btn" data-action="add-tag">标签</button>
          <button class="btn" data-action="export">导出</button>
          <button class="btn btn-danger" data-action="delete">删除</button>
        </div>
      </div>
      <div class="split-view">
        <textarea class="editor-area" id="editor-textarea" placeholder="# 支持基础 Markdown
## 二级标题
**粗体** *斜体*
\`代码\`
- 列表项
> 引用
[链接](url)">${content}</textarea>
        <div class="preview-area" id="preview-area">${previewHTML}</div>
      </div>
      <div class="editor-footer stats-scroll" data-wheel-scroll="x">
        <span>字数: ${this._doc.stats.words || 0}</span>
        <span>阅读: ${this._doc.stats.estimatedTime || 0}分钟</span>
        <span>更新: ${this._formatDate(this._doc.updated)}</span>
        <span>状态: ${this._doc.status === 'published' ? '已发布' : '草稿'}</span>
        ${this._doc.tags && this._doc.tags.length ? `<span>标签: ${this._doc.tags.join(', ')}</span>` : ''}
      </div>
    `;

    // 事件绑定
    const titleInput = this.shadowRoot.querySelector('.title-input');
    titleInput.addEventListener('input', (e) => {
      this.dispatchEvent(new CustomEvent('update-title', { detail: { title: e.target.value } }));
    });

    const editor = this.shadowRoot.querySelector('.editor-area');
    editor.addEventListener('input', (e) => {
      this.dispatchEvent(new CustomEvent('editor-input', { detail: { content: e.target.value } }));

      // 实时更新预览
      if (this._markdownRenderer && !this._isPreview) {
        const preview = this.shadowRoot.querySelector('#preview-area');
        if (preview) {
          preview.innerHTML = this._markdownRenderer.render(e.target.value);
          if (this._markdownRenderer.mountEmbeds) {
            this._markdownRenderer.mountEmbeds(preview);
          }
        }
      }

      // 更新计数器
      this.updateFooterStats(e.target.value);
    });

    // 按钮事件
    this.shadowRoot.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'toggle-preview') {
          this.togglePreview();
        } else if (action === 'insert-image') {
          const url = prompt('请输入图片 URL：');
          if (url) this.insertText(`\n![图片](${url})\n`);
        } else if (action === 'insert-audio') {
          const url = prompt('请输入 MP3 音频 URL：');
          if (url) this.insertText(`\n@[audio](${url})\n`);
        } else if (action === 'insert-video') {
          const url = prompt('请输入视频文件 URL (如 .mp4)：');
          if (url) this.insertText(`\n@[video](${url})\n`);
        } else if (action === 'insert-bilibili') {
          const input = prompt('请输入 B 站视频 BV 号或链接：');
          if (input) {
            const match = input.match(/BV[a-zA-Z0-9]{10}/i);
            if (match) {
              const cleanBvid = `BV${match[0].slice(2)}`;
              this.insertText(`\n@[bilibili](${cleanBvid})\n`);
            }
          }
        } else {
          this.dispatchEvent(new CustomEvent(action.replace(/-([a-z])/g, (g) => g[1].toUpperCase())));
        }
      });
    });

    // 预览模式同步
    if (this._isPreview && this._markdownRenderer) {
      const textarea = this.shadowRoot.querySelector('.editor-area');
      const preview = this.shadowRoot.querySelector('#preview-area');
      if (textarea && preview) {
        preview.innerHTML = this._markdownRenderer.render(textarea.value);
        if (this._markdownRenderer.mountEmbeds) {
          this._markdownRenderer.mountEmbeds(preview);
        }
      }
    }

    const preview = this.shadowRoot.querySelector('#preview-area');
    if (preview && this._markdownRenderer && this._markdownRenderer.mountEmbeds) {
      this._markdownRenderer.mountEmbeds(preview);
    }
    if (window.enableHorizontalWheelScroll) {
      window.enableHorizontalWheelScroll(this.shadowRoot);
    }
  }

  updateFooterStats(content) {
    const words = content.trim().split(/\s+/).filter(w => w).length;
    const time = Math.ceil(words / 300);
    const footer = this.shadowRoot.querySelector('.editor-footer');
    if (footer && footer.children.length >= 2) {
      footer.children[0].textContent = `字数: ${words}`;
      footer.children[1].textContent = `阅读: ${time}分钟`;
    }
  }
}

customElements.define('editor-panel', EditorPanel);
