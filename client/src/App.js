import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import MyPage from './MyPage';
import ReadingChart from './ReadingChart';
import ReadBooksPage from './ReadBooksPage';
import WantToReadBooksPage from './WantToReadBooksPage';
import Navbar from './Navbar';

function App() {
  return (
    <div>
      {/* ナビゲーションバー */}
      <Navbar />

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
