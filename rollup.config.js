// Contents of the file /rollup.config.js
import ts from 'rollup-plugin-ts';
import copy from 'rollup-plugin-copy';

/** @type {import('rollup').RollupOptions[]} */
const config = [
  {
    input: 'src/files.ts',
    output: {
      dir: 'lib',
      format: 'cjs',
    },
    plugins: [ ts(), copy({
      targets: [
        { src: 'README.md', dest: 'lib/' },
        { src: 'package.json', dest: 'lib/' },
      ]
    })]
  },
];

export default config;

