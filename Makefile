lib:
	cargo build

test-ts: lib
	deno test --allow-ffi --unstable test.ts

test-rs: lib
	cargo test

run: lib
	deno run --allow-ffi --unstable main.ts

wasm: 
	cargo build --target wasm32-unknown-unknown