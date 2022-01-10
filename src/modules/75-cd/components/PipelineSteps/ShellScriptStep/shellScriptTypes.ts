import type { SelectOption } from '@wings-software/uicore'
import * as Yup from 'yup'
import type { UseStringsReturn } from 'framework/strings'
import type { ShellScriptStepInfo, StepElementConfig } from 'services/cd-ng'

export const scriptInputType: SelectOption[] = [
  { label: 'String', value: 'String' },
  { label: 'Number', value: 'Number' }
]

export const variableSchema = (
  getString: UseStringsReturn['getString']
): Yup.NotRequiredArraySchema<
  | {
      name: string
      value: string
      type: string
    }
  | undefined
> =>
  Yup.array().of(
    Yup.object({
      name: Yup.string().required(getString('common.validation.nameIsRequired')),
      value: Yup.string().required(getString('common.validation.valueIsRequired')),
      type: Yup.string().trim().required(getString('common.validation.typeIsRequired'))
    })
  )

export const scriptOutputType: SelectOption[] = [{ label: 'String', value: 'String' }]

export interface ShellScriptStepVariable {
  value: number | string
  id: string
  name?: string
  type?: 'String' | 'Number'
}
export interface ShellScriptOutputStepVariable {
  value: number | string
  id: string
  name?: string
  type?: 'String'
}
interface ShellScriptSource {
  type?: string
  spec?: ShellScriptInline
}
export interface ShellScriptInline {
  script?: string
}
export interface ShellScriptData extends StepElementConfig {
  spec: Omit<ShellScriptStepInfo, 'environmentVariables' | 'outputVariables' | 'source'> & {
    environmentVariables?: Array<Omit<ShellScriptStepVariable, 'id'>>
    outputVariables?: Array<Omit<ShellScriptOutputStepVariable, 'id'>>
    source?: ShellScriptSource
  }
}

export interface ShellScriptFormData extends StepElementConfig {
  spec: Omit<ShellScriptStepInfo, 'environmentVariables' | 'outputVariables' | 'source'> & {
    environmentVariables?: Array<ShellScriptStepVariable>
    outputVariables?: Array<ShellScriptOutputStepVariable>
    source?: ShellScriptSource
  }
}
