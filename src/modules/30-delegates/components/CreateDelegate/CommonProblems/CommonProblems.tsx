import React from 'react'
import { Container, Layout, Icon, Color, Text, StepProps } from '@wings-software/uicore'
import { Link } from 'react-router-dom'
import { useStrings } from 'framework/strings'

import CopyToClipboard from '@common/components/CopyToClipBoard/CopyToClipBoard'
import css from '../K8sDelegate/CreateK8sDelegate.module.scss'

const CommonProblems: React.FC<StepProps<null>> = () => {
  const { getString } = useStrings()
  return (
    <>
      <Layout.Vertical width={630} style={{ padding: '0px var(--spacing-large)' }}>
        <Layout.Horizontal
          spacing="medium"
          style={{
            borderBottom: '0.5px solid #B0B1C4',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 'var(--spacing-small) var(--spacing-medium)'
          }}
        >
          <Icon name="support-troubleshoot" size={18} />
          <Text color={Color.BLACK} font={{ size: 'medium', weight: 'bold' }} style={{ lineHeight: '22px' }}>
            {getString('delegate.delegateNotInstalled.tabs.commonProblems.hereIsWhatYouCanDo')}
          </Text>
        </Layout.Horizontal>
        <Layout.Vertical width={511} style={{ padding: 'var(--spacing-medium) 0px' }}>
          <Text color={Color.BLACK} font={{ weight: 'bold' }}>
            {getString('delegate.delegateNotInstalled.statusOfCluster')}
          </Text>
          <Link to="" href="/" style={{ textAlign: 'end', fontSize: '13px' }}>
            {getString('delegate.delegateNotInstalled.tabs.commonProblems.troubleshoot')}
          </Link>
          <Container
            intent="primary"
            padding="small"
            font={{
              align: 'center'
            }}
            flex
            className={css.verificationField}
          >
            <Text style={{ marginRight: '24px' }}>{getString('delegate.delegateNotInstalled.podCommand')}</Text>
            <CopyToClipboard content={getString('delegate.delegateNotInstalled.podCommand')} />
          </Container>
        </Layout.Vertical>
        <Layout.Vertical width={511} style={{ padding: 'var(--spacing-small) 0px' }}>
          <Text color={Color.BLACK} font={{ weight: 'bold' }}>
            {getString('delegate.delegateNotInstalled.tabs.commonProblems.checkTheDelegateLogs')}
          </Text>
          <Link to="" href="/" style={{ textAlign: 'end', fontSize: '13px' }}>
            {getString('delegate.delegateNotInstalled.tabs.commonProblems.troubleshoot')}
          </Link>
          <Container
            intent="primary"
            padding="small"
            font={{
              align: 'center'
            }}
            flex
            className={css.verificationField}
          >
            <Text style={{ marginRight: '24px' }}>{getString('delegate.delegateNotInstalled.verifyField2')}</Text>
            <CopyToClipboard content={getString('delegate.delegateNotInstalled.verifyField2')} />
          </Container>
        </Layout.Vertical>
        <Layout.Horizontal width={511} style={{ padding: 'var(--spacing-small) 0px' }}>
          <Text lineClamp={3} font="normal" color={Color.GREY_700} style={{ lineHeight: '24px' }}>
            {getString('delegate.delegateNotInstalled.tabs.commonProblems.description1')}
          </Text>
        </Layout.Horizontal>
        <Layout.Vertical width={511} style={{ padding: 'var(--spacing-small) 0px' }}>
          <Text color={Color.BLACK} font={{ weight: 'bold' }}>
            {getString('delegate.delegateNotInstalled.tabs.commonProblems.description2')}
          </Text>
          <Link to="" href="/" style={{ textAlign: 'end', fontSize: '13px' }}>
            {getString('delegate.delegateNotInstalled.tabs.commonProblems.troubleshoot')}
          </Link>
          <Container
            intent="primary"
            padding="small"
            font={{
              align: 'center'
            }}
            flex
            className={css.verificationField}
          >
            <Text style={{ marginRight: '24px' }}>{getString('delegate.delegateNotInstalled.verifyField3')}</Text>
            <CopyToClipboard content={getString('delegate.delegateNotInstalled.verifyField3')} />
          </Container>
        </Layout.Vertical>
        <Layout.Horizontal width={511} style={{ padding: 'var(--spacing-small) 0px' }}>
          <Text lineClamp={2} font="normal" color={Color.GREY_700} style={{ lineHeight: '24px' }}>
            {getString('delegate.delegateNotInstalled.tabs.commonProblems.checkEndPoint')}
          </Text>
        </Layout.Horizontal>
      </Layout.Vertical>
    </>
  )
}

export default CommonProblems
