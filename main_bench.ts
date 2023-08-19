import RustyCrypto from "./lib.ts";

Deno.bench("hash", async (b) => {
  const rs_lib = new RustyCrypto();
  b.start();
  await rs_lib.hash("Rust rocks!");
  b.end();
  rs_lib.close();
});
Deno.bench("secretbox", async (b) => {
  const rs_lib = new RustyCrypto();
  b.start();
  await rs_lib.secretbox(
    "S/tr7AxAFnt376o7VTMt5vVQ8sqPDzNMjOQ2hOWCB9I=",
    "ApAsVLwI0S+2RNpxdblflLiVF4Sp3Dlk",
    "Rust rocks!",
  );
  b.end();
  rs_lib.close();
});
Deno.bench("box", async (b) => {
  const rs_lib = new RustyCrypto();
  b.start();
  await rs_lib.box(
    "WwNYorEmuuVFQ5MroQHmvunWk8pK7Pev7vOF2F0rti8=",
    "S/tr7AxAFnt376o7VTMt5vVQ8sqPDzNMjOQ2hOWCB9I=",
    "ApAsVLwI0S+2RNpxdblflLiVF4Sp3Dlk",
    "Rust rocks!",
  );
  b.end();
  rs_lib.close();
});
