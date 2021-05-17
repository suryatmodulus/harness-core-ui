export const obj = {
  a: '',
  b: {},
  c: [],
  d: {
    e: [],
    f: '',
    g: {
      h: {}
    }
  },
  i: [{ j: { k: [], l: [{ m: '' }] } }],
  n: [{ o: [{ p: 'q' }, { r: {} }] }],
  s: null,
  t: undefined,
  u: [{ v: null, w: undefined }],
  x: [
    {
      y: {
        z: undefined
      }
    }
  ]
}

export const response1 = {
  a: '',
  b: {},
  c: [],
  d: { e: [], f: '', g: { h: {} } },
  i: [{ j: { k: [], l: [{ m: '' }] } }],
  n: [{ o: [{ p: 'q' }, { r: {} }] }],
  u: [{}],
  x: [{ y: {} }]
}

export const response2 = {
  b: {},
  c: [],
  d: { e: [], g: { h: {} } },
  i: [{ j: { k: [], l: [{}] } }],
  n: [{ o: [{ p: 'q' }, { r: {} }] }],
  u: [{}],
  x: [{ y: {} }]
}

export const response3 = {
  a: '',
  b: {},
  d: { f: '', g: { h: {} } },
  i: [{ j: { l: [{ m: '' }] } }],
  n: [{ o: [{ p: 'q' }, { r: {} }] }],
  u: [{}],
  x: [{ y: {} }]
}

export const response4 = {
  a: '',
  c: [],
  d: { e: [], f: '', g: {} },
  i: [{ j: { k: [], l: [{ m: '' }] } }],
  n: [{ o: [{ p: 'q' }, {}] }],
  u: [{}],
  x: [{ y: {} }]
}

export const response5 = {
  d: { g: {} },
  i: [{ j: { l: [{}] } }],
  n: [{ o: [{ p: 'q' }, {}] }],
  u: [{}],
  x: [{ y: {} }]
}
