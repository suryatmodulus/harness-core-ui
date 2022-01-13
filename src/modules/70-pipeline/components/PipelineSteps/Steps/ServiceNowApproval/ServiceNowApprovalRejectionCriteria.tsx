import React, { useEffect, useState } from 'react'
import { FieldArray } from 'formik'
import { isEmpty, set } from 'lodash-es'
import {
  Button,
  FormInput,
  HarnessDocTooltip,
  Layout,
  MultiTypeInputType,
  Radio,
  SelectOption,
  Text
} from '@wings-software/uicore'
import { StringKeys, useStrings } from 'framework/strings'
import { FormMultiTypeTextAreaField } from '@common/components/MultiTypeTextArea/MultiTypeTextArea'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import {
  ApprovalRejectionCriteriaCondition,
  ApprovalRejectionCriteriaProps,
  ApprovalRejectionCriteriaType
} from '@pipeline/components/PipelineSteps/Steps/Common/types'
import { useDeepCompareEffect } from '@common/hooks'
import type { ServiceNowFieldNG } from 'services/cd-ng'
import { filterOutMultiOperators, handleOperatorChange, operatorValues } from '../JiraApproval/helper'
import { isApprovalStepFieldDisabled } from '../Common/ApprovalCommons'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from '../Common/ApprovalRejectionCriteria.module.scss'

const valuePlaceholder: StringKeys = 'common.valuePlaceholder'
interface SnowApprovalRejectionCriteriaProps
  extends Omit<ApprovalRejectionCriteriaProps, 'statusList' | 'fieldList' | 'stepType'> {
  fieldList: ServiceNowFieldNG[]
}

interface ServiceNowConditionsInterface extends SnowApprovalRejectionCriteriaProps {
  allowedFieldKeys: SelectOption[]
  allowedValuesForFields: Record<string, SelectOption[]>
}

const RenderValueSelects = ({
  condition,
  allowedValuesForFields,
  mode,
  index,
  expressions,
  readonly
}: {
  condition: ApprovalRejectionCriteriaCondition
  allowedValuesForFields: Record<string, SelectOption[]>
  mode: string
  index: number
  expressions: string[]
  readonly?: boolean
}): JSX.Element => {
  const { getString } = useStrings()
  if (condition.operator === 'in' || condition.operator === 'not in') {
    return (
      <FormInput.MultiSelectTypeInput
        label=""
        className={css.multiSelect}
        name={`spec.${mode}.spec.conditions[${index}].value`}
        selectItems={allowedValuesForFields[condition.key]}
        placeholder={getString(valuePlaceholder)}
        multiSelectTypeInputProps={{
          allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED],
          expressions
        }}
        disabled={isApprovalStepFieldDisabled(readonly)}
      />
    )
  }
  return (
    <FormInput.MultiTypeInput
      label=""
      name={`spec.${mode}.spec.conditions[${index}].value`}
      selectItems={allowedValuesForFields[condition.key]}
      placeholder={getString(valuePlaceholder)}
      multiTypeInputProps={{
        allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED],
        expressions
      }}
      disabled={isApprovalStepFieldDisabled(readonly)}
    />
  )
}

export const Conditions = ({
  values,
  onChange,
  mode,
  isFetchingFields,
  allowedValuesForFields,
  allowedFieldKeys,
  formikErrors,
  fieldList,
  readonly
}: ServiceNowConditionsInterface): JSX.Element => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  if (isFetchingFields) {
    return <div className={css.fetching}>{getString('pipeline.approvalCriteria.fetchingFields')}</div>
  }
  return (
    <div className={css.conditionalContent}>
      <Layout.Horizontal className={css.alignConditions} spacing="xxxlarge">
        <span>{getString('pipeline.approvalCriteria.match')}</span>
        <Radio
          onClick={() => onChange({ ...values, spec: { ...values.spec, matchAnyCondition: false } })}
          disabled={isApprovalStepFieldDisabled(readonly)}
          checked={!values.spec.matchAnyCondition}
        >
          {getString('pipeline.approvalCriteria.allConditions')}
        </Radio>
        <Radio
          onClick={() => onChange({ ...values, spec: { ...values.spec, matchAnyCondition: true } })}
          disabled={isApprovalStepFieldDisabled(readonly)}
          checked={values.spec.matchAnyCondition}
        >
          {getString('pipeline.approvalCriteria.anyCondition')}
        </Radio>
      </Layout.Horizontal>

      <div className={stepCss.formGroup}>
        <FieldArray
          name={`spec.${mode}.spec.conditions`}
          render={({ push, remove }) => {
            return (
              <div className={css.criteriaRow}>
                <div className={css.headers}>
                  <span>{getString('pipeline.approvalCriteria.field')}</span>
                  <span>{getString('pipeline.triggers.conditionsPanel.operator')}</span>
                  <span>{getString('valueLabel')}</span>
                </div>
                {values.spec.conditions?.map((condition: ApprovalRejectionCriteriaCondition, i: number) => (
                  <div className={css.headers} key={i}>
                    {isEmpty(fieldList) ? (
                      <FormInput.Text
                        disabled={isApprovalStepFieldDisabled(readonly)}
                        name={`spec.${mode}.spec.conditions[${i}].key`}
                        placeholder={getString('pipeline.keyPlaceholder')}
                      />
                    ) : (
                      <FormInput.Select
                        items={allowedFieldKeys}
                        name={`spec.${mode}.spec.conditions[${i}].key`}
                        placeholder={getString('pipeline.keyPlaceholder')}
                        disabled={isApprovalStepFieldDisabled(readonly)}
                      />
                    )}
                    <FormInput.Select
                      items={allowedValuesForFields[condition.key] ? operatorValues : filterOutMultiOperators()}
                      name={`spec.${mode}.spec.conditions[${i}].operator`}
                      placeholder={getString('pipeline.operatorPlaceholder')}
                      disabled={isApprovalStepFieldDisabled(readonly)}
                      onChange={(selectedOperator: SelectOption) => {
                        handleOperatorChange(selectedOperator, onChange, values, i)
                      }}
                    />
                    {!isEmpty(allowedValuesForFields[condition.key]) ? (
                      <RenderValueSelects
                        condition={condition}
                        allowedValuesForFields={allowedValuesForFields}
                        mode={mode}
                        index={i}
                        expressions={expressions}
                        readonly={readonly}
                      />
                    ) : (
                      <FormInput.MultiTextInput
                        label=""
                        name={`spec.${mode}.spec.conditions[${i}].value`}
                        placeholder={getString(valuePlaceholder)}
                        disabled={isApprovalStepFieldDisabled(readonly)}
                        multiTextInputProps={{
                          expressions,
                          allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                        }}
                      />
                    )}

                    <Button
                      minimal
                      disabled={isApprovalStepFieldDisabled(readonly)}
                      icon="main-trash"
                      data-testid={`remove-conditions-${i}`}
                      onClick={() => remove(i)}
                    />
                  </div>
                ))}
                <Button
                  icon="plus"
                  minimal
                  intent="primary"
                  data-testid="add-conditions"
                  disabled={isApprovalStepFieldDisabled(readonly)}
                  onClick={() => push({ key: 'state', operator: 'equals', value: [] })}
                >
                  {getString('add')}
                </Button>
              </div>
            )
          }}
        />
      </div>

      {formikErrors?.conditions ? (
        <Text className={css.formikError} intent="danger">
          {formikErrors.conditions}
        </Text>
      ) : null}
    </div>
  )
}

export const Jexl = (props: SnowApprovalRejectionCriteriaProps): JSX.Element => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <div className={css.conditionalContentJexl}>
      <FormMultiTypeTextAreaField
        name={`spec.${props.mode}.spec.expression`}
        disabled={isApprovalStepFieldDisabled(props.readonly)}
        label={
          props.mode === 'approvalCriteria'
            ? getString('pipeline.approvalCriteria.jexlExpressionLabelApproval')
            : getString('pipeline.approvalCriteria.jexlExpressionLabelRejection')
        }
        className={css.jexlExpression}
        placeholder={getString('pipeline.serviceNowApprovalStep.jexlExpressionPlaceholder')}
        multiTypeTextArea={{
          expressions
        }}
      />
    </div>
  )
}

export const ServiceNowApprovalRejectionCriteria: React.FC<SnowApprovalRejectionCriteriaProps> = props => {
  const { values, onChange, title, readonly } = props
  const [type, setType] = useState<ApprovalRejectionCriteriaType>(values.type)
  const [allowedFieldKeys, setAllowedFieldKeys] = useState<SelectOption[]>([])
  const [allowedValuesForFields, setAllowedValuesForFields] = useState<Record<string, SelectOption[]>>({})
  const { getString } = useStrings()

  useDeepCompareEffect(() => {
    let allowedFieldKeysToSet: SelectOption[] = []
    const allowedValuesForFieldsToSet: Record<string, SelectOption[]> = {}
    if (!isEmpty(props.fieldList)) {
      // If the status list is non empty, initialise it so that status is by default a dropdown
      allowedFieldKeysToSet = props.fieldList.map(field => {
        set(allowedValuesForFieldsToSet, field.key, field.allowedValues)
        return { label: field.name, value: field.key }
      })
    }
    setAllowedFieldKeys(allowedFieldKeysToSet)
    setAllowedValuesForFields(allowedValuesForFieldsToSet)
  }, [props.fieldList])

  useEffect(() => {
    onChange({
      ...values,
      type
    })
  }, [type])

  const tooltipId = `servicenowApproval${props.mode}`

  return (
    <div className={css.box}>
      <div className="ng-tooltip-native">
        <div data-tooltip-id={tooltipId} className={stepCss.stepSubSectionHeading}>
          {title}
        </div>
        <HarnessDocTooltip tooltipId={tooltipId} useStandAlone={true} />
      </div>

      <div className={css.tabs}>
        <Radio
          onClick={() => setType(ApprovalRejectionCriteriaType.KeyValues)}
          disabled={isApprovalStepFieldDisabled(readonly)}
          checked={type === ApprovalRejectionCriteriaType.KeyValues}
          className={css.tab}
        >
          {getString('conditions')}
        </Radio>
        <Radio
          onClick={() => setType(ApprovalRejectionCriteriaType.Jexl)}
          disabled={isApprovalStepFieldDisabled(readonly)}
          checked={type === ApprovalRejectionCriteriaType.Jexl}
          className={css.tab}
        >
          {getString('common.jexlExpression')}
        </Radio>
      </div>

      {type === ApprovalRejectionCriteriaType.KeyValues ? (
        <Conditions {...props} allowedFieldKeys={allowedFieldKeys} allowedValuesForFields={allowedValuesForFields} />
      ) : (
        <Jexl {...props} />
      )}
    </div>
  )
}
