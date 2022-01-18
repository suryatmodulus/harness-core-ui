/*
 * Copyright 2020 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const getDefaultProps = () => ({
  formikInitialProps: { initialValues: {}, onSubmit: jest.fn(), validate: jest.fn() },
  onHide: jest.fn(),
  wizardMap: {
    wizardLabel: 'Wizard Title',
    panels: [
      {
        id: 'Panel 1',
        tabTitle: 'Panel 1',
        requiredFields: ['name']
      },
      {
        id: 'Panel 2',
        tabTitle: 'Panel 2',
        checkValidPanel: (formikValues: any) => {
          const numberOnlyFieldValue = formikValues['numberOnly']
          return !numberOnlyFieldValue || !isNaN(numberOnlyFieldValue)
        }
      },
      {
        id: 'Panel 3',
        tabTitle: 'Panel 3'
      }
    ]
  }
})
