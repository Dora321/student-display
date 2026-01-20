import type { StudentStats } from '@/types';
import { motion } from 'framer-motion';
import trophyImg from '@/assets/trophy.png';
import type { RankingPeriod } from '@/contexts/DataContext';

interface TopPodiumProps {
  top3: StudentStats[];
  period: RankingPeriod;
}

export function TopPodium({ top3, period }: TopPodiumProps) {
  const [first, second, third] = top3;

  const getPoints = (stat: StudentStats | undefined) => {
    if (!stat) return 0;
    if (period === 'week') return stat.weeklyPoints;
    if (period === 'month') return stat.monthlyPoints;
    return stat.currentBalance;
  };

  const getLabel = () => {
    if (period === 'week') return '周积分';
    if (period === 'month') return '月积分';
    return '持有积分';
  };

  const renderCard = (student: StudentStats | undefined, rank: number) => {
    if (!student) return null;
    
    const isFirst = rank === 1;
    const height = isFirst ? 'h-[20rem]' : rank === 2 ? 'h-[17rem]' : 'h-[15rem]';
    const points = getPoints(student);
    
    // Period-based color overrides
    const highlightColor = period === 'week' ? 'text-green-600' : period === 'month' ? 'text-purple-600' : '';
    
    // Future Friendly Colors
    const config = isFirst 
      ? { 
          bg: 'bg-gradient-to-b from-yellow-50 to-white', 
          border: 'border-yellow-200',
          badge: 'bg-yellow-400 text-yellow-950',
          text: 'text-brand-slate',
          highlight: highlightColor || 'text-yellow-600'
        }
      : rank === 2 
        ? { 
            bg: 'bg-gradient-to-b from-gray-50 to-white', 
            border: 'border-gray-200',
            badge: 'bg-gray-200 text-gray-700',
            text: 'text-brand-slate',
            highlight: highlightColor || 'text-gray-500'
          }
        : { 
            bg: 'bg-gradient-to-b from-orange-50 to-white', 
            border: 'border-orange-200',
            badge: 'bg-orange-200 text-orange-800',
            text: 'text-brand-slate',
            highlight: highlightColor || 'text-orange-600'
          };
    
    return (
      <div className={`flex flex-col items-center justify-end ${isFirst ? '-mt-12 z-20' : 'z-10'}`}>
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: rank * 0.1 }}
          className="relative flex flex-col items-center group"
        >
          {isFirst && (
             <img 
               src={trophyImg} 
               alt="Trophy" 
               className="w-28 h-28 absolute -top-24 left-1/2 -translate-x-1/2 z-30 drop-shadow-lg"
             />
          )}
          
          <div className="mb-4 relative z-20">
            {/* Rank Badge */}
            <div className={`
              absolute -top-3 left-1/2 -translate-x-1/2 
              whitespace-nowrap px-3 py-0.5 rounded-full 
              ${config.badge}
              font-bold font-mono text-xs shadow-sm
            `}>
              NO. {rank}
            </div>

            {/* Avatar */}
            <div className={`
              w-24 h-24 rounded-full border-4 border-white shadow-md
              bg-gray-100 overflow-hidden relative z-10
              group-hover:scale-105 transition-transform duration-300
            `}>
              <img src={student.student.avatar} alt={student.student.name} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Podium Base */}
          <div className={`
            w-36 ${height} ${config.bg}
            border border-b-0 ${config.border} rounded-t-xl
            flex flex-col items-center pt-8
            shadow-sm relative overflow-hidden
          `}>
             <h3 className="text-lg font-bold font-sans text-center w-full px-2 text-brand-slate truncate">
               {student.student.name}
             </h3>
             
             <div className="mt-auto mb-6 flex flex-col items-center">
                <span className={`text-3xl font-bold font-mono ${config.highlight}`}>
                  {points}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
                   {getLabel()}
                </span>
             </div>
             
             {/* Bottom Decoration */}
             <div className="absolute bottom-0 w-full h-1 bg-gray-100"></div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="flex items-end justify-center gap-4 h-full pb-0 mt-8">
      {renderCard(second, 2)}
      {renderCard(first, 1)}
      {renderCard(third, 3)}
    </div>
  );
}
