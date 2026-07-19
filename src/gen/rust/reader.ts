import { ParserPackage, ParserField } from "../../parser";
import {
  PulseHeader,
  PulseQuantizedType,
  PulseQuantizedTypes,
  PulseType,
} from "../../types";
import {
  TO_READER_RUST_FUNCTION,
  TO_RUST_QUNATIZER_WRITE_TYPE,
  TO_RUST_TYPE,
  TO_WRITER_RUST_FUNCTION,
} from "./consts";
import { RustGenerator } from "../rust";

export class GenerateTypeScriptRead {
  public static genFunction(typescript: RustGenerator, pkg: ParserPackage) {
    typescript.writeLines(
      `\tpub fn read_package(reader: &mut BufferReader): I${pkg.name} {`,
      `\t\tif (reader.readVarU32() !== ${pkg.index}) throw new Error("Read package type mismatch")`,
    );
    if (pkg.header === PulseHeader.Partial) {
      typescript.writeLine("\t\tconst bitmask = reader.readVarU32()");
    }
    typescript.writeLine(`\t\treturn {`);
    for (const field of pkg.fields) {
      if (field.type.externalType) {
        if (field.type.quantizedStep) {
          if (
            field.type.internalType === PulseType.F32 &&
            PulseQuantizedTypes.includes(field.type.externalType!)
          ) {
            this.genQuantizeFieldReader(typescript, field, pkg.name);
            continue;
          }
        }
        this.genExternalFieldReader(typescript, field, pkg.name);
        continue;
      }
      this.genFieldReader(
        typescript,
        field,
        pkg.name,
        field.isPartial && !field.isStatic,
      );
    }
    typescript.writeLines("\t\t}", "\t}");
  }

  private static genQuantizeFieldReader(
    typescript: RustGenerator,
    field: ParserField,
    packageName: string,
  ) {
    console.log(field.type);
    if (field.type.isArray)
      if (field.isPartial && !field.isStatic)
        typescript.writeLine(
          `\t\t\t${field.name}: Array.from({length: reader.readVarU32()}).map(() => ${this.genBitmaskConditionReader(this.genQuantizeValueReader(field), field, packageName)}),`,
        );
      else
        typescript.writeLine(
          `\t\t\t${field.name}: Array.from({length: reader.readVarU32()}).map(() => ${this.genQuantizeValueReader(field)}),`,
        );
    else if (field.isPartial && !field.isStatic)
      typescript.writeLine(
        `\t\t\t${field.name}: ${this.genBitmaskConditionReader(this.genQuantizeValueReader(field), field, packageName)},`,
      );
    else
      typescript.writeLine(
        `\t\t\t${field.name}: ${this.genQuantizeValueReader(field)},`,
      );
  }

  private static genExternalFieldReader(
    typescript: RustGenerator,
    field: ParserField,
    packageName: string,
  ) {
    if (field.type.isArray)
      if (field.isPartial && !field.isStatic)
        typescript.writeLine(
          `\t\t\t${field.name}: Array.from({length: reader.readVarU32()}).map(() => ${this.genBitmaskConditionReader(this.genValue(field), field, packageName)}),`,
        );
      else
        typescript.writeLine(
          `\t\t\t${field.name}: Array.from({length: reader.readVarU32()}).map(() => ${this.genValue(field)}),`,
        );
    else if (field.isPartial && !field.isStatic)
      typescript.writeLine(
        `\t\t\t${field.name}: ${this.genBitmaskConditionReader(this.genValue(field), field, packageName)},`,
      );
    else typescript.writeLine(`\t\t\t${field.name}: ${this.genValue(field)},`);
  }

  private static genFieldReader(
    typescript: RustGenerator,
    field: ParserField,
    packageName: string,
    isPartial?: boolean,
  ) {
    if (field.type.isArray)
      if (!isPartial)
        typescript.writeLine(
          `\t\t\t${field.name}: ${this.genArrayReader(this.genValue(field))},`,
        );
      else
        typescript.writeLine(
          `\t\t\t${field.name}: ${this.genBitmaskConditionReader(this.genArrayReader(this.genValue(field)), field, packageName)},`,
        );
    else if (!isPartial)
      typescript.writeLine(`\t\t\t${field.name}: ${this.genValue(field)},`);
    else
      typescript.writeLine(
        `\t\t\t${field.name}: ${this.genBitmaskConditionReader(this.genValue(field), field, packageName)},`,
      );
  }

  private static genArrayReader(innerContent: string): string {
    return `Array.from({length: reader.readVarU32()}).map(() => ${innerContent})`;
  }

  private static genQuantizeValueReader(field: ParserField): string {
    const qunatizer =
      TO_RUST_QUNATIZER_WRITE_TYPE[field.type.internalType as PulseType.F32][
        field.type.externalType! as PulseQuantizedType
      ];

    return `Quantaizer.${qunatizer}(${this.genValue(field)}, ${field.type.quantizedStep})`;
  }

  private static genValue(field: ParserField): string {
    if (field.type.isNestedType) {
      return `${field.type.isNestedType}.readPackage(reader)`;
    }
    if (field.type.externalType)
      return `reader.${TO_READER_RUST_FUNCTION[field.type.externalType!]}()`;
    else return `reader.${TO_READER_RUST_FUNCTION[field.type.internalType]}()`;
  }

  private static genBitmaskConditionReader(
    innerContent: string,
    field: ParserField,
    packageName: string,
  ): string {
    return `bitmask & 1 << E${packageName}Bitmask.${field.name} ? ${innerContent} : undefined`;
  }
}
