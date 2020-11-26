import React from 'react'
import {
  Text,
  Formik,
  FormInput,
  Button,
  getMultiTypeFromValue,
  IconName,
  MultiTypeInputType,
  Layout,
  FormikForm
} from '@wings-software/uikit'
import { isEmpty } from 'lodash-es'
import { FieldArray } from 'formik'
import * as yup from 'yup'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/exports'
import { ConfigureOptions, PipelineContext, StepViewType } from '@pipeline/exports'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import {
  getIdentifierFromValue,
  getScopeFromDTO,
  getScopeFromValue
} from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import { DrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { ConnectorInfoDTO, useGetConnector } from 'services/cd-ng'
import { StepType } from '../../PipelineStepInterface'
import { PipelineStep } from '../../PipelineStep'
import { removeEmptyKeys } from '../StepsUtils'
import css from './ECRStep.module.scss'
import stepCss from '../Steps.module.scss'

export enum LimitMemoryUnits {
  Mi = 'Mi',
  Gi = 'Gi'
}

const validationSchema = yup.object().shape({
  identifier: yup.string().trim().required(),
  name: yup.string(),
  description: yup.string(),
  spec: yup
    .object()
    .shape({
      connectorRef: yup.mixed().required(),
      registry: yup.string().trim().required(),
      repo: yup.string().trim().required(),
      tags: yup.array().compact().required(),
      dockerfile: yup.string(),
      context: yup.string(),
      labels: yup.array(),
      buildArgs: yup.array(),
      target: yup.string(),
      pull: yup.string(),
      limitCPU: yup
        .number()
        .transform((v, o) => (o === '' ? null : v))
        .nullable(true)
        .min(0),
      limitMemory: yup
        .number()
        .transform((v, o) => (o === '' ? null : v))
        .nullable(true)
        .min(0),
      timeout: yup.string()
    })
    .required()
})

export interface ECRStepWidgetProps {
  initialValues: any //ECRStepData
  onUpdate?: (data: any) => void //ECRStepData
  stepViewType?: StepViewType
}

const ECRStepWidget: React.FC<ECRStepWidgetProps> = ({ initialValues, onUpdate }): JSX.Element => {
  const {
    state: { pipelineView },
    updatePipelineView
  } = React.useContext(PipelineContext)

  const { getString } = useStrings()

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  const connectorId = getIdentifierFromValue((initialValues.spec.connectorRef as string) || '')
  const initialScope = getScopeFromValue((initialValues.spec.connectorRef as string) || '')

  const { data: connector, loading, refetch } = useGetConnector({
    identifier: connectorId,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: initialScope === Scope.ORG || initialScope === Scope.PROJECT ? orgIdentifier : undefined,
      projectIdentifier: initialScope === Scope.PROJECT ? projectIdentifier : undefined
    },
    lazy: true,
    debounce: 300
  })

  React.useEffect(() => {
    if (
      !isEmpty(initialValues.spec.connectorRef) &&
      getMultiTypeFromValue(initialValues.spec.connectorRef || '') === MultiTypeInputType.FIXED
    ) {
      refetch()
    }
  }, [initialValues.spec.connectorRef])

  const pullOptions = [
    { label: getString('pipelineSteps.pullIfNotExistsLabel'), value: 'ifNotExists' },
    { label: getString('pipelineSteps.pullNeverLabel'), value: 'never' },
    { label: getString('pipelineSteps.pullAlwaysLabel'), value: 'always' }
  ]

  // Fix typings
  function getInitialValuesInCorrectFormat(): any {
    const labels = Object.keys(initialValues.spec.labels || {}).map(key => ({
      key: key,
      value: initialValues.spec.labels![key]
    }))

    if (labels.length === 0) {
      labels.push({ key: '', value: '' })
    }

    const buildArgs = Object.keys(initialValues.spec.buildArgs || {}).map(key => ({
      key: key,
      value: initialValues.spec.buildArgs![key]
    }))

    if (buildArgs.length === 0) {
      buildArgs.push({ key: '', value: '' })
    }

    const pull = pullOptions.find(({ value }) => value === initialValues.spec.pull)
    const limitMemory = initialValues.spec?.resources?.limit?.memory
    const limitCPU = initialValues.spec?.resources?.limit?.cpu

    return removeEmptyKeys({
      ...initialValues,
      spec: {
        ...initialValues.spec,
        limitMemoryUnits: LimitMemoryUnits.Mi,
        labels,
        buildArgs,
        pull,
        limitMemory,
        limitCPU
      }
    })
  }

  const values = getInitialValuesInCorrectFormat()

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
      drawerData: { type: DrawerTypes.StepConfig }
    })
  }

  return (
    <>
      <Text className={stepCss.boldLabel} font={{ size: 'medium' }}>
        {getString('pipelineSteps.ecr.title')}
      </Text>
      <Formik
        enableReinitialize={true}
        initialValues={values}
        validationSchema={validationSchema}
        onSubmit={_values => {
          const labels: { [key: string]: string } = {}
          _values.spec.labels.forEach((pair: { key: string; value: string }) => {
            // Skip empty
            if (pair.key && pair.value) {
              labels[pair.key] = pair.value
            }
          })

          const buildArgs: { [key: string]: string } = {}
          _values.spec.buildArgs.forEach((pair: { key: string; value: string }) => {
            // Skip empty
            if (pair.key && pair.value) {
              buildArgs[pair.key] = pair.value
            }
          })

          const resources: { limit?: { memory?: number; cpu?: number } } = {}

          if (_values.spec.limitMemory || _values.spec.limitCPU) {
            resources.limit = {}

            if (_values.spec.limitMemory) {
              resources.limit.memory = parseInt(_values.spec.limitMemory, 10)
            }

            if (_values.spec.limitCPU) {
              resources.limit.cpu = parseInt(_values.spec.limitCPU, 10)
            }
          }

          delete _values.spec.labels
          delete _values.spec.buildArgs
          delete _values.spec.limitMemory
          delete _values.spec.limitMemoryUnits
          delete _values.spec.limitCPU

          const schemaValues = {
            identifier: _values.identifier,
            name: _values.name,
            description: _values.description,
            spec: {
              ..._values.spec,
              connectorRef: _values.spec.connectorRef?.value || _values.spec.connectorRef,
              pull: _values.spec.pull?.value || _values.spec.pull,
              labels,
              buildArgs,
              resources
            }
          }

          onUpdate?.(removeEmptyKeys(schemaValues))
        }}
      >
        {({ values: formValues, setFieldValue, handleSubmit }) => (
          <FormikForm>
            <div className={css.fieldsSection}>
              <FormInput.InputWithIdentifier
                inputName="name"
                idName="identifier"
                inputLabel={getString('pipelineSteps.stepNameLabel')}
              />
              <FormInput.TextArea name="description" label={getString('description')} />
              <Text margin={{ top: 'medium', bottom: 'xsmall' }}>{getString('pipelineSteps.connectorLabel')}</Text>
              <div className={cx(css.fieldsGroup, css.withoutSpacing)}>
                <FormMultiTypeConnectorField
                  type="Aws"
                  name="spec.connectorRef"
                  label=""
                  placeholder={loading ? getString('loading') : getString('select')}
                  disabled={loading}
                  accountIdentifier={accountId}
                  projectIdentifier={projectIdentifier}
                  orgIdentifier={orgIdentifier}
                />
                {getMultiTypeFromValue(formValues?.spec.connectorRef) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={formValues?.spec.connectorRef as string}
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
              <Text margin={{ top: 'medium', bottom: 'xsmall' }}>{getString('pipelineSteps.registryLabel')}</Text>
              <div className={cx(css.fieldsGroup, css.withoutSpacing)}>
                <FormInput.MultiTextInput name="spec.registry" label="" style={{ flexGrow: 1 }} />
                {getMultiTypeFromValue(formValues.spec.registry) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={formValues.spec.registry as string}
                    type={
                      <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                        <Text>{getString('pipelineSteps.registryLabel')}</Text>
                      </Layout.Horizontal>
                    }
                    variableName="spec.registry"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => setFieldValue('spec.registry', value)}
                  />
                )}
              </div>
              <Text margin={{ top: 'medium', bottom: 'xsmall' }}>{getString('pipelineSteps.repoLabel')}</Text>
              <div className={cx(css.fieldsGroup, css.withoutSpacing, css.bottomSpacing)}>
                <FormInput.MultiTextInput name="spec.repo" label="" style={{ flexGrow: 1 }} />
                {getMultiTypeFromValue(formValues.spec.repo) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={formValues.spec.repo as string}
                    type={
                      <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                        <Text>{getString('pipelineSteps.repoLabel')}</Text>
                      </Layout.Horizontal>
                    }
                    variableName="spec.repo"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => setFieldValue('spec.repo', value)}
                  />
                )}
              </div>
              <FormInput.TagInput
                name="spec.tags"
                label={getString('tagsLabel')}
                items={[]}
                labelFor={name => name as string}
                itemFromNewTag={newTag => newTag}
                tagInputProps={{
                  className: '',
                  noInputBorder: true,
                  openOnKeyDown: false,
                  showAddTagButton: false,
                  fill: true,
                  showNewlyCreatedItemsInList: false,
                  allowNewTag: true,
                  placeholder: ''
                }}
              />
            </div>
            <div className={css.fieldsSection}>
              <Text className={css.optionalConfiguration} font={{ weight: 'semi-bold' }} margin={{ bottom: 'medium' }}>
                {getString('pipelineSteps.optionalConfiguration')}
              </Text>
              <Text margin={{ bottom: 'xsmall' }}>{getString('pipelineSteps.dockerfileLabel')}</Text>
              <div className={cx(css.fieldsGroup, css.withoutSpacing)}>
                <FormInput.MultiTextInput name="spec.dockerfile" label="" style={{ flexGrow: 1 }} />
                {getMultiTypeFromValue(formValues.spec.dockerfile) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={formValues.spec.dockerfile as string}
                    type={
                      <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                        <Text>{getString('pipelineSteps.dockerfileLabel')}</Text>
                      </Layout.Horizontal>
                    }
                    variableName="spec.dockerfile"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => setFieldValue('spec.dockerfile', value)}
                  />
                )}
              </div>
              <Text margin={{ top: 'medium', bottom: 'xsmall' }}>{getString('pipelineSteps.contextLabel')}</Text>
              <div className={cx(css.fieldsGroup, css.withoutSpacing, css.bottomSpacing)}>
                <FormInput.MultiTextInput name="spec.context" label="" style={{ flexGrow: 1 }} />
                {getMultiTypeFromValue(formValues.spec.context) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={formValues.spec.context as string}
                    type={
                      <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                        <Text>{getString('pipelineSteps.contextLabel')}</Text>
                      </Layout.Horizontal>
                    }
                    variableName="spec.context"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => setFieldValue('spec.context', value)}
                  />
                )}
              </div>
              <Text margin={{ bottom: 'xsmall' }}>{getString('pipelineSteps.labelsLabel')}</Text>
              <FieldArray
                name="spec.labels"
                render={({ push, remove }) => (
                  <div>
                    {formValues.spec.labels.map((_labels: string, index: number) => (
                      <div className={css.fieldsGroup} key={index}>
                        <FormInput.Text
                          name={`spec.labels[${index}].key`}
                          placeholder={getString('keyLabel')}
                          style={{ flexGrow: 1 }}
                        />
                        <FormInput.MultiTextInput
                          label=""
                          name={`spec.labels[${index}].value`}
                          placeholder={getString('valueLabel')}
                          style={{ flexGrow: 1 }}
                        />
                        {getMultiTypeFromValue(formValues.spec.labels[index].value) === MultiTypeInputType.RUNTIME && (
                          <ConfigureOptions
                            value={formValues.spec.labels[index].value as string}
                            type={
                              <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                                <Text>{getString('valueLabel')}</Text>
                              </Layout.Horizontal>
                            }
                            variableName={`spec.labels[${index}].value`}
                            showRequiredField={false}
                            showDefaultField={false}
                            showAdvanced={true}
                            onChange={value => setFieldValue(`spec.labels[${index}].value`, value)}
                          />
                        )}

                        {formValues.spec.labels.length > 1 && (
                          <Button
                            intent="primary"
                            icon="ban-circle"
                            iconProps={{ size: 20 }}
                            minimal
                            onClick={() => remove(index)}
                          />
                        )}
                      </div>
                    ))}
                    <Button
                      intent="primary"
                      minimal
                      text={getString('pipelineSteps.addLabel')}
                      onClick={() => push({ key: '', value: '' })}
                    />
                  </div>
                )}
              />
              <Text margin={{ top: 'medium', bottom: 'xsmall' }}>{getString('pipelineSteps.buildArgsLabel')}</Text>
              <FieldArray
                name="spec.buildArgs"
                render={({ push, remove }) => (
                  <div>
                    {formValues.spec.buildArgs.map((_buildArg: string, index: number) => (
                      <div className={css.fieldsGroup} key={index}>
                        <FormInput.Text
                          name={`spec.buildArgs[${index}].key`}
                          placeholder={getString('keyLabel')}
                          style={{ flexGrow: 1 }}
                        />
                        <FormInput.MultiTextInput
                          label=""
                          name={`spec.buildArgs[${index}].value`}
                          placeholder={getString('valueLabel')}
                          style={{ flexGrow: 1 }}
                        />
                        {getMultiTypeFromValue(formValues.spec.buildArgs[index].value) ===
                          MultiTypeInputType.RUNTIME && (
                          <ConfigureOptions
                            value={formValues.spec.buildArgs[index].value as string}
                            type={
                              <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                                <Text>{getString('valueLabel')}</Text>
                              </Layout.Horizontal>
                            }
                            variableName={`spec.buildArgs[${index}].value`}
                            showRequiredField={false}
                            showDefaultField={false}
                            showAdvanced={true}
                            onChange={value => setFieldValue(`spec.buildArgs[${index}].value`, value)}
                          />
                        )}

                        {formValues.spec.buildArgs.length > 1 && (
                          <Button
                            intent="primary"
                            icon="ban-circle"
                            iconProps={{ size: 20 }}
                            minimal
                            onClick={() => remove(index)}
                          />
                        )}
                      </div>
                    ))}
                    <Button
                      intent="primary"
                      minimal
                      text={getString('pipelineSteps.addBuildArg')}
                      onClick={() => push({ key: '', value: '' })}
                    />
                  </div>
                )}
              />
              <Text margin={{ top: 'medium', bottom: 'xsmall' }}>{getString('pipelineSteps.targetLabel')}</Text>
              <div className={cx(css.fieldsGroup, css.withoutSpacing, css.bottomSpacing)}>
                <FormInput.MultiTextInput name="spec.target" label="" style={{ flexGrow: 1 }} />
                {getMultiTypeFromValue(formValues.spec.target) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={formValues.spec.target as string}
                    type={
                      <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                        <Text>{getString('pipelineSteps.targetLabel')}</Text>
                      </Layout.Horizontal>
                    }
                    variableName="spec.target"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => setFieldValue('spec.target', value)}
                  />
                )}
              </div>
              <div style={{ marginBottom: 'var(--spacing-medium)' }} />
              <Text margin={{ top: 'medium', bottom: 'xsmall' }}>{getString('pipelineSteps.pullLabel')}</Text>
              <div className={cx(css.fieldsGroup, css.withoutSpacing, css.bottomSpacing)}>
                <FormInput.MultiTypeInput name="spec.pull" label="" selectItems={pullOptions} style={{ flexGrow: 1 }} />
                {getMultiTypeFromValue(formValues.spec.pull) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={formValues.spec.pull as string}
                    type={
                      <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                        <Text>{getString('pipelineSteps.pullLabel')}</Text>
                      </Layout.Horizontal>
                    }
                    variableName="spec.pull"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => setFieldValue('spec.pull', value)}
                  />
                )}
              </div>
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
              <Text margin={{ top: 'medium', bottom: 'xsmall' }}>{getString('pipelineSteps.timeoutLabel')}</Text>
              <div className={cx(css.fieldsGroup, css.withoutSpacing)}>
                <FormInput.MultiTextInput name="spec.timeout" label="" style={{ flexGrow: 1 }} />
                {getMultiTypeFromValue(formValues.spec.timeout) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={formValues.spec.timeout as string}
                    type={
                      <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                        <Text>{getString('pipelineSteps.timeoutLabel')}</Text>
                      </Layout.Horizontal>
                    }
                    variableName="spec.timeout"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => setFieldValue('spec.timeout', value)}
                  />
                )}
              </div>
              <div style={{ marginBottom: 'var(--spacing-medium)' }} />
            </div>
            <div className={css.buttonsWrapper}>
              <Button
                onClick={() => handleSubmit()}
                intent="primary"
                type="submit"
                text={getString('save')}
                margin={{ right: 'xxlarge' }}
              />
              <Button text={getString('cancel')} minimal onClick={handleCancelClick} />
            </div>
          </FormikForm>
        )}
      </Formik>
    </>
  )
}

export class ECRStep extends PipelineStep<any /*ECRStepData*/> {
  renderStep(
    initialValues: any, //ECRStepData
    onUpdate?: (data: any) => void, //ECRStepData
    stepViewType?: StepViewType
  ): JSX.Element {
    return <ECRStepWidget initialValues={initialValues} onUpdate={onUpdate} stepViewType={stepViewType} />
  }

  protected type = StepType.ECR
  // TODO: Add i18n support
  protected stepName = 'Build and Upload to ECR'
  protected stepIcon: IconName = 'ecr-step'

  protected defaultValues: any /*ECRStepData*/ = {
    identifier: '',
    spec: {}
  }
}
