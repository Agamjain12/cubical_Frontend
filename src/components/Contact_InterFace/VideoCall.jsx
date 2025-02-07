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
// import "../utils/webrtc-polyfills";

const VideoCall = () => {
  const [stream, setStream] = useState(null);
  const [userData, setUserData] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const socket = useRef();
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const location = useLocation();
  const { operator } = location.state || {};
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

  // Then set up socket connection
  useEffect(() => {
    if (!stream) return; // Wait for stream to be available

    const storedUserData = JSON.parse(localStorage.getItem("userData"));
    setUserData(storedUserData);

    socket.current = io("https://cubical-bw9p.onrender.com", {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
    socket.current.emit("register", { userId: storedUserData?.googleId });

    // Handle incoming calls
    socket.current.on("incoming-call", ({ from, signalData }) => {
      if (window.confirm(`Incoming call from ${operator?.name}. Accept?`)) {
        try {
          const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
          });

          peer.on("signal", (data) => {
            socket.current.emit("accept-call", {
              to: from,
              signalData: data,
            });
          });

          peer.on("stream", (remoteStream) => {
            if (userVideo.current) {
              userVideo.current.srcObject = remoteStream;
            }
          });

          peer.signal(signalData);
          connectionRef.current = peer;
          setPeerConnection(peer);
        } catch (err) {
          console.error("Error creating peer:", err);
        }
      } else {
        socket.current.emit("reject-call", { to: from });
      }
    });

    socket.current.on("call-accepted", ({ signalData }) => {
      if (connectionRef.current) {
        connectionRef.current.signal(signalData);
      }
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
      if (peerConnection) {
        peerConnection.destroy();
      }
    };
  }, [stream, operator?.name]);

  const callUser = () => {
    if (!stream) {
      alert("Video stream not ready yet");
      return;
    }

    if (!operator?.googleId) {
      alert("Operator information not available");
      return;
    }

    try {
      // Create wrtc peer connection with polyfills
      const peerOptions = {
        initiator: true,
        trickle: false,
        objectMode: true,
        streams: [stream],
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:global.stun.twilio.com:3478" },
          ],
        },
      };

      const peer = new Peer(peerOptions);

      // Handle signaling
      peer.on("signal", (data) => {
        socket.current.emit("call-user", {
          to: operator.googleId,
          from: userData?.googleId,
          signalData: data,
          callerData: userData,
        });
      });

      // Handle incoming stream
      peer.on("stream", (remoteStream) => {
        if (userVideo.current) {
          userVideo.current.srcObject = remoteStream;
        }
      });

      // Handle errors
      peer.on("error", (err) => {
        console.error("Peer connection error:", err);
        peer.destroy();
        setPeerConnection(null);
      });

      // Store references
      connectionRef.current = peer;
      setPeerConnection(peer);
    } catch (err) {
      console.error("Error initiating call:", err);
      alert("Failed to initiate call. Please try again.");
    }
  };

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
          to: operator.googleId,
          from: userData?.googleId,
        });
      }
      // Navigate back to dashboard
      navigate("/dashboard");
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

  if (!operator) {
    return (
      <div className="text-center p-6">No operator selected for video call</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Video Call with {operator?.name}</h2>
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
          <div className="text-center mt-2">You</div>
        </div>
        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
          <video
            playsInline
            ref={userVideo}
            autoPlay
            className="w-full h-full object-cover"
          />
          <div className="text-center mt-2">{operator?.name}</div>
        </div>
      </div>
      <div className="mt-4 flex justify-center space-x-4">
        {!peerConnection ? (
          <button
            onClick={callUser}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Call {operator?.name}
          </button>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};

export default VideoCall;
