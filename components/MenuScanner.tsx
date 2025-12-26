
import React, { useState } from 'react';
import { parseMenuImage, analyzeNutrition } from '../services/geminiService';
import { Dish } from '../types';

interface MenuScannerProps {
  onDishesDetected: (dishes: Dish[]) => void;
}

const MenuScanner: React.FC<MenuScannerProps> = ({ onDishesDetected }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [isDemoMode, setIsDemoMode] = useState(false); // 默认不开启，让用户感知到 AI 功能

  // 模拟数据：给没有 API Key 的用户演示使用
  const getMockDishes = (storeName: string): Dish[] => [
    { id: 'm1', storeName, name: '招牌黄焖鸡', price: 22.5, deliveryTimeMinutes: 30, category: '热销', nutrition: { calories: 550, protein: 25, carbs: 40, fat: 18 } },
    { id: 'm2', storeName, name: '青椒炒肉盖饭', price: 18.0, deliveryTimeMinutes: 25, category: '盖饭', nutrition: { calories: 620, protein: 20, carbs: 70, fat: 22 } },
    { id: 'm3', storeName, name: '酸辣土豆丝', price: 12.0, deliveryTimeMinutes: 20, category: '素菜', nutrition: { calories: 280, protein: 4, carbs: 45, fat: 10 } },
    { id: 'm4', storeName, name: '皮蛋瘦肉粥', price: 10.0, deliveryTimeMinutes: 35, category: '粥品', nutrition: { calories: 210, protein: 8, carbs: 35, fat: 5 } },
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    if (isDemoMode) {
      setStatus('演示模式：正在模拟 AI 识别...');
      setTimeout(() => {
        onDishesDetected(getMockDishes('演示示例店铺'));
        setLoading(false);
      }, 1500);
      return;
    }

    setStatus('正在通过 AI 识别优惠价...');
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(',')[1];
      
      try {
        const result = await parseMenuImage(base64);
        setStatus(`正在同步 ${result.dishes.length} 个菜品...`);
        
        const finalDishes: Dish[] = await Promise.all(result.dishes.map(async (d, i) => {
          const nutrition = await analyzeNutrition(d.name || '');
          return {
            id: `${Date.now()}-${i}`,
            storeName: result.storeName,
            name: d.name || '未知菜品',
            price: d.price || 0,
            deliveryTimeMinutes: d.deliveryTimeMinutes || 35,
            category: d.category || '扫描录入',
            nutrition
          };
        }));

        onDishesDetected(finalDishes);
        setLoading(false);
      } catch (err: any) {
        if (err.message?.includes('API_KEY')) {
          setError('检测到未配置 API 密钥。请手动录入，或开启下方的“演示模式”体验。');
        } else {
          setError('识别失败，请确保图片清晰或尝试开启演示模式。');
        }
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-white p-6 md:p-10 rounded-3xl shadow-xl border-2 border-dashed border-orange-100 text-center">
        {loading ? (
          <div className="py-8 flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin mb-4"></div>
            <p className="text-orange-600 font-black italic">{status}</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="mx-auto w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
            </div>
            
            <div>
              <h3 className="text-xl font-black text-gray-800 italic">识别外卖单</h3>
              <p className="text-gray-400 text-xs mt-1">支持拍照识别实付价 & 智能录入</p>
            </div>

            <label className="block w-full cursor-pointer bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black active:scale-95 transition-all">
              {isDemoMode ? '随机生成模拟菜品' : '上传/拍摄图片识别'}
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
            </label>

            {/* 演示模式开关 */}
            <div className="pt-4 flex items-center justify-center space-x-3">
              <span className={`text-[10px] font-bold ${!isDemoMode ? 'text-orange-600' : 'text-gray-400'}`}>智能 AI 模式</span>
              <button 
                onClick={() => setIsDemoMode(!isDemoMode)}
                className={`w-10 h-5 rounded-full relative transition-colors ${isDemoMode ? 'bg-orange-500' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isDemoMode ? 'left-6' : 'left-1'}`}></div>
              </button>
              <span className={`text-[10px] font-bold ${isDemoMode ? 'text-orange-600' : 'text-gray-400'}`}>演示/手动模式</span>
            </div>

            {error && (
              <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <p className="text-red-500 text-[10px] leading-relaxed">{error}</p>
                <button 
                  onClick={() => setIsDemoMode(true)}
                  className="mt-2 text-[10px] font-bold text-red-600 underline"
                >
                  没有密钥？开启演示模式试用
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex items-start space-x-4">
        <div className="text-lg">💁‍♂️</div>
        <div className="text-left">
          <p className="font-bold text-orange-800 text-xs italic">完全不想用 AI？</p>
          <p className="text-[10px] text-orange-600">点击侧边栏/底部的“菜品库”，可以完全手动输入你想吃的店和菜，转盘照样能用！</p>
        </div>
      </div>
    </div>
  );
};

export default MenuScanner;
