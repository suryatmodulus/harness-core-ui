import React from 'react'
import {
  Text,
  Formik,
  FormikForm,
  FormInput,
  Button,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Layout,
  IconName
} from '@wings-software/uikit'
import { FieldArray } from 'formik'
import * as yup from 'yup'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/exports'
import { ConfigureOptions, PipelineContext, StepViewType } from '@pipeline/exports'
import { ConnectorInfoDTO, useGetConnector } from 'services/cd-ng'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import {
  getIdentifierFromValue,
  getScopeFromDTO,
  getScopeFromValue
} from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import { DrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { PipelineStep } from '../../PipelineStep'
import { convertFromUIModel, convertToUIModel } from './DependencyUtils'
import { StepType } from '../../PipelineStepInterface'

import css from './Dependency.module.scss'

// TODO: TDO
export type DependencyInfo = ServiceSpecType & {
  image?: string
  connectorRef?: string
  environment?: { [key: string]: string }
  entrypoint?: string[]
  args?: string[]
  resources?: {
    limit: {
      memory?: number
      cpu?: number
    }
  }
}

// TODO: TDO
export interface ServiceSpecType {
  [key: string]: any
}

// TODO: TDO
export interface DependencyData {
  identifier: string
  name?: string
  spec: DependencyInfo
}

// Interface for the form
export interface DependencyDataUI {
  identifier: string
  name?: string
  spec: DependencyInfoUI
}

export type DependencyInfoUI = ServiceSpecType & {
  [key: string]: any
}

export enum LimitMemoryUnits {
  Mi = 'Mi',
  Gi = 'Gi'
}

const validationSchema = yup.object().shape({
  identifier: yup.string().trim().required(),
  name: yup.string().trim().required(),
  spec: yup
    .object()
    .shape({
      connectorRef: yup.mixed().required(),
      image: yup.string().trim().required(),
      limitCPU: yup
        .number()
        .transform((v, o) => (o === '' ? null : v))
        .nullable(true)
        .min(0),
      limitMemory: yup
        .number()
        .transform((v, o) => (o === '' ? null : v))
        .nullable(true)
        .min(0)
    })
    .required()
})

interface DependencyWidgetProps {
  initialValues: DependencyData
  onUpdate?: (data: DependencyData) => void
  stepViewType?: StepViewType
}

const DependencyWidget: React.FC<DependencyWidgetProps> = ({ initialValues, onUpdate }): JSX.Element => {
  const { getString } = useStrings()

  const {
    state: {
      pipelineView,
      pipelineView: {
        drawerData: { data }
      }
    },
    updatePipelineView
  } = React.useContext(PipelineContext)

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  const isEdit = data?.stepConfig?.addOrEdit === 'edit'
  const connectorId = getIdentifierFromValue((initialValues.spec.connectorRef as string) || '')
  const initialScope = getScopeFromValue((initialValues.spec.connectorRef as string) || '')

  const { data: connector, loading, refetch } = useGetConnector({
    identifier: connectorId,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: initialScope === Scope.ORG || initialScope === Scope.PROJECT ? orgIdentifier : undefined,
      projectIdentifier: initialScope === Scope.PROJECT ? projectIdentifier : undefined
    },
    lazy: true
  })

  React.useEffect(() => {
    if (
      !isEmpty(initialValues.spec.connectorRef) &&
      getMultiTypeFromValue(initialValues.spec.connectorRef || '') === MultiTypeInputType.FIXED
    ) {
      refetch()
    }
  }, [initialValues.spec.connectorRef])

  // 1. remove connectorRef in order to show placholder text (connectorRef will be set below)
  // 2. convert to ui model
  const values = convertToUIModel({ ...initialValues, spec: { ...initialValues.spec, connectorRef: undefined } })

  if (
    connector?.data?.connector &&
    getMultiTypeFromValue(initialValues.spec.connectorRef || '') === MultiTypeInputType.FIXED
  ) {
    const scope = getScopeFromDTO<ConnectorInfoDTO>(connector?.data?.connector)
    values.spec.connectorRef = {
      label: connector?.data?.connector.name || '',
      value: `${scope !== Scope.PROJECT ? `${scope}.` : ''}${connector?.data?.connector.identifier}`,
      scope: scope
    }
  } else {
    // do not apply if we are loading connectors (this will keep "Loading" as placeholder in a input field)
    if (!loading) {
      values.spec.connectorRef = initialValues.spec.connectorRef
    }
  }

  const handleCancelClick = (): void => {
    updatePipelineView({
      ...pipelineView,
      isDrawerOpened: false,
      drawerData: { type: DrawerTypes.ConfigureService }
    })
  }

  return (
    <Formik<DependencyDataUI>
      enableReinitialize={true}
      initialValues={values}
      validationSchema={validationSchema}
      onSubmit={(_values: DependencyDataUI) => {
        const schemaValues = convertFromUIModel(_values)
        onUpdate?.(schemaValues)
      }}
    >
      {({ values: formValues, setFieldValue, handleSubmit }) => {
        return (
          <FormikForm>
            <div className={css.fieldsSection}>
              <FormInput.InputWithIdentifier
                inputName="name"
                idName="identifier"
                inputLabel={getString('dependencyNameLabel')}
              />
              <Text margin={{ bottom: 'xsmall' }}>{getString('pipelineSteps.connectorLabel')}</Text>
              <div className={cx(css.fieldsGroup, css.withoutSpacing)}>
                <FormMultiTypeConnectorField
                  type={'' as any}
                  name="spec.connectorRef"
                  label=""
                  placeholder={loading ? getString('loading') : getString('select')}
                  disabled={loading}
                  accountIdentifier={accountId}
                  projectIdentifier={projectIdentifier}
                  orgIdentifier={orgIdentifier}
                />
                {getMultiTypeFromValue(formValues.spec.connectorRef) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={formValues.spec.connectorRef as string}
                    type={
                      <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                        <Text>{getString('pipelineSteps.connectorLabel')}</Text>
                      </Layout.Horizontal>
                    }
                    variableName="spec.connectorRef"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      setFieldValue('spec.connectorRef', value)
                    }}
                  />
                )}
              </div>
              <Text margin={{ top: 'medium', bottom: 'xsmall' }}>{getString('imageLabel')}</Text>
              <div className={cx(css.fieldsGroup, css.withoutSpacing)}>
                <FormInput.MultiTextInput name="spec.image" label="" style={{ flexGrow: 1 }} />
                {getMultiTypeFromValue(formValues.spec.image) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={formValues.spec.image as string}
                    type={
                      <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                        <Text>{getString('imageLabel')}</Text>
                      </Layout.Horizontal>
                    }
                    variableName="spec.image"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => setFieldValue('spec.image', value)}
                  />
                )}
              </div>
            </div>
            <div className={css.fieldsSection}>
              <Text className={css.optionalConfiguration} font={{ weight: 'semi-bold' }} margin={{ bottom: 'small' }}>
                {getString('pipelineSteps.optionalConfiguration')}
              </Text>
              <Text margin={{ bottom: 'xsmall' }}>{getString('environment')}</Text>
              <FieldArray
                name="spec.environment"
                render={({ push, remove }) => (
                  <div>
                    {formValues.spec.environment.length > 0 &&
                      formValues.spec.environment.map((_environment: string, index: number) => (
                        <div className={css.fieldsGroup} key={index}>
                          <FormInput.Text
                            name={`spec.environment[${index}].key`}
                            placeholder={getString('keyLabel')}
                            style={{ flexGrow: 1 }}
                          />
                          <FormInput.MultiTextInput
                            label=""
                            name={`spec.environment[${index}].value`}
                            placeholder={getString('valueLabel')}
                            style={{ flexGrow: 1 }}
                          />
                          {getMultiTypeFromValue(formValues.spec.environment[index].value) ===
                            MultiTypeInputType.RUNTIME && (
                            <ConfigureOptions
                              value={formValues.spec.environment[index].value as string}
                              type={
                                <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                                  <Text>{getString('valueLabel')}</Text>
                                </Layout.Horizontal>
                              }
                              variableName={`spec.environment[${index}].value`}
                              showRequiredField={false}
                              showDefaultField={false}
                              showAdvanced={true}
                              onChange={value => setFieldValue(`spec.environment[${index}].value`, value)}
                            />
                          )}

                          <Button
                            intent="primary"
                            icon="ban-circle"
                            iconProps={{ size: 20 }}
                            minimal
                            onClick={() => remove(index)}
                          />
                        </div>
                      ))}
                    <Button
                      intent="primary"
                      minimal
                      text={getString('addEnvironment')}
                      onClick={() => push({ key: '', value: '' })}
                      margin={{ bottom: 'medium' }}
                    />
                  </div>
                )}
              />
              <Text margin={{ bottom: 'xsmall' }}>{getString('entryPointsLabel')}</Text>
              <FieldArray
                name="spec.entrypoint"
                render={({ push, remove }) => (
                  <div>
                    {formValues.spec.entrypoint.length > 0 &&
                      formValues.spec.entrypoint.map((_entrypoint: string, index: number) => (
                        <div className={css.fieldsGroup} key={index}>
                          <FormInput.MultiTextInput
                            label=""
                            name={`spec.entrypoint[${index}]`}
                            style={{ flexGrow: 1 }}
                          />
                          {getMultiTypeFromValue(formValues.spec.entrypoint[index]) === MultiTypeInputType.RUNTIME && (
                            <ConfigureOptions
                              value={formValues.spec.entrypoint[index] as string}
                              type={
                                <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                                  <Text>{getString('entryPointsLabel')}</Text>
                                </Layout.Horizontal>
                              }
                              variableName={`spec.entrypoint[${index}]`}
                              showRequiredField={false}
                              showDefaultField={false}
                              showAdvanced={true}
                              onChange={value => setFieldValue(`spec.entrypoint[${index}]`, value)}
                            />
                          )}

                          <Button
                            intent="primary"
                            icon="ban-circle"
                            iconProps={{ size: 20 }}
                            minimal
                            onClick={() => remove(index)}
                          />
                        </div>
                      ))}
                    <Button
                      intent="primary"
                      minimal
                      text={getString('addEntryPoint')}
                      onClick={() => push('')}
                      margin={{ bottom: 'medium' }}
                    />
                  </div>
                )}
              />
              <Text margin={{ bottom: 'xsmall' }}>{getString('argumentsLabel')}</Text>
              <FieldArray
                name="spec.args"
                render={({ push, remove }) => (
                  <div>
                    {formValues.spec.args.length > 0 &&
                      formValues.spec.args.map((_arg: string, index: number) => (
                        <div className={css.fieldsGroup} key={index}>
                          <FormInput.MultiTextInput label="" name={`spec.args[${index}]`} style={{ flexGrow: 1 }} />
                          {getMultiTypeFromValue(formValues.spec.args[index]) === MultiTypeInputType.RUNTIME && (
                            <ConfigureOptions
                              value={formValues.spec.args[index] as string}
                              type={
                                <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                                  <Text>{getString('argumentsLabel')}</Text>
                                </Layout.Horizontal>
                              }
                              variableName={`spec.args[${index}]`}
                              showRequiredField={false}
                              showDefaultField={false}
                              showAdvanced={true}
                              onChange={value => setFieldValue(`spec.args[${index}]`, value)}
                            />
                          )}

                          <Button
                            intent="primary"
                            icon="ban-circle"
                            iconProps={{ size: 20 }}
                            minimal
                            onClick={() => remove(index)}
                          />
                        </div>
                      ))}
                    <Button
                      intent="primary"
                      minimal
                      text={getString('addArgument')}
                      onClick={() => push('')}
                      margin={{ bottom: 'medium' }}
                    />
                  </div>
                )}
              />
              <div>
                <Text>
                  {getString('pipelineSteps.setContainerResources')}
                  <Button icon="question" minimal tooltip={getString('pipelineSteps.setContainerResourcesTooltip')} />
                </Text>
                <div className={cx(css.fieldsGroup, css.withoutSpacing)}>
                  <div>
                    <FormInput.Text
                      name="spec.limitMemory"
                      inputGroup={{ type: 'number', min: 0 }}
                      label={getString('pipelineSteps.limitMemoryLabel')}
                      placeholder={getString('pipelineSteps.limitMemoryPlaceholder')}
                    />
                    <Text font="xsmall" margin={{ top: 'small' }}>
                      {getString('pipelineSteps.limitMemoryExample')}
                    </Text>
                  </div>
                  <FormInput.Select
                    name="spec.limitMemoryUnits"
                    items={[
                      { label: getString('pipelineSteps.limitMemoryUnitMiLabel'), value: LimitMemoryUnits.Mi },
                      { label: getString('pipelineSteps.limitMemoryUnitGiLabel'), value: LimitMemoryUnits.Gi }
                    ]}
                  />
                  <div>
                    <FormInput.Text
                      name="spec.limitCPU"
                      inputGroup={{ type: 'number', min: 0 }}
                      label={getString('pipelineSteps.limitCPULabel')}
                      placeholder={getString('pipelineSteps.limitCPUPlaceholder')}
                    />
                    <Text font="xsmall" margin={{ top: 'small' }}>
                      {getString('pipelineSteps.limitCPUExample')}
                    </Text>
                  </div>
                </div>
              </div>
            </div>
            <div className={css.buttonsWrapper}>
              <Button
                disabled={loading}
                onClick={() => handleSubmit()}
                intent="primary"
                type="submit"
                text={isEdit ? getString('save') : getString('add')}
                margin={{ right: 'xxlarge' }}
              />
              <Button text={getString('cancel')} minimal onClick={handleCancelClick} />
            </div>
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export class Dependency extends PipelineStep<DependencyData> {
  renderStep(
    initialValues: DependencyData,
    onUpdate?: (data: DependencyData) => void,
    stepViewType?: StepViewType
  ): JSX.Element {
    return <DependencyWidget initialValues={initialValues} onUpdate={onUpdate} stepViewType={stepViewType} />
  }

  protected type = StepType.Dependency
  // TODO: Add i18n support
  protected stepName = 'Dependency'
  protected stepIcon: IconName = 'dependency-step'

  protected defaultValues: DependencyData = {
    identifier: '',
    spec: {}
  }
}
