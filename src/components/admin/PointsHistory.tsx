import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Search, Filter, X } from 'lucide-react';

export function PointsHistory() {
  const { points, students, classes } = useData();
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filter Logic
  const filteredRecords = points.filter(record => {
    // 1. Filter by Class/Student
    if (selectedStudentId !== 'all') {
      if (record.studentId !== selectedStudentId) return false;
    } else if (selectedClassId !== 'all') {
      const student = students.find(s => s.id === record.studentId);
      if (student?.classId !== selectedClassId) return false;
    }

    // 2. Filter by Date
    if (startDate) {
      const recordDate = new Date(record.timestamp).setHours(0, 0, 0, 0);
      const start = new Date(startDate).setHours(0, 0, 0, 0);
      if (recordDate < start) return false;
    }
    if (endDate) {
      const recordDate = new Date(record.timestamp).setHours(0, 0, 0, 0);
      const end = new Date(endDate).setHours(0, 0, 0, 0);
      if (recordDate > end) return false;
    }

    return true;
  });

  // Map students for dropdown
  const availableStudents = selectedClassId === 'all'
    ? students
    : students.filter(s => s.classId === selectedClassId);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'achievement': return '成就';
      case 'behavior': return '表现';
      case 'participation': return '参与';
      case 'redemption': return '兑换';
      case 'adjustment': return '调整/清零';
      default: return type;
    }
  };

  const clearFilters = () => {
    setSelectedClassId('all');
    setSelectedStudentId('all');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Filters Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Filter className="w-4 h-4 text-brand-blue" />
            筛选记录
          </h3>
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-500 hover:text-red-500">
            <X className="w-4 h-4 mr-1" /> 清空筛选
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>班级</Label>
            <Select value={selectedClassId} onValueChange={(val) => { setSelectedClassId(val); setSelectedStudentId('all'); }}>
              <SelectTrigger className="bg-slate-50 border-slate-200">
                <SelectValue placeholder="所有班级" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有班级</SelectItem>
                {classes.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>学生</Label>
            <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
              <SelectTrigger className="bg-slate-50 border-slate-200">
                <SelectValue placeholder="所有学生" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有学生</SelectItem>
                {availableStudents.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>开始日期</Label>
            <Input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="bg-slate-50 border-slate-200 block"
            />
          </div>

          <div className="space-y-2">
            <Label>结束日期</Label>
            <Input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="bg-slate-50 border-slate-200 block"
            />
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <span className="text-sm font-bold text-slate-700">历史记录</span>
          <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full font-mono">
            {filteredRecords.length} 条记录
          </span>
        </div>

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <TableRow>
                <TableHead className="w-[180px]">时间</TableHead>
                <TableHead>学生</TableHead>
                <TableHead>班级</TableHead>
                <TableHead>类型</TableHead>
                <TableHead className="w-[300px]">原因/备注</TableHead>
                <TableHead className="text-right">分值</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map(record => {
                  const student = students.find(s => s.id === record.studentId);
                  const cls = classes.find(c => c.id === student?.classId);
                  const isPositive = record.amount > 0;

                  return (
                    <TableRow key={record.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="font-mono text-xs text-slate-500">
                        {format(record.timestamp, 'yyyy-MM-dd HH:mm')}
                      </TableCell>
                      <TableCell className="font-bold text-slate-700">
                        {student?.name || '未知'}
                      </TableCell>
                      <TableCell className="text-slate-500 text-xs">
                        {cls?.name || '-'}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${record.type === 'redemption' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-brand-blue'
                          }`}>
                          {getTypeLabel(record.type)}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-600 truncate max-w-[300px]" title={record.reason}>
                        {record.reason}
                      </TableCell>
                      <TableCell className={`text-right font-mono font-bold ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
                        {isPositive ? '+' : ''}{record.amount}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-400 italic">
                    暂无符合条件的记录
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
