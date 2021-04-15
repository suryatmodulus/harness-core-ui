import React from 'react'
import { render } from '@testing-library/react'
import { Formik, FormikForm } from '@wings-software/uicore'
import { renderHook } from '@testing-library/react-hooks'
import { TestWrapper } from '@common/utils/testUtils'
import { useStrings } from 'framework/exports'
import { NameIdDescriptionTags } from '@common/components'
import type { FormikForNameIdDescriptionTags } from '../NameIdDescriptionTagsConstants'

const wrapper = ({ children }: React.PropsWithChildren<{}>): React.ReactElement => <TestWrapper>{children}</TestWrapper>
const { result } = renderHook(() => useStrings(), { wrapper })

const onEditInitialValues: FormikForNameIdDescriptionTags = {
  name: 'name-123',
  identifier: 'name123',
  description: 'test description',
  tags: {
    test123: 'abc'
  }
}

function WrapperComponent(props: { initialValues: FormikForNameIdDescriptionTags }): JSX.Element {
  const { initialValues } = props || {}
  return (
    <TestWrapper>
      <Formik initialValues={initialValues} onSubmit={() => undefined}>
        {formikProps => (
          <FormikForm>
            <NameIdDescriptionTags formikProps={formikProps} />
          </FormikForm>
        )}
      </Formik>
    </TestWrapper>
  )
}

describe('NameIdDescriptionTags  tests', () => {
  describe('Renders/snapshots', () => {
    test('Initial Render - Name, ID, Description, and Tags', async () => {
      const { container } = render(<WrapperComponent initialValues={{}} />)
      expect(result.current.getString('name')).not.toBeNull()
      expect(container).toMatchSnapshot()
    })

    test('On Edit Render - Name, ID, Description, and Tags', async () => {
      const { container } = render(<WrapperComponent initialValues={onEditInitialValues} />)
      expect(result.current.getString('description')).not.toBeNull()
      expect(result.current.getString('tagsLabel')).not.toBeNull()
      expect(container).toMatchSnapshot()
    })

    test('Should display warning message when length of value for name reaches 63', async () => {
      const { getByText } = render(
        <WrapperComponent
          initialValues={{
            name: 'name-123 vldjvldkj dlvjdlvkj vljdlkvjd vlmdlfvm vlmdlkvj dlvdkl',
            identifier: 'name123',
            description: 'test description',
            tags: {
              test123: 'abc'
            }
          }}
        />
      )

      expect(result.current.getString('name')).not.toBeNull()
      expect(getByText('Limit of 63 characters is reached for name')).not.toBeNull()
    })
  })
})
