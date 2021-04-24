import React from 'react'
import { Layout, Container, FormikForm, Formik, FormInput, SelectOption } from '@wings-software/uicore'
import * as Yup from 'yup'
import { useParams, useHistory } from 'react-router-dom'
import { StringUtils } from '@common/exports'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import {
  SelectOrCreateConnector,
  SelectOrCreateConnectorProps
} from '@cv/pages/onboarding/SelectOrCreateConnector/SelectOrCreateConnector'
import { SubmitAndPreviousButtons } from '@cv/pages/onboarding/SubmitAndPreviousButtons/SubmitAndPreviousButtons'
import { CVSelectionCard } from '@cv/components/CVSelectionCard/CVSelectionCard'
import { buildConnectorRef } from '@cv/pages/onboarding/CVOnBoardingUtils'
import SyncStepDataValues from '@cv/utils/SyncStepDataValues'
import type { UseStringsReturn } from 'framework/strings'
import css from './SelectProduct.module.scss'

interface SelectProductFieldProps {
  type: 'AppDynamics' | 'GoogleCloudOperations'
  productSelectValidationText?: string
  isEditMode?: boolean
  connectorValue?: SelectOption
  onConnectorCreate?: (val: any) => void
}

interface SelectProductProps<T> extends SelectProductFieldProps {
  stepData?: T
  onCompleteStep: (data: T) => void
}
interface ProductOption {
  value: string
  label: string
}

interface MonitoringSourceInfo extends SelectOrCreateConnectorProps {
  selectProduct: string
  products: ProductOption[]
}

export const InitialValues = {
  name: 'Default Name',
  description: '',
  identifier: 'Default_Name',
  connectorRef: undefined,
  tags: []
}

export function getValidationSchema(
  getString: UseStringsReturn['getString'],
  productSelectValidationText?: string
): Record<string, any> {
  return {
    name: Yup.string().trim().required(getString('cv.onboarding.selectProductScreen.validationText.name')),
    identifier: Yup.string().when('name', {
      is: val => val?.length,
      then: Yup.string()
        .trim()
        .required(getString('cv.onboarding.selectProductScreen.validationText.identifier'))
        .matches(
          /^(?![0-9])[0-9a-zA-Z_$]*$/,
          getString('cv.onboarding.selectProductScreen.validationText.validIdRegex')
        )
        .notOneOf(StringUtils.illegalIdentifiers)
    }),
    connectorRef: Yup.object().required(getString('cv.onboarding.selectProductScreen.validationText.connectorRef')),
    product: Yup.string().required(
      productSelectValidationText || getString('cv.onboarding.selectProductScreen.validationText.product')
    )
  }
}

const getInfoSchemaByType = (type: string, getString: UseStringsReturn['getString']): MonitoringSourceInfo => {
  switch (type) {
    case 'AppDynamics':
      return {
        iconName: 'service-appdynamics',
        iconLabel: 'AppDynamics',
        connectToMonitoringSourceText: getString('cv.monitoringSources.appD.connectToMonitoringSource'),
        firstTimeSetupText: getString('cv.monitoringSources.appD.firstTimeSetupText'),
        connectorType: 'AppDynamics',
        createConnectorText: getString('cv.monitoringSources.appD.createConnectorText'),
        selectProduct: getString('cv.monitoringSources.appD.selectProduct'),

        products: [
          {
            value: 'Application Monitoring',
            label: getString('cv.monitoringSources.appD.product.applicationMonitoring')
          }
          // {
          //   value: 'Business_Performance_Monitoring',
          //   label: getString('cv.monitoringSources.appD.product.businessMonitoring')
          // },
          // { value: 'Machine_Monitoring', label: getString('cv.monitoringSources.appD.product.machineMonitoring') },
          // { value: 'End_User_Moniorting', label: getString('cv.monitoringSources.appD.product.endUserMonitoring') }
        ]
      }
    case 'GoogleCloudOperations':
      return {
        iconName: 'service-stackdriver',
        iconLabel: 'Google Cloud Operations',
        connectToMonitoringSourceText: getString('cv.monitoringSources.gco.connectToMonitoringSource'),
        firstTimeSetupText: getString('cv.monitoringSources.gco.firstTimeSetupText'),
        connectorType: 'Gcp',
        createConnectorText: getString('cv.monitoringSources.gco.createConnectorText'),
        selectProduct: getString('cv.monitoringSources.gco.selectProduct'),
        products: [{ value: 'Cloud Metrics', label: getString('cv.monitoringSources.gco.product.metrics') }]
      }
    default:
      return {} as MonitoringSourceInfo
  }
}

export function SelectProductFields(props: SelectProductFieldProps): JSX.Element {
  const { getString } = useStrings()
  const { type, onConnectorCreate } = props
  const monitoringSource = getInfoSchemaByType(type, getString)

  return (
    <Container width="50%" style={{ margin: 'auto' }} className={css.main}>
      <SelectOrCreateConnector
        iconName={monitoringSource.iconName}
        iconLabel={monitoringSource.iconLabel}
        connectorType={monitoringSource.connectorType}
        createConnectorText={monitoringSource.createConnectorText}
        firstTimeSetupText={monitoringSource.firstTimeSetupText}
        connectToMonitoringSourceText={monitoringSource.connectToMonitoringSourceText}
        identifierDisabled={props.isEditMode}
        disableConnector={props.isEditMode}
        value={props.connectorValue}
        onSuccess={data => onConnectorCreate?.(data)}
      />
      <FormInput.CustomRender
        label={monitoringSource?.selectProduct}
        name="product"
        className={css.productSelection}
        render={formikProps => {
          return (
            <Layout.Horizontal spacing="medium">
              {monitoringSource?.products?.map((item, index) => {
                return (
                  <CVSelectionCard
                    isSelected={formikProps.values.product === item.value}
                    key={`${index}${item}`}
                    isLarge
                    cardLabel={item.label}
                    iconProps={{
                      name: monitoringSource.iconName,
                      size: 30
                    }}
                    onCardSelect={isSelected =>
                      formikProps.setFieldValue('product', isSelected ? item.value : undefined)
                    }
                  />
                )
              })}
            </Layout.Horizontal>
          )
        }}
      />
    </Container>
  )
}

export function SelectProduct<T>(props: SelectProductProps<T>): JSX.Element {
  const history = useHistory()
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier, accountId, identifier } = useParams<
    ProjectPathProps & { identifier: string }
  >()

  return (
    <Formik
      // enableReinitialize={true}
      initialValues={{ ...InitialValues, ...props.stepData }}
      validationSchema={Yup.object().shape(getValidationSchema(getString, props.productSelectValidationText))}
      onSubmit={formData => props.onCompleteStep({ ...formData } as any)}
    >
      {formikProps => (
        <FormikForm>
          <SelectProductFields
            type={props.type}
            isEditMode={!!identifier}
            connectorValue={formikProps.values.connectorRef}
            onConnectorCreate={val => formikProps.setFieldValue('connectorRef', buildConnectorRef(val))}
          />
          <SubmitAndPreviousButtons
            onPreviousClick={() =>
              history.push(
                `${routes.toCVAdminSetup({
                  projectIdentifier,
                  orgIdentifier,
                  accountId
                })}?step=2`
              )
            }
          />
          <SyncStepDataValues
            values={formikProps.values}
            listenToValues={props?.stepData}
            onUpdate={formikProps.setValues}
          />
        </FormikForm>
      )}
    </Formik>
  )
}
