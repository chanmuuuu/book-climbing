// Navbar.js
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaChartColumn } from 'react-icons/fa6';
import './App.css';

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const toggleMenu = () => {
        setIsMenuOpen(prev => !prev);
    };

    // 📍 外側クリックでメニューを閉じる処理
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    return (
        <nav className="navbar">
            {/* 左：ロゴ */}
            <Link to="/" className="logo">ブックラ</Link>

            {/* 中央：読んだ本・読みたい本 */}
            <ul className="nav-links-center">
                <li><Link to="/read-books">読んだ本</Link></li>
                <li><Link to="/want-to-read-books">読みたい本</Link></li>
            </ul>

            {/* 右：チャートアイコン・マイページ */}
            <ul className="nav-links-right">
                <li><Link to="/reading-chart" className="nav-item icon-link"><FaChartColumn /></Link></li>
                <li><Link to="/mypage" className="nav-item">👤</Link></li>
            </ul>

            {/* スマホ用：ハンバーガーアイコン */}
            <div className="hamburger-menu" onClick={toggleMenu}>
                ☰
            </div>

            {/* スマホ用：ハンバーガーメニュー内容 */}
            {isMenuOpen && (
                <div ref={menuRef} className="mobile-menu">
                    <Link to="/reading-chart"><FaChartColumn /> チャート</Link>
                    <Link to="/mypage">👤 マイページ</Link>
                </div>
            )}
        </nav>
    );
}

export default Navbar;
