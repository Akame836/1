
import React, { useState } from 'react';
import { Dish } from '../types';
import { analyzeNutrition } from '../services/geminiService';

interface DishCatalogProps {
  dishes: Dish[];
  onAddManual: (dish: Dish) => void;
}

const DishCatalog: React.FC<DishCatalogProps> = ({ dishes, onAddManual }) => {
  const [sortBy, setSortBy] = useState<'price' | 'time'>('price');
  const [filter, setFilter] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [mStore, setMStore] = useState('');
  const [mName, setMName] = useState('');
  const [mPrice, setMPrice] = useState('');
  const [mTime, setMTime] = useState('30');
  const [loading, setLoading] = useState(false);

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mStore || !mName || !mPrice) return;
    
    setLoading(true);
    // 即使 analyzeNutrition 内部报错（没 Key），它现在也会返回默认值
    const nutrition = await analyzeNutrition(mName);
    
    onAddManual({
      id: `manual-${Date.now()}`,
      storeName: mStore,
      name: mName,
      price: parseFloat(mPrice),
      deliveryTimeMinutes: parseInt(mTime),
      category: '手动录入',
      nutrition
    });
    
    setMName('');
    setMPrice('');
    setMStore('');
    setShowAddForm(false);
    setLoading(false);
  };

  const filteredDishes = dishes
    .filter(d => d.name.toLowerCase().includes(filter.toLowerCase()) || d.storeName.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      return a.deliveryTimeMinutes - b.deliveryTimeMinutes;
    });

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="搜索已有菜品或店铺..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full md:w-auto px-6 py-3 bg-gray-900 text-white text-sm rounded-xl font-bold hover:bg-black transition-colors"
        >
          {showAddForm ? '取消' : '+ 纯手动打字录入'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleManualAdd} className="bg-white p-5 rounded-2xl border-2 border-orange-200 shadow-lg space-y-4 animate-in slide-in-from-top duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={mStore} onChange={e=>setMStore(e.target.value)} placeholder="店铺名称 (如: 麦当劳)" className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-orange-500" required />
            <input value={mName} onChange={e=>setMName(e.target.value)} placeholder="菜品名称 (如: 巨无霸)" className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-orange-500" required />
            <input value={mPrice} onChange={e=>setMPrice(e.target.value)} type="number" step="0.01" placeholder="实付价格 ¥" className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-orange-500" required />
            <input value={mTime} onChange={e=>setMTime(e.target.value)} type="number" placeholder="配送时间 (分钟)" className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <button disabled={loading} className="w-full bg-orange-600 text-white rounded-lg p-3 font-bold text-sm hover:bg-orange-700 disabled:opacity-50 shadow-md">
            {loading ? '保存中...' : '确认添加'}
          </button>
        </form>
      )}

      <div className="flex items-center space-x-4 border-b border-gray-100 pb-3 overflow-x-auto no-scrollbar">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider shrink-0">排序:</span>
          <button onClick={() => setSortBy('price')} className={`text-xs font-bold shrink-0 ${sortBy === 'price' ? 'text-orange-600' : 'text-gray-400'}`}>最省钱</button>
          <button onClick={() => setSortBy('time')} className={`text-xs font-bold shrink-0 ${sortBy === 'time' ? 'text-orange-600' : 'text-gray-400'}`}>最快速</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
        {filteredDishes.map((dish) => (
          <div key={dish.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
            <div className="h-20 bg-orange-50 flex items-center justify-center relative">
              <span className="text-2xl">🍱</span>
              <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-green-500 rounded-lg text-[9px] font-bold text-white shadow-sm">
                 ¥{dish.price.toFixed(1)}
              </div>
            </div>
            <div className="p-3 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-gray-800 text-xs line-clamp-1">{dish.name}</h4>
                <p className="text-[9px] text-gray-400 truncate">{dish.storeName}</p>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50 text-[9px] text-gray-400">
                <span>🕒 {dish.deliveryTimeMinutes}m</span>
                <span className="font-bold text-orange-400">{dish.nutrition.calories}cal</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredDishes.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-400 text-sm">还没有菜品。点击上方按钮手动输入吧！</p>
        </div>
      )}
    </div>
  );
};

export default DishCatalog;
