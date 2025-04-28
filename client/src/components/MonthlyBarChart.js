// components/MonthlyBarChart.js
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// 📊 月ラベル作成
const months = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
];

function MonthlyBarChart({ books, selectedYear }) {
    if (!books || !Array.isArray(books)) {
        return <p>グラフのデータがありません</p>;
    }

    // 📚 月ごと集計
    const monthlyCount = {};
    months.forEach((_, index) => {
        monthlyCount[index + 1] = 0;
    });

    books.forEach((book) => {
        if (book.createdAt) {
            const date = new Date(book.createdAt);
            if (date.getFullYear() === selectedYear) {
                const month = date.getMonth() + 1; // JSは0-indexなので＋1
                monthlyCount[month]++;
            }
        }
    });

    // 📈 グラフ用データ成形
    const chartData = months.map((label, index) => ({
        month: label,
        count: monthlyCount[index + 1] || 0,
    }));

    // 📏 縦軸最大値を10の倍数に調整
    const maxCount = Math.max(...chartData.map(d => d.count));
    const yAxisMax = Math.ceil((maxCount || 10) / 10) * 10;

    // 🎯 カスタムツールチップ
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ background: 'white', border: '1px solid #ccc', padding: '8px', fontSize: '0.9rem' }}>
                    <div>読んだ冊数：{payload[0].value}冊</div>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, yAxisMax]} ticks={
                        Array.from({ length: 5 }, (_, i) => (yAxisMax / 5) * (i + 1))
                    } />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                        dataKey="count"
                        fill="#82ca9d"
                        barSize={20} // ← 棒を細めに
                        animationDuration={800} // ← ふわっと出す
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export default MonthlyBarChart;
