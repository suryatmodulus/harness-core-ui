import React, { useEffect, useState } from 'react'
import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type {
  ServiceNowApprovalData,
  ServiceNowApprovalStepModeProps,
  ServiceNowFormContentInterface, ServiceNowTicketTypeSelectOption
} from '@pipeline/components/PipelineSteps/Steps/ServiceNowApproval/types'
import { resetForm } from '@pipeline/components/PipelineSteps/Steps/ServiceNowApproval/types'
import { useStrings } from '../../../../../../framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useQueryParams } from '@common/hooks'
import type {
  AccountPathProps,
  GitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'
import type { ServiceNowFieldNG, ServiceNowStatusNG, ServiceNowTicketTypeNG } from '../../../../../../services/cd-ng'
import {
  Accordion,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType
} from '@wings-software/uicore'

import * as Yup from 'yup'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import type { FormikProps } from 'formik'
import cx from 'classnames'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import { isApprovalStepFieldDisabled } from '@pipeline/components/PipelineSteps/Steps/Common/ApprovalCommons'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import css from '@pipeline/components/PipelineSteps/Steps/ServiceNowApproval/ServiceNowApproval.module.scss'
import { ApprovalRejectionCriteria } from '@pipeline/components/PipelineSteps/Steps/Common/ApprovalRejectionCriteria'
import { useParams } from 'react-router-dom'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { ApprovalRejectionCriteriaType } from '@pipeline/components/PipelineSteps/Steps/Common/types'
import {
  Failure, ResponseListServiceNowFieldNG, useGetServiceNowIssueCreateMetadata,
  UseGetServiceNowIssueCreateMetadataProps,
  useGetServiceNowTicketTypes
} from '../../../../../../services/cd-ng'
import {
  getApprovalRejectionCriteriaForInitialValues,
  getGenuineValue
} from '@pipeline/components/PipelineSteps/Steps/ServiceNowApproval/helper'
import { GetDataError } from 'restful-react'

const FormContent = ({
  formik,
  isNewStep,
  readonly,
  allowableTypes,
  stepViewType,
  refetchServiceNowTicketTypes,
  fetchingServiceNowTicketTypes,
  serviceNowTicketTypesFetchError,
  serviceNowTicketTypesResponse,
  refetchServiceNowMetadata,
  serviceNowMetadataFetchError,
  fetchingServiceNowMetadata,
  serviceNowMetadataResponse
}: ServiceNowFormContentInterface) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const [statusList, setStatusList] = useState<ServiceNowStatusNG[]>([])

  const [fieldList, setFieldList] = useState<ServiceNowFieldNG[]>([])
  // @ts-ignore
  const [serviceNowTicketTypes, setServiceNowTicketTypes] = useState<ServiceNowTicketTypeNG>()
  const [serviceNowMetadata, setServiceNowMetadata] = useState<ServiceNowFieldNG>()

  const [connectorValueType, setConnectorValueType] = useState<MultiTypeInputType>(MultiTypeInputType.FIXED)

  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }

  const connectorRefFixedValue = getGenuineValue(formik.values.spec.connectorRef)
  const ticketTypeFixedValue =
    typeof formik.values.spec.ticketType === 'object'
      ? (formik.values.spec.ticketType as ServiceNowTicketTypeSelectOption).key
      : undefined


  useEffect(() => {
    // If connector value changes in form, fetch TicketTypes
    if (connectorRefFixedValue && connectorValueType === MultiTypeInputType.FIXED) {
      refetchServiceNowTicketTypes({
        queryParams: {
          ...commonParams,
          connectorRef: connectorRefFixedValue.toString()
        }
      })
    }
  }, [connectorRefFixedValue])

  useEffect(() => {
    // If ticket type type changes in form, set status and field list
    if (ticketTypeFixedValue && connectorRefFixedValue) {
      const ticketTypeData = serviceNowTicketTypes?.fields[ticketTypeFixedValue]
      const statusListFromType = ticketTypeData?. || []
      setStatusList(statusListFromType)
      const fieldListToSet: ServiceNowFieldNG[] = []
      const fieldKeys = Object.keys(ticketTypeData?. || {})
      fieldKeys.forEach(key => {
        if (ticketTypeData?.fields[key]) {
          fieldListToSet.push(ticketTypeData?.fields[key])
        }
      })
      setFieldList(fieldListToSet)
      const approvalCriteria = getApprovalRejectionCriteriaForInitialValues(
        formik.values.spec.approvalCriteria,
        statusListFromType,
        fieldListToSet
      )
      formik.setFieldValue('spec.approvalCriteria', approvalCriteria)
      const rejectionCriteria = getApprovalRejectionCriteriaForInitialValues(
        formik.values.spec.rejectionCriteria,
        statusListFromType,
        fieldListToSet
      )
      formik.setFieldValue('spec.rejectionCriteria', rejectionCriteria)
    }
  }, [ticketTypeFixedValue, serviceNowTicketTypes])

  return (
    <React.Fragment>
      {stepViewType !== StepViewType.Template && (
        <div className={cx(stepCss.formGroup, stepCss.lg)}>
          <FormInput.InputWithIdentifier
            inputLabel={getString('name')}
            isIdentifierEditable={isNewStep}
            inputGroupProps={{ disabled: isApprovalStepFieldDisabled(readonly) }}
          />
        </div>
      )}

      <div className={cx(stepCss.formGroup, stepCss.sm)}>
        <FormMultiTypeDurationField
          name="timeout"
          label={getString('pipelineSteps.timeoutLabel')}
          disabled={isApprovalStepFieldDisabled(readonly)}
          multiTypeDurationProps={{
            expressions,
            enableConfigureOptions: false,
            allowableTypes
          }}
        />
        {getMultiTypeFromValue(formik.values.timeout) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formik.values.timeout || ''}
            type="String"
            variableName="timeout"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => formik.setFieldValue('timeout', value)}
            isReadonly={readonly}
          />
        )}
      </div>

      <div className={stepCss.divider} />

      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormMultiTypeConnectorField
          name="spec.connectorRef"
          label={getString('pipeline.serviceNowApprovalStep.connectorRef')}
          width={390}
          className={css.connector}
          connectorLabelClass={css.connectorLabel}
          placeholder={getString('select')}
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          multiTypeProps={{ expressions, allowableTypes }}
          type="ServiceNow"
          enableConfigureOptions={false}
          selected={formik?.values?.spec.connectorRef as string}
          onChange={(value: any, _unused, multiType) => {
            // Clear dependent fields
            setConnectorValueType(multiType)
            if (value?.record?.identifier !== connectorRefFixedValue) {
              resetForm(formik, 'connectorRef')
              // if (multiType !== MultiTypeInputType.FIXED) {
              //   setProjectOptions([])
              //   setProjectMetadata(undefined)
              // }
            }
          }}
          disabled={isApprovalStepFieldDisabled(readonly)}
          gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
        />
        {getMultiTypeFromValue(formik.values.spec.connectorRef) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            style={{ marginTop: 14 }}
            value={formik.values.spec.connectorRef as string}
            type="String"
            variableName="spec.connectorRef"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => formik.setFieldValue('spec.connectorRef', value)}
            isReadonly={readonly}
          />
        )}
      </div>

      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormInput.MultiTypeInput
          tooltipProps={{
            dataTooltipId: 'serviceNowApprovalTicketType'
          }}
          selectItems={
            // fetchingServiceNowTicketTypes
            //   ? [{ label: getString('pipeline.serviceNowApprovalStep.fetchingTicketTypesPlaceholder'), value: '' }]
            //   : setServiceNowTicketTypes(serviceNowTicketTypes?.fields)
          }
          label={getString('pipeline.serviceNowApprovalStep.ticketType')}
          name="spec.ticketType"
          isOptional={true}
          placeholder={
            fetchingServiceNowTicketTypes
              ? getString('pipeline.serviceNowApprovalStep.fetchingTicketTypesPlaceholder')
              : serviceNowTicketTypesFetchError?.message
              ? serviceNowTicketTypesFetchError?.message
              : getString('select')
          }
          disabled={isApprovalStepFieldDisabled(readonly, fetchingServiceNowTicketTypes)}
          multiTypeInputProps={{
            // selectProps: {
            //   addClearBtn: true,
            //   items: fetchingServiceNowTicketTypes
            //     ? [{ label: getString('pipeline.serviceNowApprovalStep.fetchingTicketTypesPlaceholder'), value: '' }]
            //     : setServiceNowTicketTypes(serviceNowTicketTypes?.fields)
            // },
            // allowableTypes: [MultiTypeInputType.FIXED],
            // onChange: (value: unknown) => {
            //   // Clear dependent fields
            //   if ((value as ServiceNowTicketTypeSelectOption)?.key !== ticketTypeFixedValue) {
            //     resetForm(formik, 'issueType')
            //   }
            // }
          }}
        />
      </div>

      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormInput.MultiTextInput
          tooltipProps={{
            dataTooltipId: 'serviceNowApprovalIssueNumber'
          }}
          label={getString('pipeline.serviceNowApprovalStep.issueNumber')}
          name="spec.issueKey"
          placeholder={getString('pipeline.serviceNowApprovalStep.issueNumberPlaceholder')}
          disabled={isApprovalStepFieldDisabled(readonly)}
          multiTextInputProps={{
            expressions,
            allowableTypes
          }}
        />
        {getMultiTypeFromValue(formik.values.spec.issueNumber) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formik.values.spec.issueNumber}
            type="String"
            variableName="spec.issueNumber"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => formik.setFieldValue('spec.issueNumber', value)}
            isReadonly={readonly}
          />
        )}
      </div>

      <ApprovalRejectionCriteria
        statusList={statusList}
        fieldList={fieldList}
        title={getString('pipeline.approvalCriteria.approvalCriteria')}
        isFetchingFields={false}
        mode="approvalCriteria"
        values={formik.values.spec.approvalCriteria}
        onChange={values => formik.setFieldValue('spec.approvalCriteria', values)}
        formikErrors={formik.errors.spec?.approvalCriteria?.spec}
        readonly={readonly}
        stepType={StepType.ServiceNowApproval}
      />

      <div className={stepCss.noLookDivider} />

      <Accordion className={stepCss.accordion}>
        <Accordion.Panel
          id="optional-config"
          summary={getString('common.optionalConfig')}
          details={
            <ApprovalRejectionCriteria
              statusList={statusList}
              fieldList={fieldList}
              title={getString('pipeline.approvalCriteria.rejectionCriteria')}
              isFetchingFields={false}
              mode="rejectionCriteria"
              values={formik.values.spec.rejectionCriteria}
              onChange={values => formik.setFieldValue('spec.rejectionCriteria', values)}
              readonly={readonly}
              stepType={StepType.ServiceNowApproval}
            />
          }
        />
      </Accordion>
    </React.Fragment>
  )
}
function ServiceNowApprovalStepMode(
  props: ServiceNowApprovalStepModeProps,
  formikRef: StepFormikFowardRef<ServiceNowApprovalData>
) {
  const { onUpdate, readonly, isNewStep, allowableTypes, stepViewType, onChange } = props
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps & GitQueryParams>>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    branch,
    repoIdentifier
  }
  const {
    refetch: refetchServiceNowTicketTypes,
    data: serviceNowTicketTypesResponse,
    error: serviceNowTicketTypesFetchError,
    loading: fetchingServiceNowTicketTypes
  } = useGetServiceNowTicketTypes({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: ''
    }
  })

  const {
    refetch: refetchServiceNowMetadata,
    data: serviceNowMetadataResponse,
    error: serviceNowMetadataFetchError,
    loading: fetchingServiceNowMetadata
  } = useGetServiceNowIssueCreateMetadata({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: ''
    }
  })
  return (
    <Formik<ServiceNowApprovalData>
      onSubmit={values => onUpdate?.(values)}
      formName="serviceNowApproval"
      initialValues={props.initialValues}
      enableReinitialize={true}
      validate={data => {
        onChange?.(data)
      }}
      validationSchema={Yup.object().shape({
        ...getNameAndIdentifierSchema(getString, stepViewType),
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
        spec: Yup.object().shape({
          connectorRef: Yup.string().required(getString('pipeline.serviceNowApprovalStep.validations.connectorRef')),

          approvalCriteria: Yup.object().shape({
            spec: Yup.object().when('type', {
              is: ApprovalRejectionCriteriaType.KeyValues,
              then: Yup.object().shape({
                conditions: Yup.array().required(
                  getString('pipeline.approvalCriteria.validations.approvalCriteriaCondition')
                )
              }),
              otherwise: Yup.object().shape({
                expression: Yup.string().trim().required(getString('pipeline.approvalCriteria.validations.expression'))
              })
            })
          })
        })
      })}
    >
      {(formik: FormikProps<ServiceNowApprovalData>) => {
        setFormikRef(formikRef, formik)
        return (
          <FormikForm>
            <FormContent
              formik={formik}
              allowableTypes={allowableTypes}
              stepViewType={stepViewType}
              readonly={readonly}
              isNewStep={isNewStep}
              refetchServiceNowTicketTypes={refetchServiceNowTicketTypes}
              fetchingServiceNowTicketTypes={fetchingServiceNowTicketTypes}
              serviceNowTicketTypesResponse={serviceNowTicketTypesResponse}
              serviceNowTicketTypesFetchError={serviceNowTicketTypesFetchError}
              refetchServiceNowMetadata={refetchServiceNowMetadata}
              fetchingServiceNowMetadata={fetchingServiceNowMetadata}
              serviceNowMetadataResponse={serviceNowMetadataResponse}
              serviceNowMetadataFetchError={serviceNowMetadataFetchError}
            />
          </FormikForm>
        )
      }}
    </Formik>
  )
}
const ServiceNowApprovalStepModeWithRef = React.forwardRef(ServiceNowApprovalStepMode)
export default ServiceNowApprovalStepModeWithRef
