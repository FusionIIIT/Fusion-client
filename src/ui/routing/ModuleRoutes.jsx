import { Suspense, useEffect } from "react";
import { Center, Loader, Text } from "@mantine/core";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";

import { DesktopOnly } from "../components/DesktopOnly";
import { ModulePage } from "../components/ModulePage";
import { setActiveTab_ } from "../../redux/moduleslice";

function PageFrame({ page, children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setActiveTab_(page.title));
  }, [dispatch, page.title]);

  return (
    <ModulePage title={page.title}>
      {page.desktopOnly ? (
        <DesktopOnly title={page.title}>{children}</DesktopOnly>
      ) : (
        children
      )}
    </ModulePage>
  );
}

PageFrame.propTypes = {
  page: PropTypes.shape({
    title: PropTypes.string.isRequired,
    desktopOnly: PropTypes.bool,
  }).isRequired,
  children: PropTypes.node.isRequired,
};

export function ModuleRoutes({
  pages,
  components,
  emptyMessage,
  basePath = null,
  extraRoutes = null,
  renderPage = null,
}) {
  if (!pages.length) {
    return (
      <Center mt="xl">
        <Text c="dimmed" ta="center">
          {emptyMessage}
        </Text>
      </Center>
    );
  }

  const first = basePath ? `${basePath}/${pages[0].slug}` : pages[0].slug;

  return (
    <Suspense
      fallback={
        <Center py="xl">
          <Loader size="sm" />
        </Center>
      }
    >
      <Routes>
        <Route index element={<Navigate to={first} replace />} />
        {pages.map((page) => {
          const Component = components[page.key];
          if (!Component) return null;
          return (
            <Route
              key={page.key}
              path={page.slug}
              element={
                <PageFrame page={page}>
                  {renderPage ? renderPage(Component, page) : <Component />}
                </PageFrame>
              }
            />
          );
        })}
        {extraRoutes}
        <Route path="*" element={<Navigate to={first} replace />} />
      </Routes>
    </Suspense>
  );
}

ModuleRoutes.propTypes = {
  pages: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
    }),
  ).isRequired,
  components: PropTypes.objectOf(PropTypes.elementType).isRequired,
  emptyMessage: PropTypes.string.isRequired,
  basePath: PropTypes.string,
  extraRoutes: PropTypes.node,
  renderPage: PropTypes.func,
};

export default ModuleRoutes;
