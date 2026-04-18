import React from "react";
import { Link, useParams } from "react-router-dom";
import {
  User,
  Tag,
  IdentificationCard,
  Calendar,
  ClipboardText,
  CurrencyDollar,
} from "@phosphor-icons/react";
import { Title } from "@mantine/core";
import LoadingComponent from "../../components/common/Loading";
import { EmptyTable } from "../../components/tables/EmptyTable";
import HrBreadcrumbs from "../../components/common/HrBreadcrumbs";
import { getCpdaAdvForm } from "../../services/api";
import useFetchData from "../../hooks/useFetchData";

function CpdaAdvForm() {
  const { id } = useParams();
  const { data: fetchedformData, loading } = useFetchData(() =>
    getCpdaAdvForm(id),
  );

  const exampleItems = [
    { title: "Home", path: "/dashboard" },
    { title: "Human Resources", path: "/hr" },
    { title: "CPDA Adv", path: "/hr/cpda_adv" },
    { title: "View Form", path: `/hr/cpda_adv/view/${id}` },
  ];

  if (loading) {
    return <LoadingComponent />;
  }

  if (!fetchedformData) {
    return (
      <>
        <HrBreadcrumbs items={exampleItems} />
        <EmptyTable message="No view data found." />
      </>
    );
  }

  return (
    <>
      <HrBreadcrumbs items={exampleItems} />
      <Title
        order={2}
        style={{ fontWeight: "500", marginTop: "40px", marginLeft: "15px" }}
      >
        CPDA Advance Form Details
      </Title>
      <div className="CPDA_ADVANCEForm_container">
        <form>
          <div className="grid-row">
            <div className="grid-col">
              <div className="input-wrapper">
                <label className="input-label" htmlFor="name">
                  Name
                  <User size={20} />
                  <input
                    type="text"
                    id="name"
                    value={fetchedformData.name}
                    className="input"
                    disabled
                  />
                </label>
              </div>
            </div>
            <div className="grid-col">
              <div className="input-wrapper">
                <label className="input-label" htmlFor="designation">
                  Designation
                  <Tag size={20} />
                  <input
                    type="text"
                    id="designation"
                    value={fetchedformData.designation}
                    className="input"
                    disabled
                  />
                </label>
              </div>
            </div>
          </div>
          <div className="grid-row">
            <div className="grid-col">
              <div className="input-wrapper">
                <label className="input-label" htmlFor="amountRequired">
                  Amount Required
                  <CurrencyDollar size={20} />
                  <input
                    type="number"
                    id="amountRequired"
                    value={fetchedformData.amountRequired}
                    className="input"
                    disabled
                  />
                </label>
              </div>
            </div>
            <div className="grid-col">
              <div className="input-wrapper">
                <label className="input-label" htmlFor="submissionDate">
                  Date
                  <Calendar size={20} />
                  <input
                    type="date"
                    id="submissionDate"
                    value={fetchedformData.submissionDate}
                    className="input"
                    disabled
                  />
                </label>
              </div>
            </div>
          </div>
          <div className="grid-row">
            <div className="grid-col" style={{ flexGrow: 2 }}>
              <div className="input-wrapper">
                <label className="input-label" htmlFor="purpose">
                  Purpose
                  <ClipboardText size={20} />
                  <input
                    type="text"
                    id="purpose"
                    name="purpose"
                    placeholder="Purpose"
                    value={fetchedformData.purpose}
                    className="input"
                    disabled
                  />
                </label>
              </div>
            </div>
            <div className="grid-col">
              <div className="input-wrapper">
                <label className="input-label" htmlFor="pfNo">
                  PF Number
                  <IdentificationCard size={20} />
                  <input
                    type="text"
                    id="pfNo"
                    name="pfNo"
                    placeholder="XXXXXXXXXXXX"
                    value={fetchedformData.pfNo}
                    disabled
                    className="input"
                  />
                </label>
              </div>
            </div>
            <div className="grid-col">
              <div className="input-wrapper">
                <label className="input-label" htmlFor="advanceDueAdjustment">
                  Advance (PDA) due for adjustment (if any)
                  <CurrencyDollar size={20} />
                  <input
                    type="text"
                    id="advanceDueAdjustment"
                    name="advanceDueAdjustment"
                    placeholder="Advance Due"
                    value={fetchedformData.advanceDueAdjustment}
                    disabled
                  />
                </label>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

export default CpdaAdvForm;
