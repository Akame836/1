
import React, { useState } from 'react';
import { parseMenuImage, analyzeNutrition } from '../services/geminiService';
import { Dish } from '../types';

interface MenuScannerProps {
  onDishesDetected: (dishes: Dish[]) => void;
}

const MenuScanner: React.FC<MenuScannerProps> = ({ onDishesDetected }) => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setStatus('正在通过 AI 识别优惠价...');

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(',')[1];
      setPreview(e.target?.result as string);
      
      try {
        const result = await parseMenuImage(base64);
        setStatus(`正在同步 ${result.dishes.length} 个菜品到库中...`);
        
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
      } catch (err) {
        setError('抱歉，未能正确提取实付价格。请确保图片清晰且包含价格信息。');
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
            <p className="text-[10px] text-gray-400 mt-2">AI 正在努力排除划线原价，提取实付价...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="mx-auto w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
            </div>
            <div className="px-4">
              <h3 className="text-xl font-black text-gray-800 italic">扫描实体菜单</h3>
              <p className="text-gray-400 text-xs mt-1">上传一张传单或手机菜单截图，AI 将提取最准确的实付价</p>
            </div>
            <label className="block w-full cursor-pointer bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black active:scale-95 transition-all">
              立刻拍照或选取图片
              <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleFileUpload} />
            </label>
            {error && <p className="text-red-500 text-[10px] bg-red-50 p-2 rounded-lg">{error}</p>}
          </div>
        )}
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-start space-x-4">
        <div className="p-2 bg-orange-50 rounded-lg text-lg">💡</div>
        <div className="text-left">
          <p className="font-bold text-gray-800 text-sm italic">扫描完成后发生了什么？</p>
          <p className="text-[10px] text-gray-500">所有识别出的菜品将自动进入您的“我的菜品库”，供转盘抽签和营养分析使用。</p>
        </div>
      </div>
    </div>
  );
};

export default MenuScanner;
