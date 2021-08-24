import React from 'react'
import { capitalize } from 'lodash-es'
import { Container, Text, Color, Card, Layout, Icon } from '@wings-software/uicore'
import type { IconName } from '@wings-software/uicore'
import moment from 'moment'
import { useParams, Link } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { AccountPathProps, ModuleCardPathParams } from '@common/interfaces/RouteInterfaces'
import { PageError } from '@common/components/Page/PageError'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import type { StringsMap } from 'framework/strings/StringsContext'
import { useGetAccountLicenses } from 'services/cd-ng'
import type { ModuleLicenseDTO } from 'services/cd-ng'
import css from '../AccountOverview.module.scss'

interface ModuleCardProps {
  module: ModuleLicenseDTO
}

const MODULE_PROPS: {
  [key in ModuleLicenseDTO['moduleType'] as string]: {
    icon: string
    title: string
  }
} = {
  CD: {
    icon: 'cd-main',
    title: 'common.purpose.cd.delivery'
  },
  CE: {
    icon: 'ce-main',
    title: 'common.purpose.ce.efficiency'
  },
  CV: {
    icon: 'cv-main',
    title: 'common.purpose.cv.verification'
  },
  CF: {
    icon: 'cf-main',
    title: 'common.purpose.cf.features'
  },
  CI: {
    icon: 'ci-main',
    title: 'common.purpose.ci.integration'
  }
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module }) => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const getPlanDescription = (): string => {
    const days = Math.round(moment(module.expiryTime).diff(moment(module.createdAt), 'days', true)).toString()
    return capitalize(module.edition)
      .concat('(')
      .concat(days)
      .concat(' day ')
      .concat(capitalize(module.licenseType))
      .concat(')')
  }

  const moduleTypeStr =
    module.moduleType && MODULE_PROPS[module.moduleType]
      ? getString(MODULE_PROPS[module.moduleType].title as keyof StringsMap)
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
              <Text font={{ size: 'xsmall' }}>{getString('common.purpose.continuous')}</Text>
              <Text font={{ size: 'small', weight: 'semi-bold' }} padding={{ bottom: 'large' }} color={Color.BLACK}>
                {moduleTypeStr}
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
            moduleCard: module.moduleType as ModuleCardPathParams['moduleCard']
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
