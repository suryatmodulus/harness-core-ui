import * as Yup from 'yup'
import { useStrings } from 'framework/strings'
import type { StringsMap } from 'framework/strings/StringsContext'

export const HTTPRequestMethodValidation = (validationString : string) => {
 const {getString} = useStrings()
 return Yup.string().trim().required(getString(validationString as keyof StringsMap))
}