import type { ReactNode } from "react";

export function CardNest({ children }: { children: ReactNode[] }) {
  const last = children.length - 1;
  const face = (child: ReactNode) => (
    <div className="nest-face">
      <div className="sheet-edge" aria-hidden="true">
        <span className="sheet-edge-signal" />
      </div>
      <div className="nest-body">{child}</div>
    </div>
  );

  return (
    <div className="card-nest">
      <div className="nest-stack">
        {children.slice(0, Math.max(last, 0)).map((child, index) => (
          <div key={index} className="nest-card" style={{ zIndex: index + 1 }}>
            {face(child)}
          </div>
        ))}
      </div>
      {last >= 0 ? <div className="nest-card nest-card-stop">{face(children[last])}</div> : null}
    </div>
  );
}
