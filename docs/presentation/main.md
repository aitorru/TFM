---
marp: true
title: Secure speedup of the future JavaScript deployments
paginate: true
theme: gaia
backgroundColor: black
color: white
---

# Secure speedup of the future JavaScript deployments

Aitor Ruiz Garcia

Director: Pedro Peris Lopez

---

# Context

This project builds on top of another project called ["Investigación y desarrollo del uso de la técnlogia blockchain como validador de identidates distribuidas y facilitador de almacenamiento y computación descentralizada"](https://github.com/aitorru/tfg-self-sovereign-identity).

---

- The main focus of that project is the creation a self-sovereign identity system based on blockchain technology. <!-- That's a mouthfull of words, but in a nutshell it aims to create a whole new login paradigm -->

- It aims to give back the control of the identity to the user. <!-- It aims to give the identity back to the user. Insteath of relying on google for example, we rely on all the users of the blockchain to verify our identity. -->

- Create a decentralized storage and computation system. <!-- To go all the way with the decentralized aproach, nor the data nor the computation must live in a centralized manner. That woult mean the data owner woult be a mayor company and the user would have to trust them. -->

- It has to be a website that allows the user to create an identity, store files and execute code acordinly. <!-- As the state-of-art for login and working with identity is the web this project would be to. -->

---

<!-- _backgroundColor: orange  -->
<!-- _color: black  -->

# JavaScript was used

- Has found a lot of success in the last years, both in the client and the server.
- Is the most popular language in the world. <!-- As is the default languge of the web, it was only option. -->
- _Is the only language that can be executed in the browser_. <!-- This will be revisited later -->

---

<!-- _backgroundColor: orange  -->
<!-- _color: black  -->

# JavaScript was used

- Next.js was used to create the website.
- Multiple depencencies were needed to comunicate between all the different parts of the project.
- 26 dependencies and 6 dev dependencies were necessary.

---

<!-- _backgroundColor: orange  -->
<!-- _color: black  -->

# JavaScript is not perfect.

During the development of the project, multiple problems were found:

- JavaScript is not a typed language. <!-- The comunication with the needed libraries was not typed and multiple runtime errors could have been prevented -->
- JavaScript is slow. <!-- Metamask used to crash-->
- JavaScript `node_modules` is heavy.

---

<!-- _backgroundColor: orange  -->
<!-- _color: black  -->

# Node.js also has some problems.

### Ryan Dahl, creator of Node.js, admited in 2018 that the desing of Node.js was made without a clear path and that it has some problems.

- `node_modules`. <!-- Not only the folder but also the package.json-->
- Node native modules. <!-- Not only I belive Node.js is bad for perfonmace so more developers noticed.-->
- Lack of types.

---

<!-- _backgroundColor: white  -->
<!-- _color: black  -->

# Those are the same problems that were encountered!

### Thats why Ryan Dahl created Deno.

![width:300px](https://raw.githubusercontent.com/denolib/high-res-deno-logo/master/deno_hr_circle.svg)

<!-- Deno was announced in 2018 first using Go and later using Rust. He wanted to use more Promises.  -->

---

<!-- _backgroundColor: #007acc  -->
<!-- _color: white  -->

# Lack of types? - TypeScript

- TypeScript is a superset of JavaScript that adds types to the language.
- It is a very popular language and it is used in multiple projects.

As JavaScript was used more and more in bigger projects, the need for types was more and more evident. The comunication between segments of the application may be complex and runtime errors could appear.

---

# Tackling the speed problems

### Currently, the state-of-the-art solution for creating native modules is `node-gyp`.

#### `node-gyp` comes with its own problems:

- It is hard to use. <!-- deep C++ understanding. Or importing convertion types.-->
- It is written in python. <!-- It is not a problem per se, but it is a problem that a necessary tool for a language its written in another language.. -->
- It comes from a proprietary project from google. <!-- Tech debt -->

---

<!-- _backgroundColor: white  -->
<!-- _color: black  -->

# Deno aproach

### Deno aproaches FFI in a different way.

- It does not depend in a build tool. <!-- It can work with any dll. -->
- It is fully compatible with all dynamic libraries.

---

# Deno url imports

- Deno uses url imports instead of npm packages. <!-- To counter the use of node_modules folder is to remove it completlly. Only node uses this type of dependency instalation.-->

```TypeScript
import { Progressbar } from "https://deno.land/x/deno_progress@0.6.0/mod.ts";
```

---

# Deno url imports

- It can also use npm packages. <!-- It is still in development. -->
- This packages also get cached. <!-- Talk about npm pnmp and bun. -->

```TypeScript
import express from "npm:express@4.18.2";
```

---

<!-- _backgroundColor: white  -->
<!-- _color: black  -->

# Deno aproach

### Deno is secure by default

![width:850px](../animations/denoflags.gif) <!-- Hablar sobre los flags. -->

---

# What requirements does a native module ready laguage need?

- It need to be C ABI compatible.
- It needs to be able to generate dynamic libraries.
- Needs to be fast.

---

# How to build a native module in Deno in a sensible way?

- Rust
- C++
- C
- Zig
- Go
- WASM
- ...

---

# However not all of them are good choices.

### C++, C are not memory safe.

While C++ and C are very fast languages, they are not memory safe. This means that the developer has to be very careful when using them. If the developer is not careful, the application may have memory leaks or even worse, security vulnerabilities.

---

# However not all of them are good choices.

### Go has a garbage collector.

Go is a very fast language, but it has a garbage collector. The resulting binary will be bigger, and as the is garbage collected, it will not be as fast as it could be.

---

# However not all of them are good choices.

### Zig is good... but not mature enough.

While Zig is a very good language, it is not mature enough.

- The language is still in development.
- _It is not memory safe._

---

# WASM - Web Assembly

# A compilation target for the web.

- Its speed is comparable to native performance.
- It runs in a VM.
- It can run on a browser but only with JavaScript calling it.
- It can run on a server not depending on JavaScript.

---

# Rust it is!

<!-- _backgroundColor: white  -->
<!-- _color: black  -->

- It is memory safe.
- It is fast.
- It is C ABI compatible.
- It can generate dynamic libraries and more.
  ![width:300px](https://www.rust-lang.org/static/images/rust-logo-blk.svg)

---

# The main bottleneck of the project was the cryptography.

- The excution of cryptographic algorithms was slow.
- It was able to crash the browser.
- The lack of types was a problem.

---

The main parts of the project, among others, were:

- IPFS
  ![width:150px](https://ipfs.tech/_nuxt/ipfs-logo.a313bcee.svg)
- OrbitDB
  ![width:250px](https://raw.githubusercontent.com/orbitdb/orbitdb/main/images/orbit_db_logo_color.png)

---

<!-- _backgroundColor: #51b8bc -->

# IPFS - InterPlanetary File System

- Decentralized storage system.
- It is a peer-to-peer network.
- It uses cryptographic functions.

---

# OrbitDB - Decentralized database

<!-- _backgroundColor: #ef4f80 -->
<!-- _color: white -->

- Works with IPFS.
- It uses even more cryptographic functions.

---

# Let's create a Rust library!

![width:1000px](../animations/build-final.gif)

---

# Let's create a Rust library!

- Create a function for export.

```rust
#[no_mangle]
extern "C" fn hash(input_text_pointer: *const c_char, cost: u32) -> *mut c_char {
    // ...
}
```

---

# Let's create a Rust library!

- Create the TypeScript glue code.

```typescript
async hash(input: string, cost = 12): Promise<string> {
    // ...
    const hased_pointer = await this.instance.symbols.hash(
      Deno.UnsafePointer.of(buffer),
      cost,
    );
    // ...
    const raw_pointer = new Deno.UnsafePointerView(hased_pointer);
    return raw_pointer.getCString();
  }
```

---

# Wich cryptographic functions were used?

- bcrypt
- NaCl

---

# Why bcrypt?

### _Bcrypt is a password hashing function._

- Blowfish.
- Slow by design.
- Salt

---

# Why NaCl?

### Specifically, the `tweetNaCl` implementation.

- It is a very small implementation of NaCl.
- It is very fast.
- It is very secure.

---

# Does it work?

---

# Does it work?

# Yes!

---

# Does it work?

### Hashing

![width:570px](../images/hashing_lines.png)

---

# Does it work?

### Symectric encryption - Secret box

![width:570px](../images/secretbox_lines.png)

---

# Does it work?

### Asymetric encryption - box

![width:570px](../images/box_lines.png)

---

<!-- Scoped style -->
<style scoped>
h1 {
  text-align: center;
  font-size: 4rem; /* 128px */
  line-height: 1;
}
</style>

# Conclusions

---

<!-- Scoped style -->
<style scoped>
h1 {
  text-align: center;
  font-size: 4rem; /* 128px */
  line-height: 1;
}
</style>

# Questions?
