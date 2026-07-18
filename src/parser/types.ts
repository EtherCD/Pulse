import { PulseHeader, PulseType } from "../types";

export interface ParserType {
  internalType: PulseType;
  externalType?: PulseType;
  quantizedStep?: number;
  isArray?: boolean;
  isNestedType?: string;
}

export interface ParserField {
  name: string;
  type: ParserType;
  isStatic?: boolean;
  isPartial?: boolean;
}

export interface ParserPackage {
  name: string;
  fields: ParserField[];
  index: number;
  header?: PulseHeader;
}
