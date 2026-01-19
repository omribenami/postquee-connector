const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const isProduction = process.env.NODE_ENV === 'production';
const shouldAnalyze = process.env.ANALYZE === 'true';

module.exports = {
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? false : 'source-map',

  entry: {
    calendar: './src/calendar/index.tsx',
  },

  output: {
    path: path.resolve(__dirname, 'assets/dist'),
    filename: '[name].bundle.js',
    clean: true,
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
        ],
      },
    ],
  },

  optimization: {
    minimize: isProduction,
    usedExports: true,
  },

  plugins: [
    ...(shouldAnalyze ? [new BundleAnalyzerPlugin()] : []),
  ],

  performance: {
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
};
