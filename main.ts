import RustyCrypto from "./lib.ts";
import * as bcrypt_deno from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { Progressbar } from "https://deno.land/x/deno_progress@0.6.0/mod.ts";

const TARGET_FILE = "./stats.csv";

// Clean the stats file
await Deno.writeTextFile(TARGET_FILE, "Serie,Rust,Deno\n");

// TODO: Create static dic.
const random_text_generator = (length: number) => {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += crypto.randomUUID();
  }
  return result;
};

const FOR_INIT = 100;
const FOR_END = 200;
const FOR_STEP = 15;
const rs_lib = new RustyCrypto();

const bar = new Progressbar(
  "  Rust lib: |:bar| eta: :eta S | Current Tick: :current Total Ticks: :total | :percent",
  {
    total: (FOR_END - FOR_INIT) * FOR_STEP,
  },
);

for (let i = FOR_INIT; i < FOR_END + 1; i++) {
  const data_to_encrypt = random_text_generator(i);

  const rs_compute = async () => {
    const rs_start_time = performance.now();

    const rs_hash = await rs_lib.hash(data_to_encrypt, 10);

    const rs_end_time = performance.now();

    const rs_elapsed_time = rs_end_time - rs_start_time;

    return { rs_hash, rs_elapsed_time };
  };

  const deno_compute = async () => {
    const deno_start_time = performance.now();

    const deno_hash = await bcrypt_deno.hash(data_to_encrypt); // The default and only possible value is 10

    const deno_end_time = performance.now();

    const deno_elapsed_time = deno_end_time - deno_start_time;

    return { deno_hash, deno_elapsed_time };
  };

  let rs_computed_data = [];
  let deno_computed_data = [];

  // Run every test 20 times and get the average.
  for (let i = 0; i < FOR_STEP; i++) {
    rs_computed_data.push(await rs_compute());
    deno_computed_data.push(await deno_compute());
    bar.tick(1);
  }

  // Get the average
  const rs_computed = rs_computed_data.reduce((acc, curr) => {
    return {
      rs_hash: acc.rs_hash + curr.rs_hash,
      rs_elapsed_time: acc.rs_elapsed_time + curr.rs_elapsed_time,
    };
  }, { rs_hash: "", rs_elapsed_time: 0 });

  const deno_computed = deno_computed_data.reduce((acc, curr) => {
    return {
      deno_hash: acc.deno_hash + curr.deno_hash,
      deno_elapsed_time: acc.deno_elapsed_time + curr.deno_elapsed_time,
    };
  }, { deno_hash: "", deno_elapsed_time: 0 });

  const rs_avg = {
    rs_hash: "",
    rs_elapsed_time: rs_computed.rs_elapsed_time / rs_computed_data.length,
  };

  const deno_avg = {
    deno_hash: "",
    deno_elapsed_time: deno_computed.deno_elapsed_time /
      deno_computed_data.length,
  };

  try {
    if (
      (await rs_lib.verify(data_to_encrypt, rs_computed_data[0].rs_hash)) &&
      (await bcrypt_deno.compare(
        data_to_encrypt,
        deno_computed_data[0].deno_hash,
      ))
    ) {
      // write stats to disk.

      await Deno.writeTextFile(
        TARGET_FILE,
        `${i},${Math.floor(rs_avg.rs_elapsed_time)},${
          Math.floor(
            deno_avg.deno_elapsed_time,
          )
        }\n`,
        { append: true },
      );
    }
  } catch (_) {
    // Most likelly is a rust panic.
    // Todo: catch??
    continue;
  }
}

rs_lib.close();
