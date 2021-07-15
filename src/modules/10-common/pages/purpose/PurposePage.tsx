import React, { useEffect, useState } from 'react'
import { Color, HarnessIcons, Container, Text, Icon, IconName, Card, Layout, Heading } from '@wings-software/uicore'
import { Link, useParams } from 'react-router-dom'
import cx from 'classnames'
import { String, useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, PageNames, PurposeActions } from '@common/constants/TrackingConstants'
import type { StringsMap } from 'stringTypes'
import type { Module } from '@common/interfaces/RouteInterfaces'
import { useUpdateAccountDefaultExperienceNG } from 'services/cd-ng'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { Experiences } from '@common/constants/Utils'
import ModuleInfoCards, { ModuleInfoCard, getInfoCardsProps } from '../../components/ModuleInfoCards/ModuleInfoCards'
import css from './PurposePage.module.scss'

interface PurposeType {
  enabled: boolean
  title: string
  icon: IconName
  description: string
  module: Module
}

const PurposeList: React.FC = () => {
  const { accountId } = useParams<{
    accountId: string
  }>()
  const [selected, setSelected] = useState<Module>()
  const [selectedInfoCard, setSelectedInfoCard] = useState<ModuleInfoCard>()
  const { mutate: updateDefaultExperience } = useUpdateAccountDefaultExperienceNG({
    accountIdentifier: accountId
  })

  const { CVNG_ENABLED, CING_ENABLED, CFNG_ENABLED } = useFeatureFlags()

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
    enabled: true, // Continous delivery is enabled in CG
    title: getString('common.purpose.cd.delivery'),
    icon: 'cd-main',
    description: getString('common.purpose.cd.subtitle'),
    module: 'cd'
  }
  const CVNG_OPTIONS: PurposeType = {
    enabled: !!CVNG_ENABLED,
    title: getString('common.purpose.cv.verification'),
    icon: 'cv-main',
    description: getString('common.purpose.cv.subtitle'),
    module: 'cv'
  }

  const CING_OPTIONS: PurposeType = {
    enabled: !!CING_ENABLED,
    title: getString('common.purpose.ci.integration'),
    icon: 'ci-main',
    description: getString('common.purpose.ci.subtitle'),
    module: 'ci'
  }

  const CENG_OPTIONS: PurposeType = {
    enabled: true, // Continous efficiency is enabled in CG
    title: getString('common.purpose.ce.management'),
    icon: 'ce-main',
    description: getString('common.purpose.ce.subtitle'),
    module: 'ce'
  }

  const CFNG_OPTIONS: PurposeType = {
    enabled: !!CFNG_ENABLED,
    title: getString('common.purpose.cf.flags'),
    icon: 'cf-main',
    description: getString('common.purpose.cf.subtitle'),
    module: 'cf'
  }

  const getModuleProps = (module: Module): PurposeType | undefined => {
    switch (module) {
      case 'cd':
        return { ...CDNG_OPTIONS }
      case 'cv':
        return { ...CVNG_OPTIONS }
      case 'ce':
        return { ...CENG_OPTIONS }
      case 'cf':
        return { ...CFNG_OPTIONS }
      case 'ci':
        return { ...CING_OPTIONS }
    }
  }

  const getModuleLink = (module: Module): React.ReactElement => {
    async function handleUpdateDefaultExperience(): Promise<void> {
      await updateDefaultExperience({
        defaultExperience: !selectedInfoCard || selectedInfoCard?.isNgRoute ? Experiences.NG : Experiences.CG
      })
    }

    if (!selectedInfoCard || selectedInfoCard?.isNgRoute) {
      return (
        <Link
          className={css.continueButton}
          onClick={() => {
            handleUpdateDefaultExperience()
            trackEvent(PurposeActions.ModuleContinue, { category: Category.SIGNUP, module: module })
          }}
          to={routes.toModuleHome({ accountId, module, source: 'purpose' })}
        >
          {getString('continue')}
        </Link>
      )
    }

    return (
      <div
        className={css.continueButton}
        onClick={async () => {
          await updateDefaultExperience({
            defaultExperience: !selectedInfoCard || selectedInfoCard?.isNgRoute ? Experiences.NG : Experiences.CG
          })

          const route = selectedInfoCard.route?.()

          if (route) {
            window.location.href = route
          }
        }}
      >
        {getString('continue')}
      </div>
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

  const getOptions = (): PurposeType[] => {
    const options: PurposeType[] = []
    ;[CDNG_OPTIONS, CING_OPTIONS, CVNG_OPTIONS, CFNG_OPTIONS, CENG_OPTIONS].forEach(option => {
      if (option.enabled) {
        const { module } = option
        const moduleProps = getModuleProps(module)
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

  return (
    <div className={css.purposeListGrid}>
      <Container>
        <div style={{ borderRight: 'inset', marginLeft: -15 }}>
          {getOptions().map(option => {
            let cardTitle
            switch (option.module) {
              case 'cf':
                cardTitle = getString('common.purpose.cf.feature').toUpperCase()
                break
              case 'ce':
                cardTitle = getString('common.purpose.ce.cloudCost').toUpperCase()
                break
              default:
                cardTitle = getString('common.purpose.continuous')
                break
            }

            return (
              <Card
                key={option.title}
                className={cx(css.card, selected === option.module ? css.selected : '')}
                onClick={() => handleModuleSelection(option.module)}
              >
                <Layout.Horizontal spacing="small">
                  <Icon name={option.icon} size={25} className={css.icon} />
                  <div>
                    <Text font="xsmall" margin={{ bottom: '0' }}>
                      {cardTitle}
                    </Text>
                    <Text font={{ size: 'medium' }} padding={{ bottom: 'large' }} color={Color.BLACK}>
                      {option.title}
                    </Text>
                  </div>
                </Layout.Horizontal>
                <Text font="small" padding={{ bottom: 'small' }} style={{ minHeight: 70 }}>
                  {option.description}
                </Text>

                <Text font="small" style={{ marginTop: 10 }}>
                  {getString('common.purpose.setup')}
                </Text>
              </Card>
            )
          })}
        </div>
      </Container>
      <Container padding={{ left: 'huge', top: 'medium' }}>
        {selected ? (
          getModuleInfo(selected)
        ) : (
          <Text font={{ size: 'medium', weight: 'semi-bold' }}>{getString('common.purpose.selectAModule')}</Text>
        )}
      </Container>
    </div>
  )
}

export const PurposePage: React.FC = () => {
  const { getString } = useStrings()

  const HarnessLogo = HarnessIcons['harness-logo-black']

  useTelemetry({ pageName: PageNames.Purpose, category: Category.SIGNUP })

  return (
    <Container
      className={css.purposePageContainer}
      padding={{ left: 'xxxlarge', top: 'xxxlarge' }}
      flex={{ alignItems: 'start' }}
    >
      <Layout.Vertical padding={{ left: 'xxlarge', top: 'xxlarge' }} spacing="large" width="100%">
        <HarnessLogo height={30} style={{ alignSelf: 'start' }} />
        <Heading color={Color.BLACK} font={{ size: 'large', weight: 'bold' }} padding={{ top: 'xxlarge' }}>
          {getString('common.purpose.welcome')}
        </Heading>
        <PurposeList />
      </Layout.Vertical>
    </Container>
  )
}
