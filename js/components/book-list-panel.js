// 2. 书本/文档列表面板组件（支持搜索）
class BookListPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._searchMode = false;
  }

  set data(value) {
    this._data = value;
    this.render();
  }

  get data() {
    return this._data;
  }

  set searchResults(value) {
    this._searchResults = value;
    this._searchMode = value !== null;
    this.render();
  }

  highlight(text, keyword) {
    if (!keyword) return text;
    try {
      const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')})`, 'gi');
      return text.replace(regex, '<mark class="search-hit">$1</mark>');
    } catch {
      return text;
    }
  }

  resolveIconName(icon, fallback = 'lucide:book-open') {
    if (icon && typeof icon === 'string' && icon.includes(':')) return icon;
    return fallback;
  }

  renderIcon(icon, fallback) {
    const name = this.resolveIconName(icon, fallback);
    return `<span class="iconify" data-icon="${name}" data-width="16"></span>`;
  }

  scanIcons() {
    if (window.Iconify && typeof window.Iconify.scan === 'function') {
      window.Iconify.scan(this.shadowRoot);
    }
  }

  render() {
    if (!this._data) return;

    const activeWs = this._data.workspaces.find(w => w.id === this._data.active.workspaceId);

    // 搜索结果模式
    if (this._searchMode && this._searchResults) {
      const resultsHTML = this._searchResults.length === 0
        ? `<div class="empty-state">未找到 "${this._data.active.search || ''}"</div>`
        : this._searchResults.map(r => `
            <div class="list-item search-item" data-book-id="${r.bookId}" data-doc-id="${r.id}">
              <div style="flex: 1;">
                <div class="title" style="font-weight: 600;">${this.highlight(r.title, this._data.active.search)}</div>
                <div class="excerpt">${this.highlight(r.excerpt, this._data.active.search)}</div>
                <div class="meta">
                  <span class="book-name">${r.bookTitle}</span>
                  ${r.tags.map(t => `<span class="tag">${t}</span>`).join('')}
                </div>
               
              </div>
            </div>
          `).join('');

      this.shadowRoot.innerHTML = `
        <style>
          :host { display: block; height: 100%; }
          .section-header { padding: 16px; border-bottom: 1px solid var(--border, #E5E7EB); background: var(--bg, #FFFFFF); display: flex; justify-content: space-between; align-items: center; }
          .section-title { font-size: 12px; font-weight: 600; color: var(--text-muted, #6B7280); }
          .btn { padding: 4px 10px; font-size: 11px; border: 1px solid var(--border, #E5E7EB); border-radius: 3px; background: var(--bg, #FFFFFF); color: var(--text, #111827); cursor: pointer; }
          .btn:hover { background: var(--bg-contrast, #F9FAFB); }
          .scroll-area { overflow-y: auto; flex: 1; }
          .search-results { padding: 12px; }
          .list-item { padding: 12px 14px; margin: 4px 0; border-radius: 4px; cursor: pointer; border: 1px solid var(--border, #E5E7EB); background: var(--bg, #FFFFFF); }
          .list-item:hover { background: var(--bg-contrast, #F9FAFB); }
          .title { font-size: 14px; margin-bottom: 4px; color: var(--text, #111827); }
          .excerpt { font-size: 12px; color: var(--text-muted, #6B7280); margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .meta { font-size: 11px; color: var(--text-muted, #6B7280); display: flex; gap: 8px; align-items: center; }
          .book-name { font-weight: 600; }
          .tag { background: var(--bg-contrast, #F9FAFB); padding: 2px 6px; border-radius: 999px; border: 1px solid var(--border, #E5E7EB); }
          .empty-state { display: flex; align-items: center; justify-content: center; height: 200px; color: var(--text-muted, #6B7280); font-size: 13px; }
          mark.search-hit { background: var(--primary, #10B981); color: white; padding: 1px 2px; border-radius: 2px; font-weight: 600; }
        </style>

        <div class="section-header">
          <span class="section-title">搜索结果 (${this._searchResults.length})</span>
          <button class="btn" data-action="clear">清除</button>
        </div>
        <div class="scroll-area">
          <div class="search-results">${resultsHTML}</div>
        </div>
      `;
      this.scanIcons();

      this.shadowRoot.querySelector('[data-action="clear"]').addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('clear-search'));
      });

      this.shadowRoot.querySelectorAll('.search-item').forEach(item => {
        item.addEventListener('click', () => {
          this.dispatchEvent(new CustomEvent('switch-doc', {
            detail: { bookId: item.dataset.bookId, docId: item.dataset.docId }
          }));
        });
      });

      return;
    }

    // 常规模式
    if (!activeWs) {
      this.shadowRoot.innerHTML = `
        <style>
          :host { display: block; height: 100%; }
          .empty-state { display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-muted, #6B7280); }
        </style>
        <div class="empty-state">请选择工作区</div>
      `;
      return;
    }

    const bookHTML = activeWs.books.map(book => {
      const isExpanded = this._data.active.bookId === book.id;
      const docHTML = isExpanded ? book.docs.map(doc => `
        <div class="doc-item ${this._data.active.docId === doc.id ? 'active' : ''}"
             data-book-id="${book.id}" data-doc-id="${doc.id}">
          <span class="status-dot ${doc.status}"></span>
          <span class="doc-title">${doc.title}</span>
          ${doc.tags.length ? `<span class="tag">${doc.tags[0]}</span>` : ''}
        </div>
      `).join('') : '';

      return `
        <div class="book-section ${isExpanded ? 'expanded' : ''}" data-book-id="${book.id}">
          <div class="book-header">
            <span class="book-icon">${this.renderIcon(book.icon)}</span>
            <div class="book-title">${book.title}</div>
            <span class="book-count">${book.docs.length}</span>
          </div>
          ${isExpanded ? `
            <div class="doc-list">${docHTML}</div>
            <div class="add-doc-btn" data-book-id="${book.id}">+ 新建文档</div>
          ` : ''}
        </div>
      `;
    }).join('');

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; height: 100%; }
        .section-header { padding: 16px; border-bottom: 1px solid var(--border, #E5E7EB); background: var(--bg, #FFFFFF); display: flex; justify-content: space-between; align-items: center; }
        .section-title { font-size: 12px; font-weight: 600; color: var(--text-muted, #6B7280); text-transform: uppercase; }
        .btn-icon { width: 32px; height: 32px; border: 1px solid var(--border, #E5E7EB); border-radius: 4px; background: var(--bg-contrast, #F9FAFB); cursor: pointer; }
        .btn-icon:hover { border-color: var(--border-hover, #D1D5DB); }
        .search-box { padding: 16px; background: var(--bg-contrast, #F9FAFB); border-bottom: 1px solid var(--border, #E5E7EB); }
        .search-input { width: 100%; padding: 8px 10px; border: 1px solid var(--border, #E5E7EB); border-radius: 4px; font-size: 14px; background: var(--bg, #FFFFFF); color: var(--text, #111827); }
        .search-input:focus { border-color: var(--primary, #10B981); outline: none; }
        .scroll-area { overflow-y: auto; flex: 1; }
        .book-section { margin: 8px 0; }
        .book-header { padding: 12px; border: 1px solid var(--border, #E5E7EB); border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 8px; background: var(--bg, #FFFFFF); }
        .book-header:hover { border-color: var(--border-hover, #D1D5DB); background: var(--bg-contrast, #F9FAFB); }
        .book-icon { display: inline-flex; align-items: center; }
        .book-title { flex: 1; font-weight: 600; color: var(--text, #111827); }
        .book-count { font-size: 11px; color: var(--text-muted, #6B7280); background: var(--bg-contrast, #F9FAFB); padding: 2px 6px; border-radius: 999px; }
        .doc-list { background: var(--bg-contrast, #F9FAFB); padding: 6px; margin: 6px 8px 0 8px; border-left: 1px solid var(--border, #E5E7EB); border-radius: 4px; }
        .doc-item { padding: 8px 10px; margin: 2px 0; border-radius: 3px; font-size: 13px; display: flex; align-items: center; gap: 8px; }
        .doc-item:hover { background: var(--bg, #FFFFFF); }
        .doc-item.active { background: var(--bg, #FFFFFF); font-weight: 600; }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--border-hover, #D1D5DB); }
        .status-dot.published { background: var(--primary, #10B981); }
        .doc-title { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .tag { background: var(--bg, #FFFFFF); padding: 2px 6px; border-radius: 999px; font-size: 10px; border: 1px solid var(--border, #E5E7EB); }
        .add-doc-btn { margin: 8px; padding: 10px; border: 1px dashed var(--border, #E5E7EB); border-radius: 4px; text-align: center; cursor: pointer; font-size: 13px; color: var(--text-muted, #6B7280); }
        .add-doc-btn:hover { border-color: var(--primary, #10B981); color: var(--primary, #10B981); background: var(--bg-contrast, #F9FAFB); }
      </style>

      <div class="section-header">
        <span class="section-title">${activeWs.name}</span>
        <button class="btn-icon" title="新建书本">+</button>
      </div>
      <div class="search-box">
        <input type="text" class="search-input" placeholder="搜索文档 (Ctrl+K)" value="${this._data.active.search || ''}">
      </div>
      <div class="scroll-area">${bookHTML}</div>
    `;
    this.scanIcons();

    // 事件绑定
    this.shadowRoot.querySelector('.btn-icon').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('create-book'));
    });

    const searchInput = this.shadowRoot.querySelector('.search-input');
    searchInput.addEventListener('input', (e) => {
      this.dispatchEvent(new CustomEvent('search', { detail: { keyword: e.target.value }}));
    });

    this.shadowRoot.querySelectorAll('.book-header').forEach(header => {
      header.addEventListener('click', () => {
        const bookId = header.parentElement.dataset.bookId;
        this.dispatchEvent(new CustomEvent('toggle-book', { detail: { id: bookId }}));
      });
    });

    this.shadowRoot.querySelectorAll('.doc-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        this.dispatchEvent(new CustomEvent('switch-doc', {
          detail: { bookId: item.dataset.bookId, docId: item.dataset.docId }
        }));
      });
    });

    this.shadowRoot.querySelectorAll('.add-doc-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.dispatchEvent(new CustomEvent('create-doc', {
          detail: { bookId: btn.dataset.bookId }
        }));
      });
    });
  }
}

customElements.define('book-list-panel', BookListPanel);
