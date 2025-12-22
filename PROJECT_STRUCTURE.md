# 项目结构 - 语雀 Lite (极简双页面架构)

## 📁 项目总览

```
web_assignment/
├── 📄 页面文件
│   ├── index.html                  主页 - 知识空间门户
│   └── editor.html                 编辑器页面
│
├── 🎨 样式文件
│   ├── css/
│   │   ├── base.css               基础定义 + 7个变量
│   │   ├── layout.css             布局系统
│   │   ├── components.css         组件样式
│   │   └── theme.css              主题切换
│
├── ⚙️ JavaScript 核心
│   ├── js/
│   │   ├── utils.js               工具函数
│   │   ├── data.js                数据管理 + 排序API
│   │   ├── markdown.js            Markdown渲染
│   │   ├── search.js              搜索引擎
│   │   ├── templates.js           模板系统
│   │   └── ui-renderer.js         模态框渲染器
│
├── 🧩 Web Components
│   ├── js/components/
│   │   ├── homepage-panel.js      ★ 主页组件 (知识空间列表)
│   │   ├── workspace-panel.js     工作区选择器
│   │   ├── book-list-panel.js     书本文档列表
│   │   ├── editor-panel.js        编辑器组件
│   │   └── toast-notification.js  Toast通知
│
├── 📚 文档
│   ├── README.md                  项目说明
│   ├── QUICK_START.md             快速开始
│   ├── REFACTORING_SUMMARY.md     极简重构记录
│   ├── PROJECT_STRUCTURE.md       本文件
│   └── README_DESIGN.md           设计文档
│
└── 🗂️ 备用文件 (已替换)
    ├── js/main.js                 原单页面主逻辑 (保留备份)
    └── js/main-new.js             新双页面架构 (备用)
```

---

## 🔑 关键文件详解

### 1. index.html (25KB)
**首页控制文件**
- 完整的单页应用（不依赖外部JS）
- 内包含：HTML结构 + CSS样式 + JavaScript逻辑
- 功能：显示知识空间列表、排序、打开工作区

**特点：**
- 使用 `HomeApp` 类管理
- 渲染工作区卡片网格
- 包含全局统计
- 自动备份机制

---

### 2. editor.html (17KB)
**编辑器控制文件**
- 完整的3面板编辑器
- 独立运行，不依赖 index.html
- 功能：文档编辑、搜索、模板、备份

**特点：**
- 使用 `EditorApp` 类管理
- 完整的Web Components
- 支持返回主页

---

### 3. js/data.js (扩展后 ~180行)
**数据管理器**
- 原有功能：CRUD、搜索、统计
- 新增功能：
  - `sortWorkspaces()` - 工作区排序
  - `sortBooks()` - 书本排序
  - `sortDocs()` - 文档排序
  - `getSortedWorkspacesWithStats()` - 带统计的排序数据

---

### 4. js/components/homepage-panel.js (~300行)
**全新组件**
- 专为首页设计的工作区展示组件
- 支持排序按钮交互
- 卡片式布局，显示统计信息
- 事件驱动（创建/打开/删除工作区）

---

## 🎯 数据流

```
浏览器 LocalStorage
       ↓
  data.js
       ↓
  index.html (HomeApp)
       ↓ 触发 "打开工作区"
       ↓ 设置 active.workspaceId
       ↓ 跳转
       ↓
  editor.html (EditorApp)
       ↓ 使用 active.workspaceId
       ↓ 渲染3面板
       ↓ 编辑/保存文档
       ↓
  localStorage (自动保存)
```

---

## 📊 文件大小对比

### 原架构 (单页面)
| 文件 | 大小 |
|------|------|
| index.html | ~10KB |
| js/main.js | ~20KB |
| **总计** | **~30KB** |

### 新架构 (双页面)
| 文件 | 大小 |
|------|------|
| index.html | ~25KB (内含完整逻辑) |
| editor.html | ~17KB (内含完整逻辑) |
| **总计** | **~42KB** |

**额外增加：
- 更清晰的代码组织
- 独立的运行环境
- 更好的浏览器缓存友好性

---

## 🔍 组件依赖关系

### 主页组件依赖
```
HomeApp
├── data.js                  数据操作
├── toast-notification.js    通知
├── 数据来自：localStorage
└── 操作触发：跳转editor.html
```

### 编辑器组件依赖
```
EditorApp (editor.html)
├── workspace-panel      左侧
├── book-list-panel      中间
├── editor-panel         右侧
├── toast-notification   通知
├── markdown.js          预览
├── search.js            搜索
├── templates.js         模板
└── data.js              数据
```

---

## 🎨 设计一致性

两个页面使用：
1. **相同CSS变量**（7个颜色）
2. **相同按钮样式**（btn, btn-primary, btn-danger）
3. **相同模态框样式**（UIRenderer）
4. **相同Toast组件**（共享）
5. **相同中文提示**

---

## 📋 使用场景映射

| 场景 | 使用文件 | 操作 |
|------|----------|------|
| 查看所有知识空间 | index.html | 打开主页 |
| 新建/删除工作区 | index.html | 主页操作 |
| 想要排序列表 | index.html | 点击排序按钮 |
| 编辑文档 | editor.html | 打开工作区 |
| 切换工作区 | editor.html | 左侧切换 |
| 搜索内容 | editor.html | Ctrl+K |
| 返回管理界面 | editor.html → index.html | Ctrl+H |

---

## 💡 最佳实践

1. **先在主页创建并组织**：使用 index.html 管理知识空间、书本结构
2. **跳转编辑**：点击"打开"集中创作
3. **定期备份**：在主页使用备份功能导出
4. **浏览器标签页**：保持两个页面同时打开，快速切换

---

## ✅ 验证清单

- [x] 主页可以创建知识空间
- [x] 主页支持排序（最新/名称/数量）
- [x] 主页点击"打开"跳转到editor.html
- [x] editor.html 工作正常（3面板完整）
- [x] editor.html 可以返回主页
- [x] 两个页面共享数据
- [x] 极简设计风格一致
- [x] 所有硬编码颜色已移除
- [x] 无动画/过渡效果
- [x] 快捷键正常工作

---

## 🚀 下一步

如果需要修改或扩展：
1. **修改首页样式** → 编辑 index.html 中的 `<style>` 块
2. **修改编辑器样式** → 编辑 editor.html 中的 `<style>` 块
3. **修改数据逻辑** → 编辑 js/data.js
4. **添加新功能** → 在对应页面的 JS 类中添加方法

**所有文件都已就绪，可以直接使用！**