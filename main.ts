import RustyCrypto from "./lib.ts";
import * as bcrypt_deno from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { Progressbar } from "https://deno.land/x/deno_progress@0.6.0/mod.ts";

const TARGET_FILE = "./stats.csv";

// Clean the stats file
await Deno.writeTextFile(TARGET_FILE, "");

// TODO: Create static dic.
const random_text_generator = (length: number) => {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += crypto.randomUUID();
  }
  return result;
};

const FOR_INIT = 0;
const FOR_END = 10000;
const rs_lib = new RustyCrypto();

const bar = new Progressbar(
  "  Rust lib: |:bar| eta: :eta S | Current Tick: :current Total Ticks: :total | :percent",
  {
    total: FOR_END - FOR_INIT,
  }
);

for (let i = FOR_INIT; i < FOR_END; i++) {
  const data_to_encrypt = random_text_generator(i);

  const rs_compute = async () => {
    const rs_start_time = performance.now();

    const rs_hash = await rs_lib.hash(data_to_encrypt, 5);

    const rs_end_time = performance.now();

    const rs_elapsed_time = rs_end_time - rs_start_time;

    return { rs_hash, rs_elapsed_time };
  };

  const deno_compute = async () => {
    const deno_start_time = performance.now();

    const deno_hash = await bcrypt_deno.hash(data_to_encrypt);

    const deno_end_time = performance.now();

    const deno_elapsed_time = deno_end_time - deno_start_time;

    return { deno_hash, deno_elapsed_time };
  };

  const [rs_computed, deno_computed] = await Promise.all([
    rs_compute(),
    deno_compute(),
  ]);

  try {
    if (
      (await rs_lib.verify(data_to_encrypt, rs_computed.rs_hash)) &&
      (await bcrypt_deno.compare(data_to_encrypt, deno_computed.deno_hash))
    ) {
      // write stats to disk.

      await Deno.writeTextFile(
        TARGET_FILE,
        `${i},${Math.floor(rs_computed.rs_elapsed_time)},${Math.floor(
          deno_computed.deno_elapsed_time
        )}\n`,
        { append: true }
      );
      bar.tick(1);
    }
  } catch (_) {
    // Most likelly is a rust panic.
    // Todo: catch??
    continue;
  }
}

rs_lib.close();
