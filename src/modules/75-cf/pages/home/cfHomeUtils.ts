import { useParams, useHistory } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import { useQueryParams } from '@common/hooks'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type { Project } from 'services/cd-ng'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import type { ModuleLicenseType } from '@common/constants/SubscriptionTypes'

export function useGetProjectCreateSuccessHandler(): (project?: Project) => void {
  const history = useHistory()
  const { experience } = useQueryParams<{ experience?: ModuleLicenseType; modal?: ModuleLicenseType }>()
  const { accountId } = useParams<AccountPathProps>()

  return (project?: Project): void => {
    if (project) {
      if (experience) {
        history.push({
          pathname: routes.toCFOnboarding({
            orgIdentifier: project?.orgIdentifier || '',
            projectIdentifier: project.identifier,
            accountId
          })
        })
        return
      }
      history.push(
        routes.toCFFeatureFlags({
          projectIdentifier: project.identifier,
          orgIdentifier: project.orgIdentifier || '',
          accountId
        })
      )
    }
  }
}

interface UseSignUpHandlerProps {
  gettingProjects: boolean
  projectsExist: boolean
  openProjectModal: () => void
  openTrialModal: () => void
}

export function useGetSignUpHandler({
  gettingProjects,
  projectsExist,
  openProjectModal,
  openTrialModal
}: UseSignUpHandlerProps): () => void {
  const { accountId } = useParams<AccountPathProps>()
  const history = useHistory()
  const { selectedProject } = useAppStore()
  const { modal } = useQueryParams<{ experience?: ModuleLicenseType; modal?: ModuleLicenseType }>()

  return () => {
    if (modal && !gettingProjects) {
      if (!selectedProject) {
        if (!projectsExist) {
          // selectedProject doesnot exist and projects donot exist, open project modal
          openProjectModal()
        } else {
          // select or create project modal
          openTrialModal()
        }
      } else {
        history.push({
          pathname: routes.toCFOnboarding({
            orgIdentifier: selectedProject.orgIdentifier || '',
            projectIdentifier: selectedProject.identifier,
            accountId
          })
        })
      }
    }
  }
}
