import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BookingForm from "./pages/BookingForm";
import BookingDetail from "./pages/BookingDetail";
import BookingList from "./pages/BookingList";
import RoomIssues from "./pages/RoomIssues";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";
import OfflineIndicator from "./components/OfflineIndicator";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="bookings" element={<BookingList />} />
            <Route path="bookings/new" element={<BookingForm />} />
            <Route path="bookings/:id" element={<BookingDetail />} />
            <Route path="bookings/:id/edit" element={<BookingForm />} />
            <Route path="room-issues" element={<RoomIssues />} />
          </Route>
        </Routes>
        <OfflineIndicator />
      </Router>
    </AuthProvider>
  );
}

export default App;
