import type { Student, ClassGroup, PointRecord, Teacher } from '../types';
import { nanoid } from 'nanoid';

// Generators
const FIRST_NAMES = ['浩轩', '梓涵', '俊杰', '欣怡', '宇航', '诗涵', '子轩', '雨桐', '博文', '梦洁', '子墨', '一诺'];
const LAST_NAMES = ['李', '王', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴'];

const CLASSES = ['机器人一班', '编程高阶班', 'AI启蒙班', '创客实验班'];

export const mockClasses: ClassGroup[] = CLASSES.map(name => ({
  id: nanoid(),
  name
}));

export const mockTeachers: Teacher[] = [
  { id: 't1', name: 'Admin', pin: '1234' },
  { id: 't2', name: '李老师', pin: '0000' }
];

// Generate 30 students
export const mockStudents: Student[] = Array.from({ length: 30 }).map((_, i) => ({
  id: `s${i + 1}`,
  name: `${LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]}${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]}`,
  classId: mockClasses[Math.floor(Math.random() * mockClasses.length)].id,
  avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${i}`
}));

// Generate Points (Last 3 months)
export const mockPoints: PointRecord[] = [];
const REASONS = ['完成复杂算法', '课堂积极发言', '帮助同学', '全勤奖励', '项目展示优秀', '代码零Bug'];
const TYPES = ['achievement', 'participation', 'behavior'] as const;

mockStudents.forEach(student => {
  const numRecords = 5 + Math.floor(Math.random() * 20);
  for (let i = 0; i < numRecords; i++) {
    mockPoints.push({
      id: nanoid(),
      studentId: student.id,
      amount: 10 + Math.floor(Math.random() * 50),
      reason: REASONS[Math.floor(Math.random() * REASONS.length)],
      timestamp: Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000), // Last 90 days
      type: TYPES[Math.floor(Math.random() * TYPES.length)]
    });
  }
});
