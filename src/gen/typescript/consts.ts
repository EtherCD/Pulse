import { PulseType } from "../../types";

export type TypeMap = Record<
  PulseType,
  "number" | "string" | "boolean" | "object" | "bigint"
>;

export const TO_TYPESCRIPT_TYPE: TypeMap = {
  [PulseType.U8]: "number",
  [PulseType.I8]: "number",
  [PulseType.U16]: "number",
  [PulseType.I16]: "number",
  [PulseType.U32]: "number",
  [PulseType.I32]: "number",
  [PulseType.VU32]: "number",
  [PulseType.VI32]: "number",
  [PulseType.F16]: "number",
  [PulseType.F32]: "number",
  [PulseType.F64]: "number",
  [PulseType.U64]: "bigint",
  [PulseType.I64]: "bigint",
  [PulseType.Q8]: "number",
  [PulseType.UQ8]: "number",
  [PulseType.Q16]: "number",
  [PulseType.UQ16]: "number",
  [PulseType.STR]: "string",
  [PulseType.BOOL]: "boolean",
  [PulseType.CHAR]: "string",
  [PulseType.NESTED]: "object",
};
