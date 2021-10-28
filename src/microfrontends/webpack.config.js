const path = require('path')
const tsTransformPaths = require('@zerollup/ts-transform-paths')
module.exports = {
  mode: 'production',
  entry: './src/microfrontends/index.ts',
  output: {
    path: path.join(__dirname, 'dist/microfrontends'),
    filename: 'index.js',
    libraryTarget: 'umd'
  },
  target: 'web',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: 'src/microfrontends/tsconfig.json',
              getCustomTransformers: program => {
                const transformer = tsTransformPaths(program)

                return {
                  before: [transformer.before], // for updating paths in generated code
                  afterDeclarations: [transformer.afterDeclarations] // for updating paths in declaration files
                }
              }
            }
          }
        ],
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    plugins: []
  }
}
