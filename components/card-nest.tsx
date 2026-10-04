import type { ReactNode } from "react";

export function CardNest({ children }: { children: ReactNode[] }) {
  return (
    <div className="card-nest">
      {children.map((child, index) => (
        <div key={index} className="nest-card">
          <div className="nest-face">
            <div className="sheet-edge" aria-hidden="true">
              <span className="sheet-edge-signal" />
            </div>
            <div className="nest-body">{child}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
