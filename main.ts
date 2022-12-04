import RustyCrypto from "./lib.ts";
import * as bcrypt_deno from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const TARGET_FILE = "./stats.csv";

// Clean the stats file
await Deno.writeTextFile(TARGET_FILE, "");

// TODO: Create static dic.
const random_text_generator = (length: number) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

for (let i = 0; i < 10000; i++) {
  const data_to_encrypt = random_text_generator(i);

  const rs_lib = new RustyCrypto();

  const rs_start_time = performance.now();

  const rs_hash = await rs_lib.hash(data_to_encrypt);

  const rs_end_time = performance.now();

  const rs_elapsed_time = rs_end_time - rs_start_time;

  const deno_start_time = performance.now();

  const deno_hash = await bcrypt_deno.hash(data_to_encrypt);

  const deno_end_time = performance.now();

  const deno_elapsed_time = deno_end_time - deno_start_time;

  if (
    await rs_lib.verify(data_to_encrypt, rs_hash) &&
    await bcrypt_deno.compare(data_to_encrypt, deno_hash)
  ) {
    // write stats to disk.

    await Deno.writeTextFile(
      TARGET_FILE,
      `${i},${rs_elapsed_time},${deno_elapsed_time}\n`,
      { append: true },
    );
    rs_lib.close();
  }
}
