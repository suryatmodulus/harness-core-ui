import React from 'react'
import { act, fireEvent, getByRole, render } from '@testing-library/react'
import { noop } from 'lodash-es'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import useCommentModal from '@common/hooks/CommentModal/useCommentModal'

const Wrapped = (): React.ReactElement => {
  const { getComments } = useCommentModal()
  const [message, setMessage] = React.useState<string>('')
  const onBtnClick = () => {
    getComments().then(setMessage).catch(noop)
  }

  return (
    <>
      <p className={'message'}>{message}</p>
      <button className="comments" onClick={onBtnClick} />
    </>
  )
}

describe('useCommentModal Test', () => {
  test('should work as expected', async () => {
    const { container } = render(
      <TestWrapper>
        <Wrapped />
      </TestWrapper>
    )

    //Open dialog
    const commentButton = container.querySelector('.comments')
    await act(async () => {
      fireEvent.click(commentButton!)
    })

    //Confirm the dialog is open and matches snapshot
    let form = findDialogContainer()
    expect(form).toBeTruthy()
    expect(form).toMatchSnapshot()

    //Close dialog with cancel
    await act(async () => {
      fireEvent.click(getByRole(form!, 'button', { name: 'cancel' })!)
    })

    //Confirm the dialog is closed
    expect(findDialogContainer()).toBeFalsy()

    //Open dialog again
    await act(async () => {
      fireEvent.click(commentButton!)
    })

    //Confirm the dialog is open again
    form = findDialogContainer()
    expect(form).toBeTruthy()

    //Enter a comment
    await act(async () => {
      fireEvent.change(form!.querySelector('textarea[name="comments"]')!, { target: { value: 'Some random comment' } })
    })

    //Save comment
    await act(async () => {
      fireEvent.click(getByRole(form!, 'button', { name: 'save' })!)
    })

    //Confirm the dialog is closed and comment is saved
    expect(findDialogContainer()).toBeFalsy()
    expect(container.querySelector('.message')).toHaveTextContent('Some random comment')
  })
})
