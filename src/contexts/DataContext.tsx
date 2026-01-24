import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Student, ClassGroup, PointRecord, Teacher, StudentStats } from '../types';
import { mockStudents, mockClasses, mockPoints, mockTeachers } from '../lib/mockData';
import { nanoid } from 'nanoid';
import { getSupabase } from '../lib/supabase';
import { toast } from 'sonner';
import { startOfWeek, startOfMonth } from 'date-fns';

export type RankingPeriod = 'balance' | 'week' | 'month';

interface DataContextType {
  students: Student[];
  classes: ClassGroup[];
  points: PointRecord[];

  teachers: Teacher[];
  currentUser: Teacher | null;
  isOnline: boolean;
  login: (pin: string) => boolean;
  logout: () => void;
  addPoint: (studentId: string, amount: number, reason: string, type: PointRecord['type']) => Promise<void>;
  redeemPoints: (studentId: string, amount: number, item: string) => Promise<void>;
  resetPoints: (studentId: string) => Promise<void>;
  importData: (data: any) => Promise<boolean>;

  addClass: (name: string) => Promise<void>;
  updateClass: (id: string, name: string) => Promise<void>;
  addStudent: (name: string, classId: string, avatar?: string) => Promise<void>;
  updateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  getStudentStats: (studentId: string) => StudentStats;
  getAllStudentStats: (period?: RankingPeriod) => StudentStats[];
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [points, setPoints] = useState<PointRecord[]>([]);

  const [teachers] = useState<Teacher[]>(mockTeachers);
  const [currentUser, setCurrentUser] = useState<Teacher | null>(null);
  const [isOnline, setIsOnline] = useState(false);

  const supabase = getSupabase();

  const loadLocalData = useCallback(() => {
    const s_students = localStorage.getItem('smd_students');
    const s_classes = localStorage.getItem('smd_classes');
    const s_points = localStorage.getItem('smd_points');

    setStudents(s_students ? JSON.parse(s_students) : mockStudents);
    setClasses(s_classes ? JSON.parse(s_classes) : mockClasses);
    setPoints(s_points ? JSON.parse(s_points) : mockPoints);
  }, []);

  const loadRemoteData = useCallback(async () => {
    if (!supabase) return;
    try {
      const [resPoints, resStudents, resClasses] = await Promise.all([
        supabase.from('points').select('*').order('timestamp', { ascending: false }),
        supabase.from('students').select('*'),
        supabase.from('classes').select('*')
      ]);

      if (resPoints.data) setPoints(resPoints.data);
      if (resStudents.data) setStudents(resStudents.data);
      if (resClasses.data) setClasses(resClasses.data);

      setIsOnline(true);
    } catch (e) {
      console.error('Remote sync failed', e);
      toast.error('Sync failed, falling back to local');
      setIsOnline(false);
      loadLocalData();
    }
  }, [supabase, loadLocalData]);

  useEffect(() => {
    if (supabase) {
      loadRemoteData();

      const pointsSub = supabase.channel('public:points')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'points' }, payload => {
          // Check if point ID already exists before adding
          setPoints(prev => {
            const exists = prev.some(p => p.id === payload.new.id);
            if (exists) return prev;
            return [payload.new as PointRecord, ...prev];
          });
        })
        .subscribe();

      const metaSub = supabase.channel('public:meta')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => {
          supabase.from('students').select('*').then(res => {
            if (res.data) setStudents(res.data);
          });
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'classes' }, () => {
          supabase.from('classes').select('*').then(res => {
            if (res.data) setClasses(res.data);
          });
        })
        .subscribe();

      return () => {
        supabase.removeChannel(pointsSub);
        supabase.removeChannel(metaSub);
      };

    } else {
      loadLocalData();
      setIsOnline(false);
    }
  }, [supabase, loadRemoteData, loadLocalData]);

  useEffect(() => {
    localStorage.setItem('smd_points', JSON.stringify(points));
    localStorage.setItem('smd_students', JSON.stringify(students));
    localStorage.setItem('smd_classes', JSON.stringify(classes));
  }, [points, students, classes]);

  const login = (pin: string) => {
    const teacher = teachers.find(t => t.pin === pin);
    if (teacher) {
      setCurrentUser(teacher);
      return true;
    }
    return false;
  };

  const logout = () => setCurrentUser(null);

  const addPoint = async (studentId: string, amount: number, reason: string, type: PointRecord['type']) => {
    const newPoint: PointRecord = {
      id: nanoid(),
      studentId,
      amount,
      reason,
      timestamp: Date.now(),
      type
    };

    if (isOnline && supabase) {
      // Optimistic update
      setPoints(prev => [newPoint, ...prev]);

      const { error } = await supabase.from('points').insert(newPoint);
      if (error) {
        toast.error('Failed to save point to cloud');
        console.error(error);
        // Rollback if needed, but for simplicity we keep it or reload
        // ideally we should remove it from state if failed
        setPoints(prev => prev.filter(p => p.id !== newPoint.id));
      }
    } else {
      setPoints(prev => [newPoint, ...prev]);
    }
  };

  const redeemPoints = async (studentId: string, amount: number, item: string) => {
    const cost = Math.abs(amount) * -1;

    const stats = getStudentStats(studentId);
    if (stats.currentBalance < Math.abs(amount)) {
      toast.warning('Warning: Student balance will be negative');
    }

    await addPoint(studentId, cost, `Redeemed: ${item}`, 'redemption');
  };

  const resetPoints = async (studentId: string) => {
    const stats = getStudentStats(studentId);
    if (stats.currentBalance === 0) return;

    const adjustment = stats.currentBalance * -1;
    await addPoint(studentId, adjustment, '一键清零 (Balance Reset)', 'adjustment');
    toast.success('积分已清零');
  };

  const importData = async (data: any): Promise<boolean> => {
    try {
      if (!Array.isArray(data.students) || !Array.isArray(data.classes) || !Array.isArray(data.points)) {
        throw new Error('Invalid data format');
      }

      setStudents(data.students);
      setClasses(data.classes);
      setPoints(data.points);

      // If online, we might want to sync, but for now let's just update local state
      // and let the user decide if they want to push this to cloud (by re-connecting or logic below)
      if (isOnline && supabase) {
        toast.loading('Syncing imported data to cloud...');
        // Danger zone: this is a full overwrite usually, but Supabase simple insert might conflict.
        // For a simple app, we might just warn this is local only unless they clear cloud first.
        // Let's stick to local state update first, usually import is for recovery.
        toast.dismiss();
        toast.warning('Imported data is local. Cloud sync might need a refresh.');
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };


  const addClass = async (name: string) => {
    const newClass: ClassGroup = { id: nanoid(), name };
    if (isOnline && supabase) {
      setClasses(prev => [...prev, newClass]);
      const { error } = await supabase.from('classes').insert(newClass);
      if (error) {
        toast.error('Failed to add class');
        setClasses(prev => prev.filter(c => c.id !== newClass.id));
      } else {
        toast.success('Class added!');
      }
    } else {
      setClasses(prev => [...prev, newClass]);
      toast.success('Class added locally');
    }
  };

  const updateClass = async (id: string, name: string) => {
    if (isOnline && supabase) {
      setClasses(prev => prev.map(c => c.id === id ? { ...c, name } : c));
      const { error } = await supabase.from('classes').update({ name }).eq('id', id);
      if (error) {
        toast.error('Failed to update class');
        loadRemoteData();
      } else {
        toast.success('Class updated!');
      }
    } else {
      setClasses(prev => prev.map(c => c.id === id ? { ...c, name } : c));
      toast.success('Class updated locally');
    }
  };

  const addStudent = async (name: string, classId: string, avatar?: string) => {
    const newStudent: Student = {
      id: nanoid(),
      name,
      classId,
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
    };
    if (isOnline && supabase) {
      setStudents(prev => [...prev, newStudent]);
      const { error } = await supabase.from('students').insert(newStudent);
      if (error) {
        toast.error('Failed to add student');
        setStudents(prev => prev.filter(s => s.id !== newStudent.id));
      } else {
        toast.success('Student added!');
      }
    } else {
      setStudents(prev => [...prev, newStudent]);
      toast.success('Student added locally');
    }
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    if (isOnline && supabase) {
      setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
      // Rename 'classId' to 'classId' (no change needed if column matches)
      // But ensure we only send valid columns. For now assumpt Partil<Student> maps 1:1
      const { error } = await supabase.from('students').update(updates).eq('id', id);
      if (error) {
        toast.error('Failed to update student');
        loadRemoteData();
      } else {
        toast.success('Student updated!');
      }
    } else {
      setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
      toast.success('Student updated locally');
    }
  };

  const deleteClass = async (id: string) => {
    if (isOnline && supabase) {
      setClasses(prev => prev.filter(c => c.id !== id));
      const { error } = await supabase.from('classes').delete().eq('id', id);
      if (error) {
        toast.error('Failed to delete class');
        loadRemoteData(); // Reload to restore
      } else {
        toast.success('Class deleted!');
      }
    } else {
      setClasses(prev => prev.filter(c => c.id !== id));
      toast.success('Class deleted locally');
    }
  };

  const deleteStudent = async (id: string) => {
    // 1. Delete points first to satisfy FK constraints and clean up
    if (isOnline && supabase) {
      // Optimistic update
      setStudents(prev => prev.filter(s => s.id !== id));
      setPoints(prev => prev.filter(p => p.studentId !== id));

      // Delete Points
      const { error: pointsError } = await supabase.from('points').delete().eq('studentId', id);
      if (pointsError) {
        console.error('Failed to delete points', pointsError);
        toast.error(`删除积分记录失败: ${pointsError.message}`);
        loadRemoteData(); // Revert optimistic update
        return;
      }

      // Delete Attendance (just in case the table exists, even if feature is hidden)
      // We accept error here in case table doesn't exist, but if it exists and fails, we should know.
      // However, to be safe, we just try it.
      const { error: attendanceError } = await supabase.from('attendance').delete().eq('studentId', id);
      if (attendanceError) {
        // Some users might not have attendance table if they didn't run full sql
        // So we only log this, unless it's a constraint violation later.
        console.warn('Attendance delete result:', attendanceError);
      }

      // Delete Student
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) {
        toast.error(`删除学生失败: ${error.message}`);
        console.error(error);
        loadRemoteData(); // Reload to restore state if failed
      } else {
        toast.success('学生已删除');
      }
    } else {
      setPoints(prev => prev.filter(p => p.studentId !== id));
      setStudents(prev => prev.filter(s => s.id !== id));
      toast.success('Student deleted locally');
    }
  };

  const getStudentStats = (studentId: string): StudentStats => {
    const student = students.find(s => s.id === studentId)!;
    if (!student) return { student: { id: studentId, name: 'Unknown', classId: '0', avatar: '' }, currentBalance: 0, weeklyPoints: 0, monthlyPoints: 0, rank: 0 };

    const studentPoints = points.filter(p => p.studentId === studentId);

    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }).getTime();
    const monthStart = startOfMonth(now).getTime();

    const currentBalance = studentPoints.reduce((sum, p) => sum + p.amount, 0);
    const performancePoints = studentPoints.filter(p => p.amount > 0);

    const weeklyPoints = performancePoints.filter(p => p.timestamp >= weekStart).reduce((sum, p) => sum + p.amount, 0);
    const monthlyPoints = performancePoints.filter(p => p.timestamp >= monthStart).reduce((sum, p) => sum + p.amount, 0);

    return {
      student,
      currentBalance,
      weeklyPoints,
      monthlyPoints,
      rank: 0
    };
  };

  const getAllStudentStats = (period: RankingPeriod = 'balance'): StudentStats[] => {
    const stats = students.map(s => getStudentStats(s.id));

    return stats.sort((a, b) => {
      if (period === 'week') return b.weeklyPoints - a.weeklyPoints;
      if (period === 'month') return b.monthlyPoints - a.monthlyPoints;
      return b.currentBalance - a.currentBalance;
    }).map((s, i) => ({ ...s, rank: i + 1 }));
  };

  return (
    <DataContext.Provider value={{
      students, classes, points, teachers, currentUser, isOnline,
      login, logout, addPoint, redeemPoints, resetPoints, importData, addClass, updateClass, addStudent, updateStudent, deleteClass, deleteStudent, getStudentStats, getAllStudentStats, refreshData: loadRemoteData
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
