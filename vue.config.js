module.exports = {
  devServer: {
    proxy: {
      "^/api": {
        target: "http://" + process.env.HOST + ":8080"
      }
    },
    host: process.env.HOST,
    port: process.env.PORT
  }
  // configureWebpack:{
  //   optimization: {
  //     splitChunks: {
  //       minSize: 10000,
  //       maxSize: 250000,
  //     }
  //   }
  // }
};
