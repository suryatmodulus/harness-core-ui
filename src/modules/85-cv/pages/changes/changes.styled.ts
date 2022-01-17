/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import styled from '@emotion/styled'

const ChangesHeader = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: ${(props: any) => props?.height || '64px'};
  background: var(--white);
  border-bottom: 1px solid var(--grey-200);
  padding: var(--spacing-medium) var(--spacing-xxxlarge);
  p {
    font-weight: 600;
    font-size: 24px;
    line-height: 32px;
    margin-top: 3px;
    text-transform: capitalize;
  }
`
ChangesHeader.displayName = 'ChangesHeader'

const ChangeTimeLineHeader = styled.div`
  background: var(--white);
  border-bottom: 1px solid var(--grey-200);
`
ChangeTimeLineHeader.displayName = 'ChangeTimeLineHeader'

const PBody = styled.div`
  margin: 2%;
`
PBody.displayName = 'PBody'

export { ChangesHeader, ChangeTimeLineHeader, PBody }
