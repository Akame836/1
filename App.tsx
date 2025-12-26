
import React, { useState, useEffect } from 'react';
import { Page, Dish, OrderRecord, MealType } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import MenuScanner from './components/MenuScanner';
import DishCatalog from './components/DishCatalog';
import OrderHistory from './components/OrderHistory';
import NutritionDashboard from './components/NutritionalDashboard';
import FoodAnalyzer from './components/FoodAnalyzer';
import FoodRoulette from './components/FoodRoulette';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.DASHBOARD);
  const [dishes, setDishes] = useState<Dish[]>(() => {
    const saved = localStorage.getItem('takeout_dishes_v2');
    return saved ? JSON.parse(saved) : [];
  });
  const [orders, setOrders] = useState<OrderRecord[]>(() => {
    const saved = localStorage.getItem('takeout_orders_v2');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('takeout_dishes_v2', JSON.stringify(dishes));
  }, [dishes]);

  useEffect(() => {
    localStorage.setItem('takeout_orders_v2', JSON.stringify(orders));
  }, [orders]);

  const addDishes = (newDishes: Dish[]) => {
    setDishes(prev => [...prev, ...newDishes]);
    // 识别完自动跳转到库
    setCurrentPage(Page.DISH_CATALOG);
  };

  const addManualDish = (dish: Dish) => {
    setDishes(prev => [dish, ...prev]);
  };

  const addOrder = (order: OrderRecord) => {
    setOrders(prev => [order, ...prev]);
  };

  const renderPage = () => {
    switch (currentPage) {
      case Page.DASHBOARD:
        return <Dashboard dishes={dishes} orders={orders} />;
      case Page.ANALYZE_FOOD:
        return <FoodAnalyzer onAddOrder={addOrder} />;
      case Page.SCAN_MENU:
        return <MenuScanner onDishesDetected={addDishes} />;
      case Page.DISH_CATALOG:
        return <DishCatalog dishes={dishes} onAddManual={addManualDish} />;
      case Page.HISTORY:
        return <OrderHistory orders={orders} onAddOrder={addOrder} />;
      case Page.NUTRITION:
        return <NutritionDashboard orders={orders} />;
      case Page.ROULETTE:
        return <FoodRoulette dishes={dishes} />;
      default:
        return <Dashboard dishes={dishes} orders={orders} />;
    }
  };

  const navItems = [
    { id: Page.DASHBOARD, label: '主页', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: Page.DISH_CATALOG, label: '菜品库', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { id: Page.ROULETTE, label: '转盘', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: Page.ANALYZE_FOOD, label: '拍照', icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' }
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header currentPage={currentPage} />
        <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-8">
          <div className="max-w-7xl mx-auto">
            {renderPage()}
          </div>
        </main>
        
        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-3 flex justify-around items-center shadow-2xl z-50">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex flex-col items-center space-y-1 transition-colors ${currentPage === item.id ? 'text-orange-600' : 'text-gray-400'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <span className="text-[10px] font-bold">{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(Page.HISTORY)}
            className={`flex flex-col items-center space-y-1 ${currentPage === Page.HISTORY ? 'text-orange-600' : 'text-gray-400'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
            </svg>
            <span className="text-[10px] font-bold">订单</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
