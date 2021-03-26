import React from 'react'
import * as yup from 'yup'
import { Text, Color, Layout } from '@wings-software/uicore'
import { useStrings } from 'framework/exports'
import { SPECIAL_CHAR_RGX, UPPERCASE_RGX, LOWERCASE_RGX, DIGIT_RGX } from '@common/constants/Utils'
import type { PasswordStrengthPolicy, PasswordStrength } from '@common/constants/Utils'

interface Props {
  value: string
  passwordStrengthPolicy: PasswordStrengthPolicy
}

interface Checklist {
  title: string
  isValid: boolean
}

const PasswordChecklist: React.FC<Props> = ({ value, passwordStrengthPolicy }) => {
  const { getString } = useStrings()
  const {
    minNumberOfCharacters,
    maxNumberOfCharacters,
    minNumberOfUppercaseCharacters,
    minNumberOfLowercaseCharacters,
    minNumberOfDigits,
    minNumberOfSpecialCharacters
  } = passwordStrengthPolicy

  const schema = yup.object().shape({
    minNumberOfCharacters: yup.string().min(minNumberOfCharacters).max(maxNumberOfCharacters),
    minNumberOfUppercaseCharacters: yup.string().matches(UPPERCASE_RGX(minNumberOfUppercaseCharacters)),
    minNumberOfLowercaseCharacters: yup.string().matches(LOWERCASE_RGX(minNumberOfLowercaseCharacters)),
    minNumberOfDigits: yup.string().matches(DIGIT_RGX(minNumberOfDigits)),
    minNumberOfSpecialCharacters: yup.string().matches(SPECIAL_CHAR_RGX(minNumberOfSpecialCharacters))
  })

  const titles: Record<PasswordStrength, string> = {
    minNumberOfCharacters: `${minNumberOfCharacters}-${maxNumberOfCharacters} ${getString('characters')}`,
    minNumberOfUppercaseCharacters: `${minNumberOfUppercaseCharacters} ${getString('uppercase')}`,
    minNumberOfLowercaseCharacters: `${minNumberOfLowercaseCharacters} ${getString('lowercase')}`,
    minNumberOfDigits: `${minNumberOfDigits} ${getString('number')}`,
    minNumberOfSpecialCharacters: `${minNumberOfSpecialCharacters} ${getString('specialChar')}`
  }

  const checkList: Array<Checklist> = Object.keys(passwordStrengthPolicy)
    .filter(key => key !== 'maxNumberOfCharacters' && passwordStrengthPolicy[key as PasswordStrength])
    .map(key => ({
      title: titles[key as PasswordStrength],
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
