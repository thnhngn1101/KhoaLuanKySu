import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import Calendar from "./pages/driver/Drivers";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import CreateDrivers from "./pages/driver/CreateDriverAccount";
import User from "./pages/user/User";
import UserAccountManager from "./pages/user/UserAccountManager";    
import DriverAccountManager from "./pages/driver/DriverAccountManager";
import UserWalletManager from "./pages/wallet/UserWalletManager";
import StudentCardManager from "./pages/user/StudentCardManager";
import RouteManager from "./pages/Bus/RouteManager";
// import DriverAssignmentManager from "./pages/DriverAssignmentManager";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />

            {/* Driver Manager */}
            <Route path="/driver" element={<Calendar />} />
            <Route path="/create-driver-acc" element={<CreateDrivers />} />
            {/* <Route path="/driver-assignment" element={<DriverAssignmentManager />} /> */}
            
            {/* User */}
            <Route path="/user" element={<User />} />

            {/* Manager Account */}
            <Route path="/user-account-manager" element={<UserAccountManager />} />
            <Route path="/driver-account-manager" element={<DriverAccountManager/>} />

            {/* User Wallet */}
            <Route path="/user-wallet-manager" element={<UserWalletManager />} />

            {/* Student Card */}
            <Route path="/student-card-manager" element={<StudentCardManager />} />

            {/* Bus Route */}
            <Route path="/bus-route" element={<RouteManager />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
