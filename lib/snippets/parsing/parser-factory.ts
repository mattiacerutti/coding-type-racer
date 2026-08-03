import Parser from "tree-sitter";
import JavaScript from "tree-sitter-javascript";

// @ts-expect-error tree-sitter packages have no types
import TypeScript from "tree-sitter-typescript/typescript";
// @ts-expect-error tree-sitter packages have no types
import C from "tree-sitter-c";
// @ts-expect-error tree-sitter packages have no types
import Cpp from "tree-sitter-cpp";
import CSharp from "tree-sitter-c-sharp";
import Java from "tree-sitter-java";
// @ts-expect-error tree-sitter packages have no types
import Python from "tree-sitter-python";
// @ts-expect-error tree-sitter packages have no types
import Lua from "tree-sitter-lua";
import R from "@davisvaughan/tree-sitter-r";
// @ts-expect-error tree-sitter packages have no types
import Go from "tree-sitter-go";
// @ts-expect-error tree-sitter packages have no types
import Rust from "tree-sitter-rust";
import {convertLanguage} from "tree-sitter-compat";

export function getTSParser(languageId: string): Parser {
  const parser = new Parser();

  const languageName = getLanguage(languageId);

  parser.setLanguage(convertLanguage(languageName));

  return parser;
}

function getLanguage(languageId: string) {
  switch (languageId) {
    case "js":
      return JavaScript;
    case "ts":
      return TypeScript;
    case "c":
      return C;
    case "cpp":
      return Cpp;
    case "cs":
      return CSharp;
    case "java":
      return Java;
    case "py":
      return Python;
    case "lua":
      return Lua;
    case "r":
      return R;
    case "go":
      return Go;
    case "rust":
      return Rust;
    default:
      throw new Error(`Language ${languageId} not supported.`);
  }
}
