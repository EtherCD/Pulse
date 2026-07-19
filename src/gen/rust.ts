import { ParserPackage } from "../parser";
import { PulseHeader } from "../types";
import { TO_RUST_TYPE } from "./rust/consts";
import {
  staticRustBufferReader,
  staticRustBufferWriter,
  staticRustQuantaizer,
} from "./rust/static";
import { GenerateRustWrite } from "./rust/writer";
import { GenerateTypeScriptWrite } from "./typescript/writer";

export class RustGenerator {
  packages: ParserPackage[];
  fileContent = "";

  constructor(packages: ParserPackage[]) {
    this.packages = packages;
  }

  public generate() {
    this.generateStatic();
    this.generateStructs();
  }

  private generateStatic() {
    this.writeLines(staticRustBufferReader);
    this.writeLines(staticRustBufferWriter);
    this.writeLines(staticRustQuantaizer);
  }

  private generateStructs() {
    for (const pkg of this.packages) {
      if (pkg.header === PulseHeader.Partial) {
        this.writeLines(`#[repr(u32)]`, `pub enum ${pkg.name}Bitmask {`);
        let bitmask = -1;
        for (const field of pkg.fields) {
          if (field.isPartial && !field.isStatic) {
            bitmask++;
            this.writeLine(`\t${field.name} = ${bitmask},`);
          }
        }
        this.writeLine(`}`);
      }
      this.writeLines("#[derive(Debug, Clone)]", `pub struct ${pkg.name} {`);
      for (const field of pkg.fields) {
        if (field.isPartial && !field.isStatic)
          this.writeLine(
            `\t${field.name}: Option<${field.type.isArray ? "Vec<" : ""}${field.type.isNestedType ? field.type.isNestedType : TO_RUST_TYPE[field.type.internalType]}>${field.type.isArray ? ">" : ""},`,
          );
        else
          this.writeLine(
            `\t${field.name}: ${field.type.isArray ? "Vec<" : ""}${field.type.isNestedType ? field.type.isNestedType : TO_RUST_TYPE[field.type.internalType]}${field.type.isArray ? ">" : ""},`,
          );
      }
      this.writeLines(`}`);
      this.writeImplementation(pkg);
    }
  }

  private writeImplementation(pkg: ParserPackage) {
    this.writeLines(`impl ${pkg.name} {`);
    GenerateRustWrite.genFunction(this, pkg);
    this.writeLines(`}`);
  }

  public finish() {
    return this.fileContent;
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
