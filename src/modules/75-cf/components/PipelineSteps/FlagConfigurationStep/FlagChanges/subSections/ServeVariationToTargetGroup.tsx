import React, { FC, useMemo } from 'react'
import { get } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { Segment, Variation } from 'services/cf'
import type { FlagConfigurationStepFormDataValues } from '@cf/components/PipelineSteps/FlagConfigurationStep/types'
import SubSection, { SubSectionProps } from '../SubSection'
import ServeVariationToItem from './ServeVariationToItem'
import { CFPipelineInstructionType } from '../../types'

export interface ServeVariationToTargetGroupProps extends SubSectionProps {
  setField: (fieldName: string, value: unknown) => void
  prefix: (fieldName: string) => string
  variations?: Variation[]
  targetGroups?: Segment[]
  fieldValues?: FlagConfigurationStepFormDataValues
}

const ServeVariationToTargetGroup: FC<ServeVariationToTargetGroupProps> = ({
  fieldValues = {},
  variations = [],
  targetGroups = [],
  setField,
  prefix,
  ...props
}) => {
  const { getString } = useStrings()

  const selectedTargetGroups = useMemo<Segment[]>(() => {
    const selectedTargetGroupIds = get(fieldValues, prefix('spec.segments'))

    if (!Array.isArray(targetGroups) || !Array.isArray(selectedTargetGroupIds) || selectedTargetGroupIds.length === 0) {
      return []
    }

    return targetGroups.filter(({ identifier }) => selectedTargetGroupIds.includes(identifier))
  }, [targetGroups, fieldValues])

  return (
    <SubSection data-testid="flagChanges-serveVariationToTargetGroup" {...props}>
      <ServeVariationToItem
        dialogTitle={getString('cf.pipeline.flagConfiguration.addEditVariationToTargetGroups')}
        itemLabel={getString('cf.shared.segments')}
        itemPlaceholder={getString('cf.pipeline.flagConfiguration.enterTargetGroup')}
        itemFieldName="segments"
        serveItemString={getString('cf.pipeline.flagConfiguration.toTargetGroup')}
        serveItemsString={getString('cf.pipeline.flagConfiguration.toTargetGroups')}
        setField={setField}
        items={targetGroups}
        selectedItems={selectedTargetGroups}
        variations={variations}
        selectedVariationId={get(fieldValues, prefix('spec.variation'))}
        instructionType={CFPipelineInstructionType.ADD_SEGMENT_TO_VARIATION_TARGET_MAP}
      />
    </SubSection>
  )
}

export default ServeVariationToTargetGroup
