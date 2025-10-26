import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Building2,
  CreditCard,
  LineChart,
  Briefcase,
} from "lucide-react";
import { Link, useLocation } from "wouter";

const personalMenuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Income", url: "/income", icon: TrendingUp },
  { title: "Expenses", url: "/expenses", icon: TrendingDown },
  { title: "Assets", url: "/assets", icon: Building2 },
  { title: "Liabilities", url: "/liabilities", icon: CreditCard },
  { title: "Investments", url: "/investments", icon: LineChart },
];

const businessMenuItems = [
  { title: "Car Rental Business", url: "/business", icon: Briefcase },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Personal Finance</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {personalMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase()}`}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Business</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {businessMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase()}`}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
