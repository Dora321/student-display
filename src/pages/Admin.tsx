import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PointsForm } from '@/components/admin/PointsForm';

import { SettingsTab } from '@/components/admin/SettingsTab';
import { ClassManagement } from '@/components/admin/ClassManagement';
import { PointsHistory } from '@/components/admin/PointsHistory';
import { LogOut, LayoutDashboard, Users, Award, Settings, GraduationCap, History } from 'lucide-react';

export default function AdminDashboard() {
  const { currentUser, logout } = useData();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('points');

  if (!currentUser) {
    setLocation('/admin'); // Redirect to login if not auth
    return null;
  }

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-blue/10 rounded-lg">
            <LayoutDashboard className="text-brand-blue w-6 h-6" />
          </div>
          <h1 className="font-sans text-xl font-bold tracking-tight text-slate-800">教师控制台</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-500 text-sm font-medium">欢迎, {currentUser.name}</span>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-500 hover:text-red-600 hover:bg-red-50">
            <LogOut className="w-4 h-4 mr-2" /> 退出
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="bg-white border border-slate-200 shadow-sm p-1 rounded-xl h-auto">
              <TabsTrigger
                value="points"
                className="px-6 py-2.5 rounded-lg data-[state=active]:bg-brand-blue data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-medium text-slate-600"
              >
                <Award className="w-4 h-4 mr-2" /> 积分管理
              </TabsTrigger>

              <TabsTrigger
                value="classes"
                className="px-6 py-2.5 rounded-lg data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-medium text-slate-600"
              >
                <GraduationCap className="w-4 h-4 mr-2" /> 班级管理
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="px-6 py-2.5 rounded-lg data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-medium text-slate-600"
              >
                <History className="w-4 h-4 mr-2" /> 历史记录
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="px-6 py-2.5 rounded-lg data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-medium text-slate-600"
              >
                <Settings className="w-4 h-4 mr-2" /> 系统设置
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="max-w-5xl mx-auto">
            <TabsContent value="points" className="mt-0 focus-visible:outline-none">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">学生积分激励</h2>
                <p className="text-slate-500">奖励学生的成就、表现和参与度。</p>
              </div>
              <PointsForm />
            </TabsContent>



            <TabsContent value="classes" className="mt-0 focus-visible:outline-none">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">班级与学生管理</h2>
                <p className="text-slate-500">管理班级名单和注册新学生。</p>
              </div>
              <ClassManagement />
            </TabsContent>

            <TabsContent value="history" className="mt-0 focus-visible:outline-none">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">积分审计日志</h2>
                <p className="text-slate-500">查看和筛选历史积分变动与兑换记录。</p>
              </div>
              <PointsHistory />
            </TabsContent>

            <TabsContent value="settings" className="mt-0 focus-visible:outline-none">
              <SettingsTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
