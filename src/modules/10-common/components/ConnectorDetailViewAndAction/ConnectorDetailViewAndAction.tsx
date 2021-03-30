import React, { useState } from 'react'
import { Color, Container, Layout, Text, Icon, Link } from '@wings-software/uicore'
import { getMagicLink } from '@common/utils/MagicLinkUtils'
import { ResourceType } from '@common/interfaces/ResourceType'

const ConnectorDetailViewAndAction = (props) => {


    return (
        <Layout.Horizontal>
            <Layout.Vertical>
                <Layout.Horizontal spacing="small" width={230}>
                    {
                        getMagicLink(ResourceType.CONNECTOR, props, props.identifier) ?
                            <Link href={getMagicLink(ResourceType.CONNECTOR, props, props.identifier)}>Factory Test</Link> :
                            <Text color={Color.BLACK} lineClamp={1}>
                                Factory Test
                </Text>
                    }


                </Layout.Horizontal>
                <Text color={Color.GREY_400} width={230} lineClamp={1}>
                    connector
        </Text>
            </Layout.Vertical>
        </Layout.Horizontal>

    )
}

export default ConnectorDetailViewAndAction
