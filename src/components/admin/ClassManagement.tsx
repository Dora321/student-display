import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, School, UserPlus, Trash2, AlertTriangle, Pencil, Settings2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function ClassManagement() {
  const { classes, students, addClass, updateClass, addStudent, updateStudent, deleteClass, deleteStudent } = useData();
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isEditClassOpen, setIsEditClassOpen] = useState(false);
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false);

  // Form states
  const [newClassName, setNewClassName] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');

  // Edit states
  const [editingClass, setEditingClass] = useState<{ id: string, name: string } | null>(null);
  const [editingStudent, setEditingStudent] = useState<{ id: string, name: string, classId: string, avatar?: string } | null>(null);

  const handleUpdateClass = async () => {
    if (!editingClass || !editingClass.name.trim()) return;
    await updateClass(editingClass.id, editingClass.name);
    setEditingClass(null);
    setIsEditClassOpen(false);
  };

  const handleUpdateStudent = async () => {
    if (!editingStudent || !editingStudent.name.trim() || !editingStudent.classId) return;
    await updateStudent(editingStudent.id, {
      name: editingStudent.name,
      classId: editingStudent.classId,
      // We don't edit avatar via UI yet, but we shouldn't lose it if we had a full object
    });
    setEditingStudent(null);
    setIsEditStudentOpen(false);
  };

  const handleAddClass = async () => {
    if (!newClassName.trim()) {
      toast.error('班级名称必填');
      return;
    }
    await addClass(newClassName);
    setNewClassName('');
    setIsAddClassOpen(false);
  };

  const handleAddStudent = async () => {
    if (!newStudentName.trim() || !selectedClassId) {
      toast.error('姓名和班级必填');
      return;
    }
    await addStudent(newStudentName, selectedClassId);
    setNewStudentName('');
    setIsAddStudentOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-slate-800">快捷操作</h3>
          <p className="text-sm text-slate-500">管理您的班级名单和学生信息。</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={isAddClassOpen} onOpenChange={setIsAddClassOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-blue text-white hover:bg-blue-700 font-medium shadow-sm">
                <Plus className="w-4 h-4 mr-2" /> 新建班级
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-slate-200 sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-slate-900">创建新班级</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-slate-700">班级名称</Label>
                  <Input
                    value={newClassName}
                    onChange={e => setNewClassName(e.target.value)}
                    placeholder="例如：机器人一班"
                    className="bg-slate-50 border-slate-200"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddClass} className="bg-brand-blue text-white hover:bg-blue-700">
                  创建
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-medium">
                <UserPlus className="w-4 h-4 mr-2" /> 添加学生
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-slate-200 sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-slate-900">注册新学生</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-slate-700">学生姓名</Label>
                  <Input
                    value={newStudentName}
                    onChange={e => setNewStudentName(e.target.value)}
                    placeholder="例如：张三"
                    className="bg-slate-50 border-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">所属班级</Label>
                  <Select value={selectedClassId} onValueChange={setSelectedClassId}>
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
              </div>
              <DialogFooter>
                <Button onClick={handleAddStudent} className="bg-brand-blue text-white hover:bg-blue-700">
                  添加
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Class Dialog */}
      <Dialog open={isEditClassOpen} onOpenChange={setIsEditClassOpen}>
        <DialogContent className="bg-white border-slate-200 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900">重命名班级</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>班级名称</Label>
              <Input
                value={editingClass?.name || ''}
                onChange={e => setEditingClass(prev => prev ? { ...prev, name: e.target.value } : null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateClass} className="bg-brand-blue text-white">保存修改</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={isEditStudentOpen} onOpenChange={setIsEditStudentOpen}>
        <DialogContent className="bg-white border-slate-200 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900">编辑学生信息</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>学生姓名</Label>
              <Input
                value={editingStudent?.name || ''}
                onChange={e => setEditingStudent(prev => prev ? { ...prev, name: e.target.value } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label>所属班级</Label>
              <Select
                value={editingStudent?.classId || ''}
                onValueChange={val => setEditingStudent(prev => prev ? { ...prev, classId: val } : null)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateStudent} className="bg-brand-blue text-white">保存修改</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Class Lists */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {classes.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-slate-500">
            <School className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-medium text-lg">暂无班级</p>
            <p className="text-sm">请先创建一个班级。</p>
          </div>
        ) : (
          classes.map(cls => {
            const classStudents = students.filter(s => s.classId === cls.id);
            return (
              <Card key={cls.id} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-white rounded-md border border-slate-200 shadow-sm">
                        <School className="w-4 h-4 text-brand-blue" />
                      </div>
                      <CardTitle className="text-base font-bold text-slate-800">{cls.name}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-slate-400 hover:text-blue-500"
                        onClick={() => {
                          setEditingClass({ id: cls.id, name: cls.name });
                          setIsEditClassOpen(true);
                        }}
                        title="重命名班级"
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-medium bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
                        {classStudents.length} 人
                      </span>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500 hover:bg-red-50">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white border-slate-200">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-slate-900">删除班级？</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-500">
                              这将永久删除 "{cls.name}"。
                              {classStudents.length > 0 && (
                                <div className="mt-2 flex items-start gap-2 text-red-600 bg-red-50 p-2 rounded text-xs">
                                  <AlertTriangle className="w-4 h-4 shrink-0" />
                                  <span>警告：该班级包含 {classStudents.length} 名学生。删除班级可能导致学生数据丢失。</span>
                                </div>
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50">取消</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteClass(cls.id)} className="bg-red-600 text-white hover:bg-red-700">确认删除</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {classStudents.length > 0 ? (
                    <div className="space-y-2 max-h-[240px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                      {classStudents.map(student => (
                        <div key={student.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group/item">
                          <div className="flex items-center gap-3">
                            <img src={student.avatar} alt={student.name} className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200" />
                            <span className="text-sm font-medium text-slate-700">{student.name}</span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-slate-400 hover:text-blue-500"
                              onClick={() => {
                                setEditingStudent({ ...student });
                                setIsEditStudentOpen(true);
                              }}
                              title="编辑/换班"
                            >
                              <Settings2 className="w-3 h-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-white border-slate-200">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-slate-900">移除学生？</AlertDialogTitle>
                                  <AlertDialogDescription className="text-slate-500">
                                    您确定要从班级中移除 <strong>{student.name}</strong> 吗？
                                    此操作无法撤销。
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50">取消</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteStudent(student.id)} className="bg-red-600 text-white hover:bg-red-700">移除</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-400 italic py-8 text-center bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                      暂无学生
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
