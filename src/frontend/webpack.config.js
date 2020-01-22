const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackShellPluginNext = require('webpack-shell-plugin-next')
const CopyPlugin = require('copy-webpack-plugin');
const JSONMinifyPlugin = require('node-json-minify');

const cssLoader = "css-loader";

const postcssLoader = {
  loader: 'postcss-loader',
  options: {
    plugins: () => [
      require('autoprefixer')()
    ]
  }
};

module.exports = function(env, { runTest }) {
  const production = env === 'production' || process.env.NODE_ENV === 'production';
  const test = env === 'test' || process.env.NODE_ENV === 'test';
  return {
    mode: production ? 'production' : 'development',
    devtool: production ? 'source-maps' : 'inline-source-map',
    entry: test ? './test/all-spec.js' :  './src/main.ts',
    output: {
      path: path.resolve(__dirname, '..', '..', 'docs'),
      filename: '[name].[contenthash].js'
    },
    resolve: {
      extensions: ['.ts', '.js'],
      modules: [path.resolve(__dirname, 'src'), 'node_modules']
    },
    devServer: {
      historyApiFallback: true,
      open: !process.env.CI,
      port: 9000,
      lazy: false
    },
    module: {
      rules: [
        { test: /\.css$/i, use: [ "style-loader", cssLoader, postcssLoader ] },
        { test: /\.ts$/i, use: ['ts-loader', '@aurelia/webpack-loader'], exclude: /node_modules/ },
        { test: /\.html$/i, use: '@aurelia/webpack-loader', exclude: /node_modules/ }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({ template: 'index.ejs' }),
      test && runTest && new WebpackShellPluginNext({
        dev: false,
        swallowError: true,
        onBuildEnd: {
          scripts: [ 'npm run test:headless' ]
        }
      }),
      new CopyPlugin([
        { from: 'src/assets', to: path.resolve(__dirname, '..', '..', 'docs', 'assets') },
        { from: 'src/data/data.json', transform: function(content) { return JSONMinifyPlugin(content.toString()); }, to: path.resolve(__dirname, '..', '..', 'docs', 'data', '[name].[ext]') },
      ])
    ].filter(p => p)
  }
}
