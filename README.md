# 语雀 Lite - 纯原生知识库系统

> 🎯 **大作业项目** - 仅使用 HTML + CSS + JavaScript，零依赖！

## ✨ 项目简介

这是一个模仿语雀风格的个人知识库管理系统，适合学习、笔记、文档管理。

### 🔥 核心特点
- ✅ **纯原生技术栈**，无需 Node.js 或构建工具
- ✅ **模块化架构**，每个文件专注单一功能
- ✅ **语雀风格 UI**，优雅的三栏布局
- ✅ **实时预览**，支持基础 Markdown 语法
- ✅ **全文搜索**，基于倒排索引实现
- ✅ **数据持久化**，本地存储自动备份

## 📁 项目结构

```
yuque-lite/
├── index.html              # 入口文件（30行）
│
├── css/                    # 样式模块
│   ├── base.css            # 基础重置 + 变量（40行）
│   ├── layout.css          # 页面布局（70行）
│   ├── components.css      # 组件样式（250行）
│   └── theme.css           # 暗色主题（60行）
│
├── js/                     # 功能模块
│   ├── utils.js            # 工具函数（50行）
│   ├── data.js             # 数据管理（200行）
│   ├── markdown.js         # MD解析器（60行）
│   ├── search.js           # 搜索引擎（80行）
│   ├── render.js           # 页面渲染（200行）
│   ├── templates.js        # 模板系统（60行）
│   └── main.js             # 主应用（350行）
│
└── README.md               # 项目文档
```

**总计**：约 1400 行代码，8个模块，每个模块 < 350行

## 🚀 快速开始

### 1. 下载项目
```bash
# 方式一：直接下载
git clone <your-repo-url>
cd yuque-lite

# 方式二：仅下载文件
# 将所有文件放在同一目录下
```

### 2. 运行方式
**无需服务器！** 双击 `index.html` 即可在浏览器中运行

> 推荐使用 Chrome、Edge 或 Firefox 浏览器

### 3. 开始使用
- 第一次运行会自动生成**演示数据**
- 按照界面提示操作即可

## 🎯 功能特性

### 核心功能
| 功能 | 状态 | 说明 |
|------|------|------|
| 知识库管理 | ✅ | 支持多层级 Workspace → Book → Doc |
| Markdown编辑 | ✅ | 实时预览 + 基础语法支持 |
| 全文搜索 | ✅ | 倒排索引 + 关键词高亮 |
| 标签系统 | ✅ | 支持文档标签 + 筛选 |
| 模板系统 | ✅ | 记录模板、日报模板等 |
| 统计面板 | ✅ | Canvas 图表 + 数据可视化 |
| 主题切换 | ✅ | 亮色/暗色模式 |
| 数据备份 | ✅ | 自动备份 + 手动导入导出 |

### 📝 支持的 Markdown 语法
- `# ## ###` 标题
- `**粗体**` 粗体
- \`代码\` 或 \`\`\`代码块\`\`\`
- `* 列表` 无序列表
- `> 引用` 引用
- `[链接](url)` 链接

### ⌨️ 快捷键
| 快捷键 | 功能 |
|--------|------|
| `Ctrl + S` | 保存文档 |
| `Ctrl + P` | 切换预览模式 |
| `Ctrl + K` | 聚焦搜索框 |
| `Ctrl + N` | 新建文档 |
| `Ctrl + B` | 切换主题 |
| `Esc` | 关闭弹窗/清除搜索 |

## 📊 輔助功能

### 自动演示数据
首次运行时，系统会自动生成演示数据（包含两个书本和示例文档），帮助你快速上手

### 数据安全
- 所有数据存储在 **LocalStorage**
- 每5分钟自动在后台保存
- 支持手动创建多个备份点
- 支持 JSON 导入/导出

### 视觉特征
- ✅ 语雀品牌绿 `#25B864`
- ✅ 流畅的动效和过渡
- ✅ 响应式三栏布局
- ✅ 搜索高亮标记
- ✅ 优雅的 Toast 通知

## 🔍 模块说明

### 数据流
```
用户操作 → Main.js → DataAPI → LocalStorage
                        ↓
                  渲染器更新 UI
```

### 关键模块
1. **data.js** - 数据核心，所有 CRUD 操作
2. **search.js** - 搜索引擎，倒排索引实现
3. **markdown.js** - 无依赖的 MD 解析器
4. **render.js** - 页面渲染，纯 DOM 操作
5. **main.js** - 应用主控，协调各模块

## 🛠️ 技术细节

### 1. 搜索算法
采用倒排索引（Inverted Index）：
- 预处理：分词 + 标记化
- 构建：单词 → 文档ID映射
- 查询：关键词查找 + 相关度排序

### 2. Markdown 解析
纯正则表达式实现：
- 避免复杂的 AST 解析
- 支持常用基础语法
- 自动段落处理

### 3. 性能优化
- **防抖处理**：输入、搜索 300-500ms 延迟
- **懒渲染**：只渲染可见区域
- **批量更新**：单次 DOM 更新

### 4. 数据结构
```javascript
{
  user: { theme, autoSave },
  workspaces: [
    { id, name, books: [
      { id, title, docs: [
        { id, title, content, tags, stats }
      ]}
    ]}
  ],
  active: { workspaceId, bookId, docId, search }
}
```

## 📈 开发进度

- ✅ Phase 1: 项目架构与基础模块
- ✅ Phase 2: 面板渲染与基本交互
- ✅ Phase 3: 文档编辑与 Markdown
- ✅ Phase 4: 搜索引擎与标签
- ✅ Phase 5: 样式完善与主题切换
- ✅ Phase 6: 模板系统与导入导出
- ✅ Phase 7: 备份管理与优化
- ✅ Phase 8: 整合发布

## 🐛 常见问题

### Q: 数据会丢失吗？
A: 不会，数据保存在 LocalStorage，清除浏览器缓存前不会丢失

### Q: 支持多用户吗？
A: 不支持，这是单用户本地应用

### Q: 能上传图片吗？
A: 暂不支持，但可在 Markdown 中添加网络图片地址

### Q: 代码过于复杂吗？
A: 模块化设计，每个文件 < 350行，易读易懂

## 📝 Git 提交记录参考

```bash
# 阶段 1：基础
git add index.html && git commit -m "chore: 初始化入口文件"
git add css/ && git commit -m "feat: CSS模块化架构"
git add js/utils.js js/data.js && git commit -m "feat: 数据管理与工具函数"

# 阶段 2：核心功能
git add js/markdown.js js/search.js && git commit -m "feat: 解析器与搜索"
git add js/render.js && git commit -m "feat: 渲染器模块"
git add js/main.js && git commit -m "feat: 主应用集成"

# 阶段 3：完善
git add -A && git commit -m "feat: 完整项目上线"
```

## 📄 许可证

本项目为**学习和教育用途**设计，可自由修改使用。

---

**开发者**：
  - (陈佳玮)JavierChen @2023154202
  - (李梓阳)ZiYang Li  @2023154225

**完成时间**：2024年12月
**项目类型**：大学 Web 开发大作业
**代码纯度**：100% 原生 JavaScript，零依赖！