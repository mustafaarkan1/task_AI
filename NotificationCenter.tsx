import { useState, useEffect } from 'react';
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  task_title: string;
  task_id: number;
}

interface NotificationProps {
  fetchNotifications: () => Promise<Notification[]>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  checkDueTasks: () => Promise<void>;
}

export function NotificationCenter({
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  checkDueTasks
}: NotificationProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.is_read).length;
  
  // Fetch notifications when popover opens
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      loadNotifications();
    }
  };
  
  // Load notifications
  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle marking a notification as read
  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  // Handle marking all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  // Handle deleting a notification
  const handleDelete = async (id: number) => {
    try {
      await deleteNotification(id);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };
  
  // Check for due tasks periodically
  useEffect(() => {
    const checkForDueTasks = async () => {
      try {
        await checkDueTasks();
        // Refresh notifications if popover is open
        if (isOpen) {
          loadNotifications();
        }
      } catch (error) {
        console.error('Error checking due tasks:', error);
      }
    };
    
    // Check immediately on mount
    checkForDueTasks();
    
    // Set up interval to check every 5 minutes
    const interval = setInterval(checkForDueTasks, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [isOpen]);
  
  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-lg">الإشعارات</CardTitle>
            {notifications.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleMarkAllAsRead}
                className="h-8 text-xs"
                disabled={!notifications.some(n => !n.is_read)}
              >
                <Check className="h-3 w-3 mr-1" />
                تعيين الكل كمقروء
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-6 text-center text-muted-foreground">
                جاري التحميل...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">
                لا توجد إشعارات
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-4 ${notification.is_read ? 'bg-background' : 'bg-muted/30'}`}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{notification.title}</h4>
                        <div className="flex gap-1">
                          {!notification.is_read && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Check className="h-3 w-3" />
                              <span className="sr-only">تعيين كمقروء</span>
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(notification.id)}
                            className="h-6 w-6 p-0 text-destructive"
                          >
                            <span className="sr-only">حذف</span>
                            &times;
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleString('ar-SA')}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}

export default NotificationCenter;
