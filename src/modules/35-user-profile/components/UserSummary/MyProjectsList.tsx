import React from 'react'
import { useParams } from 'react-router-dom'
import { Text, Layout, Color, Card, Icon, Container } from '@wings-software/uicore'
import { PageError } from '@common/components/Page/PageError'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useGetUserProjectInfo } from 'services/cd-ng'
import css from './UserSummary.module.scss'

const MyProjectsList: React.FC = () => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()

  const {
    data: projects,
    loading,
    error,
    refetch
  } = useGetUserProjectInfo({
    queryParams: {
      accountId,
      pageIndex: 0,
      pageSize: 6
    }
  })

  return (
    <Layout.Vertical spacing="large" margin={{ bottom: 'medium' }}>
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'start' }} spacing="medium">
        <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.GREY_900}>
          {getString('userProfile.myProjects')}
        </Text>
        {projects?.data?.totalItems ? (
          <Text
            font={{ weight: 'bold' }}
            color={Color.BLUE_500}
            padding={{ top: 'xsmall', bottom: 'xsmall', left: 'small', right: 'small' }}
            background={Color.BLUE_200}
            border={{ radius: 8 }}
          >
            {projects.data.totalItems}
          </Text>
        ) : null}
      </Layout.Horizontal>
      {loading ? (
        <Text color={Color.GREY_600}>{getString('common.loading')}</Text>
      ) : projects?.data?.content?.length ? (
        <Container className={css.cardContainer}>
          {projects.data.content.map(project => {
            return (
              <Card key={`${project.identifier}-${project.orgIdentifier}`} className={css.card}>
                <Layout.Vertical flex={{ align: 'center-center' }}>
                  <Icon
                    name="harness"
                    size={32}
                    style={{ color: project.color }}
                    color={project.color}
                    margin={{ top: 'xsmall', bottom: 'medium' }}
                  />
                  <Text
                    width={100}
                    lineClamp={3}
                    color={Color.GREY_800}
                    font={{ size: 'small', align: 'center', weight: 'semi-bold' }}
                  >
                    {project.name}
                  </Text>
                </Layout.Vertical>
              </Card>
            )
          })}
          {Number(projects.data.totalItems) > Number(projects.data.content.length) && (
            <Text margin={{ top: 'huge' }}>
              {getString('more', {
                number: Number(projects.data.totalItems) - Number(projects.data.content.length)
              })}
            </Text>
          )}
        </Container>
      ) : projects?.data?.content ? (
        <Text color={Color.GREY_700}>{getString('noProjects')}</Text>
      ) : (
        <PageError message={(error?.data as Error)?.message || error?.message} onClick={() => refetch()} />
      )}
    </Layout.Vertical>
  )
}

export default MyProjectsList
