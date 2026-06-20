import { Shield, LayoutDashboard, Radio, History, ListChecks, Settings, Mail, Fingerprint, Map } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import {
  Sidebar as SidebarUI,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Live Monitor', url: '/monitor', icon: Radio },
  { title: 'Email Scanner', url: '/email-scanner', icon: Mail },
  { title: 'Threat Map', url: '/threat-map', icon: Map },
  { title: 'Fingerprint', url: '/fingerprint', icon: Fingerprint },
  { title: 'Scan History', url: '/history', icon: History },
  { title: 'Black/Whitelist', url: '/lists', icon: ListChecks },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  return (
    <SidebarUI>
      <SidebarHeader className="p-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Shield className="w-7 h-7 text-primary" />
            <div className="absolute inset-0 blur-sm opacity-50">
              <Shield className="w-7 h-7 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-sm font-bold font-mono tracking-tight text-foreground">
              PhishShield <span className="text-primary neon-text">AI</span>
            </h1>
            <p className="text-[9px] font-mono text-muted-foreground tracking-widest">v2.0 · MULTI-PAGE</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/'}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-mono text-xs text-muted-foreground transition-all hover:text-foreground hover:bg-muted/40"
                      activeClassName="!text-primary !bg-primary/10 neon-border"
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-border">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-safe animate-pulse" />
          <span className="font-mono text-[9px] text-safe">v3.0 · ADVANCED</span>
        </div>
      </SidebarFooter>
    </SidebarUI>
  );
}
