/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { StartTrialTemplate } from '@rbac/components/TrialHomePageTemplate/StartTrialTemplate'
import { useStrings } from 'framework/strings'
import bgImageURL from './assets/CVLandingPage.svg'

const CVTrialHomePage: React.FC = () => {
  const { getString } = useStrings()

  const startTrialProps = {
    description: getString('cv.cvTrialHomePage.startTrial.description'),
    learnMore: {
      description: getString('cv.learnMore'),
      // TODO: need replace learn more url
      url: ''
    },
    startBtn: {
      description: getString('cv.cvTrialHomePage.startTrial.startBtn.description'),
      // TODO: need call licensing api and return value
      onClick: () => true
    }
  }

  return (
    <StartTrialTemplate
      title={getString('cv.continuous')}
      bgImageUrl={bgImageURL}
      startTrialProps={startTrialProps}
      module="cv"
    />
  )
}

export default CVTrialHomePage
