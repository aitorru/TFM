
let libSuffix = "";
// Detect the os
switch (Deno.build.os) {
  case "windows":
    libSuffix = "dll";
    break;
  case "darwin":
    libSuffix = "dylib";
    break;
  default:
    libSuffix = "so";
    break;
}

const lib = Deno.dlopen(`./target/debug/tfm.${libSuffix}`, {
    add: {
        parameters: ['f64', 'f64'],
        result: 'f64'
    }
})

/**
 * Get two numbers and add them
 * @param x First number to add.
 * @param y Seccond number to add.
 * @returns Returns the sum of x + y
 */
const add = (x: number, y: number) => {
    return lib.symbols.add(x, y);
}

export {
    add
}