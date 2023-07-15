import { MineSweeper } from "./mine-sweeper";

const canvas = document.querySelector<HTMLCanvasElement>("#app")!;

const mineSweeper = new MineSweeper(canvas);
