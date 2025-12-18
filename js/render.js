// 页面渲染器

const Renderer = {
  // 方法：渲染左侧工作区
  renderLeftPanel(data) {
    const container = document.getElementById('left-panel');
    if (!container) return;

    const activeWsId = data.active.workspaceId;
    const wsList = data.workspaces.map(ws => `
      <div class="list-item workspace-item ${ws.id === activeWsId ? 'active' : ''}"
           onclick="app.switchWorkspace('${ws.id}')">
        <span class="icon">📚</span>
        <span class="name">${ws.name}</span>
        <span class="count">${ws.books.length}</span>
      </div>
    `).join('') || '<div class="empty-state">暂无工作区</div>';

    container.innerHTML = `
      <div class="section-header">
        <span class="section-title">知识空间</span>
        <button class="btn-icon" onclick="app.createWorkspace()" title="新建工作区">+</button>
      </div>
      <div style="overflow-y: auto; flex: 1;">
        ${wsList}
      </div>
    `;
  },

  // 渲染中间文档列表
  renderCenterPanel(data, searchResults = null, keyword = '') {
    const container = document.getElementById('center-panel');
    if (!container) return;

    const activeWs = data.workspaces.find(w => w.id === data.active.workspaceId);

    // 搜索结果模式
    if (searchResults) {
      const resultsHTML = searchResults.length === 0
        ? `<div class="empty-state">未找到 "${keyword}"</div>`
        : searchResults.map(r => `
            <div class="list-item" onclick="app.switchDoc('${r.bookId}', '${r.id}')">
              <div style="flex: 1; overflow: hidden;">
                <div style="font-weight: 600;">${MarkdownRenderer.highlight(r.title, keyword)}</div>
                <div style="font-size: 11px; color: var(--text-sub); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  ${MarkdownRenderer.highlight(r.excerpt, keyword)}
                </div>
                <div style="font-size: 10px; color: var(--text-sub); margin-top: 4px;">
                  <span style="color:${r.bookColor}">${r.bookTitle}</span>
                  ${r.tags.map(t => `<span class="tag" style="margin-left: 4px;">${t}</span>`).join('')}
                </div>
              </div>
            </div>
          `).join('');

      container.innerHTML = `
        <div class="section-header">
          <span class="section-title">搜索结果 (${searchResults.length})</span>
          <button class="btn" style="padding: 4px 8px;" onclick="app.clearSearch()">清除</button>
        </div>
        <div style="overflow-y: auto; flex: 1;">
          <div class="search-results">${resultsHTML}</div>
        </div>
      `;
      return;
    }

    // 常规模式
    if (!activeWs) {
      container.innerHTML = `<div class="empty-state">请选择工作区</div>`;
      return;
    }

    const searchHTML = `
      <div class="search-box">
        <input type="text" class="search-input"
               placeholder="搜索文档... (Ctrl+K)"
               value="${data.active.search || ''}"
               oninput="app.handleSearch(this.value)">
      </div>
    `;

    const bookHTML = activeWs.books.map(book => {
      const isExpanded = data.active.bookId === book.id;
      const docHTML = isExpanded ? book.docs.map(doc => `
        <div class="list-item doc-item ${data.active.docId === doc.id ? 'active' : ''}"
             onclick="app.switchDoc('${book.id}', '${doc.id}')">
          <span class="status-dot ${doc.status}"></span>
          <span class="doc-title">${doc.title}</span>
          ${doc.tags.length ? `<span class="tag">${doc.tags[0]}</span>` : ''}
        </div>
      `).join('') : '';

      return `
        <div class="book-section ${isExpanded ? 'expanded' : ''}">
          <div class="book-header" onclick="app.toggleBook('${book.id}')">
            <span class="book-icon" style="color:${book.coverColor}">${book.icon}</span>
            <div class="book-title">${book.title}</div>
            <span class="book-count">${book.docs.length}</span>
          </div>
          ${isExpanded ? `
            <div class="doc-list">${docHTML}</div>
            <div class="add-doc-btn" onclick="app.createDoc('${book.id}')">+ 新建文档</div>
          ` : ''}
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="section-header">
        <span class="section-title">${activeWs.name}</span>
        <button class="btn-icon" onclick="app.createBook()" title="新建书本">+</button>
      </div>
      ${searchHTML}
      <div style="overflow-y: auto; flex: 1; position: relative;">
        ${bookHTML}
        <div id="search-results-container"></div>
      </div>
    `;
  },

  // 渲染主内容区
  renderMainPanel(data, app) {
    const container = document.getElementById('main-panel');
    if (!container) return;

    const doc = app.getCurrentDoc();

    // 欢迎页/空状态
    if (!doc) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="welcome">
            <h2>📚 语雀 Lite</h2>
            <p>清新、简洁、高效的知识管理工具<br>支持 Markdown、全文搜索、数据备份</p>
            <button class="btn btn-primary" onclick="app.createDoc()">📝 开始写作</button>
          </div>
        </div>
      `;
      return;
    }

    // 编辑器
    container.innerHTML = `
      <div class="editor-header">
        <input type="text" class="title-input"
               value="${doc.title}"
               oninput="app.updateDocTitle(this.value)"
               placeholder="文档标题...">
        <div class="editor-actions">
          <button class="btn" onclick="app.toggleDocStatus('${doc.id}')" data-tooltip="切换状态">
            ${doc.status === 'published' ? '设为草稿' : '发布'}
          </button>
          <button class="btn" onclick="app.togglePreview()" data-tooltip="预览模式">👁️ 预览</button>
          <button class="btn btn-primary" onclick="app.saveDoc()" data-tooltip="Ctrl+S">💾 保存</button>
          <button class="btn" onclick="app.addTag()" data-tooltip="添加标签">🏷️ 标签</button>
          <button class="btn" onclick="app.exportDoc()" data-tooltip="导出为MD">⬇️ 导出</button>
          <button class="btn btn-danger" onclick="app.deleteDoc('${doc.id}')" data-tooltip="删除文档">🗑️</button>
        </div>
      </div>
      <div class="split-view" id="split-view">
        <textarea class="editor-area"
                  id="editor-textarea"
                  oninput="app.handleEditorInput(this.value)"
                  placeholder="支持基础 Markdown 语法：
# ## ### 标题
**粗体**
\`代码\` 或 \`\`\`多行代码\`\`\`
* 列表
> 引用
[链接](url)">${doc.content}</textarea>
        <div class="preview-area" id="preview-area">
          ${MarkdownRenderer.render(doc.content)}
        </div>
      </div>
      <div class="editor-footer">
        <span>字数: ${doc.stats.words}</span>
        <span>阅读: ${doc.stats.estimatedTime}分钟</span>
        <span>更新: ${formatDate(doc.updated)}</span>
        <span>状态: ${doc.status === 'published' ? '已发布' : '草稿'}</span>
        ${doc.tags.length ? `<span>标签: ${doc.tags.join(', ')}</span>` : ''}
      </div>
    `;
  },

  // 渲染统计面板
  renderStats(data) {
    const stats = DataAPI.getStats(data);

    const html = `
      <div class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>数据统计</h3>
            <button onclick="app.closeModal()">✕</button>
          </div>
          <div class="modal-body">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">${stats.docCount}</div>
                <div class="stat-label">总文档</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${Math.round(stats.wordCount/10)/10}k</div>
                <div class="stat-label">总字数</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${stats.bookCount}</div>
                <div class="stat-label">书本</div>
              </div>
            </div>
            <h4>热门标签</h4>
            <div class="tag-cloud" style="margin-top: 12px;">
              ${Object.entries(stats.tagMap).length ?
                Object.entries(stats.tagMap).map(([tag, count]) => `
                  <span class="tag-item" style="font-size: ${12 + Math.min(count*2, 10)}px;"
                        onclick="app.filterByTag('${tag}')">${tag} (${count})</span>
                `).join('') :
                '<div style="color: #8A9096;">暂无标签</div>'
              }
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
  },

  // 渲 Toast 通知
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  // 渲染备份列表
  renderBackupManager() {
    const backupsRaw = localStorage.getItem('yuque-lite-backups');
    const backups = backupsRaw ? JSON.parse(backupsRaw) : [];

    return `
      <div class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>备份与恢复</h3>
            <button onclick="app.closeModal()">✕</button>
          </div>
          <div class="modal-body">
            <div style="margin-bottom: 12px;">
              <button class="btn btn-primary" style="margin-right: 8px;" onclick="app.createBackup()">创建新备份</button>
              <label class="btn" style="margin-right: 8px; cursor: pointer;">
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
                      <button class="btn" onclick="app.deleteBackup(${i})" style="color: #EF4444;">删除</button>
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
      <div class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>选择模板</h3>
            <button onclick="app.closeModal()">✕</button>
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
    const vars = template.content.match(/\{\{(\w+)\}\}/g) || [];
    const uniqueVars = [...new Set(vars.map(v => v.slice(2, -2)))];

    if (uniqueVars.length === 0) {
      return `
        <div class="modal">
          <div class="modal-content">
            <div class="modal-header">
              <h3>${template.name}</h3>
              <button onclick="app.closeModal()">✕</button>
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
      <div class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>${template.name}</h3>
            <button onclick="app.closeModal()">✕</button>
          </div>
          <div class="modal-body template-form">
            ${uniqueVars.map(v => `
              <div class="form-field">
                <label>${Renderer.varLabel(v)}</label>
                <input type="text" id="var-${v}" placeholder="请输入${Renderer.varLabel(v)}">
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
  }
};