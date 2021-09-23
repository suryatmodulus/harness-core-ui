import React from 'react'
import { get, isEmpty } from 'lodash-es'
import { FormInput, MultiTypeInputType } from '@wings-software/uicore'
import { connect, FormikContext } from 'formik'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

export interface CICodebaseInputSetFormProps {
  path: string
  readonly?: boolean
  formik?: FormikContext<any>
}

const CICodebaseInputSetFormInternal = ({ path, readonly, formik }: CICodebaseInputSetFormProps): JSX.Element => {
  const type = get(formik?.values, `${isEmpty(path) ? '' : `${path}.`}properties.ci.codebase.build.type`, '') as
    | 'branch'
    | 'tag'
    | 'PR'
  const { getString } = useStrings()
  const radioGroupItems = [
    {
      label: getString('gitBranch'),
      value: 'branch',
      disabled: readonly
    },
    {
      label: getString('gitTag'),
      value: 'tag',
      disabled: readonly
    },
    {
      label: getString('pipeline.gitPullRequest'),
      value: 'PR',
      disabled: readonly
    }
  ]

  const { expressions } = useVariablesExpression()

  const inputLabels = {
    branch: getString('gitBranch'),
    tag: getString('gitTag'),
    PR: getString('pipeline.gitPullRequestNumber')
  }

  const inputNames = {
    branch: 'branch',
    tag: 'tag',
    PR: 'number'
  }

  return (
    <>
      <FormInput.RadioGroup
        name={`${isEmpty(path) ? '' : `${path}.`}properties.ci.codebase.build.type`}
        items={radioGroupItems}
        radioGroup={{ inline: true }}
        onChange={(e): void => {
          formik?.setFieldValue(
            `${isEmpty(path) ? '' : `${path}.`}properties.ci.codebase.build.spec.${
              inputNames[(e.target as HTMLFormElement).value as 'branch' | 'tag' | 'PR']
            }`,
            get(
              formik?.values,
              `${isEmpty(path) ? '' : `${path}.`}properties.ci.codebase.build.spec.${inputNames[type]}`,
              ''
            )
          )

          formik?.setFieldValue(
            `${isEmpty(path) ? '' : `${path}.`}properties.ci.codebase.build.spec.${inputNames[type]}`,
            undefined
          )
        }}
        style={{ marginBottom: 0 }}
      />
      {type && (
        <FormInput.MultiTextInput
          label={inputLabels[type]}
          name={`${isEmpty(path) ? '' : `${path}.`}properties.ci.codebase.build.spec.${inputNames[type]}`}
          multiTextInputProps={{
            expressions,
            allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
          }}
          style={{ marginBottom: 0 }}
          disabled={readonly}
        />
      )}
    </>
  )
}

export const CICodebaseInputSetForm = connect(CICodebaseInputSetFormInternal)
