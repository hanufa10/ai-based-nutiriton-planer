import React from 'react';

export function AnalyticsRings() {
  return (
    <div className="flex gap-6 bg-[#1a2e1a] p-6 rounded-2xl text-white justify-between items-center shadow-md">
      <div>
        <h3 className="font-bold text-lg text-emerald-400">NutriSmart Core Engine</h3>
        <p className="text-xs text-gray-300 mt-1">Real-time macronutrient metric coverage.</p>
      </div>
      <div className="flex gap-4">
        {/* Ring 1: Stroke Dash Math matching the design */}
        <div className="relative w-16 h-16">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3.5" />
            <circle cx="18" cy="18" r="16" fill="none" stroke="#81C784" strokeWidth="3.5" strokeDasharray="65 100" strokeLinecap="round" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-emerald-300">65%</span>
        </div>
        {/* Ring 2 */}
        <div className="relative w-16 h-16">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3.5" />
            <circle cx="18" cy="18" r="16" fill="none" stroke="#A5D6A7" strokeWidth="3.5" strokeDasharray="43 100" strokeLinecap="round" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-emerald-200">43%</span>
        </div>
      </div>
    </div>
  );
}