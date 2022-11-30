
let libPrefix = "";
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
    libPrefix = "lib"
    libSuffix = "so";
    break;
}

const lib = Deno.dlopen(`./target/${Deno.args[0] ? 'release' : 'debug'}/${libPrefix}tfm.${libSuffix}`, {
    add: {
        parameters: ['f64', 'f64'],
        result: 'f64'
    },
    hash : {
      parameters: ['pointer', 'u32'],
      result: 'pointer',
      nonblocking: true,
    },
    verify: {
      parameters: ['pointer', 'pointer'],
      result: 'bool',
      nonblocking: true,
    },
    string_test: {
      parameters: [],
      result: 'pointer'
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

/**
 * Hash a password using bcrypt.
 * @param input The input to hash with bcrypt
 * @param cost Cost of the operation.
 * @returns The desired hash.
 */
const hash = async (input: string, cost = 12): Promise<string> => {
  const buffer = new TextEncoder().encode(`${input}\0`);
   const raw_pointer = new Deno.UnsafePointerView(
    await lib.symbols.hash(
      Deno.UnsafePointer.of(buffer), 
      cost
      )
  )
  return raw_pointer.getCString(); 

  
}

const verify = (password: string, hash: string): Promise<boolean> => {
  return lib.symbols.verify(
    Deno.UnsafePointer.of(new TextEncoder().encode(`${password}\0`)), // NULL TERMINATED
    Deno.UnsafePointer.of(new TextEncoder().encode(`${hash}\0`))
  )
}

const string_test = (): string => {
  // Convert the raw pointer into a safe string
  return new Deno.UnsafePointerView(lib.symbols.string_test()).getCString()
} 

export default lib;

export {
    add,
    hash,
    verify,
    string_test
}