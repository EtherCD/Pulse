export const staticTypeScriptBufferReader = `
class BufferReader {
  private data: Uint8Array;
  private view: DataView;
  offset: number = 0;

  private static readonly decoder = new TextDecoder();

  constructor(data: Uint8Array) {
    this.data = data;
    this.view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  }

  private ensure(bytes: number): void {
    if (this.offset + bytes > this.data.length) {
      throw new RangeError(
        \`BufferReader: Attempt read \${bytes} byte outbound of buffer (offset=\${this.offset}, length=\${this.data.length})\`,
      );
    }
  }

  readU8(): number {
    this.ensure(1);
    return this.data[this.offset++];
  }

  readI8(): number {
    this.ensure(1);
    return this.view.getInt8(this.offset++);
  }

  readBool(): boolean {
    return this.readU8() !== 0;
  }

  readU16(): number {
    this.ensure(2);
    const value = this.view.getUint16(this.offset, true);
    this.offset += 2;
    return value;
  }

  readI16(): number {
    this.ensure(2);
    const value = this.view.getInt16(this.offset, true);
    this.offset += 2;
    return value;
  }

  readU32(): number {
    this.ensure(4);
    const value = this.view.getUint32(this.offset, true);
    this.offset += 4;
    return value;
  }

  readI32(): number {
    this.ensure(4);
    const value = this.view.getInt32(this.offset, true);
    this.offset += 4;
    return value;
  }

  readVarU32(): number {
    let x = 0;
    let shift = 0;

    while (true) {
      this.ensure(1);
      const b = this.data[this.offset++];

      x += shift < 28 ? (b & 0xff) << shift : (b & 0xff) * Math.pow(2, shift);

      if ((b & 0x80) === 0) {
        return x;
      }

      shift += 7;

      if (shift > 49) {
        throw new RangeError("BufferReader: could not decode varint");
      }
    }
  }

  readU64(): bigint {
    this.ensure(8);
    const value = this.view.getBigUint64(this.offset, true);
    this.offset += 8;
    return value;
  }

  readI64(): bigint {
    this.ensure(8);
    const value = this.view.getBigInt64(this.offset, true);
    this.offset += 8;
    return value;
  }

  private static halfBitsToFloat(bits: number): number {
    const sign = bits >> 15 ? -1 : 1;
    const exponent = (bits & 0x7c00) >> 10;
    const fraction = bits & 0x03ff;

    if (exponent === 0) {
      return sign * fraction * Math.pow(2, -24);
    }

    if (exponent === 0x1f) {
      return fraction ? NaN : sign * Infinity;
    }

    return sign * (1 + fraction / 1024) * Math.pow(2, exponent - 15);
  }

  readF16(): number {
    const bits = this.readU16();
    return BufferReader.halfBitsToFloat(bits);
  }

  readF32(): number {
    this.ensure(4);
    const value = this.view.getFloat32(this.offset, true);
    this.offset += 4;
    return value;
  }

  readF64(): number {
    this.ensure(8);
    const value = this.view.getFloat64(this.offset, true);
    this.offset += 8;
    return value;
  }

  readChar(): string {
    this.ensure(1);
    const bytes = this.data.subarray(this.offset, this.offset + 1);
    this.offset += 1;
    return BufferReader.decoder.decode(bytes);
  }

  readString(): string {
    const length = this.readVarU32();
    this.ensure(length);
    const bytes = this.data.subarray(this.offset, this.offset + length);
    this.offset += length;
    return BufferReader.decoder.decode(bytes);
  }

  readBytes(length: number): Uint8Array {
    this.ensure(length);
    const bytes = this.data.subarray(this.offset, this.offset + length);
    this.offset += length;
    return bytes;
  }

  get remaining(): number {
    return this.data.length - this.offset;
  }

  get eof(): boolean {
    return this.offset >= this.data.length;
  }
}
`;

export const staticTypeScriptBufferWriter = `
class BufferWriter {
  private buffer: ArrayBuffer;
  private data: Uint8Array;
  private view: DataView;
  offset: number = 0;

  private static readonly encoder = new TextEncoder();

  private static readonly f32Scratch = new Float32Array(1);
  private static readonly i32Scratch = new Int32Array(
    BufferWriter.f32Scratch.buffer,
  );

  constructor(initialCapacity: number = 64) {
    this.buffer = new ArrayBuffer(initialCapacity);
    this.data = new Uint8Array(this.buffer);
    this.view = new DataView(this.buffer);
  }

  private static floatToHalfBits(value: number): number {
    BufferWriter.f32Scratch[0] = value;
    const x = BufferWriter.i32Scratch[0];

    const sign = (x >> 16) & 0x8000;
    let m = (x >> 12) & 0x07ff;
    const e = (x >> 23) & 0xff;

    if (e < 103) {
      return sign;
    }

    if (e > 142) {
      if (e === 255 && x & 0x007fffff) {
        return sign | 0x7c00 | 0x0200;
      }
      return sign | 0x7c00;
    }

    if (e < 113) {
      m |= 0x0800;
      return sign | ((m >> (114 - e)) + ((m >> (113 - e)) & 1));
    }

    let bits = sign | ((e - 112) << 10) | (m >> 1);
    bits += m & 1;
    return bits;
  }

  private ensure(bytes: number): void {
    const required = this.offset + bytes;
    if (required <= this.buffer.byteLength) return;

    let newCapacity = this.buffer.byteLength * 2;
    while (newCapacity < required) newCapacity *= 2;

    const newBuffer = new ArrayBuffer(newCapacity);
    new Uint8Array(newBuffer).set(this.data);

    this.buffer = newBuffer;
    this.data = new Uint8Array(newBuffer);
    this.view = new DataView(newBuffer);
  }

  writeU8(value: number): void {
    this.ensure(1);
    this.data[this.offset++] = value & 0xff;
  }

  writeI8(value: number): void {
    this.ensure(1);
    this.view.setInt8(this.offset, value);
    this.offset += 1;
  }

  writeBool(value: boolean): void {
    this.writeU8(value ? 1 : 0);
  }

  writeU16(value: number): void {
    this.ensure(2);
    this.view.setUint16(this.offset, value, true);
    this.offset += 2;
  }

  writeI16(value: number): void {
    this.ensure(2);
    this.view.setInt16(this.offset, value, true);
    this.offset += 2;
  }

  writeU32(value: number): void {
    this.ensure(4);
    this.view.setUint32(this.offset, value, true);
    this.offset += 4;
  }

  writeI32(value: number): void {
    this.ensure(4);
    this.view.setInt32(this.offset, value, true);
    this.offset += 4;
  }

  writeVarU32(value: number): void {
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new RangeError("BufferWriter: could not encode varint");
    }
    if (value >= 2 ** 31) {
      throw new RangeError(
        \`BufferWriter: writeVarint do not support >= 2^31 (value = \${value}), choose other method\`,
      );
    }

    const REST = 0x7f;
    const MSB = 0x80;
    const MSBALL = ~REST;

    let x = value;

    while (x & MSBALL) {
      this.writeU8((x & REST) | MSB);
      x >>>= 7;
      x -= 1;
    }

    this.writeU8(x & REST);
  }

  writeU64(value: bigint): void {
    this.ensure(8);
    this.view.setBigUint64(this.offset, value, true);
    this.offset += 8;
  }

  writeI64(value: bigint): void {
    this.ensure(8);
    this.view.setBigInt64(this.offset, value, true);
    this.offset += 8;
  }

  writeF16(value: number): void {
    const bits = BufferWriter.floatToHalfBits(value);
    this.writeU16(bits);
  }

  writeF32(value: number): void {
    this.ensure(4);
    this.view.setFloat32(this.offset, value, true);
    this.offset += 4;
  }

  writeF64(value: number): void {
    this.ensure(8);
    this.view.setFloat64(this.offset, value, true);
    this.offset += 8;
  }

  writeChar(value: string): void {
    if (value.length < 1) 
      throw new RangeError(
        \`BufferWriter: writeChar char length is below 1 (value = \${value})\`,
      );
    const bytes = BufferWriter.encoder.encode(value);
    this.writeU8(bytes[0]);
  }

  writeString(value: string): void {
    const bytes = BufferWriter.encoder.encode(value);
    this.writeVarU32(bytes.length);
    this.writeBytes(bytes);
  }

  writeBytes(bytes: Uint8Array): void {
    this.ensure(bytes.length);
    this.data.set(bytes, this.offset);
    this.offset += bytes.length;
  }

  toUint8Array(): Uint8Array {
    return this.data.slice(0, this.offset);
  }

  get length(): number {
    return this.offset;
  }
}`;

export const staticTypeScriptQuantaizer = `
class Quantaizer {
  public static fromF32ToQ8(value: number, step: number): number {
    const q = Math.round(value / step);
    return Math.min(127, Math.max(-127, q));
  }

  public static fromF32ToUQ8(value: number, step: number): number {
    const q = Math.round(value / step);
    return Math.min(255, Math.max(0, q));
  }

  public static fromQ8ToF32(quantized: number, step: number): number {
    return quantized * step;
  }

  public static fromF32ToQ16(value: number, step: number): number {
    const q = Math.round(value / step);
    return Math.min(32767, Math.max(-32767, q));
  }

  public static fromF32ToUQ16(value: number, step: number): number {
    const q = Math.round(value / step);
    return Math.min(65536, Math.max(0, q));
  }

  public static fromQ16ToF32(quantized: number, step: number): number {
    return quantized * step;
  }
}`;

export const staticTypeScriptTypeTransformer = `
class 
`;
