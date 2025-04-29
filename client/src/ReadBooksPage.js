// ReadBooksPage.js
import React, { useState, useEffect, useRef } from 'react';
import './App.css'; // 共通スタイルを適用

function ReadBooksPage() {
    const [readBooks, setReadBooks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const dropdownRef = useRef();
    const itemRefs = useRef([]);
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        fetchReadBooks();
    }, []);

    const fetchReadBooks = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/read-books`);
            const data = await res.json();
            setReadBooks(data);
        } catch (err) {
            console.error('読んだ本の取得エラー:', err);
        }
    };

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

    useEffect(() => {
        if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
            itemRefs.current[selectedIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }
    }, [selectedIndex]);

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

    const handleSelectBook = async (info) => {
        const bookToRegister = {
            title: info.title || '',
            author: info.authors ? info.authors.join(', ') : '',
            totalPages: info.pageCount || 0,
            pagesRead: info.pageCount || 0,
            thumbnail: info.imageLinks?.thumbnail || '',
        };

        try {
            const res = await fetch(`${API_BASE_URL}/api/read-books`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookToRegister),
            });
            const newBook = await res.json();
            setReadBooks(prev => [...prev, newBook]);
            setSearchResults([]);
            setSearchTerm('');
            setSelectedIndex(-1);
        } catch (err) {
            console.error('読了書籍の登録エラー:', err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await fetch(`${API_BASE_URL}/api/read-books/${id}`, { method: 'DELETE' });
            setReadBooks(prev => prev.filter(book => book._id !== id));
        } catch (err) {
            console.error('削除エラー:', err);
        }
    };

    // 🆕 移動処理（読んだ本 ➔ 読みたい本）
    const handleMoveToWantToRead = async (book) => {
        const bookToRegister = {
            title: book.title,
            author: book.author,
            totalPages: book.totalPages,
            pagesRead: 0, // 読みたい本は0にする
            thumbnail: book.thumbnail,
            createdAt: new Date(), // 新しい日付に更新
        };

        try {
            // 先に want-to-read-books に登録
            await fetch(`${API_BASE_URL}/api/want-to-read-books`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookToRegister),
            });

            // 登録できたら、read-books から削除
            await fetch(`${API_BASE_URL}/api/read-books/${book._id}`, {
                method: 'DELETE',
            });

            // 画面のリストからも削除
            setReadBooks(prev => prev.filter(b => b._id !== book._id));
        } catch (err) {
            console.error('読みたい本への移動エラー:', err);
        }
    };

    return (
        <div className="App">
            <h1>読んだ本 📚</h1>

            {/* 🔍 書籍検索 */}
            <div className="search-container">
                <input
                    type="text"
                    placeholder="読んだ本を検索"
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

            {/* 📚 登録済みリスト */}
            <div className="book-gallery">
                {readBooks.map(book => (
                    <div key={book._id} className="book-card-wrapper">
                        <div className="book-card">
                            <button
                                className="delete-button"
                                onClick={() => handleDelete(book._id)}
                                title="この本を削除"
                            >
                                ☓
                            </button>
                            <img src={book.thumbnail} alt={book.title} className="book-thumbnail" />
                            <div className="book-meta">
                                <div className="book-title" title={book.title}>{book.title}</div>
                                <div className="book-author" title={book.author}>{book.author}</div>
                            </div>
                        </div>
                        {/* 🆕 「読みたい本に移動」ボタン */}
                        <button className="move-button" onClick={() => handleMoveToWantToRead(book)}>
                            読みたい本に移動
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ReadBooksPage;
