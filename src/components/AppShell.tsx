import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  FileText,
  Brain,
  Pill,
  Bell,
  User,
  LogOut,
  Menu,
  Activity,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";

interface AppShellProps {
  children: ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "AI Analysis", href: "/analysis", icon: Brain },
  { name: "Medicine", href: "/medicine", icon: Pill },
  { name: "Reminders", href: "/reminders", icon: Bell },
];

const AppShell = ({ children }: AppShellProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/signin");
  };

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className={cn("flex gap-1", mobile ? "flex-col" : "flex-col lg:flex-row lg:items-center")}>
      {navigation.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground"
            )}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-sidebar/95 backdrop-blur supports-[backdrop-filter]:bg-sidebar/75">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <div className="flex flex-col gap-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-lg font-semibold">MediSync</span>
                </div>
                <NavLinks mobile />
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop logo & nav */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <span className="text-lg font-semibold hidden sm:inline">MediSync</span>
            </div>
            <div className="hidden lg:block">
              <NavLinks />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" alt={user?.email || "User"} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.email?.substring(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">My Account</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-error">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-6 px-4">
        {children}
      </main>
    </div>
  );
};

export default AppShell;
