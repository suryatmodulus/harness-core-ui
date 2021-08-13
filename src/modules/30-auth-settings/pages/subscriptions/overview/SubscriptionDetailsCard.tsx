import React from 'react'

import moment from 'moment'
import { useParams, useHistory } from 'react-router-dom'
import { Button, Card, Color, Heading, Icon, Layout, Text } from '@wings-software/uicore'
import type { StringsMap } from 'stringTypes'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type { AccountPathProps, Module } from '@common/interfaces/RouteInterfaces'
import { useContactSalesMktoModal } from '@common/modals/ContactSales/useContactSalesMktoModal'
import { useLicenseStore, handleUpdateLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { useExtendTrialLicense, StartTrialDTO, FeedbackFormDTO, useSaveFeedback } from 'services/cd-ng'
import { useToaster } from '@common/components'
import { ModuleName } from 'framework/types/ModuleName'
import type { ModuleLicenseDTO, CFModuleLicenseDTO, CIModuleLicenseDTO } from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import {
  useExtendTrialOrFeedbackModal,
  FORM_TYPE,
  FeedbackFormValues
} from '@common/modals/ExtendTrial/useExtendTrialOrFeedbackModal'
import { Editions, ModuleLicenseType } from '@common/constants/SubscriptionTypes'
import type { TrialInformation } from '../SubscriptionsPage'
import css from './SubscriptionDetailsCard.module.scss'
import pageCss from '../SubscriptionsPage.module.scss'

interface SubscriptionDetailsCardProps {
  accountName?: string
  licenseData?: ModuleLicenseDTO
  module: ModuleName
  trialInformation: TrialInformation
  refetchGetLicense?: () => void
}

const SubscriptionDetailsCard: React.FC<SubscriptionDetailsCardProps> = props => {
  const { accountName, module, licenseData, trialInformation, refetchGetLicense } = props
  const { days, expiryDate, isExpired, expiredDays } = trialInformation

  const history = useHistory()
  const { getString } = useStrings()
  const { showError, showSuccess } = useToaster()
  const { currentUserInfo } = useAppStore()
  const { licenseInformation, updateLicenseStore } = useLicenseStore()
  const { accountId } = useParams<AccountPathProps>()
  const openMarketoContactSales = useContactSalesMktoModal({})

  const { mutate: extendTrial, loading } = useExtendTrialLicense({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { mutate: saveFeedback, loading: sendingFeedback } = useSaveFeedback({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const handleFeedbackSubmit = async (values: FeedbackFormValues): Promise<void> => {
    try {
      await saveFeedback({
        accountId,
        moduleType: module as FeedbackFormDTO['moduleType'],
        email: currentUserInfo.email,
        score: Number(values.experience),
        suggestion: values.suggestion
      }).then(() => {
        if (isExpired) {
          refetchGetLicense?.()
        } else {
          closeExtendTrialOrFeedbackModal()
        }
      })
      showSuccess(getString('common.banners.trial.feedbackSuccess'))
    } catch (error) {
      showError(error.data?.message || error.message)
    }
  }

  const { openExtendTrialOrFeedbackModal, closeExtendTrialOrFeedbackModal } = useExtendTrialOrFeedbackModal({
    onSubmit: handleFeedbackSubmit,
    onCloseModal: () => {
      if (isExpired) {
        refetchGetLicense?.()
      }
    },
    module,
    expiryDateStr: moment(expiryDate).format('MMMM D YYYY'),
    formType: isExpired ? FORM_TYPE.EXTEND_TRIAL : FORM_TYPE.FEEDBACK,
    moduleDescription: getString(`${module.toLowerCase()}.continuous` as keyof StringsMap),
    loading: sendingFeedback
  })

  function getExpiryCountdownMessage(): React.ReactElement | undefined {
    if (licenseData?.licenseType !== ModuleLicenseType.PAID || days < 14) {
      return (
        <Layout.Horizontal spacing="small">
          <Icon className={css.expiryIcon} size={12} name={'warning-sign'} color="orange800" />
          <Text color={Color.ORANGE_800}>{getString('common.subscriptions.expiryCountdown', { days })}</Text>
        </Layout.Horizontal>
      )
    }
  }

  function getExpiredMessage(): React.ReactElement {
    return (
      <Layout.Horizontal spacing="small">
        <Icon className={css.expiryIcon} size={12} name={'warning-sign'} color="red700" />
        <Text color={Color.RED_700}>{getString('common.subscriptions.expired', { days: expiredDays })}</Text>
      </Layout.Horizontal>
    )
  }

  function insertLicenseCountElements(fields: React.ReactElement[]): void {
    const moduleType = licenseData?.moduleType

    switch (moduleType) {
      case ModuleName.CF:
        {
          const cfModuleLicenseDTO = licenseData as CFModuleLicenseDTO
          const featureFlagUsers = cfModuleLicenseDTO?.numberOfUsers
          const monthlyActiveUsers = cfModuleLicenseDTO?.numberOfClientMAUs

          fields.push(
            <React.Fragment key="licenseCount">
              <Text color={Color.GREY_600}>{getString('common.account.licenseCount')}</Text>
              <Layout.Vertical spacing="medium">
                <Text color={Color.BLACK} font={{ weight: 'semi-bold' }} margin={{ bottom: 5 }}>
                  {getString('common.subscriptions.featureFlags.users', { users: featureFlagUsers })}
                </Text>
                <Text color={Color.BLACK} font={{ weight: 'semi-bold' }}>
                  {getString('common.subscriptions.featureFlags.mau', { maus: monthlyActiveUsers })}
                </Text>
              </Layout.Vertical>
            </React.Fragment>
          )
        }
        break
      case ModuleName.CI:
        {
          const ciModuleLicenseDTO = licenseData as CIModuleLicenseDTO
          const committers = ciModuleLicenseDTO?.numberOfCommitters

          fields.push(
            <React.Fragment key="licenseCount">
              <Text color={Color.GREY_600}>{getString('common.account.licenseCount')}</Text>
              <Layout.Vertical spacing="medium">
                <Text color={Color.BLACK} font={{ weight: 'semi-bold' }} margin={{ bottom: 5 }}>
                  {getString('common.subscriptions.ci.developers', { developers: committers })}
                </Text>
              </Layout.Vertical>
            </React.Fragment>
          )
        }
        break
      default:
        break
    }
  }

  function insertPlanElements(fields: React.ReactElement[]): void {
    const expiryMessage = isExpired ? getExpiredMessage() : getExpiryCountdownMessage()
    const planMessage =
      licenseData?.licenseType === ModuleLicenseType.PAID
        ? getString('common.subscriptions.enterprisePaid')
        : getString('common.subscriptions.enterpriseTrial')

    fields.push(
      <React.Fragment key="plan">
        <Text color={Color.GREY_600}>{getString('common.subscriptions.overview.plan')}</Text>
        <Layout.Vertical>
          <Text color={Color.BLACK} font={{ weight: 'semi-bold' }}>
            {planMessage}
          </Text>
          {expiryMessage}
        </Layout.Vertical>
      </React.Fragment>
    )
  }

  function insertExpiryDate(fields: React.ReactElement[]): void {
    const expiryElement = (
      <React.Fragment key="expiry">
        <Text color={Color.GREY_600}>{getString('common.subscriptions.overview.expiry')}</Text>
        <Text color={Color.BLACK} font={{ weight: 'semi-bold' }}>
          {expiryDate}
        </Text>
      </React.Fragment>
    )

    fields.push(expiryElement)
  }

  function getSubscriptionDetailsFields(): React.ReactElement[] {
    const fields = [
      <React.Fragment key="account">
        <Text color={Color.GREY_600}>{getString('common.accountName')}</Text>
        <Text color={Color.BLACK} font={{ weight: 'semi-bold' }}>
          {accountName}
        </Text>
      </React.Fragment>
    ]

    const edition = licenseData?.edition

    switch (edition) {
      case Editions.ENTERPRISE:
        {
          insertPlanElements(fields)
          insertLicenseCountElements(fields)
          insertExpiryDate(fields)
        }
        break
      case Editions.TEAM:
      case Editions.FREE:
      default: {
        fields.push(
          <React.Fragment key="plan">
            <Text color={Color.GREY_600}>{getString('common.subscriptions.overview.plan')}</Text>
            <Layout.Vertical>
              <Text color={Color.BLACK} font={{ weight: 'semi-bold' }}>
                {getString('common.subscriptions.noActiveSubscription')}
              </Text>
            </Layout.Vertical>
          </React.Fragment>
        )
      }
    }
    return fields
  }

  function handleSubscribeClick(): void {
    history.push(
      routes.toModuleTrialHome({
        accountId,
        module: module.toLowerCase() as Module
      })
    )
  }

  const handleExtendTrial = async (): Promise<void> => {
    try {
      const data = await extendTrial({ moduleType: module as StartTrialDTO['moduleType'] })
      handleUpdateLicenseStore({ ...licenseInformation }, updateLicenseStore, module as any, data?.data)
      openExtendTrialOrFeedbackModal()
    } catch (error) {
      showError(error.data?.message)
    }
  }

  const subscribeButton = (
    <Button onClick={handleSubscribeClick} intent="primary">
      {getString('common.subscriptions.overview.subscribe')}
    </Button>
  )

  const contactSalesButton = (
    <Button intent="primary" onClick={openMarketoContactSales}>
      {getString('common.banners.trial.contactSales')}
    </Button>
  )

  const extendTrialButton = (
    <Button disabled={loading} onClick={handleExtendTrial}>
      {getString('common.banners.trial.expired.extendTrial')}
    </Button>
  )

  const buttons = (
    <React.Fragment>
      {!licenseData && subscribeButton}
      {licenseData?.licenseType !== ModuleLicenseType.PAID && contactSalesButton}
      {licenseData?.licenseType !== ModuleLicenseType.PAID && isExpired && expiredDays < 15 && extendTrialButton}
    </React.Fragment>
  )

  return (
    <Card className={pageCss.outterCard}>
      <Layout.Vertical spacing="xxlarge" flex={{ alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Heading color={Color.BLACK} font={{ size: 'medium' }}>
          {getString('common.subscriptions.overview.details')}
        </Heading>
        <div className={css.detailFields}>{getSubscriptionDetailsFields()}</div>
        <Layout.Horizontal spacing="xxlarge">{buttons}</Layout.Horizontal>
      </Layout.Vertical>
    </Card>
  )
}

export default SubscriptionDetailsCard
