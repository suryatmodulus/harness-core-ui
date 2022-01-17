import React, { ReactElement } from 'react'
import usePlanEnforcement from '@cf/hooks/usePlanEnforcement'
import RbacOptionsMenuButton from '@rbac/components/RbacOptionsMenuButton/RbacOptionsMenuButton'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { PermissionIdentifier, ResourceType } from 'microfrontends'
import { useStrings } from 'framework/strings'

export interface SegmentDetailsPageOptionsMenuProps {
  deleteSegmentConfirm: () => void
  activeEnvironment: string
}

const SegmentDetailsPageOptionsMenu = (props: SegmentDetailsPageOptionsMenuProps): ReactElement => {
  const { activeEnvironment, deleteSegmentConfirm } = props
  const { isPlanEnforcementEnabled } = usePlanEnforcement()
  const { getString } = useStrings()

  const planEnforcementProps = isPlanEnforcementEnabled
    ? {
        featuresProps: {
          featuresRequest: {
            featureNames: [FeatureIdentifier.MAUS]
          }
        }
      }
    : undefined

  return (
    <RbacOptionsMenuButton
      items={[
        {
          icon: 'cross',
          text: getString('delete'),
          onClick: deleteSegmentConfirm,
          permission: {
            resource: { resourceType: ResourceType.ENVIRONMENT, resourceIdentifier: activeEnvironment },
            permission: PermissionIdentifier.DELETE_FF_TARGETGROUP
          },
          ...planEnforcementProps
        }
      ]}
    />
  )
}

export default SegmentDetailsPageOptionsMenu
