import styled from '@emotion/styled'

const MonitoringServicesHeader = styled.div`
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
    color: var(--black) !important;
    text-transform: capitalize;
  }
`
MonitoringServicesHeader.displayName = 'MonitoringServicesHeader'

export { MonitoringServicesHeader }
