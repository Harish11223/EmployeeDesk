import './App.css';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
// import { ClipLoader } from "react-spinners";
import { RingLoader } from "react-spinners";
import { auth } from './firebase-config';
import { onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect } from 'react';

import Login from "./pages/Login";

import AdminDashboard from "./pages/AdminDash/AdminDashboard";
import Employees from './pages/AdminDash/Employees';
import EmployeeProfile from "./pages/AdminDash/EmployeeProfile";
import AddNewUser from './pages/AdminDash/AddNewUser';
import AttendanceReport from './pages/AdminDash/AttendanceReport';
import SalaryManagement from './pages/AdminDash/SalaryManagement';
import LeaveManagement from './pages/AdminDash/LeaveManagement';

import EmployeeDashboard from "./pages/EmployeeDash/EmployeeDashboard";
import MarkAttendance from './pages/EmployeeDash/MarkAttendance';
import LeaveRequest from './pages/EmployeeDash/LeaveRequest';
import UpdateProfile from './pages/EmployeeDash/UpdateProfile';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <RingLoader color="#6366F1" size={100} />
      </div>
    );
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />

          {/* Admin Routes */}
          <Route path="/admindash" element={user ? <AdminDashboard /> : <Login />} />
          <Route path="/employees" element={user ? <Employees /> : <Login />} />
          <Route path="/newuser" element={user ? <AddNewUser /> : <Login />} />
          <Route path="/admindash/employee-profile/:employeeId" element={user ? <EmployeeProfile /> : <Login />} />
          <Route path="/attendance-report" element={user ? <AttendanceReport /> : <Login />} />
          <Route path="/leave-management" element={user ? <LeaveManagement /> : <Login />} />
          <Route path="/salary-management" element={user ? <SalaryManagement /> : <Login />} />

          {/* Employee Routes */}
          <Route path="/employeedash" element={user ? <EmployeeDashboard /> : <Login />} />
          <Route path="/mark-attendance" element={user ? <MarkAttendance /> : <Login />} />
          <Route path="/leave-request" element={user ? <LeaveRequest /> : <Login />} />
          <Route path="/update-profile" element={user ? <UpdateProfile /> : <Login />} />

        </Routes>
      </BrowserRouter>

      <Toaster />
    </>
  );
}

export default App;