import type { ReactNode } from "react";

const PEEK = 12;

export function CardNest({ children }: { children: ReactNode[] }) {
  const count = children.length;
  return (
    <div className="card-nest">
      {children.map((child, index) => (
        <div
          key={index}
          className="nest-card"
          style={{
            zIndex: index + 1,
            top: `calc(var(--nav-clear) + ${(index + 1) * PEEK}px)`,
            marginBottom: index === count - 1 ? 0 : PEEK,
          }}
        >
          <div className="sheet-edge" aria-hidden="true">
            <span className="sheet-edge-signal" />
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">{child}</div>
        </div>
      ))}
    </div>
  );
}
