import { useData, type RankingPeriod } from '@/contexts/DataContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Trophy, Zap, Activity } from 'lucide-react';

interface ClassRanksProps {
    period?: RankingPeriod;
}

export function ClassRanks({ period = 'balance' }: ClassRanksProps) {
    const { classes, students, points } = useData();

    // Helper to filter points by period
    const filterPoints = (pts: typeof points, p: RankingPeriod) => {
        const now = Date.now();
        if (p === 'week') return pts.filter(pt => now - pt.timestamp <= 7 * 24 * 60 * 60 * 1000);
        if (p === 'month') return pts.filter(pt => now - pt.timestamp <= 30 * 24 * 60 * 60 * 1000);
        return pts;
    };

    const periodPoints = filterPoints(points, period);

    // Calculate class stats
    const classStats = classes.map(cls => {
        const classStudents = students.filter(s => s.classId === cls.id);
        const studentIds = classStudents.map(s => s.id);

        // Total points for this class in this period
        const totalPoints = periodPoints
            .filter(p => studentIds.includes(p.studentId))
            .reduce((sum, p) => sum + p.amount, 0);

        // Active students (those who earned points in this period)
        const activeStudentCount = classStudents.filter(s =>
            periodPoints.some(p => p.studentId === s.id)
        ).length;

        const studentCount = classStudents.length;
        const avgPoints = studentCount > 0 ? Math.round(totalPoints / studentCount) : 0;

        // Active Rate (for Week/Month)
        const activeRate = studentCount > 0 ? Math.round((activeStudentCount / studentCount) * 100) : 0;

        return {
            id: cls.id,
            name: cls.name,
            studentCount,
            totalPoints,
            avgPoints,
            activeRate
        };
    });

    // Determine Ranking Metric
    // If period is week/month, rank by 'Active Rate' (Fairness for different subjects)
    // If period is balance, rank by 'Average Points' (Accumulation)
    const isEngagementView = period === 'week' || period === 'month';

    const sortedStats = classStats.sort((a, b) => {
        if (isEngagementView) {
            // Primary: Active Rate, Secondary: Avg Points
            if (b.activeRate !== a.activeRate) return b.activeRate - a.activeRate;
            return b.avgPoints - a.avgPoints;
        }
        return b.avgPoints - a.avgPoints;
    }).slice(0, 4);

    const maxVal = Math.max(...sortedStats.map(c => isEngagementView ? c.activeRate : c.avgPoints), 1);

    return (
        <div className="flex-1 glass-card p-5 relative overflow-hidden flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    {isEngagementView ? <Activity className="w-4 h-4 text-brand-orange" /> : <Trophy className="w-4 h-4 text-brand-orange" />}
                    班级争霸
                </h3>
                <span className="text-[10px] font-mono bg-blue-50 text-brand-blue px-2 py-0.5 rounded border border-blue-100 uppercase">
                    {isEngagementView ? 'Active Rate' : 'Avg Points'}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3">
                <AnimatePresence mode='popLayout'>
                    {sortedStats.map((cls, idx) => (
                        <motion.div
                            key={cls.id}
                            layout
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="relative"
                        >
                            <div className="flex items-center justify-between mb-1 z-10 relative">
                                <div className="flex items-center gap-2">
                                    <div className={`
                  w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold font-mono
                  ${idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                                            idx === 1 ? 'bg-slate-100 text-slate-700' :
                                                idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-500'}
                `}>
                                        {idx + 1}
                                    </div>
                                    <span className="text-xs font-bold text-slate-700">{cls.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                        <Users className="w-3 h-3" /> {cls.studentCount}
                                    </span>
                                    <span className="text-xs font-mono font-bold text-brand-blue">
                                        {isEngagementView ? `${cls.activeRate}%` : cls.avgPoints}
                                        {/* Label suffix */}
                                        <span className="text-[9px] text-slate-400 ml-0.5">
                                            {isEngagementView ? '活跃' : 'AVG'}
                                        </span>
                                    </span>
                                </div>
                            </div>

                            {/* Progress Bar Container */}
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative">
                                <motion.div
                                    className={`h-full rounded-full ${idx === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-400' :
                                            idx === 1 ? 'bg-gradient-to-r from-blue-400 to-indigo-400' :
                                                'bg-slate-300'
                                        }`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((isEngagementView ? cls.activeRate : cls.avgPoints) / maxVal) * 100}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {classStats.length === 0 && (
                    <div className="text-center py-4 text-xs text-slate-400">
                        暂无班级数据
                    </div>
                )}
            </div>
        </div>
    );
}
