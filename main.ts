import { hash, verify } from "./lib.ts";
import * as bcrypt_deno from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

// TODO: Create static dic.
const random_text_generator = () => {
    let resulting_text = "";
    for(let i = 0; i < 10000; i++) {
        resulting_text = resulting_text + crypto.randomUUID();
    }
    return resulting_text;
}

const rust_hash_promises = [];

console.time('rust-ffi');

// Generate 10 random hashes in paralell.
for (let i = 0; i < 1;i++) {
    const uuidv4 = random_text_generator();
    rust_hash_promises.push(
        {
            original_value: uuidv4,
            hash: hash(uuidv4),
            result: false
        }
    )
}

const rust_final_results = await Promise.all(rust_hash_promises.map(
    async (promise) => {

        promise.result = await verify(promise.original_value, await promise.hash)

        return promise;
    }
))
console.timeEnd('rust-ffi');
console.log('Hashes done.');

console.log(
    rust_final_results.find(x => !x.result) === undefined ?
    '🥳 - All hash verify!!!' :
    `Some false found ${rust_final_results}`
);

const deno_hash_promises = [];

console.time('deno');


for (let i = 0; i < 50;i++) {
    const uuidv4 = random_text_generator();
    deno_hash_promises.push(
        {
            original_value: uuidv4,
            hash: bcrypt_deno.hash(uuidv4),
            result: false
        }
    )
}

const deno_final_results = await Promise.all(deno_hash_promises.map(
    async (promise) => {

        promise.result = await bcrypt_deno.compare(promise.original_value, await promise.hash)

        return promise;
    }
))
console.timeEnd('deno');
console.log('Hashes done.');

console.log(
    deno_final_results.find(x => !x.result) === undefined ?
    '🥳 - All hash verify!!!' :
    `Some false found ${deno_final_results}`
);