/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const webpackConfig = require('../webpack.config')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const MonacoWebpackPlugin = require(require.resolve('monaco-editor-webpack-plugin', { paths: [process.cwd()] }))
const path = require('path')

const CONTEXT = process.cwd()

module.exports = {
  core: {
    builder: 'webpack5'
  },
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  webpackFinal: config => {
    return {
      ...config,
      cache: { type: 'filesystem', name: 'storybook' },
      module: {
        ...config.module,
        rules: [
          {
            test: /.*\/node_modules\/xterm\/.*\.css/,
            use: 'null-loader'
          },
          {
            test: /.*\/node_modules\/monaco-editor\/.*/,
            use: 'null-loader'
          },
          {
            test: /.*\/node_modules\/@harness\/monaco-yaml\/.*/,
            use: 'null-loader'
          },
          ...config.module.rules,
          {
            test: /\.m?js$/,
            include: /node_modules/,
            type: 'javascript/auto'
          },
          {
            test: /\.(j|t)sx?$/,
            exclude: /node_modules/,
            use: [
              {
                loader: 'ts-loader',
                options: {
                  transpileOnly: true
                }
              }
            ]
          },
          {
            test: /\.module\.scss$/,
            exclude: /node_modules/,
            use: [
              MiniCssExtractPlugin.loader,
              {
                loader: '@harness/css-types-loader',
                options: {
                  prettierConfig: CONTEXT
                }
              },
              {
                loader: 'css-loader',
                options: {
                  importLoaders: 1,
                  modules: {
                    mode: 'local',
                    localIdentName: '[name]_[local]_[hash:base64:6]',
                    exportLocalsConvention: 'camelCaseOnly'
                  }
                }
              },
              {
                loader: 'sass-loader',
                options: {
                  sassOptions: {
                    includePaths: [path.join(CONTEXT, 'src')]
                  },
                  sourceMap: false,
                  implementation: require('sass')
                }
              }
            ]
          },
          {
            test: /(?<!\.module)\.scss$/,
            exclude: /node_modules/,
            use: [
              MiniCssExtractPlugin.loader,
              {
                loader: 'css-loader',
                options: {
                  importLoaders: 1,
                  modules: false
                }
              },
              {
                loader: 'sass-loader',
                options: {
                  sassOptions: {
                    includePaths: [path.join(CONTEXT, 'src')]
                  },
                  implementation: require('sass')
                }
              }
            ]
          },
          {
            test: /\.ya?ml$/,
            type: 'json',
            use: [
              {
                loader: 'yaml-loader'
              }
            ]
          }
          // ...webpackConfig.module.rules
        ]
      },
      resolve: {
        ...config.resolve,
        ...webpackConfig.resolve,
        fallback: { assert: require.resolve('assert/') }
      },
      plugins: [
        ...config.plugins,
        new MiniCssExtractPlugin({
          filename: 'static/[name].css',
          chunkFilename: 'static/[name].[id].css'
        }),
        new MonacoWebpackPlugin({
          // available options are documented at https://github.com/Microsoft/monaco-editor-webpack-plugin#options
          languages: ['yaml', 'shell', 'powershell']
        })
      ],
      stats: 'minimal'
    }
  }
}
