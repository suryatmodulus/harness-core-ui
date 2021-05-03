import React from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
import { Container, Layout, Text, IconName, Color, FlexExpander } from '@wings-software/uicore'
import { Page } from '@common/exports'
import { delegateTypeToIcon } from '@common/utils/delegateUtils'
import { useStrings } from 'framework/strings'
import { useGetDelegateFromId, useGetDelegateConfigFromId } from 'services/portal'
import { TagsViewer } from '@common/components/TagsViewer/TagsViewer'
import { SectionContainer } from '@delegates/components/SectionContainer/SectionContainer'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { DelegateOverview } from './DelegateOverview'
import { DelegateAdvanced } from './DelegateAdvanced'
import css from './DelegateDetails.module.scss'

export default function DelegateDetails(): JSX.Element {
  const { delegateId, accountId } = useParams<Record<string, string>>()
  const { pathname } = useLocation()
  const { getString } = useStrings()
  const { data } = useGetDelegateFromId({
    delegateId,
    queryParams: { accountId }
  })

  const delegate = data?.resource

  const { loading, error, data: profileResponse, refetch } = useGetDelegateConfigFromId({
    delegateProfileId: delegate?.delegateProfileId || '',
    queryParams: { accountId }
  })

  const delegateProfile = profileResponse?.resource
  const icon: IconName = delegateTypeToIcon(delegate?.delegateType as string)
  const renderTitle = (): React.ReactNode => {
    return (
      <Layout.Vertical spacing="small">
        <Layout.Horizontal spacing="small">
          <Link
            style={{ color: '#0092E4', fontSize: '12px' }}
            to={`${pathname.substring(0, pathname.lastIndexOf('/'))}`}
          >
            {getString('resources')}
          </Link>
          <span>/</span>
          <Link
            style={{ color: '#0092E4', fontSize: '12px' }}
            to={`${pathname.substring(0, pathname.lastIndexOf('/'))}`}
          >
            {getString('delegate.delegates')}
          </Link>
          <span>/</span>
        </Layout.Horizontal>
        <Text style={{ fontSize: '20px', color: 'var(--black)' }} icon={icon} iconProps={{ size: 21 }}>
          {delegate?.delegateName}
        </Text>
        <Text color={Color.GREY_400}>{delegate?.hostName}</Text>
        <Container>
          <TagsViewer tags={delegate?.tags} style={{ background: '#CDF4FE' }} />
        </Container>
      </Layout.Vertical>
    )
  }

  if (loading) {
    return (
      <Container
        style={{
          position: 'fixed',
          top: '0',
          left: '270px',
          width: 'calc(100% - 270px)',
          height: '100%'
        }}
      >
        <ContainerSpinner />
      </Container>
    )
  }

  if (error) {
    return <Page.Error message={error.message} onClick={() => refetch()} />
  }

  return (
    <>
      <Container
        height={143}
        padding={{ top: 'large', right: 'xlarge', bottom: 'large', left: 'xlarge' }}
        style={{ backgroundColor: 'rgba(219, 241, 255, .46)' }}
      >
        {renderTitle()}
      </Container>
      <Page.Body className={css.main}>
        <Layout.Vertical>
          {/** TODO: Not support visual/yaml toggle at the moment. Hide for now
          <Container style={{ display: 'none' }}>
            <div className={css.optionBtns}>
              <div className={css.item}>{getString('visual')}</div>
              <div className={css.item}>{getString('yaml')}</div>
            </div>
          </Container>*/}
          <Layout.Horizontal spacing="large">
            <Container className={css.cardContainer}>
              {delegate && delegateProfile && (
                <Layout.Vertical spacing="large" width={550}>
                  <DelegateOverview delegate={delegate} delegateProfile={delegateProfile} />
                  <DelegateAdvanced delegate={delegate} delegateProfile={delegateProfile} />
                </Layout.Vertical>
              )}
            </Container>
            <SectionContainer width={398} height={150}>
              <Container flex>
                <Text color={Color.GREY_800} style={{ fontWeight: 600 }}>
                  {getString('delegate.delegateSizeLower')}
                </Text>
                <FlexExpander />
                <Text
                  style={{
                    background: '#CFB4FF',
                    borderRadius: '10px',
                    color: '#4D0B8F',
                    textAlign: 'center',
                    marginRight: 'var(--spacing-xxlarge)',
                    padding: '3px 34px',
                    fontWeight: 600
                  }}
                >
                  {getString('delegate.delegateSizeLarge')}
                </Text>
              </Container>
              <Container flex style={{ marginTop: 'var(--spacing-large)' }}>
                <Container width="50%">
                  <Text
                    style={{
                      fontSize: '16px',
                      fontWeight: 500,
                      color: '#383946',
                      textAlign: 'center',
                      paddingBottom: 'var(--spacing-small)'
                    }}
                  >
                    5000
                  </Text>
                  <Text
                    style={{
                      color: '#9293AB',
                      textAlign: 'center'
                    }}
                  >
                    <span
                      style={{
                        width: 105,
                        display: 'inline-block'
                      }}
                    >
                      {getString('delegate.delegateSizeUpto')}
                    </span>
                  </Text>
                </Container>
                <span
                  style={{
                    display: 'inline-block',
                    width: '1px',
                    height: '63px',
                    background: '#D9DAE6'
                  }}
                ></span>
                <Container width="calc(50% - 1px)" style={{ padding: '20px 0px 0px 38px' }}>
                  <Layout.Horizontal style={{ flexGrow: 1, flexBasis: 0 }}>
                    <Text className={css.delegateMachineSpec}>
                      {getString('delegate.delegateMEM')}{' '}
                      <span>
                        16<span>GB</span>
                      </span>
                    </Text>
                    <Text className={css.delegateMachineSpec}>
                      {getString('delegate.delegateCPU')} <span>4</span>
                    </Text>
                    <Text className={css.delegateMachineSpec}>
                      {getString('delegate.delegateDISK')}{' '}
                      <span>
                        15<span>GB</span>
                      </span>
                    </Text>
                  </Layout.Horizontal>
                </Container>
              </Container>
            </SectionContainer>
          </Layout.Horizontal>
        </Layout.Vertical>
      </Page.Body>
    </>
  )
}
