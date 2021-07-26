import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router'
import * as Yup from 'yup'
import {
  Button,
  Container,
  Formik,
  FormikForm,
  FormInput,
  Heading,
  Layout,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  StepProps,
  Icon,
  Text
} from '@wings-software/uicore'
import { pick } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { CrossAccountAccess, useCreateConnector, useUpdateConnector, Failure } from 'services/cd-ng'
import { useAwsaccountconnectiondetail } from 'services/ce/index'
import LabelWithTooltip from '@connectors/common/LabelWithTooltip/LabelWithTooltip'
import { DialogExtensionContext } from '@connectors/common/ConnectorExtention/DialogExtention'
import type { FeaturesString } from './CrossAccountRoleStep1'
import type { CEAwsConnectorDTO } from './OverviewStep'
import CrossAccountRoleExtension from './CrossAccountRoleExtension'
import css from '../CreateCeAwsConnector.module.scss'

const CrossAccountRoleStep2: React.FC<StepProps<CEAwsConnectorDTO>> = props => {
  const { getString } = useStrings()

  const { accountId } = useParams<{
    accountId: string
  }>()
  const { prevStepData, nextStep, previousStep } = props
  const { triggerExtension, closeExtension } = useContext(DialogExtensionContext)
  const [externalId, setExternalId] = useState<string>('')
  const { mutate: createConnector } = useCreateConnector({
    queryParams: { accountIdentifier: accountId }
  })
  const { mutate: updateConnector } = useUpdateConnector({
    queryParams: { accountIdentifier: accountId }
  })
  const { data: awsUrlTemplateData, loading: awsUrlTemplateLoading } = useAwsaccountconnectiondetail({
    queryParams: { accountIdentifier: accountId }
  })
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false)

  const randomString = (): string => {
    return Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8)
  }

  useEffect(() => {
    if (awsUrlTemplateData?.status == 'SUCCESS') {
      triggerExtension(
        <CrossAccountRoleExtension previewTemplateLink={awsUrlTemplateData?.data?.cloudFormationTemplateLink} />
      )
    }
  }, [awsUrlTemplateLoading])

  useEffect(() => {
    if (awsUrlTemplateData?.status == 'SUCCESS' && !prevStepData?.isEditMode)
      setExternalId(awsUrlTemplateData?.data?.externalId || '')
  }, [awsUrlTemplateLoading])

  const featuresEnabled: FeaturesString[] = prevStepData?.spec?.featuresEnabled || []
  const curStatus = featuresEnabled.includes('BILLING')
  const visibiltyStatus = featuresEnabled.includes('VISIBILITY')
  const optimizationStatus = featuresEnabled.includes('OPTIMIZATION')

  const getRoleName = (roleArn: string) => {
    if (roleArn == undefined) return
    return roleArn.split('/')[1]
  }

  const makeTemplateUrl = () => {
    const baseurl = awsUrlTemplateData?.data?.stackLaunchTemplateLink
    const bucketName = prevStepData?.spec?.curAttributes?.s3BucketName || ''
    const rand = randomString()
    const roleName = prevStepData?.isEditMode
      ? getRoleName(prevStepData?.spec.crossAccountAccess.crossAccountRoleArn)
      : `HarnessCERole-${rand}`
    const url = `${baseurl}&param_ExternalId=${externalId}&param_BucketName=${bucketName}&param_BillingEnabled=${curStatus}&param_EventsEnabled=${visibiltyStatus}&param_OptimizationEnabled=${optimizationStatus}&param_RoleName=${roleName}`
    window.open(url)
  }

  const handleSubmit = async (formData: CrossAccountAccess) => {
    setIsSubmitLoading(true)
    const newspec = { ...prevStepData?.spec, crossAccountAccess: formData }
    if (prevStepData) {
      prevStepData.spec = newspec
    }

    try {
      if (prevStepData) {
        const connectorInfo: CEAwsConnectorDTO = {
          ...pick(prevStepData, ['name', 'identifier', 'description', 'tags', 'spec', 'type'])
        }
        if (prevStepData.isEditMode) {
          const response = await updateConnector({ connector: connectorInfo })
          if (response.status != 'SUCCESS') {
            throw response as Failure
          }
        } else {
          const response = await createConnector({ connector: connectorInfo })
          if (response.status != 'SUCCESS') {
            throw response as Failure
          }
        }
        closeExtension()
        nextStep?.(prevStepData)
      }
    } catch (e) {
      modalErrorHandler?.showDanger(e?.data?.message)
    }
    setIsSubmitLoading(false)
  }

  const handleprev = () => {
    closeExtension()
    previousStep?.({ ...(prevStepData as CEAwsConnectorDTO) })
  }

  return (
    <Layout.Vertical className={css.stepContainer}>
      <Heading level={2} className={css.header}>
        {getString('connectors.ceAws.crossAccountRoleStep2.heading')}
        <span>{getString('connectors.ceAws.crossAccountRoleStep2.createRole')}</span>
      </Heading>
      <div style={{ marginBottom: 25 }} className={css.infobox}>
        {getString('connectors.ceAws.crossAccountRoleStep2.subHeading')}
      </div>
      <Container style={{ paddingBottom: 40 }}>
        <Layout.Vertical style={{ width: '65%' }}>
          <Button
            className={css.launchTemplateBut}
            text={getString('connectors.ceAws.crossAccountRoleStep2.launchTemplate')}
            icon="main-share"
            iconProps={{ size: 12, margin: { right: 'xsmall' } }}
            disabled={awsUrlTemplateLoading}
            onClick={() => {
              makeTemplateUrl()
            }}
          />
          <Text font="small" style={{ textAlign: 'center' }}>
            {getString('connectors.ceAws.crossAccountRoleStep2.followInstructions')}
          </Text>
        </Layout.Vertical>
      </Container>
      <div style={{ flex: 1 }}>
        <Formik<CrossAccountAccess>
          formName="crossAccountRoleStep2Form"
          initialValues={{
            crossAccountRoleArn: prevStepData?.spec.crossAccountAccess.crossAccountRoleArn || '',
            externalId: prevStepData?.spec.crossAccountAccess.externalId || externalId || ''
          }}
          validationSchema={Yup.object().shape({
            crossAccountRoleArn: Yup.string()
              .matches(
                /arn:aws:iam::[0-9]*:role\/[^$%!&*?><\s]*/,
                getString('connectors.ceAws.crossAccountRoleStep2.validation.roleArnPattern')
              )
              .required(getString('connectors.ceAws.crossAccountRoleStep2.validation.roleArnRequired'))
          })}
          onSubmit={formData => {
            handleSubmit(formData)
          }}
          enableReinitialize={true}
        >
          {() => (
            <FormikForm>
              <ModalErrorHandler bind={setModalErrorHandler} />
              <Container className={css.main}>
                <FormInput.Text
                  name="crossAccountRoleArn"
                  label={
                    <LabelWithTooltip
                      label={getString('connectors.ceAws.crossAccountRoleStep2.roleArn')}
                      extentionComponent={
                        <CrossAccountRoleExtension
                          previewTemplateLink={awsUrlTemplateData?.data?.cloudFormationTemplateLink}
                        />
                      }
                    />
                  }
                  className={css.dataFields}
                />

                <FormInput.Text
                  name="externalId"
                  label={
                    <LabelWithTooltip
                      label={getString('connectors.ceAws.crossAccountRoleStep2.extId')}
                      extentionComponent={
                        <CrossAccountRoleExtension
                          previewTemplateLink={awsUrlTemplateData?.data?.cloudFormationTemplateLink}
                        />
                      }
                    />
                  }
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setExternalId(e.target.value)
                  }}
                  disabled={awsUrlTemplateLoading}
                  className={css.dataFields}
                />
              </Container>
              <a>{getString('connectors.ceAws.crossAccountRoleStep2.dontHaveAccess')}</a>
              <Layout.Horizontal className={css.buttonPanel} spacing="small">
                <Button
                  text={getString('previous')}
                  icon="chevron-left"
                  onClick={handleprev}
                  disabled={isSubmitLoading}
                ></Button>
                <Button
                  type="submit"
                  intent="primary"
                  text={getString('saveAndContinue')}
                  rightIcon="chevron-right"
                  disabled={isSubmitLoading}
                />
                {isSubmitLoading && <Icon name="spinner" size={24} color="blue500" />}
              </Layout.Horizontal>
            </FormikForm>
          )}
        </Formik>
      </div>
    </Layout.Vertical>
  )
}

export default CrossAccountRoleStep2
