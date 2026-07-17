const input = `
PackedPlayer:
  id: u64 -> vu32
  name: str
  x: f32 
  y: f32
  radius: f32
  speed: f32
  energy: f32
  max_energy: f32
  death_timer: f32
  state: u8
  state_meta: f32
  area: vu32
  world: str
  downed: bool
  hero: u32

PackedEntity:
  id: u64 -> vu32
  type_id: vu32
  x: f32
  y: f32
  radius: f32
  harmless: bool
  state: u8
  state_meta: f32
  alpha: f32

PartialEntity(Partial):
  +id: u64 -> vu32
  type: char
  x: f32 -> f16
  y: f32 -> f16
  radius: f32 -> uq8(0.5)
  harmless: bool
  state: u8
  state_meta: f32 -> uq16(0.5)
  alpha: f32 -> uq8(0.39) 
`;
import { TypeScriptGenerator } from "./gen/typescript";
import PulseLexer from "./lexer";
import { PulseParser } from "./parser";
import { Validator } from "./validator";
import { writeFileSync } from "fs";

const lexer = new PulseLexer(input);
const tokens = lexer.tokenize();
const parser = new PulseParser(tokens);
const parsed = parser.parse();
new Validator(parsed).validate();
const generator = new TypeScriptGenerator(parsed);

generator.generate();

writeFileSync("test_t.ts", generator.finish());
