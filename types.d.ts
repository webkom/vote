import { IUser } from './app/types/types';

declare global {
  namespace Express {
    // eslint-disable-next-line
    export interface User extends IUser {}
  }
}
