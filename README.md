# portal-poc: nested Module Federation spike

Spike for [docs/requirements.md](docs/requirements.md): the shell loads App Hub, and App Hub loads CAD.
The shell knows nothing about CAD. Result: [docs/spike-result.md](docs/spike-result.md).

| App | Port | Border | Role |
|---|---|---|---|
| `apps/shell` | 5170 | red | host. Owns Router, QueryClient, Auth, Layout |
| `apps/app-hub` | 5174 | yellow | remote for shell + host for CAD |
| `apps/cad` | 5175 | green | leaf remote |
| `packages/contracts` | — | — | Auth/Layout contexts + hooks (MF-shared singleton) |
| `packages/remote-boundary` | — | — | `RemoteBoundary`: lazy remote + fallback + ErrorBoundary with one smart retry button (FR-16) |

## Run

```bash
pnpm install
```

```bash
pnpm dev:all
```

```bash
pnpm preview:all
```

Open http://localhost:5170/app-hub/cad and filter the console by `[mf-check]`.

Remotes have no router of their own and are not meant to be opened directly.

## Configuration

Every app reads its URLs from its own `.env`: `VITE_SHELL_URL`, `VITE_APP_HUB_URL`, `VITE_CAD_URL`, and `VITE_MF_DEBUG`.
App Hub also has `VITE_CAD_LOADER=static|runtime` (FR-15). It can be overridden from the shell:

```bash
VITE_CAD_LOADER=runtime pnpm dev:all
```

## Finding a requirement in code

Every requirement is tagged in a comment. Search for its ID:

```bash
grep -rn "FR-11" apps packages --include=*.ts --include=*.tsx
```
