import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import Peer from "simple-peer";
import {
  BsTelephoneX,
  BsCameraVideo,
  BsCameraVideoOff,
  BsMicFill,
  BsMicMuteFill,
} from "react-icons/bs";
// import "../utils/webrtc-polyfills.js";

const OperatorVideoCall = () => {
  const [stream, setStream] = useState(null);
  const [userData, setUserData] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const socket = useRef();
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const location = useLocation();
  const { caller, signalData: incomingSignalData } = location.state || {};
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  // First get media stream
  useEffect(() => {
    const getMedia = async () => {
      try {
        const currentStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }
      } catch (err) {
        console.error("Failed to get media stream:", err);
      }
    };
    getMedia();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Then set up socket and peer connection
  useEffect(() => {
    if (!stream || !incomingSignalData) return;

    const storedUserData = JSON.parse(localStorage.getItem("userData"));
    setUserData(storedUserData);

    socket.current = io("http://localhost:6600");
    socket.current.emit("register", { userId: storedUserData?.googleId });

    try {
      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream,
      });

      peer.on("signal", (data) => {
        socket.current.emit("accept-call", {
          to: caller.googleId,
          signalData: data,
        });
      });

      peer.on("stream", (remoteStream) => {
        if (userVideo.current) {
          userVideo.current.srcObject = remoteStream;
        }
      });

      // Handle the incoming signal data
      peer.signal(incomingSignalData);

      connectionRef.current = peer;
      setPeerConnection(peer);
    } catch (err) {
      console.error("Error setting up peer connection:", err);
    }

    socket.current.on("call-ended", () => {
      if (peerConnection) {
        peerConnection.destroy();
        setPeerConnection(null);
      }
      navigate("/operator-dashboard");
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
      if (peerConnection) {
        peerConnection.destroy();
      }
    };
  }, [stream, incomingSignalData, caller?.googleId]);

  const handleEndCall = () => {
    try {
      if (peerConnection) {
        peerConnection.destroy();
        setPeerConnection(null);
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (socket.current) {
        socket.current.emit("end-call", {
          to: caller.googleId,
          from: userData?.googleId,
        });
      }
      // Navigate back to operator dashboard
      navigate("/operator-dashboard");
    } catch (err) {
      console.error("Error ending call:", err);
    }
  };

  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleCamera = () => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsCameraOff(!isCameraOff);
    }
  };

  if (!caller) {
    return (
      <div className="text-center p-6">No caller information available</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Video Call with {caller.name}</h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
          <video
            playsInline
            muted
            ref={myVideo}
            autoPlay
            className="w-full h-full object-cover"
          />
          <div className="text-center mt-2">You (Operator)</div>
        </div>
        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
          <video
            playsInline
            ref={userVideo}
            autoPlay
            className="w-full h-full object-cover"
          />
          <div className="text-center mt-2">{caller.name}</div>
        </div>
      </div>
      <div className="mt-4 flex justify-center space-x-4">
        <button
          onClick={toggleMic}
          className={`p-3 rounded-full ${
            isMuted ? "bg-red-500" : "bg-gray-500"
          } text-white hover:opacity-80`}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <BsMicMuteFill size={20} /> : <BsMicFill size={20} />}
        </button>
        <button
          onClick={toggleCamera}
          className={`p-3 rounded-full ${
            isCameraOff ? "bg-red-500" : "bg-gray-500"
          } text-white hover:opacity-80`}
          title={isCameraOff ? "Turn Camera On" : "Turn Camera Off"}
        >
          {isCameraOff ? (
            <BsCameraVideoOff size={20} />
          ) : (
            <BsCameraVideo size={20} />
          )}
        </button>
        <button
          onClick={handleEndCall}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center space-x-2"
        >
          <BsTelephoneX className="text-xl" />
          <span>End Call</span>
        </button>
      </div>
    </div>
  );
};

export default OperatorVideoCall;
