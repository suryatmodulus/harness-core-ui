import React, { FC, useMemo } from 'react'
import { get } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { Target, Variation } from 'services/cf'
import type { FlagConfigurationStepFormDataValues } from '@cf/components/PipelineSteps/FlagConfigurationStep/types'
import SubSection, { SubSectionProps } from '../SubSection'
import ServeVariationToItem from './ServeVariationToItem'
import { CFPipelineInstructionType } from '../../types'

export interface ServeVariationToIndividualTargetProps extends SubSectionProps {
  setField: (fieldName: string, value: unknown) => void
  prefix: (fieldName: string) => string
  variations?: Variation[]
  targets?: Target[]
  fieldValues?: FlagConfigurationStepFormDataValues
}

const ServeVariationToIndividualTarget: FC<ServeVariationToIndividualTargetProps> = ({
  fieldValues = {},
  variations = [],
  targets = [],
  setField,
  prefix,
  ...props
}) => {
  const { getString } = useStrings()

  const selectedTargets = useMemo<Target[]>(() => {
    const selectedTargetIds = get(fieldValues, prefix('spec.targets'))

    if (!Array.isArray(targets) || !Array.isArray(selectedTargetIds) || selectedTargetIds.length === 0) {
      return []
    }

    return targets.filter(({ identifier }) => selectedTargetIds.includes(identifier))
  }, [targets, fieldValues])

  return (
    <SubSection data-testid="flagChanges-serveVariationToIndividualTarget" {...props}>
      <ServeVariationToItem
        dialogTitle={getString('cf.pipeline.flagConfiguration.addEditVariationToSpecificTargets')}
        itemLabel={getString('cf.shared.targets')}
        itemPlaceholder={getString('cf.pipeline.flagConfiguration.enterTarget')}
        itemFieldName="targets"
        serveItemString={getString('cf.featureFlags.toTarget')}
        serveItemsString={getString('cf.pipeline.flagConfiguration.toTargets')}
        setField={setField}
        items={targets}
        selectedItems={selectedTargets}
        variations={variations}
        selectedVariationId={get(fieldValues, prefix('spec.variation'))}
        instructionType={CFPipelineInstructionType.ADD_TARGETS_TO_VARIATION_TARGET_MAP}
      />
    </SubSection>
  )
}

export default ServeVariationToIndividualTarget
