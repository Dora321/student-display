-- Enable Row Level Security (RLS) but allow public access for this demo app
-- In production, you would want to add Auth policies

-- 1. Create Tables
create table public.classes (
  id text primary key,
  name text not null
);

create table public.students (
  id text primary key,
  name text not null,
  "classId" text not null references public.classes(id),
  avatar text
);

create table public.points (
  id text primary key,
  "studentId" text not null references public.students(id),
  amount integer not null,
  reason text,
  timestamp bigint not null,
  type text not null
);

create table public.attendance (
  id text primary key,
  "studentId" text not null references public.students(id),
  date text not null, -- YYYY-MM-DD
  status text not null -- present, absent, late
);

-- 2. Enable Realtime
alter publication supabase_realtime add table public.points;
alter publication supabase_realtime add table public.attendance;

-- 3. Disable RLS for simple demo usage (since we use anon key)
alter table public.classes disable row level security;
alter table public.students disable row level security;
alter table public.points disable row level security;
alter table public.attendance disable row level security;

-- 4. Initial Seed Data (Optional - run only if you want default data)
insert into public.classes (id, name) values 
('c1', '机器人一班'), ('c2', '编程高阶班'), ('c3', 'AI启蒙班');

insert into public.students (id, name, "classId", avatar) values
('s1', '陈浩轩', 'c1', 'https://api.dicebear.com/7.x/bottts/svg?seed=1'),
('s2', '李梓涵', 'c1', 'https://api.dicebear.com/7.x/bottts/svg?seed=2'),
('s3', '张俊杰', 'c2', 'https://api.dicebear.com/7.x/bottts/svg?seed=3'),
('s4', '王欣怡', 'c2', 'https://api.dicebear.com/7.x/bottts/svg?seed=4'),
('s5', '刘宇航', 'c3', 'https://api.dicebear.com/7.x/bottts/svg?seed=5');
