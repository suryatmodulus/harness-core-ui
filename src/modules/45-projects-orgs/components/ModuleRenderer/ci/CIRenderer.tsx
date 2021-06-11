import React from 'react'
import { Text, Color, Container, Layout, Icon } from '@wings-software/uicore'
import { useHistory, useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import type { Project } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import css from '../ModuleRenderer.module.scss'

interface CIRendererProps {
  data: Project
  isPreview?: boolean
}
const CIRenderer: React.FC<CIRendererProps> = ({ data, isPreview }) => {
  const history = useHistory()
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()

  return (
    <Container
      border={{ top: true, color: Color.GREY_250 }}
      padding={{ top: 'medium', bottom: 'medium' }}
      className={css.moduleContainer}
      onClick={() => {
        !isPreview &&
          history.push(
            routes.toDeployments({
              orgIdentifier: data.orgIdentifier || /* istanbul ignore next */ '',
              projectIdentifier: data.identifier,
              module: 'ci',
              accountId
            })
          )
      }}
    >
      <Layout.Horizontal>
        <Container width="30%" border={{ right: true, color: Color.GREY_250 }} flex={{ align: 'center-center' }}>
          <Icon name="ci-main" size={30} />
        </Container>
        <Container width="70%" flex={{ align: 'center-center' }}>
          <Layout.Vertical flex={{ align: 'center-center' }}>
            {/* <Layout.Horizontal flex={{ align: 'center-center' }} className={css.activityChart} spacing="xxlarge">
              <SparkChart data={[2, 3, 4, 5, 4, 3, 2]} />
              <Text color={Color.GREY_400} font={{ size: 'medium' }}>
                {'88'}
              </Text>
            </Layout.Horizontal> */}
            <Text color={Color.PRIMARY_7} font={{ size: 'xsmall' }} className={css.moduleText}>
              {getString('projectsOrgs.gotoBuilds')}
            </Text>
          </Layout.Vertical>
        </Container>
      </Layout.Horizontal>
    </Container>
  )
}

export default CIRenderer
