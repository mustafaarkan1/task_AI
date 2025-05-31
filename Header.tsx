import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon, LogOut } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

interface HeaderProps {
  username?: string;
  onLogout?: () => void;
}

export function Header({ username, onLogout }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  
  return (
    <header className="bg-background border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">إدارة المهام</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="تبديل السمة"
          >
            {theme === 'dark' ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </Button>
          
          {username && (
            <>
              <span className="text-sm hidden md:inline">مرحباً، {username}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="flex items-center gap-1"
              >
                <LogOut className="h-4 w-4" />
                <span>تسجيل الخروج</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
