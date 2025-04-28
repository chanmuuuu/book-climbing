import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import MyPage from './MyPage';
import ReadingChart from './ReadingChart';
import ReadBooksPage from './ReadBooksPage';
import WantToReadBooksPage from './WantToReadBooksPage';
import { FaChartColumn } from 'react-icons/fa6';

function App() {
  return (
    <div>
      {/* ナビゲーションバー */}
      <nav className="navbar">
        {/* 左：ロゴ */}
        <Link to="/" className="logo">ブックラ</Link>

        {/* 中央：読んだ本・読みたい本 */}
        <ul className="nav-links-center">
          <li><Link to="/read-books" className="nav-item">読んだ本</Link></li>
          <li><Link to="/want-to-read-books" className="nav-item">読みたい本</Link></li>
        </ul>

        {/* 右：チャートとマイページ */}
        <ul className="nav-links-right">
          <li><Link to="/reading-chart" className="nav-item icon-link"><FaChartColumn /></Link></li>
          <li><Link to="/mypage" className="nav-item">マイページ</Link></li>
        </ul>
      </nav>

      {/* ルーティング設定 */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/reading-chart" element={<ReadingChart />} />
        <Route path="/read-books" element={<ReadBooksPage />} />
        <Route path="/want-to-read-books" element={<WantToReadBooksPage />} />
      </Routes>
    </div>
  );
}

export default App;
