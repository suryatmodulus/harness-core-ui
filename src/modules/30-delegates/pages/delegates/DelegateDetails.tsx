import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { Container, Layout, Text, IconName, Color, FlexExpander } from '@wings-software/uicore'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import type {
  ProjectPathProps,
  ModulePathParams,
  DelegatePathProps,
  AccountPathProps
} from '@common/interfaces/RouteInterfaces'
import { delegateTypeToIcon } from '@common/utils/delegateUtils'
import { useStrings } from 'framework/strings'
import { useGetDelegateGroupFromIdV2, useGetV2, DelegateProfile } from 'services/portal'
import { TagsViewer } from '@common/components/TagsViewer/TagsViewer'
import { SectionContainer } from '@delegates/components/SectionContainer/SectionContainer'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { DelegateOverview } from './DelegateOverview'
import { DelegateAdvanced } from './DelegateAdvanced'
import css from './DelegateDetails.module.scss'

export default function DelegateDetails(): JSX.Element {
  const { delegateId, accountId, orgIdentifier, projectIdentifier, module } = useParams<
    Partial<ProjectPathProps & ModulePathParams> & DelegatePathProps & AccountPathProps
  >()
  const { getString } = useStrings()
  const { data } = useGetDelegateGroupFromIdV2({
    delegateGroupId: delegateId,
    queryParams: { accountId, orgId: orgIdentifier, projectId: projectIdentifier }
  })

  const delegate = data?.resource

  const {
    loading,
    error,
    data: profileResponse,
    refetch
  } = useGetV2({
    delegateProfileId: delegate?.delegateConfigurationId || '',
    queryParams: { accountId }
  })

  const delegateProfile = profileResponse?.resource as DelegateProfile
  const icon: IconName = delegateTypeToIcon(delegate?.delegateType as string)

  const renderTitle = (): React.ReactNode => {
    return (
      <Layout.Vertical spacing="small">
        <Layout.Horizontal spacing="small">
          <Link
            style={{ color: '#0092E4', fontSize: '12px' }}
            to={routes.toDelegates({
              accountId,
              orgIdentifier,
              projectIdentifier,
              module
            })}
          >
            {getString('delegate.delegates')}
          </Link>
          <span>/</span>
        </Layout.Horizontal>
        <Text style={{ fontSize: '20px', color: 'var(--black)' }} icon={icon} iconProps={{ size: 21 }}>
          {delegate?.groupName}
        </Text>
        <Text color={Color.GREY_400}>{delegate?.groupHostName}</Text>
        <Container>
          <TagsViewer tags={Object.keys(delegate?.groupImplicitSelectors || {})} style={{ background: '#CDF4FE' }} />
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

  const size = delegate?.sizeDetails

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
                  {size?.label}
                </Text>
              </Container>
              <Container flex style={{ marginTop: 'var(--spacing-xxlarge)' }}>
                <Layout.Horizontal style={{ flexGrow: 1, flexBasis: 0, justifyContent: 'space-around' }}>
                  <Text className={css.delegateMachineSpec}>
                    {getString('delegate.delegateMEM')}{' '}
                    <span>
                      {(Number(size?.ram) / 1000).toFixed(1)}
                      <span>GB</span>
                    </span>
                  </Text>
                  <Text className={css.delegateMachineSpec}>
                    {getString('delegate.delegateCPU')} <span>{size?.cpu}</span>
                  </Text>
                </Layout.Horizontal>
              </Container>
            </SectionContainer>
          </Layout.Horizontal>
        </Layout.Vertical>
      </Page.Body>
    </>
  )
}
