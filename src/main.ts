import { MineSweeper } from "./mine-sweeper";

const canvas = document.querySelector<HTMLCanvasElement>("#app")!;

new MineSweeper(canvas);
