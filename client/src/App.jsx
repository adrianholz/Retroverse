// App.jsx
import "./App.css";
import { HashRouter } from "react-router-dom";
import { UserStorage } from "./UserContext.jsx";
import AnimatedRoutes from "./Components/AnimatedRoutes";
import AudioProvider from "./Components/AudioProvider.jsx";
import GlobalSettings from "./Components/GlobalSettings.jsx";
import Sidebar from "./Components/User/Sidebar.jsx";
import Loading from "./Components/Loading.jsx";
import Skraper from "./Components/Skraper.jsx";

function App() {
  return (
    <HashRouter>
      <UserStorage>
        <Loading />
        <Skraper />
        <Sidebar />
        <AnimatedRoutes />
        <AudioProvider />
        <GlobalSettings />
      </UserStorage>
    </HashRouter>
  );
}

export default App;
