import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/dashboard/reports', label: 'Reports' },
  { to: '/dashboard/home-collections', label: 'Home Collections' },
  { to: '/dashboard/tests', label: 'Tests & Prices' },
  { to: '/dashboard/call-logs', label: 'Call Logs' },
  { to: '/dashboard/settings', label: 'Settings' },
]

export function ShellLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="hidden w-64 flex-shrink-0 border-r border-slate-200 bg-white/80 px-4 py-6 shadow-sm sm:block">
        <div className="mb-8">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Pathology Voice
          </div>
          <div className="text-lg font-semibold text-slate-900">
            Lab Dashboard
          </div>
        </div>
        <nav className="space-y-1 text-sm">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'flex items-center rounded-md px-3 py-2 transition-colors',
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 shadow-sm">
          <div className="text-sm font-medium text-slate-700">
            Pathology Lab Voice Agent
          </div>
          <div className="text-xs text-slate-500">MVP — Commit 1 (project-init)</div>
        </header>
        <main className="flex-1 px-4 py-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

