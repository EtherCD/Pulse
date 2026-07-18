import { PulseType } from "../types";

export type TypeMap = Record<PulseType, "number" | "string" | "boolean">;

export const TO_TYPE: TypeMap = {
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
  [PulseType.U64]: "number",
  [PulseType.I64]: "number",
  [PulseType.Q8]: "number",
  [PulseType.UQ8]: "number",
  [PulseType.Q16]: "number",
  [PulseType.UQ16]: "number",
  [PulseType.STR]: "string",
  [PulseType.BOOL]: "boolean",
  [PulseType.CHAR]: "string",
};

export const TO_WRITER_FUNCTION: Record<PulseType, string> = {
  [PulseType.U8]: "writeU8",
  [PulseType.I8]: "writeI8",
  [PulseType.U16]: "writeU16",
  [PulseType.I16]: "writeI16",
  [PulseType.U32]: "writeU32",
  [PulseType.I32]: "writeI32",
  [PulseType.VU32]: "writeVarU32",
  [PulseType.VI32]: "writeVarI32",
  [PulseType.F16]: "writeF16",
  [PulseType.F32]: "writeF32",
  [PulseType.F64]: "writeF64",
  [PulseType.U64]: "writeU64",
  [PulseType.I64]: "writeI64",
  [PulseType.Q8]: "writeI8",
  [PulseType.UQ8]: "writeU8",
  [PulseType.Q16]: "writeI16",
  [PulseType.UQ16]: "writeU16",
  [PulseType.STR]: "writeString",
  [PulseType.BOOL]: "writeBool",
  [PulseType.CHAR]: "writeChar",
};

export const TO_READER_FUNCTION: Record<PulseType, string> = {
  [PulseType.U8]: "readU8",
  [PulseType.I8]: "readI8",
  [PulseType.U16]: "readU16",
  [PulseType.I16]: "readI16",
  [PulseType.U32]: "readU32",
  [PulseType.I32]: "readI32",
  [PulseType.VU32]: "readVarU32",
  [PulseType.VI32]: "readVarI32",
  [PulseType.F16]: "readF16",
  [PulseType.F32]: "readF32",
  [PulseType.F64]: "readF64",
  [PulseType.U64]: "readU64",
  [PulseType.I64]: "readI64",
  [PulseType.Q8]: "readI8",
  [PulseType.UQ8]: "readU8",
  [PulseType.Q16]: "readI16",
  [PulseType.UQ16]: "readU16",
  [PulseType.STR]: "readString",
  [PulseType.BOOL]: "readBool",
  [PulseType.CHAR]: "readChar",
};

export const TO_QUNATIZER_WRITE_TYPE: Record<
  PulseType.F32,
  Record<PulseType.Q8 | PulseType.Q16 | PulseType.UQ16 | PulseType.UQ8, string>
> = {
  [PulseType.F32]: {
    [PulseType.Q8]: "fromF32ToQ8",
    [PulseType.Q16]: "fromF32ToQ16",
    [PulseType.UQ8]: "fromF32ToUQ8",
    [PulseType.UQ16]: "fromF32ToUQ16",
  },
};

export const TO_QUNATIZER_READ_TYPE: Record<
  PulseType.F32,
  Record<PulseType.Q8 | PulseType.Q16 | PulseType.UQ16 | PulseType.UQ8, string>
> = {
  [PulseType.F32]: {
    [PulseType.Q8]: "fromQ8ToF32",
    [PulseType.Q16]: "fromQ16ToF32",
    [PulseType.UQ8]: "fromQ8ToF32",
    [PulseType.UQ16]: "fromQ16ToF32",
  },
};
