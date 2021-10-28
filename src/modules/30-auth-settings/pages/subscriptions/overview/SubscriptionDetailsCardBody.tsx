import React, { ReactElement } from 'react'

import { capitalize } from 'lodash-es'
import { Color, FontVariation, Icon, Layout, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { ModuleName } from 'framework/types/ModuleName'
import type {
  CDModuleLicenseDTO,
  CEModuleLicenseDTO,
  CFModuleLicenseDTO,
  CIModuleLicenseDTO,
  ModuleLicenseDTO
} from 'services/cd-ng'
import { Editions, ModuleLicenseType } from '@common/constants/SubscriptionTypes'
import css from './SubscriptionDetailsCard.module.scss'

interface SubscriptionDetailsCardBodyProps {
  licenseData?: ModuleLicenseDTO
  edition: Editions
  isFree: boolean
  isExpired: boolean
  days: number
  expiryDate: string
  expiredDays: number
  accountName?: string
}
const SubscriptionDetailsCardBody = ({
  licenseData,
  edition,
  isFree,
  isExpired,
  days,
  expiryDate,
  expiredDays,
  accountName
}: SubscriptionDetailsCardBodyProps): ReactElement => {
  const { getString } = useStrings()

  function insertPlanElements(planFields: React.ReactElement[]): void {
    const expiryMessage = getExpiryMsg()
    const editionStr = capitalize(edition)
    const planMessage =
      licenseData?.licenseType === ModuleLicenseType.PAID || isFree
        ? getString('common.subscriptions.paid', { edition: editionStr })
        : getString('common.subscriptions.trial', { edition: editionStr })

    planFields.push(
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

  function getExpiredMessage(): React.ReactElement {
    return (
      <Layout.Horizontal spacing="small">
        <Icon className={css.expiryIcon} size={12} name={'warning-sign'} color="red700" />
        <Text color={Color.RED_700}>{getString('common.subscriptions.expired', { days: expiredDays })}</Text>
      </Layout.Horizontal>
    )
  }

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

  function getExpiryMsg(): React.ReactElement | undefined {
    if (isFree) {
      return undefined
    }

    return isExpired ? getExpiredMessage() : getExpiryCountdownMessage()
  }

  function insertExpiryDate(expiryFields: React.ReactElement[]): void {
    if (!isFree) {
      const expiryElement = (
        <React.Fragment key="expiry">
          <Text color={Color.GREY_600}>{getString('common.subscriptions.overview.expiry')}</Text>
          <Text color={Color.BLACK} font={{ variation: FontVariation.SMALL_SEMI }}>
            {expiryDate}
          </Text>
        </React.Fragment>
      )

      expiryFields.push(expiryElement)
    }
  }

  function insertLicenseCountElements(licenseCountFields: React.ReactElement[]): void {
    const moduleType = licenseData?.moduleType
    const licenseCount = <Text color={Color.GREY_600}>{getString('common.account.licenseCount')}</Text>

    switch (moduleType) {
      case ModuleName.CF:
        {
          const cfModuleLicenseDTO = licenseData as CFModuleLicenseDTO
          const featureFlagUsers = cfModuleLicenseDTO?.numberOfUsers
          const monthlyActiveUsers = cfModuleLicenseDTO?.numberOfClientMAUs

          licenseCountFields.push(
            <React.Fragment key="licenseCount">
              {licenseCount}
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
          const committers =
            ciModuleLicenseDTO?.numberOfCommitters === -1
              ? getString('common.unlimited')
              : ciModuleLicenseDTO?.numberOfCommitters

          licenseCountFields.push(
            <React.Fragment key="licenseCount">
              {licenseCount}
              <Layout.Vertical spacing="medium">
                <Text color={Color.BLACK} font={{ weight: 'semi-bold' }} margin={{ bottom: 5 }}>
                  {getString('common.subscriptions.ci.developers', { developers: committers })}
                </Text>
              </Layout.Vertical>
            </React.Fragment>
          )
        }
        break
      case ModuleName.CD:
        {
          const cdModuleLicenseDTO = licenseData as CDModuleLicenseDTO
          const workloads = cdModuleLicenseDTO?.workloads

          licenseCountFields.push(
            <React.Fragment key="licenseCount">
              {licenseCount}
              <Layout.Vertical spacing="medium">
                <Text color={Color.BLACK} font={{ weight: 'semi-bold' }} margin={{ bottom: 5 }}>
                  {getString('common.subscriptions.cd.services', { workloads: workloads })}
                </Text>
              </Layout.Vertical>
            </React.Fragment>
          )
        }
        break
      case ModuleName.CE:
        {
          const ceModuleLicenseDTO = licenseData as CEModuleLicenseDTO
          const spendLimit =
            ceModuleLicenseDTO?.spendLimit === -1 ? getString('common.unlimited') : ceModuleLicenseDTO?.spendLimit
          licenseCountFields.push(
            <React.Fragment key="licenseCount">
              {licenseCount}
              <Layout.Vertical spacing="medium">
                <Text color={Color.BLACK} font={{ weight: 'semi-bold' }} margin={{ bottom: 5 }}>
                  {getString('common.subscriptions.ccm.cloudSpend', { spendLimit: spendLimit })}
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

  const fields = [
    <React.Fragment key="account">
      <Text color={Color.GREY_600}>{getString('common.accountName')}</Text>
      <Text color={Color.BLACK} font={{ weight: 'semi-bold' }}>
        {accountName}
      </Text>
    </React.Fragment>
  ]
  if (edition === Editions.COMMUNITY) {
    const serviceType = getString('authSettings.onprem')
    fields.push(
      <React.Fragment key="service-type">
        <Text color={Color.GREY_600}>{getString('common.serviceType')}</Text>
        <Text color={Color.BLACK} font={{ weight: 'semi-bold' }}>
          {serviceType}
        </Text>
      </React.Fragment>
    )
  }

  switch (edition) {
    case Editions.TEAM:
    case Editions.FREE:
    case Editions.ENTERPRISE:
      {
        insertPlanElements(fields)
        insertLicenseCountElements(fields)
        insertExpiryDate(fields)
      }
      break
    case Editions.COMMUNITY:
      {
        insertPlanElements(fields)
        insertExpiryDate(fields)
      }
      break
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
  return <div className={css.detailFields}>{fields}</div>
}

export default SubscriptionDetailsCardBody
