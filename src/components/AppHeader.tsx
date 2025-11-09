import { Button } from "@/components/ui/button";
import { Settings, Heart, X, MessageSquare } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { AIAssistant } from "./AIAssistant";
import toyotaLogo from "@/assets/toyota-logo.png";

interface AppHeaderProps {
  onSettingsClick?: () => void;
  title?: string;
}

export const AppHeader = ({ onSettingsClick, title }: AppHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="border-b border-border bg-gradient-to-r from-primary via-accent to-primary shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Logo and Title */}
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 sm:gap-3 shrink-0 hover:opacity-90 transition-opacity"
          >
            <div className="h-12 w-12 sm:h-10 sm:w-10 flex items-center justify-center bg-white rounded-lg p-2 sm:p-1.5">
              <img src={toyotaLogo} alt="Toyota" className="h-full w-full object-contain" />
            </div>
            <div className="block">
              <div className="text-lg sm:text-xl font-black text-primary-foreground leading-none tracking-tight">
                {title || "MatchMyToyota"}
              </div>
            </div>
          </button>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {location.pathname === "/" && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/passes")}
                  className="hidden sm:flex text-primary-foreground hover:bg-primary-foreground/20"
                >
                  <X className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/favorites")}
                  className="text-primary-foreground hover:bg-primary-foreground/20"
                >
                  <Heart className="h-5 w-5" />
                </Button>
                {onSettingsClick && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onSettingsClick}
                    className="text-primary-foreground hover:bg-primary-foreground/20"
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
