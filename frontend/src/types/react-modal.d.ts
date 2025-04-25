declare module 'react-modal' {
  import * as React from 'react';

  interface ReactModalProps {
    isOpen: boolean;
    onRequestClose?: (event: React.MouseEvent | React.KeyboardEvent) => void;
    contentLabel?: string;
    className?: string | {
      base: string;
      afterOpen?: string;
      beforeClose?: string;
    };
    overlayClassName?: string | {
      base: string;
      afterOpen?: string;
      beforeClose?: string;
    };
    children?: React.ReactNode;
    style?: {
      content?: React.CSSProperties;
      overlay?: React.CSSProperties;
    };
    appElement?: HTMLElement | string;
    [key: string]: any;
  }

  class ReactModal extends React.Component<ReactModalProps> {
    static setAppElement(element: HTMLElement | string): void;
  }

  export default ReactModal;
} 