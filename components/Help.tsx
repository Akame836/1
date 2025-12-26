
import React from 'react';

const Help: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-xl">
        <h2 className="text-3xl font-black italic mb-2">密钥配置与本地运行指南 🚀</h2>
        <p className="opacity-90">你已经有了密钥，最后一步就是把它“喂”给程序。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-xl mb-4">🔑</div>
          <h3 className="font-bold text-gray-800 mb-2">如何填入你的 API Key？</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            如果你是按照之前的 Vite 教程运行，最快的方法是在启动时直接带上它。
            <br /><br />
            在你的 <code className="bg-gray-100 px-1 text-orange-600">cmd</code> 窗口中输入：
            <pre className="bg-gray-900 text-green-400 p-3 rounded-lg mt-2 text-[10px] overflow-x-auto">
              set API_KEY=你的那串AIza密钥 && npx vite
            </pre>
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl mb-4">🏠</div>
          <h3 className="font-bold text-gray-800 mb-2">为什么我还没看到效果？</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            1. 确保你的网络可以访问谷歌服务。<br />
            2. 确保密钥前后没有多余的空格。<br />
            3. 如果是在本预览窗口使用，你需要点击左侧“扫描”并关闭“演示模式”。
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-6 flex items-center">
          <span className="w-2 h-5 bg-blue-500 rounded-full mr-2"></span>
          本地部署 - 最终清单 (Final Check)
        </h3>
        <div className="space-y-4">
          <div className="flex items-center p-3 bg-gray-50 rounded-xl">
            <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-[10px] mr-3">✓</div>
            <p className="text-xs font-medium">创建了 <code className="text-blue-600">takeout-app</code> 文件夹</p>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-xl">
            <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-[10px] mr-3">✓</div>
            <p className="text-xs font-medium">安装了 Node.js 并运行了 <code className="text-blue-600">npm init -y</code></p>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-xl">
            <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-[10px] mr-3">✓</div>
            <p className="text-xs font-medium">将所有代码保存为对应文件（注意 components 文件夹）</p>
          </div>
          <div className="flex items-center p-3 border-2 border-orange-200 bg-orange-50 rounded-xl">
            <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-[10px] mr-3">!</div>
            <p className="text-xs font-bold text-orange-800 italic">在启动指令中加入你的密钥：AIzaSyCkXUUIkOD-e9Pwsv8f92jo6HwxV7XJDRo</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-4">💡 开发者进阶方案</h3>
          <p className="text-sm text-gray-400 mb-6">为了方便长期使用，你可以创建一个名为 <code className="text-blue-400">.env</code> 的文件在根目录：</p>
          <div className="bg-black/50 p-4 rounded-xl font-mono text-blue-300 text-xs">
            VITE_API_KEY=你的那串密钥
          </div>
          <p className="text-[10px] text-gray-500 mt-4 italic">注：使用 Vite 时，环境变量通常需要加 VITE_ 前缀或在 config 中定义。</p>
        </div>
      </div>
    </div>
  );
};

export default Help;
