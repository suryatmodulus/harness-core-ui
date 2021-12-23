import { useParams } from 'react-router-dom'
import type { Experiences } from '@common/constants/Utils'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'

interface UseUpdateLSDefaultExperienceReturn {
  updateLSDefaultExperience: () => void
}
export function useUpdateLSDefaultExperience(experience: Experiences): UseUpdateLSDefaultExperienceReturn {
  const { currentUserInfo } = useAppStore()
  const { accountId } = useParams<AccountPathProps>()
  const defaultExperienceMap = currentUserInfo.accounts?.reduce((previousValue, account) => {
    const newExperience = account.uuid === accountId ? experience : account.defaultExperience
    return {
      ...previousValue,
      [account.uuid as string]: newExperience
    }
  }, {})

  function updateLSDefaultExperience(): void {
    localStorage.setItem('defaultExperienceMap', JSON.stringify(defaultExperienceMap))
  }

  return { updateLSDefaultExperience }
}
