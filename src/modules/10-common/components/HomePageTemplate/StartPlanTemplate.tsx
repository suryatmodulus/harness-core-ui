import React from 'react'
import { Heading, Layout, Text, Container, Button, Color } from '@wings-software/uicore'
import { useParams, useHistory } from 'react-router-dom'
import { useToaster } from '@common/components'
import { useLicenseStore, handleUpdateLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import {
  useStartTrialLicense,
  ResponseModuleLicenseDTO,
  StartTrialDTORequestBody,
  useStartFreeLicense
} from 'services/cd-ng'
import type { Module } from '@common/interfaces/RouteInterfaces'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, PlanActions, TrialActions } from '@common/constants/TrackingConstants'
import routes from '@common/RouteDefinitions'
import useStartPlanModal from '@common/modals/StartPlan/StartPlanModal'
import { Editions } from '@common/constants/SubscriptionTypes'
import css from './StartPlanTemplate.module.scss'

interface StartPlanTemplateProps {
  title: string
  bgImageUrl: string
  isTrialInProgress?: boolean
  startPlanProps: Omit<StartPlanProps, 'startPlan' | 'module' | 'loading' | 'isFree'>
  module: Module
  edition?: Editions
}

interface StartPlanProps {
  description: string
  learnMore: {
    description: string
    url: string
  }
  startBtn: {
    description: string
    onClick?: () => void
  }
  shouldShowStartPlanModal?: boolean
  startPlan: () => Promise<ResponseModuleLicenseDTO>
  module: Module
  loading: boolean
  isFree: boolean
}

const StartPlanComponent: React.FC<StartPlanProps> = startPlanProps => {
  const { description, learnMore, startBtn, shouldShowStartPlanModal, startPlan, module, loading, isFree } =
    startPlanProps
  const history = useHistory()
  const { accountId } = useParams<{
    accountId: string
  }>()
  const { showError } = useToaster()
  const { showModal } = useStartPlanModal({ module, handleStartPlan })
  const { licenseInformation, updateLicenseStore } = useLicenseStore()

  async function handleStartPlan(): Promise<void> {
    try {
      const data = await startPlan()

      handleUpdateLicenseStore({ ...licenseInformation }, updateLicenseStore, module, data?.data)

      history.push({
        pathname: routes.toModuleHome({ accountId, module }),
        search: isFree ? '?modal=free' : '?trial=true'
      })
    } catch (error) {
      showError(error.data?.message)
    }
  }

  function handleStartButtonClick(): void {
    if (shouldShowStartPlanModal) {
      showModal()
    } else {
      handleStartPlan()
    }
  }

  return (
    <Layout.Vertical spacing="small">
      <Text padding={{ bottom: 'xxlarge' }} width={500}>
        {description}
      </Text>
      <a className={css.learnMore} href={learnMore.url} rel="noreferrer" target="_blank">
        {learnMore.description}
      </a>
      <Button
        width={300}
        height={45}
        intent="primary"
        text={startBtn.description}
        onClick={startBtn.onClick ? startBtn.onClick : handleStartButtonClick}
        disabled={loading}
      />
    </Layout.Vertical>
  )
}

const StartPlanTemplate: React.FC<StartPlanTemplateProps> = ({
  title,
  bgImageUrl,
  startPlanProps,
  module,
  edition = Editions.ENTERPRISE
}) => {
  const { accountId } = useParams<{
    accountId: string
  }>()
  const { trackEvent } = useTelemetry()

  const startTrialRequestBody: StartTrialDTORequestBody = {
    moduleType: module.toUpperCase() as any,
    edition: Editions.ENTERPRISE
  }

  const { mutate: startTrial, loading: startingTrial } = useStartTrialLicense({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { mutate: startFreePlan, loading: startingFree } = useStartFreeLicense({
    queryParams: {
      accountIdentifier: accountId,
      moduleType: 'CD'
    },
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    }
  })

  const isFree = edition === Editions.FREE

  function handleStartPlan(): Promise<ResponseModuleLicenseDTO> {
    if (isFree) {
      trackEvent(PlanActions.StartFreeClick, { category: Category.SIGNUP, module: module, edition })
      return startFreePlan()
    }
    trackEvent(TrialActions.StartTrialClick, {
      category: Category.SIGNUP,
      module: module,
      edition: edition
    })
    return startTrial(startTrialRequestBody)
  }

  return (
    <Container className={css.body} style={{ background: `transparent url(${bgImageUrl}) no-repeat` }}>
      <Layout.Vertical spacing="medium">
        <Heading font={{ weight: 'bold', size: 'large' }} color={Color.BLACK_100}>
          {title}
        </Heading>

        <StartPlanComponent
          {...startPlanProps}
          startPlan={handleStartPlan}
          module={module}
          loading={startingTrial || startingFree}
          isFree={isFree}
        />
      </Layout.Vertical>
    </Container>
  )
}

export default StartPlanTemplate
