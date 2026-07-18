<div align="center">
  <img src="misc/pulsar.svg" width="75" alt="Pulse Logotype"/>
  <h1>Pulsar</h1>
  <p><strong>A Compiler for Pulse - Highly efficient data transmission format</strong></p>
</div>

## 📦 What is Pulse?

Pulse is a compact, fast and reliable serialization format designed for real‑time network exchange (games, IoT devices, etc.).  
It combines:

- **Internal / external type system** – internal types are used inside the application, while external types are sent over the wire.
- **Automatic number quantisation** – preserves precision across the entire range but stores only the minimal amount of bytes needed.
- **Bitmasks instead of `optional` fields** – saves space and simplifies parsing.

## 🛠️ Core Features

| #   | Feature                                                |
| --- | ------------------------------------------------------ |
| 1   | Separation of data into internal and external types    |
| 2   | Automatic quantisation of numbers (`q8`, `q16`, …)     |
| 3   | Bitmasks as a more efficient alternative to `optional` |

## 📋 Current Development Status

| Feature      | Status |
| ------------ | ------ |
| Basic types  | ✅     |
| Quantisation | ✅     |
| Arrays       | ✅     |
| Maps         | ❌     |
| BitMasks     | ✅     |
| Nestings     | ✅     |

> **Note:**  
> `✅` – implemented,  
> `❌` – work in progress.

## 📝 Syntax Example

```text
PartialEntity(Partial):
  +id: u64 -> vu32
  x: f32 -> q16(0.5)
  y: f32 -> q16(0.5)
  radius: f32 -> q16(0.5)
  harmless: bool
  state: u8
  state_meta: f32 -> q16(0.5)
  alpha: f32 -> q8(0.39)

UpdateEntities:
  values: PartialEntity[]
```

### Clarifications

| Symbol     | Meaning                                                                              |
| ---------- | ------------------------------------------------------------------------------------ |
| `+`        | Field is required in the `Partial` type.                                             |
| `->`       | The type before the arrow is internal; after it is external (sent over the network). |
| `uv32`     | Variable‑length unsigned integers (varint).                                          |
| `q16(0.5)` | Quantised number with a step of 0.5.                                                 |

### Supported Types

- `u8, i8, u16, i16, f16`
- `u32, i32, f32`
- `u64, i64, f64`
- `quantized8`, `quantized16` (quantised numbers)
- `uv` – variable‑length unsigned
- `iv` – variable‑length signed
- `str, bool, char`

> Quantised numbers keep precision across the full numeric range while reducing payload size.
