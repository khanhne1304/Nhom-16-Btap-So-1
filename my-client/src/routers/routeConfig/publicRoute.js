import Home from "../../views/pages/HomePage/Home";
import Register from "../../views/pages/RegisterPage/Register";
import Login from "../../views/pages/LoginPage/Login";
import ProfileUser from "@/views/pages/ProfilePage/ProfileUser";
import EditProfile from "@/views/pages/ProfilePage/EditProfile";

const publicRoutes = [
  { path: "/",         element: <Home /> },
  { path: "/register", element: <Register /> }, 
  { path: "/login", element: <Login /> }, 
  { path: "/profile", element: <ProfileUser /> },
  { path: "/profile/edit", element: <EditProfile /> },
];

export default publicRoutes;
