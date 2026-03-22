import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { 
  Building2, 
  Layers, 
  CalendarDays, 
  PieChart, 
  LogOut,
  User as UserIcon,
  Settings,
  Users,
  BarChartHorizontal
} from 'lucide-react';
import clsx from 'clsx';

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Phase Manager', path: '/', icon: Layers, roles: ['SUPER_ADMIN', 'ADMIN', 'SALES', 'OPERATOR'] },
    { name: 'Project Intake', path: '/intake', icon: Building2, roles: ['SUPER_ADMIN', 'ADMIN', 'SALES'] },
    { name: 'Operator Dashboard', path: '/scheduler', icon: CalendarDays, roles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'] },
    { name: 'Finance', path: '/finance', icon: PieChart, roles: ['SUPER_ADMIN', 'ADMIN'] },
    { name: 'Gantt Report', path: '/gantt', icon: BarChartHorizontal, roles: ['SUPER_ADMIN', 'ADMIN'] },
    { name: 'Setup', path: '/setup', icon: Settings, roles: ['SUPER_ADMIN', 'ADMIN'] },
    { name: 'Users', path: '/users', icon: Users, roles: ['SUPER_ADMIN'] },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/5 blur-[120px]" />
         <div className="absolute top-[40%] -right-[10%] w-[30%] h-[30%] rounded-full bg-cyan-600/5 blur-[100px]" />
      </div>

      {/* Sidebar */}
      <aside className="relative z-10 w-64 flex flex-col border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <div className="p-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Shree Swastik
          </h2>
          <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">MMS Portal</p>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-4">
          {navItems.map((item) => {
            if (user && !item.roles.includes(user.role)) return null;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => clsx(
                  "flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 group mb-1",
                  isActive 
                    ? "bg-gradient-to-r from-blue-500/10 to-transparent text-blue-400 border border-blue-500/20 shadow-sm"
                    : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                )}
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={clsx("mr-3 w-5 h-5 flex-shrink-0 transition-colors", isActive ? "text-blue-400" : "group-hover:text-blue-400")} />
                    {item.name}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-800/80">
          <div className="flex items-center px-3 py-3 mb-2 rounded-xl bg-slate-950/50 border border-slate-800 shadow-inner">
            <div className="p-2 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg mr-3 shadow-md">
              <UserIcon className="w-5 h-5 text-slate-300" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-slate-200 truncate">{user?.name}</p>
              <p className="text-[10px] uppercase tracking-wider font-bold text-blue-400/80 truncate">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2.5 text-sm font-semibold text-red-400 rounded-xl hover:bg-red-500/10 hover:text-red-300 border border-transparent hover:border-red-500/20 transition-all group"
          >
             <LogOut className="mr-3 w-5 h-5 transition-transform group-hover:-translate-x-1" />
             Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative z-10 flex-1 overflow-y-auto">
        <div className="container mx-auto p-8 max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
