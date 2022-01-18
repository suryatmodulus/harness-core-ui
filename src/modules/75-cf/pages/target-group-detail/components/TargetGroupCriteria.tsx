/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { FontVariation, Heading, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { Segment } from 'services/cf'
import TargetGroupCriteriaTargetListing from './TargetGroupCriteriaTargetListing'
import TargetGroupCriteriaConditionListing from './TargetGroupCriteriaConditionListing'

import css from './TargetGroupCriteria.module.scss'

export interface TargetGroupCriteriaProps {
  targetGroup: Segment
}

const TargetGroupCriteria: FC<TargetGroupCriteriaProps> = ({ targetGroup }) => {
  const { getString } = useStrings()

  return (
    <aside className={css.layout}>
      <Heading level={3} font={{ variation: FontVariation.H5 }}>
        {getString('cf.segmentDetail.criteria')}
      </Heading>

      <section className={css.section}>
        <Heading level={4} font={{ variation: FontVariation.H6 }}>
          {getString('cf.segmentDetail.specificTargets')}
        </Heading>

        <div className={css.subSection}>
          <Text font={{ variation: FontVariation.FORM_LABEL }}>
            {getString('cf.segmentDetail.includeTheFollowing')}:
          </Text>
          <TargetGroupCriteriaTargetListing targets={targetGroup.included} />
        </div>

        <div className={css.subSection}>
          <Text font={{ variation: FontVariation.FORM_LABEL }}>
            {getString('cf.segmentDetail.excludeTheFollowing')}:
          </Text>
          <TargetGroupCriteriaTargetListing targets={targetGroup.excluded} />
        </div>
      </section>

      <section className={css.section}>
        <Heading level={4} font={{ variation: FontVariation.H6 }}>
          {getString('cf.segmentDetail.targetBasedOnCondition')}
        </Heading>

        <TargetGroupCriteriaConditionListing rules={targetGroup.rules} />
      </section>
    </aside>
  )
}

export default TargetGroupCriteria
