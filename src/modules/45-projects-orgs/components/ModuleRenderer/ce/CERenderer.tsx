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

interface CERendererProps {
  data: Project
  isPreview?: boolean
}
const CERenderer: React.FC<CERendererProps> = ({ isPreview }) => {
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
          <Icon name="ce-main" size={35} />
        </Container>
        <Container width="70%" flex={{ align: 'center-center' }}>
          <Layout.Vertical flex={{ align: 'center-center' }}>
            {/* <Layout.Horizontal flex={{ align: 'center-center' }} className={css.activityChart} spacing="xxlarge">
              <SparkChart data={[2, 3, 4, 5, 4, 3, 2]} />
              <Text color={Color.GREY_400} font={{ size: 'medium' }}>
                {'23'}
              </Text>
            </Layout.Horizontal> */}
            {isPreview ? (
              <Text color={Color.GREY_500} font={{ size: 'xsmall' }} className={css.moduleLink}>
                {getString('projectsOrgs.gotoCloudCosts')}
              </Text>
            ) : (
              <Link
                to={routes.toCEHome({
                  accountId
                })}
              >
                <Text color={Color.PRIMARY_6} font={{ size: 'xsmall' }} className={css.moduleLink}>
                  {/* {getString('projectCard.ceRendererText')} */}
                  {getString('projectsOrgs.gotoCloudCosts')}
                </Text>
              </Link>
            )}
          </Layout.Vertical>
        </Container>
      </Layout.Horizontal>
    </Container>
  )
}

export default CERenderer
