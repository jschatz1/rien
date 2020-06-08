#!/usr/bin/env node

const pkg = require("../package.json");

console.log(`/*!
 * rein v${pkg.version}
 * (c) ${new Date().getFullYear()} Jacob Schatz
 * @license MIT
 */`);
