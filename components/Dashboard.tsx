
import React, { useState, useEffect } from 'react';
import { Dish, OrderRecord, MealType, Page } from '../types';
import { getDailySummary } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  dishes: Dish[];
  orders: OrderRecord[];
}

const Dashboard: React.FC<DashboardProps> = ({ dishes, orders }) => {
  const [dailySummary, setDailySummary] = useState<string>('正在同步 AI 指南...');
  const [recommendations, setRecommendations] = useState<Dish[]>([]);
  
  const today = new Date().toLocaleDateString('zh-CN');
  const todayOrders = orders.filter(o => new Date(o.date).toLocaleDateString('zh-CN') === today);
  
  const totals = todayOrders.reduce((acc, o) => ({
    calories: acc.calories + o.nutrition.calories,
    protein: acc.protein + o.nutrition.protein,
    carbs: acc.carbs + o.nutrition.carbs,
    fat: acc.fat + o.nutrition.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const targets = { calories: 2200, protein: 65, carbs: 280, fat: 65 };

  const refreshRecommendations = () => {
    if (dishes.length === 0) return;
    const shuffled = [...dishes].sort(() => 0.5 - Math.random());
    setRecommendations(shuffled.slice(0, 3));
  };

  useEffect(() => {
    refreshRecommendations();
    const fetchSummary = async () => {
      if (todayOrders.length > 0) {
        const text = todayOrders.map(o => `${o.mealType}: ${o.dishName}`).join(', ');
        try {
          const summary = await getDailySummary(text);
          setDailySummary(summary);
        } catch(e) { setDailySummary('AI 建议生成失败。'); }
      } else {
        setDailySummary('今天还没开张？快去拍一张美食或导入订单吧！');
      }
    };
    fetchSummary();
  }, [todayOrders.length, dishes.length]);

  const categories = orders.reduce((acc: any, o) => {
    acc[o.storeName] = (acc[o.storeName] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(categories).map(name => ({
    name: name.substring(0, 6),
    fullName: name,
    count: categories[name]
  })).sort((a,b) => b.count - a.count).slice(0, 5);

  const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5'];

  const ProgressItem = ({ label, current, target, color }: { label: string, current: number, target: number, color: string }) => {
    const percent = Math.min(Math.round((current / target) * 100), 100);
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-gray-400">
          <span>{label}</span>
          <span>{current.toFixed(0)} / {target}g</span>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${percent}%` }}></div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* 新手引导卡片 */}
      {dishes.length === 0 && (
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-2">欢迎使用灵动外卖助手！🚀</h3>
            <p className="text-sm opacity-90 mb-4">只需三步，开启智能点餐生活：</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                <div className="text-xl mb-1">📸</div>
                <div className="text-xs font-bold">1. 扫描菜单</div>
                <div className="text-[10px] opacity-70">上传外卖单识别价格</div>
              </div>
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                <div className="text-xl mb-1">🎡</div>
                <div className="text-xs font-bold">2. 转盘决策</div>
                <div className="text-[10px] opacity-70">纠结时让上天帮你选</div>
              </div>
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                <div className="text-xl mb-1">📊</div>
                <div className="text-xs font-bold">3. 营养分析</div>
                <div className="text-[10px] opacity-70">AI 帮你监控卡路里</div>
              </div>
            </div>
          </div>
          <div className="absolute top-[-20%] right-[-10%] text-9xl opacity-10">🍱</div>
        </div>
      )}

      {/* Top Decisions */}
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-orange-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800 flex items-center text-sm md:text-base">
            <span className="text-lg mr-2">💡</span> 今日灵感
          </h3>
          {dishes.length > 0 && (
            <button onClick={refreshRecommendations} className="text-[10px] font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full">换一批</button>
          )}
        </div>
        
        {dishes.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-400 text-xs italic">库里空空如也，请先扫描录入外卖单...</p>
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar md:grid md:grid-cols-3 md:pb-0">
            {recommendations.map(dish => (
              <div key={dish.id} className="min-w-[140px] md:min-w-0 p-3 bg-orange-50/50 rounded-xl border border-orange-100 flex flex-col justify-between hover:border-orange-300 transition-colors">
                <div>
                  <h4 className="font-bold text-gray-800 text-xs line-clamp-1">{dish.name}</h4>
                  <p className="text-[9px] text-gray-400 truncate">{dish.storeName}</p>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-orange-600">¥{dish.price}</span>
                  <span className="text-[8px] text-gray-400">🕒 {dish.deliveryTimeMinutes}m</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm md:text-base font-bold text-gray-800 mb-6 flex items-center">
            <span className="w-1.5 h-4 bg-orange-500 rounded-full mr-2"></span>
            每日摄入看板
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col justify-center items-center p-6 bg-orange-50 rounded-2xl">
              <p className="text-[10px] text-orange-600 font-bold mb-1 uppercase">今日累计热量</p>
              <div className="flex items-baseline">
                 <span className="text-4xl font-black text-orange-700">{totals.calories.toFixed(0)}</span>
                 <span className="text-xs text-orange-400 ml-1">kcal</span>
              </div>
            </div>
            <div className="space-y-3">
              <ProgressItem label="蛋白质" current={totals.protein} target={targets.protein} color="bg-blue-500" />
              <ProgressItem label="碳水" current={totals.carbs} target={targets.carbs} color="bg-yellow-500" />
              <ProgressItem label="脂肪" current={totals.fat} target={targets.fat} color="bg-red-500" />
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-50 italic text-xs text-gray-500 leading-relaxed">
            <span className="font-bold text-gray-700 not-italic mr-1">🤖 AI 复盘:</span>
            {dailySummary}
          </div>
        </div>
        
        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 h-64 md:h-auto">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">最爱店铺分布</h3>
          <div className="h-full pb-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} hide={true} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
