import { useParams } from "react-router-dom";

import FollowUpPrescriptionForm from "../components/forms/FollowUpPrescriptionForm";

const FollowupPrescriptionPage = () => {
  const { id } = useParams();

  return (
    <div>
      <FollowUpPrescriptionForm prescriptionId={id} previousMedicines={[]} />
    </div>
  );
};

export default FollowupPrescriptionPage;
