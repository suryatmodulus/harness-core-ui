import React from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { Layout } from '@wings-software/uicore'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import css from './HeaderContent.module.scss'

const HeaderContent: React.FC = () => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()

  return (
    <Layout.Horizontal>
      <NavLink to={routes.toAccountConfiguration({ accountId })} className={css.tags} activeClassName={css.activeTag}>
        {getString('configuration')}
      </NavLink>
      <NavLink to={routes.toAccountActivityLog({ accountId })} className={css.tags} activeClassName={css.activeTag}>
        {getString('activityLog')}
      </NavLink>
    </Layout.Horizontal>
  )
}

export default HeaderContent
