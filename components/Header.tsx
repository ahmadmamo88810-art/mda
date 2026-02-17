
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-6 px-4 md:px-8 flex items-center justify-between border-b border-zinc-800/50 sticky top-0 z-50 bg-[#0a0a0c]/80 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
          <i className="fa-solid fa-wand-magic-sparkles text-black text-xl"></i>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            Al-Mamo <span className="text-amber-500">المامو</span>
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Professional AI Imaging</p>
        </div>
      </div>
      
      <div className="hidden md:flex items-center gap-6">
        <span className="text-sm font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer">Explore</span>
        <span className="text-sm font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer">Docs</span>
        <div className="h-4 w-[1px] bg-zinc-800"></div>
        <button className="px-4 py-2 rounded-lg bg-zinc-900 text-sm font-medium border border-zinc-800 hover:bg-zinc-800 transition-all">
          <i className="fa-solid fa-crown text-amber-500 mr-2"></i>
          Pro Plan
        </button>
      </div>
    </header>
  );
};

export default Header;
