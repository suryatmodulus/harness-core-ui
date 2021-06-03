import * as Yup from 'yup'
import { useStrings } from 'framework/strings'
import { illegalIdentifiers, regexIdentifier, regexName } from '@common/utils/StringUtils'
interface EmailProps {
  allowMultiple?: boolean
  emailSeparator?: string
}

export function NameSchema(): Yup.Schema<string> {
  const { getString } = useStrings()
  return Yup.string()
    .trim()
    .required(getString('validation.nameRequired'))
    .matches(regexName, getString('formValidation.name'))
}

export function IdentifierSchema(): Yup.Schema<string | undefined> {
  const { getString } = useStrings()
  return Yup.string().when('name', {
    is: val => val?.length,
    then: Yup.string()
      .required(getString('validation.identifierRequired'))
      .matches(regexIdentifier, getString('validation.validIdRegex'))
      .notOneOf(illegalIdentifiers)
  })
}

export function EmailSchema(emailProps: EmailProps = {}): Yup.Schema<string> {
  const { getString } = useStrings()

  if (emailProps.allowMultiple)
    return Yup.string()
      .trim()
      .required(getString('common.validation.email.required'))
      .test(
        'email',
        getString('common.validation.email.format'),
        value =>
          value &&
          value.split(emailProps.emailSeparator).every((emailString: string) => {
            const emailStringTrim = emailString.trim()
            return emailStringTrim ? Yup.string().email().isValidSync(emailStringTrim) : false
          })
      )

  return Yup.string()
    .trim()
    .required(getString('common.validation.email.required'))
    .email(getString('common.validation.email.format'))
}

export function URLValidationSchema(): Yup.Schema<string | undefined> {
  const { getString } = useStrings()
  return Yup.string().trim().required(getString('validation.UrlRequired')).url(getString('validation.urlIsNotValid'))
}
