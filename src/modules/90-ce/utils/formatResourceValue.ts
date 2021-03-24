const BYTES_IN_A_GB = 1000000000
const BYTES_IN_A_MB = 1000000

const log10: (n: number) => number = n => Math.log(n) / Math.log(10)

export const getCPUValueInReadableForm: (val: number) => string = (val: number) => {
  if (!val) {
    return '0'
  }
  if (log10(val) < 0) {
    return `${Math.ceil(val * 1000)}m`
  }
  return val % 1 === 0 ? `${val}` : `${(val + 0.1).toFixed(1)}`
}

export const getMemValueInReadableForm: (val: number) => string = (val: number) => {
  if (!val) {
    return '0'
  }
  if (log10(val) >= 9) {
    return `${Math.ceil(val / BYTES_IN_A_GB)}Gi`
  } else {
    return `${Math.ceil(val / BYTES_IN_A_MB)}Mi`
  }
}
