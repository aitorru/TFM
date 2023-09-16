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

---

# Context

This project builds on top of another project called ["Investigación y desarrollo del uso de la técnlogia blockchain como validador de identidates distribuidas y facilitador de almacenamiento y computación descentralizada"](https://github.com/aitorru/tfg-self-sovereign-identity).

---

- The main focus of that project is the creation a self-sovereign identity system based on blockchain technology.

- Self-sovereign identity is a concept that aims to give back the control of the identity to the user.

- To partner with this concept, the project also aims to create a decentralized storage and computation system.

- It has to be a website that allows the user to create an identity, store files and execute code acordinly.

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
- JavaScript is slow.
- JavaScript `node_modules` is heavy.

---

<!-- _backgroundColor: orange  -->
<!-- _color: black  -->

# Node.js also has some problems.

### Ryan Dahl, creator of Node.js, admited in 2018 that the desing of Node.js was made without a clear path and that it has some problems.

- `node_modules`.
- Node native modules.
- Lack of types.

---

<!-- _backgroundColor: white  -->
<!-- _color: black  -->

# Those are the same problems that were encountered!

### Thats why Ryan Dahl created Deno.

![width:300px](https://raw.githubusercontent.com/denolib/high-res-deno-logo/master/deno_hr_circle.svg)

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

- It is hard to use.
- It is written in python.
- It comes from a proprietary project from google.

---

<!-- _backgroundColor: white  -->
<!-- _color: black  -->

# Deno aproach

### Deno aproaches FFI in a different way.

- It does not depend in a build tool.
- It is fully compatible with all dynamic libraries.

---

# What requirements does a native module ready laguage need?

- It need to be C ABI compatible.
- It needs to be able to generate dynamic libraries.
- Needs to be fast.

---

# How to build a native module in Deno in a sensible way?

### There are multiple choices to consider:

- Rust
- C++
- C
- Zig
- Go
- ...

---

# However not all of them are good choices.

### C++, C are not memory safe.

While C++ and C are very fast languages, they are not memory safe. This means that the developer has to be very careful when using them. If the developer is not careful, the application may have memory leaks or even worse, security vulnerabilities.

---

# However not all of them are good choices.

### Go has a garbage collector.

Go is a very fast language, but it has a garbage collector. The resulting binary will be bigger, and as the is garbage collected, it will not be as fast as it could be.
