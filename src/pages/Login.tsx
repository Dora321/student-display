import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Lock, ArrowRight, Cpu } from 'lucide-react';
import logoImg from '@/assets/logo.png';
import bgImg from '@/assets/stem_bg.jpg';

export default function Login() {
  const [pin, setPin] = useState('');
  const { login } = useData();
  const [, setLocation] = useLocation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(pin)) {
      toast.success('登录成功');
      setLocation('/admin/dashboard');
    } else {
      toast.error('PIN 码错误');
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4"
      style={{
        backgroundImage: `url(${bgImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Light Overlay */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm z-0" />

      <Card className="w-full max-w-md bg-white/80 border border-white shadow-xl backdrop-blur-md relative z-10 overflow-hidden">
        {/* Decorative Top Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-brand-blue to-cyan-400"></div>
        
        <CardContent className="pt-12 pb-10 px-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 bg-white rounded-2xl shadow-md flex items-center justify-center mb-6 border border-slate-100">
              <img src={logoImg} className="w-12 h-12 object-contain" alt="Logo" />
            </div>
            
            <h1 className="text-2xl font-bold text-slate-800 mb-2">教师控制台</h1>
            <p className="text-slate-500 text-sm">
              沐新青少年科创中心 STEM EDU
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input 
                  type="password" 
                  placeholder="请输入访问 PIN 码" 
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  className="pl-10 h-12 bg-white border-slate-200 text-center text-lg tracking-widest font-mono placeholder:text-slate-300 focus:border-brand-blue focus:ring-brand-blue/20"
                  maxLength={4}
                  autoFocus
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 bg-brand-blue hover:bg-blue-700 text-white font-bold shadow-lg shadow-brand-blue/20 transition-all hover:scale-[1.02]"
            >
              进入系统 <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="mt-8 flex justify-center text-xs text-slate-400 gap-2 items-center">
            <Cpu className="w-3 h-3" />
            <span>安全系统 v3.3</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
