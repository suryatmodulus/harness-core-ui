import React, { useEffect } from 'react'
import { Color, CardSelect, Container, Text, Layout, Icon } from '@wings-software/uicore'

import { useStrings } from 'framework/strings'
import { DelegateTypes } from '@delegates/constants'

import type { CardData } from '../CreateDelegate/commonSteps/DelegateDetailsStep'
import Docker from './Icons/docker.svg'
import Ecs from './Icons/ecs.svg'
import Linux from './Icons/linux.svg'
import css from './Delegates4Ways.module.scss'

interface Delegates4WaysProps {
  onSelect: (value: CardData) => void
  selectedCard: CardData | undefined
}

const Delegates4Ways: React.FC<Delegates4WaysProps> = props => {
  const { onSelect, selectedCard } = props
  const { getString } = useStrings()
  const selectCardData: CardData[] = [
    {
      text: getString('delegate.cardData.docker.text'),
      value: getString('delegate.cardData.docker.value'),
      icon: getString('delegate.cardData.docker.icon'),
      name: getString('delegate.cardData.docker.name'),
      type: DelegateTypes.DOCKER
    },
    {
      text: getString('delegate.cardData.kubernetes.text'),
      value: getString('delegate.cardData.kubernetes.value'),
      icon: getString('delegate.cardData.kubernetes.icon'),
      name: getString('kubernetesText'),
      type: DelegateTypes.KUBERNETES_CLUSTER
    },
    {
      text: getString('delegate.cardData.amazonECS.text'),
      value: getString('delegate.cardData.amazonECS.value'),
      icon: getString('delegate.cardData.amazonECS.icon'),
      name: getString('delegate.cardData.amazonECS.name'),
      type: DelegateTypes.ECS
    },
    {
      text: getString('delegate.cardData.linux.text'),
      value: getString('delegate.cardData.linux.value'),
      icon: getString('delegate.cardData.linux.icon'),
      name: getString('delegate.cardData.linux.name'),
      type: DelegateTypes.LINUX
    }
  ]

  useEffect(() => {
    onSelect(selectCardData[1])
  }, [])

  const getIcon = (type: string) => {
    switch (type) {
      case DelegateTypes.LINUX:
        return Linux

      case DelegateTypes.ECS:
        return Ecs
      case DelegateTypes.DOCKER:
        return Docker
    }
  }

  return (
    <CardSelect
      data={selectCardData}
      cornerSelected={true}
      selected={selectCardData[selectCardData.findIndex(card => card.value === selectedCard?.value)]}
      renderItem={item => (
        <Container className={css.cardBody} data-type={item.type}>
          {item.type !== DelegateTypes.KUBERNETES_CLUSTER && <img src={getIcon(item.type)} />}
          {item.type === DelegateTypes.KUBERNETES_CLUSTER && (
            <Icon name="service-kubernetes" size={20} className={css.kubIcon} />
          )}
          <Layout.Vertical className={css.cardContent}>
            <Text font={{ weight: 'bold' }} color={Color.GREY_900} className={css.cardHeader}>
              {item.name}
            </Text>
            <Text
              style={{
                color: '#6B6D85'
              }}
              className={css.subTitle}
            >
              {item.text}
            </Text>
          </Layout.Vertical>
        </Container>
      )}
      onChange={value => {
        if (value.type === DelegateTypes.KUBERNETES_CLUSTER) {
          /* istanbul ignore next */
          onSelect(value)
        }
      }}
      className={`grid ${css.cardWrapper}`}
    ></CardSelect>
  )
}

export default Delegates4Ways
