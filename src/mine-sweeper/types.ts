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

export type TGameStateType = "started" | "ended";

export interface IGameStateBase {
  type: TGameStateType;
}

export interface IGameStartedState extends IGameStateBase {
  type: "started";
}

export interface IGameEndedState extends IGameStateBase {
  type: "ended";
  status: "won" | "lose";
  secondsLeft: number;
}

export type TGameState = IGameStartedState | IGameEndedState;

export interface IFieldLoadRes {
  width: number;
  height: number;
  updatedCells: TCellWithMeta[];
  gameState: TGameState;
  flagsCount: number;
  minesCount: number;
}

export interface IFieldUpdateRes
  extends Pick<IFieldLoadRes, "updatedCells">,
    Partial<Pick<IFieldLoadRes, "flagsCount" | "gameState">> {}
