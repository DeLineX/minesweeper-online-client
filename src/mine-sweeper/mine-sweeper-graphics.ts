import { ECellState, TCell } from "./types";

export interface MineSweeperGraphicsOptions {
  cellSize?: number;
  borderSize?: number;
}

export class MineSweeperGraphics {
  private cellSize: number;
  private borderSize: number;
  private readonly HEIGHT: number;
  private readonly WIDTH: number;

  private readonly COLORS = {
    CellBg: "lightGray",
    Border: "gray",
  } as const;

  constructor(
    private ctx: CanvasRenderingContext2D,
    private field: TCell[][],
    { cellSize = 40, borderSize = 10 }: MineSweeperGraphicsOptions = {}
  ) {
    this.cellSize = cellSize;
    this.borderSize = borderSize;
    this.HEIGHT = 10;
    this.WIDTH = 10;
  }

  private resetCtxColor() {
    this.ctx.fillStyle = "";
    this.ctx.strokeStyle = "";
  }

  private setFillStyle(color: keyof typeof this.COLORS) {
    this.ctx.fillStyle = this.COLORS[color];
  }

  private setStrokeStyle(color: keyof typeof this.COLORS) {
    this.ctx.strokeStyle = this.COLORS[color];
  }

  private renderCell(y: number, x: number) {
    // const cell = this.field[y][x];

    // switch (cell.state) {
    // case ECellState.Closed:
    this.setFillStyle("CellBg");
    this.ctx.fillRect(
      x * this.cellSize + (x + 1) * this.borderSize,
      y * this.cellSize + (y + 1) * this.borderSize,
      this.cellSize,
      this.cellSize
    );
    // break;
    // }

    this.resetCtxColor();
  }

  private renderBorder(x1: number, y1: number, x2: number, y2: number) {
    this.setFillStyle("Border");
    this.ctx.beginPath();
    this.ctx.lineWidth = this.borderSize;
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.closePath();
    this.ctx.stroke();

    this.resetCtxColor();
  }

  public render() {
    this.ctx.clearRect(0, 0, 900, 900);

    for (let i = 0; i < this.HEIGHT; i++) {
      for (let j = 0; j < this.WIDTH; j++) {
        this.renderCell(i, j);
      }
    }
    for (let i = 0; i < this.HEIGHT + 1; i++) {
      const curOffset =
        this.borderSize / 2 + i * (this.cellSize + this.borderSize);
      console.log(curOffset);
      this.renderBorder(
        0,
        curOffset,
        this.borderSize +
          this.cellSize * this.WIDTH +
          this.WIDTH * this.borderSize,
        curOffset
      );

      this.renderBorder(
        curOffset,
        0,
        curOffset,
        this.borderSize +
          this.cellSize * this.HEIGHT +
          this.HEIGHT * this.borderSize
      );
    }
  }

  public calculateCellByCoords(point: { x: number; y: number }) {
    const cellWithBorder = this.cellSize + this.borderSize;
    console.log(point.x, point.y, cellWithBorder);
    const x = point.x / cellWithBorder;
    const y = point.y / cellWithBorder;
    return { x, y };
  }
}
