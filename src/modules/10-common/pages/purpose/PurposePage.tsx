import React, { useEffect, useState } from 'react'
import { Color, HarnessIcons, Container, Text, Icon, IconName, Card, Layout, Heading } from '@wings-software/uicore'
import { Link, useParams } from 'react-router-dom'
import cx from 'classnames'
import { String, useStrings } from 'framework/strings'
import { useGetAccountLicenses } from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import { PageError } from '@common/components/Page/PageError'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, PageNames, PurposeActions } from '@common/constants/TrackingConstants'
import type { StringsMap } from 'stringTypes'
import type { Module } from '@common/interfaces/RouteInterfaces'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import ModuleInfoCards, { ModuleInfoCard, getInfoCardsProps } from '../../components/ModuleInfoCards/ModuleInfoCards'
import css from './PurposePage.module.scss'

interface PurposeType {
  enabled: boolean
  title: string
  icon: IconName
  description: string
  module: Module
  startTrial?: boolean
}

const PurposeList: React.FC = () => {
  const { accountId } = useParams<{
    accountId: string
  }>()
  const [selected, setSelected] = useState<Module>()
  const [selectedInfoCard, setSelectedInfoCard] = useState<ModuleInfoCard>()

  const { CDNG_ENABLED, CVNG_ENABLED, CING_ENABLED, CENG_ENABLED, CFNG_ENABLED } = useFeatureFlags()

  useEffect(() => {
    if (selected) {
      const infoCardProps = getInfoCardsProps(accountId)[selected]

      // Automatically select the first info card if none are selected
      if (!selectedInfoCard && infoCardProps) {
        setSelectedInfoCard(infoCardProps[0])
      }
    }
  }, [selected, selectedInfoCard, accountId])

  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()

  const CDNG_OPTIONS: PurposeType = {
    enabled: CDNG_ENABLED,
    title: getString('common.purpose.cd.delivery'),
    icon: 'cd-main',
    description: getString('common.purpose.cd.subtitle'),
    module: 'cd'
  }
  const CVNG_OPTIONS: PurposeType = {
    enabled: CVNG_ENABLED,
    title: getString('common.purpose.cv.verification'),
    icon: 'cv-main',
    description: getString('common.purpose.cv.subtitle'),
    module: 'cv'
  }

  const CING_OPTIONS: PurposeType = {
    enabled: CING_ENABLED,
    title: getString('common.purpose.ci.integration'),
    icon: 'ci-main',
    description: getString('common.purpose.ci.subtitle'),
    module: 'ci'
  }

  const CENG_OPTIONS: PurposeType = {
    enabled: CENG_ENABLED,
    title: getString('common.purpose.ce.efficiency'),
    icon: 'ce-main',
    description: getString('common.purpose.ce.subtitle'),
    module: 'ce'
  }

  const CFNG_OPTIONS: PurposeType = {
    enabled: CFNG_ENABLED,
    title: getString('common.purpose.cf.features'),
    icon: 'cf-main',
    description: getString('common.purpose.cf.subtitle'),
    module: 'cf'
  }

  const getModuleProps = (module: Module, startTrial: boolean): PurposeType | undefined => {
    switch (module) {
      case 'cd':
        return { ...CDNG_OPTIONS, startTrial }
      case 'cv':
        return { ...CVNG_OPTIONS, startTrial }
      case 'ce':
        return { ...CENG_OPTIONS, startTrial }
      case 'cf':
        return { ...CFNG_OPTIONS, startTrial }
      case 'ci':
        return { ...CING_OPTIONS, startTrial }
    }
    return undefined
  }

  const getModuleLink = (module: Module): React.ReactElement => {
    if (!selectedInfoCard || selectedInfoCard?.isNgRoute) {
      return (
        <Link
          style={{
            backgroundColor: 'var(--blue-600)',
            width: 100,
            borderRadius: 4,
            lineHeight: 2.5,
            textAlign: 'center',
            color: Color.WHITE
          }}
          onClick={() => {
            trackEvent(PurposeActions.ModuleContinue, { category: Category.SIGNUP, module: module })
          }}
          to={routes.toModuleHome({ accountId, module, source: 'purpose' })}
        >
          {getString('continue')}
        </Link>
      )
    }

    return (
      <a
        style={{
          backgroundColor: 'var(--blue-600)',
          width: 100,
          borderRadius: 4,
          lineHeight: 2.5,
          textAlign: 'center',
          color: Color.WHITE
        }}
        href={selectedInfoCard.route?.()}
      >
        {getString('continue')}
      </a>
    )
  }

  const getModuleInfo = (module: Module): React.ReactElement => {
    const moduleName = module.toString().toLowerCase()
    const title = getString(`${moduleName}.continuous` as keyof StringsMap)
    const link = getModuleLink(module)

    const infoCards = (
      <ModuleInfoCards module={module} selectedInfoCard={selectedInfoCard} setSelectedInfoCard={setSelectedInfoCard} />
    )

    return (
      <Layout.Vertical key={module} spacing="large" padding={{ bottom: 'xxxlarge' }}>
        <Layout.Horizontal spacing="small">
          <Icon name={`${moduleName}-main` as IconName} size={25} />
          <Text font={{ size: 'medium', weight: 'semi-bold' }}>{title}</Text>
        </Layout.Horizontal>
        <String
          style={{ lineHeight: 2, fontSize: 'small' }}
          stringID={`common.purpose.${moduleName}.description` as keyof StringsMap}
          useRichText={true}
        />
        {infoCards}
        {link}
      </Layout.Vertical>
    )
  }

  const { error, data, refetch, loading } = useGetAccountLicenses({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const getOptions = (): PurposeType[] => {
    const options: PurposeType[] = []
    ;[CDNG_OPTIONS, CING_OPTIONS, CVNG_OPTIONS, CFNG_OPTIONS, CENG_OPTIONS].forEach(option => {
      if (option.enabled) {
        let startTrial = true
        const { module } = option
        const moduleLicense = data?.data?.moduleLicenses?.[module]
        if (moduleLicense) {
          const { licenseType } = moduleLicense
          startTrial = !licenseType || licenseType === 'TRIAL'
        }
        const moduleProps = getModuleProps(module, startTrial)
        if (moduleProps) {
          options.push(moduleProps)
        }
      }
    })

    return options
  }

  const handleModuleSelection = (module: Module): void => {
    setSelected(module)
    setSelectedInfoCard(undefined)
  }

  if (loading) {
    return <PageSpinner />
  }

  if (error) {
    return <PageError message={(error.data as Error)?.message || error.message} onClick={() => refetch()} />
  }

  return (
    <Layout.Vertical spacing="large">
      <Layout.Horizontal padding={{ top: 'large' }}>
        <Container width="40%">
          <div style={{ borderRight: 'inset', marginLeft: -15 }}>
            {getOptions().map(option => (
              <Card
                key={option.title}
                className={cx(css.card, selected === option.module ? css.selected : '')}
                onClick={() => handleModuleSelection(option.module)}
              >
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

                {option.startTrial ? (
                  <Text
                    width={100}
                    color={Color.WHITE}
                    font={{ size: 'xsmall', weight: 'semi-bold', align: 'center' }}
                    border={{ radius: 4 }}
                    height={25}
                    background={Color.PURPLE_500}
                    padding={'xsmall'}
                    icon={selected === option.module ? ('tick' as IconName) : ('' as IconName)}
                    iconProps={{ size: 10, padding: 'xsmall', color: Color.WHITE }}
                  >
                    {getString('common.purpose.startATrial')}
                  </Text>
                ) : null}

                <Text font="small" style={{ marginTop: 10 }}>
                  {getString('common.purpose.setup')}
                </Text>
              </Card>
            ))}
          </div>
        </Container>
        <Container width={700} padding={{ left: 'huge', top: 'medium' }}>
          {selected ? (
            getModuleInfo(selected)
          ) : (
            <Text font={{ size: 'medium', weight: 'semi-bold' }}>{getString('common.purpose.selectAModule')}</Text>
          )}
        </Container>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export const PurposePage: React.FC = () => {
  const { getString } = useStrings()

  const HarnessLogo = HarnessIcons['harness-logo-black']

  useTelemetry({ pageName: PageNames.Purpose, category: Category.SIGNUP })

  return (
    <Container margin={{ left: 'xxxlarge' }} flex={{ alignItems: 'start' }}>
      <Layout.Vertical padding={'xxlarge'}>
        <HarnessLogo height={30} style={{ alignSelf: 'start' }} />
        <Heading color={Color.BLACK} font={{ size: 'large', weight: 'bold' }} padding={{ top: 'xxlarge' }}>
          {getString('common.purpose.welcome')}
        </Heading>
        <PurposeList />
      </Layout.Vertical>
    </Container>
  )
}
