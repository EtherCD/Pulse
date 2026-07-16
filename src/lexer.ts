export enum LexerTokenType {
  STRING,
  DOTS,
  TO,
  LPARENTHESES,
  RPARENTHESES,
  LBRACKETS,
  RBRACKETS,
  EQUALS,
  NUMBER,
  SPACE,
}

export interface LexerToken {
  type: LexerTokenType;
  value: string | number | null | boolean;
  line: number;
  column: number;
}

export default class PulseLexer {
  input: string;
  length: number;
  position: number;
  line: number;
  column: number;
  tokens: Array<LexerToken>;

  static tokenTypes: Record<string, LexerTokenType> = {
    ":": LexerTokenType.DOTS,
    "(": LexerTokenType.LPARENTHESES,
    ")": LexerTokenType.RPARENTHESES,
    "[": LexerTokenType.LBRACKETS,
    "]": LexerTokenType.RBRACKETS,
    "=": LexerTokenType.EQUALS,
    "-": LexerTokenType.TO,
  } as const;

  static tokenKeys = new Set([":", "(", ")", "[", "]", "="]);

  constructor(input: string) {
    this.input = input;
    this.length = input.length;
    this.position = 0;
    this.line = 0;
    this.column = 0;
    this.tokens = [];
  }

  tokenize(): Array<LexerToken> {
    try {
      while (this.position < this.length) {
        let char = this.peek(0);

        if (/\d/.test(char)) this.number();
        else if (
          PulseLexer.tokenKeys.has(char) &&
          !(this.peek(1) === "," && char === ",")
        ) {
          this.addToken(PulseLexer.tokenTypes[char], char);
          this.next();
        } else if (char === "-") {
          this.addToken(PulseLexer.tokenTypes[char], char + ">");
          this.next();
        } else if (/[\s\n]/.test(char)) {
          this.addToken(LexerTokenType.SPACE, char);
          this.next();
        } else if (
          char != "\n" &&
          char !== ":" &&
          char !== " " &&
          char !== "-" &&
          char !== ">"
        )
          this.text();
        else this.next();
      }
    } catch (e) {
      console.error(e);
    }

    return this.tokens;
  }

  private number() {
    let buffer = "";
    let current = this.peek(0);
    while (this.position < this.length) {
      if (current === ".") {
        //if (buffer.indexOf(".") != -1)
        //throw new LexerError("Invalid float number", this.position);
      } else if (!/\d/.test(current)) {
        break;
      }
      if (current === ")") {
        break;
      }

      buffer += current;
      current = this.next();
    }
    this.addToken(
      LexerTokenType.NUMBER,
      buffer.indexOf(".") != -1 ? parseFloat(buffer) : parseInt(buffer),
    );
  }

  private text() {
    let buffer = "";
    let current = this.peek(0);
    while (this.position < this.length) {
      if (
        PulseLexer.tokenKeys.has(current) ||
        /\s/.test(current) ||
        this.position > this.input.length
      )
        break;
      buffer += current;
      current = this.next();
    }
    this.addToken(LexerTokenType.STRING, buffer);
  }

  private next() {
    if (this.peek(0) === "\n") {
      this.line++;
      this.column = 0;
    }
    this.position++;
    this.column++;
    return this.peek(0);
  }

  private peek(index: number): string {
    let position = this.position + index;
    if (position >= this.length) return "\0";
    return this.input[position];
  }

  private addToken(
    type: LexerTokenType,
    value: number | string | boolean | null,
  ) {
    this.tokens.push({
      type,
      value,
      line: this.line,
      column: this.column,
    });
  }
}
