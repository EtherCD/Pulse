import { PulseType } from "../../types";

export type TypeMap = Record<PulseType, string>;

export const TO_RUST_TYPE: TypeMap = {
  [PulseType.U8]: "u8",
  [PulseType.I8]: "i8",
  [PulseType.U16]: "u16",
  [PulseType.I16]: "i16",
  [PulseType.U32]: "u32",
  [PulseType.I32]: "i32",
  [PulseType.VU32]: "u32",
  [PulseType.VI32]: "i32",
  [PulseType.F16]: "f32",
  [PulseType.F32]: "f32",
  [PulseType.F64]: "f64",
  [PulseType.U64]: "u64",
  [PulseType.I64]: "i64",
  [PulseType.Q8]: "i8",
  [PulseType.UQ8]: "u8",
  [PulseType.Q16]: "i16",
  [PulseType.UQ16]: "u16",
  [PulseType.STR]: "String",
  [PulseType.BOOL]: "bool",
  [PulseType.CHAR]: "char",
  [PulseType.NESTED]: "",
};

export const TO_WRITER_RUST_FUNCTION: Record<PulseType, string> = {
  [PulseType.U8]: "write_u8",
  [PulseType.I8]: "write_i8",
  [PulseType.U16]: "write_u16",
  [PulseType.I16]: "write_i16",
  [PulseType.U32]: "write_u32",
  [PulseType.I32]: "write_i32",
  [PulseType.VU32]: "write_var_u32",
  [PulseType.VI32]: "write_var_i32",
  [PulseType.F16]: "write_f16",
  [PulseType.F32]: "write_f32",
  [PulseType.F64]: "write_f64",
  [PulseType.U64]: "write_u64",
  [PulseType.I64]: "write_i64",
  [PulseType.Q8]: "write_i8",
  [PulseType.UQ8]: "write_u8",
  [PulseType.Q16]: "write_i16",
  [PulseType.UQ16]: "write_u16",
  [PulseType.STR]: "write_string",
  [PulseType.BOOL]: "write_bool",
  [PulseType.CHAR]: "write_char",
  [PulseType.NESTED]: "",
};

export const TO_READER_RUST_FUNCTION: Record<PulseType, string> = {
  [PulseType.U8]: "read_u8",
  [PulseType.I8]: "read_i8",
  [PulseType.U16]: "read_u16",
  [PulseType.I16]: "read_i16",
  [PulseType.U32]: "read_u32",
  [PulseType.I32]: "read_i32",
  [PulseType.VU32]: "read_var_u32",
  [PulseType.VI32]: "read_var_i32",
  [PulseType.F16]: "read_f16",
  [PulseType.F32]: "read_f32",
  [PulseType.F64]: "read_f64",
  [PulseType.U64]: "read_u64",
  [PulseType.I64]: "read_i8",
  [PulseType.Q8]: "read_i8",
  [PulseType.UQ8]: "read_u8",
  [PulseType.Q16]: "read_i16",
  [PulseType.UQ16]: "read_u16",
  [PulseType.STR]: "read_string",
  [PulseType.BOOL]: "read_bool",
  [PulseType.CHAR]: "read_char",
  [PulseType.NESTED]: "",
};

export const TO_RUST_QUNATIZER_WRITE_TYPE: Record<
  PulseType.F32,
  Record<PulseType.Q8 | PulseType.Q16 | PulseType.UQ16 | PulseType.UQ8, string>
> = {
  [PulseType.F32]: {
    [PulseType.Q8]: "from_f32_to_q8",
    [PulseType.Q16]: "from_f32_to_q16",
    [PulseType.UQ8]: "from_f32_to_uq8",
    [PulseType.UQ16]: "from_f32_to_uq16",
  },
};

export const TO_RUST_QUNATIZER_READ_TYPE: Record<
  PulseType.F32,
  Record<PulseType.Q8 | PulseType.Q16 | PulseType.UQ16 | PulseType.UQ8, string>
> = {
  [PulseType.F32]: {
    [PulseType.Q8]: "from_q8_to_f32",
    [PulseType.Q16]: "from_q16_to_f32",
    [PulseType.UQ8]: "from_q8_to_f32",
    [PulseType.UQ16]: "from_q16_to_f32",
  },
};
