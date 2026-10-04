type Block =
  | { type: "p"; text: string }
  | { type: "quote"; text: string; by: string; translation?: string };

export function ProseBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="mt-6 space-y-5 font-serif text-lg leading-relaxed text-chalk/88">
      {blocks.map((block, index) =>
        block.type === "p" ? (
          <p key={index}>{block.text}</p>
        ) : (
          <figure key={index} className="border-l border-signal pl-4">
            <blockquote className="text-xl leading-snug text-chalk">“{block.text}”</blockquote>
            <figcaption className="mt-3 font-ui text-[0.66rem] uppercase tracking-[0.16em] text-quiet">
              {block.by}
            </figcaption>
            {block.translation ? (
              <p className="mt-3 text-base text-chalk/75">{block.translation}</p>
            ) : null}
          </figure>
        ),
      )}
    </div>
  );
}
