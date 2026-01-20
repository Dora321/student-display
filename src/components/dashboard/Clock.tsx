import { useEffect, useState } from 'react';
import { format } from 'date-fns';

export function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="font-mono text-brand-slate text-sm flex items-center gap-3 bg-white/50 px-3 py-1.5 rounded-lg border border-white/60 shadow-sm backdrop-blur-sm">
      <div className="opacity-60 font-medium">
        {format(time, 'yyyy-MM-dd')}
      </div>
      <div className="w-px h-3 bg-gray-300"></div>
      <div className="font-bold text-lg text-brand-blue tabular-nums">
        {format(time, 'HH:mm:ss')}
      </div>
    </div>
  );
}
