import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not configured");
}

const url = new URL(databaseUrl);

const adapter = new PrismaPg({
  host: "18.226.241.3",
  port: Number(url.port) || 5432,
  database: url.pathname.slice(1),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  options: "endpoint=ep-old-bonus-axux3gv5",
  ssl: {
    rejectUnauthorized: false,
    servername: "ep-old-bonus-axux3gv5.c-4.us-east-2.aws.neon.tech",
  },
  connectionTimeoutMillis: 20000,
  idleTimeoutMillis: 60000,
  max: 20,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}