import { Home, BookOpen, Users, MessageSquare, Search, GraduationCap } from "lucide-react";
import { Link, useLocation } from "wouter";
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

const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
    testId: "link-home",
  },
  {
    title: "Browse Colleges",
    url: "/colleges",
    icon: GraduationCap,
    testId: "link-colleges",
  },
  {
    title: "Browse Courses",
    url: "/courses",
    icon: BookOpen,
    testId: "link-courses",
  },
  {
    title: "My Study Circles",
    url: "/my-circles",
    icon: Users,
    testId: "link-my-circles",
  },
  {
    title: "Search",
    url: "/search",
    icon: Search,
    testId: "link-search",
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>The Hub</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={item.testId}>
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
