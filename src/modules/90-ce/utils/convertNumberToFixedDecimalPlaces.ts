export const convertNumberToFixedDecimalPlaces = (val: string | number, limit: number) => {
  return +Number(val).toFixed(limit)
}
