import { Link, useLocation } from 'react-router-dom'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { useAuth } from '../../context/AuthContext'
import { LogOut, Shield, User } from 'lucide-react'

export default function Header() {
    const { isAuthenticated, logout, user, role, approved } = useAuth()
    const location = useLocation()

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 shadow-sm">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 grid place-items-center transition-transform group-hover:scale-105">
                        <span className="text-white text-base font-bold">UB</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-base font-bold tracking-tight text-slate-900">Uni Bus Tracker</span>
                        <span className="text-[10px] font-medium text-slate-500 tracking-wide uppercase">Campus Transit</span>
                    </div>
                </Link>

                <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
                    <Link
                        to="/map"
                        className={`transition-colors ${location.pathname === '/map'
                            ? 'text-blue-600 font-semibold'
                            : 'text-slate-600 hover:text-blue-600'
                            }`}
                    >
                        Live Map
                    </Link>
                    {(role === 'driver' || role === 'admin') && (
                        <Link
                            to="/driver"
                            className={`transition-colors ${location.pathname === '/driver'
                                ? 'text-blue-600 font-semibold'
                                : 'text-slate-600 hover:text-blue-600'
                                }`}
                        >
                            Driver Portal
                        </Link>
                    )}
                    {role === 'admin' && (
                        <Link
                            to="/admin"
                            className={`transition-colors ${location.pathname === '/admin'
                                ? 'text-blue-600 font-semibold'
                                : 'text-slate-600 hover:text-blue-600'
                                }`}
                        >
                            Administration
                        </Link>
                    )}
                </nav>

                <div className="flex items-center gap-3">
                    {!isAuthenticated && (
                        <Button asChild variant="outline" size="sm" className="hidden sm:flex border-slate-300 hover:border-blue-600 hover:text-blue-600">
                            <Link to="/map">Open Map</Link>
                        </Button>
                    )}
                    {isAuthenticated && (
                        <>
                            <div className="hidden items-center gap-2 md:flex">
                                {role === 'admin' && (
                                    <Badge variant="secondary" className="gap-1">
                                        <Shield className="h-3 w-3" />
                                        Admin
                                    </Badge>
                                )}
                                {role === 'driver' && (
                                    <Badge
                                        variant={approved ? 'default' : 'secondary'}
                                        className="gap-1"
                                    >
                                        <User className="h-3 w-3" />
                                        {approved ? 'Approved' : 'Pending'}
                                    </Badge>
                                )}
                                <span className="hidden text-xs text-slate-600 md:inline font-medium max-w-[120px] truncate">
                                    {user?.name || user?.email}
                                </span>
                            </div>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={logout}
                                className="hover:bg-slate-100"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </Button>
                        </>
                    )}
                    {!isAuthenticated && (
                        <Button asChild size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30">
                            <Link to="/login">Login</Link>
                        </Button>
                    )}
                </div>
            </div>
        </header>
    )
}

