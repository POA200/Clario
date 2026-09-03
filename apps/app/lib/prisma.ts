import dns from "dns";
import net from "net";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString =
  process.env.DATABASE_URL ||
  process.env.DIRECT_URL ||
  "postgresql://placeholder:placeholder@localhost:5432/placeholder";

const isLocalOrPlaceholder =
  connectionString.includes("localhost") ||
  connectionString.includes("127.0.0.1") ||
  connectionString.includes("placeholder");

type CustomPoolConfig = NonNullable<ConstructorParameters<typeof Pool>[0]> & {
  stream?: () => net.Socket;
};

const poolConfig: CustomPoolConfig = {
  connectionString,
  ssl: isLocalOrPlaceholder
    ? false
    : {
        rejectUnauthorized: false,
      },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  // Custom stream to force IPv4 connection and avoid Node Happy Eyeballs IPv6 timeout issues
  stream: () => {
    const socket = new net.Socket();
    const origConnect = socket.connect.bind(socket);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.connect = function (port: any, host?: any, connectListener?: any) {
      if (typeof host === "string" && !net.isIP(host)) {
        dns.lookup(host, { family: 4 }, (err, address) => {
          if (err) {
            socket.emit("error", err);
            return;
          }
          origConnect(
            { port, host: address, autoSelectFamily: false },
            connectListener,
          );
        });
        return socket;
      }
      return origConnect(
        { port, host, autoSelectFamily: false },
        connectListener,
      );
    };
    return socket;
  },
};

const pool = new Pool(poolConfig);

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

globalForPrisma.prisma = prisma;