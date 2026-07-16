export enum PulseType {
  U8 = "u8",
  I8 = "i8",
  U16 = "u16",
  I16 = "i16",
  U32 = "u32",
  I32 = "i32",
  VU32 = "vu32",
  VI32 = "vi32",
  F32 = "f32",
  F64 = "f64",
  U64 = "u64",
  I64 = "i64",
  Q8 = "q8",
  Q16 = "q16",
  VQ16 = "vq16",
  STR = "str",
  BOOL = "bool",
}

export const PulseQuantizedTypes: Array<PulseType> = [
  PulseType.Q16,
  PulseType.Q8,
];

export const PulseQuantizeCandidates: Array<PulseType> = [
  PulseType.F32,
  PulseType.F64,
];
