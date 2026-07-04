import React, { useMemo } from 'react';

interface HeatmapProps {
  solvedDates: string[]; // Array of ISO date strings (YYYY-MM-DD)
}

export const Heatmap: React.FC<HeatmapProps> = ({ solvedDates }) => {
  // Compute date array for the last 365 days (53 weeks)
  const gridData = useMemo(() => {
    const days: { dateStr: string; date: Date; count: number }[] = [];
    const today = new Date();
    
    // Find starting date: 364 days ago
    const startDate = new Date();
    startDate.setDate(today.getDate() - 364);

    // Adjust startDate to the beginning of its week (Sunday)
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    // Count map
    const countMap = new Map<string, number>();
    solvedDates.forEach(d => {
      const dateKey = d.split('T')[0]; // Format YYYY-MM-DD
      countMap.set(dateKey, (countMap.get(dateKey) || 0) + 1);
    });

    // Create 371 days (53 weeks * 7 days) to fill the grid exactly
    const current = new Date(startDate);
    for (let i = 0; i < 371; i++) {
      const dateStr = current.toISOString().split('T')[0];
      days.push({
        dateStr,
        date: new Date(current),
        count: countMap.get(dateStr) || 0
      });
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [solvedDates]);

  // Color mapper based on count
  const getCellColor = (count: number) => {
    if (count === 0) {
      return 'bg-gray-100 dark:bg-dark-border hover:bg-gray-200 dark:hover:bg-gray-700';
    }
    if (count === 1) {
      return 'bg-violet-300 dark:bg-violet-900/40 text-violet-100 hover:opacity-80';
    }
    if (count === 2) {
      return 'bg-violet-400 dark:bg-violet-700/60 text-violet-100 hover:opacity-80';
    }
    if (count === 3) {
      return 'bg-violet-500 dark:bg-violet-600 text-white hover:opacity-80';
    }
    return 'bg-violet-600 dark:bg-violet-500 text-white hover:opacity-80'; // 4+ solves
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Find column indices where months transition to display labels
  const monthLabels = useMemo(() => {
    const labels: { text: string; colIndex: number }[] = [];
    let lastMonth = -1;
    
    for (let col = 0; col < 53; col++) {
      const dayIndex = col * 7;
      if (dayIndex < gridData.length) {
        const month = gridData[dayIndex].date.getMonth();
        if (month !== lastMonth) {
          labels.push({ text: months[month], colIndex: col });
          lastMonth = month;
        }
      }
    }
    return labels;
  }, [gridData]);

  return (
    <div className="flex flex-col p-6 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl shadow-sm overflow-x-auto">
      <h3 className="font-heading font-bold text-lg mb-4 text-gray-800 dark:text-gray-100">
        Practice Consistency Heatmap
      </h3>
      
      <div className="min-w-[700px] flex flex-col">
        {/* Month Header */}
        <div className="relative h-6 text-xs text-gray-400 dark:text-gray-500 ml-8 mb-1">
          {monthLabels.map((lbl, idx) => (
            <span 
              key={idx} 
              className="absolute"
              style={{ left: `${(lbl.colIndex / 53) * 100}%` }}
            >
              {lbl.text}
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          {/* Days of week labels */}
          <div className="flex flex-col justify-between text-[10px] text-gray-400 dark:text-gray-500 h-[105px] pr-2 pt-1">
            <span>Sun</span>
            <span>Tue</span>
            <span>Thu</span>
            <span>Sat</span>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-[repeat(53,_minmax(0,_1fr))] grid-rows-7 grid-flow-col gap-[3px] flex-1 h-[105px]">
            {gridData.map((day, idx) => {
              const formattedDate = day.date.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });
              const tooltipText = `${day.count} coding problem${day.count !== 1 ? 's' : ''} solved on ${formattedDate}`;

              return (
                <div
                  key={idx}
                  className={`w-[12px] h-[12px] rounded-[2px] transition-colors relative group cursor-pointer ${getCellColor(day.count)}`}
                >
                  {/* Tooltip bubble */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 hidden group-hover:block bg-gray-900 text-white text-[10px] py-1.5 px-2.5 rounded-lg text-center shadow-lg pointer-events-none z-50">
                    {tooltipText}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-1.5 text-xs text-gray-400 dark:text-gray-500 mt-3 pr-2">
          <span>Less</span>
          <div className="w-[10px] h-[10px] rounded-[2px] bg-gray-100 dark:bg-dark-border" />
          <div className="w-[10px] h-[10px] rounded-[2px] bg-violet-300 dark:bg-violet-900/40" />
          <div className="w-[10px] h-[10px] rounded-[2px] bg-violet-400 dark:bg-violet-700/60" />
          <div className="w-[10px] h-[10px] rounded-[2px] bg-violet-500 dark:bg-violet-600" />
          <div className="w-[10px] h-[10px] rounded-[2px] bg-violet-600 dark:bg-violet-500" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
