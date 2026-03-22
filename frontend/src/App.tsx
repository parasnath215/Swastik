import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';

// We will implement these components next
import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout';
import ProjectIntake from './pages/ProjectIntake';
import PhaseManager from './pages/PhaseManager';
import Scheduler from './pages/Scheduler';
import FinanceDashboard from './pages/FinanceDashboard';
import Setup from './pages/Setup';
import UsersManagement from './pages/UsersManagement';
import GanttReport from './pages/GanttReport';
const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  if (!token) return <Navigate to="/login" />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/" />;

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<PhaseManager />} />
          <Route path="intake" element={
            <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN', 'SALES']}>
              <ProjectIntake />
            </ProtectedRoute>
          } />
          <Route path="scheduler" element={<Scheduler />} />
          <Route path="finance" element={<FinanceDashboard />} />
          <Route path="setup" element={
            <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN']}>
              <Setup />
            </ProtectedRoute>
          } />
          <Route path="users" element={
            <ProtectedRoute roles={['SUPER_ADMIN']}>
              <UsersManagement />
            </ProtectedRoute>
          } />
          <Route path="gantt" element={
            <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN']}>
              <GanttReport />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
