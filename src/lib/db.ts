import fs from "fs";
import path from "path";
import { PrismaClient } from "@/generated/prisma";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

function getWritableSqlitePath(rawUrl: string) {
  const relativePath = rawUrl.startsWith("file:") ? rawUrl.slice("file:".length) : rawUrl;
  const isAbsolutePath = path.isAbsolute(relativePath);
  const localPath = isAbsolutePath ? relativePath : path.join(process.cwd(), relativePath);

  if (process.env.VERCEL && !process.env.DATABASE_URL) {
    const tempPath = path.join("/tmp", "aspire-visa-pro.db");
    if (!fs.existsSync(tempPath)) {
      fs.mkdirSync(path.dirname(tempPath), { recursive: true });
      fs.copyFileSync(localPath, tempPath);
      fs.chmodSync(tempPath, 0o666);
    }
    return tempPath;
  }

  return localPath;
}

function createPrismaClient() {
  const rawUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const dbPath = getWritableSqlitePath(rawUrl);

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
