import AppRoutes from "./routes/AppRoutes.jsx";
import ChatWindow from "./components/chat/ChatWindow.jsx";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "./features/auth/authSlice.js";

const App = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <>
      <AppRoutes />
      {/* Global floating chat — shown on all pages when logged in! */}
      {isAuthenticated && <ChatWindow />}
    </>
  );
};

export default App;