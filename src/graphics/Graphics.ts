import { IRenderElement } from "./types";

export class Graphics {
  private ctx: CanvasRenderingContext2D;
  private _elements: IRenderElement[] = [];

  public get elements() {
    return this._elements;
  }

  public set elements(val: IRenderElement[]) {
    this._elements = val;
    this.render();
  }

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d")!;

    window.requestAnimationFrame(() => this.render());

    this.setupHandlers();
  }

  private handleClick(e: MouseEvent) {
    for (const element of this._elements) {
      if (
        e.offsetX >= element.x &&
        e.offsetX <= element.x + element.width &&
        e.offsetY >= element.y &&
        e.offsetY <= element.y + element.height
      ) {
        element.onClick?.(element, e);
        return;
      }
    }
  }

  private setupHandlers() {
    this.canvas.addEventListener("mousedown", this.handleClick.bind(this));
  }

  private renderElement({
    bgColor,
    border,
    x,
    y,
    width,
    height,
    text,
  }: IRenderElement) {
    this.ctx.fillStyle = bgColor ?? "";
    this.ctx.fillRect(x, y, width, height);

    this.ctx.lineWidth = border?.size ?? 0;
    this.ctx.strokeStyle = border?.color ?? "";
    if (text) {
      this.ctx.fillStyle = text.color ?? "";
      this.ctx.font = text.font ?? "";
      this.ctx.textAlign = text.align ?? "center";
      this.ctx.textBaseline = text.baseline ?? "middle";

      this.ctx.fillText(
        text.value.toString(),
        x + width / 2,
        y + height / 2 + 2,
        text.maxWidth
      );
    }

    this.ctx.strokeRect(x, y, width, height);
  }

  public render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const sortedElementsObj = this._elements.reduce<
      Record<number, IRenderElement[]>
    >((acc, { z = 0, ...item }) => {
      if (!acc[z]) acc[z] = [];
      acc[z].push(item);
      return acc;
    }, {});

    for (const key in sortedElementsObj) {
      for (const element of sortedElementsObj[key]) {
        this.renderElement(element);
      }
    }
  }
}
