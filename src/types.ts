export enum PulseType {
  U8 = "u8",
  I8 = "i8",
  U16 = "u16",
  I16 = "i16",
  U32 = "u32",
  I32 = "i32",
  VU32 = "vu32",
  VI32 = "vi32",
  F16 = "f16",
  F32 = "f32",
  F64 = "f64",
  U64 = "u64",
  I64 = "i64",
  Q8 = "q8",
  UQ8 = "uq8",
  Q16 = "q16",
  UQ16 = "uq16",
  STR = "str",
  BOOL = "bool",
  CHAR = "char",
  NESTED = "nested",
}

export enum PulseHeader {
  Partial = "partial",
}

export type PulseQuantizeCandidatesType = PulseType.F32 | PulseType.F64;

export type PulseQuantizedType =
  | PulseType.Q16
  | PulseType.Q8
  | PulseType.UQ16
  | PulseType.UQ8;

export const PulseQuantizedTypes: Array<PulseType> = [
  PulseType.Q16,
  PulseType.Q8,
  PulseType.UQ16,
  PulseType.UQ8,
];

export const PulseQuantizeCandidates: Array<PulseType> = [
  PulseType.F32,
  PulseType.F64,
];

export const PulseFieldsNeedToQuantize: Array<PulseType> = [
  PulseType.F16,
  PulseType.F32,
  PulseType.F64,
];
