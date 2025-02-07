import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Operators() {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/operators`,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setOperators(response?.data?.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch operators");
        setLoading(false);
        console.error("Error fetching operators:", err);
      }
    };

    fetchOperators();
  }, []);

  const handleSelectOperator = (operator) => {
    navigate("/contact", { state: { operator } });
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-center text-red-500 p-4">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Operators List</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
        {operators.map((operator) => (
          <div
            key={operator.id}
            className="bg-white rounded-lg shadow-md border-2 p-4 flex items-center space-x-4"
          >
            <img
              src={operator.profilePicture}
              alt={operator.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="flex-1">
              <h2 className="font-semibold text-lg">{operator.name}</h2>
              <p className="text-gray-600 text-sm">{operator.email}</p>
              <button
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                onClick={() => handleSelectOperator(operator)}
              >
                Select
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Operators;
