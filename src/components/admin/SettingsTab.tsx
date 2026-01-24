import { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { initSupabase, clearSupabaseConfig, getSupabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from 'sonner';
import { Database, Link2, Wifi, WifiOff, AlertCircle, Loader2, Download, Upload, FileJson } from 'lucide-react';

export function SettingsTab() {
  const { isOnline, refreshData, students, classes, points, importData } = useData();
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    // Load existing
    const client = getSupabase();
    if (client) {
      setIsConnected(true);
      setUrl(localStorage.getItem('smd_supabase_url') || '');
      setKey(localStorage.getItem('smd_supabase_key') || '');
    }
  }, []);

  const handleConnect = async () => {
    setErrorDetails(null);
    if (!url || !key) {
      setErrorDetails('URL and API Key are required');
      return toast.error('请输入 URL 和 Key');
    }

    // 1. Basic format validation
    if (!url.startsWith('https://')) {
      setErrorDetails('URL must start with https://');
      return toast.error('无效的 URL 格式');
    }

    setIsTesting(true);

    try {
      // 2. Initialize Client
      const success = initSupabase(url, key);
      if (!success) throw new Error('初始化 Supabase 客户端失败');

      // 3. Test Connection explicitly
      const client = getSupabase();
      if (!client) throw new Error('初始化后未找到客户端');

      // Test query: check if we can read from public table
      // We use 'count' to be lightweight
      const { error } = await client.from('classes').select('id', { count: 'exact', head: true });

      if (error) {
        throw error;
      }

      toast.success('连接成功！同步已激活。');
      setIsConnected(true);
      await refreshData();

    } catch (e: any) {
      console.error(e);
      let msg = e.message || '未知网络错误';
      if (e.code) msg += ` (Code: ${e.code})`;
      if (e.hint) msg += ` Hint: ${e.hint}`;

      setErrorDetails(msg);
      toast.error('连接失败');

      // Cleanup
      clearSupabaseConfig();
      setIsConnected(false);
    } finally {
      setIsTesting(false);
    }
  };

  const handleDisconnect = () => {
    clearSupabaseConfig();
    setIsConnected(false);
    setUrl('');
    setKey('');
    setErrorDetails(null);
    toast.info('已断开云数据库连接');
    window.location.reload();
  };

  const handleExport = () => {
    const data = {
      version: '1.0',
      timestamp: Date.now(),
      students,
      classes,
      points
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smd_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('数据备份已下载');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (window.confirm('导入不仅会覆盖当前数据，且该操作不可撤销。确定继续吗？')) {
          const success = await importData(json);
          if (success) {
            toast.success('数据恢复成功！');
          } else {
            toast.error('数据格式错误，导入失败');
          }
        }
      } catch (err) {
        console.error(err);
        toast.error('无法解析文件');
      }
      // Reset input
      event.target.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm">
              <Database className="text-brand-blue w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl text-slate-800">云数据库连接</CardTitle>
              <CardDescription className="text-slate-500 mt-1">
                连接到 Supabase 以启用多设备数据同步。
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className={`flex items-center gap-4 p-4 rounded-xl border ${isOnline ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
            <div className={`p-3 rounded-full ${isOnline ? 'bg-white text-green-600 shadow-sm' : 'bg-white text-slate-400 shadow-sm'}`}>
              {isOnline ? <Wifi className="w-6 h-6" /> : <WifiOff className="w-6 h-6" />}
            </div>
            <div>
              <h3 className={`font-bold ${isOnline ? 'text-green-800' : 'text-slate-700'}`}>
                {isOnline ? '系统在线' : '离线模式'}
              </h3>
              <p className={`text-sm ${isOnline ? 'text-green-600' : 'text-slate-500'}`}>
                {isOnline
                  ? '数据正在所有设备间实时同步。'
                  : '数据仅存储在本地设备。'}
              </p>
            </div>
          </div>

          {errorDetails && (
            <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>连接错误</AlertTitle>
              <AlertDescription className="font-mono text-xs mt-1 text-red-600">
                {errorDetails}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-slate-700">项目 URL (Project URL)</Label>
              <Input
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                disabled={isConnected || isTesting}
                className="font-mono bg-slate-50 border-slate-200 text-slate-600"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">API 密钥 (API Key - anon/public)</Label>
              <Input
                value={key}
                onChange={e => setKey(e.target.value)}
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                disabled={isConnected || isTesting}
                className="font-mono bg-slate-50 border-slate-200 text-slate-600"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-100 mt-6">
            {!isConnected ? (
              <Button
                onClick={handleConnect}
                className="flex-1 bg-brand-blue text-white font-bold hover:bg-blue-700 shadow-sm"
                disabled={isTesting}
              >
                {isTesting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> 连接中...</>
                ) : (
                  <><Link2 className="w-4 h-4 mr-2" /> 连接数据库</>
                )}
              </Button>
            ) : (
              <Button onClick={handleDisconnect} variant="destructive" className="flex-1 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:text-red-700 shadow-sm">
                断开连接并重置
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Management Card */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm">
              <FileJson className="text-orange-500 w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl text-slate-800">数据管理</CardTitle>
              <CardDescription className="text-slate-500 mt-1">
                备份或恢复系统数据 (JSON 格式)。
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-bold text-slate-700 flex items-center gap-2">
                <Download className="w-4 h-4" /> 导出备份
              </h4>
              <p className="text-sm text-slate-500">
                将当前所有学生、班级和积分记录导出为 JSON 文件。
              </p>
              <Button onClick={handleExport} variant="outline" className="w-full border-slate-200 hover:bg-slate-50 text-slate-700">
                <Download className="w-4 h-4 mr-2" /> 下载备份文件
              </Button>
            </div>

            <div className="space-y-3 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-4">
              <h4 className="font-bold text-slate-700 flex items-center gap-2">
                <Upload className="w-4 h-4" /> 导入/恢复
              </h4>
              <p className="text-sm text-slate-500">
                从备份文件中恢复数据。注意：这将覆盖现有数据。
              </p>
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" className="w-full border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 hover:text-orange-800 hover:border-orange-300">
                  <Upload className="w-4 h-4 mr-2" /> 选择备份文件恢复
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting Tips */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 space-y-4">
        <h4 className="font-bold text-slate-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-brand-blue" />
          故障排除提示
        </h4>
        <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
          <li>
            <strong>网络错误？</strong> 检查您的浏览器扩展（如 AdBlock）是否阻止了 Supabase 请求。
          </li>
          <li>
            <strong>权限被拒绝？</strong> 您是否运行了 <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 text-blue-700 font-mono text-xs">setup_database.sql</code> 脚本？它禁用了 RLS 以允许访问。
          </li>
          <li>
            <strong>无效的 URL？</strong> 确保它以 <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 text-blue-700 font-mono text-xs">https://</code> 开头并以 <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 text-blue-700 font-mono text-xs">.supabase.co</code> 结尾。
          </li>
          <li>
            <strong>错误的密钥？</strong> 确保使用 <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 text-blue-700 font-mono text-xs">anon</code> / <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 text-blue-700 font-mono text-xs">public</code> 密钥，而不是 service_role 密钥。
          </li>
        </ul>
      </div>
    </div>
  );
}
