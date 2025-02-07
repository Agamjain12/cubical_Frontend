import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function UserTypeSelection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);

  const userData = {
    token: params.get("token"),
    googleId: params.get("googleId"),
    email: params.get("email"),
    name: params.get("name"),
    profilePicture: params.get("profilePicture"),
    userType: params.get("userType"),
  };

  useEffect(() => {
    if (!userData.token) {
      navigate("/login");
      return;
    }

    // Store initial data from OAuth
    localStorage.setItem("token", userData.token);
    localStorage.setItem("userData", JSON.stringify(userData));

    // If userType already exists, redirect accordingly
    if (userData.userType === "user") {
      navigate("/dashboard");
    } else if (userData.userType === "operator") {
      navigate("/operator-dashboard");
    }
  }, [userData, navigate]);

  const handleUserTypeSelection = async (userType) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/set-user-type`,
        {
          token: token,
          googleId: userData.googleId,
          userType: userType,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        const updatedUserData = { ...userData, userType };
        localStorage.setItem("userData", JSON.stringify(updatedUserData));

        if (userType === "operator") {
          navigate("/operator-dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        throw new Error("Failed to update user type");
      }
    } catch (err) {
      console.error("Error setting user type:", err);
      setError("Failed to set user type. Please try again.");
      // Clear storage and redirect to login on error
      localStorage.clear();
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">
          Choose Your Account Type
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={() => handleUserTypeSelection("user")}
            className="w-full p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Login as User
          </button>
          <button
            onClick={() => handleUserTypeSelection("operator")}
            className="w-full p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Login as Operator
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserTypeSelection;
