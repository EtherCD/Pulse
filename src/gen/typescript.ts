import { ParserField, ParserPackage } from "../parser";
import {
  PulseHeader,
  PulseQuantizeCandidates,
  PulseQuantizedType,
  PulseQuantizedTypes,
  PulseType,
} from "../types";
import {
  staticTypeScriptBufferReader,
  staticTypeScriptBufferWriter,
  staticTypeScriptQuantaizer,
} from "./typescript/static";

type TypeMap = Record<PulseType, "number" | "string" | "boolean">;

const TO_TYPE: TypeMap = {
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
};

const TO_WRITER_FUNCTION: Record<PulseType, string> = {
  [PulseType.U8]: "writeU8",
  [PulseType.I8]: "writeI8",
  [PulseType.U16]: "writeU16",
  [PulseType.I16]: "writeI16",
  [PulseType.U32]: "writeU32",
  [PulseType.I32]: "writeI32",
  [PulseType.VU32]: "writeVarU32",
  [PulseType.VI32]: "number",
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
};

const TO_READER_FUNCTION: Record<PulseType, string> = {
  [PulseType.U8]: "readU8",
  [PulseType.I8]: "readI8",
  [PulseType.U16]: "readU16",
  [PulseType.I16]: "readI16",
  [PulseType.U32]: "readU32",
  [PulseType.I32]: "readI32",
  [PulseType.VU32]: "readVarU32",
  [PulseType.VI32]: "number",
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
};

const TO_QUNATIZER_WRITE_TYPE: Record<
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

const TO_QUNATIZER_READ_TYPE: Record<
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

export class TypeScriptGenerator {
  packages: ParserPackage[];
  fileContent = "";

  constructor(packages: ParserPackage[]) {
    this.packages = packages;
  }

  public generate() {
    this.generateTypes();
    this.writeStatics();
    this.generateClasses();
  }

  private generateTypes() {
    for (const pkg of this.packages) {
      this.generateInterface(pkg);
    }
  }

  private generateClasses() {
    for (const pkg of this.packages) {
      this.generateClass(pkg);
    }
  }

  finish() {
    return this.fileContent;
  }

  private writeStatics() {
    this.writeLines(staticTypeScriptBufferReader);
    this.writeLines(staticTypeScriptBufferWriter);
    this.writeLines(staticTypeScriptQuantaizer);
  }

  private generateClass(pkg: ParserPackage) {
    this.writeLine(`export class ${pkg.name} {`);
    this.generateToUint8Array(pkg);
    this.generateFromUint8Array(pkg);
    this.writeLine(`}`);
  }

  private generateWriteBitmaskHeader(pkg: ParserPackage) {
    this.writeLine(`\t\tlet bitmask = 0`);
    for (const field of pkg.fields) {
      if (field.isStatic) continue;
      this.writeLines(
        `\t\tif (value.${field.name} != undefined)`,
        `\t\t\tbitmask |= 1 << E${pkg.name}Bitmask.${field.name}`,
      );
    }
    this.writeLine("\t\twriter.writeVarU32(bitmask)");
  }

  private generateToUint8Array(pkg: ParserPackage) {
    this.writeLines(
      `\tpublic static toUint8Array(value: I${pkg.name}): Uint8Array {`,
      `\t\tconst writer = new BufferWriter()`,
      `\t\twriter.writeVarU32(${pkg.index})`,
    );
    console.log(pkg);
    if (pkg.header === PulseHeader.Partial)
      this.generateWriteBitmaskHeader(pkg);
    for (const field of pkg.fields) {
      if (field.type.externalType) {
        if (field.type.quantizedStep) {
          if (
            PulseQuantizeCandidates.includes(field.type.internalType) &&
            PulseQuantizedTypes.includes(field.type.externalType!)
          ) {
            if (field.isPartial && !field.isStatic)
              this.writeLineWithoutNL(
                `\t\tif (value.${field.name} != undefined)\n\t`,
              );
            this.generateQuantizeFieldWriter(field);
            continue;
          }
        }
        if (field.isPartial && !field.isStatic)
          this.writeLineWithoutNL(
            `\t\tif (value.${field.name} != undefined)\n\t`,
          );
        this.generateExternalFieldWriter(field);
        continue;
      }
      if (field.isPartial && !field.isStatic)
        this.writeLineWithoutNL(
          `\t\tif (value.${field.name} != undefined)\n\t`,
        );
      this.generateFieldWriter(field);
    }
    this.writeLines("\t\treturn writer.toUint8Array()", "\t}");
  }

  private generateQuantizeFieldWriter(field: ParserField) {
    const qunatizer =
      TO_QUNATIZER_WRITE_TYPE[field.type.internalType as PulseType.F32][
        field.type.externalType! as PulseQuantizedType
      ];
    this.writeLine(
      `\t\twriter.${TO_WRITER_FUNCTION[field.type.externalType as PulseType.F32]}(Quantaizer.${qunatizer}(value.${field.name}, ${field.type.quantizedStep!}))`,
    );
  }

  private generateExternalFieldWriter(field: ParserField) {
    if (field.type.externalType)
      this.writeLine(
        `\t\twriter.${TO_WRITER_FUNCTION[field.type.externalType]}(value.${field.name})`,
      );
  }

  private generateFieldWriter(field: ParserField) {
    this.writeLine(
      `\t\twriter.${TO_WRITER_FUNCTION[field.type.internalType]}(value.${field.name})`,
    );
  }

  private generateFromUint8Array(pkg: ParserPackage) {
    this.writeLines(
      `\tpublic static fromUint8Array(value: Uint8Array): I${pkg.name} {`,
      `\t\tconst reader = new BufferReader(value)`,
      `\t\tif (reader.readVarU32() !== ${pkg.index}) throw new Error("Read package type mismatch")`,
    );
    if (pkg.header === PulseHeader.Partial) {
      this.writeLine("\t\tconst bitmask = reader.readVarU32()");
    }
    this.writeLine(`\t\treturn {`);
    for (const field of pkg.fields) {
      if (field.type.externalType) {
        if (field.type.quantizedStep) {
          if (
            field.type.internalType === PulseType.F32 &&
            PulseQuantizedTypes.includes(field.type.externalType!)
          ) {
            this.generateQunatizeFieldReader(
              field,
              pkg.name,
              field.isPartial && !field.isStatic,
            );
            continue;
          }
        }
        this.generateExternalFieldReader(
          field,
          pkg.name,
          field.isPartial && !field.isStatic,
        );
        continue;
      }
      this.generateFieldReader(
        field,
        pkg.name,
        field.isPartial && !field.isStatic,
      );
    }
    this.writeLines("\t\t}", "\t}");
  }

  private generateQunatizeFieldReader(
    field: ParserField,
    packageName: string,
    isPartial?: boolean,
  ) {
    const qunatizer =
      TO_QUNATIZER_READ_TYPE[field.type.internalType as PulseType.F32][
        field.type.externalType! as PulseQuantizedType
      ];
    if (isPartial)
      this.writeLines(
        `\t\t\t${field.name}: bitmask & 1 << E${packageName}Bitmask.${field.name} ?Quantaizer.${qunatizer}(reader.${TO_READER_FUNCTION[field.type.externalType as PulseType.F32]}(), ${field.type.quantizedStep!}) : undefined,`,
      );
    else
      this.writeLines(
        `\t\t\t${field.name}: Quantaizer.${qunatizer}(reader.${TO_READER_FUNCTION[field.type.externalType as PulseType.F32]}(), ${field.type.quantizedStep!}),`,
      );
  }

  private generateExternalFieldReader(
    field: ParserField,
    packageName: string,
    isPartial?: boolean,
  ) {
    if (isPartial)
      this.writeLines(
        `\t\t\t${field.name}: bitmask & 1 << E${packageName}Bitmask.${field.name} ? reader.${TO_READER_FUNCTION[field.type.externalType!]}() : undefined,`,
      );
    else
      this.writeLines(
        `\t\t\t${field.name}: reader.${TO_READER_FUNCTION[field.type.externalType!]}(),`,
      );
  }

  private generateFieldReader(
    field: ParserField,
    packageName: string,
    isPartial?: boolean,
  ) {
    if (isPartial)
      this.writeLines(
        `\t\r\t${field.name}: bitmask & 1 << E${packageName}Bitmask.${field.name} ? reader.${TO_READER_FUNCTION[field.type.internalType]}() : undefined,`,
      );
    else
      this.writeLines(
        `\t\r\t${field.name}: reader.${TO_READER_FUNCTION[field.type.internalType]}(),`,
      );
  }

  private generateInterface(pkg: ParserPackage) {
    this.writeLine(`export interface I${pkg.name} {`);
    for (const field of pkg.fields) {
      if (field.isPartial && !field.isStatic)
        this.writeLine(
          `\t${field.name}?: ${TO_TYPE[field.type.internalType]};`,
        );
      else
        this.writeLine(`\t${field.name}: ${TO_TYPE[field.type.internalType]};`);
    }
    this.writeLine(`}`);
    if (pkg.header === PulseHeader.Partial) {
      this.writeLine(`export enum E${pkg.name}Bitmask {`);
      let bitmask = -1;
      for (const field of pkg.fields) {
        if (field.isPartial && !field.isStatic) {
          bitmask++;
          this.writeLine(`\t${field.name} = ${bitmask},`);
        }
      }
      this.writeLine(`}`);
    }
  }

  private writeLineWithoutNL(line: string) {
    this.fileContent += line;
  }

  private writeLine(line: string) {
    this.fileContent += line + "\n";
  }

  private writeLines(...lines: string[]) {
    for (const line of lines) {
      this.fileContent += line + "\n";
    }
  }
}
