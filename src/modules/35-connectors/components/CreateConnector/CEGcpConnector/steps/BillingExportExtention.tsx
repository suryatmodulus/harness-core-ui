import React from 'react'
import { Container, Layout } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import css from '../CreateCeGcpConnector.module.scss'

const BillingExportExtention: React.FC = () => {
  const { getString } = useStrings()

  return (
    <Container className={css.extention}>
      <Layout.Vertical spacing="medium">
        <h2>{getString('connectors.ceGcp.billingExtention.heading')}</h2>
        <div>
          <span className={css.prereq}>{getString('connectors.ceGcp.billingExtention.prerequisite')}</span>{' '}
          <a>{getString('connectors.ceGcp.billingExtention.readMore')}</a>{' '}
        </div>
        <ol>
          <li>{getString('connectors.ceGcp.billingExtention.step1')}</li>
          <li>{getString('connectors.ceGcp.billingExtention.step2')}</li>
          <li>
            {getString('connectors.ceGcp.billingExtention.step3.p1')}{' '}
            <span className={css.gray}>{getString('connectors.ceGcp.billingExtention.step3.p2')}</span>
            {getString('connectors.ceGcp.billingExtention.step3.p3')}
          </li>
          <li>{getString('connectors.ceGcp.billingExtention.step4')}</li>
          <li>{getString('connectors.ceGcp.billingExtention.step5')}</li>
          <li>{getString('connectors.ceGcp.billingExtention.step6')}</li>
          <li>{getString('connectors.ceGcp.billingExtention.step7')}</li>
        </ol>
        <div>
          <div> {getString('connectors.ceGcp.billingExtention.otherLinks')}</div>
          <ul>
            <li>
              <a>{getString('connectors.ceGcp.billingExtention.link1')}</a>
            </li>
            <li>
              <a>{getString('connectors.ceGcp.billingExtention.link2')}</a>
            </li>
          </ul>
        </div>
      </Layout.Vertical>
    </Container>
  )
}

export default BillingExportExtention
