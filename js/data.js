// 数据管理模块

const DATA_KEY = 'yuque-lite-data-v1';

// 默认数据模型
const DataModel = {
  user: { theme: 'light', autoSave: true },
  workspaces: [],
  active: { workspaceId: null, bookId: null, docId: null, search: '' },
  system: { version: '1.0.0' },
  trash: { items: [] }
};

// 内部工具函数
const DataHelper = {
  // 创建工作区
  createWorkspace(name) {
    return {
      id: uuid(),
      name: name,
      icon: 'lucide:folder',
      description: '',
      books: [],
      created: new Date().toISOString()
    };
  },

  // 创建书本
  createBook(title, icon = 'lucide:book-open', color = '#25B864') {
    return {
      id: uuid(),
      title: title,
      icon: icon,
      coverColor: color,
      tags: [],
      stats: { docCount: 0, wordCount: 0, lastUpdated: new Date().toISOString() },
      docs: []
    };
  },

  // 创建文档
  createDoc(title, content = '') {
    return {
      id: uuid(),
      bookId: null,
      title: title,
      type: 'markdown',
      status: 'draft',
      content: content,
      tags: [],
      stats: { words: 0, views: 0, estimatedTime: 0 },
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };
  },

  // 生成演示数据
  createDemoData() {
    const workspace = this.createWorkspace('我的知识空间');

    const book1 = this.createBook('CSS 进阶', 'lucide:palette', '#61DAFB');
    const book2 = this.createBook('JavaScript', 'lucide:code', '#F7DF1E');

    // 演示文档1
    const doc1 = this.createDoc('Grid布局指南', `# Grid 完全指南

## 简介
Grid是现代CSS布局系统，支持二维布局。

## 基础语法
\`\`\`css
.container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 20px;
}
\`\`\`

## 关键概念
* **Grid Container** - 网格容器
* **Grid Item** - 网格项目
* **Track Size** - 轨道尺寸

> 比Flexbox更适合复杂布局！

## 使用场景
- 仪表盘
- 图片画廊
- 表格
`);
    doc1.bookId = book1.id;
    doc1.tags = ['CSS', '布局'];
    doc1.status = 'published';
    doc1.stats = { words: 450, views: 23, estimatedTime: 2 };

    // 演示文档2
    const doc2 = this.createDoc('异步编程', `# Async/Await

## Promise 示例
\`\`\`javascript
fetch('/api')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
\`\`\`

## Async/Await 更优雅
\`\`\`javascript
async function getData() {
  try {
    const res = await fetch('/api');
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}
\`\`\`

## 常见模式
1. 并行请求
2. 串行请求
3. 错误处理
`);
    doc2.bookId = book2.id;
    doc2.tags = ['JS', '异步'];
    doc2.stats = { words: 320, views: 12, estimatedTime: 2 };

    book1.docs = [doc1];
    book2.docs = [doc2];
    book1.stats = { docCount: 1, wordCount: 450, lastUpdated: doc1.updated };
    book2.stats = { docCount: 1, wordCount: 320, lastUpdated: doc2.updated };

    workspace.books = [book1, book2];

    return {
      user: { theme: 'light', autoSave: true },
      workspaces: [workspace],
      active: {
        workspaceId: workspace.id,
        bookId: book1.id,
        docId: doc1.id,
        search: ''
      },
      system: {
        version: '1.0.0',
        created: new Date().toISOString()
      },
      trash: { items: [] }
    };
  }
};

// 数据API
const DataAPI = {
  // 读取数据
  load() {
    const raw = localStorage.getItem(DATA_KEY);
    if (!raw) {
      const demo = DataHelper.createDemoData();
      this.save(demo);
      return demo;
    }
    const data = JSON.parse(raw);
    let updated = false;
    if (data && Array.isArray(data.workspaces)) {
      data.workspaces.forEach(ws => {
        if (ws.name === '📚 我的知识空间') {
          ws.name = '我的知识空间';
          updated = true;
        }
        if (!ws.icon) {
          ws.icon = 'lucide:folder';
          updated = true;
        }
      });
    }
    // 确保回收站数据结构存在
    if (!data.trash) {
      data.trash = { items: [] };
      updated = true;
    }
    if (updated) this.save(data);
    return data;
  },

  // 保存数据
  save(data) {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
  },

  // 查找工作区
  findWorkspace(data, id) {
    return data.workspaces.find(w => w.id === id);
  },

  // 查找书本
  findBook(data, id) {
    for (let ws of data.workspaces) {
      const book = ws.books.find(b => b.id === id);
      if (book) return book;
    }
    return null;
  },

  // 查找文档
  findDoc(data, id) {
    for (let ws of data.workspaces) {
      for (let book of ws.books) {
        const doc = book.docs.find(d => d.id === id);
        if (doc) return doc;
      }
    }
    return null;
  },

  // 自动创建操作
  autoCreate: {
    workspace(data, name) {
      const ws = DataHelper.createWorkspace(name);
      data.workspaces.push(ws);
      data.active.workspaceId = ws.id;
      DataAPI.save(data);
      return ws;
    },

    book(data, workspaceId, title) {
      const ws = DataAPI.findWorkspace(data, workspaceId);
      if (!ws) return null;
      const book = DataHelper.createBook(title);
      ws.books.push(book);
      data.active.bookId = book.id;
      DataAPI.save(data);
      return book;
    },

    doc(data, bookId, title) {
      const book = DataAPI.findBook(data, bookId);
      if (!book) return null;
      const doc = DataHelper.createDoc(title);
      doc.bookId = bookId;
      book.docs.unshift(doc);
      book.stats.docCount++;
      data.active.docId = doc.id;
      DataAPI.save(data);
      return doc;
    }
  },

  // 更新文档内容
  updateDoc(data, docId, content) {
    const doc = this.findDoc(data, docId);
    if (doc) {
      doc.content = content;
      doc.updated = new Date().toISOString();

      // 统计
      const words = content.trim().split(/\s+/).filter(w => w).length;
      doc.stats.words = words;
      doc.stats.estimatedTime = Math.ceil(words / 300); // 300字/分钟

      // 更新书本统计
      const book = this.findBook(data, doc.bookId);
      if (book) {
        book.stats.lastUpdated = doc.updated;
        book.stats.docCount = book.docs.length;
        book.stats.wordCount = book.docs.reduce((sum, d) => sum + (d.stats.words || 0), 0);
      }

      this.save(data);
    }
  },

  // 更新文档标题
  updateDocTitle(data, docId, title) {
    const doc = this.findDoc(data, docId);
    if (doc) {
      doc.title = title;
      doc.updated = new Date().toISOString();
      this.save(data);
    }
  },

  // 切换文档状态
  toggleDocStatus(data, docId) {
    const doc = this.findDoc(data, docId);
    if (doc) {
      doc.status = doc.status === 'draft' ? 'published' : 'draft';
      this.save(data);
      return doc.status;
    }
    return null;
  },

  // 获取统计数据
  getStats(data) {
    let docCount = 0, wordCount = 0, bookCount = 0;
    const tagMap = {};
    const countWords = (content) => {
      if (!content) return 0;
      return content.trim().split(/\s+/).filter(w => w).length;
    };

    data.workspaces.forEach(ws => {
      bookCount += ws.books.length;
      ws.books.forEach(book => {
        docCount += book.docs.length;
        book.docs.forEach(doc => {
          const statsWords = doc?.stats?.words;
          const computedWords = statsWords > 0 ? statsWords : countWords(doc.content);
          wordCount += computedWords;
          doc.tags.forEach(tag => {
            tagMap[tag] = (tagMap[tag] || 0) + 1;
          });
        });
      });
    });

    return { docCount, wordCount, bookCount, tagMap };
  },

  // 通过标签筛选
  filterDocsByTag(data, tag) {
    const results = [];
    data.workspaces.forEach(ws => {
      ws.books.forEach(book => {
        book.docs.forEach(doc => {
          if (doc.tags.includes(tag)) {
            results.push({
              ...doc,
              bookTitle: book.title,
              bookId: book.id,
              bookColor: book.coverColor
            });
          }
        });
      });
    });
    return results;
  },

  // 添加标签到文档
  addTagToDoc(data, docId, tag) {
    const doc = this.findDoc(data, docId);
    if (doc && !doc.tags.includes(tag)) {
      doc.tags.push(tag);
      this.save(data);
      return true;
    }
    return false;
  },

  // 删除文档（移至回收站）
  deleteDoc(data, docId) {
    for (let ws of data.workspaces) {
      for (let book of ws.books) {
        const index = book.docs.findIndex(d => d.id === docId);
        if (index !== -1) {
          const doc = book.docs[index];
          // 移至回收站
          data.trash.items.push({
            id: uuid(),
            type: 'doc',
            item: { ...doc },
            bookId: book.id,
            bookTitle: book.title,
            workspaceId: ws.id,
            workspaceName: ws.name,
            deletedAt: new Date().toISOString()
          });
          
          book.docs.splice(index, 1);
          book.stats.docCount--;
          // 更新书本字数统计
          book.stats.wordCount = book.docs.reduce((sum, d) => sum + (d.stats.words || 0), 0);

          // 如果删除的是当前文档，清理激活状态
          if (data.active.docId === docId) {
            data.active.docId = book.docs.length > 0 ? book.docs[0].id : null;
          }

          this.save(data);
          return true;
        }
      }
    }
    return false;
  },

  // 删除书本（移至回收站）
  deleteBook(data, bookId) {
    for (let ws of data.workspaces) {
      const index = ws.books.findIndex(b => b.id === bookId);
      if (index !== -1) {
        const book = ws.books[index];
        // 移至回收站
        data.trash.items.push({
          id: uuid(),
          type: 'book',
          item: { ...book },
          workspaceId: ws.id,
          workspaceName: ws.name,
          deletedAt: new Date().toISOString()
        });
        
        ws.books.splice(index, 1);

        // 清理激活状态
        if (data.active.bookId === bookId) {
          data.active.bookId = null;
          data.active.docId = null;
        }

        this.save(data);
        return true;
      }
    }
    return false;
  },

  // 删除工作区（移至回收站）
  deleteWorkspace(data, wsId) {
    const index = data.workspaces.findIndex(w => w.id === wsId);
    if (index !== -1) {
      const ws = data.workspaces[index];
      // 移至回收站
      data.trash.items.push({
        id: uuid(),
        type: 'workspace',
        item: { ...ws },
        deletedAt: new Date().toISOString()
      });
      
      data.workspaces.splice(index, 1);

      // 清理激活状态
      if (data.active.workspaceId === wsId) {
        data.active.workspaceId = data.workspaces.length > 0 ? data.workspaces[0].id : null;
        data.active.bookId = null;
        data.active.docId = null;
      }

      this.save(data);
      return true;
    }
    return false;
  },

  // 排序功能 - 工作区
  sortWorkspaces(data, method = 'created') {
    const sorted = [...data.workspaces];

    switch(method) {
      case 'name': // 按名称
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'bookCount': // 按书本数量
        return sorted.sort((a, b) => (b.books?.length || 0) - (a.books?.length || 0));
      case 'created': // 按创建时间（倒序）
      default:
        return sorted.sort((a, b) => new Date(b.created) - new Date(a.created));
    }
  },

  // 排序功能 - 书本
  sortBooks(books, method = 'title') {
    const sorted = [...books];

    switch(method) {
      case 'docCount': // 按文档数量
        return sorted.sort((a, b) => (b.docs?.length || 0) - (a.docs?.length || 0));
      case 'updated': // 按更新时间
        return sorted.sort((a, b) => new Date(b.stats.lastUpdated) - new Date(a.stats.lastUpdated));
      case 'title': // 按标题
      default:
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
    }
  },

  // 排序功能 - 文档
  sortDocs(docs, method = 'updated') {
    const sorted = [...docs];

    switch(method) {
      case 'title': // 按标题
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'created': // 按创建时间
        return sorted.sort((a, b) => new Date(b.created) - new Date(a.created));
      case 'status': // 按状态（发布优先）
        return sorted.sort((a, b) => a.status === 'published' ? -1 : 1);
      case 'words': // 按字数
        return sorted.sort((a, b) => (b.stats.words || 0) - (a.stats.words || 0));
      case 'updated': // 按更新时间（默认）
      default:
        return sorted.sort((a, b) => new Date(b.updated) - new Date(a.updated));
    }
  },

  // 获取排序后的工作区列表（带工作区统计数据）
  getSortedWorkspacesWithStats(data, method = 'created') {
    const workspaces = this.sortWorkspaces(data, method);

    return workspaces.map(ws => ({
      id: ws.id,
      name: ws.name,
      icon: ws.icon,
      description: ws.description,
      created: ws.created,
      bookCount: ws.books?.length || 0,
      docCount: ws.books?.reduce((sum, book) => sum + (book.docs?.length || 0), 0),
      lastUpdated: ws.books?.reduce((latest, book) => {
        const bookLast = book.docs?.reduce((bookLatest, doc) =>
          bookLatest && new Date(bookLatest) > new Date(doc.updated) ? bookLatest : doc.updated, null);
        return latest && new Date(latest) > new Date(bookLast) ? latest : bookLast;
      }, null)
    }));
  },

  // ==================== 回收站功能 ====================
  
  // 从回收站恢复项目
  restoreFromTrash(data, trashItemId) {
    const index = data.trash.items.findIndex(t => t.id === trashItemId);
    if (index === -1) return false;

    const trashItem = data.trash.items[index];
    
    if (trashItem.type === 'doc') {
      // 恢复文档
      const book = this.findBook(data, trashItem.bookId);
      if (!book) {
        // 书本不存在了，无法恢复
        return false;
      }
      book.docs.unshift(trashItem.item);
      book.stats.docCount++;
      book.stats.wordCount = book.docs.reduce((sum, d) => sum + (d.stats.words || 0), 0);
    } else if (trashItem.type === 'book') {
      // 恢复书本
      const ws = this.findWorkspace(data, trashItem.workspaceId);
      if (!ws) {
        // 工作区不存在了，无法恢复
        return false;
      }
      ws.books.push(trashItem.item);
    } else if (trashItem.type === 'workspace') {
      // 恢复工作区
      data.workspaces.push(trashItem.item);
    }

    // 从回收站移除
    data.trash.items.splice(index, 1);
    this.save(data);
    return true;
  },

  // 从回收站永久删除
  permanentDelete(data, trashItemId) {
    const index = data.trash.items.findIndex(t => t.id === trashItemId);
    if (index !== -1) {
      data.trash.items.splice(index, 1);
      this.save(data);
      return true;
    }
    return false;
  },

  // 清空回收站
  emptyTrash(data) {
    data.trash.items = [];
    this.save(data);
  },

  // 获取回收站统计
  getTrashStats(data) {
    const stats = { total: 0, docs: 0, books: 0, workspaces: 0 };
    data.trash.items.forEach(item => {
      stats.total++;
      if (item.type === 'doc') stats.docs++;
      else if (item.type === 'book') stats.books++;
      else if (item.type === 'workspace') stats.workspaces++;
    });
    return stats;
  }
};

globalThis.DataAPI = DataAPI;
