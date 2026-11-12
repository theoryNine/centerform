/** Renders text with `\n` as line breaks. Put it inside the element that styles the text. */
export function Multiline({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => (
        <span key={i}>
          {i > 0 && <br />}
          {line}
        </span>
      ))}
    </>
  );
}
