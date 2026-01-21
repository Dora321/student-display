import { useData } from '@/contexts/DataContext';
import { Users } from 'lucide-react';

export function StatsCard() {
  const { points, students } = useData();

  const totalAmount = points.reduce((acc, curr) => acc + curr.amount, 0);
  const studentCount = students.length;

  return (
    <div className="grid grid-cols-2 gap-6 h-full">
      {/* Student Count */}
      <div className="glass-card p-4 flex flex-col items-center justify-center relative overflow-hidden group hover:shadow-lg transition-all duration-300 bg-white">
        <h3 className="text-muted-foreground font-mono text-xs uppercase tracking-wide mb-2 z-10 text-center">
          学生总数
        </h3>

        <div className="w-full h-24 relative z-10 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <Users className="w-10 h-10 text-brand-blue" />
            <span className="font-mono font-bold text-4xl text-brand-slate">{studentCount}</span>
          </div>
        </div>
      </div>

      {/* Points Summary */}
      <div className="glass-card p-4 flex flex-col justify-center relative overflow-hidden group hover:shadow-lg transition-all duration-300 bg-white">
        <h3 className="text-muted-foreground font-mono text-xs uppercase tracking-wide mb-2 z-10">
          累计积分
        </h3>

        <div className="text-3xl font-bold font-mono text-brand-blue z-10">
          {totalAmount.toLocaleString()}
        </div>

        <div className="text-[10px] text-muted-foreground mt-2 font-mono uppercase tracking-wider z-10 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-brand-orange rounded-full"></span>
          {points.length} 条记录
        </div>
      </div>
    </div>
  );
}
