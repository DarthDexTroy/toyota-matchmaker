import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Heart, X, Search, Menu } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { AIAssistant } from "./AIAssistant";

interface AppHeaderProps {
  onSettingsClick?: () => void;
  onSearch?: (query: string) => void;
}

export const AppHeader = ({ onSettingsClick, onSearch }: AppHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch?.(e.target.value);
  };

  return (
    <header className="border-b border-border bg-[hsl(var(--background))] shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Logo */}
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent p-2">
              <span className="text-xs font-black text-primary-foreground">T</span>
            </div>
            <div className="hidden sm:block">
              <div className="text-lg font-black text-foreground leading-none">MatchMyToyota</div>
              <div className="text-[10px] text-muted-foreground leading-none mt-0.5">Powered by AI</div>
            </div>
          </button>

          {/* Center: Search bar */}
          <div className="flex-1 max-w-2xl mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search vehicles or ask AI anything..."
                className="pl-10 pr-4 bg-muted/50 border-border/50 focus-visible:ring-primary"
                onChange={handleSearchChange}
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {location.pathname === "/" && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/passes")}
                  className="hidden sm:flex hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/favorites")}
                  className="hidden sm:flex hover:bg-muted"
                >
                  <Heart className="h-5 w-5" />
                </Button>
                {onSettingsClick && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onSettingsClick}
                    className="hidden sm:flex hover:bg-muted"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                )}
              </>
            )}
            <AIAssistant />
          </div>
        </div>
      </div>
    </header>
  );
};
