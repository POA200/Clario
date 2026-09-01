declare module "pg" {
  export class Pool {
    constructor(config?: {
      connectionString?: string;
      user?: string;
      password?: string;
      host?: string;
      port?: number;
      database?: string;
      ssl?: boolean | { rejectUnauthorized?: boolean; ca?: string; key?: string; cert?: string };
      max?: number;
      min?: number;
      idleTimeoutMillis?: number;
      connectionTimeoutMillis?: number;
      family?: number;
    });
    query(text: string, params?: any[]): Promise<any>;
    end(): Promise<void>;
  }
}

