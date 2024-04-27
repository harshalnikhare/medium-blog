export interface UserId {
  id: string;
}

export type HonoEnv = {
  Bindings: { DATABASE_URL: string; JWT_SECRET: string };
  Variables: { user: UserId };
};
