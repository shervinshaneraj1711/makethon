import { connectionLabel, formatTimestamp } from "../format";
import type { ConnectionSnapshot } from "../types";

export function ConnectionBanner({ connection }: { connection: ConnectionSnapshot }) {
  return (
    <section className={`connection-banner state-${connection.state}`} aria-live="polite">
      <div className="connection-primary">
        <span className="status-pulse" aria-hidden="true" />
        <div>
          <span className="eyebrow">Bluetooth link</span>
          <strong>{connectionLabel(connection.state)}</strong>
        </div>
      </div>
      <p>{connection.detail}</p>
      <dl>
        <div>
          <dt>Source</dt>
          <dd>{connection.port ?? connection.transport}</dd>
        </div>
        <div>
          <dt>Last update</dt>
          <dd>{formatTimestamp(connection.last_update_at)}</dd>
        </div>
      </dl>
    </section>
  );
}

