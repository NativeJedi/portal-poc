import {
  Component,
  Fragment,
  lazy,
  Suspense,
  useSyncExternalStore,
  type ComponentType,
  type ReactNode,
} from "react";
import { pickRecovery, RemoteLoadError, type Recovery } from "./recovery";

type RemoteModule<P> = { default: ComponentType<P> };

export type RemoteBoundaryProps<P extends object> = {
  /** Remote module id, e.g. "cad/App". Also the cache key, so `load` may be an inline arrow. */
  name: string;
  /** Usually `() => import("remoteName/Module")`. */
  load: () => Promise<RemoteModule<P>>;
  /** Shown while the remote is loading. */
  fallback?: ReactNode;
  /** Props passed to the remote component. */
  props?: P;
};

// FR-16: one lazy component per remote id, for the whole page. A new `lazy()` on every render would suspend forever.
// A failed load stays cached here too. That is fine: the only recovery for it is a page reload (see recovery.ts).
const lazyCache = new Map<string, ComponentType<any>>();

function getLazy<P extends object>(name: string, load: () => Promise<RemoteModule<P>>): ComponentType<P> {
  let Remote = lazyCache.get(name);
  if (!Remote) {
    Remote = lazy(() =>
      load().catch((error: unknown) => {
        throw new RemoteLoadError(name, error);
      }),
    );
    lazyCache.set(name, Remote);
  }
  return Remote;
}

// FR-16: loads any remote React component, shows `fallback` while loading, and catches load and render errors
export function RemoteBoundary<P extends object>({ name, load, fallback = null, props }: RemoteBoundaryProps<P>) {
  const Remote = getLazy(name, load);
  return (
    <RemoteErrorBoundary name={name}>
      <Suspense fallback={fallback}>
        <Remote {...(props as P)} />
      </Suspense>
    </RemoteErrorBoundary>
  );
}

type BoundaryState = {
  error: unknown;
  failedAt: number;
  lastRemountAt?: number;
  // the children's key: bumping it throws away the crashed subtree, including its state
  attempt: number;
};

class RemoteErrorBoundary extends Component<{ name: string; children: ReactNode }, BoundaryState> {
  state: BoundaryState = { error: null, failedAt: 0, attempt: 0 };

  static getDerivedStateFromError(error: unknown): Partial<BoundaryState> {
    return { error, failedAt: Date.now() };
  }

  componentDidUpdate(prev: { name: string }) {
    // a different remote under the same boundary starts clean
    if (prev.name !== this.props.name && this.state.error) {
      this.setState({ error: null, lastRemountAt: undefined });
    }
  }

  private retry = (recovery: Recovery) => {
    if (recovery === "reload-page") {
      window.location.reload();
      return;
    }
    this.setState(({ attempt }) => ({ error: null, lastRemountAt: Date.now(), attempt: attempt + 1 }));
  };

  render() {
    const { error, failedAt, lastRemountAt, attempt } = this.state;
    if (error) {
      return (
        <RemoteErrorPanel
          name={this.props.name}
          error={error}
          recovery={pickRecovery(error, failedAt, lastRemountAt)}
          onRetry={this.retry}
        />
      );
    }
    return <Fragment key={attempt}>{this.props.children}</Fragment>;
  }
}

function subscribeOnline(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

const useOnline = () => useSyncExternalStore(subscribeOnline, () => navigator.onLine);

const LABELS: Record<Recovery, string> = { remount: "Retry", "reload-page": "Reload page" };

function RemoteErrorPanel(props: {
  name: string;
  error: unknown;
  recovery: Recovery;
  onRetry: (recovery: Recovery) => void;
}) {
  const { name, error, recovery, onRetry } = props;
  const online = useOnline();
  // reloading while offline only swaps our error for the browser's one
  const blocked = recovery === "reload-page" && !online;

  return (
    <div role="alert" style={{ border: "2px dashed crimson", padding: 8 }}>
      <b>"{name}" is unavailable.</b>
      <div style={{ fontSize: 12, opacity: 0.8 }}>{error instanceof Error ? error.message : String(error)}</div>
      <button onClick={() => onRetry(recovery)} disabled={blocked}>
        {LABELS[recovery]}
      </button>
      {blocked && <span> No connection. You can retry when you are back online.</span>}
    </div>
  );
}
