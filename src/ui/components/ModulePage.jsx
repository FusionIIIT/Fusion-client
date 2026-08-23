import { Container } from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import PropTypes from "prop-types";

import { PageHeader } from "./PageHeader";
import { pageTitle } from "../../lib/pageTitle";

export function ModulePage({
  title,
  subtitle = undefined,
  action = undefined,
  children,
}) {
  useDocumentTitle(pageTitle(title));

  return (
    <Container size="xl" px={0}>
      <PageHeader title={title} subtitle={subtitle} action={action} />
      {children}
    </Container>
  );
}

ModulePage.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  action: PropTypes.node,
  children: PropTypes.node.isRequired,
};

export default ModulePage;
