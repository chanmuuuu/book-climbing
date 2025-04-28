// Home.js
import React, { useState, useEffect, useRef } from 'react';
import './App.css'; // 共通スタイル適用

function Home() {
    // 🔧 状態管理
    const [readBooks, setReadBooks] = useState([]);          // 読んだ本コレクション
    const [searchTerm, setSearchTerm] = useState('');         // 検索ワード
    const [searchResults, setSearchResults] = useState([]);   // 検索結果
    const [selectedIndex, setSelectedIndex] = useState(-1);   // 選択インデックス
    const [toastMessage, setToastMessage] = useState('');     // トースト通知
    const dropdownRef = useRef();
    const itemRefs = useRef([]);

    // 🏔️ 富士山登山ビジュアライゼーション用計算
    const FUJI_HEIGHT = 3776; // 富士山標高(m)
    const totalPagesRead = readBooks.reduce((sum, book) => sum + Number(book.pagesRead || 0), 0);
    const progressPercent = Math.min((totalPagesRead / FUJI_HEIGHT) * 100, 100);

    // 📥 初回 読んだ本一覧取得
    useEffect(() => {
        fetch('http://localhost:3001/api/read-books')
            .then(res => res.json())
            .then(data => setReadBooks(data))
            .catch(err => console.error('読んだ本の取得エラー:', err));
    }, []);

    // 🔍 検索ワード変更時、Google Books検索（300msディレイ）
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

    // ⌨️ キーボード操作
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
            // デフォルトは「読んだ本」として登録
            const info = searchResults[selectedIndex].volumeInfo;
            handleRegisterBook(info, 'read');
        }
    };

    // 🎯 検索候補スクロール表示
    useEffect(() => {
        if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
            itemRefs.current[selectedIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }
    }, [selectedIndex]);

    // 🖱 外部クリックでドロップダウンを閉じる
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

    // ✅ 本を「読みたい本」または「読んだ本」として登録
    const handleRegisterBook = async (info, type) => {
        const bookToRegister = {
            title: info.title || '',
            author: info.authors ? info.authors.join(', ') : '',
            totalPages: info.pageCount || 0,
            pagesRead: type === 'read' ? (info.pageCount || 0) : 0,
            thumbnail: info.imageLinks?.thumbnail || '',
        };

        const endpoint = type === 'read'
            ? 'http://localhost:3001/api/read-books'
            : 'http://localhost:3001/api/want-to-read-books';

        try {
            await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookToRegister),
            });

            setToastMessage(type === 'read' ? '✅ 読んだ本として登録しました！' : '📖 読みたい本として登録しました！');
            setTimeout(() => setToastMessage(''), 3000);

            if (type === 'read') {
                // 読んだ本を登録した場合のみ、リストを即更新
                fetch('http://localhost:3001/api/read-books')
                    .then(res => res.json())
                    .then(data => setReadBooks(data));
            }

            setSearchResults([]);
            setSearchTerm('');
            setSelectedIndex(-1);
        } catch (err) {
            console.error(`${type === 'read' ? '読んだ本' : '読みたい本'}の登録エラー:`, err);
        }
    };

    return (
        <div className="App">
            {/* 🔍 書籍検索エリア */}
            <h2>🔍 書籍を検索して登録</h2>
            <div className="search-container">
                <input
                    type="text"
                    placeholder="書籍を検索"
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
                                    >
                                        {info.imageLinks?.thumbnail && (
                                            <img src={info.imageLinks.thumbnail} alt={info.title} className="search-thumb" />
                                        )}
                                        <div className="search-info">
                                            <strong>{info.title}</strong><br />
                                            <small>{info.authors?.join(', ')}</small>
                                        </div>
                                        {/* 📚 登録ボタン */}
                                        <div className="register-buttons">
                                            <button onClick={() => handleRegisterBook(info, 'want')}>📖 読みたい</button>
                                            <button onClick={() => handleRegisterBook(info, 'read')}>✅ 読んだ</button>
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

            {/* 🧘‍♂️ 富士山登山ビジュアライゼーション */}
            <div className="climbing-area">
                <div
                    className="climber"
                    style={{ bottom: `${progressPercent}%` }}
                    title={`読んだページ数：${totalPagesRead}ページ`}
                >
                    🧘‍♂️
                </div>
                <img src="/mountain.png" alt="富士山" className="mountain" />
            </div>

            {/* ✅ トースト通知 */}
            {toastMessage && (
                <div className="toast">
                    {toastMessage}
                </div>
            )}

            <hr />
        </div>
    );
}

export default Home;
