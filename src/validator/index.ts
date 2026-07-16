import { ValidateError } from "../errors";
import { ParserPackage } from "../parser";
import { PulseQuantizeCandidates, PulseQuantizedTypes } from "../types";

export class Validator {
  packages: ParserPackage[];

  constructor(packages: ParserPackage[]) {
    this.packages = packages;
  }

  validate() {
    let names: string[] = [];
    for (const pkg of this.packages) {
      if (names.includes(pkg.name)) {
        throw new Error(`Duplicate package name ${pkg.name}`);
      }
      names.push(pkg.name);
      let fieldsNames: string[] = [];
      for (const field of pkg.fields) {
        const type = field.type;
        if (
          type.externalType &&
          PulseQuantizedTypes.includes(type.externalType) &&
          !PulseQuantizeCandidates.includes(type.internalType)
        ) {
          throw new ValidateError(
            `Unsupported type to quantize ${type.internalType}, need ${PulseQuantizeCandidates.join(" ")}`,
            pkg.name,
            field.name,
          );
        }
        if (fieldsNames.includes(pkg.name)) {
          throw new ValidateError(
            `Duplicate field name ${field.name} in package ${pkg.name}`,
            pkg.name,
            field.name,
          );
        }
        fieldsNames.push(field.name);
      }
    }
  }
}
