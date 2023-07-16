export interface Point {
  x: number;
  y: number;
}

export interface IRenderElement<Data extends Record<string, any> = any>
  extends Point {
  z?: number;

  width: number;
  height: number;

  data?: Data;
  hidden?: boolean;
  onClick?: (element: IRenderElement<Data>, e: MouseEvent) => void;

  bgColor: string;
  border: {
    color: string;
    size?: number;
  };
  text?: {
    value?: string | number;
    font?: string;
    color?: string;
    maxWidth?: number;
    align?: CanvasRenderingContext2D["textAlign"];
    baseline?: CanvasRenderingContext2D["textBaseline"];
  };
  position?: "static" | "fixed";
}
