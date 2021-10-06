const path = require('path')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

module.exports = {
  mode: 'production',
  entry: './src/microfrontends/MicrofrontendTypes.ts',
  output: {
    path: path.join(__dirname, 'declarations'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true
            }
          },
          {
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                declaration: true,
                noEmit: false,
                declarationDir: 'declarations'
              }
            }
          },
          {
            loader: '@stavalfi/babel-plugin-module-resolver-loader',
            options: {
              // all those options will go directly to babel-plugin-module-resolver plugin.
              // Read babel-plugin-module-resolver DOCS to see all options:
              // https://github.com/tleunen/babel-plugin-module-resolver/blob/master/DOCS.md
              root: ['./src'],
              extensions: ['.js', '.jsx', '.d.ts', '.ts', '.tsx']
            }
          }
        ],
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    plugins: [new TsconfigPathsPlugin({ extensions: ['.tsx', '.ts', '.js'] })]
  }
}
