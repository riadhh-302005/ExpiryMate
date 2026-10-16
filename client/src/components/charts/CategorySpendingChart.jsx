// ============================================================================
// File: client/src/components/charts/CategorySpendingChart.jsx
// 1. What this file does:
//    Draws a clean donut (pie) chart that shows what percentage of money
//    was spent in each category (like Electronics, Groceries, Clothing, etc.).
// 2. Why this file exists in the application:
//    To help users instantly see which categories take up most of their budget.
// 3. Important points to remember:
//    - Takes a `data` prop with an array of objects: `{ category, amount }`.
//    - Uses distinct, pleasant colors for each category slice.
//    - Shows a helpful tooltip and legend formatted with Indian Rupees (₹).
// 4. How it connects to other parts of the application:
//    Rendered on the DashboardPage.jsx alongside the monthly spending chart.
// ============================================================================

import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const COLORS = [
  '#1e293b', // Slate 800
  '#4f46e5', // Indigo 600
  '#0d9488', // Teal 600
  '#3b82f6', // Blue 500
  '#f59e0b', // Amber 500
  '#f43f5e', // Rose 500
  '#8b5cf6', // Violet 500
  '#10b981'  // Emerald 500
];

const CategorySpendingChart = ({ data = [] }) => {
  const filteredData = data ? data.filter((item) => item.amount > 0) : [];

  if (!filteredData.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
        <PieIcon className="w-8 h-8 stroke-1 text-slate-300 mb-2" />
        <p className="font-medium text-slate-500">No category expenses recorded yet</p>
        <p className="text-[11px] text-slate-400 mt-0.5">Purchases will be grouped by category here</p>
      </div>
    );
  }

  const totalAmount = filteredData.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const percentage = totalAmount > 0 ? ((item.value / totalAmount) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white px-3 py-2 rounded-lg shadow-sm border border-slate-200 text-xs">
          <p className="font-semibold text-slate-800">{item.name}</p>
          <p className="text-slate-900 font-bold mt-0.5 tabular-nums">
            {formatCurrency(item.value)}
            <span className="text-slate-400 font-normal ml-1">({percentage}%)</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={filteredData}
            cx="50%"
            cy="46%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="amount"
            nameKey="category"
          >
            {filteredData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="#ffffff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => (
              <span className="text-[11px] text-slate-600 font-medium">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategorySpendingChart;
