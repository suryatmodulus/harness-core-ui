/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { UseStringsReturn } from 'framework/strings'
import type { CreateGroupName } from './GroupName.types'

export function validate(
  values: CreateGroupName,
  groupNames: SelectOption[],
  getString: UseStringsReturn['getString']
): { [key: string]: string } {
  const errors: { [key: string]: string } = {}
  if (!values.name?.trim().length) {
    errors.name = getString('cv.onboarding.selectProductScreen.validationText.name')
  } else if (groupNames.filter(name => name.value === values.name).length) {
    errors.name = getString('cv.monitoringSources.prometheus.validation.uniqueName', { existingName: values.name })
  }
  return errors
}
