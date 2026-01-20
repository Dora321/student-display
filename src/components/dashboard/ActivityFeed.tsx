import { useData } from '@/contexts/DataContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Star, Trophy, Target } from 'lucide-react';
import { format } from 'date-fns';

export function ActivityFeed() {
  const { points, students } = useData();
  const recentPoints = [...points].sort((a, b) => b.timestamp - a.timestamp).slice(0, 6);

  const getIcon = (type: string) => {
    switch(type) {
      case 'achievement': return <Trophy className="w-3.5 h-3.5 text-yellow-500" />;
      case 'behavior': return <Star className="w-3.5 h-3.5 text-purple-500" />;
      case 'challenge': return <Target className="w-3.5 h-3.5 text-red-500" />;
      default: return <Zap className="w-3.5 h-3.5 text-brand-blue" />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="space-y-3 flex-1 overflow-y-auto pr-1 scrollbar-hide">
        <AnimatePresence>
          {recentPoints.map((point, i) => {
            const student = students.find(s => s.id === point.studentId);
            return (
              <motion.div
                key={point.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="
                  flex items-start gap-3 p-3 rounded-lg
                  bg-white border border-gray-100 shadow-sm
                  hover:shadow-md transition-all duration-200 group
                "
              >
                <div className="p-2 rounded-md bg-gray-50 border border-gray-100 group-hover:bg-white group-hover:border-brand-blue/30 transition-colors">
                  {getIcon(point.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-sm text-brand-slate group-hover:text-brand-blue transition-colors">
                      {student?.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {format(point.timestamp, 'HH:mm')}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-1">
                    {point.reason}
                  </div>
                </div>
                
                <div className="font-mono font-bold text-brand-blue text-sm bg-blue-50 px-2 py-0.5 rounded text-center min-w-[3rem]">
                  +{point.amount}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {recentPoints.length === 0 && (
          <div className="text-center py-10 text-muted-foreground text-sm">
            暂无动态
          </div>
        )}
      </div>
    </div>
  );
}
