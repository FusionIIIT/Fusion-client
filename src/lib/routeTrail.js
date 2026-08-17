import { matchPath } from "react-router-dom";

const relativeTo = (base, pathname) =>
  pathname.startsWith(base) ? pathname.slice(base.length) || "/" : pathname;

export const sidebarPageFor = (pathname, { base, pages }) => {
  const relative = relativeTo(base, pathname);
  return pages.find((page) =>
    matchPath({ path: `/${page.slug}`, end: true }, relative),
  );
};

export const trailFor = (pathname, { base, pages, trails }) => {
  const relative = relativeTo(base, pathname);

  if (sidebarPageFor(pathname, { base, pages })) return [];

  const match = Object.entries(trails).find(([pattern]) =>
    matchPath({ path: pattern, end: true }, relative),
  );
  if (!match) return [];

  const [, { title, parent }] = match;
  const parentPage = pages.find((page) => page.title === parent);

  return [
    ...(parentPage
      ? [{ label: parentPage.title, to: `${base}/${parentPage.slug}` }]
      : []),
    { label: title },
  ];
};

export default trailFor;
