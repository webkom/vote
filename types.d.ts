import { HydratedDocument } from 'mongoose';
import { ElectionType, IElectionMethods, IUser } from './app/types/types';

declare global {
  namespace Express {
    // eslint-disable-next-line
    export interface User extends IUser {}
    // Parameters passed between middleware
    export interface Request extends Request {
      election?: HydratedDocument<ElectionType, IElectionMethods>;
    }
  }

  interface Window {
    scanCard?: (cardKey: number) => void;
  }
}
