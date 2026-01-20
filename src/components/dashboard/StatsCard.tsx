import { useData } from '@/contexts/DataContext';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export function StatsCard() {
  const { points, attendance } = useData();
  
  const totalAmount = points.reduce((acc, curr) => acc + curr.amount, 0);
  const totalAttendance = attendance.length || 1;
  const presentCount = attendance.filter(a => a.status === 'present').length;
  const rate = Math.round((presentCount / totalAttendance) * 100);

  const data = [
    { name: '出勤', value: presentCount },
    { name: '缺勤', value: totalAttendance - presentCount },
  ];
  const COLORS = ['#2563EB', '#E2E8F0']; // Brand Blue vs Slate-200

  return (
    <div className="grid grid-cols-2 gap-6 h-full">
      {/* Attendance Chart */}
      <div className="glass-card p-4 flex flex-col items-center justify-center relative overflow-hidden group hover:shadow-lg transition-all duration-300 bg-white">
        <h3 className="text-muted-foreground font-mono text-xs uppercase tracking-wide mb-2 z-10 text-center">
          今日出勤率
        </h3>
        
        <div className="w-full h-24 relative z-10">
           <ResponsiveContainer width="100%" height="100%">
             <PieChart>
               <Pie
                 data={data}
                 innerRadius={30}
                 outerRadius={45}
                 startAngle={90}
                 endAngle={-270}
                 paddingAngle={0}
                 dataKey="value"
                 stroke="none"
               >
                 {data.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                 ))}
               </Pie>
             </PieChart>
           </ResponsiveContainer>
           <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-2xl text-brand-slate">
             {rate}%
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
