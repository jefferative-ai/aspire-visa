import { PrismaClient } from "@/generated/prisma";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

function createPrismaClient() {
  const rawUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  // Strip the "file:" prefix if present, then resolve to absolute path
  const relativePath = rawUrl.startsWith("file:")
    ? rawUrl.slice("file:".length)
    : rawUrl;
  const dbPath = path.isAbsolute(relativePath)
    ? relativePath
    : path.join(process.cwd(), relativePath);
  const adapter = new PrismaBetterSqlite3({ url: dbPath });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  } as ConstructorParameters<typeof PrismaClient>[0]);
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
