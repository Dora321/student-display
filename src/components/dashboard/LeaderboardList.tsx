import type { StudentStats } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Minus } from 'lucide-react';
import type { RankingPeriod } from '@/contexts/DataContext';

interface LeaderboardListProps {
  students: StudentStats[];
  period: RankingPeriod;
}

export function LeaderboardList({ students, period }: LeaderboardListProps) {
  const list = students.slice(3, 10);

  // Determine which point value to show based on period
  const getPoints = (stat: StudentStats) => {
    if (period === 'week') return stat.weeklyPoints;
    if (period === 'month') return stat.monthlyPoints;
    return stat.currentBalance; // Was totalPoints
  };

  const getLabel = () => {
    if (period === 'week') return '周积分';
    if (period === 'month') return '月积分';
    return '持有积分'; // Was 'Balance'
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex items-center justify-between px-6 py-2 text-muted-foreground text-xs font-mono uppercase tracking-wider bg-gray-50/50 border-b border-gray-100">
        <span className="w-12 text-center">排名</span>
        <span className="flex-1 px-4">学生姓名</span>
        <span className="w-24 text-right">
          {getLabel()}
        </span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-4 scrollbar-hide">
        <AnimatePresence mode="popLayout">
          {list.map((stat, index) => (
            <motion.div
              key={stat.student.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ delay: 0.05 * index }}
              className="
                flex items-center justify-between p-3 rounded-xl
                bg-white/80 border border-slate-100 shadow-sm
                hover:shadow-md hover:border-brand-blue/30 hover:bg-blue-50/80
                transition-all duration-200 cursor-default group backdrop-blur-sm
              "
            >
              <div className="flex items-center gap-4">
                <div className="font-mono font-bold text-sm text-blue-600 bg-blue-100/50 border border-blue-200 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  {stat.rank}
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-slate-100 group-hover:border-brand-blue transition-colors">
                    <img src={stat.student.avatar} className="w-full h-full object-cover" />
                  </div>
                  <span className="font-sans font-bold text-base text-slate-700 group-hover:text-brand-blue transition-colors">
                    {stat.student.name}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {index % 3 === 0 ? (
                    <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <Minus className="w-3.5 h-3.5 text-gray-300" />
                  )}
                </div>

                <div className={`font-mono text-xl font-bold w-24 text-right transition-colors ${period === 'week' ? 'text-green-600' : period === 'month' ? 'text-purple-600' : 'text-brand-blue'
                  }`}>
                  {getPoints(stat)}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
