import React from 'react'
import cx from 'classnames'
import { Button, Container, Layout, Text } from '@wings-software/uicore'
import type {
  PipelinePathProps,
  ProjectPathProps,
  PathFn,
  PipelineType,
  PipelineStudioQueryParams
} from '@common/interfaces/RouteInterfaces'

import { String } from 'framework/strings'
import type { PipelineInfoConfig } from 'services/cd-ng'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { PipelineCanvas } from './PipelineCanvas/PipelineCanvas'
import { PipelineContext } from './PipelineContext/PipelineContext'
import { PipelineSchemaContextProvider } from './PipelineSchema/PipelineSchemaContext'
import css from './PipelineStudio.module.scss'

export interface PipelineStudioProps {
  className?: string
  title?: string
  onClose?: () => void
  routePipelineStudio: PathFn<PipelineType<PipelinePathProps> & PipelineStudioQueryParams>
  routePipelineDetail: PathFn<PipelineType<PipelinePathProps>>
  routePipelineList: PathFn<PipelineType<ProjectPathProps>>
  routePipelineProject: PathFn<PipelineType<ProjectPathProps>>
  getOtherModal?: (
    onSubmit: (values: PipelineInfoConfig) => void,
    onClose: () => void
  ) => React.ReactElement<OtherModalProps>
}

interface PipelineStudioState {
  error?: Error
}

interface OtherModalProps {
  onSubmit?: (values: PipelineInfoConfig) => void
  initialValues?: PipelineInfoConfig
  onClose?: () => void
}
export class PipelineStudio extends React.Component<PipelineStudioProps, PipelineStudioState> {
  state: PipelineStudioState = { error: undefined }
  context!: React.ContextType<typeof PipelineContext>
  static contextType = PipelineContext

  componentDidCatch(error: Error): boolean {
    this.setState({ error })
    if (window?.bugsnagClient?.notify) {
      window?.bugsnagClient?.notify(error)
    }
    return false
  }

  render(): JSX.Element {
    const { error } = this.state
    const { deletePipelineCache } = this.context
    if (error) {
      return (
        <Layout.Vertical spacing="medium" padding="large">
          <Text>
            <String stringID="errorTitle" />
          </Text>
          <Text>
            <String stringID="errorSubtitle" />
          </Text>
          <Layout.Horizontal style={{ alignItems: 'baseline' }}>
            <Text>
              <String stringID="please" />
            </Text>
            <Button
              onClick={() => {
                return deletePipelineCache().then(() => {
                  window.location.reload()
                })
              }}
              minimal
            >
              <String stringID="clickHere" />
            </Button>
            <Text>
              <String stringID="errorHelp" />
            </Text>
          </Layout.Horizontal>
          {__DEV__ && (
            <React.Fragment>
              <Text font="small">Error Message</Text>
              <Container>
                <details>
                  <summary>Stacktrace</summary>
                  <pre>{error.stack}</pre>
                </details>
              </Container>
            </React.Fragment>
          )}
        </Layout.Vertical>
      )
    }
    const {
      className = '',
      routePipelineStudio,
      routePipelineDetail,
      routePipelineList,
      routePipelineProject,
      getOtherModal
    } = this.props
    return (
      <PipelineSchemaContextProvider>
        <GitSyncStoreProvider>
          <div className={cx(css.container, className)}>
            <PipelineCanvas
              toPipelineStudio={routePipelineStudio}
              toPipelineDetail={routePipelineDetail}
              toPipelineList={routePipelineList}
              toPipelineProject={routePipelineProject}
              getOtherModal={getOtherModal}
            />
          </div>
        </GitSyncStoreProvider>
      </PipelineSchemaContextProvider>
    )
  }
}
