import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Color, Container, Text, Icon, IconName, Layout, Heading } from '@wings-software/uicore'
import { useTelemetry } from '@common/hooks/useTelemetry'
import routes from '@common/RouteDefinitions'
import type { Module } from '@common/interfaces/RouteInterfaces'
import { String, useStrings } from 'framework/strings'
import { Experiences } from '@common/constants/Utils'
import type { StringsMap } from 'stringTypes'
import { useUpdateAccountDefaultExperienceNG } from 'services/cd-ng'
import { Category, PurposeActions } from '@common/constants/TrackingConstants'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import ModuleCard from './ModuleCard'
import ModuleInfoCards, { ModuleInfoCard, getInfoCardsProps } from '../../components/ModuleInfoCards/ModuleInfoCards'
import css from './WelcomePage.module.scss'

enum STEPS {
  SELECT_MODULE = 'SELECT',
  MODULE_INFO = 'MODULE'
}

interface ModuleProps {
  enabled: boolean
  titleIcon: IconName
  bodyIcon: IconName
  module: Module
}

interface ModuleInfoProps {
  setStep: (step: STEPS) => void
  moduleProps: ModuleProps
}

const ModuleInfo: React.FC<ModuleInfoProps> = ({ setStep, moduleProps }) => {
  const [selectedInfoCard, setSelectedInfoCard] = useState<ModuleInfoCard>()
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  const { GTM_CD_ENABLED } = useFeatureFlags()

  const { accountId } = useParams<{
    accountId: string
  }>()
  const { mutate: updateDefaultExperience } = useUpdateAccountDefaultExperienceNG({
    accountIdentifier: accountId
  })

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
      <ModuleInfoCards
        className={css.moduleInfoCards}
        module={module}
        selectedInfoCard={selectedInfoCard}
        setSelectedInfoCard={setSelectedInfoCard}
        fontColor={Color.WHITE}
      />
    )

    function getIconName(): string {
      if (module === 'cf') {
        return 'ff-solid'
      }
      if (module === 'ce') {
        return 'ccm-solid'
      }
      return `${module}-solid`
    }

    return (
      <Layout.Vertical
        key={module}
        spacing="large"
        padding={{ bottom: 'xxxlarge', left: 'xxxlarge', right: 'xxxlarge', top: 'small' }}
      >
        <Layout.Horizontal spacing="small">
          <Icon name={getIconName() as IconName} size={25} />
          <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.WHITE}>
            {title}
          </Text>
        </Layout.Horizontal>
        <String
          stringID={`common.purpose.${moduleName}.description` as keyof StringsMap}
          useRichText
          className={css.moduleInfoDescription}
        />
        {infoCards}
        {link}
      </Layout.Vertical>
    )
  }

  useEffect(() => {
    const infoCardProps = getInfoCardsProps(accountId, GTM_CD_ENABLED)[moduleProps.module]

    // Automatically select the first info card if none are selected
    if (!selectedInfoCard && infoCardProps) {
      setSelectedInfoCard(infoCardProps[0])
    }
  }, [moduleProps, selectedInfoCard, accountId, GTM_CD_ENABLED])

  return (
    <Layout.Horizontal className={css.moduleInfo}>
      <Container className={css.moduleInfoLeft}>
        <Layout.Vertical>
          <Heading color={Color.WHITE} font={{ size: 'large', weight: 'bold' }}>
            {getString('common.purpose.welcome')}
          </Heading>
          <Layout.Horizontal>
            <ModuleCard option={moduleProps} selected cornerSelected className={css.selectedModuleInfoCard} />
            <Text
              color={Color.PRIMARY_3}
              onClick={() => {
                setStep(STEPS.SELECT_MODULE)
              }}
              className={css.changeSelection}
            >
              {getString('common.purpose.changeSelection')}
            </Text>
          </Layout.Horizontal>
        </Layout.Vertical>
      </Container>
      <Container className={css.moduleInfoRight}>{moduleProps?.module && getModuleInfo(moduleProps?.module)}</Container>
    </Layout.Horizontal>
  )
}

export default ModuleInfo
