import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Edit2, Trash2, Calendar, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  dueDate?: Date;
  isCompleted: boolean;
}

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string, isCompleted: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, onToggleComplete, onEdit, onDelete }: TaskItemProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  
  const handleToggleComplete = () => {
    onToggleComplete(task.id, !task.isCompleted);
  };
  
  const handleEdit = () => {
    onEdit(task.id);
  };
  
  const handleDelete = () => {
    if (isConfirmingDelete) {
      onDelete(task.id);
      setIsConfirmingDelete(false);
    } else {
      setIsConfirmingDelete(true);
      // Auto-reset confirmation state after 3 seconds
      setTimeout(() => setIsConfirmingDelete(false), 3000);
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return '';
    }
  };
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'work': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'personal': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'study': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'work': return 'عمل';
      case 'personal': return 'شخصي';
      case 'study': return 'دراسة';
      default: return 'أخرى';
    }
  };
  
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'عالية';
      case 'medium': return 'متوسطة';
      case 'low': return 'منخفضة';
      default: return '';
    }
  };
  
  const isOverdue = task.dueDate && new Date() > task.dueDate && !task.isCompleted;
  
  return (
    <Card className={cn(
      "p-4 mb-3 transition-all",
      task.isCompleted ? "opacity-70" : "",
      isOverdue ? "border-red-300 dark:border-red-800" : ""
    )}>
      <div className="flex items-start gap-3">
        <Checkbox 
          checked={task.isCompleted} 
          onCheckedChange={handleToggleComplete}
          className="mt-1"
        />
        
        <div className="flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className={cn(
              "text-lg font-medium",
              task.isCompleted ? "line-through text-muted-foreground" : ""
            )}>
              {task.title}
            </h3>
            
            <div className="flex flex-wrap gap-2">
              <Badge className={getPriorityColor(task.priority)}>
                {getPriorityLabel(task.priority)}
              </Badge>
              
              <Badge className={getCategoryColor(task.category)}>
                {getCategoryLabel(task.category)}
              </Badge>
            </div>
          </div>
          
          {task.description && (
            <p className={cn(
              "text-sm text-muted-foreground mt-1",
              task.isCompleted ? "line-through" : ""
            )}>
              {task.description}
            </p>
          )}
          
          <div className="flex flex-wrap items-center justify-between mt-3">
            <div className="flex items-center">
              {task.dueDate && (
                <div className={cn(
                  "flex items-center text-xs",
                  isOverdue ? "text-red-500 dark:text-red-400" : "text-muted-foreground"
                )}>
                  {isOverdue && <AlertCircle className="h-3 w-3 mr-1" />}
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{format(task.dueDate, "PPP", { locale: ar })}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleEdit}
                className="h-8 w-8 p-0"
              >
                <Edit2 className="h-4 w-4" />
                <span className="sr-only">تعديل</span>
              </Button>
              
              <Button 
                variant={isConfirmingDelete ? "destructive" : "ghost"} 
                size="sm" 
                onClick={handleDelete}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">حذف</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default TaskItem;
