import { assert } from "https://deno.land/std@0.165.0/testing/asserts.ts";
import RustyCrypto from "./lib.ts";

Deno.test(
  "ffi_verify",
  async () => {
    const lib = new RustyCrypto();
    const hash = "$2a$12$LDcfCoNer8N.qDtkgjZekOBLdqB5uJbXPSEnfgiOAZhvw.S4FwT/6";
    const text = "ilovedeno";

    assert(
      await lib.verify(text, hash),
      "Hash check did not pass.",
    );

    lib.close();
  },
);
Deno.test(
  "ffi_hash",
  async () => {
    const lib = new RustyCrypto();
    const result = (await lib.hash("ilovedeno")).toString();
    assert(result);
    lib.close();
  },
);

Deno.test(
  "ffi_hash_and_verify",
  async () => {
    const lib = new RustyCrypto();
    const target_text = "iloveffi";
    const hashed_value = await lib.hash(target_text);

    const result = await lib.verify(target_text, hashed_value);

    assert(result);

    lib.close();
  },
);
Deno.test(
  "ffi_hash_and_verify_fail",
  async () => {
    const lib = new RustyCrypto();
    const target_text = "iloveffi";
    const hashed_value =
      "$2a$12$LDcfCoNer8N.qDtkgjZekOBLdqB5uJbXPSEnfgiOAZhvw.S4FwT/6";

    const result = await lib.verify(target_text, hashed_value);

    assert(!result);

    lib.close();
  },
);
Deno.test(
  "ffi_secretbox_encrypt",
  async () => {
    const lib = new RustyCrypto();
    const nonce = "ApAsVLwI0S+2RNpxdblflLiVF4Sp3Dlk";
    const key = "RGLSbtumR+PLDGKX2/WVqfnPL/rglGyRs0U1DQppJm8=";

    const message = "deno!";

    const result = await lib.secretbox(key, nonce, message);

    assert(result == "tIT+cUYJiozEPwb9BwY/1wIrolhY");

    lib.close();
  },
);
Deno.test(
  "ffi_secretbox_open",
  async () => {
    const lib = new RustyCrypto();
    const nonce = "ApAsVLwI0S+2RNpxdblflLiVF4Sp3Dlk";
    const key = "RGLSbtumR+PLDGKX2/WVqfnPL/rglGyRs0U1DQppJm8=";

    const encrypted_message = "tIT+cUYJiozEPwb9BwY/1wIrolhY";

    const result = await lib.open_secretbox(key, nonce, encrypted_message);

    assert(result == "deno!");

    lib.close();
  },
);
Deno.test(
  "ffi_box_encrypt",
  async () => {
    const lib = new RustyCrypto();
    const nonce = "ApAsVLwI0S+2RNpxdblflLiVF4Sp3Dlk";
    const peer_public_key = "WwNYorEmuuVFQ5MroQHmvunWk8pK7Pev7vOF2F0rti8=";
    const self_private_key = "S/tr7AxAFnt376o7VTMt5vVQ8sqPDzNMjOQ2hOWCB9I=";

    const message = "deno!";

    const result = await lib.box(
      peer_public_key,
      self_private_key,
      nonce,
      message,
    );
    assert(result == "K5lmw6xAfEflb0XT9kDXo4L06qpr");

    lib.close();
  },
);
Deno.test(
  "ffi_box_open",
  async () => {
    const lib = new RustyCrypto();
    const nonce = "ApAsVLwI0S+2RNpxdblflLiVF4Sp3Dlk";
    const peer_public_key = "WwNYorEmuuVFQ5MroQHmvunWk8pK7Pev7vOF2F0rti8=";
    const self_private_key = "S/tr7AxAFnt376o7VTMt5vVQ8sqPDzNMjOQ2hOWCB9I=";

    const message = "deno!";

    const encrypted_data = await lib.box(
      peer_public_key,
      self_private_key,
      nonce,
      message,
    );
    assert(encrypted_data == "K5lmw6xAfEflb0XT9kDXo4L06qpr");

    // Open the box

    const result = await lib.open_box(
      peer_public_key,
      self_private_key,
      nonce,
      encrypted_data,
    );

    assert(result == "deno!");

    lib.close();
  },
);
