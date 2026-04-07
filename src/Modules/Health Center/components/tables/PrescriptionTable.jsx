import PropTypes from "prop-types";

const PrescriptionTable = ({ prescriptions, onDispense }) => {
  if (!prescriptions || prescriptions.length === 0) {
    return <p>No prescriptions found.</p>;
  }

  return (
    <table className="hc-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Patient</th>
          <th>Doctor</th>
          <th>Date</th>
          <th>Details</th>
          <th>Dependent</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {prescriptions.map((p) => (
          <tr key={p.id}>
            <td>{p.id}</td>
            <td>{p.user_id}</td>
            <td>{p.doctor_id || "-"}</td>
            <td>{p.date}</td>
            <td>{p.details}</td>
            <td>
              {p.is_dependent ? `${p.dependent_name} (${p.dependent_relation})` : "-"}
            </td>
            <td>
              {onDispense && <button onClick={() => onDispense(p.id)}>Dispense</button>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

PrescriptionTable.propTypes = {
  prescriptions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      user_id: PropTypes.string,
      doctor_id: PropTypes.string,
      date: PropTypes.string,
      details: PropTypes.string,
      is_dependent: PropTypes.bool,
      dependent_name: PropTypes.string,
      dependent_relation: PropTypes.string,
    }),
  ),
  onDispense: PropTypes.func,
};

PrescriptionTable.defaultProps = {
  prescriptions: [],
  onDispense: null,
};

export default PrescriptionTable;
