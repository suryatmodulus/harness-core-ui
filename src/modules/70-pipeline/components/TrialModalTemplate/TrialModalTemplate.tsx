import React from 'react'
import { Layout, Container, Color, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { useQueryParams } from '@common/hooks'
import { ModuleLicenseType } from '@common/constants/SubscriptionTypes'
import css from './TrialModalTemplate.module.scss'

interface TrialModalTemplateProps {
  imgSrc: string
  hideTrialBadge?: boolean
  children: React.ReactElement
}

export const TrialModalTemplate: React.FC<TrialModalTemplateProps> = ({ imgSrc, hideTrialBadge, children }) => {
  const { getString } = useStrings()
  const { modal } = useQueryParams<{ modal?: ModuleLicenseType }>()
  const showTrialBadge = !hideTrialBadge && modal === ModuleLicenseType.TRIAL

  return (
    <Layout.Vertical padding={{ top: 'large', right: 'large' }}>
      <Layout.Horizontal padding={{ top: 'large' }}>
        <Container
          className={css.left}
          width="50%"
          style={{
            background: `transparent url(${imgSrc}) no-repeat`
          }}
        >
          {showTrialBadge && (
            <Text
              className={css.tag}
              width={120}
              padding={'xsmall'}
              border={{ radius: 3 }}
              color={Color.WHITE}
              background={Color.ORANGE_500}
              font={{ align: 'center' }}
            >
              {getString('common.trialInProgress')}
            </Text>
          )}
        </Container>
        <Container padding={{ left: 'xxxlarge' }} height={500} width={'50%'}>
          {children}
        </Container>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}
