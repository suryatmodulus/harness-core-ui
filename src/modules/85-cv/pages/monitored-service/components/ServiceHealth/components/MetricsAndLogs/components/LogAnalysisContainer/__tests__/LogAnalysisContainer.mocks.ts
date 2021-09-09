export const mockedLogAnalysisData = {
  resource: {
    totalPages: 1,
    totalItems: 1,
    pageItemCount: 1,
    pageSize: 10,
    content: [
      {
        projectIdentifier: 'Harshil',
        orgIdentifier: 'default',
        environmentIdentifier: 'Environment_102',
        serviceIdentifier: 'Service_102',
        logData: {
          text: 'prod-setup-205416',
          label: 0,
          count: 1,
          trend: [
            {
              timestamp: 1630567200000,
              count: 1
            }
          ],
          tag: 'KNOWN'
        }
      },
      {
        projectIdentifier: 'Harshil',
        orgIdentifier: 'default',
        environmentIdentifier: 'Environment_102',
        serviceIdentifier: 'Service_102',
        logData: {
          text: 'prod-setup-205416',
          label: 0,
          count: 1,
          trend: [
            {
              timestamp: 1630567200000,
              count: 1
            }
          ],
          tag: 'UNKNOWN'
        }
      },
      {
        projectIdentifier: 'Harshil',
        orgIdentifier: 'default',
        environmentIdentifier: 'Environment_102',
        serviceIdentifier: 'Service_102',
        logData: {
          text: 'prod-setup-205416',
          label: 0,
          count: 1,
          trend: [
            {
              timestamp: 1630567200000,
              count: 1
            }
          ],
          tag: 'UNEXPECTED'
        }
      }
    ],
    pageIndex: 0,
    empty: false
  }
}
