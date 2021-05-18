import React from 'react'
import { Layout, Color, Heading, Text, Card, Container, Button, Tag, Icon } from '@wings-software/uicore'
import { Versions } from '@common/constants/Utils'
import { useStrings } from 'framework/strings'
import css from '../DefaultVersion.module.scss'

interface Props {
  onSubmit?: () => void
  currentVersion: Versions
  setCurrentVersion: (currentVersion: Versions) => void
}

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
      <Container className={css.cardContainer}>
        <Card
          interactive
          className={css.card}
          selected={Versions.CG === currentVersion}
          onClick={() => setCurrentVersion(Versions.CG)}
        >
          <Heading level={2} color={Color.GREY_900} font={{ weight: 'bold' }} margin={{ bottom: 'medium' }}>
            {getString('common.harnessFirstGeneration')}
          </Heading>
          <Text color={Color.GREY_900} font={{ size: 'small' }} className={css.cardText} margin={{ bottom: 'large' }}>
            {getString('common.harnessFirstGenerationDescription')}
          </Text>
          <Text color={Color.GREY_700} font={{ size: 'small', weight: 'bold' }} margin={{ bottom: 'medium' }}>
            {getString('common.supportedModals')}
          </Text>
          <Layout.Horizontal spacing="xlarge" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
            <Icon name="cd-main" size={30} />
            <Icon name="ce-main" size={25} />
          </Layout.Horizontal>
        </Card>
        <Card
          interactive
          className={css.card}
          selected={Versions.NG === currentVersion}
          onClick={() => setCurrentVersion(Versions.NG)}
        >
          <Layout.Horizontal spacing="small">
            <Heading level={2} color={Color.GREY_900} font={{ weight: 'bold' }} margin={{ bottom: 'medium' }}>
              {getString('common.harnessNextGeneration')}
            </Heading>
            <Tag round className={css.tag}>
              {getString('common.new')}
            </Tag>
          </Layout.Horizontal>
          <Text color={Color.GREY_900} font={{ size: 'small' }} className={css.cardText} margin={{ bottom: 'large' }}>
            {getString('common.harnessNextGenerationDescription')}
          </Text>
          <Text color={Color.GREY_700} font={{ size: 'small', weight: 'bold' }} margin={{ bottom: 'medium' }}>
            {getString('common.supportedModals')}
          </Text>
          <Layout.Horizontal spacing="xlarge" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
            <Icon name="cd-main" size={30} />
            <Icon name="ci-main" size={25} />
            <Icon name="cf-main" size={25} />
            <Icon name="ce-main" size={25} />
            <Icon name="cv-main" size={25} />
          </Layout.Horizontal>
        </Card>
      </Container>
      <Container padding={{ top: 'huge', bottom: 'xxlarge' }}>
        <Button text={getString('save')} intent="primary" onClick={onSubmit} />
      </Container>
    </Layout.Vertical>
  )
}

export default DefaultVersionForm
