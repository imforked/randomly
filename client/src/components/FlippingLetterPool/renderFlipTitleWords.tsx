import type { ReactNode } from "react";

export type FlipCharRenderer = (
  ch: string,
  charIndex: number,
  key: string
) => ReactNode;

/** Groups flip glyphs into words so wrapped lines break on spaces, not mid-word. */
export function renderFlipTitleWords(
  text: string,
  renderChar: FlipCharRenderer
): ReactNode[] {
  const nodes: ReactNode[] = [];
  let wordStart = 0;
  let i = 0;

  while (i <= text.length) {
    if (i === text.length || text[i] === " ") {
      if (wordStart < i) {
        const word = text.slice(wordStart, i);
        nodes.push(
          <span key={`w-${wordStart}`} className="flip-word">
            {[...word].map((ch, j) =>
              renderChar(ch, wordStart + j, `${wordStart + j}-${ch}`)
            )}
          </span>
        );
      }

      if (i < text.length) {
        nodes.push(
          <span key={`${i}-space`} className="flip-space">
            {"\u00A0"}
          </span>
        );
        i += 1;
        wordStart = i;
      } else {
        break;
      }
    } else {
      i += 1;
    }
  }

  return nodes;
}
