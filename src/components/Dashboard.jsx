import { useState, useEffect } from "react";
import Operators from "./Operators";

function Dashboard() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  return (
    <>
      {userData && (
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-4 mb-6">
              <img
                src={userData.profilePicture}
                alt={userData.name}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h1 className="text-2xl font-bold">{userData.name}</h1>
                <p className="text-gray-600">{userData.email}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md shadow-gray-300 border-2 p-6">
              <Operators />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Dashboard;
