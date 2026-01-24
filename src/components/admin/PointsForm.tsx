import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Trophy, Star, Zap, ShoppingBag, Trash2 } from 'lucide-react';

export function PointsForm() {
  const { classes, students, addPoint, redeemPoints, resetPoints, getStudentStats } = useData();

  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [amount, setAmount] = useState<string>('10');
  const [reason, setReason] = useState('');
  const [redeemItem, setRedeemItem] = useState('');
  const [type, setType] = useState<'achievement' | 'behavior' | 'participation'>('participation');
  const [mode, setMode] = useState<'award' | 'redeem'>('award');

  const filteredStudents = students.filter(s => s.classId === selectedClassId);
  const currentStudentStats = selectedStudentId ? getStudentStats(selectedStudentId) : null;

  const handleAward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !amount || !reason) {
      toast.error('请填写所有字段');
      return;
    }

    addPoint(selectedStudentId, Number(amount), reason, type);
    toast.success('积分已颁发！');
    setReason('');
  };

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !amount || !redeemItem) {
      toast.error('请填写所有字段');
      return;
    }

    const cost = Number(amount);
    if (currentStudentStats && currentStudentStats.currentBalance < cost) {
      toast.error(`余额不足！该学生仅有 ${currentStudentStats.currentBalance} 积分。`);
      return;
    }

    redeemPoints(selectedStudentId, cost, redeemItem);
    toast.success('兑换成功！');
    setRedeemItem('');
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex justify-center mb-6">
        <div className="bg-slate-100 p-1 rounded-lg inline-flex">
          <button
            onClick={() => setMode('award')}
            className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${mode === 'award' ? 'bg-white text-brand-blue shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            颁发积分
          </button>
          <button
            onClick={() => setMode('redeem')}
            className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${mode === 'redeem' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            礼品兑换
          </button>
        </div>
      </div>

      <div className="p-8 bg-white rounded-xl border border-slate-200 shadow-sm transition-all duration-300">
        <div className="space-y-6">

          {/* Common Selection */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-slate-700">选择班级</Label>
              <Select onValueChange={setSelectedClassId} value={selectedClassId}>
                <SelectTrigger className="bg-slate-50 border-slate-200">
                  <SelectValue placeholder="请选择班级" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  {classes.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">选择学生</Label>
              <Select onValueChange={setSelectedStudentId} value={selectedStudentId} disabled={!selectedClassId}>
                <SelectTrigger className="bg-slate-50 border-slate-200">
                  <SelectValue placeholder="请选择学生" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  {filteredStudents.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Current Balance Display */}
          {selectedStudentId && currentStudentStats && (
            <div className={`relative text-center p-3 rounded-lg border ${mode === 'award' ? 'bg-blue-50 border-blue-100 text-brand-blue' : 'bg-orange-50 border-orange-100 text-orange-600'}`}>
              <span className="text-sm font-medium uppercase tracking-wide opacity-80">当前持有积分</span>
              <div className="text-2xl font-mono font-bold">{currentStudentStats.currentBalance} 分</div>
              {currentStudentStats.currentBalance !== 0 && (
                <button
                  onClick={() => {
                    if (window.confirm(`确定要将 ${currentStudentStats.student.name} 的积分清零吗？`)) {
                      resetPoints(selectedStudentId);
                    }
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-white/50 rounded-full transition-colors text-slate-400 hover:text-red-500"
                  title="一键清零"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {mode === 'award' ? (
            <>
              <div className="space-y-2">
                <Label className="text-slate-700">加分理由</Label>
                <Input
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="例如：完成项目作品"
                  className="bg-slate-50 border-slate-200 placeholder:text-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-700">分值</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    step="0.5"
                    className="bg-slate-50 border-slate-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700">类型</Label>
                  <div className="flex bg-slate-100 p-1 rounded-lg gap-1">
                    <Button
                      type="button"
                      variant={type === 'participation' ? 'secondary' : 'ghost'}
                      size="sm"
                      className={`flex-1 ${type === 'participation' ? 'bg-white text-brand-blue shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      onClick={() => setType('participation')}
                    >
                      <Zap className="w-4 h-4 mr-1" /> 参与
                    </Button>
                    <Button
                      type="button"
                      variant={type === 'achievement' ? 'secondary' : 'ghost'}
                      size="sm"
                      className={`flex-1 ${type === 'achievement' ? 'bg-white text-yellow-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      onClick={() => setType('achievement')}
                    >
                      <Trophy className="w-4 h-4 mr-1" /> 成就
                    </Button>
                    <Button
                      type="button"
                      variant={type === 'behavior' ? 'secondary' : 'ghost'}
                      size="sm"
                      className={`flex-1 ${type === 'behavior' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      onClick={() => setType('behavior')}
                    >
                      <Star className="w-4 h-4 mr-1" /> 表现
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5 px-1">
                    {type === 'participation' && '用于奖励课堂互动、积极回答问题等活跃表现。'}
                    {type === 'achievement' && '用于奖励项目完成、比赛获奖等里程碑成就。'}
                    {type === 'behavior' && '用于奖励乐于助人、遵守纪律等良好行为习惯。'}
                  </p>
                </div>
              </div>

              <Button onClick={handleAward} className="w-full bg-brand-blue text-white font-bold hover:bg-blue-700 shadow-md transition-all h-12 text-lg rounded-lg mt-2">
                确认颁发
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label className="text-slate-700">礼品/项目名称</Label>
                <div className="relative">
                  <ShoppingBag className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    value={redeemItem}
                    onChange={e => setRedeemItem(e.target.value)}
                    placeholder="例如：乐高套装 #421"
                    className="bg-slate-50 border-slate-200 placeholder:text-slate-400 pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700">消耗积分</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  step="0.5"
                  className="bg-slate-50 border-slate-200 text-orange-600 font-bold"
                />
              </div>

              <Button onClick={handleRedeem} className="w-full bg-orange-500 text-white font-bold hover:bg-orange-600 shadow-md transition-all h-12 text-lg rounded-lg mt-2">
                确认兑换
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
