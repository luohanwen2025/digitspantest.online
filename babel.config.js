module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
          browsers: ['last 2 versions', '> 1%']
        },
        useBuiltIns: 'entry',
        corejs: 3
      }
    ]
  ],
  plugins: []
};
