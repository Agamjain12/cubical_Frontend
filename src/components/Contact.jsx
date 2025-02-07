import { useLocation, useNavigate } from "react-router-dom";
import { BsCameraVideo, BsChat, BsTelephone } from "react-icons/bs";

function Contact() {
  const location = useLocation();
  const navigate = useNavigate();
  const { operator } = location.state || {};

  if (!operator) {
    return <div>No operator selected</div>;
  }
  const handleOptionClick = (option) => {
    navigate(`/${option}`, { state: { operator } });
  };
  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Operator Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 flex items-center space-x-4">
        <img
          src={operator.profilePicture}
          alt={operator.name}
          className="w-20 h-20 rounded-full object-cover"
        />
        <div>
          <h2 className="text-2xl font-bold">{operator.name}</h2>
          <p className="text-gray-600">{operator.email}</p>
        </div>
      </div>

      {/* Contact Options */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-6 text-center">
          Choose Contact Method
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => handleOptionClick("video-call")}
            className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BsCameraVideo className="text-3xl mb-2 text-blue-500" />
            <span>Video Call</span>
          </button>
          <button
            onClick={() => handleOptionClick("chat")}
            className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BsChat className="text-3xl mb-2 text-green-500" />
            <span>Chat</span>
          </button>
          <button
            onClick={() => handleOptionClick("call")}
            className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BsTelephone className="text-3xl mb-2 text-red-500" />
            <span>Call</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Contact;
