'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function RevenueChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#C7A15A" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#C7A15A" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10 dark:opacity-5" />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }} 
          dy={10}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }} 
          tickFormatter={(value) => `${value / 1000}k`}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgba(15, 17, 19, 0.9)', 
            borderColor: 'rgba(255,255,255,0.1)',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#fff'
          }}
          itemStyle={{ color: '#C7A15A' }}
        />
        <Area 
          type="monotone" 
          dataKey="revenue" 
          stroke="#C7A15A" 
          strokeWidth={2}
          fillOpacity={1} 
          fill="url(#colorRevenue)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
