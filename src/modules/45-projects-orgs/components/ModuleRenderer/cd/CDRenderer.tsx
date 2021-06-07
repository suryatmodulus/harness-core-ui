import React from 'react'
import {
  Text,
  Color,
  Container,
  Layout,
  Icon
  // SparkChart
} from '@wings-software/uicore'
import { useParams, Link } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { Project } from 'services/cd-ng'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import css from '../ModuleRenderer.module.scss'

interface CDRendererProps {
  data: Project
  isPreview?: boolean
}
const CDRenderer: React.FC<CDRendererProps> = ({ data, isPreview }) => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  return (
    <Container
      border={{ top: true, color: Color.GREY_250 }}
      padding={{ top: 'medium', bottom: 'medium' }}
      className={css.moduleContainer}
    >
      <Layout.Horizontal>
        <Container width="30%" border={{ right: true, color: Color.GREY_250 }} flex={{ align: 'center-center' }}>
          <Icon name="cd-main" size={35} />
        </Container>
        <Container width="70%" flex={{ align: 'center-center' }}>
          <Layout.Vertical flex={{ align: 'center-center' }}>
            {/* <Layout.Horizontal flex={{ align: 'center-center' }} className={css.activityChart} spacing="xxlarge">
              <SparkChart data={[2, 3, 4, 5, 4, 3, 2]} />
              <Text color={Color.GREY_400} font={{ size: 'medium' }}>
                {'40'}
              </Text>
            </Layout.Horizontal> */}
            {isPreview ? (
              <Text color={Color.GREY_500} font={{ size: 'xsmall' }} className={css.moduleLink}>
                {getString('projectsOrgs.gotoDeployments')}
              </Text>
            ) : (
              <Link
                to={routes.toDeployments({
                  orgIdentifier: data.orgIdentifier || /* istanbul ignore next */ '',
                  projectIdentifier: data.identifier,
                  module: 'cd',
                  accountId
                })}
              >
                <Text color={Color.PRIMARY_6} font={{ size: 'xsmall' }} className={css.moduleLink}>
                  {/* {getString('projectCard.cdRendererText')} */}
                  {getString('projectsOrgs.gotoDeployments')}
                </Text>
              </Link>
            )}
          </Layout.Vertical>
        </Container>
      </Layout.Horizontal>
    </Container>
  )
}

export default CDRenderer
