import React from "react";
import { useParams } from "react-router-dom";
import { Title } from "@mantine/core";
import LoadingComponent from "../common/Loading";
import { EmptyTable } from "../tables/EmptyTable";
import HrBreadcrumbs from "../common/HrBreadcrumbs";
import useFetchData from "../../hooks/useFetchData";

function GenericFormView({ title, fetchFn, breadcrumbPath }) {
  const { id } = useParams();
  const { data: fetchedformData, loading } = useFetchData(() => fetchFn(id));

  const exampleItems = [
    { title: "Home", path: "/dashboard" },
    { title: "Human Resources", path: "/hr" },
    { title: breadcrumbPath.title, path: breadcrumbPath.path },
    { title: "View Form", path: `${breadcrumbPath.path}/view/${id}` },
  ];

  if (loading) {
    return <LoadingComponent />;
  }

  if (!fetchedformData || Object.keys(fetchedformData).length === 0) {
    return (
      <>
        <HrBreadcrumbs items={exampleItems} />
        <EmptyTable message="No view data found." />
      </>
    );
  }

  return (
    <div style={{ padding: '0px 20px 20px 0px' }}>
      <HrBreadcrumbs items={exampleItems} />
      <Title order={2} style={{ fontWeight: "500", marginTop: "40px", marginBottom: "20px" }}>
        {title}
      </Title>
      
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
          <tbody>
            {Object.entries(fetchedformData).map(([key, value]) => {
              if (key === 'file_extra_JSON' || key === 'tracking_extra_JSON' || key === 'id' || key === 'created_by' || key === 'approved_by') return null; // Skip internal fields
              
              let displayValue = value;
              if (typeof value === 'boolean') {
                displayValue = value ? "Yes" : "No";
              } else if (typeof value === 'object' && value !== null) {
                // If it's an array or nested object, stringify it nicely
                if (Array.isArray(value)) {
                  displayValue = value.map(v => typeof v === 'object' ? JSON.stringify(v) : v).join(', ');
                } else {
                  displayValue = JSON.stringify(value);
                }
              }

              // Format camelCase keys to Title Case
              const formattedKey = key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase())
                .trim();
              
              return (
                <tr key={key} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '15px 10px', fontWeight: '600', width: '30%', color: '#333' }}>
                    {formattedKey}
                  </td>
                  <td style={{ padding: '15px 10px', color: '#555' }}>
                    {displayValue?.toString() || '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GenericFormView;
