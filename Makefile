lib:
	cargo build

test-ts:
	deno test --allow-ffi --unstable test.ts

test-rs:
	cargo test

run:
	deno run --allow-ffi --unstable main.ts