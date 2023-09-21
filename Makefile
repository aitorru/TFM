lib:
	cargo build

lib-prod:
	cargo build --release

test-ts: lib
	deno test --allow-ffi --unstable test.ts

test-ts-prod: lib-prod
	deno test --allow-ffi --unstable test.ts -- true

test-ts-brk: lib
	deno test --allow-ffi --unstable --inspect-brk test.ts

test-rs: lib
	cargo test

run: lib
	deno run --allow-ffi --allow-hrtime --allow-write --allow-net --unstable main.ts

run-prod: lib-prod
	deno run --allow-ffi --allow-hrtime --allow-write --allow-net --unstable main.ts true

bench: lib
	deno bench --allow-ffi --unstable main_bench.ts

wasm: 
	cargo build --target wasm32-unknown-unknown

flame:
	flamegraph -o out.svg -- C:\Users\aitor\deno\target\debug\deno.exe test --allow-ffi --unstable test.ts

presentation:
	cd docs/presentation && deno run -A npm:@marp-team/marp-cli main.md