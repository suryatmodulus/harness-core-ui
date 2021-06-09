import React from 'react'
import { Container, Layout, Pagination } from '@wings-software/uicore'
import type { Project, ProjectAggregateDTO, ResponsePageProjectAggregateDTO } from 'services/cd-ng'
import ProjectCard from '@projects-orgs/components/ProjectCard/ProjectCard'
import css from './ProjectGridView.module.scss'

interface ProjectGridViewProps {
  data: ResponsePageProjectAggregateDTO | null
  showEditProject?: (project: Project) => void
  collaborators?: (project: Project) => void
  reloadPage: () => Promise<void>
  gotoPage: (index: number) => void
  categories: string[]
}

const ProjectGridView: React.FC<ProjectGridViewProps> = props => {
  const { data, showEditProject, collaborators, reloadPage, gotoPage, categories } = props
  const sortedBy = window.sortedBy
  console.log(sortedBy)
  let order = []
  switch (window?.sortedBy?.value) {
    case 'VISIBILITY':
      order = ['promoproject', 'samplegitsyncproject', 'fulfilmentproject', 'authenticationproject']
      break
    case 'USAGE':
      order = ['samplegitsyncproject', 'promoproject', 'fulfilmentproject', 'authenticationproject']
      break
    case 'OVERALL':
      order = ['samplegitsyncproject', 'promoproject', 'fulfilmentproject', 'authenticationproject']
      break
    case 'DEPLOYMENT_ACTIVITY':
      order = ['samplegitsyncproject', 'authenticationproject', 'fulfilmentproject', 'promoproject']
      break
    default:
      break
  }
  const orderedData =
    order.map((item: string) => {
      return data?.data?.content?.filter(project => project.projectResponse.project.identifier === item)[0]
    }) || data
  return (
    <>
      <Container className={css.masonry}>
        <Layout.Masonry
          center
          gutter={25}
          items={orderedData || []}
          renderItem={(projectDTO: ProjectAggregateDTO) => (
            <ProjectCard
              data={projectDTO}
              reloadProjects={reloadPage}
              editProject={showEditProject}
              handleInviteCollaborators={collaborators}
              categories={categories}
            />
          )}
          keyOf={(projectDTO: ProjectAggregateDTO) =>
            projectDTO.projectResponse.project.identifier + projectDTO.projectResponse.project.orgIdentifier
          }
        />
      </Container>
      <Container className={css.pagination}>
        <Pagination
          itemCount={data?.data?.totalItems || 0}
          pageSize={data?.data?.pageSize || 10}
          pageCount={data?.data?.totalPages || 0}
          pageIndex={data?.data?.pageIndex || 0}
          gotoPage={gotoPage}
        />
      </Container>
    </>
  )
}

export default ProjectGridView
