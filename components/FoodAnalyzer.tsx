
import React, { useState } from 'react';
import { analyzeFoodImage } from '../services/geminiService';
import { OrderRecord, MealType } from '../types';

interface FoodAnalyzerProps {
  onAddOrder: (order: OrderRecord) => void;
}

const FoodAnalyzer: React.FC<FoodAnalyzerProps> = ({ onAddOrder }) => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mealType, setMealType] = useState<MealType>(() => {
    const hour = new Date().getHours();
    if (hour < 10) return MealType.BREAKFAST;
    if (hour < 15) return MealType.LUNCH;
    if (hour < 21) return MealType.DINNER;
    return MealType.SNACK;
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      const base64 = dataUrl.split(',')[1];
      setPreview(dataUrl);
      
      try {
        const result = await analyzeFoodImage(base64);
        
        onAddOrder({
          id: `meal-${Date.now()}`,
          dishName: result.dishName,
          storeName: '实物拍摄',
          price: 0,
          date: new Date().toISOString(),
          nutrition: result.nutrition,
          mealType,
          imageUrl: dataUrl
        });
        
        setLoading(false);
      } catch (err) {
        setError('分析失败，请确保照片中的食物清晰可见。');
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-dashed border-orange-100 text-center relative overflow-hidden">
        {loading ? (
          <div className="py-12 flex flex-col items-center">
            <div className="relative w-20 h-20 mb-6">
               <div className="absolute inset-0 rounded-full border-4 border-orange-100 border-t-orange-500 animate-spin"></div>
               <div className="absolute inset-0 flex items-center justify-center text-2xl">📸</div>
            </div>
            <p className="text-gray-600 font-bold animate-pulse">Gemini 正在识别食物...</p>
            <p className="text-xs text-gray-400 mt-2">分析种类、分量及卡路里</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center gap-4 mb-4">
               {Object.values(MealType).map(type => (
                 <button 
                   key={type}
                   onClick={() => setMealType(type)}
                   className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${mealType === type ? 'bg-orange-600 text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                 >
                   {type}
                 </button>
               ))}
            </div>
            
            <div className="mx-auto w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-4 cursor-pointer hover:scale-105 transition-transform group">
               <label className="cursor-pointer">
                 <svg className="w-12 h-12 text-orange-600 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                 </svg>
                 <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleFileUpload} />
               </label>
            </div>
            
            <h3 className="text-2xl font-black text-gray-800">拍一下，就知道营养</h3>
            <p className="text-gray-500 text-sm">上传今日的一餐照片，AI 自动帮你记录</p>
            
            {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100">{error}</div>}
          </div>
        )}
      </div>

      {preview && !loading && (
        <div className="bg-white p-2 rounded-3xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative h-64">
            <img src={preview} alt="分析预览" className="w-full h-full object-cover rounded-2xl" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
              <div className="text-white">
                <p className="text-xs uppercase font-bold opacity-80">分析结果已存入时间轴</p>
                <p className="text-lg font-bold">记录成功！查看今日进度</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
        <h4 className="text-blue-800 font-bold flex items-center mb-2">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
             <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM5.884 4.47a1 1 0 10-1.415 1.414l.707.707a1 1 0 001.415-1.414l-.707-.707zM17.53 5.884a1 1 0 10-1.414-1.415l-.707.707a1 1 0 001.414 1.415l.707-.707zM10 8a2 2 0 100 4 2 2 0 000-4z" />
             <path fillRule="evenodd" d="M3 11a1 1 0 100 2h1a1 1 0 100-2H3zm14 0a1 1 0 100 2h1a1 1 0 100-2h-1zM5.884 15.53a1 1 0 10-1.415-1.414l-.707.707a1 1 0 001.415 1.414l.707-.707zm11.412 1.414a1 1 0 10-1.414-1.415l-.707.707a1 1 0 001.414 1.415l.707-.707zM11 17a1 1 0 10-2 0v1a1 1 0 102 0v-1z" clipRule="evenodd" />
          </svg>
          拍照小技巧
        </h4>
        <ul className="text-blue-700 text-xs space-y-2 opacity-80">
          <li>• 确保光线充足，不要有太大的阴影遮挡。</li>
          <li>• 尽量俯拍，展示出盘子里的所有食材。</li>
          <li>• 如果有多种菜品，尽量让它们都出现在镜头内。</li>
        </ul>
      </div>
    </div>
  );
};

export default FoodAnalyzer;
