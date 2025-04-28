// 必要なモジュールを読み込む
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 3001;

// ミドルウェア設定（CORS許可およびJSONパース対応）
app.use(cors());
app.use(express.json());

// MongoDBに接続する（接続成功・失敗時にログ出力する）
mongoose.connect('mongodb://localhost:27017/bookclimbing', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

// 書籍情報スキーマを定義する
const bookSchema = new mongoose.Schema({
    title: String,           // 書籍タイトル
    author: String,          // 著者名
    totalPages: Number,      // 総ページ数
    pagesRead: Number,       // 読了ページ数
    thumbnail: String,       // サムネイル画像URL
    createdAt: {
        type: Date,
        default: Date.now    // 登録日時（デフォルト現在時刻）
    }
});

// 読んだ本、読みたい本コレクションに対してモデルを作成する
const ReadBook = mongoose.model('ReadBook', bookSchema);
const WantToReadBook = mongoose.model('WantToReadBook', bookSchema);

// --- 📖 ReadBook（読んだ本）用APIエンドポイント ---

// 読了書籍一覧を取得する
app.get('/api/read-books', async (req, res) => {
    try {
        const readBooks = await ReadBook.find();
        res.json(readBooks);
    } catch (err) {
        res.status(500).json({ error: '読んだ本の取得に失敗しました。' });
    }
});

// 読了書籍を新規登録する
app.post('/api/read-books', async (req, res) => {
    try {
        const book = new ReadBook(req.body);
        const savedBook = await book.save();
        res.json(savedBook);
    } catch (err) {
        res.status(500).json({ error: '読んだ本の保存に失敗しました。' });
    }
});

// 読了書籍を削除する
app.delete('/api/read-books/:id', async (req, res) => {
    try {
        await ReadBook.findByIdAndDelete(req.params.id);
        res.sendStatus(204);
    } catch (err) {
        res.status(500).json({ error: '読んだ本の削除に失敗しました。' });
    }
});

// --- 📖 WantToReadBook（読みたい本）用APIエンドポイント ---

// 読みたい本一覧を取得する
app.get('/api/want-to-read-books', async (req, res) => {
    try {
        const wantToReadBooks = await WantToReadBook.find();
        res.json(wantToReadBooks);
    } catch (err) {
        res.status(500).json({ error: '読みたい本の取得に失敗しました。' });
    }
});

// 読みたい本を新規登録する
app.post('/api/want-to-read-books', async (req, res) => {
    try {
        const book = new WantToReadBook(req.body);
        const savedBook = await book.save();
        res.json(savedBook);
    } catch (err) {
        res.status(500).json({ error: '読みたい本の保存に失敗しました。' });
    }
});

// 読みたい本を削除する
app.delete('/api/want-to-read-books/:id', async (req, res) => {
    try {
        await WantToReadBook.findByIdAndDelete(req.params.id);
        res.sendStatus(204);
    } catch (err) {
        res.status(500).json({ error: '読みたい本の削除に失敗しました。' });
    }
});

// --- サーバ起動 ---

// 指定ポートでサーバを起動し、リクエストを受け付ける
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
