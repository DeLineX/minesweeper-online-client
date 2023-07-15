import { Graphics, IRenderElement } from "../graphics";
import { CONFIG } from "./config";
import {
  ECellState,
  IFieldUpdateRes,
  IGameEndedState,
  TCell,
  TCellWithMeta,
  TRenderCell,
} from "./types";
import { io } from "socket.io-client";

export class MineSweeper {
  private _graphics: Graphics;
  private _field: TCell[][] = [];
  private _controls: Record<string, IRenderElement> = {};
  private _socket = io("http://localhost:3000/");

  constructor(private canvas: HTMLCanvasElement) {
    this._graphics = new Graphics(canvas);

    this._socket.on("field:loaded", this.fieldLoadedHandler.bind(this));
    this._socket.on("field:update", this.fieldUpdateHandler.bind(this));
    this._socket.on(
      "game:update:restartTime",
      this.updateRestartControls.bind(this)
    );
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
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

      let gameEvent = "cell:open:req";

      if (e.button === 2) {
        e.preventDefault();
        gameEvent = "cell:flag:req";
      }

      this._socket.emit(gameEvent, data);
    };

    let text: TRenderCell["text"];

    if (cell.state === ECellState.Opened) {
      text = {
        value: cell.value || "",
        color: "blue",
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

  private fieldLoadedHandler(field: TCell[][]) {
    this.deleteRestartControls();

    this._field = field;

    this.render();
  }

  private fieldUpdateHandler(data: IFieldUpdateRes) {
    const { updatedCells, gameState } = data;
    for (const {
      cellIndex: { x, y },
      ...cell
    } of updatedCells) {
      this._field[y][x] = cell;
    }

    if (gameState) {
      this.createRestartControls(gameState);
    }

    this.render();
  }

  private createRestartControls(state: IGameEndedState) {
    this._controls["gameOver"] = {
      height: 50,
      width: 350,
      x: this.canvas.width / 2 - 175,
      y: this.canvas.height / 2 - 25,
      z: 10,
      border: {
        color: "red",
      },
      bgColor: "lightgray",
      text: {
        value: state.status === "lost" ? "Игра окончена" : "Вы выиграли",
        font: "40px sans-serif",
        color: "#000",
      },
    };

    this._controls["restart"] = {
      height: 50,
      width: 350,
      x: this.canvas.width / 2 - 175,
      y: this.canvas.height / 2 - 25 + 70,
      z: 10,
      border: {
        color: "red",
      },
      bgColor: "lightgray",
      text: {
        value: `Рестарт через ${state.secondsLeft}`,
        font: "40px sans-serif",
        color: "#000",
      },
    };
  }

  private updateRestartControls(secondsLeft: number) {
    if (this._controls["restart"].text) {
      this._controls["restart"].text.value = `Рестарт через ${secondsLeft}`;
    }

    this.render();
  }

  private deleteRestartControls() {
    delete this._controls["gameOver"];
    delete this._controls["restart"];
  }

  private render() {
    const elements: IRenderElement[] = [];

    for (let i = 0; i < this._field.length; i++) {
      for (let j = 0; j < this._field[i].length; j++) {
        const cell = this._field[i][j];
        elements.push(this.processCell({ ...cell, cellIndex: { x: j, y: i } }));
      }
    }

    for (const key in this._controls) {
      elements.push(this._controls[key]);
    }

    this._graphics.elements = elements;
  }
}
