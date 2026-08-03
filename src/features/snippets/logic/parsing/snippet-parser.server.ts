import {getTSParser} from "@lib/snippets/parsing/parser-factory";
import IParser from "tree-sitter";

export function extractAutoCompleteDisabledRanges(fileContent: string, languageId: string): {startIndex: number; endIndex: number}[] {
  const parser = getTSParser(languageId);

  let parsedCode: IParser.Tree;

  try {
    parsedCode = parser.parse(fileContent);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return [];
  }

  const ranges: {startIndex: number; endIndex: number}[] = [];
  const queue: IParser.SyntaxNode[] = [parsedCode.rootNode];

  while (queue.length > 0) {
    const current = queue.pop();
    if (!current) continue;

    // Rust has distinct comment/lifetime nodes and literals with variable prefixes, so their ranges need separate handling.
    if (languageId === "rust") {
      if (current.type === "line_comment" || current.type === "block_comment" || current.type === "lifetime" || current.type === "loop_label") {
        ranges.push({
          startIndex: current.startIndex,
          endIndex: current.endIndex - 1,
        });
      } else if (current.type === "string_literal" || current.type === "raw_string_literal" || current.type === "char_literal") {
        const delimiter = current.type === "char_literal" ? "'" : '"';
        const actualStartIndex = current.startIndex + current.text.indexOf(delimiter) + 1;
        const actualEndIndex = current.startIndex + current.text.lastIndexOf(delimiter) - 1;

        if (actualStartIndex <= actualEndIndex) {
          ranges.push({
            startIndex: actualStartIndex,
            endIndex: actualEndIndex,
          });
        }
      }
    } else if (current.type === "string" || current.type === "string_literal" || current.type === "comment") {
      if (current.type === "comment") {
        ranges.push({
          startIndex: current.startIndex,
          endIndex: current.endIndex,
        });
      } else {
        const actualStartIndex = current.startIndex + 1;
        const actualEndIndex = current.endIndex - 2;

        if (actualStartIndex <= actualEndIndex) {
          ranges.push({
            startIndex: actualStartIndex,
            endIndex: actualEndIndex,
          });
        }
      }
    }

    for (let i = 0; i < current.namedChildCount; i++) {
      const child = current.namedChild(i);
      if (child) {
        queue.push(child);
      }
    }
  }

  return ranges;
}
