import React from 'react'
import { noop } from 'lodash-es'
import { render, fireEvent } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import { TestWrapper } from '@common/utils/testUtils'
import CreateCVNotification from '../CreateCVNotification'

describe('Create CV Notification Rule', () => {
  test('should render', async () => {
    const { container, getByText } = render(
      <TestWrapper pathParams={{ accountId: 'dummy' }}>
        <CreateCVNotification
          onSuccess={jest.fn()}
          hideModal={noop}
          isEditMode={false}
          projectIdentifier="projectIdentifier"
          orgIdentifier="org"
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    expect(getByText('cv.admin.notifications.create.method')).toBeDefined()

    setFieldValue({ type: InputTypes.TEXTFIELD, container: container, fieldId: 'name', value: 'dummy name' })

    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })
    expect(getByText('cv.admin.notifications.create.validation.type')).toBeDefined()
    expect(container).toMatchSnapshot()
  })
})
