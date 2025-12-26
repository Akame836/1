
import React from 'react';
import { Page } from '../types';

interface HeaderProps {
  currentPage: Page;
}

const Header: React.FC<HeaderProps> = ({ currentPage }) => {
  const getTitle = () => {
    switch (currentPage) {
      case Page.DASHBOARD: return '数据概览';
      case Page.SCAN_MENU: return '菜单识别与导入';
      case Page.DISH_CATALOG: return '菜品库';
      case Page.HISTORY: return '订单历史';
      case Page.NUTRITION: return '营养分析';
      case Page.ROULETTE: return '灵动大转盘';
      case Page.ANALYZE_FOOD: return '实物快拍';
      case Page.HELP: return '本地部署指南';
      default: return '灵动外卖';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-8 flex justify-between items-center shrink-0">
      <h2 className="text-xl font-semibold text-gray-800">{getTitle()}</h2>
      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">用户</div>
          <span className="text-sm font-medium text-gray-700 hidden sm:inline">我的助手</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
