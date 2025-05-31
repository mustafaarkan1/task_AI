import { useEffect, useState } from 'react';
import { authAPI, tasksAPI } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskForm } from '@/components/tasks/TaskForm';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ThemeProvider } from '@/hooks/use-theme';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(authAPI.isAuthenticated());
  const [isRegistering, setIsRegistering] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Load user data and tasks on authentication
  useEffect(() => {
    if (isAuthenticated) {
      const user = authAPI.getCurrentUser();
      if (user) {
        setUsername(user.username);
      }
      
      fetchTasks();
    }
  }, [isAuthenticated]);

  const fetchTasks = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const tasksData = await tasksAPI.getAllTasks();
      setTasks(tasksData);
    } catch (err) {
      setError('فشل في تحميل المهام. يرجى المحاولة مرة أخرى.');
      console.error('Error fetching tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Authentication handlers
  const handleLogin = async (email, password) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await authAPI.login(email, password);
      setUsername(response.user.username);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err.message || 'فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد الخاصة بك.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (username, email, password) => {
    setIsLoading(true);
    setError('');
    
    try {
      await authAPI.register(username, email, password);
      // After registration, log in automatically
      await authAPI.login(email, password);
      setUsername(username);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err.message || 'فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    setIsAuthenticated(false);
    setTasks([]);
    setUsername('');
  };

  // Task management handlers
  const handleAddTask = () => {
    setEditingTask(null);
    setIsAddingTask(true);
  };

  const handleEditTask = (id) => {
    const taskToEdit = tasks.find(task => task.id === parseInt(id));
    if (taskToEdit) {
      // Convert ISO date string to Date object if exists
      if (taskToEdit.due_date) {
        taskToEdit.dueDate = new Date(taskToEdit.due_date);
      }
      setEditingTask(taskToEdit);
      setIsAddingTask(true);
    }
  };

  const handleDeleteTask = async (id) => {
    setIsLoading(true);
    setError('');
    
    try {
      await tasksAPI.deleteTask(id);
      setTasks(tasks.filter(task => task.id !== parseInt(id)));
    } catch (err) {
      setError('فشل في حذف المهمة. يرجى المحاولة مرة أخرى.');
      console.error('Delete task error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleComplete = async (id, isCompleted) => {
    setIsLoading(true);
    setError('');
    
    try {
      const taskToUpdate = tasks.find(task => task.id === parseInt(id));
      if (taskToUpdate) {
        const updatedTask = await tasksAPI.updateTask(id, {
          is_completed: isCompleted
        });
        
        setTasks(tasks.map(task => 
          task.id === parseInt(id) ? { ...task, is_completed: isCompleted } : task
        ));
      }
    } catch (err) {
      setError('فشل في تحديث حالة المهمة. يرجى المحاولة مرة أخرى.');
      console.error('Update task error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskSubmit = async (taskData) => {
    setIsLoading(true);
    setError('');
    
    try {
      // Format data for API
      const apiTaskData = {
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        category: taskData.category,
        due_date: taskData.dueDate ? taskData.dueDate.toISOString() : null
      };
      
      if (taskData.id) {
        // Update existing task
        const updatedTask = await tasksAPI.updateTask(taskData.id, apiTaskData);
        setTasks(tasks.map(task => 
          task.id === parseInt(taskData.id) ? updatedTask : task
        ));
      } else {
        // Add new task
        const newTask = await tasksAPI.createTask(apiTaskData);
        setTasks([...tasks, newTask]);
      }
      setIsAddingTask(false);
      setEditingTask(null);
    } catch (err) {
      setError(err.message || 'فشل في حفظ المهمة. يرجى المحاولة مرة أخرى.');
      console.error('Save task error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelTaskForm = () => {
    setIsAddingTask(false);
    setEditingTask(null);
  };

  // Render authentication forms if not authenticated
  if (!isAuthenticated) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-background flex flex-col">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-8">
            <div className="max-w-md mx-auto">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {isRegistering ? (
                <>
                  <RegisterForm onRegister={handleRegister} />
                  <p className="text-center mt-4">
                    <button 
                      onClick={() => setIsRegistering(false)}
                      className="text-primary hover:underline"
                      disabled={isLoading}
                    >
                      العودة إلى تسجيل الدخول
                    </button>
                  </p>
                </>
              ) : (
                <>
                  <LoginForm onLogin={handleLogin} />
                  <p className="text-center mt-4">
                    <button 
                      onClick={() => setIsRegistering(true)}
                      className="text-primary hover:underline"
                      disabled={isLoading}
                    >
                      إنشاء حساب جديد
                    </button>
                  </p>
                </>
              )}
            </div>
          </main>
        </div>
      </ThemeProvider>
    );
  }

  // Render main application when authenticated
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <Header username={username} onLogout={handleLogout} />
        <main className="flex-1 container mx-auto px-4 py-8">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {isLoading && (
            <div className="text-center py-4">
              <p>جاري التحميل...</p>
            </div>
          )}
          
          {isAddingTask ? (
            <TaskForm 
              task={editingTask} 
              onSubmit={handleTaskSubmit} 
              onCancel={handleCancelTaskForm} 
            />
          ) : (
            <TaskList 
              tasks={tasks.map(task => ({
                id: task.id.toString(),
                title: task.title,
                description: task.description || '',
                priority: task.priority,
                category: task.category,
                dueDate: task.due_date ? new Date(task.due_date) : undefined,
                isCompleted: task.is_completed
              }))}
              onAddTask={handleAddTask}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onToggleComplete={handleToggleComplete}
            />
          )}
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
