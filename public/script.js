// API基础URL - 自动适配开发和生产环境
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/api'
  : '/api';

// 全局状态
let currentBook = null;
let currentChapterId = null;
let chaptersList = [];
let prevChapterId = null;
let nextChapterId = null;

// DOM元素缓存
const dom = {
  bookshelfView: document.getElementById('bookshelfView'),
  readerView: document.getElementById('readerView'),
  booksGrid: document.getElementById('booksGrid'),
  bookCount: document.getElementById('bookCount'),
  authorCard: document.getElementById('authorCard'),
  authorPhoto: document.getElementById('authorPhoto'),
  authorPhotoPlaceholder: document.getElementById('authorPhotoPlaceholder'),
  authorName: document.getElementById('authorName'),
  authorBio: document.getElementById('authorBio'),
  authorWorks: document.getElementById('authorWorks'),
  authorReaders: document.getElementById('authorReaders'),
  currentBookTitle: document.getElementById('currentBookTitle'),
  currentChapterTitle: document.getElementById('currentChapterTitle'),
  chapterContent: document.getElementById('chapterContent'),
  chapterProgress: document.getElementById('chapterProgress'),
  prevChapterBtn: document.getElementById('prevChapterBtn'),
  nextChapterBtn: document.getElementById('nextChapterBtn'),
  chapterSidebar: document.getElementById('chapterSidebar'),
  chapterList: document.getElementById('chapterList'),
  sidebarOverlay: document.getElementById('sidebarOverlay'),
  authorModal: document.getElementById('authorModal'),
  modalOverlay: document.getElementById('modalOverlay'),
  modalAuthorPhoto: document.getElementById('modalAuthorPhoto'),
  modalAuthorName: document.getElementById('modalAuthorName'),
  modalAuthorBirth: document.getElementById('modalAuthorBirth'),
  modalAuthorBio: document.getElementById('modalAuthorBio'),
  modalAuthorWorks: document.getElementById('modalAuthorWorks'),
  modalAuthorReaders: document.getElementById('modalAuthorReaders'),
  worksList: document.getElementById('worksList')
};

// 初始化：加载书架
async function loadBookshelf() {
  try {
    dom.booksGrid.innerHTML = '<div class="loading-message">📚 正在加载书架...</div>';
    
    console.log('正在请求书架数据...', API_BASE + '/books');
    const response = await fetch(`${API_BASE}/books`);
    
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('书架数据:', result);

    if (result.success && result.data.length > 0) {
      renderBookshelf(result.data);
      dom.bookCount.textContent = `${result.data.length} 本书`;
    } else {
      dom.booksGrid.innerHTML = '<div class="error-message">📭 书架上还没有书，请添加书籍到数据库</div>';
      dom.bookCount.textContent = '0 本书';
    }
  } catch (error) {
    console.error('加载书架失败:', error);
    dom.booksGrid.innerHTML = `<div class="error-message">
      ❌ 无法连接到服务器<br>
      <small>错误: ${error.message}</small><br>
      <small>API地址: ${API_BASE}/books</small><br>
      <button onclick="loadBookshelf()" style="margin-top:10px;padding:8px 16px;border-radius:20px;border:1px solid #ccc;background:#fff;cursor:pointer;">
        🔄 重试
      </button>
    </div>`;
    dom.bookCount.textContent = '连接失败';
  }
}

// 渲染书架
function renderBookshelf(books) {
  dom.booksGrid.innerHTML = books.map(book => `
    <div class="book-card" onclick="openBook('${book.id}')">
      <div class="book-cover">
        ${book.cover ? `<img src="${book.cover}" alt="${escapeHtml(book.title)}" onerror="this.parentElement.innerHTML='${escapeHtml(book.title[0])}'">` : escapeHtml(book.title[0])}
      </div>
      <div class="book-info">
        <div class="book-title">${escapeHtml(book.title)}</div>
        <div class="book-author">${escapeHtml(book.author)}</div>
        <div class="book-summary">${book.chapterCount} 章 · ${escapeHtml(book.summary || '')}</div>
      </div>
    </div>
  `).join('');
}

// 打开书籍
async function openBook(bookId) {
  try {
    console.log('正在打开书籍:', bookId);
    const response = await fetch(`${API_BASE}/books/${bookId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('书籍数据:', result);

    if (result.success) {
      currentBook = result.data;
      chaptersList = result.data.chapters;

      // 更新阅读器UI
      updateReaderInfo();

      // 切换到阅读器视图
      dom.bookshelfView.classList.add('hidden');
      dom.readerView.classList.remove('hidden');

      // 加载第一章
      if (chaptersList.length > 0) {
        await loadChapter(chaptersList[0].id);
      }
    } else {
      alert('打开书籍失败: ' + result.message);
    }
  } catch (error) {
    console.error('打开书籍失败:', error);
    alert('无法打开书籍: ' + error.message);
  }
}

// 更新阅读器信息
function updateReaderInfo() {
  if (!currentBook) return;

  dom.currentBookTitle.textContent = currentBook.title;

  // 更新作者信息
  if (currentBook.authorInfo) {
    const author = currentBook.authorInfo;
    dom.authorName.textContent = author.name;
    dom.authorBio.textContent = author.bio || '点击查看作者详细介绍';
    dom.authorWorks.textContent = author.works ? author.works.length : 0;
    dom.authorReaders.textContent = formatNumber(author.readers || 0);

    // 作者照片
    if (author.photo) {
      dom.authorPhoto.src = author.photo;
      dom.authorPhoto.classList.remove('hidden');
      dom.authorPhotoPlaceholder.classList.add('hidden');
    } else {
      dom.authorPhoto.classList.add('hidden');
      dom.authorPhotoPlaceholder.classList.remove('hidden');
      dom.authorPhotoPlaceholder.textContent = author.name[0] || '👤';
    }
  }

  // 渲染章节列表
  renderChapterList();
}

// 渲染章节列表
function renderChapterList() {
  if (!chaptersList.length) {
    dom.chapterList.innerHTML = '<div class="loading-message">暂无章节</div>';
    return;
  }

  dom.chapterList.innerHTML = chaptersList.map(chapter => `
    <div class="chapter-item ${chapter.id === currentChapterId ? 'active' : ''}" 
         onclick="loadChapter('${chapter.id}')">
      <div class="chapter-item-number">第${chapter.number}章</div>
      <div class="chapter-item-title">${escapeHtml(chapter.title)}</div>
    </div>
  `).join('');
}

// 加载章节内容
async function loadChapter(chapterId) {
  if (!currentBook) return;

  try {
    dom.chapterContent.innerHTML = '<div class="loading-spinner">📖 正在加载章节...</div>';
    
    console.log('正在加载章节:', chapterId);
    const response = await fetch(`${API_BASE}/books/${currentBook.id}/chapters/${chapterId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('章节数据:', result);

    if (result.success) {
      const data = result.data;
      currentChapterId = data.id;
      prevChapterId = data.prevChapter?.id || null;
      nextChapterId = data.nextChapter?.id || null;

      // 更新章节标题
      dom.currentChapterTitle.textContent = data.title;

      // 显示章节内容
      dom.chapterContent.innerHTML = formatChapterContent(data.content);

      // 更新进度
      dom.chapterProgress.textContent = `${data.chapterIndex + 1}/${data.totalChapters}`;

      // 滚动到顶部
      document.getElementById('readingArea').scrollTop = 0;

      // 更新按钮状态
      dom.prevChapterBtn.disabled = !prevChapterId;
      dom.nextChapterBtn.disabled = !nextChapterId;

      // 更新章节列表高亮
      renderChapterList();
    } else {
      dom.chapterContent.innerHTML = `<div class="error-message">❌ ${result.message}</div>`;
    }
  } catch (error) {
    console.error('加载章节失败:', error);
    dom.chapterContent.innerHTML = `<div class="error-message">
      ❌ 加载失败<br>
      <small>${error.message}</small><br>
      <button onclick="loadChapter('${chapterId}')" style="margin-top:10px;padding:8px 16px;border-radius:20px;border:1px solid #ccc;background:#fff;cursor:pointer;">
        🔄 重试
      </button>
    </div>`;
  }
}

// 格式化章节内容
function formatChapterContent(text) {
  if (!text) return '<p>暂无内容</p>';

  // 将文本按段落分割
  const paragraphs = text.split('\n\n').filter(p => p.trim() !== '');

  if (paragraphs.length === 0) {
    // 如果没有空行分隔，按单行处理
    return `<p>${escapeHtml(text).replace(/\n/g, '<br>')}</p>`;
  }

  return paragraphs.map(p => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`).join('');
}

// 翻页功能
function prevChapter() {
  if (prevChapterId) {
    loadChapter(prevChapterId);
  }
}

function nextChapter() {
  if (nextChapterId) {
    loadChapter(nextChapterId);
  }
}

// 显示作者详情弹窗
function showAuthorModal() {
  if (!currentBook || !currentBook.authorInfo) return;

  const author = currentBook.authorInfo;

  dom.modalAuthorName.textContent = author.name;
  dom.modalAuthorBio.textContent = author.bio || '暂无详细介绍';
  dom.modalAuthorBirth.textContent = author.birthYear ? `生于 ${author.birthYear} 年` : '';
  dom.modalAuthorWorks.textContent = author.works ? author.works.length : 0;
  dom.modalAuthorReaders.textContent = formatNumber(author.readers || 0);

  // 作者照片
  if (author.photo) {
    dom.modalAuthorPhoto.src = author.photo;
    dom.modalAuthorPhoto.classList.remove('hidden');
    const placeholder = dom.modalAuthorPhoto.parentElement.querySelector('.author-photo-placeholder');
    if (placeholder) placeholder.classList.add('hidden');
  }

  // 作品列表
  if (author.works && author.works.length > 0) {
    dom.worksList.innerHTML = author.works.map(work =>
      `<span class="work-tag">${escapeHtml(work)}</span>`
    ).join('');
  } else {
    dom.worksList.innerHTML = '<span class="work-tag">暂无作品信息</span>';
  }

  dom.authorModal.classList.remove('hidden');
}

// HTML转义
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 格式化数字
function formatNumber(num) {
  if (!num) return '0';
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toString();
}

// ============ 事件监听 ============

// 翻页按钮
dom.prevChapterBtn.addEventListener('click', prevChapter);
dom.nextChapterBtn.addEventListener('click', nextChapter);

// 章节选择按钮
document.getElementById('chapterSelectorBtn').addEventListener('click', () => {
  dom.chapterSidebar.classList.remove('hidden');
});

// 关闭章节侧边栏
document.getElementById('closeSidebarBtn').addEventListener('click', () => {
  dom.chapterSidebar.classList.add('hidden');
});
dom.sidebarOverlay.addEventListener('click', () => {
  dom.chapterSidebar.classList.add('hidden');
});

// 返回书架
document.getElementById('backToShelfBtn').addEventListener('click', () => {
  dom.readerView.classList.add('hidden');
  dom.bookshelfView.classList.remove('hidden');
  dom.chapterSidebar.classList.add('hidden');
  currentBook = null;
  currentChapterId = null;
});

// 作者卡片点击
dom.authorCard.addEventListener('click', showAuthorModal);

// 关闭作者弹窗
document.getElementById('closeAuthorModal').addEventListener('click', () => {
  dom.authorModal.classList.add('hidden');
});
dom.modalOverlay.addEventListener('click', () => {
  dom.authorModal.classList.add('hidden');
});

// 刷新按钮
document.getElementById('refreshBtn').addEventListener('click', () => {
  if (!dom.readerView.classList.contains('hidden')) {
    // 在阅读器中，刷新当前章节
    if (currentChapterId) {
      loadChapter(currentChapterId);
    }
  } else {
    // 在书架中，重新加载书架
    loadBookshelf();
  }
});

// 键盘快捷键
document.addEventListener('keydown', (e) => {
  if (dom.readerView.classList.contains('hidden')) return;

  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    prevChapter();
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    nextChapter();
  } else if (e.key === 'Escape') {
    dom.chapterSidebar.classList.add('hidden');
    dom.authorModal.classList.add('hidden');
  }
});

// 启动应用
console.log('🌐 API地址:', API_BASE);
console.log('📍 当前域名:', window.location.hostname);
loadBookshelf();