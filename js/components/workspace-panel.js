// 1. 左侧工作区面板组件
class WorkspacePanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  set data(value) {
    this._data = value;
    this.render();
  }

  get data() {
    return this._data;
  }

  scanIcons() {
    if (window.Iconify && typeof window.Iconify.scan === 'function') {
      window.Iconify.scan(this.shadowRoot);
    }
  }

  render() {
    if (!this._data) return;

    const activeWsId = this._data.active.workspaceId;
    const wsList = this._data.workspaces.map(ws => `
      <div class="list-item workspace-item ${ws.id === activeWsId ? 'active' : ''}"
           data-id="${ws.id}">
        <span class="icon"><span class="iconify" data-icon="lucide:books" data-width="16"></span></span>
        <span class="name">${ws.name}</span>
        <span class="count">${ws.books.length}</span>
        <button class="delete-btn" data-id="${ws.id}" title="删除此工作区">
          <span class="iconify" data-icon="lucide:x" data-width="12"></span>
        </button>
      </div>
    `).join('') || '<div class="empty-state">暂无工作区</div>';

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; height: 100%; }
        .section-header {
          padding: 16px;
          border-bottom: 1px solid var(--border, #E5E7EB);
          background: var(--bg, #FFFFFF);
        }
        .section-title {
          font-size: 12px; font-weight: 600;
          color: var(--text-muted, #6B7280);
          text-transform: uppercase; letter-spacing: 0.5px;
        }
        .btn-icon {
          width: 32px; height: 32px;
          background: var(--bg-contrast, #F9FAFB);
          border: 1px solid var(--border, #E5E7EB);
          border-radius: 4px;
          cursor: pointer; margin-top: 8px;
        }
        .btn-icon:hover {
          background: var(--bg-contrast, #F9FAFB);
          border-color: var(--border-hover, #D1D5DB);
        }
        .scroll-area { overflow-y: auto; flex: 1; }

        .list-item {
          padding: 12px 16px; cursor: pointer;
          display: flex; align-items: center; gap: 10px;
          margin: 2px 8px; border-radius: 4px;
          font-size: 14px; color: var(--text, #111827);
          position: relative;
        }
        .list-item:hover {
          background: var(--bg-contrast, #F9FAFB);
        }
        .list-item.active {
          background: var(--bg-contrast, #F9FAFB);
          font-weight: 600;
          border-left: 3px solid var(--primary, #10B981);
        }
        .icon { display: inline-flex; align-items: center; }
        .name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .count {
          background: var(--border, #E5E7EB);
          padding: 2px 6px; border-radius: 999px;
          font-size: 11px; color: var(--text-muted, #6B7280);
        }
        .delete-btn {
          width: 18px; height: 18px;
          background: transparent; border: none;
          color: var(--text-muted, #6B7280);
          cursor: pointer; border-radius: 3px;
          display: none;
          font-size: 12px; line-height: 18px;
          padding: 0; margin-left: 4px;
        }
        .list-item:hover .delete-btn {
          display: block;
        }
        .delete-btn:hover {
          background: var(--border-hover, #D1D5DB);
          color: var(--text, #111827);
        }
        .empty-state {
          display: flex; align-items: center; justify-content: center;
          height: 200px; color: var(--text-muted, #6B7280);
          font-size: 13px;
        }
      </style>

      <div class="section-header">
        <span class="section-title">知识空间</span>
      </div>
      <button class="btn-icon" title="新建工作区">+</button>
      <div class="scroll-area">${wsList}</div>
    `;
    this.scanIcons();

    // 绑定新建按钮事件
    this.shadowRoot.querySelector('.btn-icon').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('create-workspace'));
    });

    // 绑定工作区点击（切换）
    this.shadowRoot.querySelectorAll('.workspace-item').forEach(item => {
      item.addEventListener('click', (e) => {
        // 防止点击删除按钮时触发切换
        if (e.target.classList.contains('delete-btn')) return;

        this.dispatchEvent(new CustomEvent('switch-workspace', {
          detail: { id: item.dataset.id }
        }));
      });

      // 绑定删除按钮
      const deleteBtn = item.querySelector('.delete-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.dispatchEvent(new CustomEvent('delete-workspace', {
            detail: { id: deleteBtn.dataset.id }
          }));
        });
      }
    });
  }
}

customElements.define('workspace-panel', WorkspacePanel);
