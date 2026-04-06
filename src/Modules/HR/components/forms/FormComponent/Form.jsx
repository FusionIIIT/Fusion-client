import React, { useEffect, useState } from "react";
import { Title } from "@mantine/core";
import PropTypes from "prop-types";
import FormTable from "./FormTable";
import { fetchData } from "./dataFetcher";

function Form({ title, data }) {
  // Accepting data prop
  const [headers, setHeaders] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const response = await fetchData(); // Just fetch headers here
      setHeaders(response.headers || []);
    };

    loadData();
  }, []);

  return (
    <div className="app-container">
      <Title
        order={2}
        style={{ fontWeight: "500", marginTop: "40px", marginLeft: "15px" }}
      >
        {title}
      </Title>
      {headers.length > 0 && data.length > 0 ? (
        <FormTable headers={headers} data={data} />
      ) : (
        <div className="loading-spinner" />
      )}
    </div>
  );
}

export default Form;

Form.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};
