import React from 'react'
import {
  Layout,
  Color,
  Heading,
  Text,
  Container,
  Button,
  Tag,
  Icon,
  CardSelect,
  CardSelectType
} from '@wings-software/uicore'
import { Versions } from '@common/constants/Utils'
import { useStrings } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import css from '../DefaultVersion.module.scss'

interface Props {
  onSubmit?: () => void
  currentVersion: Versions
  setCurrentVersion: (currentVersion: Versions) => void
}

enum Modules {
  CD = 'cd-main',
  CI = 'ci-main',
  CF = 'cf-main',
  CE = 'ce-main',
  CV = 'cv-main'
}

interface Data {
  type: Versions
  title: keyof StringsMap
  description: keyof StringsMap
  modules: {
    name: Modules
    size: number
  }[]
}

const data: Data[] = [
  {
    type: Versions.CG,
    title: 'common.harnessFirstGeneration',
    description: 'common.harnessFirstGenerationDescription',
    modules: [
      {
        name: Modules.CD,
        size: 30
      },
      {
        name: Modules.CE,
        size: 25
      }
    ]
  },
  {
    type: Versions.NG,
    title: 'common.harnessNextGeneration',
    description: 'common.harnessNextGenerationDescription',
    modules: [
      {
        name: Modules.CD,
        size: 30
      },
      {
        name: Modules.CI,
        size: 25
      },
      {
        name: Modules.CV,
        size: 25
      },
      {
        name: Modules.CE,
        size: 25
      },
      {
        name: Modules.CF,
        size: 25
      }
    ]
  }
]

const DefaultVersionForm: React.FC<Props> = ({ onSubmit, currentVersion, setCurrentVersion }) => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical padding={{ left: 'huge', right: 'huge' }}>
      <Heading level={1} color={Color.GREY_800} font={{ weight: 'bold' }} margin={{ bottom: 'medium' }}>
        {getString('common.defaultVersion')}
      </Heading>
      <Text color={Color.GREY_700} font={{ size: 'normal' }} margin={{ bottom: 'xxxlarge' }}>
        {getString('common.selectDefaultVersion')}
      </Text>
      <CardSelect
        data={data}
        className={css.cardContainer}
        cardClassName={css.card}
        type={CardSelectType.CardView}
        renderItem={item => (
          <Container>
            <Layout.Horizontal spacing="small">
              <Heading level={2} color={Color.GREY_900} font={{ weight: 'bold' }} margin={{ bottom: 'medium' }}>
                {getString(item.title)}
              </Heading>
              {item.type === Versions.NG && (
                <Tag round className={css.tag}>
                  {getString('common.new')}
                </Tag>
              )}
            </Layout.Horizontal>
            <Text color={Color.GREY_900} font={{ size: 'small' }} className={css.cardText} margin={{ bottom: 'large' }}>
              {getString(item.description)}
            </Text>
            <Text color={Color.GREY_700} font={{ size: 'small', weight: 'bold' }} margin={{ bottom: 'medium' }}>
              {getString('common.supportedModals')}
            </Text>
            <Layout.Horizontal spacing="xlarge" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
              {item.modules.map(module => (
                <Icon name={module.name} size={module.size} key={module.name} />
              ))}
            </Layout.Horizontal>
          </Container>
        )}
        onChange={card => setCurrentVersion(card.type)}
        selected={data.find(item => item.type === currentVersion)}
      />
      <Container padding={{ top: 'huge', bottom: 'xxlarge' }}>
        <Button text={getString('save')} intent="primary" onClick={onSubmit} />
      </Container>
    </Layout.Vertical>
  )
}

export default DefaultVersionForm
