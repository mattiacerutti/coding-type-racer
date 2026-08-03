import type {NextConfig} from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/game",
        permanent: false,
      },
    ];
  },
  reactCompiler: true,
  serverExternalPackages: [
    "tree-sitter",
    "tree-sitter-javascript",
    "tree-sitter-typescript/typescript",
    "tree-sitter-go",
    "tree-sitter-rust",
    "tree-sitter-c",
    "tree-sitter-cpp",
    "tree-sitter-c-sharp",
    "tree-sitter-java",
    "tree-sitter-python",
    "tree-sitter-lua",
    "tree-sitter-compat",
    "@davisvaughan/tree-sitter-r",
  ],
};

export default nextConfig;
