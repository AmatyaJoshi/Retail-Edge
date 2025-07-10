declare module 'react-barcode' {
  import * as React from 'react';
  interface BarcodeProps {
    value: string;
    format?: string;
    width?: number;
    height?: number;
    displayValue?: boolean;
    fontOptions?: string;
    font?: string;
    textAlign?: string;
    textPosition?: string;
    textMargin?: number;
    fontSize?: number;
    background?: string;
    lineColor?: string;
    margin?: number;
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
    flat?: boolean;
    renderer?: 'svg' | 'canvas' | 'img';
    onRender?: () => void;
    className?: string;
    style?: React.CSSProperties;
  }
  const Barcode: React.FC<BarcodeProps>;
  export default Barcode;
}
