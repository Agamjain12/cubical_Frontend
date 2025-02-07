import { useState, useEffect, createContext, useCallback } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import "./index.css";
import Login from "./components/Login";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import Contact from "./components/Contact";
import VideoCall from "./components/Contact_InterFace/VideoCall";
import Chat from "./components/Contact_InterFace/Chat";
import Call from "./components/Contact_InterFace/Call";
import UserTypeSelection from "./components/UserTypeSelection";
import OperatorDashboard from "./components/OperatorDashboard";
import OperatorVideoCall from "./components/Contact_InterFace/OperatorVideoCall";

// Create auth context to manage authentication state across components
export const AuthContext = createContext();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userType, setUserType] = useState(null);

  const updateAuth = useCallback((status) => {
    setIsAuthenticated(status);
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      try {
        setTimeout(() => {
          const token = localStorage.getItem("token");
          const userData = JSON.parse(localStorage.getItem("userData"));

          if (token && userData) {
            setIsAuthenticated(true);
            setUserType(userData.userType || null);
          } else {
            setIsAuthenticated(false);
            setUserType(null);
          }
          setIsLoading(false);
        }, 100);
      } catch (error) {
        setIsAuthenticated(false);
        setUserType(null);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const getRedirectPath = () => {
    const currentPath = window.location.pathname;

    // Allow select-type page to handle its own routing
    if (currentPath === "/select-type") {
      return null;
    }

    if (!isAuthenticated) return "/login";
    if (!userType) return "/select-type";
    if (userType === "user") return "/dashboard";
    if (userType === "operator") return "/operator-dashboard";
    return "/select-type";
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, updateAuth }}>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              !isAuthenticated ? <Login /> : <Navigate to={getRedirectPath()} />
            }
          />
          <Route path="/home" element={<Home />} />
          <Route path="/select-type" element={<UserTypeSelection />} />
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                userType === "user" ? (
                  <Dashboard />
                ) : (
                  <Navigate to={getRedirectPath()} />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/operator-dashboard"
            element={
              isAuthenticated ? (
                userType === "operator" ? (
                  <OperatorDashboard />
                ) : (
                  <Navigate to={getRedirectPath()} />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/operator-video-call"
            element={
              isAuthenticated ? (
                userType === "operator" ? (
                  <OperatorVideoCall />
                ) : (
                  <Navigate to={getRedirectPath()} />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          {/* Protected routes */}
          {["contact", "video-call", "chat", "call"].map((path) => (
            <Route
              key={path}
              path={`/${path}`}
              element={
                isAuthenticated ? (
                  userType === "user" ? (
                    {
                      contact: <Contact />,
                      "video-call": <VideoCall />,
                      chat: <Chat />,
                      call: <Call />,
                    }[path]
                  ) : (
                    <Navigate to={getRedirectPath()} />
                  )
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
          ))}
          <Route path="/" element={<Navigate to={getRedirectPath()} />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
