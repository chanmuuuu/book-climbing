// ReadingChart.js
import React, { useState, useEffect } from 'react';
import MonthlyBarChart from './components/MonthlyBarChart';
import './App.css'; // スタイル（year-selectorクラス）をここで適用する

// 読書チャートページコンポーネント
function ReadingChart() {
    const [readBooks, setReadBooks] = useState([]);                   // 読了書籍データ
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // 選択中の年（初期値は今年）
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

    // 📚 初回ロード時に読了書籍データを取得する
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/read-books`)
            .then(res => res.json())
            .then(data => setReadBooks(data))
            .catch(err => console.error('読了書籍データの取得エラー:', err));
    }, []);

    // 年度を変更するハンドラ
    const changeYear = (direction) => {
        setSelectedYear(prevYear => {
            const newYear = direction === 'prev' ? prevYear - 1 : prevYear + 1;
            const currentYear = new Date().getFullYear();
            // 未来の年には進めない
            return newYear > currentYear ? currentYear : newYear;
        });
    };

    return (
        <div className="App">
            <h1>読書チャート 📈</h1>

            {/* 年度選択エリア（ファイル分離せずこの中で完結） */}
            <div className="year-selector">
                <button onClick={() => changeYear('prev')}>◀</button>
                <h2>{selectedYear}年</h2>
                <button
                    onClick={() => changeYear('next')}
                    disabled={selectedYear >= new Date().getFullYear()}
                >
                    ▶
                </button>
            </div>

            {/* 📊 月別読書データの棒グラフ表示 */}
            <MonthlyBarChart books={readBooks} selectedYear={selectedYear} />
        </div>
    );
}

export default ReadingChart;
