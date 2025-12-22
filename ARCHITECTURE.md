# 语雀 Lite - 架构说明

## 现代 Web Components 架构

本项目采用 **原生 Web Components** 重构，无需任何框架依赖。

### 文件结构

```
web_assignment/
├── index.html                          # 入口文件（已简化）
├── css/
│   ├── base.css                       # CSS 变量与重置
│   ├── layout.css                     # 页面布局
│   ├── components.css                 # 组件样式
│   └── theme.css                      # 主题（light/dark）
└── js/
    ├── utils.js                       # 工具函数（debounce, uuid）
    ├── data.js                        # 数据层（LocalStorage）
    ├── markdown.js                    # Markdown 渲染器
    ├── search.js                      # 搜索引擎（倒排索引）
    ├── templates.js                   # 模板系统
    ├── ui-renderer.js                 # 模态框等辅助 UI
    ├── main.js                        # 主应用控制器
    └── components/                    # Web Components（新！）
        ├── workspace-panel.js         # 左侧面板
        ├── book-list-panel.js         # 中间面板（搜索/文档）
        ├── editor-panel.js            # 右侧编辑器
        ├── toast-notification.js      # Toast 通知
        └── README.md                  # 组件文档
```

### 架构优势

#### vs 旧版 render.js
| 特性 | 旧版 (render.js) | 新版 (Web Components) |
|------|------------------|-----------------------|
| 代码组织 | 373行单文件 | 4个独立组件（~17KB） |
| 样式隔离 | 依赖全局CSS | Shadow DOM 完全隔离 |
| 可维护性 | 修改需浏览373行 | 每个文件专注单一职责 |
| 复用性 | 难以复用 | 可在任何页面复用 |
| 测试 | 需要完整环境 | 可单独测试组件 |

### 组件详解

#### 1. WorkspacePanel (`<workspace-panel>`)
- **职责**：工作区列表
- **功能**：切换工作区、创建新工作区
- **数据接收**：`component.data = data`
- **事件输出**：`create-workspace`, `switch-workspace`

#### 2. BookListPanel (`<book-list-panel>`)
- **职责**：书本/文档列表 + 搜索
- **功能**：查看书本、展开文档、搜索高亮
- **数据接收**：`component.data = data`, `component.searchResults = results`
- **事件输出**：`toggle-book`, `switch-doc`, `create-doc`, `search`, `clear-search`

#### 3. EditorPanel (`<editor-panel>`)
- **职责**：文档编辑与预览
- **功能**：实时编辑、Markdown 预览、状态切换
- **方法**：`setMarkdownRenderer()`, `updateStats()`, `togglePreview()`
- **事件输出**：`update-title`, `editor-input`, `save`, `toggle-status`, `add-tag`, `export`, `delete`

#### 4. ToastNotification (`<toast-notification>`)
- **职责**：全局通知系统
- **方法**：`show(message, type, duration)`, `hide()`
- **特点**：自动消失、支持多种类型

### 数据流（MVC模式）

```
┌─────────────────────────────────────────────────────────┐
│  主应用 (YuqueLiteApp) - Controller                      │
│  • 从 DataAPI 读取数据                                   │
│  • 监听组件事件                                          │
│  • 更新数据并save到LocalStorage                          │
└─────────────────────────────────────────────────────────┘
         ▲                    │                    ▲
         │                    │                    │
    事件监听                  │                触发重绘
         │                    ▼                    │
┌────────┴─────────┐  ┌──────────┐  ┌──────────┴──────────┐
│                  │  │          │  │                      │
│  Web Components  │  │ DataAPI  │  │  其他辅助模块         │
│  (Mutation)      │  │  /Model  │  │  • MarkdownRenderer  │
│                  │  │          │  │  • SearchEngine      │
└──────────────────┘  └──────────┘  │  • UI Templates      │
                                    └──────────────────────┘
```

### 数据更新流程

1. **用户操作** → 2. **组件事件** → 3. **主应用监听** → 4. **DataAPI 更新** → 5. **LocalStorage 保存** → 6. **设置组件 data 属性** → 7. **组件内部 render()**

### 事件通信示例

```javascript
// 组件内部（父组件）
this.dispatchEvent(new CustomEvent('switch-doc', {
  detail: { bookId: 'xxx', docId: 'yyy' }
}));

// 主应用监听
this.components.center.addEventListener('switch-doc', (e) => {
  this.switchDoc(e.detail.bookId, e.detail.docId);
});
```

### 主题切换

```css
/* CSS 变量在 base.css 定义 */
:root {
  --bg-main: #F8FAFC;      /* 亮色背景 */
  --text-primary: #0F172A; /* 亮色文字 */
}

body.dark-theme {
  --bg-main: #0B1120;      /* 暗色背景 */
  --text-primary: #F8FAFC; /* 暗色文字 */
}
```

### 调试指南

#### 检查组件数据
```javascript
// 在浏览器控制台
document.getElementById('left-panel').data
document.getElementById('center-panel').data
document.getElementById('main-panel').data
```

#### 手动触发事件
```javascript
const panel = document.getElementById('center-panel');
panel.dispatchEvent(new CustomEvent('search', {
  detail: { keyword: 'Grid' }
}));
```

#### 查看 Shadow DOM
```javascript
const panel = document.getElementById('main-panel');
panel.shadowRoot  // 查看内部结构
```

### 性能优化

1. **Shadow DOM**: 样式隔离，减少全局CSS扫描
2. **Debounce**: 搜索（300ms）和编辑器（500ms）防抖
3. **Lazy Search**: 倒排索引在首次搜索时构建
4. **Selective Re-render**: 只更新受影响的面板

### 浏览器要求

- ✅ Chrome 54+
- ✅ Firefox 63+
- ✅ Safari 10.1+
- ✅ Edge 79+
- ❌ IE 11（不支持 Custom Elements）

### 迁移总结

从旧架构到新架构的变化：

**移除**：
- ✅ render.js（373 行）
- ✅ components.js（单一文件）

**新增**：
- ✅ js/components/workspace-panel.js
- ✅ js/components/book-list-panel.js
- ✅ js/components/editor-panel.js
- ✅ js/components/toast-notification.js
- ✅ js/ui-renderer.js（保留 Modal 等辅助 UI）

**不变**：
- ✅ 数据模型（data.js）
- ✅ 业务逻辑（main.js）
- ✅ Markdown 解析（markdown.js）
- ✅ 搜索引擎（search.js）
- ✅ CSS 样式

**index.html 变化**：

```
旧:
<div id="left-panel"></div>
<script src="js/render.js"></script>

新:
<workspace-panel id="left-panel"></workspace-panel>
<script src="js/components/workspace-panel.js"></script>
```

---

**架构改进完成！** 🎉

现在每个组件独立、可维护、可测试，且样式完全隔离。
