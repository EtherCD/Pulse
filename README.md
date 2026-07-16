<div align="center">
<img src="misc/pulse.svg" width="75" alt="Pulse Logotype"/>
<h1>Pulse</h1>
<p>Highly efficient data transmission format</p>
</div>

## Key features

1. Classification of data types into internal and external.
2. Automatic number quantization
3. Bitmasks as a more efficient alternative to \`optional\`

## Stage

[x] Basic types
[x] Quantization
[ ] Arrays
[ ] Maps
[ ] BitMasks
[ ] Nestings

## Example Syntax

```
PartialPlayer(BitMask[u32]):
  +id: u64 -> vu32
  name: str
  x: f32 -> vq16(step=0.5)
  y: f32 -> vq16(step=0.5)
  radius: f32 -> vq16(step=0.5)
  speed: f32 -> vq16(step=0.5)
  energy: f32 -> vq16(step=0.5)
  max_energy: f32 -> vq16(step=0.5)
  death_timer: q8 -> vq8(step=0.6)
  state: u8
  state_meta: f32
  area: u64 -> uv32
  world: str
  downed: bool
```
