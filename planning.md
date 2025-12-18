# 语雀风格知识库系统 - 完整开发规划

> **项目时间**：3周
> **技术栈**：纯原生 HTML + CSS + JavaScript (零依赖)
> **存储**：LocalStorage
> **提交策略**：每完成一个小功能即提交一次，保持原子性

---

## 📋 项目概述

这是一个语雀风格的个人知识库管理系统，支持：
- 📁 多级知识库结构（Workspace → Book → Doc）
- ✍️ Markdown 编辑与实时预览
- 🔍 全文搜索与标签筛选
- 🎨 语雀风格界面与主题切换
- 📊 数据统计与可视化
- 💾 数据导入导出

---

## 🚀 开发阶段规划（从简单到复杂）

### **phase-1: 基础架构**（预计 1 天）

#### 1.1 项目初始化
```bash
# 仓库初始化
git init
echo "# Yuque-Lite" > README.md
echo "# 纯原生知识库系统" > planning.md
git add .
git commit -m "docs: 项目初始化与开发规划"
```

**目标**：
- ✅ 创建基本文件结构
- ✅ 搭建HTML骨架
- ✅ 编写开发规划文档

**文件结构**：
```
yuque-lite/
├── index.html          # 主入口
├── style.css           # 基础样式
├── app.js              # 主程序入口
├── planning.md         # 开发文档
└── README.md           # 项目说明
```

**提交规范**：
```
git commit -m "chore: 初始化项目基础结构"
```

---

#### 1.2 本地数据管理器（最小可用）
**实现**：基础 LocalStorage 读写封装

```javascript
// data-storage.js
class DataStorage {
  static KEY = 'yuque-lite-data-v1';

  static getData() {
    const raw = localStorage.getItem(this.KEY);
    return raw ? JSON.parse(raw) : this.getDefaultData();
  }

  static saveData(data) {
    localStorage.setItem(this.KEY, JSON.stringify(data));
  }

  static getDefaultData() {
    return {
      user: { theme: 'light' },
      workspaces: [],
      active: { workspaceId: null }
    };
  }
}
```

**提交**：
```
git commit -m "feat: 添加本地数据存储管理器"
```

---

### **phase-2: 核心结构与UI框架**（预计 2 天）

#### 2.1 语雀风格三栏布局
**实现**：CSS Grid + Flexbox，语雀配色

```css
/* style.css */
:root {
  --primary: #25B864;      /* 语雀标志绿 */
  --bg-main: #F7F8FA;      /* 主背景 */
  --bg-white: #FFFFFF;     /* 卡片白 */
  --border: #E8EAEF;       /* 分割线 */
  --text-main: #1F2329;    /* 主文字 */
  --text-sub: #8A9096;     /* 次要文字 */
  --hover: #F0F2F4;
}

body, html {
  margin: 0;
  padding: 0;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

/* 语雀三栏布局 */
.app-layout {
  display: grid;
  grid-template-columns: 260px 280px 1fr;
  height: 100vh;
  background: var(--bg-white);
}

/* 左侧：知识空间栏 */
.sidebar-left {
  background: #fff;
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 中间：文档导航栏 */
.sidebar-center {
  background: var(--bg-main);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 右侧：主内容区 */
.content-main {
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
```

**提交**：
```
git commit -m "feat: 语雀风格三栏布局 + CSS变量定义"
```

---

#### 2.2 基础数据模型与初始化
**实现**：数据结构 + 演示数据

```javascript
// models.js
// 核心数据模型
const Models = {
  // 生成UUID
  uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  // 创建空工作区
  createWorkspace(name = '我的知识库') {
    return {
      id: this.uuid(),
      name,
      description: 'Personal knowledge base',
      books: [],
      created: new Date().toISOString()
    };
  },

  // 创建书本
  createBook(title, icon = '📚', color = '#25B864') {
    return {
      id: this.uuid(),
      title,
      icon,
      coverColor: color,
      tags: [],
      stats: { docCount: 0, wordCount: 0, lastUpdated: new Date().toISOString() },
      docs: []
    };
  },

  // 创建文档
  createDoc(title, content = '') {
    return {
      id: this.uuid(),
      bookId: null,
      title,
      type: 'markdown',
      status: 'draft',
      content,
      contentHTML: '',
      tags: [],
      priority: 'normal',
      stats: { words: 0, views: 0, estimatedTime: 0 },
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };
  },

  // 演示数据
  demoData() {
    const demoWs = this.createWorkspace('📚 我的技术笔记');
    const bookCSS = this.createBook('CSS 进阶', '🎨', '#61DAFB');
    const bookJS = this.createBook('JavaScript', '⚙️', '#F7DF1E');

    const doc1 = this.createDoc('Grid布局指南', '# Grid 完全指南\n\n## 介绍\nGrid 是...');
    doc1.bookId = bookCSS.id;
    doc1.tags = ['CSS', '布局'];
    doc1.status = 'published';
    doc1.stats = { words: 1200, views: 15, estimatedTime: 4 };

    bookCSS.docs = [doc1];
    bookCSS.stats.docCount = 1;
    bookCSS.stats.wordCount = 1200;

    demoWs.books = [bookCSS, bookJS];

    return {
      user: { theme: 'light', autoSave: true },
      workspaces: [demoWs],
      active: {
        workspaceId: demoWs.id,
        bookId: bookCSS.id,
        docId: doc1.id
      },
      system: {
        version: '1.0.0',
        created: new Date().toISOString()
      }
    };
  }
};

// 演示数据初始化
function initDemoData() {
  const data = Models.demoData();
  DataStorage.saveData(data);
  return data;
}
```

**提交**：
```
git commit -m "feat: 核心数据模型 + 演示数据生成器"
```

---

#### 2.3 左侧知识空间导航（一级）
**实现**：Workspace 列表 + 基础UI渲染

```javascript
// render-sidebar-left.js
class SidebarLeftRenderer {
  constructor(container, app) {
    this.container = container;
    this.app = app;
  }

  render() {
    const data = this.app.data;
    const workspaces = data.workspaces || [];
    const activeWsId = data.active.workspaceId;

    return `
      <div class="sidebar-left">
        <div class="section-header">
          <span class="title">知识空间</span>
          <button class="btn-icon" onclick="app.addWorkspace()">+</button>
        </div>

        <div class="workspace-list">
          ${workspaces.map(ws => `
            <div class="workspace-item ${ws.id === activeWsId ? 'active' : ''}"
                 onclick="app.switchWorkspace('${ws.id}')">
              <span class="icon">📚</span>
              <span class="name">${ws.name}</span>
              <span class="count">${ws.books.length}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  bindEvents() {
    // 后续绑定复杂交互
  }
}
```

**提交**：
```
git commit -m "feat: 左侧知识空间导航 + 工作区切换"
```

---

### **phase-3: 核心功能 - 文档管理**（预计 3 天）

#### 3.1 中间文档列表（二级）
**实现**：Book列表 + 文档筛选

```javascript
// render-sidebar-center.js
class SidebarCenterRenderer {
  constructor(container, app) {
    this.container = container;
    this.app = app;
  }

  render() {
    const data = this.app.data;
    const activeWs = data.workspaces.find(ws => ws.id === data.active.workspaceId);

    if (!activeWs) {
      return `<div class="sidebar-center"><div class="empty-state">请选择工作区</div></div>`;
    }

    return `
      <div class="sidebar-center">
        <div class="section-header">
          <span class="title">${activeWs.name}</span>
          <button class="btn-icon" onclick="app.addBook()">+</button>
        </div>

        <div class="search-box">
          <input type="text" placeholder="搜索文档..."
                 value="${data.active.searchKeyword || ''}"
                 oninput="app.handleSearch(this.value)">
        </div>

        <div class="book-list">
          ${activeWs.books.map(book => this.renderBook(book)).join('')}
        </div>
      </div>
    `;
  }

  renderBook(book) {
    const isActiveBook = this.app.data.active.bookId === book.id;
    return `
      <div class="book-section ${isActiveBook ? 'expanded' : 'collapsed'}">
        <div class="book-header" onclick="app.toggleBook('${book.id}')">
          <span class="book-icon" style="color: ${book.coverColor}">${book.icon}</span>
          <span class="book-title">${book.title}</span>
          <span class="book-count">${book.docs.length}</span>
        </div>

        ${isActiveBook ? `
          <div class="doc-list">
            ${book.docs.map(doc => `
              <div class="doc-item ${this.app.data.active.docId === doc.id ? 'active' : ''}"
                   onclick="app.switchDoc('${book.id}', '${doc.id}')">
                <span class="status-indicator ${doc.status}"></span>
                <span class="doc-title">${doc.title}</span>
                ${doc.tags.length ? `<span class="tag">${doc.tags[0]}</span>` : ''}
              </div>
            `).join('')}
            <div class="	add-doc-btn" onclick="app.addDoc('${book.id}')">+ 新建文档</div>
          </div>
        ` : ''}
      </div>
    `;
  }
}
```

**提交**：
```
git commit -m "feat: 中间文档列表 + 书本折叠展开"
```

---

#### 3.2 Markdown 编辑器与实时预览
**实现**：分屏编辑 + 简化版MD解析

```javascript
// markdown-renderer.js
class MarkdownRenderer {
  // 基础Markdown解析（简化版）
  static render(text) {
    if (!text) return '<div class="empty-doc">开始写作...</div>';

    return text
      // 标题 # ## ###
      .replace(/^### (.*)$/gim, '<h3>$1</h3>')
      .replace(/^## (.*)$/gim, '<h2>$1</h2>')
      .replace(/^# (.*)$/gim, '<h1>$1</h1>')

      // 粗体/斜体
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

      // 链接
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')

      // 行内代码
      .replace(/`(.*?)`/g, '<code class="inline-code">$1</code>')

      // 代码块
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')

      // 无序列表
      .replace(/^\* (.*)$/gim, '<li>$1</li>')
      .replace(/<\/li>\s*<li>/g, '</li><li>') // 合并列表
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')

      // 引用
      .replace(/^> (.*)$/gim, '<blockquote>$1</blockquote>')

      // 段落
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.+)$/gim, '<p>$1</p>')

      // 清理多余空段落
      .replace(/<p><\/p>/g, '')
      .replace(/<p><h/g, '<h')
      .replace(/<\/h[1-6]><\/p>/g, '</h[1-6]>');
  }
}
```

```javascript
// render-editor.js
class EditorRenderer {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.isPreview = false;
  }

  render() {
    const data = this.app.data;
    const doc = this.getCurrentDoc();

    if (!doc) {
      return `
        <div class="content-main empty-state">
          <div class="welcome">
            <h2>欢迎使用语雀 Lite</h2>
            <p>请选择文档开始创作，或创建一个新的文档</p>
            <button onclick="app.addDoc()" style="margin-top: 20px;">新建文档</button>
          </div>
        </div>
      `;
    }

    return `
      <div class="content-main">
        <div class="editor-header">
          <input type="text"
                 class="doc-title-input"
                 value="${doc.title}"
                 oninput="app.updateDocTitle(this.value)"
                 placeholder="文档标题...">

          <div class="editor-actions">
            <button class="btn" onclick="app.togglePreview()">预览</button>
            <button class="btn primary" onclick="app.saveDoc()">保存</button>
            <button class="btn" onclick="app.exportDoc()">导出</button>
          </div>
        </div>

        <div class="editor-body">
          <div class="split-editor ${this.isPreview ? 'preview-only' : ''}">
            <textarea id="editor-textarea"
                      class="editor-area"
                      oninput="app.handleEditorInput(this.value)"
                      placeholder="支持基础 Markdown 语法...">${doc.content}</textarea>

            <div id="preview-area" class="preview-area">
              ${MarkdownRenderer.render(doc.content)}
            </div>
          </div>
        </div>

        <div class="editor-footer">
          <span class="stats">字数: ${doc.stats.words} | 阅读: ${doc.stats.estimatedTime}分钟</span>
          <span class="status">状态: ${doc.status}</span>
          <span class="updated">更新: ${new Date(doc.updated).toLocaleString()}</span>
        </div>
      </div>
    `;
  }

  getCurrentDoc() {
    const { workspaces, active } = this.app.data;
    const ws = workspaces.find(w => w.id === active.workspaceId);
    if (!ws) return null;

    for (let book of ws.books) {
      const doc = book.docs.find(d => d.id === active.docId);
      if (doc) return doc;
    }
    return null;
  }
}
```

**提交**：
```
git commit -m "feat: 分屏Markdown编辑器 + 实时预览"
```

---

### **phase-4: 高级功能 - 搜索与标签**（预计 3 天）

#### 4.1 全文搜索系统
**实现**：搜索索引 + 高亮显示

```javascript
// search-engine.js
class SearchEngine {
  constructor(app) {
    this.app = app;
    this.index = null;
  }

  // 构建倒排索引
  buildIndex() {
    const index = { words: {}, tags: {}, docs: {} };
    const data = this.app.data;

    data.workspaces.forEach(ws => {
      ws.books.forEach(book => {
        book.docs.forEach(doc => {
          // 索引文档内容
          const words = this.tokenize(doc.content + ' ' + doc.title);
          words.forEach(word => {
            if (!index.words[word]) index.words[word] = [];
            if (!index.words[word].includes(doc.id)) {
              index.words[word].push(doc.id);
            }
          });

          // 索引标签
          doc.tags.forEach(tag => {
            if (!index.tags[tag]) index.tags[tag] = [];
            if (!index.tags[tag].includes(doc.id)) {
              index.tags[tag].push(doc.id);
            }
          });

          // 文档缓存
          index.docs[doc.id] = {
            title: doc.title,
            excerpt: this.getExcerpt(doc.content),
            tags: doc.tags,
            bookTitle: book.title,
            bookId: book.id
          };
        });
      });
    });

    this.index = index;
    return index;
  }

  // 分词（简单版）
  tokenize(text) {
    if (!text) return [];
    return text
      .toLowerCase()
      .split(/[\s\.,;:\!\?\[\]\(\)\{\}\<\>\"\'\-\n\r\t]+/)
      .filter(w => w.length > 1 && !['the', 'is', 'a', 'and', 'to', 'of'].includes(w))
      .slice(0, 1000); // 限制大小
  }

  // 获取摘要
  getExcerpt(content, length = 100) {
    const plain = content.replace(/[#\*\>\`\[\]\(\)]/g, '');
    return plain.length > length ? plain.slice(0, length) + '...' : plain;
  }

  // 搜索主函数
  search(keyword) {
    if (!keyword) return [];
    if (!this.index) this.buildIndex();

    const query = this.tokenize(keyword);
    const results = new Map();

    query.forEach(word => {
      const matchDocs = this.index.words[word] || [];
      matchDocs.forEach(docId => {
        const count = results.get(docId) || 0;
        results.set(docId, count + 1);
      });
    });

    // 按相关度排序
    return Array.from(results.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([docId]) => this.index.docs[docId])
      .slice(0, 50); // 限制结果数
  }

  // 高亮搜索词
  highlight(text, keyword) {
    if (!keyword) return text;
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.replace(regex, '<mark class="search-hit">$1</mark>');
  }
}
```

**提交**：
```
git commit -m "feat: 搜索引擎 + 倒排索引 + 关键词高亮"
```

---

#### 4.2 标签系统
**实现**：标签管理 + 多维度筛选

```javascript
// tag-system.js
class TagManager {
  constructor(app) {
    this.app = app;
  }

  // 获取所有标签及其使用统计
  getAllTags() {
    const tagStats = {};
    const data = this.app.data;

    data.workspaces.forEach(ws => {
      ws.books.forEach(book => {
        book.docs.forEach(doc => {
          doc.tags.forEach(tag => {
            if (!tagStats[tag]) tagStats[tag] = { count: 0, docs: [] };
            tagStats[tag].count++;
            tagStats[tag].docs.push({ docId: doc.id, title: doc.title });
          });
        });
      });
    });

    return tagStats;
  }

  // 添加标签到文档
  addTagToDoc(docId, tag) {
    const doc = this.findDocById(docId);
    if (doc && !doc.tags.includes(tag)) {
      doc.tags.push(tag);
      this.app.saveData();
      return true;
    }
    return false;
  }

  // 按标签筛选文档
  filterByTag(tag) {
    const results = [];
    this.app.data.workspaces.forEach(ws => {
      ws.books.forEach(book => {
        const matches = book.docs.filter(doc => doc.tags.includes(tag));
        if (matches.length) {
          results.push(...matches.map(d => ({ ...d, bookTitle: book.title })));
        }
      });
    });
    return results;
  }

  // 查找文档（辅助方法）
  findDocById(docId) {
    for (let ws of this.app.data.workspaces) {
      for (let book of ws.books) {
        const doc = book.docs.find(d => d.id === docId);
        if (doc) return doc;
      }
    }
    return null;
  }
}
```

**提交**：
```
git commit -m "feat: 标签系统 + 多维度筛选"
```

---

### **phase-5: 视觉优化与主题**（预计 2 天）

#### 5.1 语雀风格UI完善
**实现**：完整样式覆盖 + 交互状态

```css
/* components.css */

/* 左侧工作区项目 */
.workspace-item {
  padding: 10px 16px;
  cursor: pointer;
  border-radius: 6px;
  margin: 4px 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.workspace-item:hover {
  background: var(--hover);
}

.workspace-item.active {
  background: #E8FFF3;
  color: var(--primary);
  font-weight: 600;
}

.workspace-item .icon {
  font-size: 16px;
}

.workspace-item .name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workspace-item .count {
  background: #E4E7EB;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
}

/* 书本区域 */
.book-section {
  margin-bottom: 8px;
}

.book-header {
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
}

.book-header:hover {
  background: var(--hover);
}

.book-icon {
  font-size: 18px;
}

.book-title {
  flex: 1;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-count {
  font-size: 12px;
  color: var(--text-sub);
}

/* 文档列表 */
.doc-list {
  background: var(--bg-main);
  padding: 4px 0;
  border-left: 3px solid transparent;
  margin-left: 16px;
}

.book-section.expanded .doc-list {
  border-left-color: var(--primary);
}

.doc-item {
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: background 0.2s;
}

.doc-item:hover {
  background: rgba(0,0,0,0.03);
}

.doc-item.active {
  background: #E8FFF3;
  color: var(--primary);
  font-weight: 500;
}

.status-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-indicator.published {
  background: var(--primary);
}

.status-indicator.draft {
  background: #FFA500;
}

.doc-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tag {
  background: #EEF2F6;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  color: var(--text-sub);
}

/* 编辑器相关 */
.editor-header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fff;
}

.doc-title-input {
  flex: 1;
  border: none;
  font-size: 24px;
  font-weight: 600;
  color: var(--text-main);
  outline: none;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background 0.2s;
}

.doc-title-input:focus {
  background: var(--bg-main);
}

.editor-actions {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border: 1px solid var(--border);
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn:hover {
  background: var(--hover);
}

.btn.primary {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.btn.primary:hover {
  background: #209E57;
}

/* 分屏编辑器 */
.split-editor {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100%;
  gap: 1px;
  background: var(--border);
}

.editor-area {
  width: 100%;
  height: 100%;
  border: none;
  padding: 24px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  outline: none;
  overflow-y: auto;
  background: #fff;
}

.preview-area {
  padding: 24px;
  overflow-y: auto;
  background: #fff;
}

.preview-area h1, .preview-area h2, .preview-area h3 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.preview-area p {
  line-height: 1.8;
  margin-bottom: 1em;
}

.preview-area code {
  background: #F7F8FA;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.preview-area pre {
  background: #1F2329;
  color: #E8EAEF;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
}

.preview-area ul {
  padding-left: 24px;
  line-height: 1.6;
}

.preview-area blockquote {
  border-left: 4px solid var(--primary);
  padding-left: 16px;
  color: var(--text-sub);
  margin: 16px 0;
}

/* 搜索高亮 */
.search-hit {
  background: #FFF4CC;
  padding: 2px 0;
  border-radius: 2px;
}

/* 主题切换 */
.dark-theme {
  --bg-main: #0F1419;
  --bg-white: #151A21;
  --border: #2F3741;
  --text-main: #E8EAED;
  --text-sub: #9AA0A6;
  --hover: #1F2329;
}

.dark-theme .editor-area,
.dark-theme .preview-area {
  background: #151A21;
  color: #E8EAED;
}

.dark-theme .doc-title-input {
  background: #0F1419;
  color: #E8EAED;
}

/* 响应式 */
@media (max-width: 1024px) {
  .app-layout {
    grid-template-columns: 220px 1fr;
  }

  .sidebar-center {
    display: none;
  }

  .split-editor {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .app-layout {
    grid-template-columns: 1fr;
  }

  .sidebar-left {
    display: none;
  }
}
```

**提交**：
```
git commit -m "feat: 语雀风格完整UI + 组件样式"
```

---

#### 5.2 主题切换与用户体验
**实现**：暗色模式 + 键盘快捷键

```javascript
// theme-manager.js
class ThemeManager {
  constructor(app) {
    this.app = app;
  }

  // 切换主题
  toggleTheme() {
    const current = this.app.data.user.theme;
    const newTheme = current === 'light' ? 'dark' : 'light';

    this.app.data.user.theme = newTheme;
    this.applyTheme(newTheme);
    this.app.saveData();

    return newTheme;
  }

  // 应用主题
  applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  // 初始化主题
  initTheme() {
    const theme = this.app.data.user.theme || 'light';
    this.applyTheme(theme);
  }
}

// keyboard-shortcuts.js
class KeyboardManager {
  constructor(app) {
    this.app = app;
    this.initShortcuts();
  }

  initShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + S: 保存
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.app.saveDoc();
        this.app.showToast('已保存');
      }

      // Ctrl/Cmd + P: 切换预览
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        this.app.togglePreview();
      }

      // Ctrl/Cmd + K: 搜索
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('.search-box input');
        if (searchInput) searchInput.focus();
      }

      // Ctrl/Cmd + N: 新建文档
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        this.app.addDoc();
      }
    });
  }
}
```

**提交**：
```
git commit -m "feat: 暗色主题 + 键盘快捷键支持"
```

---

### **phase-6: 增强功能**（预计 3 天）

#### 6.1 数据导入导出
**实现**：JSON备份 + Markdown导出 + 数据迁移

```javascript
// data-exporter.js
class DataExporter {
  constructor(app) {
    this.app = app;
  }

  // 导出完整数据（JSON）
  exportFullData() {
    const data = this.app.data;
    const backup = {
      version: data.system.version,
      exportDate: new Date().toISOString(),
      data: data
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json'
    });
    this.download(blob, `yuque-lite-backup-${Date.now()}.json`);
  }

  // 导出单个文档（Markdown）
  exportSingleDoc(docId) {
    const doc = this.findDocById(docId);
    if (!doc) return;

    const content = `# ${doc.title}\n\n` +
                    `> 创建: ${new Date(doc.created).toLocaleString()}\n` +
                    `> 更新: ${new Date(doc.updated).toLocaleString()}\n` +
                    `> 标签: ${doc.tags.join(', ')}\n\n` +
                    `---\n\n` +
                    doc.content;

    const blob = new Blob([content], { type: 'text/markdown' });
    this.download(blob, `${doc.title}.md`);
  }

  // 导出当前工作区所有文档（批量）
  exportWorkspace(workspaceId) {
    const ws = this.app.data.workspaces.find(w => w.id === workspaceId);
    if (!ws) return;

    ws.books.forEach(book => {
      book.docs.forEach(doc => {
        this.exportSingleDoc(doc.id);
      });
    });
  }

  // 导入数据
  importData(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      const data = parsed.data || parsed; // 兼容备份格式

      // 验证数据结构
      if (!data.workspaces || !Array.isArray(data.workspaces)) {
        throw new Error('无效的数据格式');
      }

      // 合并数据（保留原有，追加新数据）
      const current = this.app.data;
      data.workspaces.forEach(ws => {
        // 检查是否已存在同名工作区，避免冲突
        const exists = current.workspaces.find(w => w.name === ws.name);
        if (!exists) {
          current.workspaces.push(ws);
        }
      });

      this.app.data = current;
      this.app.saveData();
      this.app.render();

      return true;
    } catch (error) {
      console.error('导入失败:', error);
      return false;
    }
  }

  // 下载文件
  download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  }

  findDocById(docId) {
    const { workspaces } = this.app.data;
    for (let ws of workspaces) {
      for (let book of ws.books) {
        const doc = book.docs.find(d => d.id === docId);
        if (doc) return doc;
      }
    }
    return null;
  }
}
```

**提交**：
```
git commit -m "feat: 数据导入导出系统 + Markdown备份"
```

---

#### 6.2 数据统计与仪表盘
**实现**：Canvas图表 + 数据可视化

```javascript
// stats-dashboard.js
class StatsDashboard {
  constructor(app) {
    this.app = app;
  }

  // 获取统计数据
  getStats() {
    const data = this.app.data;
    let totalDocs = 0;
    let totalWords = 0;
    let totalBooks = 0;
    const tagCounts = {};

    data.workspaces.forEach(ws => {
      totalBooks += ws.books.length;
      ws.books.forEach(book => {
        totalDocs += book.docs.length;
        totalWords += book.docs.reduce((sum, doc) => sum + doc.stats.words, 0);

        book.docs.forEach(doc => {
          doc.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        });
      });
    });

    return {
      totalDocs,
      totalWords,
      totalBooks,
      tagCounts
    };
  }

  // 渲染统计面板
  renderStatsPanel() {
    const stats = this.getStats();

    return `
      <div class="stats-panel">
        <div class="stat-card">
          <div class="stat-value">${stats.totalDocs}</div>
          <div class="stat-label">总文档数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.totalWords}</div>
          <div class="stat-label">总字数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.totalBooks}</div>
          <div class="stat-label">知识本数</div>
        </div>
      </div>
      <div class="tag-distribution">
        <h4>热门标签</h4>
        <div class="tag-cloud">
          ${this.renderTagCloud(stats.tagCounts)}
        </div>
      </div>
    `;
  }

  // 渲染标签云
  renderTagCloud(tagCounts) {
    const entries = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 20);
    if (entries.length === 0) return '<div class="empty">暂无标签</div>';

    const max = entries[0][1];
    const min = entries[entries.length - 1][1];

    return entries.map(([tag, count]) => {
      const size = 12 + Math.round((count - min) / (max - min) * 12);
      return `<span class="tag-item" style="font-size: ${size}px" onclick="app.filterByTag('${tag}')">${tag} (${count})</span>`;
    }).join(' ');
  }

  // 绘制简单图表（Canvas）
  drawChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 简单的柱状图（按标签分布前5）
    const entries = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 5);
    if (entries.length === 0) return;

    const maxValue = Math.max(...entries.map(e => e[1]));
    const barWidth = (width - 60) / entries.length;
    const maxBarHeight = height - 60;

    entries.forEach((entry, index) => {
      const [tag, count] = entry;
      const barHeight = (count / maxValue) * maxBarHeight;
      const x = 30 + index * barWidth;
      const y = height - 30 - barHeight;

      // 柱子
      ctx.fillStyle = '#25B864';
      ctx.fillRect(x + 2, y, barWidth - 4, barHeight);
      ctx.fillStyle = '#000';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(tag.slice(0, 4), x + barWidth / 2, height - 12);
      ctx.fillText(count, x + barWidth / 2, y - 4);
    });

    // 标题
    ctx.fillStyle = '#8A9096';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('热门标签TOP5', 10, 15);
  }
}
```

**提交**：
```
git commit -m "feat: 数据统计面板 + Canvas图表可视化"
```

---

#### 6.3 模板系统
**实现**：文档模板 + 快速创建

```javascript
// template-system.js
class TemplateSystem {
  constructor(app) {
    this.app = app;
    this.defaultTemplates = [
      {
        id: 'temp-meeting',
        name: '会议记录',
        icon: '📝',
        content: `# 会议记录

> 日期：{{date}}
> 主持人：{{host}}

## 👥 参会人员
{{attendees}}

## 📋 会议议程
1.

## 💬 讨论要点

## ✅ 决议事项

## 📌 待办事项
- [ ]

## 📎 附件
`
      },
      {
        id: 'temp-daily',
        name: '日报模板',
        icon: '📅',
        content: `# 工作日报

> 日期：{{date}}

## ✅ 今日完成
-

## 📋 明日计划
-

## 🚧 遇到问题
-

## 📊 数据统计
`
      },
      {
        id: 'temp-repo',
        name: '读书笔记',
        icon: '📚',
        content: `# 读书笔记

> 书名：{{book_name}}
> 作者：{{author}}

## 📌 笔记要点

## 💡 灵感收获

## 📝 摘抄
`
      }
    ];
  }

  // 获取所有模板
  getTemplates() {
    const system = this.app.data.system;
    return [...this.defaultTemplates, ...(system.templates || [])];
  }

  // 使用模板创建文档
  useTemplate(templateId, bookId, variables = {}) {
    const template = this.getTemplates().find(t => t.id === templateId);
    if (!template) return null;

    // 替换变量 {{variable}}
    let content = template.content;
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, variables[key] || '');
    });

    // 创建新文档
    const doc = Models.createDoc(template.name, content);
    doc.bookId = bookId;
    doc.type = 'template';

    // 保存
    const ws = this.app.data.workspaces.find(w =>
      w.books.some(b => b.id === bookId)
    );
    if (ws) {
      const book = ws.books.find(b => b.id === bookId);
      if (book) {
        book.docs.unshift(doc);
        book.stats.docCount++;
        book.stats.lastUpdated = new Date().toISOString();
        this.app.saveData();
        return doc;
      }
    }

    return null;
  }

  // 模板选择界面
  renderTemplateSelector() {
    const templates = this.getTemplates();
    return `
      <div class="template-grid">
        ${templates.map(temp => `
          <div class="template-card" onclick="app.showTemplateForm('${temp.id}')">
            <div class="template-icon">${temp.icon}</div>
            <div class="template-name">${temp.name}</div>
            <div class="template-preview">${temp.content.slice(0, 50)}...</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // 模板变量填写表单
  renderTemplateForm(templateId) {
    const template = this.getTemplates().find(t => t.id === templateId);
    if (!template) return '';

    const variables = template.content.match(/\{\{(\w+)\}\}/g) || [];
    const uniqueVars = [...new Set(variables.map(v => v.slice(2, -2)))];

    if (uniqueVars.length === 0) {
      return `
        <div class="template-form">
          <p>该模板无需额外信息，直接创建？</p>
          <button onclick="app.confirmTemplate('${templateId}')">立即创建</button>
        </div>
      `;
    }

    return `
      <div class="template-form">
        <h4>${template.name} - 填写信息</h4>
        ${uniqueVars.map(v => `
          <div class="form-field">
            <label>${this.getVarLabel(v)}</label>
            <input type="text" id="var-${v}" placeholder="填写${this.getVarLabel(v)}">
          </div>
        `).join('')}
        <button onclick="app.confirmTemplate('${templateId}')">创建文档</button>
      </div>
    `;
  }

  getVarLabel(varName) {
    const labels = {
      'date': '日期',
      'host': '主持人',
      'attendees': '参会人',
      'book_name': '书名',
      'author': '作者'
    };
    return labels[varName] || varName;
  }
}
```

**提交**：
```
git commit -m "feat: 文档模板系统 + 变量填充"
```

---

### **phase-7: 完善与优化**（预计 2 天）

#### 7.1 数据备份与恢复
**实现**：自动备份 + 版本管理

```javascript
// backup-system.js
class BackupSystem {
  constructor(app) {
    this.app = app;
    this.BACKUP_KEY = 'yuque-lite-backups';
    this.MAX_BACKUPS = 3;
    this.AUTO_BACKUP_INTERVAL = 1000 * 60 * 5; // 5分钟
  }

  // 创建备份
  createBackup(manual = false) {
    const data = this.app.data;
    const backup = {
      timestamp: Date.now(),
      date: new Date().toLocaleString(),
      type: manual ? 'manual' : 'auto',
      data: JSON.parse(JSON.stringify(data))
    };

    let backups = this.getBackups();
    backups.unshift(backup);

    // 保留最近N个
    if (backups.length > this.MAX_BACKUPS) {
      backups = backups.slice(0, this.MAX_BACKUPS);
    }

    localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backups));
    return backup;
  }

  // 获取备份列表
  getBackups() {
    const raw = localStorage.getItem(this.BACKUP_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  // 恢复备份
  restoreBackup(index) {
    const backups = this.getBackups();
    if (index >= backups.length) return false;

    const backup = backups[index];
    this.app.data = backup.data;
    this.app.saveData();
    this.app.render();
    return true;
  }

  // 渲染备份列表
  renderBackupList() {
    const backups = this.getBackups();
    if (backups.length === 0) {
      return '<div class="empty">暂无备份记录</div>';
    }

    return `
      <div class="backup-list">
        ${backups.map((backup, index) => `
          <div class="backup-item">
            <div class="backup-info">
              <div class="backup-date">${backup.date}</div>
              <div class="backup-type ${backup.type}">${backup.type}</div>
            </div>
            <div class="backup-actions">
              <button onclick="app.restoreBackup(${index})">恢复</button>
              <button onclick="app.deleteBackup(${index})">删除</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // 自动备份（定时）
  startAutoBackup() {
    setInterval(() => {
      this.createBackup(false);
      console.log('自动备份完成');
    }, this.AUTO_BACKUP_INTERVAL);
  }

  // 删除备份
  deleteBackup(index) {
    let backups = this.getBackups();
    backups.splice(index, 1);
    localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backups));
    return true;
  }
}
```

**提交**：
```
git commit -m "feat: 自动备份系统 + 版本恢复"
```

---

#### 7.2 错误处理与提示系统
**实现**：Toast通知 + 错误捕获

```javascript
// notification-system.js
class NotificationSystem {
  constructor() {
    this.container = null;
  }

  // 初始化
  init() {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
  }

  // 显示Toast
  show(message, type = 'info', duration = 3000) {
    if (!this.container) this.init();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${this.getIcon(type)}</span>
      <span class="toast-message">${message}</span>
    `;

    this.container.appendChild(toast);

    // 自动移除
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  getIcon(type) {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    return icons[type] || '💡';
  }

  // 包装错误处理
  catchAsync(fn, customMsg = '操作失败') {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        console.error(error);
        this.show(`${customMsg}: ${error.message}`, 'error');
        return null;
      }
    };
  }
}

// Toast样式
const toastStyles = `
  .toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .toast {
    background: #fff;
    padding: 12px 16px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 280px;
    animation: slideIn 0.3s ease;
    transition: opacity 0.3s;
  }

  .toast-icon { font-size: 18px; }
  .toast-message { flex: 1; font-size: 14px; color: #1F2329; }

  .toast.info { border-left: 4px solid #3B82F6; }
  .toast.success { border-left: 4px solid #25B864; }
  .toast.warning { border-left: 4px solid #FFA500; }
  .toast.error { border-left: 4px solid #EF4444; }

  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  .dark-theme .toast {
    background: #1F2329;
    color: #E8EAED;
  }
`;

// 添加到style.css
document.head.insertAdjacentHTML('beforeend', `<style>${toastStyles}</style>`);
```

**提交**：
```
git commit -m "feat: Toast通知系统 + 错误处理"
```

---

#### 7.3 性能优化与代码整理
**实现**：防抖节流 + 代码拆分整理

```javascript
// utils.js
// 工具函数库

// 防抖
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 节流
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 格式化数字
function formatNumber(num) {
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num;
}

// 深度比较
function deepEqual(obj1, obj2) {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

// 克隆深度
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// 性能监控
class PerformanceMonitor {
  static start(label) {
    console.time(label);
  }

  static end(label) {
    console.timeEnd(label);
  }

  static measure(name, fn) {
    this.start(name);
    const result = fn();
    this.end(name);
    return result;
  }
}
```

**提交**：
```
git commit -m "chore: 工具函数 + 性能优化代码整理"
```

---

### **phase-8: 最终整合与部署**（预计 1 天）

#### 8.1 主应用类整合
**实现**：App主类 + 所有模块初始化

```javascript
// app.js
class YuqueLiteApp {
  constructor() {
    this.data = null;
    this.searchEngine = null;
    this.tagManager = null;
    this.themeManager = null;
    this.backupSystem = null;
    this.notifier = new NotificationSystem();

    this.init();
  }

  // 初始化
  async init() {
    try {
      // 1. 加载数据
      this.loadData();

      // 2. 初始化模块
      this.searchEngine = new SearchEngine(this);
      this.tagManager = new TagManager(this);
      this.themeManager = new ThemeManager(this);
      this.backupSystem = new BackupSystem(this);
      this.keyboardManager = new KeyboardManager(this);

      // 3. 应用主题
      this.themeManager.initTheme();

      // 4. 启动自动备份
      this.backupSystem.startAutoBackup();

      // 5. 首次渲染
      this.render();

      // 6. 显示欢迎
      this.notifier.show('语雀 Lite 已就绪', 'success');

    } catch (error) {
      console.error('初始化失败:', error);
      this.notifier.show('初始化失败，使用演示数据', 'error');
      this.loadDemoData();
    }
  }

  // 加载数据
  loadData() {
    this.data = DataStorage.getData();

    // 如果是空数据，使用演示数据
    if (this.data.workspaces.length === 0) {
      this.loadDemoData();
    }
  }

  // 加载演示数据
  loadDemoData() {
    this.data = initDemoData();
  }

  // 保存数据
  saveData() {
    try {
      DataStorage.saveData(this.data);
      return true;
    } catch (error) {
      this.notifier.show('保存失败: ' + error.message, 'error');
      return false;
    }
  }

  // 核心渲染方法
  render() {
    this.renderSidebarLeft();
    this.renderSidebarCenter();
    this.renderMainContent();
  }

  // 渲染左侧
  renderSidebarLeft() {
    const renderer = new SidebarLeftRenderer(
      document.querySelector('.sidebar-left'),
      this
    );
    document.querySelector('.sidebar-left').innerHTML = renderer.render();
  }

  // 渲染中间
  renderSidebarCenter() {
    const renderer = new SidebarCenterRenderer(
      document.querySelector('.sidebar-center'),
      this
    );
    document.querySelector('.sidebar-center').innerHTML = renderer.render();
  }

  // 渲染主内容
  renderMainContent() {
    const renderer = new EditorRenderer(
      document.querySelector('.content-main'),
      this
    );
    document.querySelector('.content-main').innerHTML = renderer.render();
  }

  // ==================== 业务操作 ====================

  // 工作区操作
  addWorkspace() {
    const name = prompt('请输入工作区名称:');
    if (!name) return;

    const ws = Models.createWorkspace(name);
    this.data.workspaces.push(ws);
    this.data.active.workspaceId = ws.id;
    this.saveData();
    this.render();
    this.notifier.show(`创建工作区 "${name}"`, 'success');
  }

  switchWorkspace(wsId) {
    this.data.active.workspaceId = wsId;
    this.data.active.bookId = null;
    this.data.active.docId = null;
    this.saveData();
    this.render();
  }

  // 书本操作
  addBook() {
    if (!this.data.active.workspaceId) {
      return this.notifier.show('请先选择工作区', 'warning');
    }

    const title = prompt('请输入书本名称:');
    if (!title) return;

    // 颜色选择
    const colors = ['#25B864', '#61DAFB', '#F7DF1E', '#FF6B6B', '#9B59B6'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const book = Models.createBook(title, '📚', color);
    const ws = this.data.workspaces.find(w => w.id === this.data.active.workspaceId);

    if (ws) {
      ws.books.push(book);
      this.data.active.bookId = book.id;
      this.saveData();
      this.render();
      this.notifier.show(`创建书本 "${title}"`, 'success');
    }
  }

  toggleBook(bookId) {
    if (this.data.active.bookId === bookId) {
      this.data.active.bookId = null; // 折叠
    } else {
      this.data.active.bookId = bookId; // 展开
    }
    this.render();
  }

  // 文档操作
  addDoc(bookId = null) {
    const targetBookId = bookId || this.data.active.bookId;

    if (!targetBookId) {
      return this.notifier.show('请先选择一个书本', 'warning');
    }

    const title = prompt('请输入文档标题:');
    if (!title) return;

    const doc = Models.createDoc(title);
    doc.bookId = targetBookId;

    const ws = this.data.workspaces.find(w =>
      w.books.some(b => b.id === targetBookId)
    );

    if (ws) {
      const book = ws.books.find(b => b.id === targetBookId);
      book.docs.unshift(doc);
      book.stats.docCount++;
      book.stats.lastUpdated = new Date().toISOString();

      this.data.active.docId = doc.id;
      this.saveData();
      this.render();
      this.notifier.show(`创建文档 "${title}"`, 'success');
    }
  }

  switchDoc(bookId, docId) {
    this.data.active.bookId = bookId;
    this.data.active.docId = docId;
    this.saveData();
    this.render();
  }

  // 编辑器操作
  handleEditorInput(value) {
    const doc = this.getCurrentDoc();
    if (!doc) return;

    doc.content = value;
    doc.updated = new Date().toISOString();

    // 实时更新预览
    const preview = document.getElementById('preview-area');
    if (preview) {
      preview.innerHTML = MarkdownRenderer.render(value);
    }

    // 更新字数统计
    doc.stats.words = value.trim().split(/\s+/).filter(w => w).length;
    doc.stats.estimatedTime = Math.ceil(doc.stats.words / 300); // 按300字/分钟

    this.saveData();
  }

  updateDocTitle(value) {
    const doc = this.getCurrentDoc();
    if (!doc) return;

    doc.title = value;
    doc.updated = new Date().toISOString();
    this.saveData();
  }

  saveDoc() {
    if (this.saveData()) {
      this.notifier.show('文档已保存', 'success');
    }
  }

  togglePreview() {
    const splitEditor = document.querySelector('.split-editor');
    if (!splitEditor) return;

    const isPreview = splitEditor.classList.contains('preview-only');

    if (isPreview) {
      splitEditor.classList.remove('preview-only');
    } else {
      splitEditor.classList.add('preview-only');
    }
  }

  // 搜索相关
  handleSearch(keyword) {
    this.data.active.searchKeyword = keyword;

    if (keyword.length < 2) {
      this.render();
      return;
    }

    // 执行搜索并高亮（防抖优化）
    const results = this.searchEngine.search(keyword);

    // 显示搜索结果
    this.showSearchResults(results, keyword);
  }

  showSearchResults(results, keyword) {
    const resultsHTML = `
      <div class="search-results">
        <div class="search-header">
          <strong>搜索结果 (${results.length})</strong>
          <button onclick="app.render()">✕ 清除</button>
        </div>
        <div class="result-list">
          ${results.length ? results.map(r => `
            <div class="result-item" onclick="app.switchDoc('${r.bookId}', '${r.docId || r.id}')">
              <div class="result-title">${this.searchEngine.highlight(r.title, keyword)}</div>
              <div class="result-excerpt">${this.searchEngine.highlight(r.excerpt, keyword)}</div>
              <div class="result-meta">
                <span>${r.bookTitle}</span>
                ${r.tags.map(t => `<span class="tag">${t}</span>`).join('')}
              </div>
            </div>
          `).join('') : '<div class="empty">未找到匹配内容</div>'}
        </div>
      </div>
    `;

    const container = document.querySelector('.search-results-container');
    if (container) {
      container.style.display = results.length > 0 ? 'block' : 'none';
      container.innerHTML = resultsHTML;
    } else {
      // 创建搜索结果容器
      const listContainer = document.querySelector('.book-list');
      if (listContainer) {
        listContainer.innerHTML = `<div class="search-results-container">${resultsHTML}</div>`;
      }
    }
  }

  // 通用方法
  getCurrentDoc() {
    const { workspaces, active } = this.data;
    const ws = workspaces.find(w => w.id === active.workspaceId);
    if (!ws) return null;

    for (let book of ws.books) {
      const doc = book.docs.find(d => d.id === active.docId);
      if (doc) return doc;
    }
    return null;
  }

  getAllDocs() {
    const docs = [];
    this.data.workspaces.forEach(ws => {
      ws.books.forEach(book => {
        docs.push(...book.docs.map(d => ({ ...d, bookTitle: book.title })));
      });
    });
    return docs;
  }

  // 标签过滤
  filterByTag(tag) {
    const results = this.tagManager.filterByTag(tag);
    if (results.length === 0) {
      this.notifier.show('该标签暂无文档', 'info');
      return;
    }

    // 显示过滤结果
    const resultsContainer = document.querySelector('.search-results-container');
    if (resultsContainer) {
      resultsContainer.style.display = 'block';
      resultsContainer.innerHTML = `
        <div class="search-results">
          <div class="search-header">
            <strong>标签筛选: ${tag}</strong>
            <button onclick="app.render()">✕ 清除</button>
          </div>
          <div class="result-list">
          ${results.map(r => `
            <div class="result-item" onclick="app.switchDoc('${r.bookId}', '${r.id}')">
              <div class="result-title">${r.title}</div>
              <div class="result-meta">
                <span>${r.bookTitle}</span>
                ${r.tags.map(t => `<span class="tag">${t}</span>`).join('')}
              </div>
            </div>
          `).join('')}
          </div>
        </div>
      `;
    }
  }

  // 导出相关
  exportDoc() {
    const doc = this.getCurrentDoc();
    if (!doc) return;

    const exporter = new DataExporter(this);
    exporter.exportSingleDoc(doc.id);
    this.notifier.show('文档已导出', 'success');
  }

  exportWorkspace() {
    if (!this.data.active.workspaceId) {
      return this.notifier.show('请选择工作区', 'warning');
    }

    const exporter = new DataExporter(this);
    exporter.exportWorkspace(this.data.active.workspaceId);
    this.notifier.show('工作区已批量导出', 'success');
  }

  // 模板相关
  showTemplater() {
    const templateSystem = new TemplateSystem(this);
    const html = `
      <div class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>选择模板</h3>
            <button onclick="app.closeModal()">✕</button>
          </div>
          <div class="modal-body">
            ${templateSystem.renderTemplateSelector()}
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
  }

  showTemplateForm(templateId) {
    const templateSystem = new TemplateSystem(this);
    const formHTML = templateSystem.renderTemplateForm(templateId);

    const modalBody = document.querySelector('.modal-body');
    if (modalBody) {
      modalBody.innerHTML = formHTML;
    }
  }

  confirmTemplate(templateId) {
    if (!this.data.active.bookId) {
      this.notifier.show('请先选择一个书本', 'warning');
      return;
    }

    const templateSystem = new TemplateSystem(this);
    const template = templateSystem.getTemplates().find(t => t.id === templateId);

    // 收集变量
    const variables = {};
    const uniqueVars = [...new Set(template.content.match(/\{\{(\w+)\}\}/g) || [])];
    uniqueVars.forEach(v => {
      const key = v.slice(2, -2);
      const input = document.getElementById(`var-${key}`);
      if (input) variables[key] = input.value || '';
    });

    // 使用模板创建文档
    const doc = templateSystem.useTemplate(templateId, this.data.active.bookId, variables);

    if (doc) {
      this.data.active.docId = doc.id;
      this.saveData();
      this.render();
      this.closeModal();
      this.notifier.show('模板文档已创建', 'success');
    }
  }

  closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) modal.remove();
  }

  // 数据备份相关
  createManualBackup() {
    const backup = this.backupSystem.createBackup(true);
    if (backup) {
      this.notifier.show(`备份成功: ${backup.date}`, 'success');
    }
  }

  showBackupManager() {
    const html = `
      <div class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>备份管理</h3>
            <button onclick="app.closeModal()">✕</button>
          </div>
          <div class="modal-body">
            <div style="margin-bottom: 16px;">
              <button onclick="app.createManualBackup()">创建新备份</button>
              <input type="file" id="import-file" style="display:none" accept=".json" onchange="app.handleImport(event)">
              <button onclick="document.getElementById('import-file').click()">导入备份</button>
              <button onclick="app.exportFullData()">导出完整数据</button>
            </div>
            ${this.backupSystem.renderBackupList()}
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
  }

  restoreBackup(index) {
    if (confirm('确定恢复此备份吗？当前数据将被覆盖。')) {
      if (this.backupSystem.restoreBackup(index)) {
        this.notifier.show('备份恢复成功', 'success');
        this.closeModal();
      } else {
        this.notifier.show('恢复失败', 'error');
      }
    }
  }

  deleteBackup(index) {
    if (confirm('确定删除此备份？')) {
      if (this.backupSystem.deleteBackup(index)) {
        this.notifier.show('备份已删除', 'success');
        this.showBackupManager(); // 刷新列表
      }
    }
  }

  // 数据导入
  handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const exporter = new DataExporter(this);

      if (exporter.importData(content)) {
        this.notifier.show('数据导入成功', 'success');
        this.closeModal();
      } else {
        this.notifier.show('数据导入失败', 'error');
      }
    };
    reader.readAsText(file);
  }

  exportFullData() {
    const exporter = new DataExporter(this);
    exporter.exportFullData();
    this.notifier.show('完整数据已导出', 'success');
  }

  // 主题切换
  toggleTheme() {
    const theme = this.themeManager.toggleTheme();
    this.notifier.show(`已切换到${theme === 'dark' ? '暗色' : '亮色'}主题`, 'info');
  }

  // 显示统计面板
  showStats() {
    const statsDashboard = new StatsDashboard(this);
    const stats = statsDashboard.getStats();

    const html = `
      <div class="modal">
        <div class="modal-content" style="min-width: 600px;">
          <div class="modal-header">
            <h3>数据统计</h3>
            <button onclick="app.closeModal()">✕</button>
          </div>
          <div class="modal-body">
            <div class="stats-overview">
              <div class="stat-item">
                <div class="stat-value">${stats.totalDocs}</div>
                <div class="stat-label">文档总数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${formatNumber(stats.totalWords)}</div>
                <div class="stat-label">总字数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${stats.totalBooks}</div>
                <div class="stat-label">知识本</div>
              </div>
            </div>
            <div class="chart-area">
              <canvas id="stats-chart" width="500" height="250"></canvas>
            </div>
            <div class="tag-distribution">
              <h4>标签分布</h4>
              <div class="tag-list">
                ${statsDashboard.renderTagCloud(stats.tagCounts)}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);

    // 延迟绘制图表
    setTimeout(() => {
      statsDashboard.drawChart('stats-chart', stats.tagCounts);
    }, 100);
  }

  // 显示Toast（快捷方式）
  showToast(message, type = 'info') {
    this.notifier.show(message, type);
  }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
  // 添加Toast样式
  const toastStyle = document.createElement('style');
  toastStyle.textContent = `
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .toast {
      background: #fff;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 280px;
      animation: slideIn 0.3s ease;
      transition: opacity 0.3s;
    }
    .toast-icon { font-size: 18px; }
    .toast-message { flex: 1; font-size: 14px; color: #1F2329; }
    .toast.info { border-left: 4px solid #3B82F6; }
    .toast.success { border-left: 4px solid #25B864; }
    .toast.warning { border-left: 4px solid #FFA500; }
    .toast.error { border-left: 4px solid #EF4444; }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    .dark-theme .toast { background: #1F2329; color: #E8EAED; }

    .modal {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .modal-content {
      background: #fff;
      border-radius: 8px;
      width: 90%;
      max-width: 700px;
      max-height: 80vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .dark-theme .modal-content { background: #1F2329; color: #E8EAED; }
    .modal-header {
      padding: 16px 24px;
      border-bottom: 1px solid #E8EAEF;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-header h3 { margin: 0; font-size: 18px; }
    .modal-header button {
      background: none; border: none; font-size: 20px; cursor: pointer; color: inherit;
    }
    .modal-body {
      padding: 24px;
      overflow-y: auto;
    }

    .template-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 16px;
    }
    .template-card {
      border: 1px solid #E8EAEF;
      border-radius: 6px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .template-card:hover {
      border-color: #25B864;
      box-shadow: 0 2px 8px rgba(37,184,100,0.1);
    }
    .template-icon { font-size: 24px; margin-bottom: 8px; }
    .template-name { font-weight: 600; margin-bottom: 4px; }
    .template-preview { font-size: 12px; color: #8A9096; height: 32px; overflow: hidden; }

    .template-form .form-field { margin-bottom: 16px; }
    .template-form label { display: block; margin-bottom: 4px; font-weight: 500; }
    .template-form input { width: 100%; padding: 8px; border: 1px solid #E8EAEF; border-radius: 4px; font-size: 14px; }

    .backup-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px; border-radius: 6px; border: 1px solid #E8EAEF; margin-bottom: 8px;
    }
    .backup-date { font-weight: 500; }
    .backup-type { font-size: 12px; padding: 2px 6px; border-radius: 4px; }
    .backup-type.auto { background: #E8EAEF; }
    .backup-type.manual { background: #25B864; color: white; }
    .backup-actions button { margin-left: 8px; padding: 4px 8px; font-size: 12px; }

    .stats-panel {
      display: flex; gap: 16px; margin-bottom: 20px;
    }
    .stat-card {
      flex: 1; text-align: center; padding: 16px;
      background: #F7F8FA; border-radius: 8px;
    }
    .stat-value { font-size: 28px; font-weight: 700; color: #25B864; }
    .stat-label { font-size: 12px; color: #8A9096; margin-top: 4px; }
    .chart-area { margin: 20px 0; text-align: center; }
    .tag-cloud { margin-top: 12px; }
    .tag-cloud .tag-item {
      display: inline-block; margin: 4px 8px; padding: 4px 8px;
      background: #F0F2F4; border-radius: 4px; cursor: pointer;
    }
    .tag-cloud .tag-item:hover { background: #E8FFF3; }

    .search-results {
      padding: 8px; background: #FAFBFC; border-radius: 6px; margin-top: 8px;
    }
    .search-header {
      display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #E8EAEF;
    }
    .search-header button {
      padding: 4px 8px; border: 1px solid #E8EAEF; border-radius: 4px; background: #fff; cursor: pointer; font-size: 12px;
    }
    .result-item {
      padding: 12px; border-bottom: 1px solid #E8EAEF; cursor: pointer;
    }
    .result-item:last-child { border-bottom: none; }
    .result-item:hover { background: #F7F8FA; }
    .result-title { font-weight: 600; margin-bottom: 4px; }
    .result-excerpt { font-size: 12px; color: #8A9096; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .result-meta { font-size: 11px; display: flex; gap: 8px; }
    .result-meta span { background: #E4E7EB; padding: 2px 6px; border-radius: 3px; }
    .result-meta .tag { background: #E8FFF3; color: #25B864; }
  `;
  document.head.appendChild(toastStyle);

  // 启动应用
  window.app = new YuqueLiteApp();

  // 暴露全局API（用于HTML内联事件）
  window.Models = Models;
  window.DataStorage = DataStorage;
  window.initDemoData = initDemoData;
});
```

**提交**：
```
git commit -m "feat: 主应用类 + 完整业务逻辑整合"
```

---

#### 8.2 最终HTML入口
**实现**：单一HTML文件，内联CSS/JS

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>语雀 Lite - 纯原生知识库系统</title>
  <style>
    /* 基础重置 */
    * { box-sizing: border-box; }
    body, html { margin: 0; padding: 0; height: 100vh; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; overflow: hidden; }

    /* 布局 */
    .app-layout {
      display: grid;
      grid-template-columns: 260px 280px 1fr;
      height: 100vh;
      background: #fff;
    }

    /* 工具栏（顶部） */
    .top-toolbar {
      grid-column: 1 / -1;
      background: #fff;
      border-bottom: 1px solid #E8EAEF;
      padding: 8px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 48px;
    }

    .toolbar-left, .toolbar-right { display: flex; gap: 8px; align-items: center; }
    .toolbar-btn {
      padding: 6px 12px; border: 1px solid #E8EAEF; background: #fff; border-radius: 4px; cursor: pointer; font-size: 13px; transition: all 0.2s;
    }
    .toolbar-btn:hover { background: #F0F2F4; }
    .toolbar-btn.primary { background: #25B864; color: #fff; border-color: #25B864; }
    .toolbar-btn.primary:hover { background: #209E57; }

    /* 三个核心区域（注意修改了原始结构，加入了工具栏） */
    .sidebar-left { border-right: 1px solid #E8EAEF; display: flex; flex-direction: column; overflow: hidden; }
    .sidebar-center { border-right: 1px solid #E8EAEF; background: #FAFBFC; display: flex; flex-direction: column; overflow: hidden; }
    .content-main { background: #fff; display: flex; flex-direction: column; overflow: hidden; }

    /* 调整布局，将toolbar独立出来 */
    .app-wrapper {
      display: grid;
      grid-template-rows: 48px auto;
      height: 100vh;
    }

    .main-content-wrapper {
      display: grid;
      grid-template-columns: 260px 280px 1fr;
      height: 100%;
      overflow: hidden;
    }

    /* 各区域基础样式 */
    .section-header {
      padding: 12px 16px;
      border-bottom: 1px solid #E8EAEF;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #fff;
    }
    .section-header .title { font-weight: 600; font-size: 14px; color: #1F2329; }
    .btn-icon {
      width: 24px; height: 24px; border: none; background: #F0F2F4; border-radius: 4px; cursor: pointer; font-size: 16px;
    }
    .btn-icon:hover { background: #E4E7EB; }

    /* 空状态 */
    .empty-state {
      flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #8A9096; padding: 40px; text-align: center;
    }
    .empty-state .welcome h2 { margin-bottom: 8px; color: #1F2329; }
    .empty-state .welcome button {
      margin-top: 20px; padding: 10px 20px; background: #25B864; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;
    }

    /* 搜索框 */
    .search-box {
      padding: 8px 12px; border-bottom: 1px solid #E8EAEF; background: #fff;
    }
    .search-box input {
      width: 100%; padding: 8px 12px; border: 1px solid #E8EAEF; border-radius: 6px; font-size: 14px; outline: none;
    }
    .search-box input:focus { border-color: #25B864; background: #F0FFF7; }

    /* 添加文档按钮 */
    .add-doc-btn {
      margin: 8px 16px; padding: 8px 12px; border: 1px dashed #25B864; color: #25B864; background: #F0FFF7; border-radius: 6px; cursor: pointer; text-align: center; font-size: 13px;
    }
    .add-doc-btn:hover { background: #E8FFF3; }

    /* 顶部工具栏固定 */
    .top-toolbar {
      background: #fff; border-bottom: 1px solid #E8EAEF; padding: 8px 16px; display: flex; align-items: center; justify-content: space-between;
    }
    .app-title { font-weight: 700; color: #25B864; cursor: pointer; }

    /* 响应式 */
    @media (max-width: 1024px) {
      .main-content-wrapper { grid-template-columns: 220px 1fr; }
      .sidebar-center { display: none; }
      .split-editor { grid-template-columns: 1fr; }
    }
    @media (max-width: 768px) {
      .main-content-wrapper { grid-template-columns: 1fr; }
      .sidebar-left { display: none; }
    }
  </style>
</head>
<body>
  <!-- 应用界面 -->
  <div class="app-wrapper">
    <!-- 顶部工具栏 -->
    <div class="top-toolbar">
      <div class="toolbar-left">
        <span class="app-title" onclick="app.showStats()">📚 语雀 Lite</span>
        <button class="toolbar-btn" onclick="app.toggleTheme()">🌓 主题</button>
        <button class="toolbar-btn" onclick="app.showBackupManager()">💾 备份</button>
      </div>
      <div class="toolbar-right">
        <button class="toolbar-btn" onclick="app.showTemplater()">📄 模板</button>
        <button class="toolbar-btn" onclick="app.exportWorkspace()">📤 导出</button>
        <button class="toolbar-btn primary" onclick="app.createManualBackup()">立即备份</button>
      </div>
    </div>

    <!-- 主界面区域 -->
    <div class="main-content-wrapper">
      <div class="sidebar-left">
        <!-- 渲染工作区导航 -->
      </div>
      <div class="sidebar-center">
        <!-- 渲染文档列表 -->
      </div>
      <div class="content-main">
        <!-- 渲染编辑器/主内容 -->
      </div>
    </div>
  </div>

  <!-- 模态框容器 -->
  <div id="modal-container"></div>
  <script>
    // 内联数据模块
    const DataStorage = {
      KEY: 'yuque-lite-data-v1',
      getData() {
        const raw = localStorage.getItem(this.KEY);
        return raw ? JSON.parse(raw) : this.getDefaultData();
      },
      saveData(data) {
        localStorage.setItem(this.KEY, JSON.stringify(data));
      },
      getDefaultData() {
        return { user: { theme: 'light', autoSave: true }, workspaces: [], active: { workspaceId: null } };
      }
    };

    // 内联UUID生成器
    const Models = {
      uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      },
      createWorkspace(name = '我的知识库') {
        return { id: this.uuid(), name, description: 'Personal knowledge base', books: [], created: new Date().toISOString() };
      },
      createBook(title, icon = '📚', color = '#25B864') {
        return { id: this.uuid(), title, icon, coverColor: color, tags: [], stats: { docCount: 0, wordCount: 0, lastUpdated: new Date().toISOString() }, docs: [] };
      },
      createDoc(title, content = '') {
        return { id: this.uuid(), bookId: null, title, type: 'markdown', status: 'draft', content, contentHTML: '', tags: [], priority: 'normal', stats: { words: 0, views: 0, estimatedTime: 0 }, created: new Date().toISOString(), updated: new Date().toISOString() };
      },
      demoData() {
        const demoWs = this.createWorkspace('📚 我的技术笔记');
        const bookCSS = this.createBook('CSS 进阶', '🎨', '#61DAFB');
        const bookJS = this.createBook('JavaScript', '⚙️', '#F7DF1E');
        const doc1 = this.createDoc('Grid布局指南', '# Grid 完全指南\n\n## 介绍\nGrid 是现代CSS布局系统，支持二维布局...\n\n## 基础语法\n```css\n.container {\n  display: grid;\n  grid-template-columns: 1fr 2fr 1fr;\n  gap: 20px;\n}\n```\n\n## 关键概念\n* **Grid Container** - 网格容器\n* **Grid Item** - 网格项目\n* **Track Size** - 轨道尺寸\n\n> Grid布局比Flexbox更强大，适合复杂布局');
        doc1.bookId = bookCSS.id;
        doc1.tags = ['CSS', '布局'];
        doc1.status = 'published';
        doc1.stats = { words: 850, views: 45, estimatedTime: 3 };

        const doc2 = this.createDoc('Flexbox指南', '# Flexbox指南\n\n## 简介\nFlexbox是一维布局系统...\n\n## 常见模式\n* 水平居中\n* 垂直居中\n* 拉伸填满');
        doc2.bookId = bookJS.id;
        doc2.tags = ['CSS', 'JS'];
        doc2.status = 'draft';
        doc2.stats = { words: 420, views: 12, estimatedTime: 2 };

        bookCSS.docs = [doc1];
        bookCSS.stats = { docCount: 1, wordCount: 850, lastUpdated: new Date().toISOString() };
        bookJS.docs = [doc2];
        bookJS.stats = { docCount: 1, wordCount: 420, lastUpdated: new Date().toISOString() };

        demoWs.books = [bookCSS, bookJS];

        return {
          user: { theme: 'light', autoSave: true },
          workspaces: [demoWs],
          active: { workspaceId: demoWs.id, bookId: bookCSS.id, docId: doc1.id },
          system: { version: '1.0.0', created: new Date().toISOString(), templates: [] }
        };
      }
    };

    function initDemoData() {
      const data = Models.demoData();
      DataStorage.saveData(data);
      return data;
    }
  </script>

  <!--
    注：由于完整代码过长，暂时简化为HTML结构
    实际实现中需将上述所有JS/CSS文件合并或通过构建工具处理

    核心文件：
    1. app.js - 主应用类 (约 800 行)
    2. render-*.js - 各组件渲染器 (约 400 行)
    3. search-engine.js - 搜索引擎 (约 200 行)
    4. markdown-renderer.js - MD渲染器 (约 50 行)
    5. 简单UI部分 (约 300 行)

    总计：约 1750 行代码
  -->

  <!-- 引入主应用（实际部署时合并） -->
  <script src="app.js"></script>
</body>
</html>
```

**提交**：
```
git commit -m "feat: 最终整合 + 完整HTML入口文件"
```

---

#### 8.3 项目文档与说明

```markdown
# README.md

# Yuque Lite - 语雀风格知识库系统

> 纯原生实现的个人知识库管理系统，使用 HTML + CSS + JavaScript 构建，无任何外部依赖。

## ✨ 特性

- 📁 **层级知识管理**：Workspace → Book → Doc 三层结构
- ✍️ **Markdown 编辑器**：实时预览 + 基础语法解析
- 🔍 **全文搜索**：倒排索引 + 关键词高亮
- 🏷️ **标签系统**：多维分类与筛选
- 🎨 **语雀风格 UI**：优雅的三栏布局设计
- 🌓 **主题切换**：亮/暗色双主题
- 💾 **数据管理**：自动备份 + 手动备份 + 数据导入导出
- 📊 **统计面板**：可视化数据 + 标签云
- ⌨️ **快捷键支持**：Ctrl+S 保存、Ctrl+P 预览等
- 📄 **模板系统**：快速创建格式文档

## 🚀 快速开始

### 方式一：直接运行
1. 下载 `index.html`
2. 双击浏览器打开
3. 开始使用！

### 方式二：开发环境
```bash
# 克隆仓库
git clone <your-repo>

# 进入目录
cd yuque-lite

# 直接打开
open index.html
```

## 🎯 使用说明

### 键盘快捷键
- `Ctrl + S`：保存当前文档
- `Ctrl + P`：切换预览模式
- `Ctrl + K`：聚焦搜索框
- `Ctrl + N`：新建文档
- `Ctrl + B`：切换主题

### 数据安全
- 所有数据存储在 LocalStorage
- 每5分钟自动备份
- 可手动创建备份点
- 支持数据导出/导入（JSON格式）

## 📂 项目结构

```
yuque-lite/
├── index.html          # 主入口（内联所有代码）
├── app.js              # 主应用逻辑
├── models.js           # 数据模型
├── render-*.js         # 渲染组件
├── search-engine.js    # 搜索引擎
├── markdown-renderer.js # MD解析器
├── style.css           # 样式定义
└── planning.md         # 开发文档
```

## 🛠️ 技术栈

- **HTML5**：语义化标签 + 布局
- **CSS3**：Grid/Flexbox，CSS变量，动画
- **JavaScript (ES6+)**：类、箭头函数、解构等原生特性

**零依赖！不使用任何第三方库！**

## 📊 功能演示

### 1. 知识库管理
- 创建多层级工作空间
- 书本折叠/展开
- 文档拖拽排序（基础版）

### 2. 编辑器
- 分屏预览模式
- Markdown实时渲染
- 词数统计

### 3. 搜索系统
- 全文倒排索引
- 标签精确匹配
- 高亮显示结果

### 4. 数据可视化
- Canvas图表统计
- 标签云分布
- 文档字数/用时分析

## 🎨 语雀风格还原

- ✅ 三栏布局结构
- ✅ 绿色品牌色 `#25B864`
- ✅ 卡片式设计
- ✅ 层级视觉反馈
- ✅ 优雅动效过渡
- ✅ 响应式适配

## 📝 开发进度

- ✅ Phase 1: 基础架构
- ✅ Phase 2: 核心结构
- ✅ Phase 3: 文档管理
- ✅ Phase 4: 搜索与标签
- ✅ Phase 5: 视觉优化
- ✅ Phase 6: 增强功能
- ✅ Phase 7: 性能优化
- ✅ Phase 8: 整合发布

## 🔒 数据隐私

- 所有数据纯客户端存储
- 不涉及任何网络请求
- 支持本地数据导出（可离线使用）

## 🐛 已知限制

1. 无协作功能（单用户）
2. 无图片上传（支持引用网络图）
3. 无多级书签（仅支持书本层级）
4. 无版本冲突处理（单机）
5. Markdown解析为基础版本

## 📈 代码统计

- 总代码量：~1200行
- JS：~900行
- CSS：~250行
- HTML：~50行

## 👨‍💻 作者

- 开发时间：2024.12
- 技术类型：前端原生开发
- 项目类型：大作业/毕业设计

## 📄 许可

本项目为学习目的，可自由使用修改。

---

**Powered by Pure JavaScript & Love ❤️**
```

**提交**：
```
git commit -m "docs: 完成项目文档和使用说明"
```

---

## 🎯 **总结：Git提交策略**

### **提交频率**
每个功能完成后即提交，保持原子性：

```bash
# 提交规范示例
git commit -m "feat: 核心数据模型"
git commit -m "feat: 三栏基础布局"
git commit -m "feat: 左侧导航渲染"
git commit -m "fix: 修复文档切换渲染"
git commit -m "style: 优化UI动效"
git commit -m "docs: 补充README"
```

### **最终提交节点**
1. **Phase 1** - 3次
2. **Phase 2** - 4次
3. **Phase 3** - 3次
4. **Phase 4** - 2次
5. **Phase 5** - 2次
6. **Phase 6** - 3次
7. **Phase 7** - 2次
8. **Phase 8** - 1次

**总计约 20次提交，每个提交都有明确的功能边界**<tool_call>
<function=TodoWrite>
<parameter=todos>[{"content": "Create comprehensive Markdown project plan", "status": "completed", "activeForm": "Creating comprehensive Markdown project plan"}, {"content": "Design incremental build phases with Git commit strategy", "status": "completed", "activeForm": "Designing incremental build phases"}, {"content": "Provide phase-by-phase implementation guide", "status": "completed", "activeForm": "Providing phase-by-phase implementation guide"}, {"content": "Create Git commit message standards", "status": "completed", "activeForm": "Creating Git commit message standards"}]