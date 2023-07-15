import { Graphics, IRenderElement } from "../graphics";
import { CONFIG } from "./config";
import { ECellState, TCell, TCellWithMeta, TRenderCell } from "./types";
import { io } from "socket.io-client";

export class MineSweeper {
  private _graphics: Graphics;
  private _field: TCell[][] = [];
  // private controls: IElement;
  private _socket = io("http://localhost:3000/");

  constructor(canvas: HTMLCanvasElement) {
    this._graphics = new Graphics(canvas);

    this._socket.on("field:loaded", (field: TCell[][]) => {
      this._field = field;

      const elements: IRenderElement[] = [];

      for (let i = 0; i < this._field.length; i++) {
        for (let j = 0; j < this._field[i].length; j++) {
          const cell = this._field[i][j];
          elements.push(
            this.processCell({ ...cell, cellIndex: { x: j, y: i } })
          );
        }
      }

      this._graphics.elements = elements;
    });

    const fieldUpdateHandler = (data: TCellWithMeta[]) => {
      for (const {
        cellIndex: { x, y },
        ...cell
      } of data) {
        this._field[y][x] = cell;
      }
      const elements: IRenderElement[] = [];

      for (let i = 0; i < this._field.length; i++) {
        for (let j = 0; j < this._field[i].length; j++) {
          const cell = this._field[i][j];
          this.processCell({ ...cell, cellIndex: { x: j, y: i } });
        }
      }

      this._graphics.elements = elements;
    };

    this._socket.on("field:update", fieldUpdateHandler);

    this._socket.on("game:over", (timeout: number) => {
      console.log("over");
      this._socket.off("field:update", fieldUpdateHandler);
      const elements = [...this._graphics.elements];
      elements.push({
        height: 50,
        width: 350,
        x: canvas.width / 2 - 175,
        y: canvas.height / 2 - 25,
        z: 10,
        border: {
          color: "red",
        },
        bgColor: "lightgray",
        text: {
          value: "Игра окончена",
          font: "40px sans-serif",
          color: "#000",
          offset: {
            x: 175,
            y: 27,
          },
        },
      });

      const restartEl = {
        height: 50,
        width: 350,
        x: canvas.width / 2 - 175,
        y: canvas.height / 2 - 25 + 70,
        z: 10,
        border: {
          color: "red",
        },
        bgColor: "lightgray",
        text: {
          value: `Рестарт через ${timeout}`,
          font: "40px sans-serif",
          color: "#000",
          offset: {
            x: 175,
            y: 27,
          },
        },
      } satisfies IRenderElement;

      elements.push(restartEl);

      let secondsLeft = timeout;
      const restartInt = setInterval(() => {
        restartEl.text.value = `Рестарт через ${--secondsLeft}`;
        this._graphics.elements = elements;

        if (secondsLeft === 0) {
          clearInterval(restartInt);
          this._socket.on("field:update", fieldUpdateHandler);
        }
      }, 1000);

      this._graphics.elements = elements;
    });
  }

  private processCell({
    cellIndex: { x, y },
    ...cell
  }: TCellWithMeta): TRenderCell {
    const CELL_CONFIG = CONFIG.cell;
    const BORDER_CONFIG = CONFIG.border;

    const commonCellConfig: TRenderCell = {
      y: y * CELL_CONFIG.size + BORDER_CONFIG.size,
      x: x * CELL_CONFIG.size + BORDER_CONFIG.size,

      height: CELL_CONFIG.size,
      width: CELL_CONFIG.size,

      data: {
        y,
        x,
      },

      bgColor: CELL_CONFIG.backGround[cell.state],
      border: BORDER_CONFIG,
    };

    const onClick: TRenderCell["onClick"] = ({ data }, e) => {
      if (cell.state === ECellState.Opened) return;

      let event = "cell:open:req";

      if (e.button === 1) {
        event = "cell:flag:req";
      }

      this._socket.emit(event, data);
    };

    let text: TRenderCell["text"];

    if (cell.state === ECellState.Opened) {
      text = {
        value: cell.value || "",
        color: "blue",
        offset: { y: 2 },
        font: "24px sans-serif",
        maxWidth: CELL_CONFIG.size,
      };
    }

    return {
      ...commonCellConfig,
      onClick,
      text,
    };
  }
}
