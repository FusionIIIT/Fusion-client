import React, { useEffect, useState } from "react";
import { Loader, Container, Table, Button, Flex } from "@mantine/core";
import PropTypes from "prop-types";
import { GetProposals } from "../handlers/handlers";

function ProposalTable({ requestId, onBack }) {
  const [proposals, setproposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Request ID:", requestId);
    if (requestId) {
      GetProposals({
        setLoading,
        setProposalList: setproposals,
        requestId,
        setProposalIds: () => {},
      });
    } else {
      setLoading(false);
    }
  }, [requestId]);

  return (
    <Container>
      {loading ? (
        <Loader size="lg" />
      ) : (
        <Table striped highlightOnHover>
          <thead>
            <tr>
              <th>Proposal ID</th>
              <th>Current Status</th>
              <th>Created By</th>
              <th>Last Updated</th>
              <th>Created At</th>
              <th>Proposal Budget</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {proposals.length > 0 ? (
              proposals.map((item) => (
                <tr key={item.id}>
                  <td>{item.proposal_id || item.id}</td>
                  <td>{item.status}</td>
                  <td>{item.created_by}</td>
                  <td>{item.updated_at}</td>
                  <td>{item.created_at}</td>
                  <td>{item.proposal_budget}</td>
                  <Button
                    size="xs"
                    // onClick={() => handleViewProposal(item)}
                    style={{
                      backgroundColor: "#1E90FF",
                      color: "white",
                      borderRadius: "20px",
                    }}
                  >
                    View File
                  </Button>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No proposals available
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
      <Flex direction="row" gap="xs">
        <Button
          size="sm"
          variant="light"
          color="gray"
          style={{
            width: "100px",
            backgroundColor: "#1E90FF",
            color: "white",
            border: "none",
            borderRadius: "20px",
          }}
          onClick={onBack}
        >
          Back
        </Button>
      </Flex>
    </Container>
  );
}
ProposalTable.propTypes = {
  onBack: PropTypes.func.isRequired,
  requestId: PropTypes.number.isRequired,
};

export default ProposalTable;
