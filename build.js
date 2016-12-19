const fs = require('fs')
const path = require('path')
const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const replace = require('rollup-plugin-replace')
const uglify = require('rollup-plugin-uglify')
const version = process.env.VERSION || require('./package.json').version

const banner =
  '/*!\n' +
  ' * v-validator.js v' + version + '\n' +
  ' * (c) ' + new Date().getFullYear() + ' JounQin <admin@1stg.me>\n' +
  ' * Released under the MIT License.\n' +
  ' */'

const NODE_ENV = process.env.NODE_ENV || 'development'

const plugins = [babel(), replace({
  'process.env.NODE_ENV': JSON.stringify(NODE_ENV)
})]

const isProd = NODE_ENV === 'production'

isProd && plugins.push(uglify())

rollup.rollup({
  entry: path.resolve(__dirname, 'lib/index.js'),
  plugins
})
  .then(bundle => {
    return write(path.resolve(__dirname, `dist/v-validator${isProd ? '.min' : ''}.js`), bundle.generate({
      format: 'umd',
      banner: banner,
      moduleName: 'VValidator'
    }).code)
  })
  .then(() => {
    console.log('v-validator.js v' + version + ' builded')
  })
  .catch(console.log)

function getSize(code) {
  return (code.length / 1024).toFixed(2) + 'kb'
}

function blue(str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
}

function write(dest, code) {
  return new Promise(function (resolve, reject) {
    fs.writeFile(dest, code, function (err) {
      if (err) return reject(err)
      console.log(blue(dest) + ' ' + getSize(code))
      resolve()
    })
  })
}
