// 模板系统 - 使用 Iconify 图标

const Templates = {
  // 默认模板集合（使用 Iconify 图标）
  defaults: [
    {
      id: 'meeting',
      name: '会议记录',
      icon: { set: 'lucide', name: 'users' },
      content: `# 会议记录

> 日期：{{date}}
> 主持：{{host}}
> 参会人：{{people}}

## 会议议程
1.

## 讨论要点

## 决议事项

## 待办事项
- [ ] 任务一
- [ ] 任务二

## 附件/参考
`
    },
    {
      id: 'daily',
      name: '每日日报',
      icon: { set: 'lucide', name: 'clipboard-list' },
      content: `# 工作日报

> 日期：{{date}}

## 今日完成
- 任务一
- 任务二

## 明日计划
- 任务一
- 任务二

## 遇到问题
1.

## 备注
`
    },
    {
      id: 'book',
      name: '读书笔记',
      icon: { set: 'lucide', name: 'book-open' },
      content: `# 读书笔记

> 书名：{{book_name}}
> 作者：{{author}}

## 阅读时间
{{date}}

## 核心收获
-

## 精彩摘抄
>

## 思考与疑问
1.

## 行动计划
- [ ]
`
    },
    {
      id: 'review',
      name: '项目复盘',
      icon: { set: 'lucide', name: 'message-circle-code' },
      content: `# 项目复盘

> 项目：{{name}}
> 日期：{{date}}

## 原始目标

## 实际结果

## 做的好的地方

## 待改进的地方

## 下一步计划
`
    }
  ],

  // 获取模板
  getTemplateById(id) {
    return this.defaults.find(t => t.id === id);
  },

  // 填充模板
  fillTemplate(templateId, variables = {}) {
    const template = this.getTemplateById(templateId);
    if (!template) return '';

    let content = template.content;
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, variables[key] || '');
    });

    return content;
  },

  // 从模板内容提取变量
  extractVariables(content) {
    const matches = content.match(/\{\{(\w+)\}\}/g) || [];
    return [...new Set(matches.map(m => m.slice(2, -2)))];
  }
};