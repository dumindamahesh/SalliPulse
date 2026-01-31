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
        "border-r transition-all duration-300 shadow-2xl",
        // Background colors for both modes
        isDark ? "bg-[#0B1120] border-white/5" : "bg-white border-slate-200",
      )}
    >
      <SidebarHeader className="py-8">
        <div className="flex items-center gap-4 px-4 overflow-hidden">
          {/* Logo Container */}
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-lg transition-transform",
              isDark
                ? "bg-white ring-2 ring-emerald-500/20"
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
                "text-lg font-bold tracking-tighter transition-colors",
                isDark ? "text-white-800" : "text-white-50",
              )}
            >
              SilliPulse
            </span>
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-widest leading-none",
                isDark ? "text-emerald-400" : "text-emerald-600",
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
                    "h-11 px-3 rounded-xl transition-all duration-200 group/item",
                    // Non-active menu items වල contrast එක මෙතනින් වැඩි කළා
                    isDark
                      ? "hover:bg-white/5 text-slate-300 hover:text-emerald-400"
                      : "hover:bg-emerald-50 text-slate-600 hover:text-emerald-700",
                    // Active state colors
                    "data-[active=true]:bg-emerald-600 data-[active=true]:text-white data-[active=true]:shadow-lg data-[active=true]:shadow-emerald-600/30",
                    "font-semibold",
                  )}
                >
                  <Link href={item.url} className="flex items-center gap-3">
                    <item.icon
                      className={cn(
                        "h-5 w-5 shrink-0 transition-colors",
                        location === item.url
                          ? "text-white"
                          : isDark
                            ? "text-slate-400 group-hover/item:text-emerald-400"
                            : "text-slate-500 group-hover/item:text-emerald-600",
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
                    "h-11 px-3 rounded-xl transition-all duration-200 group/item",
                    isDark
                      ? "hover:bg-white/5 text-slate-300 hover:text-blue-400"
                      : "hover:bg-blue-50 text-slate-600 hover:text-blue-700",
                    "data-[active=true]:bg-blue-600 data-[active=true]:text-white data-[active=true]:shadow-lg data-[active=true]:shadow-blue-600/30",
                    "font-semibold",
                  )}
                >
                  <Link href={item.url} className="flex items-center gap-3">
                    <item.icon
                      className={cn(
                        "h-5 w-5 shrink-0 transition-colors",
                        location === item.url
                          ? "text-white"
                          : isDark
                            ? "text-slate-400 group-hover/item:text-blue-400"
                            : "text-slate-500 group-hover/item:text-blue-600",
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
                isDark
                  ? "bg-slate-900 text-slate-200 hover:bg-slate-800"
                  : "bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200",
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
    </Sidebar>
  );
}
