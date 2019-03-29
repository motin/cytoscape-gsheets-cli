import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';

const plugins = [
  commonjs(),
  nodeResolve({
    preferBuiltins: true,
  }),
  globals(),
  builtins(),
]

export default [{
  input: 'build/main/cli.js',
  output: {
    file: 'build/cli.js',
    format: 'iife',
    globals: {}
  },
  external: [],
  plugins
}];
