// 主应用类 - 连接所有模块

class YuqueLiteApp {
  constructor() {
    this.data = null;
    this.isPreview = false;

    // 初始化入口
    this.init();
  }

  init() {
    try {
      // 1. 加载数据
      this.data = DataAPI.load();

      // 2. 应用主题
      this.applyTheme();

      // 3. 首次渲染
      this.renderAll();

      // 4. 绑定快捷键
      this.bindShortcuts();

      // 5. 启动自动保存提示
      this.showToast('语雀 Lite 已就绪', 'success');

    } catch (error) {
      console.error('初始化失败:', error);
      this.showToast('初始化失败，请刷新页面重试', 'error');
    }
  }

  // 渲染全部面板
  renderAll() {
    Renderer.renderLeftPanel(this.data);
    this.renderMainWithCenter();
    this.applyTheme();
  }

  // 渲染中间+主面板（根据搜索状态）
  renderMainWithCenter() {
    if (this.data.active.search && this.data.active.search.length >= 2) {
      const results = SearchEngine.search(this.data, this.data.active.search);
      Renderer.renderCenterPanel(this.data, results, this.data.active.search);
    } else {
      Renderer.renderCenterPanel(this.data);
    }
    Renderer.renderMainPanel(this.data, this);
  }

  // ==================== 工作区操作 ====================

  createWorkspace() {
    const name = prompt('请输入工作区名称：');
    if (!name || !name.trim()) return;

    DataAPI.autoCreate.workspace(this.data, name.trim());
    this.renderAll();
    this.showToast(`创建工作区 "${name}"`, 'success');
  }

  switchWorkspace(id) {
    this.data.active.workspaceId = id;
    this.data.active.bookId = null;
    this.data.active.docId = null;
    this.data.active.search = '';
    DataAPI.save(this.data);
    this.renderAll();
  }

  deleteWorkspace(id, event) {
    event && event.stopPropagation();
    if (!confirm('确定删除当前工作区？它所有的书本和文档都将被删除。')) return;

    if (DataAPI.deleteWorkspace(this.data, id)) {
      this.renderAll();
      this.showToast('工作区已删除', 'success');
    }
  }

  // ==================== 书本操作 ====================

  createBook() {
    if (!this.data.active.workspaceId) {
      return this.showToast('请先选择一个工作区', 'warning');
    }

    const name = prompt('请输入书本名称：');
    if (!name || !name.trim()) return;

    DataAPI.autoCreate.book(this.data, this.data.active.workspaceId, name.trim());
    this.renderMainWithCenter();
    this.showToast(`创建书本 "${name}"`, 'success');
  }

  toggleBook(id) {
    this.data.active.bookId = this.data.active.bookId === id ? null : id;
    this.renderMainWithCenter();
  }

  deleteBook(id, event) {
    event && event.stopPropagation();
    if (!confirm('确定删除当前书本？其中所有文档都将被删除。')) return;

    if (DataAPI.deleteBook(this.data, id)) {
      this.renderMainWithCenter();
      this.showToast('书本已删除', 'success');
    }
  }

  // ==================== 文档操作 ====================

  createDoc(bookId = null) {
    const targetBook = bookId || this.data.active.bookId;

    if (!targetBook) {
      return this.showToast('请先选择一个书本', 'warning');
    }

    const title = prompt('请输入文档标题：');
    if (!title || !title.trim()) return;

    const doc = DataAPI.autoCreate.doc(this.data, targetBook, title.trim());
    if (doc) {
      this.renderMainWithCenter();
      this.showToast(`创建文档 "${title}"`, 'success');
    }
  }

  switchDoc(bookId, docId) {
    this.data.active.bookId = bookId;
    this.data.active.docId = docId;
    this.renderMainWithCenter();
  }

  deleteDoc(docId) {
    if (!confirm('确定删除当前文档？')) return;

    if (DataAPI.deleteDoc(this.data, docId)) {
      this.renderMainWithCenter();
      this.showToast('文档已删除', 'success');
    }
  }

  toggleDocStatus(docId) {
    const newStatus = DataAPI.toggleDocStatus(this.data, docId);
    if (newStatus) {
      this.renderMainWithCenter();
    }
  }

  // ==================== 编辑器操作 ====================

  handleEditorInput = debounce(function(value) {
    const doc = this.getCurrentDoc();
    if (!doc) return;

    DataAPI.updateDoc(this.data, doc.id, value);

    // 实时更新预览
    const preview = document.getElementById('preview-area');
    if (preview) {
      preview.innerHTML = MarkdownRenderer.render(value);
    }

    // 更新计数器
    this.updateFooterStats();
  }, 500);

  updateDocTitle(value) {
    const doc = this.getCurrentDoc();
    if (!doc) return;

    DataAPI.updateDocTitle(this.data, doc.id, value.trim());
  }

  saveDoc() {
    DataAPI.save(this.data);
    // 立即刷新以便显示更新时间
    this.renderMainWithCenter();
    this.showToast('文档已保存', 'success');
  }

  togglePreview() {
    const splitView = document.getElementById('split-view');
    if (!splitView) return;

    this.isPreview = !this.isPreview;

    if (this.isPreview) {
      splitView.style.gridTemplateColumns = '0 1fr';
      this.showToast('预览模式', 'info');
    } else {
      splitView.style.gridTemplateColumns = '1fr 1fr';
      this.showToast('编辑模式', 'info');
    }
  }

  updateFooterStats() {
    const doc = this.getCurrentDoc();
    if (!doc) return;

    const footer = document.querySelector('.editor-footer');
    if (footer) {
      footer.innerHTML = `
        <span>字数: ${doc.stats.words}</span>
        <span>阅读: ${doc.stats.estimatedTime}分钟</span>
        <span>更新: ${formatDate(doc.updated)}</span>
        <span>状态: ${doc.status === 'published' ? '已发布' : '草稿'}</span>
        ${doc.tags.length ? `<span>标签: ${doc.tags.join(', ')}</span>` : ''}
      `;
    }
  }

  // ==================== 搜索操作 ====================

  handleSearch = debounce(function(keyword) {
    this.data.active.search = keyword;
    DataAPI.save(this.data);

    if (keyword.length < 2) {
      this.renderMainWithCenter();
      return;
    }

    const results = SearchEngine.search(this.data, keyword);

    // 更新中间面板（显示搜索结果）
    const container = document.getElementById('center-panel');
    if (container) {
      Renderer.renderCenterPanel(this.data, results, keyword);
    }
  }, 300);

  clearSearch() {
    this.data.active.search = '';
    DataAPI.save(this.data);
    this.renderMainWithCenter();
  }

  // ==================== 标签操作 ====================

  addTag() {
    const doc = this.getCurrentDoc();
    if (!doc) return;

    const tag = prompt('请输入标签名称：');
    if (!tag || !tag.trim()) return;

    if (DataAPI.addTagToDoc(this.data, doc.id, tag.trim())) {
      this.renderMainWithCenter();
      this.showToast(`添加标签 "${tag}"`, 'success');
    }
  }

  filterByTag(tag) {
    // 使用搜索引擎的标签搜索
    const keyword = `tag:${tag}`;
    this.data.active.search = keyword;
    DataAPI.save(this.data);

    const results = SearchEngine.search(this.data, keyword);
    Renderer.renderCenterPanel(this.data, results, tag);
    this.closeModal();
  }

  // ==================== 导入导出 ====================

  exportDoc() {
    const doc = this.getCurrentDoc();
    if (!doc) return;

    const content = `# ${doc.title}\n\n` +
                    `> 创建: ${formatDate(doc.created)}\n` +
                    `> 更新: ${formatDate(doc.updated)}\n` +
                    `> 标签: ${doc.tags.join(', ') || '无'}\n` +
                    `> 字数: ${doc.stats.words} | 阅读: ${doc.stats.estimatedTime}分钟\n\n` +
                    `---\n\n` +
                    doc.content;

    downloadFile(content, `${doc.title}.md`, 'text/markdown');
    this.showToast('文档已导出', 'success');
  }

  exportAllData() {
    const content = JSON.stringify(this.data, null, 2);
    const timestamp = new Date().toISOString().substring(0, 10);
    downloadFile(content, `yuque-lite-${timestamp}.json`, 'application/json');
    this.showToast('完整数据已导出', 'success');
  }

  handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!confirm('导入数据将合并到当前数据，确定继续？')) {
      event.target.value = '';
      return;
    }

    readFile(file, (content) => {
      try {
        const importData = JSON.parse(content);

        // 简单验证
        if (!importData.workspaces || !importData.user) {
          throw new Error('无效的数据格式');
        }

        // 合并工作区（避免冲突）
        importData.workspaces.forEach(ws => {
          if (!this.data.workspaces.find(w => w.name === ws.name)) {
            this.data.workspaces.push(ws);
          } else {
            // 检查ID冲突
            if (!this.data.workspaces.find(w => w.id === ws.id)) {
              this.data.workspaces.push(ws);
            }
          }
        });

        DataAPI.save(this.data);
        this.renderAll();
        this.closeModal();
        this.showToast('数据导入成功', 'success');
      } catch (error) {
        this.showToast('数据格式错误: ' + error.message, 'error');
      }

      event.target.value = '';
    });
  }

  // ==================== 备份系统 ====================

  createBackup(type = 'manual') {
    const backupsRaw = localStorage.getItem('yuque-lite-backups');
    const backups = backupsRaw ? JSON.parse(backupsRaw) : [];

    const backup = {
      timestamp: Date.now(),
      type: type,
      data: JSON.parse(JSON.stringify(this.data)) // 深拷贝
    };

    backups.unshift(backup);

    // 保留最近5个
    if (backups.length > 5) {
      backups.splice(5);
    }

    localStorage.setItem('yuque-lite-backups', JSON.stringify(backups));
    this.showToast(`备份已创建 (${type})`, 'success');
  }

  createManualBackup() {
    this.createBackup('manual');
  }

  showBackupManager() {
    const html = Renderer.renderBackupManager();
    document.body.insertAdjacentHTML('beforeend', html);
  }

  restoreBackup(index) {
    const backupsRaw = localStorage.getItem('yuque-lite-backups');
    if (!backupsRaw) return;

    const backups = JSON.parse(backupsRaw);
    if (index >= backups.length) return;

    if (!confirm('恢复备份将覆盖当前数据，确定继续？')) return;

    this.data = backups[index].data;
    DataAPI.save(this.data);
    this.renderAll();
    this.closeModal();
    this.showToast('备份恢复成功', 'success');
  }

  deleteBackup(index) {
    const backupsRaw = localStorage.getItem('yuque-lite-backups');
    if (!backupsRaw) return;

    const backups = JSON.parse(backupsRaw);
    if (index >= backups.length) return;

    if (!confirm('确定删除该备份？')) return;

    backups.splice(index, 1);
    localStorage.setItem('yuque-lite-backups', JSON.stringify(backups));

    // 刷新备份列表
    this.closeModal();
    this.showBackupManager();
    this.showToast('备份已删除', 'success');
  }

  // ==================== 模板系统 ====================

  showTemplates() {
    const templates = Templates.defaults;
    const html = Renderer.renderTemplateSelector(templates);
    document.body.insertAdjacentHTML('beforeend', html);
  }

  showTemplateForm(id) {
    const template = Templates.getTemplateById(id);
    if (!template) return;

    this.closeModal();
    const html = Renderer.renderTemplateForm(template);
    document.body.insertAdjacentHTML('beforeend', html);
  }

  useTemplate(id) {
    if (!this.data.active.bookId) {
      this.showToast('请先选择一个书本', 'warning');
      return;
    }

    const template = Templates.getTemplateById(id);
    if (!template) return;

    // 收集变量
    const variables = {};
    const varMatches = template.content.match(/\{\{(\w+)\}\}/g) || [];
    const uniqueVars = [...new Set(varMatches.map(m => m.slice(2, -2)))];

    uniqueVars.forEach(v => {
      const input = document.getElementById(`var-${v}`);
      if (input) {
        variables[v] = input.value || Templates.varLabel(v);
      }
    });

    // 填充模板并创建文档
    const content = Templates.fillTemplate(id, variables);
    const docTitle = template.name + ' - ' + (variables.name || variables.book_name || new Date().toLocaleDateString());

    const doc = DataAPI.autoCreate.doc(this.data, this.data.active.bookId, docTitle);
    if (doc) {
      DataAPI.updateDoc(this.data, doc.id, content);
      this.renderMainWithCenter();
      this.closeModal();
      this.showToast(`模板文档 "${docTitle}" 已创建`, 'success');
    }
  }

  // ==================== 统计与分析 ====================

  showStats() {
    Renderer.renderStats(this.data);
  }

  // ==================== 主题切换 ====================

  toggleTheme() {
    const current = this.data.user.theme;
    this.data.user.theme = current === 'light' ? 'dark' : 'light';
    DataAPI.save(this.data);
    this.applyTheme();
    this.showToast(`切换到${this.data.user.theme === 'dark' ? '暗色' : '亮色'}主题`, 'info');
  }

  applyTheme() {
    if (this.data.user.theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  // ==================== 辅助方法 ====================

  getCurrentDoc() {
    if (!this.data) return null;
    return DataAPI.findDoc(this.data, this.data.active.docId);
  }

  closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(m => m.remove());
  }

  showToast(message, type = 'info') {
    Renderer.showToast(message, type);
  }

  bindShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + S: 保存
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.saveDoc();
      }

      // Ctrl/Cmd + P: 预览切换
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        this.togglePreview();
      }

      // Ctrl/Cmd + K: 搜索
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.querySelector('.search-input');
        if (input) input.focus();
      }

      // Ctrl/Cmd + N: 新建文档
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        this.createDoc();
      }

      // Ctrl/Cmd + B: 主题切换
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        this.toggleTheme();
      }

      // Esc: 关闭模态框
      if (e.key === 'Escape') {
        this.closeModal();
        this.clearSearch();
      }
    });
  }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
  // 检查是否支持浏览器
  if (!window.localStorage) {
    alert('您的浏览器不支持 LocalStorage，无法使用本应用');
    return;
  }

  // 启动应用实例
  window.app = new YuqueLiteApp();

  // 暴露部分API给全局
  window.Models = {
    // 简化的导出供HTML内联调用使用
  };
});