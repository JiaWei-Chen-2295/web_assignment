# Web Components 目录

这个目录包含所有的 Web Components 组件，每个组件一个文件，便于独立维护。

## 组件文件

| 文件 | 组件名 | 描述 |
|------|--------|------|
| `workspace-panel.js` | `<workspace-panel>` | 左侧工作区列表面板 |
| `book-list-panel.js` | `<book-list-panel>` | 中间书本/文档列表（支持搜索） |
| `editor-panel.js` | `<editor-panel>` | 右侧编辑器（含 Markdown 预览） |
| `toast-notification.js` | `<toast-notification>` | Toast 通知系统 |

## 使用方式

在 `index.html` 中按顺序引入：

```html
<script src="js/components/workspace-panel.js"></script>
<script src="js/components/book-list-panel.js"></script>
<script src="js/components/editor-panel.js"></script>
<script src="js/components/toast-notification.js"></script>
```

## 组件特点

所有组件使用 **Shadow DOM** 封装样式，避免 CSS 污染：
- 样式完全隔离
- 自定义事件与外部通信
- 属性驱动的数据更新
- 零依赖（纯原生 JavaScript）

## 在 HTML 中使用

```html
<!-- 布局容器 -->
<workspace-panel id="left-panel"></workspace-panel>
<book-list-panel id="center-panel"></book-list-panel>
<editor-panel id="main-panel"></editor-panel>

<!-- Toast 通知 -->
<toast-notification id="toast"></toast-notification>
```

## 事件通信

组件通过 Custom Events 与主应用通信：

- **workspace-panel**: `create-workspace`, `switch-workspace`
- **book-list-panel**: `create-book`, `toggle-book`, `switch-doc`, `create-doc`, `search`, `clear-search`
- **editor-panel**: `update-title`, `editor-input`, `save`, `toggle-status`, `add-tag`, `export`, `delete`, `preview-toggled`

## 优势

1. **可维护性**：每个组件独立文件，修改互不影响
2. **可测试性**：可以单独测试每个组件
3. **可扩展性**：容易添加新组件或修改现有组件
4. **样式隔离**：Shadow DOM 防止样式冲突
5. **性能**：按需加载，无冗余代码
