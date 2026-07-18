import { ParserPackage, ParserField } from "../../parser";
import { PulseHeader, PulseQuantizedType, PulseType } from "../../types";
import { TO_QUNATIZER_WRITE_TYPE, TO_WRITER_FUNCTION } from "../consts";
import { TypeScriptGenerator } from "../typescript";

export class GenerateTypeScriptWrite {
  public static genFunction(
    typescript: TypeScriptGenerator,
    pkg: ParserPackage,
  ) {
    typescript.writeLines(
      `\tprivate static writePackage(value: I${pkg.name}, writer: BufferWriter) {`,
      `\t\twriter.writeVarU32(${pkg.index})`,
    );
    if (pkg.header === PulseHeader.Partial)
      this.genBitmaskHeader(typescript, pkg);
    for (const field of pkg.fields) {
      this.genField(typescript, field);
    }
    typescript.writeLines("\t}");
  }

  private static genField(typescript: TypeScriptGenerator, field: ParserField) {
    if (field.isPartial && !field.isStatic) {
      if (field.type.isArray) {
        typescript.writeLines(
          `\t\tif (value["${field.name}"] != undefined) {`,
          `\t\t\twriter.writeVarU32(value["${field.name}"].length);`,
          `\t\t\tfor (const i in value["${field.name}"]) {`,
          `\t\t\t\t${this.genValue(field, "i")}`,
          `\t\t\t}`,
          `\t\t}`,
        );
      } else {
        typescript.writeLines(
          `\t\tif (value["${field.name}"] != undefined)`,
          `\t\t\t${this.genValue(field)}`,
        );
      }
    } else {
      if (field.type.isArray) {
        typescript.writeLines(
          `\t\t\twriter.writeVarU32(value["${field.name}"].length);`,
          `\t\t\tfor (const i in value["${field.name}"]) {`,
          `\t\t\t\t${this.genValue(field, "i")}`,
          `\t\t\t}`,
        );
      } else {
        typescript.writeLines(`\t\t${this.genValue(field)}`);
      }
    }
  }

  private static genValue(field: ParserField, arrayIndex?: string): string {
    if (field.type.quantizedStep) {
      const quantizer =
        TO_QUNATIZER_WRITE_TYPE[field.type.internalType as PulseType.F32][
          field.type.externalType! as PulseQuantizedType
        ];
      if (field.type.externalType)
        return `writer.${TO_WRITER_FUNCTION[field.type.externalType]}(Quantaizer.${quantizer}(value["${field.name}"]${arrayIndex ? `[${arrayIndex}]` : ""}, ${field.type.quantizedStep}))`;
      else
        return `writer.${TO_WRITER_FUNCTION[field.type.internalType]}(Quantaizer.${quantizer}(value["${field.name}"]${arrayIndex ? `[${arrayIndex}]` : ""}, ${field.type.quantizedStep}))`;
    } else {
      if (field.type.externalType)
        return `writer.${TO_WRITER_FUNCTION[field.type.externalType]}(value["${field.name}"]${arrayIndex ? `[${arrayIndex}]` : ""})`;
      else
        return `writer.${TO_WRITER_FUNCTION[field.type.internalType]}(value["${field.name}"]${arrayIndex ? `[${arrayIndex}]` : ""})`;
    }
  }

  private static genBitmaskHeader(
    typescript: TypeScriptGenerator,
    pkg: ParserPackage,
  ) {
    typescript.writeLine(`\t\tlet bitmask = 0`);
    for (const field of pkg.fields) {
      if (field.isStatic) continue;
      typescript.writeLines(
        `\t\tif (value.${field.name} != undefined)`,
        `\t\t\tbitmask |= 1 << E${pkg.name}Bitmask.${field.name}`,
      );
    }
    typescript.writeLine("\t\twriter.writeVarU32(bitmask)");
  }
}
