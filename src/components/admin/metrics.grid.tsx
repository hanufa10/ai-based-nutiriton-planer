import React from 'react';
import { AdminMetricCard } from '../../lib/api-types';

const mockMetrics: AdminMetricCard[] = [
  { id: '1', label: 'Active Users', value: '1,248', variant: 'green' },
  { id: '2', label: 'Meals Tracked', value: '840', variant: 'purple' },
  { id: '3', label: 'Smart Plans', value: '312', variant: 'orange' },
  { id: '4', label: 'Alerts Pending', value: '14', variant: 'pink' },
];

export function MetricsGrid() {
  const variantStyles = {
    green: 'bg-[#e8f5e9] text-emerald-800 border-emerald-200',
    purple: 'bg-[#f3e8ff] text-purple-800 border-purple-200',
    orange: 'bg-[#fff3e0] text-orange-800 border-orange-200',
    pink: 'bg-[#fce4ec] text-pink-800 border-pink-200',
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {mockMetrics.map((card) => (
        <div key={card.id} className={`${variantStyles[card.variant]} p-5 rounded-xl border shadow-xs`}>
          <span className="text-[11px] font-bold uppercase tracking-wider opacity-75">{card.label}</span>
          <p className="text-2xl font-black mt-1 tracking-tight">{card.value}</p>
        </div>
      ))}
    </div>
  );
}