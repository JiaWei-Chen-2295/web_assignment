// UI Renderer - 轻量渲染器，用于模态框等非组件化部分
// 已迁移到极简风格，仅使用基础灰度+主题色

const UIRenderer = {
  // 渲染统计面板（模态框）
  renderStats(data) {
    const stats = DataAPI.getStats(data);

    const html = `
      <div class="modal" data-modal="stats">
        <div class="modal-content">
          <div class="modal-header">
            <h3>数据统计</h3>
            <button onclick="app.closeModal()">
              <span class="iconify" data-icon="lucide:x" data-width="16"></span>
            </button>
          </div>
          <div class="modal-body">
            <div class="stats-grid stats-scroll" data-wheel-scroll="x">
              <div class="stat-card">
                <div class="stat-value" data-count="${stats.docCount}">${stats.docCount}</div>
                <div class="stat-label">总文档</div>
              </div>
              <div class="stat-card">
                <div class="stat-value" data-count="${stats.wordCount}" data-format="word">${formatWordCount(stats.wordCount)}</div>
                <div class="stat-label">总字数</div>
              </div>
              <div class="stat-card">
                <div class="stat-value" data-count="${stats.bookCount}">${stats.bookCount}</div>
                <div class="stat-label">书本</div>
              </div>
            </div>
            <h4>热门标签</h4>
            <div class="tag-cloud">
              ${Object.entries(stats.tagMap).length ?
                Object.entries(stats.tagMap).map(([tag, count]) => `
                  <span class="tag-item" data-count="${count}" onclick="app.filterByTag('${tag}')">${tag} (${count})</span>
                `).join('') :
                '<span class="text-muted">暂无标签</span>'
              }
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
    if (window.enableHorizontalWheelScroll) {
      const modal = document.querySelector('[data-modal="stats"]');
      window.enableHorizontalWheelScroll(modal);
    }
    if (window.animateCounts) {
      const modal = document.querySelector('[data-modal="stats"]');
      window.animateCounts(modal);
    }
  },

  // 渲染备份管理器
  renderBackupManager() {
    const backupsRaw = localStorage.getItem('yuque-lite-backups');
    const backups = backupsRaw ? JSON.parse(backupsRaw) : [];

    return `
      <div class="modal" data-modal="backup">
        <div class="modal-content">
          <div class="modal-header">
            <h3>备份与恢复</h3>
            <button onclick="app.closeModal()">
              <span class="iconify" data-icon="lucide:x" data-width="16"></span>
            </button>
          </div>
          <div class="modal-body">
            <div class="backup-actions-bar">
              <button class="btn btn-primary" onclick="app.createBackup()">创建新备份</button>
              <label class="btn">
                导入数据
                <input type="file" id="import-file" style="display:none" accept=".json" onchange="app.handleImport(event)">
              </label>
              <button class="btn" onclick="app.exportAllData()">导出完整数据</button>
            </div>
            <div class="backup-list">
              ${backups.length === 0 ? '<div class="empty-state">暂无备份记录</div>' :
                backups.map((b, i) => `
                  <div class="backup-item">
                    <div>
                      <div class="backup-date">${new Date(b.timestamp).toLocaleString()}</div>
                      <span class="backup-type ${b.type}">${b.type}</span>
                    </div>
                    <div class="backup-actions">
                      <button class="btn" onclick="app.restoreBackup(${i})">恢复</button>
                      <button class="btn btn-danger" onclick="app.deleteBackup(${i})">删除</button>
                    </div>
                  </div>
                `).join('')
              }
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // 渲染模板选择
  renderTemplateSelector(templates) {
    return `
      <div class="modal" data-modal="template-select">
        <div class="modal-content">
          <div class="modal-header">
            <h3>选择模板</h3>
            <button onclick="app.closeModal()">
              <span class="iconify" data-icon="lucide:x" data-width="16"></span>
            </button>
          </div>
          <div class="modal-body">
            <div class="template-grid">
              ${templates.map(t => `
                <div class="template-card" onclick="app.showTemplateForm('${t.id}')">
                  <div class="template-icon">${t.icon}</div>
                  <div class="template-name">${t.name}</div>
                  <div class="template-preview">${t.content.slice(0, 50)}...</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // 渲染模板表单
  renderTemplateForm(template) {
    const vars = template.content.match(/\\\{\\\{(\\\w+)\\\}\\\}/g) || [];
    const uniqueVars = [...new Set(vars.map(v => v.slice(2, -2)))];

    if (uniqueVars.length === 0) {
      return `
        <div class="modal" data-modal="template-form">
          <div class="modal-content">
            <div class="modal-header">
              <h3>${template.name}</h3>
              <button onclick="app.closeModal()">
                <span class="iconify" data-icon="lucide:x" data-width="16"></span>
              </button>
            </div>
            <div class="modal-body">
              <p>该模板无需填写信息。</p>
              <button class="btn btn-primary" onclick="app.useTemplate('${template.id}')">创建文档</button>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="modal" data-modal="template-form">
        <div class="modal-content">
          <div class="modal-header">
            <h3>${template.name}</h3>
            <button onclick="app.closeModal()">
              <span class="iconify" data-icon="lucide:x" data-width="16"></span>
            </button>
          </div>
          <div class="modal-body template-form">
            ${uniqueVars.map(v => `
              <div class="form-field">
                <label>${UIRenderer.varLabel(v)}</label>
                <input type="text" id="var-${v}" placeholder="请输入${UIRenderer.varLabel(v)}">
              </div>
            `).join('')}
            <button class="btn btn-primary" onclick="app.useTemplate('${template.id}')">创建文档</button>
          </div>
        </div>
      </div>
    `;
  },

  // 标签映射
  varLabel(key) {
    const labels = {
      'date': '日期',
      'host': '主持人',
      'people': '参会人',
      'name': '姓名',
      'book_name': '书名',
      'author': '作者'
    };
    return labels[key] || key;
  },

  // 渲染回收站
  renderTrash(data) {
    const stats = DataAPI.getTrashStats(data);
    const items = data.trash.items || [];

    // 按删除时间倒序排列
    const sortedItems = [...items].sort((a, b) => 
      new Date(b.deletedAt) - new Date(a.deletedAt)
    );

    return `
      <div class="modal" data-modal="trash">
        <div class="modal-content">
          <div class="modal-header">
            <h3>回收站</h3>
            <button onclick="app.closeModal()">
              <span class="iconify" data-icon="lucide:x" data-width="16"></span>
            </button>
          </div>
          <div class="modal-body">
            <div class="trash-stats stats-scroll" data-wheel-scroll="x" style="display: flex; gap: 12px; margin-bottom: 16px; padding: 12px; background: var(--bg-contrast); border-radius: 4px;">
              <div style="flex: 1; text-align: center;">
                <div class="stat-value" data-count="${stats.total}" style="font-size: 18px;">${stats.total}</div>
                <div style="font-size: 11px; color: var(--text-muted);">总数</div>
              </div>
              <div style="flex: 1; text-align: center;">
                <div class="stat-value" data-count="${stats.docs}" style="font-size: 18px;">${stats.docs}</div>
                <div style="font-size: 11px; color: var(--text-muted);">文档</div>
              </div>
              <div style="flex: 1; text-align: center;">
                <div class="stat-value" data-count="${stats.books}" style="font-size: 18px;">${stats.books}</div>
                <div style="font-size: 11px; color: var(--text-muted);">书本</div>
              </div>
              <div style="flex: 1; text-align: center;">
                <div class="stat-value" data-count="${stats.workspaces}" style="font-size: 18px;">${stats.workspaces}</div>
                <div style="font-size: 11px; color: var(--text-muted);">空间</div>
              </div>
            </div>
            
            ${stats.total > 0 ? `
              <div style="margin-bottom: 16px;">
                <button class="btn btn-danger" onclick="app.emptyTrash()" style="width: 100%;">
                  <span class="iconify" data-icon="lucide:trash-2" data-width="14"></span> 清空回收站
                </button>
              </div>
            ` : ''}

            <div class="trash-list" style="max-height: 400px; overflow-y: auto;">
              ${sortedItems.length === 0 ? 
                '<div class="empty-state" style="padding: 40px; text-align: center; color: var(--text-muted);">回收站为空</div>' :
                sortedItems.map(item => this.renderTrashItem(item)).join('')
              }
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // 渲染单个回收站项目
  renderTrashItem(item) {
    const typeIcon = {
      'doc': 'lucide:file-text',
      'book': 'lucide:book-open',
      'workspace': 'lucide:folder'
    }[item.type];

    const typeName = {
      'doc': '文档',
      'book': '书本',
      'workspace': '工作区'
    }[item.type];

    const title = item.item.title || item.item.name || '未命名';
    const deletedTime = new Date(item.deletedAt).toLocaleString();

    let locationInfo = '';
    if (item.type === 'doc') {
      locationInfo = `${item.workspaceName} / ${item.bookTitle}`;
    } else if (item.type === 'book') {
      locationInfo = `${item.workspaceName}`;
    }

    return `
      <div class="trash-item" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; padding: 12px; border: 1px solid var(--border); border-radius: 4px; margin-bottom: 8px; background: var(--bg);">
        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <span class="iconify" data-icon="${typeIcon}" data-width="16" style="color: var(--text-muted);"></span>
            <span style="font-weight: 600; color: var(--text);">${title}</span>
            <span style="font-size: 10px; padding: 2px 6px; border-radius: 999px; background: var(--bg-contrast); color: var(--text-muted);">${typeName}</span>
          </div>
          ${locationInfo ? `<div style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">位置: ${locationInfo}</div>` : ''}
          <div style="font-size: 11px; color: var(--text-muted);">删除时间: ${deletedTime}</div>
        </div>
        <div style="display: flex; gap: 6px;">
          <button class="btn" onclick="app.restoreFromTrash('${item.id}')" style="font-size: 11px; padding: 6px 10px;">
            <span class="iconify" data-icon="lucide:undo-2" data-width="12"></span> 恢复
          </button>
          <button class="btn btn-danger" onclick="app.permanentDelete('${item.id}')" style="font-size: 11px; padding: 6px 10px;">
            <span class="iconify" data-icon="lucide:trash-2" data-width="12"></span> 永久删除
          </button>
        </div>
      </div>
    `;
  }
};

// 确保全局可访问
if (typeof window !== 'undefined') {
  window.UIRenderer = UIRenderer;
}
