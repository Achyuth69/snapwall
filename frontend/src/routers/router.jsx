import { createBrowserRouter } from "react-router-dom";
import App from "../App.jsx";
import Home from "../pages/Home.jsx";
import Login from "../Authentication/Login.jsx";
import Signup from "../Authentication/Signup.jsx";
import ForgotPassword from "../Authentication/Forgot.jsx";
import Success from "../Authentication/Success.jsx";
import ProfileDetails from "../Authentication/ProfileDetails.jsx";
import Promotions from "../pages/Promotions.jsx";
import Profile from "../pages/Profile.jsx";
import VerifyEmail from "../Authentication/VerifyEmail.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "signup",
        element: <Signup />,
      },
      {
        path: "verify-email",
        element: <VerifyEmail />,
      },
      {
        path: "forgot",
        element: <ForgotPassword />,
      },
      {
        path: "profile-details",
        element: <ProfileDetails />,
      },
      {
        path: "success",
        element: <Success />,
      },
      {
        path: "promotions",
        element: <Promotions />
      },
      {
        path: "profile",
        element: <Profile />
      }
    ],
  },
]);

export default router;
