import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './components/DashboardLayout';
import CVForm from './pages/CVForm' 
import AdminUsersGrid from './pages/AdminUserGrid'; 
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
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Sin layout (login aparte) */}
      
    </Routes>
  );
}

export default App;
