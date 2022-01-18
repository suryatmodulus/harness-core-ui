/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@wings-software/uicore'
import type { ResponsePageUserJourneyResponse } from 'services/cv'

export function getUserJourneysData(userJourneysData: ResponsePageUserJourneyResponse | null): SelectOption[] {
  return (userJourneysData?.data?.content?.map(el => ({
    label: el?.userJourney?.name,
    value: el?.userJourney?.identifier
  })) || []) as SelectOption[]
}
