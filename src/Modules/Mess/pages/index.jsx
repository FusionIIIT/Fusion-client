import { useSelector } from "react-redux";
import Caretaker from "../components/CaretakerIndex";
import Warden from "../components/WardenIndex";
import Student from "../components/StudentIndex";

function MessPage() {
  const role = useSelector((state) => state.user.role);
  switch (role) {
    case "mess_manager":
      return <Caretaker />;
    case "mess_warden":
      return <Warden />;
    case "student":
    default:
      // Render Student view by default for testing so it doesn't get stuck on Loader
      return <Student />;
  }
}

export default MessPage;
