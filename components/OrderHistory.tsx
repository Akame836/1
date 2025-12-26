
import React, { useState } from 'react';
import { OrderRecord, MealType } from '../types';
import { parseOrderScreenshot, analyzeNutrition } from '../services/geminiService';

interface OrderHistoryProps {
  orders: OrderRecord[];
  onAddOrder: (order: OrderRecord) => void;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ orders, onAddOrder }) => {
  const [dishName, setDishName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [price, setPrice] = useState('');
  const [mealType, setMealType] = useState<MealType>(MealType.LUNCH);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName || !storeName || !price) return;
    
    setIsUploading(true);
    setStatusMsg('分析实付价及营养中...');
    
    try {
      const nutrition = await analyzeNutrition(dishName);
      onAddOrder({
        id: Date.now().toString(),
        dishName,
        storeName,
        price: parseFloat(price),
        date: new Date().toISOString(),
        nutrition,
        mealType
      });
      setDishName('');
      setStoreName('');
      setPrice('');
      setError(null);
      setStatusMsg('已存入记录');
      setTimeout(() => setStatusMsg(null), 2000);
    } catch (err) {
      setError('网络繁忙，请稍后再试。');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setStatusMsg('正在从截图解析实付金额...');

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(',')[1];
      try {
        const results = await parseOrderScreenshot(base64);
        if (results && results.length > 0) {
          results.forEach((order, index) => {
            onAddOrder({
              id: `${Date.now()}-${index}`,
              ...order,
              mealType,
              date: new Date().toISOString()
            } as OrderRecord);
          });
          setStatusMsg(`识别到 ${results.length} 笔实付订单！`);
          setTimeout(() => setStatusMsg(null), 3000);
        } else {
          setError('未识别到订单信息。');
        }
      } catch (err) {
        setError('解析失败，请确保截图包含“实付金额”。');
      } finally {
        setIsUploading(false);
        event.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 text-sm md:text-base">智能导入订单截图</h3>
        <div className="flex flex-wrap gap-2 mb-4">
           {Object.values(MealType).map(t => (
             <button 
               key={t}
               onClick={() => setMealType(t)}
               className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${mealType === t ? 'bg-orange-600 text-white shadow-md' : 'bg-gray-100 text-gray-500'}`}
             >
               {t}
             </button>
           ))}
        </div>
        
        <label className="w-full flex flex-col items-center justify-center border-2 border-dashed border-orange-100 rounded-xl py-6 md:py-10 cursor-pointer hover:bg-orange-50 transition-colors">
          <svg className="w-8 h-8 text-orange-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span className="text-xs font-bold text-gray-500">上传订单实付截图</span>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
        </label>

        {statusMsg && <div className="mt-4 p-3 bg-green-50 text-green-700 text-[10px] rounded-lg animate-pulse">{statusMsg}</div>}
        {error && <div className="mt-4 p-3 bg-red-50 text-red-600 text-[10px] rounded-lg">{error}</div>}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">消费历史</h3>
          <span className="text-[10px] text-gray-400">共 {orders.length} 条记录</span>
        </div>
        
        {/* Mobile View: Cards */}
        <div className="md:hidden divide-y divide-gray-50">
          {orders.map(order => (
            <div key={order.id} className="p-4 flex flex-col space-y-2">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 text-sm">{order.dishName}</h4>
                  <p className="text-[10px] text-gray-400">{order.storeName}</p>
                </div>
                <span className="font-black text-orange-600 text-sm">
                  {order.price > 0 ? `¥${order.price.toFixed(1)}` : '实拍'}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full font-bold">{order.mealType}</span>
                <span className="text-gray-400">{new Date(order.date).toLocaleDateString()}</span>
                <span className="text-orange-400 font-bold">{order.nutrition.calories} kcal</span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="px-6 py-4">内容</th>
                <th className="px-6 py-4">餐次</th>
                <th className="px-6 py-4">热量</th>
                <th className="px-6 py-4 text-right">实付价</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-800">{order.dishName}</div>
                    <div className="text-[10px] text-gray-400">{order.storeName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
                      {order.mealType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[10px] text-orange-500 font-bold">{order.nutrition.calories} kcal</td>
                  <td className="px-6 py-4 text-right font-black text-gray-900">
                    {order.price > 0 ? `¥${order.price.toFixed(2)}` : '实拍记录'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && <div className="p-12 text-center text-gray-300 text-xs">暂无历史记录</div>}
      </div>
    </div>
  );
};

export default OrderHistory;
