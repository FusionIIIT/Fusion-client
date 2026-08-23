export function flattenNavLinks(groups) {
  return groups.flatMap((g) =>
    g.items.flatMap((item) => {
      if (item.links) {
        return item.links.map((l) => ({
          ...l,
          parent: item.label,
          section: g.section,
          nested: true,
        }));
      }
      return item.to
        ? [
            {
              code: item.code,
              label: item.label,
              icon: item.icon,
              to: item.to,
              parent: g.section,
              section: g.section,
              nested: false,
            },
          ]
        : [];
    }),
  );
}

export function findActiveLink(groups, activePath) {
  let best = null;
  flattenNavLinks(groups).forEach((link) => {
    if (activePath !== link.to && !activePath.startsWith(`${link.to}/`)) return;
    if (!best || link.to.length > best.to.length) best = link;
  });
  return best;
}

export function findActiveGroupCode(groups, activePath) {
  const match = findActiveLink(groups, activePath);
  if (!match) return null;
  const owner = groups
    .flatMap((g) => g.items)
    .find((item) => item.links?.some((l) => l.to === match.to));
  return owner?.code ?? null;
}

export function findActiveModuleLabel(groups, activePath) {
  const match = findActiveLink(groups, activePath);
  if (!match) return null;
  return match.nested ? match.section : match.label;
}
