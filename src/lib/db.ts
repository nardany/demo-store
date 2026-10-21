import { chmodSync, copyFileSync, existsSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { isEphemeral } from "./runtime";

function databaseUrl() {
  const url = process.env.DATABASE_URL || "file:./dev.db";
  if (!isEphemeral || !url.startsWith("file:")) return url;

  const bundled = path.join(process.cwd(), "prisma", path.basename(url.slice("file:".length)));
  const target = "/tmp/store.db";
  if (!existsSync(target) && existsSync(bundled)) {
    copyFileSync(bundled, target);
    chmodSync(target, 0o644);
  }
  return `file:${target}`;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: databaseUrl(),
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
