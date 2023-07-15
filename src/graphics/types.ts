import { ICellIndex } from "../types";

export interface IRenderElement<Data extends Record<string, any> = any> {
  x: number;
  y: number;
  z?: number;

  width: number;
  height: number;

  data?: Data;
  hidden?: boolean;
  onClick?: (element: IRenderElement<Data>, e: MouseEvent) => void;

  bgColor?: string;
  border?: {
    color?: string;
    size?: number;
  };
  text?: {
    value: string | number;
    font?: string;
    color?: string;
    offset?: Partial<ICellIndex>;
    maxWidth?: number;
    align?: CanvasRenderingContext2D["textAlign"];
    baseline?: CanvasRenderingContext2D["textBaseline"];
  };
}
