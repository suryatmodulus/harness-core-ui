import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { get, isEmpty } from 'lodash-es'
import { FormInput, MultiTypeInputType, Container, Layout, Text, Radio, FontVariation } from '@wings-software/uicore'
import { connect, FormikContext } from 'formik'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

export interface CICodebaseInputSetFormProps {
  path: string
  readonly?: boolean
  formik?: FormikContext<any>
}

const inputNames = {
  branch: 'branch',
  tag: 'tag',
  PR: 'number'
}

const defaultValues = {
  branch: '<+trigger.branch>',
  tag: '<+trigger.tag>',
  PR: '<+trigger.prNumber>'
}

const CICodebaseInputSetFormInternal = ({ path, readonly, formik }: CICodebaseInputSetFormProps): JSX.Element => {
  const { triggerIdentifier } = useParams<Record<string, string>>()

  const [isInputTouched, setIsInputTouched] = useState(false)

  const savedValues = useRef<Record<string, string>>({
    branch: '',
    tag: '',
    PR: ''
  })

  const { getString } = useStrings()

  const { expressions } = useVariablesExpression()

  const formattedPath = isEmpty(path) ? '' : `${path}.`

  const [codeBaseType, setCodeBaseType] = useState<CodeBaseType>()

  type CodeBaseType = 'branch' | 'tag' | 'PR'

  const codeBaseTypePath = `${formattedPath}properties.ci.codebase.build.type`

  const inputLabels = {
    branch: getString('gitBranch'),
    tag: getString('gitTag'),
    PR: getString('pipeline.gitPullRequestNumber')
  }

  const placeholderValues = {
    branch: defaultValues['branch'],
    tag: defaultValues['tag'],
    PR: defaultValues['PR']
  }

  const codeBaseInputFieldFormName = {
    branch: `${formattedPath}properties.ci.codebase.build.spec.branch`,
    tag: `${formattedPath}properties.ci.codebase.build.spec.tag`,
    PR: `${formattedPath}properties.ci.codebase.build.spec.number`
  }

  useEffect(() => {
    const type = get(formik?.values, codeBaseTypePath, '') as CodeBaseType
    setCodeBaseType(type)
  }, [formik?.values])

  useEffect(() => {
    if (codeBaseType) {
      savedValues.current = Object.assign(savedValues.current, {
        [codeBaseType]: get(
          formik?.values,
          `${formattedPath}properties.ci.codebase.build.spec.${inputNames[codeBaseType]}`,
          ''
        )
      })
      handleTypeChange(codeBaseType)
    }
  }, [codeBaseType])

  const handleTypeChange = (newType: CodeBaseType): void => {
    const buildSpecPath = `${formattedPath}properties.ci.codebase.build.spec.${inputNames[newType]}`
    formik?.setFieldValue(codeBaseTypePath, newType)
    if (!isInputTouched && triggerIdentifier) {
      formik?.setFieldValue(buildSpecPath, defaultValues[newType])
    } else {
      formik?.setFieldValue(buildSpecPath, savedValues.current[newType])
    }
  }

  const handleInputChange = (): void => setIsInputTouched(true)

  const renderCodeBaseTypeInput = (type: CodeBaseType): JSX.Element => {
    return (
      <Container>
        <FormInput.MultiTextInput
          label={<Text font={{ variation: FontVariation.FORM_LABEL }}>{inputLabels[type]}</Text>}
          name={codeBaseInputFieldFormName[type]}
          multiTextInputProps={{
            expressions,
            allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
          }}
          placeholder={triggerIdentifier ? placeholderValues[type] : ''}
          disabled={readonly}
          onChange={handleInputChange}
        />
      </Container>
    )
  }

  return (
    <Layout.Vertical spacing="small">
      <Layout.Horizontal
        flex={{ justifyContent: 'start' }}
        padding={{ top: 'small', left: 'xsmall', bottom: 'xsmall' }}
        margin={{ left: 'large' }}
        spacing="huge"
      >
        <Radio
          label={inputLabels['branch']}
          onClick={() => handleTypeChange('branch')}
          checked={codeBaseType === 'branch'}
          disabled={readonly}
          font={{ variation: FontVariation.FORM_LABEL }}
        />
        <Radio
          label={inputLabels['tag']}
          onClick={() => handleTypeChange('tag')}
          checked={codeBaseType === 'tag'}
          disabled={readonly}
          font={{ variation: FontVariation.FORM_LABEL }}
        />
        <Radio
          label={inputLabels['PR']}
          onClick={() => handleTypeChange('PR')}
          checked={codeBaseType === 'PR'}
          disabled={readonly}
          font={{ variation: FontVariation.FORM_LABEL }}
        />
      </Layout.Horizontal>
      {codeBaseType === 'branch' ? renderCodeBaseTypeInput('branch') : null}
      {codeBaseType === 'tag' ? renderCodeBaseTypeInput('tag') : null}
      {codeBaseType === 'PR' ? renderCodeBaseTypeInput('PR') : null}
    </Layout.Vertical>
  )
}

export const CICodebaseInputSetForm = connect(CICodebaseInputSetFormInternal)
