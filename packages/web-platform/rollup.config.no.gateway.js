import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import pkg from './package.json';
import alias from '@rollup/plugin-alias';

export default {
    input: 'src/index.ts',
    output: [
        {
            file: './dist/platform.web.no.gateway.es.js',
            format: 'es',
            sourcemap: true
        }
    ],
    external: [
        //...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
    ],

    plugins: [
        alias({
            entries: [
                { find: '@glue42/gateway-web/web/gateway-web.js', replacement: './no-gateway' }
            ]
        }),
        typescript({
            typescript: require('typescript')
        }),
        // Allow json resolution
        json(),
        // // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
        commonjs(),
        // // Allow node_modules resolution, so you can use 'external' to control
        // // which external modules to include in the bundle
        // // https://github.com/rollup/rollup-plugin-node-resolve#usage
        resolve({
            mainFields: ['module', 'main', 'browser']
        })

        // // Resolve source maps to the original source
        // sourceMaps(),
    ],
};
