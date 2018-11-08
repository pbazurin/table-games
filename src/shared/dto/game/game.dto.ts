import { GameType } from './game-type.enum';

export interface GameDto {
  id: string;
  type: GameType;
  userIds: string[];
  authorUserId: string;
  createdOn: Date;
}
