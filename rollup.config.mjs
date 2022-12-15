// Contents of the file /rollup.config.js
import fs from "fs";
import path from "path";
import process from "process";
import { rollup } from "rollup";
import ts from 'rollup-plugin-ts';
import copy from 'rollup-plugin-copy';
import pkg from './package.json' assert { type: "json" };

/** Bases the paths to the `lib` folder */
function lib(...paths) {
  return path.resolve(process.cwd(), "lib", ...paths);
}

/** @type {import('rollup').InputOptions} */
const inputOptions = {
  input: "src/files.ts",
  external: ["guardex", "node-lienzo", "process", "path", "fs"],
  plugins: [ts(), copy({
    targets: [
      { src: 'README.md', dest: lib("") },
      { src: 'package.json', dest: lib("") },
    ]
  })]
};

/** @type {import('rollup').OutputOptions[]} */
const outputOptions = [
  {
    file: lib(pkg.module),
    format: 'esm',
    sourcemap: true,
  },
  {
    file: lib(pkg.main),
    format: 'cjs',
    sourcemap: true
  }]

const isDeclarationFile = (filename) => /\.d\.[mc]ts$/gui.test(filename);

function write(filename, data) {
  const dirname = path.dirname(filename)
  if (!fs.existsSync(dirname)) fs.mkdirSync(dirname);
  fs.writeFileSync(filename, data, {
    encoding: "utf8",
    flag: "wx"
  });
}

export async function build() {
  let isTypesBundledAlready = false;
  // Creating bundle instance
  const bundle = await rollup(inputOptions);
  for (const outputOption of outputOptions) {
    const { output } = await bundle.generate(outputOption);
    for (const _ of output) {
      if (_.type === "chunk") {
        // Writing code to its file
        write(outputOption.file, _.code);
        if (_.map) {
          // Write maps if enabled
          const name = `${outputOption.file}.map`;
          write(name, JSON.stringify(_.map));
        }
      } else {
        // Write only once the declaration file
        if (isDeclarationFile(_.fileName)) {
          if (!isTypesBundledAlready) {
            const name = lib(_.fileName.replace(/[mc]ts$/, "ts"));
            write(name, _.source);
            isTypesBundledAlready = true;
          } else continue;
        } else {
          // Write any other asset to the lib
          const name = lib(_.fileName);
          write(name, _.source);
        }
      }
    }
  }
  // Write to disk
  // writeSync(config.output.file, chunk);
  // Finishes bundle session
  await bundle.close();
}

build();
