import katex from "katex";
// KaTeX runs with trust disabled; normal text is escaped by React.
export function MathText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g).map((part, index) => {
        const display = part.startsWith("$$") && part.endsWith("$$");
        const inline = !display && part.startsWith("$") && part.endsWith("$");
        if (!display && !inline) return <span key={index}>{part}</span>;
        const expression = part.slice(display ? 2 : 1, display ? -2 : -1);
        return (
          <span
            key={index}
            dangerouslySetInnerHTML={{
              __html: katex.renderToString(expression, {
                displayMode: display,
                throwOnError: false,
                trust: false,
                strict: "warn",
              }),
            }}
          />
        );
      })}
    </>
  );
}
