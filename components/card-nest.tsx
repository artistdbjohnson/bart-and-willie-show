import type { ReactNode } from "react";

const PEEK = 12;

export function CardNest({ children }: { children: ReactNode[] }) {
  const count = children.length;

  return (
    <div className="card-nest" style={{ ["--stack-bars" as string]: count }}>
      {children.map((child, index) => (
        <div
          key={index}
          className={index === count - 1 ? "nest-card nest-card-stop" : "nest-card"}
          style={{
            zIndex: index + 1,
            top: `calc(var(--nav-clear) + ${(index + 1) * PEEK}px)`,
            marginBottom: index === count - 1 ? 0 : PEEK,
            scrollSnapAlign: "start",
            scrollSnapStop: "normal",
            scrollMarginTop: `calc(var(--nav-clear) + ${(index + 1) * PEEK}px)`,
          }}
        >
          <div className="nest-face">
            <div className="sheet-edge" aria-hidden="true">
              <span className="sheet-edge-signal" />
            </div>
            <div className="nest-body">{child}</div>
          </div>
        </div>
      ))}
      <div className="nest-release" aria-hidden="true" />
    </div>
  );
}
