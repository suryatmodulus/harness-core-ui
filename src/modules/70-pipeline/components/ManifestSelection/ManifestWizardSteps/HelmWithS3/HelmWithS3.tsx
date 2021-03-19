import React from 'react'
import { useParams } from 'react-router-dom'
import { Form } from 'formik'
import * as Yup from 'yup'
import cx from 'classnames'
import { get } from 'lodash-es'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import {
  Text,
  Accordion,
  Layout,
  Button,
  FormInput,
  Formik,
  StepProps,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Color,
  SelectOption
} from '@wings-software/uicore'

import { useStrings } from 'framework/exports'
import type { ConnectorConfigDTO, ManifestConfig, ManifestConfigWrapper } from 'services/cd-ng'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useListAwsRegions } from 'services/portal'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import type { CommandFlags, HelmWithS3DataType } from '../../ManifestInterface'
import HelmAdvancedStepSection from '../HelmAdvancedStepSection'

import { helmVersions } from '../../Manifesthelper'
import css from '../ManifestWizardSteps.module.scss'
import helmcss from '../HelmWithGIT/HelmWithGIT.module.scss'

interface HelmWithHttpPropType {
  stepName: string
  expressions: string[]
  initialValues: ManifestConfig
  handleSubmit: (data: ManifestConfigWrapper) => void
}

const commandFlagOptionsV2 = [
  { label: 'Fetch', value: 'Fetch' },
  { label: 'Version ', value: 'Version' },
  { label: 'Template ', value: 'Template' }
]
const commandFlagOptionsV3 = [
  { label: 'Pull', value: 'Pull' },
  { label: 'Version ', value: 'Version' },
  { label: 'Template ', value: 'Template' }
]

const HelmWithS3: React.FC<StepProps<ConnectorConfigDTO> & HelmWithHttpPropType> = ({
  stepName,
  prevStepData,
  expressions,
  initialValues,
  handleSubmit,
  previousStep
}) => {
  const { getString } = useStrings()
  const [regions, setRegions] = React.useState<SelectOption[]>([])

  /* Code related to region */
  const { accountId } = useParams<AccountPathProps>()

  const { data: regionData } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })
  React.useEffect(() => {
    const regionValues = (regionData?.resource || []).map(region => ({
      value: region.value,
      label: region.name
    }))
    setRegions(regionValues as SelectOption[])
  }, [regionData?.resource])

  /* Code related to region */

  const isActiveAdvancedStep: boolean = initialValues?.spec?.skipResourceVersioning || initialValues?.spec?.commandFlags

  const getInitialValues = (): HelmWithS3DataType => {
    const specValues = get(initialValues, 'spec.store.spec', null)

    if (specValues) {
      const values = {
        ...specValues,
        identifier: initialValues.identifier,
        bucketName: specValues.bucketName,
        folderPath: specValues.folderPath,
        region: regions.find(regionObj => regionObj.value === specValues?.region) || specValues?.region,
        helmVersion: initialValues.spec?.helmVersion,
        chartName: initialValues.spec?.chartName,
        chartVersion: initialValues.spec?.chartVersion,
        skipResourceVersioning: initialValues?.spec?.skipResourceVersioning,
        commandFlags: initialValues.spec?.commandFlags?.map((commandFlag: { commandType: string; flag: string }) => ({
          commandType: commandFlag.commandType,
          flag: commandFlag.flag
          // id: uuid(commandFlag, nameSpace())
        })) || [{ commandType: undefined, flag: undefined, id: uuid('', nameSpace()) }]
      }
      return values
    }
    return {
      identifier: '',
      bucketName: '',
      region: { label: '', value: '' },
      folderPath: '',
      helmVersion: 'V2',
      chartName: '',
      chartVersion: '',
      skipResourceVersioning: false,
      commandFlags: [{ commandType: undefined, flag: undefined, id: uuid('', nameSpace()) }]
    }
  }
  const submitFormData = (formData: HelmWithS3DataType & { store?: string; connectorRef?: string }): void => {
    const manifestObj: ManifestConfigWrapper = {
      manifest: {
        identifier: formData.identifier,
        spec: {
          store: {
            type: formData?.store,
            spec: {
              connectorRef: formData?.connectorRef,
              bucketName: formData?.bucketName,
              folderPath: formData?.folderPath,
              region: formData?.region?.value ? formData?.region?.value : formData?.region
            }
          },
          chartName: formData?.chartName,
          chartVersion: formData?.chartVersion,
          helmVersion: formData?.helmVersion,
          skipResourceVersioning: formData?.skipResourceVersioning,
          commandFlags: formData?.commandFlags[0].commandType
            ? formData?.commandFlags.map((commandFlag: CommandFlags) => ({
                commandType: commandFlag.commandType,
                flag: commandFlag.flag
              }))
            : []
        }
      }
    }

    handleSubmit(manifestObj)
  }

  return (
    <Layout.Vertical spacing="xxlarge" padding="small" className={css.manifestStore}>
      <Text font="large" color={Color.GREY_800}>
        {stepName}
      </Text>
      <Formik
        initialValues={getInitialValues()}
        validationSchema={Yup.object().shape({
          folderPath: Yup.string().trim().required(getString('manifestType.folderPathRequired')),
          chartName: Yup.string().trim().required(getString('manifestType.http.chartNameRequired')),
          chartVersion: Yup.string().trim().required(getString('manifestType.http.chartVersionRequired')),
          helmVersion: Yup.string().trim().required(getString('manifestType.helmVersionRequired'))
        })}
        onSubmit={formData => {
          submitFormData({
            ...prevStepData,
            ...formData,
            connectorRef: prevStepData?.connectorRef
              ? getMultiTypeFromValue(prevStepData?.connectorRef) === MultiTypeInputType.RUNTIME
                ? prevStepData?.connectorRef
                : prevStepData?.connectorRef?.value
              : prevStepData?.identifier
              ? prevStepData?.identifier
              : ''
          })
        }}
      >
        {(formik: { setFieldValue: (a: string, b: string) => void; values: HelmWithS3DataType }) => (
          <Form>
            <div className={helmcss.helmGitForm}>
              <Layout.Horizontal flex spacing="huge">
                <div className={helmcss.halfWidth}>
                  <FormInput.Text
                    name="identifier"
                    label={getString('manifestType.manifestIdentifier')}
                    placeholder={getString('manifestType.manifestPlaceholder')}
                  />
                </div>
              </Layout.Horizontal>

              <Layout.Horizontal flex spacing="huge">
                <div
                  className={cx(helmcss.halfWidth, {
                    [helmcss.runtimeInput]:
                      getMultiTypeFromValue(formik.values?.bucketName) === MultiTypeInputType.RUNTIME
                  })}
                >
                  <FormInput.MultiTextInput
                    label={getString('manifestType.bucketName')}
                    placeholder={getString('manifestType.pathPlaceholder')}
                    name="bucketName"
                    multiTextInputProps={{ expressions }}
                  />
                  {getMultiTypeFromValue(formik.values?.bucketName) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      style={{ alignSelf: 'center' }}
                      value={formik.values?.bucketName as string}
                      type="String"
                      variableName="bucketName"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => formik.setFieldValue('bucketName', value)}
                    />
                  )}
                </div>
                <div
                  className={cx(helmcss.halfWidth, {
                    [helmcss.runtimeInput]: getMultiTypeFromValue(formik.values?.region) === MultiTypeInputType.RUNTIME
                  })}
                >
                  <FormInput.MultiTypeInput
                    name="region"
                    selectItems={regions}
                    multiTypeInputProps={{
                      selectProps: {
                        defaultSelectedItem: formik.values.region,
                        items: regions
                      }
                    }}
                    label={getString('pipelineSteps.regionLabel')}
                  />

                  {getMultiTypeFromValue(formik.values.region) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      style={{ alignSelf: 'center' }}
                      value={formik.values?.region as string}
                      type="String"
                      variableName="region"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => {
                        formik.setFieldValue('region', value)
                      }}
                    />
                  )}
                </div>
              </Layout.Horizontal>

              <Layout.Horizontal flex spacing="huge">
                <div
                  className={cx(helmcss.halfWidth, {
                    [helmcss.runtimeInput]:
                      getMultiTypeFromValue(formik.values?.folderPath) === MultiTypeInputType.RUNTIME
                  })}
                >
                  <FormInput.MultiTextInput
                    label={getString('chartPath')}
                    placeholder={getString('manifestType.pathPlaceholder')}
                    name="folderPath"
                    multiTextInputProps={{ expressions }}
                  />
                  {getMultiTypeFromValue(formik.values?.folderPath) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      style={{ alignSelf: 'center' }}
                      value={formik.values?.folderPath as string}
                      type="String"
                      variableName="folderPath"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => formik.setFieldValue('folderPath', value)}
                    />
                  )}
                </div>

                <div
                  className={cx(helmcss.halfWidth, {
                    [helmcss.runtimeInput]:
                      getMultiTypeFromValue(formik.values?.chartName) === MultiTypeInputType.RUNTIME
                  })}
                >
                  <FormInput.MultiTextInput
                    name="chartName"
                    multiTextInputProps={{ expressions }}
                    label={getString('manifestType.http.chartName')}
                    placeholder={getString('manifestType.http.chartNamePlaceHolder')}
                  />
                  {getMultiTypeFromValue(formik.values?.chartName) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      style={{ alignSelf: 'center' }}
                      value={formik.values?.chartName as string}
                      type="String"
                      variableName="chartName"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => formik.setFieldValue('chartName', value)}
                    />
                  )}
                </div>
              </Layout.Horizontal>

              <Layout.Horizontal flex spacing="huge" margin={{ bottom: 'small' }}>
                <div
                  className={cx(helmcss.halfWidth, {
                    [helmcss.runtimeInput]:
                      getMultiTypeFromValue(formik.values?.chartVersion) === MultiTypeInputType.RUNTIME
                  })}
                >
                  <FormInput.MultiTextInput
                    name="chartVersion"
                    multiTextInputProps={{ expressions }}
                    label={getString('manifestType.http.chartVersion')}
                    placeholder={getString('manifestType.http.chartVersionPlaceHolder')}
                  />
                  {getMultiTypeFromValue(formik.values?.chartVersion) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      style={{ alignSelf: 'center' }}
                      value={formik.values?.chartVersion}
                      type="String"
                      variableName="chartVersion"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => formik.setFieldValue('chartVersion', value)}
                    />
                  )}
                </div>

                <div className={helmcss.halfWidth}>
                  <FormInput.Select name="helmVersion" label={getString('helmVersion')} items={helmVersions} />
                </div>
              </Layout.Horizontal>

              <Accordion
                activeId={isActiveAdvancedStep ? getString('advancedTitle') : ''}
                className={cx({
                  [helmcss.advancedStepOpen]: isActiveAdvancedStep
                })}
              >
                <Accordion.Panel
                  id={getString('advancedTitle')}
                  addDomId={true}
                  summary={getString('advancedTitle')}
                  details={
                    <HelmAdvancedStepSection
                      formik={formik}
                      expressions={expressions}
                      commandFlagOptions={
                        formik.values?.helmVersion === 'V2' ? commandFlagOptionsV2 : commandFlagOptionsV3
                      }
                    />
                  }
                />
              </Accordion>
            </div>

            <Layout.Horizontal spacing="xxlarge" className={css.saveBtn}>
              <Button text={getString('back')} icon="chevron-left" onClick={() => previousStep?.(prevStepData)} />
              <Button intent="primary" type="submit" text={getString('submit')} rightIcon="chevron-right" />
            </Layout.Horizontal>
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default HelmWithS3
