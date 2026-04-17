import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { authActions } from "../store/auth";
import api from "../api";

/**
 * useAuth — convenience wrapper around Redux auth state.
 */
const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const role = useSelector((state) => state.auth.role);

  const logout = async () => {
    try {
      await api.post("/api/v1/logout");
      dispatch(authActions.logout());
      dispatch(authActions.changeRole("user"));
      localStorage.clear();
      navigate("/");
    } catch (error) {
      console.error(error);
      localStorage.clear();
      navigate("/");
    }
  };

  const userId = localStorage.getItem("id");
  const token = localStorage.getItem("token");

  return { isLoggedIn, role, userId, token, logout, isAdmin: role === "admin" };
};

export default useAuth;
