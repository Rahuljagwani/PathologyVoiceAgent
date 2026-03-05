import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { CallLogs } from './pages/CallLogs'
import { HomeCollectionCalendar } from './pages/HomeCollectionCalendar'
import { Login } from './pages/Login'
import { ReportStatusManager } from './pages/ReportStatusManager'
import { Settings } from './pages/Settings'
import { TestPriceManager } from './pages/TestPriceManager'
import { ShellLayout } from './components/ShellLayout'
import { getCurrentLabId } from './api/client'
import { ToastProvider } from './components/ToastProvider'

function ProtectedLayout() {
  const hasSession = !!getCurrentLabId()
  if (!hasSession) {
    return <Navigate to="/login" replace />
  }
  return <ShellLayout />
}

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedLayout />}>
            <Route index element={<Navigate to="/dashboard/reports" replace />} />
            <Route path="/dashboard/reports" element={<ReportStatusManager />} />
            <Route
              path="/dashboard/home-collections"
              element={<HomeCollectionCalendar />}
            />
            <Route path="/dashboard/tests" element={<TestPriceManager />} />
            <Route path="/dashboard/call-logs" element={<CallLogs />} />
            <Route path="/dashboard/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App
