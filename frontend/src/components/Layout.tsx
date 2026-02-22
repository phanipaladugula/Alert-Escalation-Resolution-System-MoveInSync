import { NavLink, Outlet } from 'react-router-dom';
import { BellRing, PlusCircle, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Layout = () => {
    const { logout } = useAuth();

    return (
        <div className="flex h-screen w-full flex-col md:flex-row bg-slate-900 overflow-hidden">
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-64 bg-slate-800 border-r border-slate-700 md:h-full flex flex-col transition-all shrink-0">
                <div className="p-6 flex items-center space-x-3 border-b border-slate-700">
                    <div className="bg-indigo-500 p-2 rounded-lg flex items-center justify-center">
                        <BellRing className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white tracking-tight leading-none">AlertMonitor</h1>
                        <p className="text-xs text-slate-500 leading-none mt-1">MoveInSync Ops</p>
                    </div>
                </div>

                <nav className="p-4 space-y-1 flex-1">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm ${isActive
                                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25'
                                : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                            }`
                        }
                        end
                    >
                        <LayoutDashboard className="w-5 h-5 shrink-0" />
                        <span>Dashboard</span>
                    </NavLink>

                    <NavLink
                        to="/create"
                        className={({ isActive }) =>
                            `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm ${isActive
                                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25'
                                : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                            }`
                        }
                    >
                        <PlusCircle className="w-5 h-5 shrink-0" />
                        <span>Ingest Alert</span>
                    </NavLink>

                    <NavLink
                        to="/config"
                        className={({ isActive }) =>
                            `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm ${isActive
                                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25'
                                : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                            }`
                        }
                    >
                        <Settings className="w-5 h-5 shrink-0" />
                        <span>Rule Config</span>
                    </NavLink>
                </nav>

                {/* Sign Out */}
                <div className="p-4 border-t border-slate-700">
                    <button
                        onClick={logout}
                        className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors font-medium text-sm"
                    >
                        <LogOut className="w-4 h-4 shrink-0" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-full overflow-y-auto w-full">
                <div className="max-w-7xl mx-auto p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
