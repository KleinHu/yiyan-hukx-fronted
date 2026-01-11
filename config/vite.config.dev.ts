import { mergeConfig } from 'vite';
import eslint from 'vite-plugin-eslint';
import baseConfig from './vite.config.base';

export default mergeConfig(
  {
    mode: 'development',
    server: {
      host: '0.0.0.0',
      open: true,
      fs: {
        strict: true,
      },
      // proxy代理
      // proxy: {
      //   '^/api-bpm': {
      //     target: 'http://10.1.1.120:31167',
      //     changeOrigin: true,
      //   },
      //   '^/api-form': {
      //     target: 'http://10.1.1.120:31167',
      //     changeOrigin: true,
      //   },
      //   '^/api-system': {
      //     target: 'http://10.1.1.120:31167',
      //     changeOrigin: true,
      //   },
      //   '^/api': {
      //     target: 'http://10.1.1.120:31104',
      //     changeOrigin: true,
      //     rewrite: (path: string) => path.replace(/^\/api/, ''),
      //   },
      // },
      proxy: {
        '/api': {
          target: 'http://localhost',
          changeOrigin: true,
          rewrite: (path) => path,
          bypass: () => null, // 完全禁用/api路径的代理
        },
      },
    },
    plugins: [
      eslint({
        cache: false,
        include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.vue'],
        exclude: ['node_modules'],
      }),
    ],
  },
  baseConfig
);
