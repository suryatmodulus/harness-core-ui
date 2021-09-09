import React, { useState } from 'react'
import moment from 'moment'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { Text, Layout, Button, Color } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { ModuleName } from 'framework/types/ModuleName'
import type { StringsMap } from 'stringTypes'
import { useToaster } from '@common/components'
import { useContactSalesMktoModal } from '@common/modals/ContactSales/useContactSalesMktoModal'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useExtendTrialLicense, StartTrialDTO, useSaveFeedback, FeedbackFormDTO } from 'services/cd-ng'
import { useLicenseStore, handleUpdateLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import {
  useExtendTrialOrFeedbackModal,
  FORM_TYPE,
  FeedbackFormValues
} from '@common/modals/ExtendTrial/useExtendTrialOrFeedbackModal'
import { Page } from '../Page/Page'
import { PageSpinner } from '../Page/PageSpinner'
import css from './TrialLicenseBanner.module.scss'

interface TrialBannerProps {
  expiryTime?: number
  licenseType?: string
  module: ModuleName
  setHasBanner?: (value: boolean) => void
  refetch?: () => void
}

export const TrialLicenseBanner = (trialBannerProps: TrialBannerProps): React.ReactElement => {
  const { getString } = useStrings()
  const { currentUserInfo } = useAppStore()
  const { accountId } = useParams<AccountPathProps>()
  const { licenseInformation, updateLicenseStore } = useLicenseStore()
  const { showError, showSuccess } = useToaster()
  const [display, setDisplay] = useState(true)
  const { module, expiryTime, licenseType, setHasBanner, refetch } = trialBannerProps
  const days = Math.round(moment(expiryTime).diff(moment.now(), 'days', true))
  const isExpired = days < 0
  const expiredDays = Math.abs(days)
  const expiredClassName = isExpired ? css.expired : css.notExpired

  const moduleName = module.toString().toLowerCase()

  const moduleDescriptionMap: Record<string, keyof StringsMap> = {
    cd: 'cd.continuous',
    ce: 'ce.continuous',
    cf: 'cf.continuous',
    ci: 'ci.continuous',
    cv: 'cv.continuous'
  }
  const moduleDescription = getString(moduleDescriptionMap[moduleName])

  const descriptionModuleMap: Record<string, keyof StringsMap> = {
    cd: 'common.module.cd',
    ce: 'common.module.ce',
    cf: 'common.module.cf',
    ci: 'common.module.ci',
    cv: 'common.module.cv'
  }
  const descriptionModule = getString(descriptionModuleMap[moduleName])

  const { mutate: extendTrial, loading: extendingTrial } = useExtendTrialLicense({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { openMarketoContactSales, loading: loadingContactSales } = useContactSalesMktoModal({})

  const alertMsg = isExpired ? (
    <Text font={{ weight: 'semi-bold' }} icon="info" iconProps={{ size: 18, color: Color.RED_500 }}>
      {getString('common.banners.trial.expired.description', {
        expiredDays,
        moduleDescription
      })}
    </Text>
  ) : (
    <Text font={{ weight: 'semi-bold' }} icon="info" iconProps={{ size: 18, color: Color.ORANGE_500 }}>
      {getString('common.banners.trial.description', {
        module: descriptionModule,
        days,
        moduleDescription
      })}
    </Text>
  )
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
          refetch?.()
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
        refetch?.()
      }
    },
    module,
    expiryDateStr: moment(expiryTime).format('MMMM D YYYY'),
    formType: isExpired ? FORM_TYPE.EXTEND_TRIAL : FORM_TYPE.FEEDBACK,
    moduleDescription,
    loading: sendingFeedback
  })

  const handleExtendTrial = async (): Promise<void> => {
    try {
      const data = await extendTrial({ moduleType: module as StartTrialDTO['moduleType'] })
      handleUpdateLicenseStore({ ...licenseInformation }, updateLicenseStore, module as any, data?.data)
      openExtendTrialOrFeedbackModal()
    } catch (error) {
      showError(error.data?.message || error.message)
    }
  }

  if (licenseType !== 'TRIAL' || !display) {
    setHasBanner?.(false)
    return <></>
  }

  const loading = extendingTrial || loadingContactSales || sendingFeedback

  const getExtendOrFeedBackBtn = (): React.ReactElement => {
    if (!isExpired) {
      return (
        <Button
          onClick={openExtendTrialOrFeedbackModal}
          padding={'small'}
          intent={'none'}
          color={Color.PRIMARY_7}
          className={css.extendTrial}
        >
          {getString('common.banners.trial.provideFeedback')}
        </Button>
      )
    }
    if (expiredDays > 14) {
      return <></>
    }
    return (
      <Button
        onClick={handleExtendTrial}
        padding={'small'}
        intent={'none'}
        color={Color.PRIMARY_7}
        className={css.extendTrial}
      >
        {getString('common.banners.trial.expired.extendTrial')}
      </Button>
    )
  }

  if (loading) {
    return <PageSpinner />
  }

  return (
    <Page.Header
      className={cx(css.trialLicenseBanner, expiredClassName)}
      title={''}
      content={
        <Layout.Horizontal spacing="xxxlarge">
          <Layout.Horizontal spacing="small" padding={{ right: 'xxxlarge' }}>
            {alertMsg}
          </Layout.Horizontal>
          <Button
            className={css.contactSales}
            border={{ color: Color.PRIMARY_7 }}
            padding="xsmall"
            text={getString('common.banners.trial.contactSales')}
            onClick={openMarketoContactSales}
          />
          {getExtendOrFeedBackBtn()}
        </Layout.Horizontal>
      }
      toolbar={
        <Button
          aria-label="close banner"
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            setDisplay(false), setHasBanner?.(false)
          }}
        />
      }
    />
  )
}
