import React from 'react'
import { Text, Layout, Icon, Container, Color, IconName } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'

interface TrialModalTemplateProps {
  iconName?: string
  title: string
  description?: string
  imgSrc: string
  hideTrialBadge?: boolean
  children: React.ReactElement
  rightWidth?: string
}

export const TrialModalTemplate: React.FC<TrialModalTemplateProps> = ({
  iconName,
  title,
  description,
  imgSrc,
  hideTrialBadge,
  children,
  rightWidth = '30%'
}) => {
  const { getString } = useStrings()

  return (
    <Layout.Vertical padding={{ top: 'large', right: 'large' }}>
      <Layout.Horizontal padding={{ top: 'large', left: 'xxxlarge' }} spacing="small">
        {iconName && (
          <>
            <Icon name={iconName as IconName} size={20} />
            <Text color={Color.BLACK} font={'medium'}>
              {title}
            </Text>
          </>
        )}
        {!hideTrialBadge && (
          <Text
            background={Color.ORANGE_500}
            color={Color.WHITE}
            width={120}
            border={{ radius: 3 }}
            margin={{ left: 30 }}
            inline
            font={{ align: 'center' }}
          >
            {getString('common.trialInProgress')}
          </Text>
        )}
      </Layout.Horizontal>
      <Layout.Horizontal padding={{ top: 'large' }}>
        <Container
          width="57%"
          padding={{ right: 'xxxlarge' }}
          style={{
            background: `transparent url(${imgSrc}) no-repeat`,
            backgroundSize: 'stretch',
            backgroundPositionX: '15%',
            backgroundPositionY: 'center'
          }}
        >
          {description && (
            <Text
              padding={{ left: 'xxxlarge' }}
              font={{ size: 'normal' }}
              width={380}
              margin={{ left: 30 }}
              style={{ lineHeight: 2 }}
            >
              {description}
            </Text>
          )}
        </Container>
        <div
          style={{
            paddingLeft: 'xxxlarge',
            borderLeftWidth: '1px',
            borderColor: 'var(--grey-200)',
            borderLeftStyle: 'solid',
            height: 425
          }}
        />
        <Container width={rightWidth} padding={{ left: 'xxxlarge' }} height={500}>
          {children}
        </Container>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}
