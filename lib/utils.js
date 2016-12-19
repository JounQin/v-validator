export const trueType = value => [].slice.call({}.toString.call(value), 8, -1).join('')

export const trueTypeFunc = type => value => type === trueType(value);

export const isArray = trueTypeFunc('Array')
export const isFunction = trueTypeFunc('Function')
export const isObjectLike = val => val != null && typeof val === 'object'

export const log = msg => process.env.NODE_ENV !== 'production' && console && console.log(msg)
export const warn = msg => process.env.NODE_ENV !== 'production' && console && console.warn(msg)
