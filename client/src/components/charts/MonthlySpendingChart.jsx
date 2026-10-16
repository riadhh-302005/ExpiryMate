// ============================================================================
// File: client/src/components/charts/MonthlySpendingChart.jsx
// 1. What this file does:
//    Draws a clean bar chart showing how much money the user spent in each
//    of the last 6 months using the Recharts library.
// 2. Why this file exists in the application:
//    To give users a quick visual overview of their monthly spending trends
//    in Indian Rupees (₹) without clutter or confusion.
// 3. Important points to remember:
//    - Takes a `data` prop with an array of objects: `{ month, amount }`.
//    - Formats all money numbers into Rupees (₹) on the axes and tooltips.
//    - Uses a responsive container so it automatically fits any screen size.
// 4. How it connects to other parts of the application:
//    Shown on the DashboardPage.jsx using data fetched from the backend stats API.
// ============================================================================

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const MonthlySpendingChart = ({ data = [] }) => {
  const hasData = data && data.some((item) => item.amount > 0);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
        <BarChart3 className="w-8 h-8 stroke-1 text-slate-300 mb-2" />
        <p className="font-medium text-slate-500">No monthly expenses recorded yet</p>
        <p className="text-[11px] text-slate-400 mt-0.5">Purchases will appear here grouped by month</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-3 py-2 rounded-lg shadow-sm border border-slate-200 text-xs">
          <p className="font-semibold text-slate-700">{label}</p>
          <p className="text-slate-900 font-bold mt-0.5 tabular-nums">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickFormatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
          <Bar
            dataKey="amount"
            fill="#4f46e5"
            radius={[4, 4, 0, 0]}
            maxBarSize={36}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlySpendingChart;
