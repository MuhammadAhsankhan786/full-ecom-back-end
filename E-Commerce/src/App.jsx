import React, { useContext } from "react";
import Navbar from "./pages/NavBar";
import AppRoutes from "./routes/AppRoutes";
import { GlobalContext } from "./context/Context";
import Swal from "sweetalert2";

const App = () => {
  const { state } = useContext(GlobalContext);
  const isLogin = state.isLogin;

  return (
    <div>
      <Navbar />
      <div className="p-6">
        <AppRoutes isLogin={isLogin} />
      </div>
    </div>
  );
};

export default App;
