import { EntityManager, IDatabaseDriver, Connection } from '@mikro-orm/core';
import { Session, SessionData } from 'express-session';
import { Request, Response } from 'express';
import { Redis } from 'ioredis';

export type MyContext = {
  em: EntityManager<IDatabaseDriver<Connection>>;
  req: Request & {
    session: Session & Partial<SessionData> & { userId: number };
  };
  res: Response;
  redis: Redis;
};
