import PulseLexer from "./lexer";
import { PulseParser } from "./parser";

const input = `
PartialPlayer:
  id: u64 -> vu32
  name: str
  x: f32 -> vq16(step=0.5)
  y: f32 -> vq16(step=0,.5)
  radius: f32 -> vq16(step=0.5)
  speed: f32 -> vq16(step=0.5)
  energy: f32 -> vq16(step=0.5)
  max_energy: f32 -> vq16(step=0.5)
  death_timer: q8 -> q8(step=0.6)
  state: u8
  state_meta: f32 -> vq16(step=0.5)
  area: u64 -> vu32
  world: str
  downed: bool
`;

const lexer = new PulseLexer(input);
const tokens = lexer.tokenize();
console.log(tokens);
const parser = new PulseParser(tokens);
const parsed = parser.parsePackage();

console.log(parsed.fields);
