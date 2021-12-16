import React, { useState } from 'react'
import { capitalize } from 'lodash-es'
import cx from 'classnames'
import { Layout, Container, Text, Card, Color, FontVariation, Icon } from '@wings-software/uicore'
import type { IconName } from '@wings-software/uicore'
import { Editions, SERVICES_CARDS } from '@common/constants/SubscriptionTypes'
import { useStrings } from 'framework/strings'
import type { ModuleName } from 'framework/types/ModuleName'
import TogglerBar, { UsageProps } from './TogglerBar/TogglerBar'

import css from './SubscriptionCalculatorModal.module.scss'

interface ServiceCardsProps {
  currentPlanData: {
    currentPlan: Editions
    services: number
  }
  actualUsageData: {
    actualUsage: number
  }
  overUsageData: {
    overUsage: number
  }
  recommendationData: {
    recommend: number
  }
  setToggleValue: (value: number) => void
  selectedCard: SERVICES_CARDS
  setSelectedCard: (card: SERVICES_CARDS) => void
}

interface CurrentPlanProps {
  currentPlan: Editions
  services: number
  isSelected: boolean
  onClick: (card: SERVICES_CARDS) => void
}

interface ActualUsageCardProps {
  usage: number
  isSelected: boolean
  onClick: (card: SERVICES_CARDS) => void
}

interface OverUsageCardProps {
  overUsage: number
  isSelected: boolean
  onClick: (card: SERVICES_CARDS) => void
}

interface RecommendationCardProps {
  isSelected: boolean
  onClick: (card: SERVICES_CARDS) => void
  recommend: number
}

interface ServiceCardProps {
  title: string
  count: number
  unitDesc: string
  tagClassName?: string
  isSelected: boolean
  onClick: () => void
  selectedClassName: string
}

interface WarningCardProps {
  title: string
  count: number
  unitDesc: string
  bodyIcon: IconName
  className?: string
  iconColor: Color
  isSelected: boolean
  onClick: () => void
  selectedClassName: string
}

interface BasicCardProps {
  title: React.ReactElement
  body: React.ReactElement
  onClick: () => void
  isSelected: boolean
  className?: string
  selectedClassName?: string
}

interface ServiceTogglerBarProps {
  toggleValue: number
  setToggleValue: (value: number) => void
  usages: UsageProps
  setSelectedCard: (card: SERVICES_CARDS) => void
}

const BasicCard = ({
  title,
  body,
  className,
  selectedClassName,
  onClick,
  isSelected
}: BasicCardProps): React.ReactElement => {
  const combinedClassName = isSelected ? cx(className, selectedClassName) : className
  return (
    <Card className={combinedClassName} onClick={onClick}>
      <Layout.Vertical padding={{ right: 'huge' }}>
        {title}
        {body}
      </Layout.Vertical>
    </Card>
  )
}

const ServiceCard = ({
  title,
  count,
  unitDesc,
  tagClassName,
  isSelected,
  onClick,
  selectedClassName
}: ServiceCardProps): React.ReactElement => {
  const titleComponent = (
    <Text padding={{ bottom: 'medium' }} font={{ variation: FontVariation.SMALL }}>
      {title}
    </Text>
  )
  const body = (
    <Layout.Horizontal flex={{ alignItems: 'baseline' }}>
      <span style={{ borderRadius: 100, minHeight: 15, minWidth: 15 }} className={tagClassName} />
      <Layout.Horizontal spacing="xsmall" flex={{ alignItems: 'baseline' }} padding={{ left: 'small' }}>
        <Text font={{ variation: FontVariation.H2 }}>{count}</Text>
        <Text font={{ variation: FontVariation.SMALL }}>{unitDesc}</Text>
      </Layout.Horizontal>
    </Layout.Horizontal>
  )
  return (
    <BasicCard
      title={titleComponent}
      body={body}
      isSelected={isSelected}
      onClick={onClick}
      selectedClassName={selectedClassName}
    />
  )
}

const WarningCard = ({
  title,
  count,
  unitDesc,
  bodyIcon,
  iconColor,
  className,
  isSelected,
  onClick,
  selectedClassName
}: WarningCardProps): React.ReactElement => {
  const titleComponent = (
    <Text
      padding={{ bottom: 'medium' }}
      font={{ variation: FontVariation.SMALL }}
      rightIcon="info"
      rightIconProps={{ color: Color.PRIMARY_6, size: 10 }}
    >
      {title}
    </Text>
  )
  const body = (
    <Layout.Horizontal flex={{ alignItems: 'baseline' }}>
      <Icon name={bodyIcon} size={28} color={iconColor} />
      <Layout.Horizontal spacing="xsmall" flex={{ alignItems: 'center' }} padding={{ left: 'small' }}>
        <Text font={{ variation: FontVariation.H2 }}>{count}</Text>
        <Text font={{ variation: FontVariation.SMALL }} style={{ maxWidth: 100 }}>
          {unitDesc}
        </Text>
      </Layout.Horizontal>
    </Layout.Horizontal>
  )
  return (
    <BasicCard
      title={titleComponent}
      body={body}
      className={className}
      isSelected={isSelected}
      onClick={onClick}
      selectedClassName={selectedClassName}
    />
  )
}

const CurrentPlanCard = ({ currentPlan, services, isSelected, onClick }: CurrentPlanProps): React.ReactElement => {
  const { getString } = useStrings()
  const title = getString('common.plans.currentPlan').concat(': (').concat(capitalize(currentPlan)).concat(')')
  const unitDesc = getString('services')

  return (
    <ServiceCard
      title={title}
      unitDesc={unitDesc}
      count={services}
      tagClassName={css.black}
      isSelected={isSelected}
      onClick={() => {
        onClick(SERVICES_CARDS.CURRENT_USAGE_CARD)
      }}
      selectedClassName={css.grey300}
    />
  )
}

const ActualUsageCard = ({ usage, isSelected, onClick }: ActualUsageCardProps): React.ReactElement => {
  const { getString } = useStrings()
  const title = getString('common.actualUsage')
  const unitDesc = getString('services')

  return (
    <ServiceCard
      title={title}
      unitDesc={unitDesc}
      count={usage}
      tagClassName={css.green600}
      isSelected={isSelected}
      onClick={() => {
        onClick(SERVICES_CARDS.ACTUAL_USAGE_CARD)
      }}
      selectedClassName={css.grey300}
    />
  )
}

const OverUsageCard = ({ overUsage, isSelected, onClick }: OverUsageCardProps): React.ReactElement => {
  const { getString } = useStrings()
  const title = getString('common.overUse')
  const unitDesc = getString('authSettings.additionalCharge')

  return (
    <WarningCard
      title={title}
      unitDesc={unitDesc}
      count={overUsage}
      bodyIcon="warning-sign"
      iconColor={Color.ORANGE_500}
      className={css.orange200}
      isSelected={isSelected}
      onClick={() => {
        onClick(SERVICES_CARDS.OVERUSE_USAGE_CARD)
      }}
      selectedClassName={css.yellow900}
    />
  )
}

const RecommendationCard = ({ recommend, isSelected, onClick }: RecommendationCardProps): React.ReactElement => {
  const { getString } = useStrings()
  const title = getString('common.reccomendation')
  const unitDesc = getString('authSettings.recommendationDesc')

  return (
    <WarningCard
      title={title}
      unitDesc={unitDesc}
      count={recommend}
      bodyIcon="flash"
      iconColor={Color.PRIMARY_6}
      className={css.primary2}
      isSelected={isSelected}
      onClick={() => {
        onClick(SERVICES_CARDS.RECOMMENDATION_USAGE_CARD)
      }}
      selectedClassName={css.primary6}
    />
  )
}

const ServiceCards = ({
  currentPlanData,
  actualUsageData,
  overUsageData,
  recommendationData,
  setToggleValue,
  selectedCard,
  setSelectedCard
}: ServiceCardsProps): React.ReactElement => {
  const { currentPlan, services } = currentPlanData
  const { actualUsage } = actualUsageData
  const { overUsage } = overUsageData
  const { recommend } = recommendationData

  function handleCardClick(card: SERVICES_CARDS): void {
    setSelectedCard(card)
    switch (card) {
      case SERVICES_CARDS.ACTUAL_USAGE_CARD: {
        setToggleValue(actualUsage)
        break
      }
      case SERVICES_CARDS.CURRENT_USAGE_CARD: {
        setToggleValue(services)
        break
      }
      case SERVICES_CARDS.OVERUSE_USAGE_CARD: {
        setToggleValue(overUsage)
        break
      }
      case SERVICES_CARDS.RECOMMENDATION_USAGE_CARD: {
        setToggleValue(recommend)
        break
      }
    }
  }

  return (
    <Layout.Horizontal spacing="large" padding={{ bottom: 'large' }}>
      <CurrentPlanCard
        currentPlan={currentPlan}
        services={services}
        isSelected={selectedCard === SERVICES_CARDS.CURRENT_USAGE_CARD}
        onClick={handleCardClick}
      />
      <ActualUsageCard
        usage={actualUsage}
        isSelected={selectedCard === SERVICES_CARDS.ACTUAL_USAGE_CARD}
        onClick={handleCardClick}
      />
      <OverUsageCard
        overUsage={overUsage}
        isSelected={selectedCard === SERVICES_CARDS.OVERUSE_USAGE_CARD}
        onClick={handleCardClick}
      />
      <RecommendationCard
        recommend={recommend}
        isSelected={selectedCard === SERVICES_CARDS.RECOMMENDATION_USAGE_CARD}
        onClick={handleCardClick}
      />
    </Layout.Horizontal>
  )
}
const ServiceTogglerBar = ({
  toggleValue,
  setToggleValue,
  usages,
  setSelectedCard
}: ServiceTogglerBarProps): React.ReactElement => {
  return (
    <TogglerBar
      scale={100}
      width={900}
      onSelected={val => setToggleValue(val)}
      selectedValue={toggleValue}
      height={10}
      usages={usages}
      setSelectedCard={setSelectedCard}
    />
  )
}

// mock data until api is ready
const _currentPlanData = {
  currentPlan: Editions.FREE,
  services: 20
}
const _actualUsageData = {
  actualUsage: 23
}

const _overUsageData = {
  overUsage: 3
}
const _recommendationData = {
  recommend: 29
}

const ServiceUsageTogglerBar = ({ moduleName }: { moduleName: ModuleName }): React.ReactElement => {
  const { getString } = useStrings()
  const [toggleValue, setToggleValue] = useState<number>(_currentPlanData.services)
  const [selectedCard, setSelectedCard] = useState<SERVICES_CARDS>(SERVICES_CARDS.CURRENT_USAGE_CARD)
  return (
    <Container className={css.togglerBody}>
      <Layout.Vertical>
        <Text padding={{ bottom: 'large' }} font={{ weight: 'semi-bold' }}>
          {getString('authSettings.currentServiceUsage', { module: moduleName })}
        </Text>
        <Container>
          <Layout.Vertical>
            <ServiceCards
              currentPlanData={_currentPlanData}
              actualUsageData={_actualUsageData}
              overUsageData={_overUsageData}
              recommendationData={_recommendationData}
              setToggleValue={setToggleValue}
              selectedCard={selectedCard}
              setSelectedCard={setSelectedCard}
            />
            <ServiceTogglerBar
              toggleValue={toggleValue}
              setToggleValue={setToggleValue}
              usages={{
                currentUsage: _currentPlanData.services,
                actualUsage: _actualUsageData.actualUsage,
                overUsage: _overUsageData.overUsage,
                recommendUsage: _recommendationData.recommend
              }}
              setSelectedCard={setSelectedCard}
            />
          </Layout.Vertical>
        </Container>
      </Layout.Vertical>
    </Container>
  )
}

export default ServiceUsageTogglerBar
