import * as Yup from 'yup'
import { useStrings, UseStringsReturn } from 'framework/strings'
import { illegalIdentifiers, regexIdentifier, regexName } from '@common/utils/StringUtils'
interface EmailProps {
  allowMultiple?: boolean
  emailSeparator?: string
}

export function NameSchemaWithoutHook(
  getString: UseStringsReturn['getString'],
  config?: { requiredErrorMsg?: string }
): Yup.Schema<string> {
  return Yup.string()
    .trim()
    .required(config?.requiredErrorMsg ? config?.requiredErrorMsg : getString('common.validation.nameIsRequired'))
    .matches(regexName, getString('common.validation.namePatternIsNotValid'))
}

export function NameSchema(config?: { requiredErrorMsg?: string }): Yup.Schema<string> {
  const { getString } = useStrings()
  return NameSchemaWithoutHook(getString, config)
}

export function IdentifierSchemaWithoutHook(
  getString: UseStringsReturn['getString'],
  config?: { requiredErrorMsg?: string }
): Yup.Schema<string | undefined> {
  return Yup.string().when('name', {
    is: val => val?.length,
    then: Yup.string()
      .required(config?.requiredErrorMsg ? config?.requiredErrorMsg : getString('validation.identifierRequired'))
      .matches(regexIdentifier, getString('validation.validIdRegex'))
      .notOneOf(illegalIdentifiers)
  })
}

export function IdentifierSchema(config?: { requiredErrorMsg?: string }): Yup.Schema<string | undefined> {
  const { getString } = useStrings()
  return IdentifierSchemaWithoutHook(getString, config)
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
