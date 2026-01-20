import { useState, useEffect } from 'react';
import { useData, type RankingPeriod } from '@/contexts/DataContext';
import { Clock } from '@/components/dashboard/Clock';
import { TopPodium } from '@/components/dashboard/TopPodium';
import { LeaderboardList } from '@/components/dashboard/LeaderboardList';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Settings, Cpu, Play, Pause } from 'lucide-react';
import logoImg from '@/assets/logo.png';
import bgImg from '@/assets/stem_bg.jpg';
import { motion, AnimatePresence } from 'framer-motion';

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
    switch(p) {
      case 'balance': return '持有积分';
      case 'month': return '本月积分';
      case 'week': return '本周积分';
      default: return '积分';
    }
  };

  return (
    <div 
      className="min-h-screen text-foreground overflow-hidden relative font-sans flex flex-col"
      style={{
        backgroundImage: `url(${bgImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Light Overlay for readability */}
      <div className="absolute inset-0 bg-white/60 z-0" />

      {/* Main Container */}
      <div className="relative z-10 flex-1 flex flex-col p-4 md:p-6 gap-6 h-screen max-h-screen overflow-hidden">
        
        {/* Header Section */}
        <header className="flex items-center justify-between glass-card px-6 py-4 shrink-0">
          <div className="flex items-center gap-4">
             <div className="p-2 bg-brand-blue/10 rounded-lg">
               <img src={logoImg} className="h-10 w-10 object-contain" alt="Logo" />
             </div>
             
             <div>
               <h1 className="text-2xl font-bold text-brand-slate">
                 沐新青少年科创中心 <span className="text-brand-blue text-lg font-medium opacity-80">STEM EDU</span>
               </h1>
               <div className="flex items-center gap-2 text-muted-foreground font-mono text-xs mt-1">
                 <Cpu className="w-3 h-3" />
                 <span>学生成长激励系统 v3.3</span>
               </div>
             </div>
          </div>
          
          <div className="flex items-center gap-6">
            <Clock />
            <Link href="/admin">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg w-10 h-10">
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
              className="flex-[2] glass-card p-6 relative overflow-hidden flex flex-col"
            >
               {/* Progress Bar for Auto Rotation */}
               {isAutoPlay && (
                 <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
                    <motion.div 
                      className={`h-full transition-colors duration-300 ${
                        period === 'balance' ? 'bg-brand-blue' : period === 'month' ? 'bg-purple-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${progress}%`, transition: 'width 100ms linear' }}
                    />
                 </div>
               )}
               {!isAutoPlay && (
                  <div className={`absolute top-0 left-0 w-full h-1 transition-colors duration-300 ${
                    period === 'balance' ? 'bg-brand-blue' : period === 'month' ? 'bg-purple-500' : 'bg-green-500'
                  }`}></div>
               )}
               
               <div className="flex items-center justify-center gap-2 mb-4">
                  <h2 className="text-xl font-bold text-brand-slate">
                    荣誉殿堂
                  </h2>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded-full text-white transition-colors duration-300 ${
                    period === 'balance' ? 'bg-brand-blue' : period === 'month' ? 'bg-purple-500' : 'bg-green-500'
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
            
            {/* Stats Card */}
             <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="h-48"
             >
               <StatsCard />
             </motion.div>
          </div>

          {/* Center Column: Main Leaderboard (5 Cols) */}
          <motion.div 
            layout
            className="col-span-12 lg:col-span-5 glass-card p-0 flex flex-col relative overflow-hidden"
          >
             <div className="p-6 pb-2 border-b border-gray-100 flex items-center justify-between">
               <h2 className="text-xl font-bold text-brand-slate flex items-center gap-2">
                 <div className={`w-1.5 h-6 rounded-full transition-colors duration-300 ${
                    period === 'balance' ? 'bg-brand-blue' : period === 'month' ? 'bg-purple-500' : 'bg-green-500'
                 }`}></div>
                 龙虎榜
               </h2>
               
               {/* View Switcher & Auto Toggle */}
               <div className="flex items-center gap-2">
                 <div className="flex bg-gray-100 p-1 rounded-lg">
                   <button 
                     onClick={() => handleManualChange('balance')}
                     className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${period === 'balance' ? 'bg-white shadow-sm text-brand-blue' : 'text-gray-500 hover:text-gray-700'}`}
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
                   {isAutoPlay ? <Pause className="w-4 h-4 text-brand-blue" /> : <Play className="w-4 h-4 text-muted-foreground" />}
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
            
            {/* Promo / Info Card */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="h-auto min-h-[140px] bg-gradient-to-br from-brand-blue to-indigo-600 rounded-lg p-5 text-white relative overflow-hidden group cursor-pointer shadow-lg shadow-brand-blue/20"
            >
               <div className="absolute top-0 right-0 p-4 opacity-20">
                 <Cpu className="w-20 h-20 rotate-12" />
               </div>
               
               <p className="font-mono text-xs opacity-80 mb-2">近期活动</p>
               <h3 className="font-bold text-xl mb-3">2026 机器人<br/>编程挑战赛</h3>
               <button className="bg-white text-brand-blue text-xs font-bold px-3 py-1.5 rounded shadow-sm hover:bg-gray-50 transition-colors">
                 查看详情 →
               </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
