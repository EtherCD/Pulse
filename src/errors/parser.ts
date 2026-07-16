import { LexerToken } from "../lexer";

export class ParseError extends Error {
  line: number;
  column: number;

  constructor(msg: string, token: LexerToken) {
    super(msg + ` (line ${token.line}, column ${token.column})`);
    this.line = token.line;
    this.column = token.column;
  }
}
