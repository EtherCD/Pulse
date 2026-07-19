import { ParserPackage } from "../parser";
import { PulseHeader } from "../types";
import { TO_TYPESCRIPT_TYPE } from "./typescript/consts";
import { GenerateTypeScriptRead } from "./typescript/reader";
import {
  staticTypeScriptBufferReader,
  staticTypeScriptBufferWriter,
  staticTypeScriptQuantaizer,
} from "./typescript/static";
import { GenerateTypeScriptWrite } from "./typescript/writer";

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
    GenerateTypeScriptWrite.genFunction(this, pkg);
    GenerateTypeScriptRead.genFunction(this, pkg);
    this.generateFromUint8Array(pkg);
    this.generateToUint8Array(pkg);
    this.writeLine(`}`);
  }

  private generateFromUint8Array(pkg: ParserPackage) {
    this.writeLines(
      `\tpublic static fromUint8Array(array: Uint8Array): I${pkg.name} {`,
      `\t\tconst reader = new BufferReader(array);`,
      `\t\treturn this.readPackage(reader);`,
      `\t}`,
    );
  }

  private generateToUint8Array(pkg: ParserPackage) {
    this.writeLines(
      `\tpublic static toUint8Array(object: I${pkg.name}): Uint8Array {`,
      `\t\tconst writer = new BufferWriter();`,
      `\t\tthis.writePackage(object, writer);`,
      `\t\treturn writer.toUint8Array();`,
      `\t}`,
    );
  }

  private generateInterface(pkg: ParserPackage) {
    this.writeLine(`export interface I${pkg.name} {`);
    for (const field of pkg.fields) {
      if (field.isPartial && !field.isStatic)
        this.writeLine(
          `\t${field.name}?: ${field.type.isNestedType ? "I" + field.type.isNestedType : TO_TYPESCRIPT_TYPE[field.type.internalType]}${field.type.isArray ? "[]" : ""};`,
        );
      else
        this.writeLine(
          `\t${field.name}: ${field.type.isNestedType ? "I" + field.type.isNestedType : TO_TYPESCRIPT_TYPE[field.type.internalType]}${field.type.isArray ? "[]" : ""};`,
        );
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

  public writeLineWithoutNL(line: string) {
    this.fileContent += line;
  }

  public writeLine(line: string) {
    this.fileContent += line + "\n";
  }

  public writeLines(...lines: string[]) {
    for (const line of lines) {
      this.fileContent += line + "\n";
    }
  }
}
