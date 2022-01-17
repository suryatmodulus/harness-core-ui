/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { CSSProperties, FC, useMemo } from 'react'
import { FontVariation, FormInput, Layout, SelectOption, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { Segment, Variation } from 'services/cf'
import { CFVariationColors } from '@cf/constants'
import { FeatureFlagBucketBy } from '@cf/utils/CFUtils'
import DistributionBar, { DistributionSegment } from './DistributionBar'

import css from './PercentageRollout.module.scss'

export interface PercentageRolloutProps {
  prefix: (fieldName: string) => string
  targetGroups: Segment[]
  variations: Variation[]
  fieldValues?: {
    variations: { variation: string; weight: string | number }[]
  }
  bucketByAttributes: string[]
}

const PercentageRollout: FC<PercentageRolloutProps> = ({
  prefix,
  targetGroups,
  variations,
  fieldValues,
  bucketByAttributes
}) => {
  const { getString } = useStrings()

  const targetGroupItems = useMemo<SelectOption[]>(
    () => targetGroups.map(({ name, identifier }) => ({ label: name, value: identifier })),
    [targetGroups]
  )

  const bucketByItems = useMemo<SelectOption[]>(
    () => [
      {
        label: getString('name'),
        value: FeatureFlagBucketBy.NAME
      },
      {
        label: getString('identifier'),
        value: FeatureFlagBucketBy.IDENTIFIER
      },
      ...bucketByAttributes
        .filter(attribute => attribute !== FeatureFlagBucketBy.NAME && attribute !== FeatureFlagBucketBy.IDENTIFIER)
        .sort((a, b) => a.localeCompare(b))
        .map(attribute => ({ label: attribute, value: attribute }))
    ],
    [bucketByAttributes]
  )

  const distributionSegments = useMemo<DistributionSegment[]>(
    () =>
      variations.map((variation, index) => {
        const weight = fieldValues?.variations?.[index]?.weight || 0

        return {
          variation,
          weight: typeof weight === 'number' ? weight : parseInt(weight)
        }
      }),
    [variations, fieldValues?.variations]
  )

  const total = useMemo<number>(
    () => distributionSegments.reduce<number>((totalWeight, { weight }) => totalWeight + weight, 0),
    [distributionSegments]
  )

  return (
    <Layout.Vertical spacing="large">
      <FormInput.Select
        className={css.targetGroup}
        name={prefix('clauses[0].values[0]')}
        items={targetGroupItems}
        label={getString('cf.percentageRollout.toTargetGroup')}
      />

      <div className={css.distribution}>
        <FormInput.Select
          className={css.bucketBy}
          inline
          name={prefix('bucketBy')}
          items={bucketByItems}
          label={getString('cf.percentageRollout.bucketBy')}
        />

        <DistributionBar distributionSegments={distributionSegments} />

        <div>{total}%</div>

        {variations.map((variation, index) => {
          const iconColor = { '--variationColor': CFVariationColors[index % CFVariationColors.length] } as CSSProperties

          return (
            <div className={css.variationRow} style={iconColor} key={variation.identifier}>
              <FormInput.Text
                inline
                name={prefix(`variations[${index}].weight`)}
                label={variation.name || variation.identifier}
                inputGroup={{ type: 'number', max: 100, min: 0 }}
              />
            </div>
          )
        })}
      </div>

      {total > 100 && (
        <Text font={{ variation: FontVariation.FORM_MESSAGE_DANGER }}>
          {getString('cf.percentageRollout.invalidTotalError')}
        </Text>
      )}
    </Layout.Vertical>
  )
}

export default PercentageRollout
