import { ValidateError } from "../errors";
import { ParserPackage } from "../parser";
import {
  PulseNumberTypes,
  PulseQuantizeCandidates,
  PulseQuantizedTypes,
  PulseType,
} from "../types";

const unsupportedTransformations: Map<PulseType, PulseType[]> = new Map();
unsupportedTransformations.set(PulseType.STR, [...PulseNumberTypes]);
for (const i of PulseNumberTypes) {
  unsupportedTransformations.set(i, [
    PulseType.BOOL,
    PulseType.CHAR,
    PulseType.STR,
  ]);
}

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
        if (
          type.externalType &&
          unsupportedTransformations.has(type.internalType)
        ) {
          const transformation = unsupportedTransformations.get(
            type.internalType,
          );
          if (transformation?.find((value) => value === type.externalType)) {
            throw new ValidateError(
              `Unsupported type conversion from ${type.internalType} to ${type.externalType}`,
              pkg.name,
              field.name,
            );
          }
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
