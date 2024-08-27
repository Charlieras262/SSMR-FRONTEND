const webpack = require('webpack');

module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      process: {
        env: {
          AWS_TOKEN_SECRET: JSON.stringify(process.env.AWS_TOKEN_SECRET)
        }
      }
    })
  ]
};
