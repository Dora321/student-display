-- 1. 首先删除关联的积分和考勤记录（因为有外键约束）
DELETE FROM public.points 
WHERE "studentId" IN (
    SELECT id FROM public.students 
    WHERE name IN ('陈浩轩', '李梓涵', '张俊杰', '王欣怡')
);

DELETE FROM public.attendance 
WHERE "studentId" IN (
    SELECT id FROM public.students 
    WHERE name IN ('陈浩轩', '李梓涵', '张俊杰', '王欣怡')
);

-- 2. 删除学生
DELETE FROM public.students 
WHERE name IN ('陈浩轩', '李梓涵', '张俊杰', '王欣怡');

-- 3. (可选) 删除对应的班级 "机器人一班" 和 "编程高阶班"
-- 注意：这会删除班级内的所有剩余学生（如果有的话）
DELETE FROM public.points 
WHERE "studentId" IN (
    SELECT id FROM public.students 
    WHERE "classId" IN (SELECT id FROM public.classes WHERE name IN ('机器人一班', '编程高阶班'))
);

DELETE FROM public.attendance 
WHERE "studentId" IN (
    SELECT id FROM public.students 
    WHERE "classId" IN (SELECT id FROM public.classes WHERE name IN ('机器人一班', '编程高阶班'))
);

DELETE FROM public.students 
WHERE "classId" IN (
    SELECT id FROM public.classes WHERE name IN ('机器人一班', '编程高阶班')
);

DELETE FROM public.classes 
WHERE name IN ('机器人一班', '编程高阶班');
