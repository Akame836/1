
import React, { useState, useRef, useMemo } from 'react';
import { Dish } from '../types';

interface FoodRouletteProps {
  dishes: Dish[];
}

const FoodRoulette: React.FC<FoodRouletteProps> = ({ dishes }) => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Dish | null>(null);
  const [rotation, setRotation] = useState(0);
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const wheelRef = useRef<HTMLDivElement>(null);

  // 获取所有店铺列表供筛选
  const storeList = useMemo(() => {
    const stores = Array.from(new Set(dishes.map(d => d.storeName)));
    return stores;
  }, [dishes]);

  // 根据筛选条件获取显示的菜品
  const filteredDishes = useMemo(() => {
    if (selectedStore === 'all') return dishes;
    return dishes.filter(d => d.storeName === selectedStore);
  }, [dishes, selectedStore]);

  const startSpin = () => {
    if (spinning || filteredDishes.length < 2) return;
    
    setResult(null);
    setSpinning(true);
    
    const extraDegrees = Math.floor(Math.random() * 360);
    const totalRotation = rotation + 1800 + extraDegrees;
    setRotation(totalRotation);

    setTimeout(() => {
      setSpinning(false);
      const finalDegree = totalRotation % 360;
      const sectorWidth = 360 / Math.min(filteredDishes.length, 12);
      const index = Math.floor((360 - finalDegree) / sectorWidth) % Math.min(filteredDishes.length, 12);
      setResult(filteredDishes[index]);
    }, 4000);
  };

  const colors = ['#f97316', '#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899'];

  if (dishes.length < 2) {
    return (
      <div className="max-w-md mx-auto py-12 md:py-20 text-center px-6">
        <div className="text-5xl md:text-6xl mb-6">🏜️</div>
        <h3 className="text-xl font-bold text-gray-800 italic">转盘还没充能</h3>
        <p className="text-gray-500 text-sm mt-2">库中至少需要 2 个菜品才能开启决策模式。先去扫描一点菜单吧！</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col items-center px-2">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 italic">今天吃啥，转了再说</h2>
        <p className="text-gray-400 text-xs">基于您的外卖库存进行决策</p>
      </div>

      {/* 店铺筛选器 */}
      <div className="w-full max-w-xs mb-8">
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 text-center">筛选店铺</label>
        <select 
          value={selectedStore} 
          onChange={(e) => {
            setSelectedStore(e.target.value);
            setResult(null);
            setRotation(0);
          }}
          disabled={spinning}
          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-orange-500 appearance-none text-center shadow-sm"
        >
          <option value="all">全部店铺 ({dishes.length}个菜品)</option>
          {storeList.map(store => (
            <option key={store} value={store}>{store}</option>
          ))}
        </select>
      </div>

      <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-[420px] md:h-[420px]">
        {/* 指针 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
          <div className="w-6 h-8 md:w-8 md:h-10 bg-orange-600 clip-path-triangle shadow-lg"></div>
        </div>

        {/* 转盘 */}
        <div 
          ref={wheelRef}
          className="w-full h-full rounded-full border-4 md:border-8 border-gray-900 relative overflow-hidden transition-transform duration-[4000ms] cubic-bezier(0.15, 0, 0.15, 1) shadow-2xl"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {filteredDishes.slice(0, 12).map((dish, i) => {
            const sliceCount = Math.min(filteredDishes.length, 12);
            const rotateAngle = (360 / sliceCount) * i;
            const skewAngle = 90 - (360 / sliceCount);
            return (
              <div 
                key={dish.id}
                className="absolute top-0 right-0 w-1/2 h-1/2 origin-bottom-left"
                style={{ 
                  transform: `rotate(${rotateAngle}deg) skewY(-${skewAngle}deg)`,
                  backgroundColor: colors[i % colors.length],
                  border: '0.5px solid rgba(255,255,255,0.1)'
                }}
              >
                <div 
                  className="absolute bottom-4 left-4 origin-bottom-left flex items-center justify-center whitespace-nowrap px-4"
                  style={{ transform: `skewY(${skewAngle}deg) rotate(${(360 / sliceCount) / 2}deg)` }}
                >
                  <span className="text-white font-bold text-[8px] sm:text-xs md:text-sm drop-shadow-md">
                    {dish.name.length > 5 ? dish.name.substring(0, 5) + '..' : dish.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 中心 GO 按钮 */}
        <button 
          onClick={startSpin}
          disabled={spinning || filteredDishes.length < 2}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white rounded-full border-2 md:border-4 border-gray-900 z-30 flex flex-col items-center justify-center shadow-xl active:scale-90 transition-transform ${spinning ? 'opacity-50' : 'hover:scale-105'}`}
        >
          <span className="text-lg md:text-2xl font-black text-gray-900">GO</span>
        </button>
      </div>

      {result && (
        <div className="mt-8 bg-white p-5 rounded-2xl shadow-xl border-4 border-orange-500 animate-bounce-short text-center w-full max-w-[280px]">
           <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest italic">上天旨意</p>
           <h3 className="text-xl md:text-2xl font-black text-orange-600 mt-1">{result.name}</h3>
           <p className="text-[10px] text-gray-500 font-medium line-clamp-1">{result.storeName}</p>
           <div className="flex justify-center gap-2 mt-3">
             <div className="bg-orange-50 px-2 py-0.5 rounded-full text-[10px] font-bold text-orange-600">¥{result.price}</div>
             <div className="bg-gray-50 px-2 py-0.5 rounded-full text-[10px] font-bold text-gray-400">约{result.deliveryTimeMinutes}m</div>
           </div>
        </div>
      )}
      
      {filteredDishes.length < 2 && (
         <p className="mt-4 text-xs text-red-500 font-bold">该店铺下菜品不足 2 个，无法转动</p>
      )}
      
      <style>{`
        .clip-path-triangle {
          clip-path: polygon(50% 100%, 0 0, 100% 0);
        }
        @keyframes bounce-short {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-short {
          animation: bounce-short 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default FoodRoulette;
