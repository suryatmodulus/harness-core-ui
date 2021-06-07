import React from 'react'
import * as yup from 'yup'
import { Text, Color, Layout } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { PasswordStrengthPolicy } from 'services/cd-ng'
import { SPECIAL_CHAR_RGX, UPPERCASE_RGX, LOWERCASE_RGX, DIGIT_RGX } from '@common/constants/Utils'

interface Props {
  value: string
  passwordStrengthPolicy: PasswordStrengthPolicy
}

interface Checklist {
  title: string
  isValid: boolean
}

type PasswordStrengthKeys = keyof Omit<PasswordStrengthPolicy, 'enabled'>

const PasswordChecklist: React.FC<Props> = ({ value, passwordStrengthPolicy }) => {
  const { getString } = useStrings()
  const {
    minNumberOfCharacters = 8,
    minNumberOfUppercaseCharacters = 0,
    minNumberOfLowercaseCharacters = 0,
    minNumberOfDigits = 0,
    minNumberOfSpecialCharacters = 0
  } = passwordStrengthPolicy

  const schema = yup.object().shape({
    minNumberOfCharacters: yup.string().min(minNumberOfCharacters),
    minNumberOfUppercaseCharacters: yup.string().matches(UPPERCASE_RGX(minNumberOfUppercaseCharacters)),
    minNumberOfLowercaseCharacters: yup.string().matches(LOWERCASE_RGX(minNumberOfLowercaseCharacters)),
    minNumberOfDigits: yup.string().matches(DIGIT_RGX(minNumberOfDigits)),
    minNumberOfSpecialCharacters: yup.string().matches(SPECIAL_CHAR_RGX(minNumberOfSpecialCharacters))
  })

  const titles = {
    minNumberOfCharacters: `${minNumberOfCharacters}-64 ${getString('characters')}`,
    minNumberOfUppercaseCharacters: `${minNumberOfUppercaseCharacters} ${getString('uppercase')}`,
    minNumberOfLowercaseCharacters: `${minNumberOfLowercaseCharacters} ${getString('lowercase')}`,
    minNumberOfDigits: `${minNumberOfDigits} ${getString('number')}`,
    minNumberOfSpecialCharacters: `${minNumberOfSpecialCharacters} ${getString('specialChar')}`
  }

  const checkList: Array<Checklist> = Object.keys(passwordStrengthPolicy)
    .filter(key => key !== 'enabled' && passwordStrengthPolicy[key as PasswordStrengthKeys])
    .map(key => ({
      title: titles[key as PasswordStrengthKeys],
      isValid: schema.isValidSync({
        [key]: value
      })
    }))

  return (
    <Layout.Vertical>
      {checkList.map(item => (
        <Text
          icon="execution-success"
          intent={item.isValid ? 'success' : 'none'}
          iconProps={{ size: 11 }}
          key={item.title}
          font={{ size: 'small', weight: 'semi-bold' }}
          color={Color.GREY_400}
        >
          {item.title}
        </Text>
      ))}
    </Layout.Vertical>
  )
}

export default PasswordChecklist
