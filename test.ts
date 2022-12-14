import { assert } from "https://deno.land/std@0.165.0/testing/asserts.ts";
import RustyCrypto from "./lib.ts";
// import * as bcrypt_deno from "https://deno.land/x/bcrypt/mod.ts";

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
