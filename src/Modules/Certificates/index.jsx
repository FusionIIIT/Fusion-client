import { lazy, useMemo } from "react";
import { useSelector } from "react-redux";

import { pagesForRole } from "../../ui/nav/roles";
import { ModuleRoutes } from "../../ui/routing/ModuleRoutes";
import { CERTIFICATES_BASE, CERTIFICATE_PAGES } from "./pages";

const COMPONENTS = {
  bonafideCertificate: lazy(() => import("./BonafideCertificate")),
};

export default function Certificates() {
  const role = useSelector((state) => state.user.role);
  const pages = useMemo(() => pagesForRole(CERTIFICATE_PAGES, role), [role]);

  return (
    <ModuleRoutes
      pages={pages}
      components={COMPONENTS}
      basePath={CERTIFICATES_BASE}
      emptyMessage="No certificate pages apply to your role."
    />
  );
}
