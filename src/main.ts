import { MineSweeper } from "./mine-sweeper/mine-sweeper";

const canvas = document.querySelector<HTMLCanvasElement>("#app")!;

const mineSweeper = new MineSweeper(canvas);
