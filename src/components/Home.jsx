import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);

  useEffect(() => {
    // Instead of storing data and redirecting to dashboard,
    // redirect to user type selection with the same params
    navigate("/select-type" + location.search);
  }, [navigate, location.search]);

  return (
    <div className="p-4">
      <p>Redirecting to account type selection...</p>
    </div>
  );
}

export default Home;
