import React from 'react'

import { ModuleName } from 'framework/types/ModuleName'
import { useCITrialModal } from '@ci/modals/CITrial/useCITrialModal'
import HomePageByModule from '@pipeline/components/HomePageByModule/HomePageByModule'
import bgImageURL from './images/ci.svg'

const CIHomePage: React.FC = () => {
  return <HomePageByModule moduleName={ModuleName.CI} bgImageURL={bgImageURL} useTrialModal={useCITrialModal} />
}

export default CIHomePage
