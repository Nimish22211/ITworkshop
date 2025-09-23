import { Link, useLocation } from 'react-router-dom'
import { Home, ListTodo, Shield, Settings, Users, Truck, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Dashboard', roles: ['citizen', 'admin', 'official', 'serviceman'] },
  { path: '/admin/dashboard', icon: Users, label: 'Admin', roles: ['admin'] },
  { path: '/official/dashboard', icon: Briefcase, label: 'Official', roles: ['official', 'admin'] },
  { path: '/serviceman/dashboard', icon: Truck, label: 'Service Man', roles: ['serviceman', 'admin', 'official'] },
  { path: '/report', icon: ListTodo, label: 'Report Issue', roles: ['citizen'] },
  { path: '/security', icon: Shield, label: 'Security', roles: ['admin'] },
  { path: '/settings', icon: Settings, label: 'Settings', roles: ['citizen', 'admin', 'official', 'serviceman'] },
]

const Sidebar = () => {
    const location = useLocation()
    const { user } = useAuth()
    const userRole = user?.role
  
    const filteredNavItems = navItems.filter(item => {
      if (!item.roles) return true // If no roles specified, accessible to all
      return userRole && item.roles.includes(userRole)
    })
  
    return (
      <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-md h-screen flex flex-col p-4 fixed left-0 top-0 z-40">
        <div className="text-2xl font-bold text-primary mb-8">NEXUS OS</div>
        <nav className="flex-1">
          <ul className="space-y-2">
            {filteredNavItems.map((item) => (
                <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center p-3 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
                    location.pathname === item.path && "bg-sidebar-primary text-sidebar-primary-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto pt-4 border-t border-sidebar-border text-sm text-muted-foreground">
          <p className="font-medium">System Status</p>
          <div className="mt-2 space-y-2">
            <div>
            <div className="flex justify-between items-center">Core Systems <span className="text-primary-foreground">87%</span></div>
            <div className="w-full bg-sidebar-accent rounded-full h-2 mt-1">
              <div className="bg-primary h-2 rounded-full" style={{ width: '87%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center">Security <span className="text-primary-foreground">75%</span></div>
            <div className="w-full bg-sidebar-accent rounded-full h-2 mt-1">
              <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}