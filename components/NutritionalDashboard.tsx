
import React from 'react';
import { OrderRecord } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface NutritionalDashboardProps {
  orders: OrderRecord[];
}

const NutritionalDashboard: React.FC<NutritionalDashboardProps> = ({ orders }) => {
  // 计算总摄入量
  const totals = orders.reduce((acc, order) => ({
    calories: acc.calories + order.nutrition.calories,
    protein: acc.protein + order.nutrition.protein,
    carbs: acc.carbs + order.nutrition.carbs,
    fat: acc.fat + order.nutrition.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  // 计算平均比例数据
  const chartData = [
    { name: '蛋白质', value: totals.protein, color: '#3b82f6' },
    { name: '碳水化合物', value: totals.carbs, color: '#f59e0b' },
    { name: '脂肪', value: totals.fat, color: '#ef4444' },
  ];

  return (
    <div className="space-y-8">
      {/* 顶部总览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 font-medium">累计摄入热量</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{totals.calories.toLocaleString()} <span className="text-sm font-normal text-gray-400">kcal</span></p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 font-medium">累计蛋白质</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{totals.protein.toFixed(1)} <span className="text-sm font-normal text-gray-400">g</span></p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 font-medium">累计碳水</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{totals.carbs.toFixed(1)} <span className="text-sm font-normal text-gray-400">g</span></p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 font-medium">累计脂肪</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{totals.fat.toFixed(1)} <span className="text-sm font-normal text-gray-400">g</span></p>
        </div>
      </div>

      {/* 比例分析图表 */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center">
        <div className="w-full md:w-1/2 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value.toFixed(1)}g`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full md:w-1/2 mt-8 md:mt-0 md:pl-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">实际饮食比例分析</h2>
          <p className="text-gray-500 mb-6 text-sm">此分析基于您的 {orders.length} 笔点餐记录，真实反映您的摄入结构。</p>
          <div className="space-y-4">
            {chartData.map(item => {
              const totalGrams = totals.protein + totals.carbs + totals.fat;
              const percentage = totalGrams > 0 ? (item.value / totalGrams) * 100 : 0;
              return (
                <div key={item.name}>
                  <div className="flex justify-between text-sm font-medium mb-1">
                    <span>{item.name}</span>
                    <span className="text-gray-400">{percentage.toFixed(1)}% ({item.value.toFixed(1)}g)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-700" 
                      style={{ width: `${percentage}%`, backgroundColor: item.color }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 订单营养明细表 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">订单营养明细</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3">订单菜品</th>
                <th className="px-6 py-3">热量</th>
                <th className="px-6 py-3">蛋白质</th>
                <th className="px-6 py-3">碳水</th>
                <th className="px-6 py-3">脂肪</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-800">{order.dishName}</div>
                    <div className="text-[10px] text-gray-400">{new Date(order.date).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">{order.nutrition.calories} kcal</td>
                  <td className="px-6 py-4 text-sm font-medium text-blue-600">{order.nutrition.protein}g</td>
                  <td className="px-6 py-4 text-sm font-medium text-yellow-600">{order.nutrition.carbs}g</td>
                  <td className="px-6 py-4 text-sm font-medium text-red-600">{order.nutrition.fat}g</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && (
          <div className="p-12 text-center text-gray-400 italic">
            请先在“订单历史”中添加点餐记录，系统将自动汇总您的饮食营养数据。
          </div>
        )}
      </div>
    </div>
  );
};

export default NutritionalDashboard;
