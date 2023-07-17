import { ECellState } from "./types";

interface IBorderConfig {
  size: number;
  color: string;
}

const BORDER_CONFIG: IBorderConfig = {
  size: 2,
  color: "#000",
};

interface ICellConfig {
  size: number;
  backGround: Record<ECellState, string>;
}

const CELL_CONFIG: ICellConfig = {
  size: 32,
  backGround: {
    [ECellState.Opened]: "lightGray",
    [ECellState.Closed]: "gray",
    [ECellState.Flagged]: "red",
  },
};

interface IMineSweeperConfig {
  cell: ICellConfig;
  border: IBorderConfig;
  topControls: {
    size: number;
  };
}

export const CONFIG: IMineSweeperConfig = {
  cell: CELL_CONFIG,
  border: BORDER_CONFIG,
  topControls: {
    size: 30,
  },
};
