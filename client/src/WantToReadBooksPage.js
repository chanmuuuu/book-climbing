// WantToReadBooksPage.js
import React, { useState, useEffect, useRef } from 'react';
import './App.css'; // 共通スタイルを適用する

function WantToReadBooksPage() {
    // -----------------------------
    // 🔧 状態管理（state）と参照（ref）
    // -----------------------------
    const [wantToReadBooks, setWantToReadBooks] = useState([]); // 読みたい本リスト
    const [searchTerm, setSearchTerm] = useState('');           // 検索キーワード
    const [searchResults, setSearchResults] = useState([]);     // 検索結果リスト
    const [selectedIndex, setSelectedIndex] = useState(-1);     // 選択中インデックス
    const dropdownRef = useRef();                               // ドロップダウン参照
    const itemRefs = useRef([]);                                // 各アイテム参照

    // -----------------------------
    // 📥 読みたい本一覧を初回取得する
    // -----------------------------
    useEffect(() => {
        fetchWantToReadBooks();
    }, []);

    const fetchWantToReadBooks = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/want-to-read-books');
            const data = await res.json();
            setWantToReadBooks(data);
        } catch (err) {
            console.error('読みたい本一覧の取得エラー:', err);
        }
    };

    // -----------------------------
    // 🔍 検索キーワード変更時にGoogle Books検索を実施（300msディレイ）
    // -----------------------------
    useEffect(() => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            return;
        }
        const delayDebounce = setTimeout(searchBooks, 300);
        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);

    const searchBooks = async () => {
        try {
            const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchTerm)}`);
            const data = await res.json();
            setSearchResults(data.items || []);
        } catch (err) {
            console.error('検索エラー:', err);
        }
    };

    // -----------------------------
    // ⌨️ キーボード操作で検索候補を移動する
    // -----------------------------
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setSearchResults([]);
            setSelectedIndex(-1);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            const info = searchResults[selectedIndex].volumeInfo;
            handleSelectBook(info);
        }
    };

    // -----------------------------
    // 🎯 検索候補をスクロール表示する
    // -----------------------------
    useEffect(() => {
        if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
            itemRefs.current[selectedIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }
    }, [selectedIndex]);

    // -----------------------------
    // 🖱 外部クリックで検索結果を閉じる
    // -----------------------------
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setSearchResults([]);
                setSelectedIndex(-1);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // -----------------------------
    // ✅ 書籍を「読みたい本リスト」に登録する
    // -----------------------------
    const handleSelectBook = async (info) => {
        const bookToRegister = {
            title: info.title || '',
            author: info.authors ? info.authors.join(', ') : '',
            totalPages: info.pageCount || 0,
            pagesRead: 0, // 読みたい本は未読なので0固定
            thumbnail: info.imageLinks?.thumbnail || '',
        };

        try {
            const res = await fetch('http://localhost:3001/api/want-to-read-books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookToRegister),
            });
            const newBook = await res.json();
            setWantToReadBooks(prev => [...prev, newBook]);
            setSearchResults([]);
            setSearchTerm('');
            setSelectedIndex(-1);
        } catch (err) {
            console.error('読みたい本の登録エラー:', err);
        }
    };

    // -----------------------------
    // ◀️ 「読みたい本」を「読んだ本」に移動する。
    // -----------------------------
    const handleMoveToReadBooks = (book) => {
        const bookToMove = {
            title: book.title,
            author: book.author,
            totalPages: book.totalPages,
            pagesRead: book.totalPages, // 読んだ本として全ページ読了扱い
            thumbnail: book.thumbnail,
            createdAt: new Date(), // 移動時点の日時をセット
        };

        // 1. 読んだ本コレクションにPOST
        fetch('http://localhost:3001/api/read-books', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookToMove),
        })
            .then(res => res.json())
            .then(() => {
                // 2. 成功したら読みたい本からDELETE
                fetch(`http://localhost:3001/api/want-to-read-books/${book._id}`, {
                    method: 'DELETE'
                })
                    .then(() => {
                        // 3. フロント側のリストからも除外
                        setWantToReadBooks(prev => prev.filter(b => b._id !== book._id));
                    })
                    .catch(err => console.error('削除エラー:', err));
            })
            .catch(err => console.error('登録エラー:', err));
    };

    // -----------------------------
    // ❌ 「読みたい本」を削除する
    // -----------------------------
    const handleDelete = async (id) => {
        try {
            await fetch(`http://localhost:3001/api/want-to-read-books/${id}`, { method: 'DELETE' });
            setWantToReadBooks(prev => prev.filter(book => book._id !== id));
        } catch (err) {
            console.error('読みたい本の削除エラー:', err);
        }
    };

    // -----------------------------
    // 🖼️ 画面描画（UI）
    // -----------------------------
    return (
        <div className="App">
            <h1>読みたい本 📚</h1>

            {/* 🔍 書籍検索エリア */}
            <div className="search-container">
                <input
                    type="text"
                    placeholder="読みたい本を検索"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                {searchTerm.trim() && (
                    <div ref={dropdownRef} className="search-results-dropdown">
                        {searchResults.length > 0 ? (
                            searchResults.map((item, index) => {
                                const info = item.volumeInfo;
                                return (
                                    <div
                                        key={item.id}
                                        ref={el => itemRefs.current[index] = el}
                                        className={`search-result-item ${index === selectedIndex ? 'selected' : ''}`}
                                        onClick={() => handleSelectBook(info)}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                    >
                                        {info.imageLinks?.thumbnail && (
                                            <img src={info.imageLinks.thumbnail} alt={info.title} className="search-thumb" />
                                        )}
                                        <div className="search-info">
                                            <strong>{info.title}</strong><br />
                                            <small>{info.authors?.join(', ')}</small>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="search-no-result">見つかりませんでした</div>
                        )}
                    </div>
                )}
            </div>

            {/* 📖 読みたい本ギャラリー */}
            <div className="book-gallery">
                {wantToReadBooks.map(book => (
                    <div key={book._id} className="book-card-wrapper">

                        <div key={book._id} className="book-card">
                            <button className="delete-button" onClick={() => handleDelete(book._id)} title="この本を削除">
                                ☓
                            </button>
                            <img src={book.thumbnail} alt={book.title} className="book-thumbnail" />
                            <div className="book-meta">
                                <div className="book-title" title={book.title}>{book.title}</div>
                                <div className="book-author" title={book.author}>{book.author}</div>
                            </div>

                        </div>
                        <button className="move-button" onClick={() => handleMoveToReadBooks(book)}>
                            読んだ本に移動
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default WantToReadBooksPage;
