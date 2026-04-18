import React from "react";
import LTCForm from "../../components/forms/LTCForm";
import { createLtcForm } from "../../services/api";

function LtcFormPage() {
  const handleSubmit = async (formData) => {
    console.log("LTC formData received:", JSON.stringify(formData, null, 2));
    if (!formData.departmentSection) {
      alert("Please select a Department/Section before submitting.");
      return;
    }
    if (!formData.Blockyear) {
      alert("Please enter the Block Year before submitting.");
      return;
    }

    try {
      const mappedData = {
        name: formData.name,
        designation: formData.designation,
        blockYear: formData.Blockyear ? parseInt(formData.Blockyear, 10) : null,
        pfNo: parseInt(formData.providentFundNo, 10) || null,
        basicPaySalary: parseInt(formData.basicPay, 10) || null,
        departmentInfo: formData.departmentSection,
        leaveRequired: formData.ltcAvailability === "Yes",
        leaveStartDate: formData.dateFrom || null,
        leaveEndDate: formData.dateTo || null,
        dateOfDepartureForFamily: formData.familyDepartureDate || null,
        natureOfLeave: formData.natureOfLeave,
        purposeOfLeave: formData.purpose,
        hometownOrNot: !formData.visitingPlace, // True if HomeTown (visitingPlace is empty)
        placeOfVisit: formData.visitingPlace,
        addressDuringLeave: formData.addressDuringLeave,
        modeofTravel: formData.modeOfTravel,
        detailsOfFamilyMembersAlreadyDone: `Self: ${formData.selfName}, Wife: ${formData.wifeName}, Children: ${formData.Children}`,
        detailsOfFamilyMembersAboutToAvail: formData.childrenFields,
        detailsOfDependents: formData.dependentsFields,
        amountOfAdvanceRequired: parseInt(formData.amount, 10) || 0,
        certifiedThatFamilyDependents: formData.certificationDetails,
        certifiedThatAdvanceTakenOn: formData.previousLTCDate || null,
        submissionDate: formData.date || null,
        phoneNumberForContact: formData.phoneNumber,
      };

      const payload = [
        mappedData,
        {
          uploader_name: formData.name,
          uploader_designation: formData.designation,
          receiver_name: formData.username,
          receiver_designation: formData.designationFooter,
        },
      ];
      console.log("LTC mapped payload:", JSON.stringify(payload, null, 2));
      await createLtcForm(payload);
      alert("Form submitted successfully!");
    } catch (error) {
      console.error(error);
      alert("Submission failed");
    }
  };

  return <LTCForm onSubmit={handleSubmit} />;
}

export default LtcFormPage;
