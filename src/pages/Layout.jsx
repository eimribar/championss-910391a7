

import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Settings, LogOut, LayoutGrid, UserCircle, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "@/api/entities";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogoWithText } from "@/components/ui/logo";

export default function Layout({ children, currentPageName }) {
  // Pages that don't need the full layout navigation
  if (currentPageName === "Landing" || currentPageName === "Onboarding" || currentPageName === "Auth") {
    return <>{children}</>;
  }

  const [user, setUser] = React.useState(null);
  const [isLoadingUser, setIsLoadingUser] = React.useState(true);

  React.useEffect(() => {
    const loadUser = async () => {
      setIsLoadingUser(true);
      try {
        const userData = await User.me();
        setUser(userData);
        // Remove redirects to avoid loops
      } catch (error) {
        // Set a default mock user for development
        setUser({
          full_name: 'Demo User',
          email: 'demo@example.com',
          onboarding_completed: true
        });
      } finally {
        setIsLoadingUser(false);
      }
    };
    loadUser();
  }, [currentPageName]);

  const handleLogout = async () => {
    await User.logout();
    window.location.href = '/';
  };

  const navigationItems = [
  { title: "Dashboard", url: createPageUrl("Dashboard"), icon: LayoutGrid, active: currentPageName === "Dashboard" },
  { title: "Champions", url: createPageUrl("AddChampion"), icon: UserCircle, active: ["AddChampion", "BulkUpload", "ChampionProfile"].includes(currentPageName) },
  { title: "Settings", url: createPageUrl("Settings"), icon: Settings, active: currentPageName === "Settings" }];


  const userFullName = user?.full_name || "User";
  const userInitial = userFullName?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 font-sans relative overflow-hidden">
      <div className="aurora-background"></div>
      <div className="atmospheric-orbs"></div>
      <div className="grainy-overlay"></div>
      <style>{`
        .aurora-background { 
          position: fixed; 
          top: 0; 
          left: 0; 
          width: 100%; 
          height: 100%; 
          z-index: -10; 
          background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f0f23 100%);
          overflow: hidden; 
        }
        .aurora-background::before { 
          content: ''; 
          position: absolute; 
          width: 200%; 
          height: 200%; 
          top: -50%; 
          left: -50%; 
          background-image: 
            radial-gradient(ellipse at 20% 80%, rgba(255, 127, 80, 0.12) 0%, transparent 45%),
            radial-gradient(ellipse at 80% 20%, rgba(72, 187, 120, 0.10) 0%, transparent 50%),
            radial-gradient(ellipse at 40% 40%, rgba(147, 51, 234, 0.06) 0%, transparent 60%);
          filter: blur(140px); 
          animation: floatAurora 30s infinite ease-in-out alternate; 
        }
        .atmospheric-orbs {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -8;
          pointer-events: none;
        }
        .atmospheric-orbs::before {
          content: '';
          position: absolute;
          top: 10%;
          right: 15%;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(255, 127, 80, 0.08) 0%, transparent 70%);
          border-radius: 50%;
          filter: blur(60px);
          animation: pulse 8s infinite ease-in-out;
        }
        .atmospheric-orbs::after {
          content: '';
          position: absolute;
          bottom: 20%;
          left: 10%;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(72, 187, 120, 0.06) 0%, transparent 70%);
          border-radius: 50%;
          filter: blur(50px);
          animation: pulse 12s infinite ease-in-out reverse;
        }
        @keyframes floatAurora { 
          0% { transform: translate(0, 0) rotate(0deg); }
          100% { transform: translate(-20px, -30px) rotate(5deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        .grainy-overlay { 
          position: fixed; 
          top: 0; 
          left: 0; 
          width: 100%; 
          height: 100%; 
          z-index: -5; 
          pointer-events: none; 
          background-image: url('data:image/svg+xml,%3Csvg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)"/%3E%3C/svg%3E'); 
          opacity: 0.03; 
        }
        .atmospheric-card {
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(148, 163, 184, 0.1);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }
        .atmospheric-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.2), transparent);
        }
        .ultra-thin-nav {
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          height: 44px;
        }
        .coral-teal-gradient {
          background: linear-gradient(135deg, #FF7F50 0%, #4FD1C7 100%);
        }
        .coral-teal-gradient-subtle {
          background: linear-gradient(135deg, rgba(255, 127, 80, 0.1) 0%, rgba(79, 209, 199, 0.1) 100%);
        }
      `}</style>
      
      <header className="sticky top-0 z-20 ultra-thin-nav">
        <div className="mx-1 my-3 px-1 py-4 flex items-center justify-between h-full sm:px-8">
          <Link to={createPageUrl("Dashboard")} className="flex items-center">
            <LogoWithText className="h-4" />
          </Link>
          
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-4">
              {navigationItems.map((item) =>
              <Link
                key={item.title}
                to={item.url}
                className={`text-sm px-3 py-1 rounded-md transition-all duration-200 ${
                item.active ?
                "text-white font-medium coral-teal-gradient-subtle backdrop-blur-sm border border-orange-500/30" :
                "text-gray-400 hover:text-white hover:bg-white/5 font-normal"}`
                }>

                  {item.title}
                </Link>
              )}
            </nav>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200">
                <Bell className="w-3 h-3" />
              </Button>
              
              {isLoadingUser ?
              <div className="w-6 h-6 bg-gray-700/50 rounded-full animate-pulse"></div> :
              user ?
              <Avatar className="h-6 w-6 border border-gray-700/50">
                  <AvatarImage src={user.profile_picture_url || undefined} alt={userFullName} />
                  <AvatarFallback className="coral-teal-gradient text-white font-semibold text-xs">
                    {userInitial}
                  </AvatarFallback>
                </Avatar> :

              <div className="w-6 h-6 bg-gray-700/50 rounded-full"></div>
              }
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-6 w-6 text-gray-400 hover:text-white hover:bg-red-500/10 transition-all duration-200"
                title="Logout">

                <LogOut className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8 sm:py-12 px-4 sm:px-8 relative z-0">
        <div className="mx-auto w-full max-w-7xl">
          {children}
        </div>
      </main>
    </div>);

}

