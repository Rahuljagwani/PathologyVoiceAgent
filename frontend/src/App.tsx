import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { CallLogs } from './pages/CallLogs'
import { HomeCollectionCalendar } from './pages/HomeCollectionCalendar'
import { Login } from './pages/Login'
import { ReportStatusManager } from './pages/ReportStatusManager'
import { Settings } from './pages/Settings'
import { TestPriceManager } from './pages/TestPriceManager'
import { ShellLayout } from './components/ShellLayout'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ShellLayout />}>
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
  )
}

export default App
