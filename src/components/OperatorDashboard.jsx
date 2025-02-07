import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import Peer from "simple-peer";

function OperatorDashboard() {
  const userData = JSON.parse(localStorage.getItem("userData"));
  const [incomingCall, setIncomingCall] = useState(null);
  const socket = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize socket connection
    socket.current = io("http://localhost:6600");

    // Register operator with their Google ID
    socket.current.emit("register", { userId: userData?.googleId });

    // Listen for incoming calls
    socket.current.on("incoming-call", ({ from, signalData, callerData }) => {
      setIncomingCall({
        from,
        signalData,
        callerName: callerData?.name || "Unknown User",
        callerEmail: callerData?.email,
      });
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [userData?.googleId]);

  const handleAcceptCall = () => {
    if (incomingCall) {
      navigate("/operator-video-call", {
        state: {
          caller: {
            googleId: incomingCall.from,
            name: incomingCall.callerName,
            email: incomingCall.callerEmail,
          },
          signalData: incomingCall.signalData,
        },
      });
    }
  };

  const handleRejectCall = () => {
    if (incomingCall) {
      socket.current.emit("reject-call", { to: incomingCall.from });
      setIncomingCall(null);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-4">Operator Dashboard</h1>
          <div className="flex items-center space-x-4 mb-6">
            <img
              src={userData?.profilePicture}
              alt={userData?.name}
              className="w-16 h-16 rounded-full"
            />
            <div>
              <h2 className="text-xl font-semibold">{userData?.name}</h2>
              <p className="text-gray-600">{userData?.email}</p>
            </div>
          </div>

          {/* Incoming Call Alert */}
          {incomingCall && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-xl font-semibold mb-4">Incoming Call</h3>
                <p className="mb-4">
                  {incomingCall.callerName} is calling you...
                </p>
                <div className="flex space-x-4 justify-end">
                  <button
                    onClick={handleRejectCall}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Reject
                  </button>
                  <button
                    onClick={handleAcceptCall}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Accept
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Rest of dashboard content */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Status</h3>
            <p className="text-green-500">Online - Ready to receive calls</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OperatorDashboard;
