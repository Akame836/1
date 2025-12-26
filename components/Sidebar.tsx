
import React from 'react';
import { Page } from '../types';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const navItems = [
    { id: Page.DASHBOARD, label: '概览', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: Page.DISH_CATALOG, label: '我的菜品库', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { id: Page.ROULETTE, label: '吃什么？转盘', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: Page.ANALYZE_FOOD, label: '当餐拍照分析', icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' },
    { id: Page.HISTORY, label: '订单记录', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { id: Page.SCAN_MENU, label: '扫描识别菜单', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-orange-600 flex items-center">
          <svg className="w-8 h-8 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
          灵动外卖
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              currentPage === item.id
                ? 'bg-orange-50 text-orange-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-100 space-y-2">
        <button 
          onClick={() => onNavigate(Page.HELP)}
          className={`w-full flex items-center px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            currentPage === Page.HELP ? 'bg-blue-50 text-blue-700' : 'text-blue-500 hover:bg-blue-50'
          }`}
        >
          <span className="mr-2">❓</span> 怎么部署到电脑？
        </button>
        <div className="bg-orange-100 rounded-lg p-4">
          <p className="text-xs text-orange-800 font-semibold mb-1">点餐困难症？</p>
          <button onClick={() => onNavigate(Page.ROULETTE)} className="text-[10px] text-orange-600 font-bold underline">立刻转一转</button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
