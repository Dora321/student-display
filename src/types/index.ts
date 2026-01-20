export interface Student {
  id: string;
  name: string;
  classId: string;
  avatar?: string;
}

export interface ClassGroup {
  id: string;
  name: string;
}

export interface PointRecord {
  id: string;
  studentId: string;
  amount: number;
  reason: string;
  timestamp: number;
  type: 'achievement' | 'behavior' | 'participation' | 'redemption';
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'late';
}

export interface Teacher {
  id: string;
  name: string;
  pin: string; // Simple auth
}

// Derived stats for display
export interface StudentStats {
  student: Student;
  currentBalance: number; // New: Points available to spend
  weeklyPoints: number; // Performance metric (ignore redemptions)
  monthlyPoints: number; // Performance metric (ignore redemptions)
  attendanceRate: number; // 0-100
  rank: number;
}
