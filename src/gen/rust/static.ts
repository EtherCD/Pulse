export const staticRustBufferReader = `
pub type PResult<T> = Result<T, String>;

pub struct BufferReader<'a> {
    data: &'a [u8],
    pub offset: usize,
}

impl<'a> BufferReader<'a> {
    pub fn new(data: &'a [u8]) -> Self {
        BufferReader { data, offset: 0 }
    }

    fn ensure(&self, bytes: usize) -> PResult<()> {
        if self.offset + bytes > self.data.len() {
            return Err(format!(
                "BufferReader: Attempt read {} byte outbound of buffer (offset={}, length={})",
                bytes,
                self.offset,
                self.data.len()
            ));
        }
        Ok(())
    }

    pub fn read_u8(&mut self) -> PResult<u8> {
        self.ensure(1)?;
        let v = self.data[self.offset];
        self.offset += 1;
        Ok(v)
    }

    pub fn read_i8(&mut self) -> PResult<i8> {
        self.ensure(1)?;
        let v = self.data[self.offset] as i8;
        self.offset += 1;
        Ok(v)
    }

    pub fn read_bool(&mut self) -> PResult<bool> {
        Ok(self.read_u8()? != 0)
    }

    pub fn read_u16(&mut self) -> PResult<u16> {
        self.ensure(2)?;
        let v = u16::from_le_bytes(self.data[self.offset..self.offset + 2].try_into().unwrap());
        self.offset += 2;
        Ok(v)
    }

    pub fn read_i16(&mut self) -> PResult<i16> {
        self.ensure(2)?;
        let v = i16::from_le_bytes(self.data[self.offset..self.offset + 2].try_into().unwrap());
        self.offset += 2;
        Ok(v)
    }

    pub fn read_u32(&mut self) -> PResult<u32> {
        self.ensure(4)?;
        let v = u32::from_le_bytes(self.data[self.offset..self.offset + 4].try_into().unwrap());
        self.offset += 4;
        Ok(v)
    }

    pub fn read_i32(&mut self) -> PResult<i32> {
        self.ensure(4)?;
        let v = i32::from_le_bytes(self.data[self.offset..self.offset + 4].try_into().unwrap());
        self.offset += 4;
        Ok(v)
    }

    pub fn read_var_u32(&mut self) -> PResult<u32> {
        let mut x: u64 = 0;
        let mut shift: u32 = 0;
        loop {
            let b = self.read_u8()? as u64;
            x = x.wrapping_add(b << shift);
            if b & 0x80 == 0 {
                return Ok(x as u32);
            }
            shift += 7;
            if shift > 49 {
                return Err("BufferReader: could not decode varint".to_string());
            }
        }
    }

    pub fn read_var_i32(&mut self) -> PResult<i32> {
        let encoded = self.read_var_u32()?;
        Ok(((encoded >> 1) as i32) ^ -((encoded & 1) as i32))
    }

    pub fn read_u64(&mut self) -> PResult<u64> {
        self.ensure(8)?;
        let v = u64::from_le_bytes(self.data[self.offset..self.offset + 8].try_into().unwrap());
        self.offset += 8;
        Ok(v)
    }

    pub fn read_i64(&mut self) -> PResult<i64> {
        self.ensure(8)?;
        let v = i64::from_le_bytes(self.data[self.offset..self.offset + 8].try_into().unwrap());
        self.offset += 8;
        Ok(v)
    }

    fn half_bits_to_f32(bits: u16) -> f32 {
        let sign: f32 = if (bits >> 15) != 0 { -1.0 } else { 1.0 };
        let exponent = ((bits & 0x7c00) >> 10) as i32;
        let fraction = (bits & 0x03ff) as f32;

        if exponent == 0 {
            return sign * fraction * 2f32.powi(-24);
        }

        if exponent == 0x1f {
            return if fraction != 0.0 {
                f32::NAN
            } else {
                sign * f32::INFINITY
            };
        }

        sign * (1.0 + fraction / 1024.0) * 2f32.powi(exponent - 15)
    }

    pub fn read_f16(&mut self) -> PResult<f32> {
        let bits = self.read_u16()?;
        Ok(Self::half_bits_to_f32(bits))
    }

    pub fn read_f32(&mut self) -> PResult<f32> {
        self.ensure(4)?;
        let v = f32::from_le_bytes(self.data[self.offset..self.offset + 4].try_into().unwrap());
        self.offset += 4;
        Ok(v)
    }

    pub fn read_f64(&mut self) -> PResult<f64> {
        self.ensure(8)?;
        let v = f64::from_le_bytes(self.data[self.offset..self.offset + 8].try_into().unwrap());
        self.offset += 8;
        Ok(v)
    }

    pub fn read_char(&mut self) -> PResult<String> {
        self.ensure(1)?;
        let byte = self.data[self.offset];
        self.offset += 1;
        Ok((byte as char).to_string())
    }

    pub fn read_string(&mut self) -> PResult<String> {
        let length = self.read_var_u32()? as usize;
        self.ensure(length)?;
        let bytes = &self.data[self.offset..self.offset + length];
        self.offset += length;
        Ok(String::from_utf8_lossy(bytes).into_owned())
    }

    pub fn read_bytes(&mut self, length: usize) -> PResult<Vec<u8>> {
        self.ensure(length)?;
        let bytes = self.data[self.offset..self.offset + length].to_vec();
        self.offset += length;
        Ok(bytes)
    }

    pub fn remaining(&self) -> usize {
        self.data.len() - self.offset
    }

    pub fn eof(&self) -> bool {
        self.offset >= self.data.len()
    }
}`;
export const staticRustBufferWriter = `
pub struct BufferWriter {
    data: Vec<u8>,
}

impl BufferWriter {
    pub fn new(initial_capacity: usize) -> Self {
        BufferWriter {
            data: Vec::with_capacity(initial_capacity),
        }
    }

    pub fn write_u8(&mut self, value: u8) {
        self.data.push(value);
    }

    pub fn write_i8(&mut self, value: i8) {
        self.data.push(value as u8);
    }

    pub fn write_bool(&mut self, value: bool) {
        self.write_u8(if value { 1 } else { 0 });
    }

    pub fn write_u16(&mut self, value: u16) {
        self.data.extend_from_slice(&value.to_le_bytes());
    }

    pub fn write_i16(&mut self, value: i16) {
        self.data.extend_from_slice(&value.to_le_bytes());
    }

    pub fn write_u32(&mut self, value: u32) {
        self.data.extend_from_slice(&value.to_le_bytes());
    }

    pub fn write_i32(&mut self, value: i32) {
        self.data.extend_from_slice(&value.to_le_bytes());
    }

    pub fn write_var_u32(&mut self, value: u32) {
        let mut x = value;
        while x & 0xffffff80 != 0 {
            self.write_u8(((x & 0x7f) | 0x80) as u8);
            x >>= 7;
            x = x.wrapping_sub(1);
        }
        self.write_u8((x & 0x7f) as u8);
    }

    pub fn write_var_i32(&mut self, value: i32) {
        let encoded = ((value << 1) ^ (value >> 31)) as u32;
        self.write_var_u32(encoded);
    }

    pub fn write_u64(&mut self, value: u64) {
        self.data.extend_from_slice(&value.to_le_bytes());
    }

    pub fn write_i64(&mut self, value: i64) {
        self.data.extend_from_slice(&value.to_le_bytes());
    }

    fn float_to_half_bits(value: f32) -> u16 {
        let x = value.to_bits() as i32;
        let sign = (x >> 16) & 0x8000;
        let mut m = (x >> 12) & 0x07ff;
        let e = (x >> 23) & 0xff;

        if e < 103 {
            return sign as u16;
        }

        if e > 142 {
            if e == 255 && (x & 0x007fffff) != 0 {
                return (sign | 0x7c00 | 0x0200) as u16;
            }
            return (sign | 0x7c00) as u16;
        }

        if e < 113 {
            m |= 0x0800;
            return (sign | ((m >> (114 - e)) + ((m >> (113 - e)) & 1))) as u16;
        }

        let mut bits = sign | ((e - 112) << 10) | (m >> 1);
        bits += m & 1;
        bits as u16
    }

    pub fn write_f16(&mut self, value: f32) {
        let bits = Self::float_to_half_bits(value);
        self.write_u16(bits);
    }

    pub fn write_f32(&mut self, value: f32) {
        self.data.extend_from_slice(&value.to_le_bytes());
    }

    pub fn write_f64(&mut self, value: f64) {
        self.data.extend_from_slice(&value.to_le_bytes());
    }

    pub fn write_char(&mut self, value: &str) {
        let bytes = value.as_bytes();
        if bytes.is_empty() {
            panic!(
                "BufferWriter: writeChar char length is below 1 (value = {})",
                value
            );
        }
        self.write_u8(bytes[0]);
    }

    pub fn write_string(&mut self, value: String) {
        let bytes = value.as_bytes();
        self.write_var_u32(bytes.len() as u32);
        self.write_bytes(bytes);
    }

    pub fn write_bytes(&mut self, bytes: &[u8]) {
        self.data.extend_from_slice(bytes);
    }

    pub fn to_vec(&self) -> Vec<u8> {
        self.data.clone()
    }

    pub fn len(&self) -> usize {
        self.data.len()
    }

    pub fn is_empty(&self) -> bool {
        self.data.is_empty()
    }
}
`;

export const staticRustQuantaizer = `
pub struct Quantizer;

impl Quantizer {
    pub fn from_f32_to_q8(value: f32, step: f32) -> i8 {
        let q = (value / step).round();
        q.min(127.0).max(-127.0) as i8
    }

    pub fn from_f32_to_uq8(value: f32, step: f32) -> u8 {
        let q = (value / step).round();
        q.min(255.0).max(0.0) as u8
    }

    pub fn from_q8_to_f32(quantized: i8, step: f32) -> f32 {
        quantized as f32 * step
    }

    pub fn from_f32_to_q16(value: f32, step: f32) -> i16 {
        let q = (value / step).round();
        q.min(32767.0).max(-32767.0) as i16
    }

    pub fn from_f32_to_uq16(value: f32, step: f32) -> u16 {
        let q = (value / step).round();
        q.min(65535.0).max(0.0) as u16
    }

    pub fn from_q16_to_f32(quantized: i16, step: f32) -> f32 {
        quantized as f32 * step
    }
}`;
