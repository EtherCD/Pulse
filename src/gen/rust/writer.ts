import { ParserPackage, ParserField } from "../../parser";
import { PulseHeader, PulseQuantizedType, PulseType } from "../../types";
import {
  TO_RUST_QUNATIZER_WRITE_TYPE,
  TO_RUST_TYPE,
  TO_WRITER_RUST_FUNCTION,
} from "./consts";
import { RustGenerator } from "../rust";

export class GenerateRustWrite {
  public static genFunction(typescript: RustGenerator, pkg: ParserPackage) {
    typescript.writeLines(
      `\tpub fn write_package(value: &${pkg.name}, writer: &mut BufferWriter) {`,
      `\t\twriter.write_var_u32(${pkg.index});`,
    );
    if (pkg.header === PulseHeader.Partial)
      this.genBitmaskHeader(typescript, pkg);
    for (const field of pkg.fields) {
      this.genField(typescript, field);
    }
    typescript.writeLines("\t}");
  }

  private static genField(typescript: RustGenerator, field: ParserField) {
    if (field.isPartial && !field.isStatic) {
      if (field.type.isArray) {
        typescript.writeLines(
          `\t\tif value.${field.name}.is_some() {`,
          `\t\t\twriter.write_var_u32(value.${field.name}.len() as u32);`,
          `\t\t\tfor i in &value.${field.name}.unwrap() {`,
          `\t\t\t\t${this.genValue(field, false, "i")}`,
          `\t\t\t}`,
          `\t\t}`,
        );
      } else {
        typescript.writeLines(
          `\t\tif value.${field.name}.is_some() {`,
          `\t\t\t${this.genValue(field, true)}`,
          `\t\t}`,
        );
      }
    } else {
      if (field.type.isArray) {
        typescript.writeLines(
          `\t\t\twriter.write_var_u32(value.${field.name}.len() as u32);`,
          `\t\t\tfor i in &value.${field.name} {`,
          `\t\t\t\t${this.genValue(field, false, "i")}`,
          `\t\t\t}`,
        );
      } else {
        typescript.writeLines(`\t\t${this.genValue(field, false)}`);
      }
    }
  }

  private static genValue(
    field: ParserField,
    unwrap: boolean,
    arrayIndex?: string,
  ): string {
    if (field.type.isNestedType) {
      return `${field.type.isNestedType}::write_package(${arrayIndex ? `${arrayIndex}` : `value.${field.name}`}, writer);`;
    } else if (field.type.quantizedStep) {
      const quantizer =
        TO_RUST_QUNATIZER_WRITE_TYPE[field.type.internalType as PulseType.F32][
          field.type.externalType! as PulseQuantizedType
        ];
      if (field.type.externalType)
        return `writer.${TO_WRITER_RUST_FUNCTION[field.type.externalType]}(Quantizer::${quantizer}(${arrayIndex ? `${arrayIndex}` : `value.${field.name}${unwrap ? ".unwrap()" : ""}`}, ${field.type.quantizedStep}));`;
      else
        return `writer.${TO_WRITER_RUST_FUNCTION[field.type.internalType]}(Quantizer::${quantizer}(${arrayIndex ? `${arrayIndex}` : `value.${field.name}${unwrap ? ".unwrap()" : ""}`}, ${field.type.quantizedStep}));`;
    } else {
      if (field.type.externalType)
        return `writer.${TO_WRITER_RUST_FUNCTION[field.type.externalType]}(${arrayIndex ? `${arrayIndex}` : `value.${field.name}${unwrap ? ".unwrap()" : ""}`} as ${TO_RUST_TYPE[field.type.externalType]});`;
      else if (field.type.internalType === PulseType.STR)
        return `writer.${TO_WRITER_RUST_FUNCTION[field.type.internalType]}(${arrayIndex ? `${arrayIndex}` : `value.${field.name}.clone()${unwrap ? ".unwrap()" : ""}`});`;
      else
        return `writer.${TO_WRITER_RUST_FUNCTION[field.type.internalType]}(${arrayIndex ? `${arrayIndex}` : `value.${field.name}${unwrap ? ".unwrap()" : ""}`});`;
    }
  }

  private static genBitmaskHeader(
    typescript: RustGenerator,
    pkg: ParserPackage,
  ) {
    typescript.writeLine(`\t\tlet mut bitmask: u32 = 0;`);
    for (const field of pkg.fields) {
      if (field.isStatic) continue;
      typescript.writeLines(
        `\t\tif value.x.is_some() {`,
        `\t\t\tbitmask |= 1 << ${pkg.name}Bitmask::${field.name} as u32;`,
        `\t\t}`,
      );
    }
    typescript.writeLine("\t\twriter.write_var_u32(bitmask);");
  }
}
