import { ECellState } from "./types";

interface IBorderConfig {
  readonly size: number;
  readonly color: string;
}

const BORDER_CONFIG: IBorderConfig = {
  size: 2,
  color: "#000",
};

interface ICellConfig {
  readonly size: number;
  readonly backGround: Record<ECellState, string>;
}

const CELL_CONFIG: ICellConfig = {
  size: 30,
  backGround: {
    [ECellState.Opened]: "lightGray",
    [ECellState.Closed]: "gray",
    [ECellState.Flagged]: "red",
  },
};

interface IMineSweeperConfig {
  readonly cell: ICellConfig;
  readonly border: IBorderConfig;
}

export const CONFIG: IMineSweeperConfig = {
  cell: CELL_CONFIG,
  border: BORDER_CONFIG,
};
