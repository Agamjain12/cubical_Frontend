import { useLocation } from "react-router-dom";

function Chat() {
  const location = useLocation();
  const { operator } = location.state || {};

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Chat with {operator?.name}</h2>
        {/* Add your chat implementation here */}
        <div className="h-[500px] bg-gray-50 rounded-lg flex items-center justify-center">
          <p>Chat Interface Coming Soon</p>
        </div>
      </div>
    </div>
  );
}

export default Chat;
