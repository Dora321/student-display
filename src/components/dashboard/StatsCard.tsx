import { useData } from '@/contexts/DataContext';
import { Users, Coins, TrendingUp } from 'lucide-react';

export function StatsCard() {
  const { points, students } = useData();

  const totalAmount = points.reduce((acc, curr) => acc + curr.amount, 0);
  const studentCount = students.length;

  return (
    <div className="grid grid-cols-2 gap-4 h-full text-foreground">
      {/* Student Count */}
      <div className="glass-card p-3 flex flex-col items-center justify-center relative overflow-hidden group hover:shadow-lg transition-all duration-300">
        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100/50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />

        <h3 className="text-slate-500 font-mono text-[10px] uppercase tracking-wider mb-1 z-10 text-center flex items-center gap-2">
          <Users className="w-3 h-3" /> 学生总数
        </h3>

        <div className="w-full relative z-10 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-4xl text-slate-800 tracking-tighter">{studentCount}</span>
          </div>
        </div>

        <div className="mt-1 text-[10px] text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded-full">
          ACTIVE
        </div>
      </div>

      {/* Points Summary */}
      <div className="glass-card p-3 flex flex-col justify-center relative overflow-hidden group hover:shadow-lg transition-all duration-300">
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />

        <h3 className="text-slate-500 font-mono text-[10px] uppercase tracking-wider mb-2 z-10 flex items-center gap-2">
          <Coins className="w-3 h-3 text-brand-orange" /> 累计积分
        </h3>

        <div className="text-2xl font-bold font-mono text-brand-blue z-10 tracking-tight flex items-baseline gap-2">
          {totalAmount.toLocaleString()}
          <span className="text-[10px] text-slate-400 font-normal">PTS</span>
        </div>

        <div className="text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-wider z-10 flex items-center gap-2">
          <TrendingUp className="w-3 h-3 text-green-500" />
          <span>{points.length} 笔记录</span>
        </div>
      </div>
    </div>
  );
}

