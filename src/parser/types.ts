import { PulseType } from "../types";

export interface ParserType {
  internalType: PulseType;
  externalType?: PulseType;
  quantizedStep?: number;
}

export interface ParserField {
  name: string;
  type: ParserType;
}

export interface ParserPackage {
  name: string;
  fields: ParserField[];
  index: number;
}
