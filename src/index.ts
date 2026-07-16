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
`;
import PulseLexer from "./lexer";
import { PulseParser } from "./parser";

const lexer = new PulseLexer(input);
const tokens = lexer.tokenize();
const parser = new PulseParser(tokens);
const parsed = parser.parse();

if (parsed) console.log(parsed);
