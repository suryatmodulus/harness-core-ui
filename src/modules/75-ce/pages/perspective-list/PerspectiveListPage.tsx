import React from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { Layout, Button, Container } from '@wings-software/uicore'
import routes from '@common/RouteDefinitions'
import { Page } from '@common/components/Page/Page'
import { useToaster } from '@common/components'
import { useCreatePerspective, CEView } from 'services/ce'
import { useFetchAllPerspectivesQuery } from 'services/ce/services'
import { generateId, CREATE_CALL_OBJECT } from '@ce/utils/perspectiveUtils'
import PerspectiveListView from '@ce/components/PerspectiveListView/PerspectiveListView'
import css from './PerspectiveListPage.module.scss'

const PerspectiveListPage: React.FC = () => {
  const [result] = useFetchAllPerspectivesQuery()
  const history = useHistory()
  const { accountId } = useParams<{
    accountId: string
  }>()
  const { data, fetching } = result

  const { showError } = useToaster()

  const { mutate: createView } = useCreatePerspective({
    queryParams: {
      accountId: accountId
    }
  })

  const createNewPerspective: (values: Record<string, string>) => void = async (values = {}) => {
    let formData: Record<string, any> = {
      ...values,
      viewVersion: 'v1'
    }

    formData['name'] = `Perspective-${generateId(6).toUpperCase()}`
    formData = { ...CREATE_CALL_OBJECT, ...formData }

    const { resource } = await createView(formData as CEView)

    const uuid = resource?.uuid

    // Need to handle error states - Cloning as well

    if (uuid) {
      history.push(
        routes.toCECreatePerspective({
          accountId: accountId,
          perspectiveId: uuid
        })
      )
    } else {
      showError("Can't create perspective")
    }

    // if (error) {
    //   if (toBeCloned) {
    //     toBeCloned = null
    //     setError && setError(error)
    //   } else {
    //     toaster.show({ message: error, timeout: 3000, intent: 'danger' })
    //   }
    // } else if (createViews) {
    //   if (toBeCloned) {
    //     props?.hide()
    //     toBeCloned = null
    //   }
    //   if (createViews?.uuid) {
    //     props.router.push(
    //       props.path.toCreateCloudViews({
    //         accountId: props.urlParams.accountId,
    //         viewId: createViews?.uuid
    //       })
    //     )
    //   }
    // }
  }

  const navigateToPerspectiveDetailsPage: (perspectiveId: string) => void = perspectiveId => {
    history.push(
      routes.toPerspectiveDetails({
        accountId: accountId,
        perspectiveId: perspectiveId,
        perspectiveName: perspectiveId
      })
    )
  }

  const pespectiveList = data?.perspectives?.customerViews || []
  return (
    <>
      <Page.Header title="Perspectives" />
      <Layout.Horizontal spacing="large" className={css.header}>
        <Button
          intent="primary"
          text="New Perspective"
          icon="plus"
          onClick={() => {
            createNewPerspective({})
          }}
        />
      </Layout.Horizontal>
      <Page.Body>
        {fetching && <Page.Spinner />}
        <Container padding="xxxlarge">
          {pespectiveList ? (
            <PerspectiveListView
              pespectiveData={pespectiveList}
              navigateToPerspectiveDetailsPage={navigateToPerspectiveDetailsPage}
            />
          ) : null}
        </Container>
        {/* <Layout.Vertical>
          {pespectiveList.map(perspective => (
            <Link
              to={routes.toPerspectiveDetails({
                perspectiveId: perspective?.id || '',
                perspectiveName: perspective?.name || '',
                accountId
              })}
              key={perspective?.id}
            >
              {perspective?.name}
            </Link>
          ))} */}
        {/* </Layout.Vertical> */}
      </Page.Body>
    </>
  )
}

export default PerspectiveListPage
