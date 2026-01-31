import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarTrigger, // මේකත් දාගමු ලේසි වෙන්න
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Calendar,
  TrendingUp,
  TrendingDown,
  Building2,
  CreditCard,
  LineChart,
  Briefcase,
  Globe,
  Settings,
  Receipt,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import salliPulseLogo from "@assets/stock_images/SilliPulse.png";

const personalMenuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Income", url: "/income", icon: TrendingUp },
  { title: "Expenses", url: "/expenses", icon: TrendingDown },
  { title: "Recurring Bills", url: "/recurring-bills", icon: Receipt },
  { title: "Assets", url: "/assets", icon: Building2 },
  { title: "Liabilities", url: "/liabilities", icon: CreditCard },
  { title: "Investments", url: "/investments", icon: LineChart },
];

const businessMenuItems = [
  { title: "Beta Je Rent A Car", url: "/business", icon: Briefcase },
  { title: "DMG FX", url: "/forex", icon: Globe },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Sidebar
      variant="floating"
      collapsible="icon"
      className={cn(
        "border-r transition-all duration-500 shadow-2xl overflow-hidden",
        "bg-slate-900/40 backdrop-blur-xl border-white/5"
      )}
    >
      <SidebarHeader className="py-8">
        <div className="flex items-center gap-4 px-4 overflow-hidden">
          {/* Logo Container */}
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-2xl transition-all duration-500 hover:rotate-6",
              isDark
                ? "bg-white ring-2 ring-purple-500/20 shadow-purple-500/10"
                : "bg-white border border-slate-100",
            )}
          >
            <img
              src={salliPulseLogo}
              alt="SalliPulse Logo"
              className="h-8 w-8 object-contain"
            />
          </div>

          <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden">
            {/* Title - Dan dark mode eke sudu pata wenawa */}
            <span
              className={cn(
                "text-lg font-black tracking-tight transition-colors bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent"
              )}
            >
              SilliPulse
            </span>
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-widest leading-none text-primary"
              )}
            >
              Track.Save.Scale
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 gap-4">
        {/* Personal Wealth Section */}
        <SidebarGroup>
          <SidebarGroupLabel
            className={cn(
              "px-4 mb-2 text-[10px] font-black uppercase tracking-[0.2em] group-data-[collapsible=icon]:hidden",
              isDark ? "text-slate-500" : "text-slate-400",
            )}
          >
            Personal Wealth
          </SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            {personalMenuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={location === item.url}
                  className={cn(
                    "h-11 px-3 rounded-xl transition-all duration-300 group/item relative overflow-hidden",
                    "hover:bg-sidebar-accent hover:text-white text-sidebar-foreground/60",
                    "data-[active=true]:bg-gradient-purple-cyan data-[active=true]:text-white data-[active=true]:shadow-[0_8px_20px_-5px_rgba(139,92,246,0.3)] data-[active=true]:ring-1 data-[active=true]:ring-white/20",
                    "font-bold uppercase tracking-wider text-[11px]",
                  )}
                >
                  <Link href={item.url} className="flex items-center gap-3">
                    <item.icon
                      className={cn(
                        "h-5 w-5 shrink-0 transition-colors",
                        location === item.url
                          ? "text-white"
                          : "text-slate-500 group-hover/item:text-white"
                      )}
                    />
                    <span className="text-sm truncate group-data-[collapsible=icon]:hidden">
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Business Units Section */}
        <SidebarGroup>
          <SidebarGroupLabel
            className={cn(
              "px-4 mb-2 text-[10px] font-black uppercase tracking-[0.2em] group-data-[collapsible=icon]:hidden",
              isDark ? "text-slate-500" : "text-slate-400",
            )}
          >
            Business Units
          </SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            {businessMenuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={location === item.url}
                  className={cn(
                    "h-11 px-3 rounded-xl transition-all duration-300 group/item relative overflow-hidden",
                    "hover:bg-sidebar-accent hover:text-white text-sidebar-foreground/60",
                    "data-[active=true]:bg-gradient-blue-teal data-[active=true]:text-white data-[active=true]:shadow-[0_8px_20px_-5px_rgba(14,165,233,0.3)] data-[active=true]:ring-1 data-[active=true]:ring-white/20",
                    "font-bold uppercase tracking-wider text-[11px]",
                  )}
                >
                  <Link href={item.url} className="flex items-center gap-3">
                    <item.icon
                      className={cn(
                        "h-5 w-5 shrink-0 transition-colors",
                        location === item.url
                          ? "text-white"
                          : "text-slate-500 group-hover/item:text-white"
                      )}
                    />
                    <span className="text-sm truncate group-data-[collapsible=icon]:hidden italic">
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto">
        <SidebarMenu>
          <SidebarMenuItem>
            {/* Settings button eka light/dark widiyata haduwa */}
            <SidebarMenuButton
              className={cn(
                "h-12 w-full rounded-xl transition-all font-bold",
                "bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80 border border-sidebar-border"
              )}
            >
              <Settings
                className={cn(
                  "h-5 w-5 shrink-0",
                  isDark ? "text-slate-400" : "text-slate-600",
                )}
              />
              <span className="text-sm group-data-[collapsible=icon]:hidden">
                Settings
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar >
  );
}
