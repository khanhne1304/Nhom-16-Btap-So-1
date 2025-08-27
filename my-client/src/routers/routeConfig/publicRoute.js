import Home from "../../views/pages/HomePage/Home";
import Register from "../../views/pages/RegisterPage/Register";
import Login from "../../views/pages/LoginPage/Login";

const publicRoutes = [
  { path: "/",         element: <Home /> },
  { path: "/register", element: <Register /> }, 
  { path: "/login", element: <Login /> }, 
];

export default publicRoutes;
