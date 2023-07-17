import { IRenderElement, Point } from "./types";

export class Graphics {
  private ctx: CanvasRenderingContext2D;
  private _elements: IRenderElement[] = [];
  private _offset: Point = { x: 0, y: 0 };
  private __isDragging: boolean = false;

  public get elements() {
    return this._elements;
  }

  public set elements(val: IRenderElement[]) {
    this._elements = val;
    this.render();
  }

  constructor(private canvas: HTMLCanvasElement) {
    // todo: add error
    this.ctx = canvas.getContext("2d")!;

    this.ctx.imageSmoothingEnabled = true;

    this.setupHandlers();
  }

  private handleClick(e: MouseEvent) {
    for (const element of this._elements) {
      if (
        e.offsetX - this._offset.x >= element.x &&
        e.offsetX - this._offset.x <= element.x + element.width &&
        e.offsetY - this._offset.y >= element.y &&
        e.offsetY - this._offset.y <= element.y + element.height
      ) {
        element.onClick?.(element, e);
        return;
      }
    }
  }

  private handleDragStart(e: MouseEvent) {
    if (e.button === 1) {
      this.__isDragging = true;
    }
  }

  private handleDragEnd() {
    this.__isDragging = false;
  }

  private handleMove(e: MouseEvent) {
    if (this.__isDragging) {
      this.__isDragging = true;
      this._offset.x += e.movementX;
      // if (this._offset.x < 0) {
      //   this._offset.x = 0;
      // }

      this._offset.y += e.movementY;
      // if (this._offset.y < 0) {
      //   this._offset.y = 0;
      // }
      this.render();
    }
  }

  private setupHandlers() {
    this.canvas.addEventListener("mousedown", this.handleClick.bind(this));
    this.canvas.addEventListener("mousedown", this.handleDragStart.bind(this));
    this.canvas.addEventListener("mouseup", this.handleDragEnd.bind(this));
    this.canvas.addEventListener("mouseout", this.handleDragEnd.bind(this));
    this.canvas.addEventListener("mousemove", this.handleMove.bind(this));
  }

  private renderElement({
    bgColor,
    border,
    x,
    y,
    width,
    height,
    text,
    imageLayers,
    hidden,
    position = "static",
  }: IRenderElement) {
    if (hidden) return;
    let currentX = x;
    let currentY = y;

    if (position === "static") {
      currentX += this._offset.x;
      currentY += this._offset.y;
    }

    if (
      currentX + width < 0 ||
      currentY + height < 0 ||
      currentX > this.canvas.width ||
      currentY > this.canvas.height
    )
      return;

    this.ctx.fillStyle = bgColor ?? "";
    this.ctx.lineWidth = border?.size ?? 0;
    this.ctx.strokeStyle = border?.color ?? "";

    if (bgColor) {
      this.ctx.fillRect(currentX, currentY, width, height);
    }
    if (border) {
      this.ctx.strokeRect(currentX, currentY, width, height);
    }

    if (imageLayers) {
      for (const image of imageLayers) {
        this.ctx.drawImage(
          image.src,
          image.dx,
          image.dy,
          image.width,
          image.height,
          currentX,
          currentY,
          width,
          height
        );
      }
    }

    if (text) {
      this.ctx.fillStyle = text.color ?? "";
      this.ctx.font = text.font ?? "";
      this.ctx.textAlign = text.align ?? "center";
      this.ctx.textBaseline = text.baseline ?? "middle";

      if (text.value) {
        this.ctx.fillText(
          text.value.toString(),
          currentX + width / 2,
          currentY + height / 2 + 2,
          text.maxWidth
        );
      }
    }
  }

  public render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const element of this._elements) {
      this.renderElement(element);
    }
  }
}
