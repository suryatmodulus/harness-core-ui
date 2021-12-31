import React from 'react'

import { ModuleName } from 'framework/types/ModuleName'
import { useCDTrialModal } from '@cd/modals/CDTrial/useCDTrialModal'
import HomePageByModule from '@pipeline/components/HomePageByModule/HomePageByModule'
import bgImageURL from './images/cd.svg'

const CDHomePage: React.FC = () => {
  return <HomePageByModule moduleName={ModuleName.CD} bgImageURL={bgImageURL} useTrialModal={useCDTrialModal} />
}

export default CDHomePage
