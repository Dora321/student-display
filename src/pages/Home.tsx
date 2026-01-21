import { useState, useEffect } from 'react';
import { useData, type RankingPeriod } from '@/contexts/DataContext';
import { Clock } from '@/components/dashboard/Clock';
import { TopPodium } from '@/components/dashboard/TopPodium';
import { LeaderboardList } from '@/components/dashboard/LeaderboardList';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Settings, Cpu, Play, Pause, Activity, Trophy } from 'lucide-react';
import logoImg from '@/assets/logo.png';
import { motion, AnimatePresence } from 'framer-motion';
import { ChannelsVideo } from '@/components/dashboard/ChannelsVideo';
import { ClassRanks } from '@/components/dashboard/ClassRanks';

interface HomeProps {
  targetSection?: string;
}

const ROTATION_INTERVAL = 15000; // 15 seconds

export default function Home({ targetSection }: HomeProps) {
  const { getAllStudentStats } = useData();
  const [period, setPeriod] = useState<RankingPeriod>('balance');
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [progress, setProgress] = useState(0);

  const stats = getAllStudentStats(period);

  // Auto-rotation logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    let progressInterval: ReturnType<typeof setInterval>;

    if (isAutoPlay) {
      setProgress(0);

      // Progress bar animation
      const updateFreq = 100;
      progressInterval = setInterval(() => {
        setProgress(p => {
          const next = p + (100 / (ROTATION_INTERVAL / updateFreq));
          return next >= 100 ? 100 : next;
        });
      }, updateFreq);

      // Period switching
      interval = setInterval(() => {
        setPeriod(current => {
          if (current === 'balance') return 'month';
          if (current === 'month') return 'week';
          return 'balance';
        });
        setProgress(0);
      }, ROTATION_INTERVAL);
    } else {
      setProgress(0);
    }

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, [isAutoPlay, period]);

  // Handling manual interaction
  const handleManualChange = (p: RankingPeriod) => {
    setPeriod(p);
    setIsAutoPlay(false);
  };

  const getPeriodLabel = (p: RankingPeriod) => {
    switch (p) {
      case 'balance': return '持有积分';
      case 'month': return '本月积分';
      case 'week': return '本周积分';
      default: return '积分';
    }
  };

  return (
    <div
      className="min-h-screen text-foreground overflow-hidden relative font-sans flex flex-col bg-background selection:bg-brand-blue/30"
    >
      {/* Futuristic Grid Background */}
      <div className="absolute inset-0 bg-grid-pattern z-0 opacity-[0.6] pointer-events-none" />

      {/* Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 flex-1 flex flex-col p-4 md:p-6 gap-6 h-screen max-h-screen overflow-hidden">

        {/* Header Section */}
        <header className="flex items-center justify-between glass-card px-6 py-4 shrink-0 border-l-4 border-l-brand-blue">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-white shadow-sm border border-slate-100 rounded-xl">
              <img src={logoImg} className="h-10 w-10 object-contain" alt="Logo" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                沐新青少年科创中心
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider bg-brand-orange text-white font-bold shadow-sm shadow-orange-200">
                  STEM DASHBOARD
                </span>
              </h1>
              <div className="flex items-center gap-4 text-slate-500 font-mono text-[10px] uppercase tracking-wider mt-1">
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3 h-3" />
                  <span>System v4.0</span>
                </div>
                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                <div className="flex items-center gap-1.5 text-green-600">
                  <Activity className="w-3 h-3" />
                  <span>Live Data</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Clock />
            <div className="h-8 w-px bg-slate-200" />
            <Link href="/admin">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-brand-blue hover:bg-blue-50 rounded-xl w-10 h-10 transition-all duration-300">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">

          {/* Left Column: Podium & Stats (4 Cols) */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 h-full">
            {/* Podium Card */}
            <motion.div
              layout
              className="flex-[1.6] glass-card p-6 relative overflow-hidden flex flex-col min-h-0"
            >
              {/* Progress Bar for Auto Rotation */}
              {isAutoPlay && (
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100/50">
                  <motion.div
                    className={`h-full transition-colors duration-300 ${period === 'balance' ? 'bg-brand-teal' : period === 'month' ? 'bg-purple-500' : 'bg-green-500'
                      }`}
                    style={{ width: `${progress}%`, transition: 'width 100ms linear' }}
                  />
                </div>
              )}
              {!isAutoPlay && (
                <div className={`absolute top-0 left-0 w-full h-1.5 transition-colors duration-300 ${period === 'balance' ? 'bg-brand-teal' : period === 'month' ? 'bg-purple-500' : 'bg-green-500'
                  }`}></div>
              )}

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-400/10 rounded-lg text-yellow-600">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">荣誉殿堂</h2>
                </div>

                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full text-white shadow-sm transition-colors duration-300 ${period === 'balance' ? 'bg-brand-blue' : period === 'month' ? 'bg-purple-500' : 'bg-green-500'
                  }`}>
                  {getPeriodLabel(period)}
                </span>
              </div>

              <div className="flex-1 min-h-0">
                <AnimatePresence mode='wait'>
                  <TopPodium key={period} top3={stats.slice(0, 3)} period={period} />
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Class Ranks */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex-1 min-h-0 flex flex-col"
            >
              <ClassRanks />
            </motion.div>

            {/* Stats Card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="h-36 shrink-0"
            >
              <StatsCard />
            </motion.div>
          </div>

          {/* Center Column: Main Leaderboard (5 Cols) */}
          <motion.div
            layout
            className="col-span-12 lg:col-span-5 glass-card p-0 flex flex-col relative overflow-hidden"
          >
            <div className="p-6 pb-2 border-b border-gray-100/50 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-brand-slate flex items-center gap-3">
                <div className={`w-2 h-8 rounded-full transition-colors duration-300 ${period === 'balance' ? 'bg-brand-teal' : period === 'month' ? 'bg-purple-500' : 'bg-green-500'
                  }`}></div>
                龙虎榜
              </h2>

              {/* View Switcher & Auto Toggle */}
              <div className="flex items-center gap-2">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => handleManualChange('balance')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${period === 'balance' ? 'bg-white shadow-sm text-brand-teal ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    持有
                  </button>
                  <button
                    onClick={() => handleManualChange('month')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${period === 'month' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    月榜
                  </button>
                  <button
                    onClick={() => handleManualChange('week')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${period === 'week' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    周榜
                  </button>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 rounded-full hover:bg-gray-100"
                  onClick={() => setIsAutoPlay(!isAutoPlay)}
                  title={isAutoPlay ? "Pause Rotation" : "Auto Rotate"}
                >
                  {isAutoPlay ? <Pause className="w-4 h-4 text-brand-teal" /> : <Play className="w-4 h-4 text-muted-foreground" />}
                </Button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden bg-white/40">
              <AnimatePresence mode='wait'>
                <LeaderboardList key={period} students={stats} period={period} />
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right Column: Activity Feed & Info (3 Cols) */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-6 h-full">
            {/* Feed */}
            <motion.div
              layout
              className="flex-1 glass-card p-6 relative overflow-hidden flex flex-col"
            >
              <h3 className="text-sm font-bold text-brand-slate mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-brand-orange rounded-full animate-pulse"></span>
                实时动态
              </h3>
              <ActivityFeed />
            </motion.div>

            {/* Video Highlight Card (Replaced Promo Card) */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex-shrink-0"
            >
              <ChannelsVideo
                title="科技探索·精彩瞬间"
                description="沐新科创中心学生实践精彩片段，看小小程序员如何改写未来！"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
