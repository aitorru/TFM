/**
 * ## RustyCrypto FFI API
 * Hash and Crypto utils
 */
class RustyCrypto {
  private instance:
    | Deno.DynamicLibrary<
      {
        hash: {
          parameters: ("u32" | "pointer")[];
          result: "pointer";
          nonblocking: true;
        };
        verify: { parameters: "pointer"[]; result: "bool"; nonblocking: true };
      }
    >
    | null = null;

  constructor() {
    if (this.instance === undefined || this.instance === null) {
      this.get_instance();
    }
    return this;
  }

  /**
   * Hash a password using bcrypt.
   * @param input The input to hash with bcrypt
   * @param cost Cost of the operation.
   * @returns The desired hash.
   */
  async hash(input: string, cost = 12): Promise<string> {
    if (this.instance === null) {
      throw {
        error: "Library is closed.",
      };
    }
    const buffer = new TextEncoder().encode(`${input}\0`);
    const raw_pointer = new Deno.UnsafePointerView(
      await this.instance.symbols.hash(
        Deno.UnsafePointer.of(buffer),
        cost,
      ),
    );
    return raw_pointer.getCString();
  }

  /**
   * Verify a hash with salt with the original text
   * @param password Plain text to verify
   * @param hash Hash to compare to
   * @returns Returns true if the plaintext produces that hash
   */
  verify(password: string, hash: string): Promise<boolean> {
    if (this.instance === null) {
      throw {
        error: "Library is closed.",
      };
    }
    return this.instance.symbols.verify(
      Deno.UnsafePointer.of(new TextEncoder().encode(`${password}\0`)), // NULL TERMINATED
      Deno.UnsafePointer.of(new TextEncoder().encode(`${hash}\0`)),
    );
  }

  close() {
    this.instance?.close();
    this.instance = null;
  }

  get_instance() {
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
        libPrefix = "lib";
        libSuffix = "so";
        break;
    }

    this.instance = Deno.dlopen(
      `./target/${
        Deno.args[0] ? "release" : "debug"
      }/${libPrefix}tfm.${libSuffix}`,
      {
        hash: {
          parameters: ["pointer", "u32"],
          result: "pointer",
          nonblocking: true,
        },
        verify: {
          parameters: ["pointer", "pointer"],
          result: "bool",
          nonblocking: true,
        },
      },
    );
  }
}

export default RustyCrypto;
