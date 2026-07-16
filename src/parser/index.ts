import PulseLexer, { LexerToken, LexerTokenType } from "../lexer";
import { PulseType } from "../types";
import { ParserPackage, ParserField, ParserType } from "./types";

export * from "./types";

export class PulseParser {
  tokens: Array<LexerToken>;
  position = 0;
  packageIndex = 0;

  constructor(tokens: Array<LexerToken>) {
    this.tokens = tokens;
  }

  static types: Record<string, PulseType> = {
    u8: PulseType.U8,
    i8: PulseType.I8,
    u16: PulseType.U16,
    i16: PulseType.I16,
    u32: PulseType.U32,
    vu32: PulseType.VU32,
    i32: PulseType.I32,
    f32: PulseType.F32,
    f64: PulseType.F64,
    u64: PulseType.U64,
    i64: PulseType.I64,
    q8: PulseType.Q8,
    q16: PulseType.Q16,
    vq16: PulseType.VQ16,
    str: PulseType.STR,
    bool: PulseType.BOOL,
  } as const;

  static typesKeys = new Set([
    "u8",
    "i8",
    "u16",
    "i16",
    "u32",
    "vu32",
    "i32",
    "f32",
    "f64",
    "u64",
    "i64",
    "q8",
    "q16",
    "vq16",
    "str",
    "bool",
  ]);

  parse(): ParserPackage[] {
    let packages: ParserPackage[] = [];
    while (this.position < this.tokens.length) {
      const parsedPackage = this.parsePackage();
      if (parsedPackage != null) {
        packages.push(parsedPackage);
      } else {
        return packages;
      }
    }
    return packages;
  }

  private parsePackage(): ParserPackage | null {
    if (!this.pick()) return null;
    this.skipSpaces();
    this.skipNextLines();
    this.skipSpaces();
    this.isLexerType(LexerTokenType.STRING);
    const lexerName = this.nextSkipSpaces();

    if (this.pick().type === LexerTokenType.LPARENTHESES) {
      this.nextSkipSpaces();
      while (
        this.pick() &&
        this.nextSkipSpaces().type !== LexerTokenType.RPARENTHESES
      ) {}
    }
    this.isLexerType(LexerTokenType.DOTS);
    this.next();
    this.skipNextLines();

    let fields: ParserField[] = [];
    while (this.pick() && this.pick().type === LexerTokenType.SPACE) {
      fields.push(this.parseField());
    }
    this.packageIndex++;
    return {
      name: lexerName.value as string,
      fields,
      index: this.packageIndex,
    };
  }

  private parseField(): ParserField {
    this.skipNextLines();
    this.skipSpaces();
    this.isLexerType(LexerTokenType.STRING);
    const nameToken = this.next();

    this.isLexerType(LexerTokenType.DOTS);
    this.nextSkipSpaces();
    const type = this.parseType();

    return {
      name: nameToken.value as string,
      type,
    };
  }

  private parseType(): ParserType {
    const internalType = this.parseTypeKey();
    const nextToken = this.pick();
    if (nextToken && nextToken.type === LexerTokenType.TO) {
      this.nextSkipSpaces();
      const externalType = this.parseTypeKey();
      const nextToken = this.pick();
      if (nextToken && nextToken.type === LexerTokenType.LPARENTHESES) {
        this.nextSkipSpaces();
        this.isLexerType(LexerTokenType.STRING);
        const parameterName = this.nextSkipSpaces();
        this.isLexerType(LexerTokenType.EQUALS);
        this.nextSkipSpaces();
        this.isLexerType(LexerTokenType.NUMBER);
        const parameterValue = this.nextSkipSpaces();
        this.isLexerType(LexerTokenType.RPARENTHESES);
        this.nextSkipSpace();
        this.skipNextLines();

        if ((parameterName.value as string) === "step") {
          return {
            internalType,
            externalType,
            quantizedStep: parameterValue.value as number,
          };
        }
      }
      this.skipNextLines();

      return {
        internalType,
        externalType,
      };
    }

    this.skipNextLines();
    return {
      internalType,
    };
  }

  private parseTypeKey(): PulseType {
    const token = this.pick();
    const tokenValue = token.value as string;
    if (
      this.isLexerType(LexerTokenType.STRING) &&
      PulseParser.typesKeys.has(tokenValue)
    ) {
      this.nextSkipSpace();

      return PulseParser.types[tokenValue];
    } else {
      throw new Error(
        "Unknown data type " +
          token.value +
          ` in line ${token.line} column ${token.column}`,
      );
    }
  }

  private skipSpaces() {
    if (this.pick())
      while (this.pick().type === LexerTokenType.SPACE) {
        this.next();
      }
  }

  private skipNextLines() {
    while (this.pick() && this.pick().type === LexerTokenType.NEXTLINE) {
      this.next();
    }
  }

  private nextSkipSpaces(): LexerToken {
    let next = this.next();
    while (this.pick().type === LexerTokenType.SPACE) {
      this.next();
    }
    return next;
  }

  private nextSkipSpace(): LexerToken {
    let next = this.next();
    if (this.pick().type === LexerTokenType.SPACE) {
      this.next();
    }
    return next;
  }

  private isLexerType(type: LexerTokenType): boolean {
    const token = this.pick();
    if (this.pick().type === type) {
      return true;
    }
    throw new Error(
      `Expected a token of type ${PulseLexer.typesToTokens[type]} but received ${PulseLexer.typesToTokens[token.type]} in line ${token.line} column ${token.column}`,
    );
  }

  private next(): LexerToken {
    return this.tokens[this.position++];
  }

  private pick(): LexerToken {
    return this.tokens[this.position];
  }
}
