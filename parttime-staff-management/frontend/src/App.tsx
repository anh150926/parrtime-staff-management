import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "./app/store";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Stores from "./pages/Stores";
import Shifts from "./pages/Shifts";
import MyShifts from "./pages/MyShifts";
import Requests from "./pages/Requests";
import Payrolls from "./pages/Payrolls";
import MyPayroll from "./pages/MyPayroll";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import Marketplace from "./pages/Marketplace";
import Tasks from "./pages/Tasks";
import CreateTaskForStaff from "./pages/CreateTaskForStaff";
import Notifications from "./pages/Notifications";
import Complaints from "./pages/Complaints";
import EmployeeRanking from "./pages/EmployeeRanking";
import ShiftRegistration from "./pages/ShiftRegistration";
import WorkSchedule from "./pages/WorkSchedule";
import ProtectedRoute from "./routes/ProtectedRoute";

const App: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Routes>
      <Route
        path="/login"
        element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />}
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/shift-registration" element={<ShiftRegistration />} />
          <Route path="/work-schedule" element={<WorkSchedule />} />
          <Route path="/users" element={<Users />} />
          <Route path="/stores" element={<Stores />} />
          <Route path="/shifts" element={<Shifts />} />
          <Route path="/my-shifts" element={<MyShifts />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route
            path="/create-task-for-staff"
            element={<CreateTaskForStaff />}
          />
          <Route path="/requests" element={<Requests />} />
          <Route path="/payrolls" element={<Payrolls />} />
          <Route path="/my-payroll" element={<MyPayroll />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/rankings" element={<EmployeeRanking />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
