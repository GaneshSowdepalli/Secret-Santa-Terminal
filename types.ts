import { ReactNode } from "react";

export type LineType = 'input' | 'output' | 'error' | 'system';

export interface TerminalLine {
  id: string;
  type: LineType;
  content: ReactNode;
  prompt?: string;
}

export enum BootState {
  LOADING,
  ERROR,
  READY,
  DESTROYED
}