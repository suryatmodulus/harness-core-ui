type FormatCost = (value: number, currency?: string, locale?: string, decimalPoints?: number) => string

const formatCost: FormatCost = (value: number, currency = 'USD', locale = 'en-us', decimalPoints = 2) => {
  if (isNaN(value)) {
    return ''
  }

  return value.toLocaleString(locale, {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: decimalPoints,
    minimumFractionDigits: decimalPoints
  })
}

export default formatCost
