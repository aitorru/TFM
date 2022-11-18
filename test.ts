import { assertEquals } from "https://deno.land/std@0.165.0/testing/asserts.ts";
import { add } from "./lib.ts";

Deno.test(
    "ffi_add",
    () => {
        const result = add(1, 1);
        assertEquals(result, 2);
    }
)