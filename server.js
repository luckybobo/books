const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// 数据库路径
const DB_PATH = path.join(__dirname, 'database', 'novels.json');
const CHAPTERS_BASE_PATH = path.join(__dirname, 'database', 'chapters');

/**
 * 读取数据库配置
 */
async function readDatabase() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取数据库失败:', error);
    throw new Error('数据库读取失败，请确保 database/novels.json 存在');
  }
}

/**
 * 从文本文件读取章节内容
 */
async function readChapterFromFile(bookId, fileName) {
  try {
    const filePath = path.join(CHAPTERS_BASE_PATH, bookId, fileName);
    const content = await fs.readFile(filePath, 'utf8');
    return cleanText(content);
  } catch (error) {
    console.error(`读取章节文件失败 [${bookId}/${fileName}]:`, error.message);
    throw new Error(`章节文件不存在或读取失败: ${fileName}`);
  }
}

/**
 * 清理和格式化文本内容
 */
function cleanText(text) {
  return text
    .replace(/^\uFEFF/, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ============ API 路由 ============

// 获取所有书籍列表
app.get('/api/books', async (req, res) => {
  try {
    const db = await readDatabase();
    const booksList = db.books.map(book => ({
      id: book.id,
      title: book.title,
      author: book.author,
      authorId: book.authorId,
      cover: book.cover || null,
      chapterCount: book.chapters.length,
      summary: book.summary
    }));
    res.json({ success: true, data: booksList });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取书籍列表失败',
      error: error.message
    });
  }
});

// 获取单本书籍详情
app.get('/api/books/:bookId', async (req, res) => {
  try {
    const db = await readDatabase();
    const book = db.books.find(b => b.id === req.params.bookId);

    if (!book) {
      return res.status(404).json({ success: false, message: '书籍不存在' });
    }

    const author = db.authors.find(a => a.id === book.authorId) || null;

    const bookData = {
      id: book.id,
      title: book.title,
      author: book.author,
      authorId: book.authorId,
      cover: book.cover,
      summary: book.summary,
      authorInfo: author ? {
        id: author.id,
        name: author.name,
        photo: author.photo,
        bio: author.bio,
        works: author.works,
        birthYear: author.birthYear,
        readers: author.readers
      } : null,
      chapters: book.chapters.map(ch => ({
        id: ch.id,
        title: ch.title,
        number: ch.number,
        file: ch.file
      }))
    };

    res.json({ success: true, data: bookData });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取书籍详情失败',
      error: error.message
    });
  }
});

// 获取章节内容（从文本文件读取）
app.get('/api/books/:bookId/chapters/:chapterId', async (req, res) => {
  try {
    const { bookId, chapterId } = req.params;
    const db = await readDatabase();

    const book = db.books.find(b => b.id === bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: '书籍不存在' });
    }

    const chapter = book.chapters.find(ch => ch.id === chapterId);
    if (!chapter) {
      return res.status(404).json({ success: false, message: '章节不存在' });
    }

    // 从文本文件读取章节内容
    const content = await readChapterFromFile(bookId, chapter.file);

    const currentIndex = book.chapters.findIndex(ch => ch.id === chapterId);
    const prevChapter = currentIndex > 0 ? {
      id: book.chapters[currentIndex - 1].id,
      title: book.chapters[currentIndex - 1].title
    } : null;
    const nextChapter = currentIndex < book.chapters.length - 1 ? {
      id: book.chapters[currentIndex + 1].id,
      title: book.chapters[currentIndex + 1].title
    } : null;

    res.json({
      success: true,
      data: {
        id: chapter.id,
        title: chapter.title,
        content: content,
        number: chapter.number,
        bookId: book.id,
        bookTitle: book.title,
        authorName: book.author,
        prevChapter,
        nextChapter,
        chapterIndex: currentIndex,
        totalChapters: book.chapters.length
      }
    });
  } catch (error) {
    console.error('获取章节失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '获取章节内容失败'
    });
  }
});

// 获取作者详情
app.get('/api/authors/:authorId', async (req, res) => {
  try {
    const db = await readDatabase();
    const author = db.authors.find(a => a.id === req.params.authorId);

    if (!author) {
      return res.status(404).json({ success: false, message: '作者不存在' });
    }

    const authorBooks = db.books
      .filter(b => b.authorId === author.id)
      .map(b => ({ id: b.id, title: b.title, cover: b.cover }));

    res.json({
      success: true,
      data: {
        ...author,
        books: authorBooks
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取作者信息失败',
      error: error.message
    });
  }
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ success: false, message: '接口不存在' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ success: false, message: '服务器内部错误' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('📚 墨简阅读服务器已启动');
  console.log(`🌐 访问地址: http://localhost:${PORT}`);
  console.log(`📁 章节文件路径: ${CHAPTERS_BASE_PATH}`);
  console.log(`📋 数据库路径: ${DB_PATH}`);
  console.log('='.repeat(50));
  console.log('  - 将 .txt 文件放入 database/chapters/[book_id]/ 目录');
  console.log('  - 按 Ctrl+C 停止服务器');
  console.log('='.repeat(50));
});