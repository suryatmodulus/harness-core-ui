import React from 'react'
import { Color, Text, Icon, IconName, Heading, Card, Layout } from '@wings-software/uicore'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import type { Module } from '@common/interfaces/RouteInterfaces'
import type { StringsMap } from 'stringTypes'

import css from './ModuleInfoCards.module.scss'
interface InfoCards {
  [key: string]: Array<ModuleInfoCard>
}

interface ModuleInfoCardsProps {
  module: Module
  selectedInfoCard: ModuleInfoCard | undefined
  setSelectedInfoCard: (moduleInfoCard: ModuleInfoCard) => void
  style?: React.CSSProperties
}
type FooterProps = {
  title: string
  icons: {
    name: string
    enabled: boolean
  }[]
}
export interface ModuleInfoCard {
  icon: IconName
  iconClassName?: string
  title: string
  subtitle?: string
  description: string
  route?: () => string
  isNgRoute?: boolean
  isNew?: boolean
  footer?: FooterProps
}

const INFO_CARD_STYLES: { [key: string]: string } = {
  cd: css.cd
}

export const getInfoCardsProps = (accountId: string): InfoCards => {
  return {
    ce: [
      {
        icon: 'ce-optimization' as IconName,
        title: 'common.ce.cost',
        subtitle: 'common.ce.optimization',
        description: 'common.purpose.ce.optimizationCard.description',
        isNgRoute: true
      },
      {
        icon: 'ce-visibility',
        title: 'common.ce.cost',
        subtitle: 'common.ce.visibility',
        description: 'common.purpose.ce.visibilityCard.description',
        route: () => `${window.location.href.split('/ng/')[0]}/#/account/${accountId}/continuous-efficiency/settings`
      }
    ],
    cd: [
      {
        icon: 'command-approval',
        iconClassName: css.commandApproval,
        title: 'common.purpose.cd.1stGen.title',
        description: 'common.purpose.cd.1stGen.description',
        route: () => `${window.location.href.split('/ng/')[0]}/#/account/${accountId}/onboarding`,
        footer: {
          title: 'common.purpose.cd.supportedStack',
          icons: [
            {
              name: 'app-aws-code-deploy',
              enabled: true
            },
            {
              name: 'service-aws-lamda',
              enabled: true
            },
            {
              name: 'main-service-ami',
              enabled: true
            },
            {
              name: 'app-kubernetes',
              enabled: true
            },
            {
              name: 'command-winrm',
              enabled: true
            },
            {
              name: 'service-pivotal',
              enabled: true
            },
            {
              name: 'app-aws-lambda',
              enabled: true
            }
          ]
        }
      },
      {
        icon: 'cd-main',
        iconClassName: css.cdMain,
        title: 'common.purpose.cd.newGen.title',
        description: 'common.purpose.cd.newGen.description',
        isNew: true,
        isNgRoute: true,
        footer: {
          title: 'common.purpose.cd.supportedStack',
          icons: [
            {
              name: 'app-kubernetes',
              enabled: true
            },
            {
              name: 'app-aws-code-deploy',
              enabled: false
            },
            {
              name: 'service-aws-lamda',
              enabled: false
            },
            {
              name: 'main-service-ami',
              enabled: false
            },
            {
              name: 'command-winrm',
              enabled: false
            },
            {
              name: 'service-pivotal',
              enabled: false
            },
            {
              name: 'app-aws-lambda',
              enabled: false
            }
          ]
        }
      }
    ]
  }
}

const Footer = ({ footer }: { footer: FooterProps }): React.ReactElement => {
  const { getString } = useStrings()
  const { title, icons } = footer
  return (
    <Layout.Vertical padding={{ top: 'large' }}>
      <Text className={css.footerTitle}>{getString(title as keyof StringsMap)}</Text>
      <Layout.Horizontal spacing="small">
        {icons.map(icon =>
          icon.enabled ? (
            <Text key={icon.name} icon={icon.name as IconName} className={css.enabled} />
          ) : (
            <Text
              key={icon.name}
              icon={icon.name as IconName}
              tooltip="coming soon"
              iconProps={{ style: { opacity: '0.5' } }}
            />
          )
        )}
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

const getCardKey = ({ key1, key2 }: { key1?: string; key2?: string }): string => `${key1} ${key2}`

const ModuleInfoCards: React.FC<ModuleInfoCardsProps> = props => {
  const { module, selectedInfoCard, setSelectedInfoCard, style } = props
  const { getString } = useStrings()

  const { accountId } = useParams<{
    accountId: string
  }>()

  const getModuleInfoCards = (infoCard: ModuleInfoCard, infoCardStyle: string): React.ReactElement => {
    const cardKey = getCardKey({ key1: infoCard.title, key2: infoCard.subtitle })

    return (
      <Card
        key={cardKey}
        className={cx(
          css.card,
          css.infoCard,
          getCardKey({ key1: selectedInfoCard?.title, key2: selectedInfoCard?.subtitle }) === cardKey
            ? css.selected
            : '',
          infoCardStyle
        )}
        onClick={() => setSelectedInfoCard(infoCard)}
      >
        <Layout.Horizontal spacing="small" padding={{ bottom: 'large' }}>
          <Icon className={infoCard.iconClassName} name={infoCard.icon} size={40} />
          <div>
            <Layout.Horizontal spacing="small">
              <Text font="xsmall" color={Color.BLACK} className={css.title}>
                {getString(infoCard.title as keyof StringsMap)}
              </Text>
              {infoCard.isNew && (
                <Text
                  className={css.new}
                  background={Color.RED_500}
                  width={35}
                  height={15}
                  color={Color.WHITE}
                  border={{ radius: 2 }}
                  font={{ align: 'center', size: 'xsmall', weight: 'light' }}
                  padding={{ left: 3 }}
                >
                  {getString('common.new')}
                </Text>
              )}
            </Layout.Horizontal>
            {infoCard.subtitle && (
              <Text font={{ size: 'medium' }} color={Color.BLACK}>
                {getString(infoCard.subtitle as keyof StringsMap)}
              </Text>
            )}
          </div>
        </Layout.Horizontal>
        <Text font="small" padding={{ bottom: 'small' }}>
          {getString(infoCard.description as keyof StringsMap)}
        </Text>
        {infoCard.footer && <Footer footer={infoCard.footer} />}
      </Card>
    )
  }

  const infoCardProps = getInfoCardsProps(accountId)[module]

  const infoCardStyle = INFO_CARD_STYLES[module]

  const infoCards = infoCardProps?.map(cardProps => getModuleInfoCards(cardProps, infoCardStyle))

  if (!infoCardProps) {
    return <></>
  }

  const header = module === 'cd' ? 'common.purpose.howToProceed' : 'common.purpose.infoCardIntent'

  return (
    <>
      <Heading color={Color.BLACK} font={{ size: 'medium', weight: 'bold' }} padding={{ top: 'xlarge' }}>
        {getString(header as keyof StringsMap)}
      </Heading>
      <Layout.Horizontal spacing="small" style={{ ...style }}>
        {infoCards}
      </Layout.Horizontal>
    </>
  )
}

export default ModuleInfoCards
