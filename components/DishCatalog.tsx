
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
    try {
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
      setShowAddForm(false);
    } catch (e) {
      alert('获取营养数据失败，请重试');
    } finally {
      setLoading(false);
    }
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
          {showAddForm ? '取消录入' : '+ 手动补录菜品'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleManualAdd} className="bg-white p-5 rounded-2xl border border-orange-200 shadow-sm space-y-4 md:space-y-0 md:grid md:grid-cols-4 md:gap-4 animate-in slide-in-from-top duration-300">
          <input value={mStore} onChange={e=>setMStore(e.target.value)} placeholder="店名" className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-orange-500" required />
          <input value={mName} onChange={e=>setMName(e.target.value)} placeholder="菜名" className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-orange-500" required />
          <input value={mPrice} onChange={e=>setMPrice(e.target.value)} type="number" step="0.01" placeholder="实付价 ¥" className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-orange-500" required />
          <button disabled={loading} className="w-full bg-orange-600 text-white rounded-lg p-3 font-bold text-sm hover:bg-orange-700 disabled:opacity-50">
            {loading ? '分析中...' : '确认录入'}
          </button>
        </form>
      )}

      <div className="flex items-center space-x-4 border-b border-gray-100 pb-3 overflow-x-auto no-scrollbar">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider shrink-0">排序方式:</span>
          <button onClick={() => setSortBy('price')} className={`text-xs font-bold shrink-0 ${sortBy === 'price' ? 'text-orange-600' : 'text-gray-400'}`}>最低实付价</button>
          <button onClick={() => setSortBy('time')} className={`text-xs font-bold shrink-0 ${sortBy === 'time' ? 'text-orange-600' : 'text-gray-400'}`}>配送最快</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
        {filteredDishes.map((dish) => (
          <div key={dish.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
            <div className="h-20 md:h-24 bg-orange-50 flex items-center justify-center relative">
              <span className="text-2xl md:text-3xl">🍱</span>
              <div className="absolute top-1 right-1 md:top-2 md:right-2 px-1.5 py-0.5 md:px-2 md:py-1 bg-green-500 rounded-lg text-[9px] md:text-[10px] font-bold text-white shadow-sm flex items-center">
                 ¥{dish.price.toFixed(1)} <span className="ml-1 opacity-80 font-normal">实付</span>
              </div>
            </div>
            <div className="p-3 md:p-4 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-gray-800 text-xs md:text-sm line-clamp-1">{dish.name}</h4>
                <p className="text-[9px] md:text-[10px] text-gray-400 line-clamp-1">{dish.storeName}</p>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50 text-[9px] md:text-[10px] text-gray-400">
                <span>🕒 {dish.deliveryTimeMinutes}m</span>
                <span className="font-bold text-orange-400">{dish.nutrition.calories}cal</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredDishes.length === 0 && (
        <div className="text-center py-12 md:py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-400 text-sm px-4">菜品库空空如也。请先去“扫描录入”或在此手动添加菜品。</p>
        </div>
      )}
    </div>
  );
};

export default DishCatalog;
