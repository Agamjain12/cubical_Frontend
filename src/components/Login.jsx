import axios from "axios";

const Login = () => {
  const handleLogin = async () => {
    try {
      const resp = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/auth/google`,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (resp.data) {
        window.location.href = resp.data;
      }
    } catch (error) {
      console.error("Error while OAuth login:", error);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
      <button
        onClick={handleLogin}
        className="px-6 py-3 bg-blue-500 rounded-lg text-lg hover:bg-blue-600"
      >
        Login with Google
      </button>
    </div>
  );
};

export default Login;
