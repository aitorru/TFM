lib:
	cargo build

lib-prod:
	cargo build --release

test-ts: lib
	deno test --allow-ffi --unstable test.ts

test-rs: lib
	cargo test

run: lib
	deno run --allow-ffi  --allow-net --unstable main.ts

run-prod: lib-prod
	deno run --allow-ffi  --allow-net --unstable main.ts true


wasm: 
	cargo build --target wasm32-unknown-unknown