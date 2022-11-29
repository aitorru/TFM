import { assert, assertEquals } from "https://deno.land/std@0.165.0/testing/asserts.ts";
import { add, hash, verify } from "./lib.ts";
// import * as bcrypt_deno from "https://deno.land/x/bcrypt/mod.ts";


Deno.test(
    "ffi_add",
    () => {
        const result = add(1, 1);
        assertEquals(result, 2);
    },
)
Deno.test(
    "ffi_verify",
    async () => {
        const hash = "$2a$12$LDcfCoNer8N.qDtkgjZekOBLdqB5uJbXPSEnfgiOAZhvw.S4FwT/6"
        const text = "ilovedeno"

        assert(await verify(text, hash), "Hash check did not pass.")
    }
)
Deno.test(
    "ffi_hash",
    async () => {
        const result = (await hash("ilovedeno")).toString()
        assert(result)
    }
)

Deno.test(
    "ffi_hash_and_verify",
    async () => {
        const target_text = "iloveffi";
        const hashed_value = await hash(target_text);

        const result = await verify(target_text, hashed_value);

        assert(result);
    }
)

Deno.test(
    "ffi_vs_JS_perf_test",
    async () => {
        const target_text = "iloveffi";
        const ffi_promises = [];
        console.time("ffi_benchmark");
        for (let i = 0; i < 5; i++) {
            ffi_promises.push(hash(target_text))
            console.timeLog("ffi_benchmark")
        }
        const results = await Promise.all(ffi_promises);
        console.log(results);
        console.timeEnd("ffi_benchmark")
        results.forEach(async pointer => {
            assert(await verify(target_text, pointer))
        })
    }
)