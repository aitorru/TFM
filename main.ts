import RustyCrypto from "./lib.ts";
import * as bcrypt_deno from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { Progressbar } from "https://deno.land/x/deno_progress@0.6.0/mod.ts";
import { encode } from "https://deno.land/std@0.197.0/encoding/base64.ts";
import {
  box,
  decodeBase64,
  encodeBase64,
  secretbox,
} from "./tweetnacl-deno/src/nacl.ts";

const HASH_TARGET_FILE = "./hash_stats.csv";
const SECRETBOX_TARGET_FILE = "./secretbox_stats.csv";
const BOX_TARGET_FILE = "./box_stats.csv";

// Clean the stats file
await Deno.writeTextFile(HASH_TARGET_FILE, "Serie,Rust,Deno\n");

// TODO: Create static dic.
const random_text_generator = (length: number) => {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += crypto.randomUUID();
  }
  return result;
};

const FOR_INIT = 1000;
const FOR_END = 1500;
const FOR_STEP = 10;
const rs_lib = new RustyCrypto();

let bar = new Progressbar(
  "  Rust lib: |:bar| eta: :eta S | :percent",
  {
    total: (FOR_END - FOR_INIT) * FOR_STEP,
  },
);

for (let i = FOR_INIT; i < FOR_END; i++) {
  const data_to_encrypt = random_text_generator(i);

  const rs_compute_hash = async () => {
    const rs_start_time = performance.now();

    const rs_hash = await rs_lib.hash(data_to_encrypt, 10);

    const rs_end_time = performance.now();

    const rs_elapsed_time = rs_end_time - rs_start_time;

    return { rs_hash, rs_elapsed_time };
  };

  const deno_compute_hash = async () => {
    const deno_start_time = performance.now();

    const deno_hash = await bcrypt_deno.hash(data_to_encrypt); // The default and only possible value is 10

    const deno_end_time = performance.now();

    const deno_elapsed_time = deno_end_time - deno_start_time;

    return { deno_hash, deno_elapsed_time };
  };

  const rs_computed_data = [];
  const deno_computed_data = [];

  // Run every test 20 times and get the average.
  for (let i = 0; i < FOR_STEP; i++) {
    const rs_comuted_hash = await rs_compute_hash();
    const deno_computed_hash = await deno_compute_hash();
    rs_computed_data.push(rs_comuted_hash);
    deno_computed_data.push(deno_computed_hash);

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
      deno_hash: "",
      deno_elapsed_time: acc.deno_elapsed_time + curr.deno_elapsed_time,
    };
  }, { deno_hash: "", deno_elapsed_time: 0 });

  const rs_avg = rs_computed.rs_elapsed_time / rs_computed_data.length;

  const deno_avg = deno_computed.deno_elapsed_time /
    deno_computed_data.length;

  try {
    // write stats to disk.

    await Deno.writeTextFile(
      HASH_TARGET_FILE,
      `${i},${rs_avg},${deno_avg}\n`,
      { append: true },
    );
  } catch (_) {
    // Most likelly is a rust panic.
    continue;
  }
}

bar.terminate();
bar = new Progressbar(
  "  Rust lib: |:bar| eta: :eta S | :percent",
  {
    total: (FOR_END - FOR_INIT) * FOR_STEP,
  },
);

// Calculate the secretbox
await Deno.writeTextFile(SECRETBOX_TARGET_FILE, "Serie,Rust,Deno\n");

for (let i = FOR_INIT; i < FOR_END; i++) {
  const data_to_encrypt = random_text_generator(i);

  const rs_compute_secretbox = async () => {
    const rs_start_time = performance.now();

    const private_key = "S/tr7AxAFnt376o7VTMt5vVQ8sqPDzNMjOQ2hOWCB9I=";
    const nonce = "ApAsVLwI0S+2RNpxdblflLiVF4Sp3Dlk";

    const rs_secretbox = await rs_lib.secretbox(
      private_key,
      nonce,
      data_to_encrypt,
    );

    const rs_end_time = performance.now();

    const rs_elapsed_time = rs_end_time - rs_start_time;

    return { rs_secretbox, rs_elapsed_time };
  };

  const deno_compute_secretbox = () => {
    const deno_start_time = performance.now();

    const private_key = decodeBase64(
      "S/tr7AxAFnt376o7VTMt5vVQ8sqPDzNMjOQ2hOWCB9I=",
    );
    const nonce = decodeBase64("ApAsVLwI0S+2RNpxdblflLiVF4Sp3Dlk");

    const deno_secretbox = secretbox(
      decodeBase64(encode(data_to_encrypt)),
      nonce,
      private_key,
    );

    const deno_end_time = performance.now();

    const deno_elapsed_time = deno_end_time - deno_start_time;

    return { deno_secretbox: encodeBase64(deno_secretbox), deno_elapsed_time };
  };
  const rs_computed_data = [];
  const deno_computed_data = [];

  for (let i = 0; i < FOR_STEP; i++) {
    const rs_computed_secretbox = await rs_compute_secretbox();
    const deno_computed_secretbox = deno_compute_secretbox();

    rs_computed_data.push(rs_computed_secretbox);
    deno_computed_data.push(deno_computed_secretbox);

    bar.tick(1);
  }

  const rs_computed = rs_computed_data.reduce((acc, curr) => {
    return {
      rs_secretbox: "",
      rs_elapsed_time: acc.rs_elapsed_time + curr.rs_elapsed_time,
    };
  }, { rs_secretbox: "", rs_elapsed_time: 0 });

  const deno_computed = deno_computed_data.reduce((acc, curr) => {
    return {
      deno_secretbox: "",
      deno_elapsed_time: acc.deno_elapsed_time + curr.deno_elapsed_time,
    };
  }, { deno_secretbox: "", deno_elapsed_time: 0 });

  const rs_avg = rs_computed.rs_elapsed_time / rs_computed_data.length;

  const deno_avg = deno_computed.deno_elapsed_time / deno_computed_data.length;

  try {
    await Deno.writeTextFile(
      SECRETBOX_TARGET_FILE,
      `${i},${rs_avg},${deno_avg}\n`,
      { append: true },
    );
  } catch (_) {
    continue;
  }
}

bar.terminate();
bar = new Progressbar(
  "  Rust lib: |:bar| eta: :eta S | :percent",
  {
    total: (FOR_END - FOR_INIT) * FOR_STEP,
  },
);

// Calculate the box
await Deno.writeTextFile(BOX_TARGET_FILE, "Serie,Rust,Deno\n");

for (let i = FOR_INIT; i < FOR_END; i++) {
  const data_to_encrypt = random_text_generator(i);

  const rs_compute_box = async () => {
    const rs_start_time = performance.now();

    const nonce = "ApAsVLwI0S+2RNpxdblflLiVF4Sp3Dlk";
    const peer_public_key = "WwNYorEmuuVFQ5MroQHmvunWk8pK7Pev7vOF2F0rti8=";
    const self_private_key = "S/tr7AxAFnt376o7VTMt5vVQ8sqPDzNMjOQ2hOWCB9I=";

    const rs_box = await rs_lib.box(
      peer_public_key,
      self_private_key,
      nonce,
      data_to_encrypt,
    );

    const rs_end_time = performance.now();

    const rs_elapsed_time = rs_end_time - rs_start_time;

    return { rs_box, rs_elapsed_time };
  };

  const deno_compute_box = () => {
    const deno_start_time = performance.now();

    const nonce = decodeBase64("ApAsVLwI0S+2RNpxdblflLiVF4Sp3Dlk");
    const peer_public_key = decodeBase64(
      "WwNYorEmuuVFQ5MroQHmvunWk8pK7Pev7vOF2F0rti8=",
    );
    const self_private_key = decodeBase64(
      "S/tr7AxAFnt376o7VTMt5vVQ8sqPDzNMjOQ2hOWCB9I=",
    );

    const deno_box = box(
      decodeBase64(encode(data_to_encrypt)),
      nonce,
      peer_public_key,
      self_private_key,
    );

    const deno_end_time = performance.now();

    const deno_elapsed_time = deno_end_time - deno_start_time;

    return { deno_box: encodeBase64(deno_box), deno_elapsed_time };
  };

  const rs_computed_data = [];
  const deno_computed_data = [];

  for (let i = 0; i < FOR_STEP; i++) {
    const rs_computed_box = await rs_compute_box();
    const deno_computed_box = deno_compute_box();

    rs_computed_data.push(rs_computed_box);
    deno_computed_data.push(deno_computed_box);

    bar.tick(1);
  }

  const rs_computed = rs_computed_data.reduce((acc, curr) => {
    return {
      rs_box: "",
      rs_elapsed_time: acc.rs_elapsed_time + curr.rs_elapsed_time,
    };
  }, { rs_box: "", rs_elapsed_time: 0 });

  const deno_computed = deno_computed_data.reduce((acc, curr) => {
    return {
      deno_box: "",
      deno_elapsed_time: acc.deno_elapsed_time + curr.deno_elapsed_time,
    };
  }, { deno_box: "", deno_elapsed_time: 0 });

  const rs_avg = rs_computed.rs_elapsed_time / rs_computed_data.length;

  const deno_avg = deno_computed.deno_elapsed_time / deno_computed_data.length;

  try {
    await Deno.writeTextFile(
      BOX_TARGET_FILE,
      `${i},${rs_avg},${deno_avg}\n`,
      { append: true },
    );
  } catch (_) {
    continue;
  }
}

rs_lib.close();
