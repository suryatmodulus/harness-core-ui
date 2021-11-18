import React, { FormEvent } from 'react'
import { Text, FontVariation, Label, Layout, FormInput } from '@wings-software/uicore'
import { defaultTo, isEmpty } from 'lodash-es'
import { useDeepCompareEffect } from '@common/hooks'
import type { KVPair } from '../PipelineVariablesContext/PipelineVariablesContext'
import css from './RunPipelineForm.module.scss'
interface ReplacedExpressionInputForm {
  expressions?: string[]
  setFormErrors: (value: KVPair) => void
  formErrors: KVPair
  expressionFormState: KVPair
  setExpressionFormState: (updateFn: (val: KVPair) => KVPair) => void
}
const ReplacedExpressionInputForm = ({
  expressions = [],
  setFormErrors,
  formErrors,
  setExpressionFormState
}: ReplacedExpressionInputForm): React.ReactElement | null => {
  useDeepCompareEffect(() => {
    const stateValue: KVPair = {}
    const expressionErrors: KVPair = {}
    expressions.forEach((value: string) => {
      stateValue[value] = ''
      expressionErrors[value] = 'Expression value is required.'
    })
    setFormErrors(expressionErrors)
  }, [expressions])

  const updateExpressionValue = (e: FormEvent<HTMLElement>): void => {
    const keyName: string = (e as any)?.target?.name
    const exprValue: string = defaultTo((e as any)?.target?.value, '').trim()
    setExpressionFormState(
      (oldState: KVPair): KVPair => ({
        ...oldState,
        [keyName]: exprValue
      })
    )
    const formErrorsUpdated = { ...formErrors }
    if (!formErrors[keyName] && isEmpty(exprValue)) {
      formErrorsUpdated[keyName] = 'Expression value is required.'
    } else if (formErrors[keyName] && !isEmpty(exprValue)) {
      delete formErrorsUpdated[keyName]
    }
    setFormErrors(formErrorsUpdated)
  }

  return expressions.length > 0 ? (
    <Layout.Vertical className={css.replaceExpressionForm}>
      <Text
        font={{
          variation: FontVariation.FORM_TITLE
        }}
      >
        Replaced Expressions
      </Text>

      <div className={css.form}>
        {expressions?.map((exprName: string) => (
          <Layout.Vertical key={exprName}>
            <Label>
              <Text width={300} lineClamp={1}>
                {exprName}
              </Text>
            </Label>
            <FormInput.Text name={exprName} onChange={updateExpressionValue} />
          </Layout.Vertical>
        ))}
      </div>
    </Layout.Vertical>
  ) : null
}
export default ReplacedExpressionInputForm
