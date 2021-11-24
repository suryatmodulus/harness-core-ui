
import React, {useState} from "react";

import css from "@resource-center/components/ResourceCenter/ResourceCenter.module.scss";
import {Button, Color, DropDown, FontVariation, Layout, Text, TextInput} from "@wings-software/uicore";
import type {PaddingProps} from "@wings-software/uicore/dist/styled-props/padding/PaddingProps";
//const


export const SubmitTicket = () => {

    const categoryTypes = ['Problem','Question','Feature request','Other'].map(item => {
        return {
            label: item,
            value:item
        }
    });
    const url = window.location.href;
    const [category, setCategory] = useState(categoryTypes[0].value);
    const [email, setEmail] = useState('')
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    console.log(url)


    const commonPadding = {left: 'xlarge', right: 'xlarge', bottom: 'large'} as PaddingProps;
    const fontProps = {font : {variation: FontVariation.SMALL_SEMI},color: Color.WHITE,  padding: {bottom: 'xsmall'}};


    return (
        <Layout.Vertical width={440} className={css.resourceCenter}>
            <Layout.Vertical padding={'large'} flex={{ alignItems: 'baseline' }}>
                <Text color={Color.WHITE} padding={{ bottom: 'medium' }}>
                    {'SUBMIT A TICKET'}
                </Text>
            </Layout.Vertical>
            <Layout.Vertical padding={commonPadding}>
                <Text font={{variation: FontVariation.SMALL_SEMI}} color={Color.WHITE} padding={{bottom: 'xsmall'}} >
                    {'Feedback Category'}
                </Text>
                <DropDown value={category} onChange={(selected) => setCategory(selected.label)} items={categoryTypes} width={125}/>
            </Layout.Vertical >
            <Layout.Vertical padding={commonPadding} width={192}>
                <Text {...fontProps}>
                    {'Email Address'}
                </Text>
                <TextInput defaultValue={email} placeholder={'develop@example.com'} onChange={(ch :React.ChangeEvent<HTMLInputElement>) => setEmail(ch.target.value.trim())} width={195}/>
            </Layout.Vertical>
            <Layout.Vertical padding={commonPadding}>
                <Text {...fontProps}>
                    {'Subject'}
                </Text>
                <TextInput defaultValue={subject} onChange={(ch :React.ChangeEvent<HTMLInputElement>) => setSubject(ch.target.value.trim())}/>
            </Layout.Vertical>
            <Layout.Vertical padding={commonPadding}>
                <Text {...fontProps}>
                    {'Message'}
                </Text>
                <TextInput defaultValue={message} onChange={(ch :React.ChangeEvent<HTMLInputElement>) => setMessage(ch.target.value.trim())} height={85} />
            </Layout.Vertical>
            <Layout.Vertical>
                <Text font={{variation: FontVariation.SMALL_SEMI}}>
                    {'Priority'}
                </Text>
            </Layout.Vertical>

<Button >
    Submit a ticket
</Button>


        </Layout.Vertical>
    )
}
