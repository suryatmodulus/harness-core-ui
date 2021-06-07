import type { PasswordStrengthPolicy } from 'services/cd-ng'

export const DEFAULT_COLOR = '#0063f7'

const getUppercaseRgx = (n: number): string => `^(.*?[A-Z]){${n},}`
const getLowercaseRgx = (n: number): string => `^(.*?[a-z]){${n},}`
const getNumberRgx = (n: number): string => `^(.*?[0-9]){${n},}`
const getSpecialCharRgx = (n: number): string => `^(.*?[ !"#$%&'()*+,-./:;<=>?@[\\]^_\`{|}~]){${n},}`

export const UPPERCASE_RGX = (n: number): RegExp => new RegExp(getUppercaseRgx(n))
export const LOWERCASE_RGX = (n: number): RegExp => new RegExp(getLowercaseRgx(n))
export const DIGIT_RGX = (n: number): RegExp => new RegExp(getNumberRgx(n))
export const SPECIAL_CHAR_RGX = (n: number): RegExp => new RegExp(getSpecialCharRgx(n))

export const PASSWORD_CHECKS_RGX = ({
  enabled,
  minNumberOfCharacters,
  minNumberOfUppercaseCharacters,
  minNumberOfLowercaseCharacters,
  minNumberOfDigits,
  minNumberOfSpecialCharacters
}: PasswordStrengthPolicy): RegExp => {
  let result = ''

  if (!enabled) {
    return new RegExp(result)
  }

  const getRegExp = (): string => {
    let regExp = ''

    if (minNumberOfUppercaseCharacters) {
      regExp += `(?=.*(${getUppercaseRgx(minNumberOfUppercaseCharacters)}))`
    }
    if (minNumberOfLowercaseCharacters) {
      regExp += `(?=.*(${getLowercaseRgx(minNumberOfLowercaseCharacters)}))`
    }
    if (minNumberOfDigits) {
      regExp += `(?=.*(${getNumberRgx(minNumberOfDigits)}))`
    }
    if (minNumberOfSpecialCharacters) {
      regExp += `(?=.*(${getSpecialCharRgx(minNumberOfSpecialCharacters)}))`
    }

    return regExp
  }

  if (minNumberOfCharacters) {
    result += `^${getRegExp()}.{${minNumberOfCharacters},}$`
  } else {
    result += getRegExp()
  }

  return new RegExp(result)
}
