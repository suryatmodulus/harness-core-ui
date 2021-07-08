import React, { useState, useEffect } from 'react'
import {
  Button,
  Container,
  StepProps,
  Text,
  Formik,
  FormikForm,
  FormInput,
  Layout,
  Color,
  SelectOption
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import {
  useGetServiceListForProject,
  useGetEnvironmentListForProject,
  GetServiceListForProjectQueryParams,
  GetEnvironmentListForProjectQueryParams
} from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { CVNotificationForm } from '@cv/pages/admin/notifications/NotificationInterfaces'
import { useToaster } from '@common/exports'
import CVRiskScoreSlider from '@cv/components/CVRiskSlider/CVRiskScoreSlider'
import { useCreateAlert, useUpdateAlert, useGetActivityTypes, AlertRuleDTO, VerificationsNotify } from 'services/cv'
import { useStrings } from 'framework/strings'
import css from './ConditionsForm.module.scss'

interface ConditionsFormProps extends StepProps<any> {
  onSuccess: () => void
  hideModal: () => void
  name?: string
  setRuleData: (data: CVNotificationForm | undefined) => void
  ruleData: CVNotificationForm | undefined
  projectIdentifier: string
  orgIdentifier: string
  isEditMode: boolean
}

const getPayloadValue = (items: SelectOption[] | undefined) => {
  const values = items?.map(item => item.value)
  if (values?.includes('All')) {
    return undefined
  } else {
    return values
  }
}

const isAllSelected = (items: SelectOption[] | undefined) => {
  const values = items?.map(item => item.value)
  if (values?.includes('All')) {
    return true
  } else {
    return false
  }
}

const ConditionsForm: React.FC<StepProps<any> & ConditionsFormProps> = props => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()

  const [initialServices, setInitialServices] = useState<SelectOption[]>()
  const [initialEnvironment, setInitialEnvironment] = useState<SelectOption[]>()
  const [initialActivityTypes, setInitialActivityTypes] = useState<SelectOption[]>()
  const [initialVerificationStatus, setInitialVerificationStatus] = useState<SelectOption[]>()
  const [activityTypeOptions, setActivityTypeOptions] = useState<SelectOption[]>([
    { label: getString('all'), value: getString('all') }
  ])
  const [serviceOptions, setServiceOptions] = useState<SelectOption[]>([
    { label: getString('all'), value: getString('all') }
  ])
  const [environmentOptions, setEnvironmentOptions] = useState<SelectOption[]>([
    { label: getString('all'), value: getString('all') }
  ])
  const { loading: loadingServices, data: serviceResponse } = useGetServiceListForProject({
    queryParams: {
      accountId,
      orgIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier
    } as GetServiceListForProjectQueryParams
  })

  const { showError, showSuccess } = useToaster()
  const { data: environmentsResponse } = useGetEnvironmentListForProject({
    queryParams: {
      accountId,
      orgIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier
    } as GetEnvironmentListForProjectQueryParams
  })

  const { data: activityTypeResponse } = useGetActivityTypes({
    queryParams: { projectIdentifier: projectIdentifier, accountId, orgIdentifier: orgIdentifier }
  })

  const { loading: loadingCreate, mutate: createAlert } = useCreateAlert({
    queryParams: {
      accountId,
      projectIdentifier: projectIdentifier,
      orgIdentifier: orgIdentifier
    }
  })
  const { mutate: updateAlert } = useUpdateAlert({
    queryParams: { accountId, projectIdentifier: projectIdentifier, orgIdentifier: orgIdentifier }
  })

  const VerificationStatusOptions = [
    {
      label: getString('all'),
      value: 'All'
    },
    {
      label: getString('passed'),
      value: 'VERIFICATION_PASSED'
    },
    {
      label: getString('failed'),
      value: 'VERIFICATION_FAILED'
    }
  ]

  const getLabelForActivity = (type: string) => {
    switch (type) {
      case 'PRE_DEPLOYMENT':
        return getString('cv.admin.notifications.create.stepThree.preDeployment')
      case 'DURING_DEPLOYMENT':
        return getString('cv.admin.notifications.create.stepThree.duringDeployment')
      case 'POST_DEPLOYMENT':
        return getString('cv.admin.notifications.create.stepThree.postDeployment')
      case 'INFRASTRUCTURE_CHANGE':
        return getString('cv.admin.notifications.create.stepThree.infrastructureChange')
      case 'CONFIG_CHANGE':
        return getString('cv.admin.notifications.create.stepThree.configChange')
      default:
        return ''
    }
  }

  useEffect(() => {
    if (serviceResponse?.data?.content?.length) {
      const services = serviceResponse?.data?.content?.map(service => ({
        label: service.name,
        value: service.identifier
      }))

      setServiceOptions(serviceOptions.concat(services as SelectOption[]))
    }
  }, [serviceResponse])

  useEffect(() => {
    const initialVal: SelectOption[] = []

    if (props.ruleData?.services?.length) {
      props.ruleData.services.forEach(item => {
        serviceResponse?.data?.content?.forEach(service => {
          if (service.identifier == (item as unknown as string)) {
            initialVal.push({ label: service.name || '', value: service.identifier || '' })
          }
        })
      })
      setInitialServices(initialVal)
    } else if (props.ruleData?.allServices) {
      setInitialServices([{ label: getString('all'), value: 'All' }])
    }
  }, [serviceResponse, props.ruleData?.services])

  useEffect(() => {
    if (environmentsResponse?.data?.content?.length) {
      const environments = environmentsResponse?.data?.content?.map(env => ({
        label: env.name,
        value: env.identifier
      }))

      setEnvironmentOptions(environmentOptions.concat(environments as SelectOption[]))
    }
  }, [environmentsResponse])

  useEffect(() => {
    const initialVal: SelectOption[] = []

    if (props.ruleData?.environments?.length) {
      props.ruleData.environments.forEach(item => {
        environmentsResponse?.data?.content?.map(environment => {
          if (environment.identifier == (item as unknown as string)) {
            initialVal.push({ label: environment.name || '', value: environment.identifier || '' })
          }
        })
      })
      setInitialEnvironment(initialVal)
    } else if (props.ruleData?.allEnvironments) {
      setInitialEnvironment([{ label: getString('all'), value: 'All' }])
    }
  }, [environmentsResponse, props.ruleData?.environments])

  useEffect(() => {
    if (activityTypeResponse?.resource?.length) {
      const activityArr = activityTypeResponse?.resource?.map(activity => ({
        label: getLabelForActivity(activity),
        value: activity
      }))

      setActivityTypeOptions(activityTypeOptions.concat(activityArr as SelectOption[]))
    }
  }, [activityTypeResponse])

  useEffect(() => {
    const initialVal: SelectOption[] = []
    if (props.ruleData?.activityTypes?.length) {
      props.ruleData.activityTypes.forEach(item => {
        activityTypeResponse?.resource?.map(activity => {
          if (activity === (item as unknown as string)) {
            initialVal.push({ label: getLabelForActivity(activity) || '', value: activity || '' })
          }
        })
      })
      setInitialActivityTypes(initialVal)
    } else {
      if (props.ruleData?.enabledVerifications && props.ruleData.allActivityTpe) {
        setInitialActivityTypes([{ label: getString('all'), value: 'All' }])
      }
    }
  }, [activityTypeResponse, props.ruleData?.activityTypes])

  useEffect(() => {
    const initialVal: SelectOption[] = []
    if (props.ruleData?.verificationStatuses?.length) {
      props.ruleData.verificationStatuses.forEach(status => {
        VerificationStatusOptions?.map(item => {
          if (item.value === (status as unknown as string)) {
            initialVal.push(item)
          }
        })
      })
      setInitialVerificationStatus(initialVal)
    } else {
      if (props.ruleData?.enabledVerifications && props.ruleData.allVerificationStatuses) {
        setInitialVerificationStatus([{ label: getString('all'), value: 'All' }])
      }
    }
  }, [props.ruleData?.verificationStatuses])

  const createAlertRule = async (payload: AlertRuleDTO) => {
    try {
      await createAlert(payload)
      showSuccess(getString('cv.admin.notifications.createSuccess'))
      props.setRuleData(payload)
      props.hideModal()
      props.onSuccess()
    } catch (e) {
      showError(e.message)
    }
  }
  const updateAlertRule = async (payload: AlertRuleDTO) => {
    try {
      await updateAlert(payload)
      showSuccess(getString('cv.admin.notifications.updateSuccess'))
      props.setRuleData(payload)
      props.hideModal()
      props.onSuccess()
    } catch (e) {
      showError(e.message)
    }
  }

  return (
    <Container>
      <Text font={{ size: 'medium', weight: 'bold' }} color={Color.BLACK} margin={{ bottom: 'xsmall ' }}>
        {getString('cv.admin.notifications.create.stepThree.headingOne')}
      </Text>
      <Text> {getString('cv.admin.notifications.create.stepThree.headingTwo')} </Text>
      <Formik<CVNotificationForm>
        initialValues={{
          activityTypes: initialActivityTypes,
          environments: initialEnvironment,
          verificationStatuses: initialVerificationStatus,
          services: initialServices,
          enabledRisk: props.ruleData?.enabledRisk || false,
          enabledVerifications: props.ruleData?.enabledVerifications || false,
          threshold: props.ruleData?.threshold || 0
        }}
        formName="cvNotificationConditions"
        enableReinitialize={true}
        onSubmit={formData => {
          const notificationData = { ...props.ruleData, ...formData }

          const payload = {
            enabled: true,
            name: notificationData.name,
            alertCondition: {
              services: getPayloadValue(notificationData.services) as string[],
              allServices: isAllSelected(notificationData.services),
              environments: getPayloadValue(notificationData.environments) as string[],
              allEnvironments: isAllSelected(notificationData.environments),
              enabledVerifications: notificationData.enabledVerifications,
              verificationsNotify: {
                activityTypes: getPayloadValue(notificationData.activityTypes) as VerificationsNotify['activityTypes'],
                allActivityTpe: isAllSelected(notificationData.activityTypes),
                verificationStatuses: getPayloadValue(
                  notificationData.verificationStatuses
                ) as VerificationsNotify['verificationStatuses'],
                allVerificationStatuses: isAllSelected(notificationData.verificationStatuses)
              },
              enabledRisk: notificationData.enabledRisk,
              notify: {
                threshold: notificationData.threshold
              }
            },
            notificationMethod: {
              notificationSettingType: notificationData.notificationSettingType,
              slackWebhook: notificationData.webhookUrl,
              slackChannelName: '',
              pagerDutyKey: notificationData?.key,
              emails: notificationData?.emailIds
            },
            identifier: notificationData.identifier,
            accountId: accountId,
            orgIdentifier: props.orgIdentifier,
            projectIdentifier: props.projectIdentifier
          }
          if (props.isEditMode) {
            updateAlertRule({ ...payload, uuid: props.ruleData?.uuid })
          } else {
            createAlertRule(payload)
          }
        }}
      >
        {formik => {
          return (
            <FormikForm>
              <Container className={css.formElements}>
                {!loadingServices ? (
                  <FormInput.MultiSelect
                    items={serviceOptions}
                    name={'services'}
                    label={'Service'}
                    className={css.service}
                  />
                ) : null}
                <FormInput.MultiSelect
                  items={environmentOptions}
                  name={'environments'}
                  label={getString('environment')}
                  className={css.service}
                />
                <Layout.Vertical spacing="medium" margin={{ top: 'xxlarge', left: 'xlarge' }}>
                  <FormInput.CheckBox
                    name="enabledVerifications"
                    label={getString('cv.admin.notifications.create.stepThree.notifyVerification')}
                    className={css.check}
                  />
                  {formik.values?.enabledVerifications ? (
                    <Layout.Horizontal spacing="medium">
                      <FormInput.MultiSelect
                        items={activityTypeOptions}
                        name="activityTypes"
                        label={getString('cv.admin.notifications.create.stepThree.activityType')}
                        className={css.activityType}
                      />
                      <FormInput.MultiSelect
                        items={VerificationStatusOptions}
                        name="verificationStatuses"
                        label={getString('cv.admin.notifications.create.stepThree.verificationStatus')}
                        className={css.activityType}
                      />
                    </Layout.Horizontal>
                  ) : null}

                  <FormInput.CheckBox
                    name="enabledRisk"
                    label={getString('cv.admin.notifications.create.stepThree.notifyRisk')}
                  />
                  {formik.values?.enabledRisk ? (
                    <CVRiskScoreSlider
                      selectedValue={formik.values.threshold}
                      onSelected={val => {
                        formik.setFieldValue('threshold', val)
                      }}
                    />
                  ) : null}
                </Layout.Vertical>
              </Container>
              <Layout.Horizontal spacing="medium" margin={{ top: 'xlarge' }}>
                <Button text={getString('back')} onClick={() => props.previousStep?.({ ...props.prevStepData })} />
                <Button text={getString('submit')} intent="primary" type="submit" loading={loadingCreate} />
              </Layout.Horizontal>
            </FormikForm>
          )
        }}
      </Formik>
    </Container>
  )
}
export default ConditionsForm
