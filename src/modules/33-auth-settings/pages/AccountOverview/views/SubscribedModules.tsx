/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { capitalize } from 'lodash-es'
import { Container, Text, Color, Card, Layout, Icon, PageError, PageSpinner } from '@wings-software/uicore'
import type { IconName } from '@wings-software/uicore'
import moment from 'moment'
import { useParams, Link } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { AccountPathProps, SubscriptionQueryParams } from '@common/interfaces/RouteInterfaces'
import type { StringsMap } from 'framework/strings/StringsContext'
import { useGetAccountLicenses } from 'services/cd-ng'
import type { ModuleLicenseDTO } from 'services/cd-ng'
import { Editions } from '@common/constants/SubscriptionTypes'
import css from '../AccountOverview.module.scss'

interface ModuleCardProps {
  module: ModuleLicenseDTO
}

const MODULE_PROPS: {
  [key in ModuleLicenseDTO['moduleType'] as string]: {
    icon: string
    title1: string
    title2: string
  }
} = {
  CD: {
    icon: 'cd-main',
    title1: 'common.purpose.continuous',
    title2: 'common.purpose.cd.delivery'
  },
  CE: {
    icon: 'ce-main',
    title1: 'common.purpose.ce.cloudCost',
    title2: 'common.purpose.ce.management'
  },
  CV: {
    icon: 'cv-main',
    title1: 'common.purpose.change',
    title2: 'common.purpose.cv.intelligence'
  },
  CF: {
    icon: 'cf-main',
    title1: 'common.purpose.cf.feature',
    title2: 'common.purpose.cf.flags'
  },
  CI: {
    icon: 'ci-main',
    title1: 'common.purpose.continuous',
    title2: 'common.purpose.ci.integration'
  }
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module }) => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const getPlanDescription = (): string => {
    const days = Math.round(moment(module.expiryTime).diff(moment(module.createdAt), 'days', true)).toString()
    const edition = module.edition || ''
    if (edition === Editions.FREE || edition === Editions.COMMUNITY) {
      return capitalize(edition)
    }

    return capitalize(edition)
      .concat('(')
      .concat(days)
      .concat(' day ')
      .concat(capitalize(module.licenseType))
      .concat(')')
  }
  const title1 =
    module.moduleType && MODULE_PROPS[module.moduleType]
      ? getString(MODULE_PROPS[module.moduleType].title1 as keyof StringsMap).toUpperCase()
      : ''

  const title2 =
    module.moduleType && MODULE_PROPS[module.moduleType]
      ? getString(MODULE_PROPS[module.moduleType].title2 as keyof StringsMap)
      : ''

  return (
    <Card className={css.subscribedModules}>
      <Container padding={'large'}>
        <Layout.Vertical>
          <Layout.Horizontal>
            {module.moduleType && MODULE_PROPS[module.moduleType] && (
              <Icon name={MODULE_PROPS[module.moduleType].icon as IconName} size={25} margin={{ right: 'small' }} />
            )}
            <Layout.Vertical>
              <Text font={{ size: 'xsmall' }}>{title1}</Text>
              <Text font={{ size: 'small', weight: 'semi-bold' }} padding={{ bottom: 'large' }} color={Color.BLACK}>
                {title2}
              </Text>
            </Layout.Vertical>
          </Layout.Horizontal>
          <Layout.Horizontal padding="xsmall" margin={{ bottom: 'large' }} border={{ color: Color.GREY_200 }}>
            <Text font={{ size: 'xsmall' }} margin={{ right: 'xsmall' }}>{`${getString(
              'common.subscriptions.overview.plan'
            )}:`}</Text>
            <Text font={{ size: 'xsmall', weight: 'bold' }} color={Color.BLACK}>
              {getPlanDescription()}
            </Text>
          </Layout.Horizontal>
        </Layout.Vertical>
      </Container>
      <Container
        border={{ top: true, color: Color.GREY_250 }}
        padding={{ top: 'large', bottom: 'large', left: 'large' }}
      >
        <Link
          to={routes.toSubscriptions({
            accountId,
            moduleCard: module.moduleType as SubscriptionQueryParams['moduleCard']
          })}
          className={css.manageBtn}
        >
          {getString('common.manage')}
        </Link>
      </Container>
    </Card>
  )
}

const SubscribedModules: React.FC = () => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()

  const {
    data: accountLicenses,
    loading,
    error,
    refetch
  } = useGetAccountLicenses({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  if (loading) {
    return <PageSpinner />
  }

  if (error) {
    return (
      <Container height={300}>
        <PageError message={(error.data as Error)?.message || error.message} onClick={() => refetch()} />
      </Container>
    )
  }

  const modules: {
    [key: string]: ModuleLicenseDTO[]
  } = accountLicenses?.data?.allModuleLicenses || {}

  const subscribedModules =
    Object.values(modules).length > 0 ? (
      Object.values(modules).map(moduleLicenses => {
        if (moduleLicenses.length > 0) {
          const latestModuleLicense = moduleLicenses[moduleLicenses.length - 1]
          return (
            <div key={latestModuleLicense.moduleType}>
              <ModuleCard module={latestModuleLicense} />
            </div>
          )
        }
      })
    ) : (
      <Layout.Horizontal spacing="xsmall">
        <Link to={routes.toSubscriptions({ accountId })}>{getString('common.account.visitSubscriptions.link')}</Link>
        <Text>{getString('common.account.visitSubscriptions.description')}</Text>
      </Layout.Horizontal>
    )

  return (
    <Container margin="xlarge" padding="xlarge" className={css.container} background="white">
      <Text color={Color.BLACK} font={{ weight: 'semi-bold', size: 'medium' }} margin={{ bottom: 'xlarge' }}>
        {getString('common.account.subscribedModules')}
      </Text>
      <Layout.Horizontal spacing="large">{subscribedModules}</Layout.Horizontal>
    </Container>
  )
}

export default SubscribedModules
