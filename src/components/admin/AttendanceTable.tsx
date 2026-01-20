import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, X, Clock } from 'lucide-react';
import { format } from 'date-fns';

export function AttendanceTable() {
  const { classes, students, attendance, markAttendance } = useData();
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const filteredStudents = students.filter(s => s.classId === selectedClassId);

  const getStatus = (studentId: string) => {
    return attendance.find(a => a.studentId === studentId && a.date === today)?.status;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6 md:p-8 bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between">
         <div className="w-64 space-y-2">
            <Label className="text-slate-700">Select Class for Attendance</Label>
            <Select onValueChange={setSelectedClassId} value={selectedClassId}>
              <SelectTrigger className="bg-slate-50 border-slate-200">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                {classes.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
         </div>
         <div className="text-xl font-mono text-brand-slate font-bold bg-slate-100 px-4 py-2 rounded-lg">
           {today}
         </div>
      </div>

      {selectedClassId ? (
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow className="border-slate-200 hover:bg-slate-50">
                <TableHead className="text-slate-600 font-bold">Student</TableHead>
                <TableHead className="text-right text-slate-600 font-bold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map(student => {
                  const status = getStatus(student.id);
                  return (
                    <TableRow key={student.id} className="border-slate-100 hover:bg-slate-50 transition-colors">
                      <TableCell className="font-medium text-slate-900">{student.name}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant={status === 'present' ? 'default' : 'outline'}
                            className={`w-9 h-9 p-0 rounded-full ${status === 'present' ? 'bg-green-600 hover:bg-green-700 text-white' : 'border-slate-200 text-slate-400 hover:text-green-600 hover:border-green-200'}`}
                            onClick={() => markAttendance(student.id, 'present')}
                            title="Present"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant={status === 'late' ? 'default' : 'outline'}
                            className={`w-9 h-9 p-0 rounded-full ${status === 'late' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'border-slate-200 text-slate-400 hover:text-yellow-500 hover:border-yellow-200'}`}
                            onClick={() => markAttendance(student.id, 'late')}
                            title="Late"
                          >
                            <Clock className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant={status === 'absent' ? 'default' : 'outline'}
                            className={`w-9 h-9 p-0 rounded-full ${status === 'absent' ? 'bg-red-500 hover:bg-red-600 text-white' : 'border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200'}`}
                            onClick={() => markAttendance(student.id, 'absent')}
                            title="Absent"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8 text-slate-500 italic">
                    No students in this class yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-slate-500">
          Please select a class to start marking attendance.
        </div>
      )}
    </div>
  );
}
