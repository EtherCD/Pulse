import { Bench } from "tinybench";
import { Packages, UpdateEntities } from "./testdest/game";

const bench = new Bench({
  time: 1000,
});

const entity = {
  id: 1,
  x: 16.2,
  y: -16.2,
  state: 2,
};

const N = 1;
const items = Array.from({ length: N }).map((_, id) => ({
  id: 0n,
  x: -20,
  y: 10,
  harmless: false,
}));
const many = {
  items: [
    {
      update_entities: {
        items,
      },
    },
  ],
};
const encodedMany = Packages.toUint8Array(many);

bench
  .add("Encode " + N, () => {
    Packages.toUint8Array(many);
  })
  .add("Decode " + N, () => {
    Packages.fromUint8Array(encodedMany);
  });

await bench.run();

console.table(bench.table());
