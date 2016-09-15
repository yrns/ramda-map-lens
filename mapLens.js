const R = require('ramda')
const test = require('tape')

// copyMap :: Map -> Map
const copyMap = a => new Map(a.entries()),
      // `set` returns the copy.
      // copyAndSet :: k -> v -> Map -> Map
      copyAndSet = R.curry((k, v, a) => copyMap(a).set(k, v))

// mapLens :: k -> Lens
const mapLens = k => R.lens(a => a.get(k), copyAndSet(k))

// WeakMaps cannot be copied easily, so there's this version which
// mutates. Note WeakMap keys must be objects.
// mapLensMut :: k -> Lens!
const mapLensMut = k => R.lens(a => a.get(k), (v, a) => a.set(k, v))

module.exports = {mapLens, mapLensMut}

test('set', t => {
    const lens = mapLens('test'),
          a = R.set(lens, 42, new Map)
    t.equals(a.get('test'), 42, 'test equals 42')
    t.end()
})

test('view', t => {
    const lens = mapLens('test'),
          a = R.set(lens, 42, new Map)
    t.equals(R.view(lens, a), 42, 'test equals 42')
    t.end()
})

test('set does not mutate', t => {
    const lens = mapLens('test'),
          a = R.set(lens, 42, new Map),
          b = R.set(lens, 43, a)
    t.equals(R.view(lens, a), 42, 'a.test equals 42 still')
    t.equals(R.view(lens, b), 43, 'b.test equals 43')
    t.end()
})

test('mutate version sets on WeakMap', t => {
    const obj = {42: true},
          lens = mapLensMut(obj),
          a = R.set(lens, 42, new WeakMap)
    t.equals(R.view(lens, a), 42, 'test equals 42')
    t.end()
})
