module.exports = (api) => {
  api.cache.using(() => process.env.NODE_ENV)

  const isDevelopment = api.env('development')
  const isTest = api.env('test')

  return {
    presets: [
      [
        '@babel/preset-env',
        {
          useBuiltIns: 'usage',
          corejs: 3,
        },
      ],
      '@babel/preset-react',
    ],
    plugins: [
      '@babel/plugin-transform-class-properties',
      isDevelopment && 'react-refresh/babel', // Only include in development
      !isProductionOrTest(api) && [
        '@babel/plugin-transform-runtime',
        {
          regenerator: true,
        },
      ],
      'lodash',
    ].filter(Boolean),
  }
}

function isProductionOrTest(api) {
  return api.env('production') || api.env('test')
}
