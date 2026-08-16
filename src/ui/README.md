# `src/ui`, `src/lib`, `src/app`

The architected surface. `npm run lint:strict` gates these paths in CI and must
stay at zero errors.

| Path | Holds | Rule |
|---|---|---|
| `src/lib` | Framework-agnostic logic (`credits`, `errors`) | No React, no module imports. Anything two modules share lands here. |
| `src/ui/theme` | Mantine theme + `BRAND` | Ported from Fusion-Integrated. Change it there and here together. |
| `src/ui/icons.js` | The icon registry | One library (Phosphor). Named imports only. Nav metadata references icons by string. |
| `src/ui/layout` | `AppShellLayout`, `BottomNav` | Presentational. No redux, no router, no data fetching. |
| `src/ui/components` | Shared primitives | `ModulePage`, `PageHeader`, `DataTable`, `FormModal`, `FormSection`, `StatusBadge`, `ErrorState`. |
| `src/ui/nav` | Nav tree construction | Pure functions over page manifests. No component imports. |
| `src/ui/routing` | `ModuleRoutes` | The one place routes are generated. Modules never hand-roll `<Routes>`. |
| `src/app` | App-level wiring | `AppLayout` binds redux + router to `AppShellLayout`. |

## Adding a page to a module

1. Add an entry to that module's `pages.js`: `key`, `slug`, `title`, `icon`,
   `group`, `roles`.
2. Add `key: lazy(() => import("./YourPage"))` to the module's `COMPONENTS` map.

The route, the sidebar link and the page frame all follow. A `key` present in one
list and not the other is the only way to break this, so keep them in step.

## Constraints worth keeping

- Icons are strings in manifests, resolved via `resolveIcon` — manifests stay
  free of JSX so the nav tree can be unit-tested.
- `pages.js` files import nothing but `roles`.
- Colour lives in the theme or a CSS module, not in `style={{}}`.
- Every page is `lazy()`. `vite.config.js` currently inlines dynamic imports on
  purpose (see the comment there); the split is ready the moment that is lifted.
