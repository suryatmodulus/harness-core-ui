import React, { useEffect, useState } from 'react'
import {
  Color,
  HarnessIcons,
  OverlaySpinner,
  Container,
  Text,
  Icon,
  IconName,
  Card,
  Layout,
  Heading
} from '@wings-software/uicore'
import { Link, useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import type { Project } from 'services/cd-ng'
import { ModuleName, useStrings, String, StringsMap } from 'framework/exports'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import css from './PurposePage.module.scss'

interface PurposeType {
  title: string
  icon: IconName
  description: string
  module: Required<Project>['modules'][number]
}

const PurposeList: React.FC = () => {
  const { accountId } = useParams()
  const [selected, setSelected] = useState<Required<Project>['modules']>([])
  const { CDNG_ENABLED, CVNG_ENABLED, CING_ENABLED, CENG_ENABLED, CFNG_ENABLED } = useFeatureFlags()

  const { getString } = useStrings()

  const CDNG_OPTIONS: PurposeType = {
    title: getString('common.purpose.cd.delivery'),
    icon: 'cd-main',
    description: getString('common.purpose.cd.subtitle'),
    module: ModuleName.CD
  }
  const CVNG_OPTIONS: PurposeType = {
    title: getString('cv.admin.notifications.create.stepThree.verification'),
    icon: 'cv-main',
    description: getString('common.purpose.cv.subtitle'),
    module: ModuleName.CV
  }

  const CING_OPTIONS: PurposeType = {
    title: getString('common.purpose.ci.integration'),
    icon: 'ci-main',
    description: getString('common.purpose.ci.subtitle'),
    module: ModuleName.CI
  }

  const CENG_OPTIONS: PurposeType = {
    title: getString('common.purpose.ce.efficiency'),
    icon: 'ce-main',
    description: getString('common.purpose.ce.subtitle'),
    module: ModuleName.CE
  }

  const CFNG_OPTIONS: PurposeType = {
    title: getString('common.purpose.cf.features'),
    icon: 'cf-main',
    description: getString('common.purpose.cf.subtitle'),
    module: ModuleName.CF
  }

  const getLink = (module: Required<Project>['modules'][number]): string => {
    switch (module) {
      case ModuleName.CD:
        return routes.toCDHome({
          accountId
        })
      case ModuleName.CV:
        return routes.toCVHome({
          accountId
        })
      case ModuleName.CI:
        return routes.toCIHome({
          accountId
        })
      case ModuleName.CE:
        return routes.toCEHome({
          accountId
        })
      case ModuleName.CF:
        return routes.toCFHome({
          accountId
        })
      default:
        return routes.toProjects({
          accountId
        })
    }
  }

  const getModuleLink = (module: Required<Project>['modules'][number]): React.ReactElement => {
    const moduleName = module.toString().toLowerCase()
    const title = getString(`${moduleName}.continuous` as keyof StringsMap)
    return (
      <Layout.Vertical key={module} spacing="large" padding={{ bottom: 'xxxlarge' }}>
        <Layout.Horizontal spacing="small">
          <Icon name={`${moduleName}-main` as IconName} size={25} />
          <Text font={{ size: 'medium', weight: 'semi-bold' }}>{title}</Text>
        </Layout.Horizontal>
        <String
          style={{ lineHeight: 2, fontSize: 10 }}
          stringID={`common.purpose.${moduleName}.description` as keyof StringsMap}
          useRichText={true}
        />
        <Link
          style={{
            backgroundColor: 'var(--blue-600)',
            width: 100,
            borderRadius: 4,
            lineHeight: 2.5,
            textAlign: 'center',
            color: Color.WHITE
          }}
          to={getLink(module)}
        >
          {getString('continue')}
        </Link>
      </Layout.Vertical>
    )
  }

  const getOptions = (): PurposeType[] => {
    const options: PurposeType[] = []
    if (CDNG_ENABLED) options.push(CDNG_OPTIONS)
    if (CVNG_ENABLED) options.push(CVNG_OPTIONS)
    if (CING_ENABLED) options.push(CING_OPTIONS)
    if (CENG_ENABLED) options.push(CENG_OPTIONS)
    if (CFNG_ENABLED) options.push(CFNG_OPTIONS)
    return options
  }

  return (
    <Layout.Vertical spacing="large">
      <Layout.Horizontal padding={{ top: 'large' }}>
        <Container width={800}>
          <div style={{ borderRight: 'inset', marginLeft: -15 }}>
            {getOptions().map(option => (
              <Card key={option.title} className={css.card} onClick={() => setSelected([option.module])}>
                <Layout.Horizontal spacing="small">
                  <Icon name={option.icon} size={25} />
                  <div>
                    <Text font="xsmall">{getString('common.purpose.continuous')}</Text>
                    <Text font={{ size: 'medium' }} padding={{ bottom: 'large' }} color={Color.BLACK}>
                      {option.title}
                    </Text>
                  </div>
                </Layout.Horizontal>
                <Text font="small" padding={{ bottom: 'small' }} style={{ minHeight: 70 }}>
                  {option.description}
                </Text>
                <Text
                  width={100}
                  color={Color.WHITE}
                  font={{ size: 'xsmall', weight: 'semi-bold' }}
                  style={{
                    textAlign: 'center',
                    borderRadius: 4,
                    height: 'var(--spacing-large)',
                    backgroundColor: 'var(--purple-900)',
                    padding: 'var(--spacing-xsmall)'
                  }}
                  icon={selected.includes(option.module) ? ('tick' as IconName) : ('' as IconName)}
                  iconProps={{ size: 10, padding: 'xsmall', color: Color.WHITE }}
                >
                  {getString('common.purpose.startATrial')}
                </Text>
                <Text font="small" style={{ marginTop: 10 }}>
                  {getString('common.purpose.setup')}
                </Text>
              </Card>
            ))}
          </div>
        </Container>
        <Container width={500} padding={{ left: 'huge', top: 'medium' }}>
          {selected.length === 0 ? (
            <Text font={{ size: 'medium', weight: 'semi-bold' }}>{getString('common.purpose.selectAModule')}</Text>
          ) : (
            selected.map(module => getModuleLink(module))
          )}
        </Container>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export const PurposePage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const { getString } = useStrings()

  const HarnessLogo = HarnessIcons['harness-logo-black']

  const spinner = (
    <OverlaySpinner show>
      <></>
    </OverlaySpinner>
  )

  useEffect(() => {
    setLoading(true)
    // TODO: call signup api to get user info
    setLoading(false)
  }, [])

  return (
    <Container margin={'xxxlarge'} flex={{ alignItems: 'start' }}>
      {loading ? (
        spinner
      ) : (
        <Layout.Vertical padding={'xxlarge'}>
          <HarnessLogo height={30} style={{ alignSelf: 'start' }} />
          <Heading color={Color.BLACK} font={{ size: 'large', weight: 'bold' }} padding={{ top: 'xxlarge' }}>
            {getString('common.purpose.welcome', { userName: 'user name' })}
          </Heading>
          <PurposeList />
        </Layout.Vertical>
      )}
    </Container>
  )
}
