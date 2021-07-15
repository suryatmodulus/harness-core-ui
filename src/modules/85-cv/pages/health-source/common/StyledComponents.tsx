import styled from '@emotion/styled'
import { Layout } from '@wings-software/uicore'

const HorizontalLayout = styled(Layout.Horizontal)`
  display: flex;
  justify-content: space-between;
  ${(props: any) => `align-items: ${props?.alignItem}`};
`

const BGColorWrapper = styled.div`
  background: var(--form-bg);
`
BGColorWrapper.displayName = 'BGColorWrapper'

export { HorizontalLayout, BGColorWrapper }
