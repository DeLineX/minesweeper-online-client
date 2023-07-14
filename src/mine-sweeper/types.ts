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

export type TCellWithMeta = TCell & { cellIndex: CellIndex };

export interface CellIndex {
  x: number;
  y: number;
}

export interface IRenderElement<
  Data extends Record<string, any> = Record<string, any>
> {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;

  data?: Data;
  hidden?: boolean;
  onClick?: (element: IRenderElement<Data>, e: MouseEvent) => void;

  bgColor?: string;
  border?: {
    color?: string;
    size?: number;
  };
  text?: {
    value: string | number;
    font?: string;
    color?: string;
    offset?: CellIndex;
    maxWidth?: number;
    align?: CanvasRenderingContext2D["textAlign"];
    baseline?: CanvasRenderingContext2D["textBaseline"];
  };
}
