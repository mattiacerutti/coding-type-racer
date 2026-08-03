import {ILanguage} from "@/features/shared/types/language";
import {Prisma, PrismaClient} from "@prisma/client";
import {callGitHubApi} from "@lib/github";
import {SUPPORTED_LANGUAGES} from "./languages";

const PER_PAGE = 100;
const MIN_FILE_SIZE = 3000;
const MAX_ATTEMPTS = 3;

interface FileMetadata {
  repository: string;
  path: string;
  commit: string;
  sha: string;
}

interface GitHubSearchResponse {
  items?: {
    repository: {full_name: string};
    path: string;
    url: string;
    sha: string;
  }[];
}

export async function seedFiles(prisma: PrismaClient) {
  console.log("Seeding files for supported languages...");
  const languages = await prisma.language.findMany({
    select: {
      id: true,
      _count: {select: {trackedFiles: true}},
    },
  });

  if (languages.length === 0) {
    throw new Error("Language table is empty. Run the base seed first: ts-node prisma/seed.ts");
  }

  const missingLanguageIds = languages.filter((language) => language._count.trackedFiles === 0).map((language) => language.id);

  if (missingLanguageIds.length === 0) {
    console.log("All languages already have snippets.");
    return;
  }

  console.log(`Seeding snippets for missing languages: ${missingLanguageIds.join(", ")}`);

  for (const languageId of missingLanguageIds) {
    await seedFilesForLanguage(prisma, languageId);
  }

  console.log("Finished seeding files for all missing languages.");
}

async function seedFilesForLanguage(prisma: PrismaClient, languageId: string) {
  const language = SUPPORTED_LANGUAGES.find((lang) => lang.id === languageId);
  if (!language) {
    throw new Error(`Language with ID ${languageId} is not supported.`);
  }

  console.log(`Fetching files for language: ${language.name}`);
  const files = await getFilesForLanguage(language);

  for (const file of files) {
    const insertedFile = await prisma.file
      .create({
        data: {
          repository: file.repository,
          path: file.path,
          languageId: language.id,
        },
      })
      .catch((error) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          console.warn(`Skipping duplicate file: ${file.repository}/${file.path}`);
          return null;
        }
        throw error;
      });

    if (!insertedFile) continue;

    await prisma.fileVersion.create({
      data: {
        sha: file.sha,
        commit: file.commit,
        fileId: insertedFile.id,
      },
    });
  }

  console.log(`Seeded ${files.length} files for language: ${language.name}`);
}

async function getFilesForLanguage(language: ILanguage, {pagesPerLanguage = 10}: {pagesPerLanguage?: number} = {}): Promise<FileMetadata[]> {
  const files = [];
  for (let page = 1; page <= pagesPerLanguage; page += 1) {
    try {
      const pageFiles = await fetchFilesFromGithub(language, page);
      files.push(...pageFiles);
    } catch (error) {
      throw new Error(`Error fetching files for ${language.name} on page ${page}: ${error}`);
    }
  }

  return files;
}

async function fetchFilesFromGithub(language: ILanguage, page: number): Promise<FileMetadata[]> {
  const extensionsFilter = language.extensions.map((ext) => `extension:${ext}`).join(" ");

  const response = await callGitHubApi("/search/code", {
    params: {
      q: `language:${language.name} size:>${MIN_FILE_SIZE} ${extensionsFilter}`,
      page: page.toString(),
      per_page: PER_PAGE.toString(),
    },
    maxAttempts: MAX_ATTEMPTS,
    shouldRetry: async ({response, attempt, maxAttempts}) => {
      const data = (await response.json()) as GitHubSearchResponse;
      const items = data.items ?? [];

      if (items.length === 0) {
        console.warn(`No files returned for ${language.name} on page ${page} (attempt ${attempt}/${maxAttempts}). Retrying...`);
        return true;
      }

      return false;
    },
  });

  const data = (await response.json()) as GitHubSearchResponse;
  const items = data.items ?? [];

  if (items.length === 0) {
    throw new Error(`No files returned for ${language.name} on page ${page} after ${MAX_ATTEMPTS} attempts.`);
  }

  console.info(`Fetched ${items.length} files for ${language.name} on page ${page}.`);
  return items.map((item) => ({
    repository: item.repository.full_name,
    path: item.path,
    commit: item.url.split("?ref=")[1],
    sha: item.sha,
  }));
}
