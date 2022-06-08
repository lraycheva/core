import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import { terser } from "rollup-plugin-terser";
import copy from 'rollup-plugin-copy';
const packageJson = require('./package.json');

const globals = {
    react: 'React',
    'react-dom': 'ReactDOM',
    '@glue42/react-hooks': "glue-hooks"
};

export default [
    {
        input: 'src/index.tsx',
        output: [
            {
                file: packageJson.module,
                format: 'esm',
                sourcemap: true
            },
            {
                file: packageJson.main,
                name: 'workspaces-ui-react',
                format: 'umd',
                sourcemap: true,
                globals,
            }
        ],
        external: [...Object.keys(packageJson.peerDependencies || {})],
        plugins: [
            resolve({
                mainFields: ['module', 'main', 'browser'],
            }),
            commonjs(),
            typescript(),
            terser({
                compress: true,
            }),
            copy({
                targets: [
                    { src: './node_modules/@glue42/workspaces-ui-core/dist/styles/*', dest: 'dist/styles' },

                ]
            })
        ],
    }
]