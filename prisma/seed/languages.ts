import {ILanguage} from "@/features/shared/types/language";
import {PrismaClient} from "@prisma/client";

export const SUPPORTED_LANGUAGES: ILanguage[] = [
  {
    id: "js",
    name: "JavaScript",
    extensions: ["js", "jsx"],
    highlightAlias: "javascript",
  },
  {
    id: "ts",
    name: "TypeScript",
    extensions: ["ts", "tsx"],
    highlightAlias: "typescript",
  },
  {
    id: "c",
    name: "C",
    extensions: ["c"],
    highlightAlias: "cpp",
  },
  {
    id: "cpp",
    name: "C++",
    extensions: ["cpp"],
    highlightAlias: "cpp",
  },
  {
    id: "cs",
    name: "C#",
    extensions: ["cs"],
    highlightAlias: "csharp",
  },
  {
    id: "java",
    name: "Java",
    extensions: ["java"],
    highlightAlias: "java",
  },
  {
    id: "py",
    name: "Python",
    extensions: ["py"],
    highlightAlias: "python",
  },
  {
    id: "lua",
    name: "Lua",
    extensions: ["lua"],
    highlightAlias: "lua",
  },
  {
    id: "r",
    name: "R",
    extensions: ["r", "R"],
    highlightAlias: "r",
  },
  {
    id: "go",
    name: "Go",
    extensions: ["go"],
    highlightAlias: "go",
  },
  {
    id: "rust",
    name: "Rust",
    extensions: ["rs"],
    highlightAlias: "rust",
  },
];

export async function seedLanguages(prisma: PrismaClient) {
  for (const language of SUPPORTED_LANGUAGES) {
    const languageRecord = await prisma.language.upsert({
      where: {id: language.id},
      update: {
        name: language.name,
        extensions: language.extensions,
        highlightAlias: language.highlightAlias,
      },
      create: {
        id: language.id,
        name: language.name,
        extensions: language.extensions,
        highlightAlias: language.highlightAlias,
      },
    });

    console.log(`Language seeded: ${languageRecord.name}`);
  }
  console.log("Languages seeded successfully.");
}
