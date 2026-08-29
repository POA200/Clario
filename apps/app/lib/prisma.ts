import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const databaseUrl = new URL(process.env.DATABASE_URL!);

const adapter = new PrismaPg({
  host: "13.58.18.166",
  port: 5432,
  database: databaseUrl.pathname.slice(1),
  user: decodeURIComponent(databaseUrl.username),
  password: decodeURIComponent(databaseUrl.password),

  // Neon requires the endpoint ID when connecting by IP.
  options: "endpoint=ep-old-bonus-axux3gv5",

  ssl: {
    rejectUnauthorized: false,
  },

  connectionTimeoutMillis: 10000,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
