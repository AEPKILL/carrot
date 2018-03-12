import * as copyPlugin from 'copy-webpack-plugin';
import * as htmlPlugin from 'html-webpack-plugin';
import * as stylePlugin from 'style-webpack-plugin';
import { Configuration } from 'webpack';

const config: Configuration = {
  entry: {
    'background': './src/background.ts',
    'popup': './src/popup.ts',
    'content-script': './src/content-script.ts',
    'sandbox': './src/sandbox.ts'
  },
  output: {
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.ts', '.js'],
    mainFields: ['jsnext:main', 'browser', 'main']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'awesome-typescript-loader',
        options: {
          useCache: true
        },
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new copyPlugin([
      {
        from: 'src/assets',
        toType: 'dir',
        to: 'assets'
      },
      {
        from: 'src/manifest.json',
        toType: 'file'
      }
    ]),
    new htmlPlugin({
      template: 'src/popup.html',
      chunks: ['popup'],
      filename: 'popup.html'
    }),
    new htmlPlugin({
      template: 'src/sandbox.html',
      chunks: ['sandbox'],
      filename: 'sandbox.html'
    }),
    new stylePlugin(
      {
        './src/styles/popup.scss': 'styles/popup.css'
      },
      process.env.NODE_ENV as stylePlugin.NODE_ENV,
      {
        sourceMap: process.env.NODE_ENV === 'development'
      }
    )
  ]
};

export default config;
