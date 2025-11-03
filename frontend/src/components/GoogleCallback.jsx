import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUserContext } from "../features/user/useUserContext";

function GoogleCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useUserContext();

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      // Store the token (e.g. in localStorage)
      localStorage.setItem("jwt", token);
      login({ token }); // Your context should fetch user profile if needed
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, [params, login, navigate]);

  return <div>Signing in with Google...</div>;
}

export default GoogleCallback;
