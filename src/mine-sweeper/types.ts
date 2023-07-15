import { IRenderElement } from "../graphics";
import { ICellIndex } from "../types";

export type TCellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | "X";

export enum ECellState {
  Closed,
  Opened,
  Flagged,
}

export type TCell =
  | {
      state: ECellState.Opened;
      value: TCellValue;
    }
  | {
      state: Exclude<ECellState, ECellState.Opened>;
    };

export type TCellWithMeta = TCell & { cellIndex: ICellIndex };

export type TRenderCell = IRenderElement<ICellIndex>;

export interface IGameEndedState {
  type: "ended";
  status: "won" | "lost";
  secondsLeft: number;
}

export interface IFieldUpdateRes {
  updatedCells: TCellWithMeta[];
  gameState?: IGameEndedState;
}
