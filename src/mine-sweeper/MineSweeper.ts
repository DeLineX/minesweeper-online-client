import { Graphics, IRenderElement } from "../graphics";
import { CONFIG } from "./config";
import {
  ECellState,
  IFieldLoadRes,
  IFieldUpdateRes,
  TCell,
  TCellWithMeta,
  TGameState,
  TRenderCell,
} from "./types";
import { io } from "socket.io-client";

export class MineSweeper {
  private _graphics: Graphics;
  private _gameState: TGameState = { type: "started" };
  private _field: TCell[][] = [];
  private _minesCount: number = 0;
  private _flagsCount: number = 0;
  private _controls: Record<string, IRenderElement> = {};
  private _socket = io("http://localhost:3000/");

  constructor(private canvas: HTMLCanvasElement) {
    this._graphics = new Graphics(canvas);

    this._socket.on("field:loaded", this.fieldLoadedHandler.bind(this));
    this._socket.on("field:update", this.fieldUpdateHandler.bind(this));
    this._socket.on(
      "game:update:restartTime",
      this.updateRestartTime.bind(this)
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
      y: y * CELL_CONFIG.size + BORDER_CONFIG.size + CONFIG.topControls.size,
      x: x * CELL_CONFIG.size + BORDER_CONFIG.size + CONFIG.topControls.size,

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

      let gameEvent: string | undefined;

      if (e.button === 0) {
        gameEvent = "cell:open:req";
      }

      if (e.button === 2) {
        e.preventDefault();
        gameEvent = "cell:flag:req";
      }

      if (gameEvent) {
        this._socket.emit(gameEvent, data);
      }
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

  private fieldLoadedHandler({
    width,
    height,
    minesCount,
    ...data
  }: IFieldLoadRes) {
    this._field = Array(height)
      .fill(null)
      .map((_) =>
        Array(width)
          .fill(null)
          .map<TCell>((_) => ({ state: ECellState.Closed }))
      );

    this._minesCount = minesCount;
    this.createControls();
    this.fieldUpdateHandler(data);
  }

  private fieldUpdateHandler(data: IFieldUpdateRes) {
    const { updatedCells, gameState, flagsCount } = data;
    for (const {
      cellIndex: { x, y },
      ...cell
    } of updatedCells) {
      this._field[y][x] = cell;
    }

    if (flagsCount !== undefined) {
      this._flagsCount = flagsCount;
    }

    if (gameState) {
      this._gameState = gameState;
    }

    this.render();
  }

  private updateRestartTime(secondsLeft: number) {
    if (this._gameState.type === "ended") {
      this._gameState.secondsLeft = secondsLeft;
    }
    this.render();
  }

  private createRestartControls() {
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
        font: "40px sans-serif",
        color: "#000",
      },
      hidden: true,
      position: "fixed",
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
        font: "40px sans-serif",
        color: "#000",
      },
      hidden: true,
      position: "fixed",
    };
  }

  private updateRestartControls() {
    if (this._gameState.type !== "ended") return;

    if (this._controls["gameOver"].text) {
      this._controls["gameOver"].hidden = false;
      if (this._gameState.status === "lose") {
        this._controls["gameOver"].text.value = "Игра окончена";
      } else {
        this._controls["gameOver"].text.value = "Вы выиграли";
      }
    }

    if (this._controls["restart"].text) {
      this._controls["restart"].hidden = false;
      this._controls[
        "restart"
      ].text.value = `Рестарт через ${this._gameState.secondsLeft}`;
    }
  }

  private createFlagsCountControl() {
    this._controls["flagsCount"] = {
      height: CONFIG.topControls.size,
      width: 150,
      x: this.canvas.width - 150,
      y: 1,
      z: 10,
      border: {
        color: "red",
      },
      bgColor: "lightgray",
      text: {
        value: `${this._flagsCount}/${this._minesCount}`,
        font: "30px sans-serif",
        color: "#000",
      },
      position: "fixed",
    };
  }

  private updateFlagsCountControl() {
    if (this._controls["flagsCount"].text) {
      this._controls[
        "flagsCount"
      ].text.value = `${this._flagsCount}/${this._minesCount}`;
    }
  }

  private createControls() {
    this.createRestartControls();
    this.createFlagsCountControl();
  }

  private updateControls() {
    this.updateRestartControls();
    this.updateFlagsCountControl();
  }

  public render() {
    const elements: IRenderElement[] = [];

    for (let i = 0; i < this._field.length; i++) {
      for (let j = 0; j < this._field[i].length; j++) {
        const cell = this._field[i][j];
        elements.push(this.processCell({ ...cell, cellIndex: { x: j, y: i } }));
      }
    }

    this.updateControls();

    for (const key in this._controls) {
      elements.push(this._controls[key]);
    }

    this._graphics.elements = elements;
  }
}
