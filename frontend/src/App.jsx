import { Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Login from './pages/login';
import Register from './pages/register';
import DashboardLayout from './components/DashboardLayout';
import CVForm from './pages/CVForm' 
import AdminUsersGrid from './pages/AdminUserGrid'; 
import AdminCandidateGrid from './pages/AdminCandidateGrid';
import Profile from './pages/profile';
import AdminSearches from './pages/AdminSearches';
import PublicSearches from "./pages/PublicSearches";
// ...
<Route path="/admin/users" element={<AdminUsersGrid />} />
function App() {
  return (
    <Routes>
      {/* Layout con sidebar para páginas internas */}
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/CVForm" element={<CVForm />} />
        <Route path="/admin/users" element={<AdminUsersGrid />} />
        <Route path="admin/candidates" element={<AdminCandidateGrid />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="admin/searches" element={<AdminSearches />} />
        <Route path="/searches" element={<PublicSearches />} />
      </Route>

      {/* Sin layout (login aparte) */}
      
    </Routes>
  );
}

export default App;
