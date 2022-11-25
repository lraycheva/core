import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import external from 'rollup-plugin-peer-deps-external';
import { terser } from "rollup-plugin-terser";
import copy from "rollup-plugin-copy";
import execute from "rollup-plugin-execute";
import del from 'rollup-plugin-delete';

export default [
    {
        input: 'src/export.ts',
        plugins: [
            del({ targets: 'dist/*' }),
            typescript(),
            commonjs(),
            resolve({
                mainFields: ["main", "module", "browser"],
            }),
            external(),
            terser({
                compress: true,
            }),
            copy({
                targets: [
                    { src: './assets/css/*.css', dest: 'dist/styles' },

                ]
            }),
            execute("npm run bundle:css")
        ],
        output: [{ dir: 'dist', format: 'es', sourcemap: true }]
    }
]