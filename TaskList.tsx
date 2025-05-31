import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskItem } from "@/components/tasks/TaskItem";
import { Plus, Search, Filter } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  dueDate?: Date;
  isCompleted: boolean;
}

interface TaskListProps {
  tasks: Task[];
  onAddTask: () => void;
  onEditTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onToggleComplete: (id: string, isCompleted: boolean) => void;
}

export function TaskList({ tasks, onAddTask, onEditTask, onDeleteTask, onToggleComplete }: TaskListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  
  // Filter tasks based on search query and filters
  const filteredTasks = tasks.filter(task => {
    // Search filter
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category filter
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
    
    // Priority filter
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'completed' && task.isCompleted) ||
                         (statusFilter === 'active' && !task.isCompleted);
    
    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });
  
  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.getTime() - b.dueDate.getTime();
      case 'priority':
        const priorityValues = { high: 3, medium: 2, low: 1 };
        return priorityValues[b.priority] - priorityValues[a.priority];
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">المهام</h2>
        <Button onClick={onAddTask} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          <span>إضافة مهمة</span>
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="البحث عن مهام..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-9"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[130px]">
              <Filter className="h-4 w-4 ml-2" />
              <span>التصنيف</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="work">عمل</SelectItem>
              <SelectItem value="personal">شخصي</SelectItem>
              <SelectItem value="study">دراسة</SelectItem>
              <SelectItem value="other">أخرى</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[130px]">
              <Filter className="h-4 w-4 ml-2" />
              <span>الأولوية</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="high">عالية</SelectItem>
              <SelectItem value="medium">متوسطة</SelectItem>
              <SelectItem value="low">منخفضة</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <Filter className="h-4 w-4 ml-2" />
              <span>الحالة</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="active">نشطة</SelectItem>
              <SelectItem value="completed">مكتملة</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[130px]">
              <Filter className="h-4 w-4 ml-2" />
              <span>ترتيب حسب</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDate">تاريخ الاستحقاق</SelectItem>
              <SelectItem value="priority">الأولوية</SelectItem>
              <SelectItem value="title">العنوان</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="mt-4">
        {sortedTasks.length > 0 ? (
          sortedTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery || categoryFilter !== 'all' || priorityFilter !== 'all' || statusFilter !== 'all' ? (
              <p>لا توجد مهام تطابق معايير البحث</p>
            ) : (
              <p>لا توجد مهام. أضف مهمة جديدة للبدء!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskList;
