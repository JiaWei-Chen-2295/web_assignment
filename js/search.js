// 搜索引擎（倒排索引）

const SearchEngine = {
  index: null,

  // 构建索引
  buildIndex(data) {
    const index = { words: {}, docs: {} };

    data.workspaces.forEach(ws => {
      ws.books.forEach(book => {
        book.docs.forEach(doc => {
          // 纯文本内容
          const fullText = doc.title + ' ' + MarkdownRenderer.getPlainText(doc.content);
          const words = this.tokenize(fullText);
          const docKey = doc.id;

          // 文档缓存
          index.docs[docKey] = {
            id: doc.id,
            title: doc.title,
            excerpt: MarkdownRenderer.getExcerpt(doc.content),
            tags: doc.tags,
            bookId: book.id,
            bookTitle: book.title,
            bookColor: book.coverColor,
            status: doc.status
          };

          // 倒排索引
          words.forEach(word => {
            if (!index.words[word]) index.words[word] = [];
            if (!index.words[word].includes(docKey)) {
              index.words[word].push(docKey);
            }
          });
        });
      });
    });

    this.index = index;
    return index;
  },

  // 分词
  tokenize(text) {
    if (!text) return [];
    return text
      .toLowerCase()
      .split(/[\s\.,;:\!\?\[\]\(\)\{\}\<\>\"\'\-\n\r\t]+/)
      .filter(w => w.length > 1 && !['the', 'is', 'a', 'and', 'to', 'of', 'for'].includes(w))
      .slice(0, 500);
  },

  // 搜索
  search(data, keyword) {
    if (!keyword || keyword.length < 2) return [];

    // 特殊标签搜索
    if (keyword.startsWith('tag:')) {
      const tag = keyword.replace('tag:', '').trim();
      return this.searchByTag(data, tag);
    }

    if (!this.index) this.buildIndex(data);

    const query = this.tokenize(keyword);
    const results = new Map();

    query.forEach(word => {
      const matchDocs = this.index.words[word] || [];
      matchDocs.forEach(docId => {
        const count = results.get(docId) || 0;
        results.set(docId, count + 1);
      });
    });

    // 相关度排序
    return Array.from(results.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([docId]) => this.index.docs[docId])
      .slice(0, 50);
  },

  // 通过标签搜索
  searchByTag(data, tag) {
    const results = [];
    data.workspaces.forEach(ws => {
      ws.books.forEach(book => {
        book.docs.forEach(doc => {
          if (doc.tags.includes(tag)) {
            results.push({
              id: doc.id,
              title: doc.title,
              excerpt: MarkdownRenderer.getExcerpt(doc.content),
              tags: doc.tags,
              bookId: book.id,
              bookTitle: book.title,
              bookColor: book.coverColor,
              status: doc.status
            });
          }
        });
      });
    });
    return results;
  },

  // 重建索引
  rebuildIndex(data) {
    this.index = null;
    this.buildIndex(data);
  }
};

globalThis.SearchEngine = SearchEngine;
