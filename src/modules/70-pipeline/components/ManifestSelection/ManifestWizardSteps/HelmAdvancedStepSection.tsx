import React from 'react'
import {
  Layout,
  Button,
  FormInput,
  MultiTypeInputType,
  Color,
  Icon,
  getMultiTypeFromValue
} from '@wings-software/uicore'
import { Tooltip } from '@blueprintjs/core'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'

import { v4 as nameSpace, v5 as uuid } from 'uuid'
import { FieldArray } from 'formik'

import { String, useStrings } from 'framework/strings'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { FormMultiTypeCheckboxField } from '@common/components'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import type { CommandFlags, HelmWithGITDataType, HelmWithHTTPDataType } from '../ManifestInterface'

import helmcss from './HelmWithGIT/HelmWithGIT.module.scss'
import css from './ManifestWizardSteps.module.scss'
interface HelmAdvancedStepProps {
  commandFlagOptions: Array<{ label: string; value: string }>
  expressions: string[]
  formik: {
    setFieldValue: (a: string, b: string) => void
    values: HelmWithGITDataType | HelmWithHTTPDataType
  }
  isReadonly?: boolean
}

const HelmAdvancedStepSection: React.FC<HelmAdvancedStepProps> = ({
  formik,
  commandFlagOptions,
  expressions,
  isReadonly
}) => {
  const { getString } = useStrings()
  const defaultValueToReset = [{ commandType: '', flag: '', id: uuid('', nameSpace()) }]

  const commandFlagLabel = (): React.ReactElement => {
    return (
      <Layout.Horizontal flex spacing="small">
        <String tagName="div" stringID="pipeline.manifestType.helmCommandFlagLabel" />
      </Layout.Horizontal>
    )
  }

  return (
    <div className={helmcss.helmAdvancedSteps}>
      <Layout.Horizontal width={'90%'} flex={{ justifyContent: 'flex-start', alignItems: 'center' }}>
        <FormMultiTypeCheckboxField
          name="skipResourceVersioning"
          label={getString('skipResourceVersion')}
          className={cx(helmcss.checkbox, helmcss.halfWidth)}
          multiTypeTextbox={{ expressions }}
        />
        {getMultiTypeFromValue(formik.values?.skipResourceVersioning) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={((formik.values?.skipResourceVersioning || '') as unknown) as string}
            type="String"
            variableName="skipResourceVersioning"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => formik.setFieldValue('skipResourceVersioning', value)}
            style={{ alignSelf: 'center' }}
            className={cx(css.addmarginTop)}
            isReadonly={isReadonly}
          />
        )}
        <Tooltip
          position="top"
          content={
            <div className={helmcss.tooltipContent}>{getString('pipeline.manifestType.helmSkipResourceVersion')} </div>
          }
          className={cx(helmcss.tooltip, css.addmarginTop)}
        >
          <Icon name="info-sign" color={Color.PRIMARY_4} size={16} />
        </Tooltip>
      </Layout.Horizontal>

      <div className={helmcss.commandFlags}>
        <MultiTypeFieldSelector
          defaultValueToReset={defaultValueToReset}
          name={'commandFlags'}
          label={commandFlagLabel()}
          disableTypeSelection
        >
          <FieldArray
            name="commandFlags"
            render={({ push, remove }) => (
              <Layout.Vertical>
                {formik.values?.commandFlags?.map((commandFlag: CommandFlags, index: number) => (
                  <Layout.Horizontal key={commandFlag.id} spacing="xxlarge" flex margin={{ top: 'small' }}>
                    <div className={helmcss.halfWidth}>
                      <FormInput.MultiTypeInput
                        name={`commandFlags[${index}].commandType`}
                        label={index === 0 ? getString('pipeline.manifestType.helmCommandType') : ''}
                        selectItems={commandFlagOptions}
                        placeholder={getString('pipeline.manifestType.helmCommandTypePlaceholder')}
                        multiTypeInputProps={{
                          width: 300,
                          onChange: value => {
                            if (isEmpty(value)) {
                              formik.setFieldValue(`commandFlags[${index}].commandType`, '')
                              formik.setFieldValue(`commandFlags[${index}].flag`, '')
                            }
                          },
                          expressions,
                          selectProps: {
                            addClearBtn: true,
                            items: commandFlagOptions
                          }
                        }}
                      />
                    </div>
                    <div className={helmcss.halfWidth}>
                      <Layout.Horizontal>
                        <FormInput.MultiTextInput
                          label={index === 0 ? getString('flag') : ''}
                          name={`commandFlags[${index}].flag`}
                          multiTextInputProps={{
                            expressions,
                            allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                          }}
                        />
                        {index !== 0 && (
                          <Button
                            minimal
                            icon="trash"
                            className={cx({
                              [helmcss.delBtn]: index === 0
                            })}
                            onClick={() => remove(index)}
                          />
                        )}
                      </Layout.Horizontal>
                    </div>
                  </Layout.Horizontal>
                ))}
                {!!(formik.values?.commandFlags?.length < commandFlagOptions.length) && (
                  <span>
                    <Button
                      minimal
                      text={getString('add')}
                      intent="primary"
                      onClick={() => push({ commandType: '', flag: '', id: uuid('', nameSpace()) })}
                    />
                  </span>
                )}
              </Layout.Vertical>
            )}
          />
        </MultiTypeFieldSelector>
      </div>
    </div>
  )
}

export default HelmAdvancedStepSection
