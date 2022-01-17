/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useStrings } from 'framework/strings'
import { DelegateTypes } from '@delegates/constants'

export const GetDelegateTitleTextByType = (type: string): string => {
  const { getString } = useStrings()

  switch (type) {
    case DelegateTypes.KUBERNETES_CLUSTER:
      return getString('kubernetesText')
    default:
      /* istanbul ignore next */
      return ''
  }
}
