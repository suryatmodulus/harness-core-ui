import React from 'react'
import { useParams } from 'react-router-dom'
import { Text, Layout, Color, Card, Icon, Container } from '@wings-software/uicore'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useGetUserProjectInfo } from 'services/cd-ng'
import css from './UserSummary.module.scss'

const MyProjectsList: React.FC = () => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()

  const { data: projects, loading } = useGetUserProjectInfo({
    queryParams: {
      accountId,
      pageIndex: 0,
      pageSize: 5
    }
  })

  return (
    <Layout.Vertical spacing="large" margin={{ bottom: 'huge' }}>
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
      {projects?.data && !loading ? (
        <Container className={css.cardContainer}>
          {projects.data.content?.map(project => {
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
                    font={{ align: 'center', weight: 'semi-bold' }}
                  >
                    {project.name}
                  </Text>
                </Layout.Vertical>
              </Card>
            )
          })}
        </Container>
      ) : !loading ? (
        <Text color={Color.GREY_700}>{getString('userProfile.noProjects')}</Text>
      ) : null}
    </Layout.Vertical>
  )
}

export default MyProjectsList
