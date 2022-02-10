import CmsLayout from './cms-layout'
import { useRouter } from 'next/router'
import React, { Fragment, useEffect, useState } from 'react'
import Head from 'next/head'
import { useDispatch, useSelector } from 'react-redux'
import {
  getConfigUrlFromCmsPageUrl,
  getTemplateUrl,
  isCreatePageUrl,
  isEditPageUrl,
  isFolderPageUrl,
  isPageUrl,
  getSessionGithubToken,
  isImageUrl
} from './utils'
import FilePage from './file-page'
import Link from 'next/link'
import FolderPage from './folder-page'
import { setGithubToken } from '../redux/actions'
import { RemoteContext } from './contexts'
import SignIn from './sign-in'
import ImageResources from './image-resources'

export default function Cms({ children, owner, repo }) {
  // TODO: get the token from our auth server, revmoe this sniipet, api, and .env
  const githubToken = useSelector(state => state.reducer.githubToken)
  const loggedIn = githubToken != null
  let dispatch = useDispatch()

  const router = useRouter()
  const pages = React.Children.toArray(children)
  const allPageStaticProps = useSelector(state => state.reducer.pageStaticProps)
  const needRedirect = pages.some(
    page => allPageStaticProps[page.type.cmsConfig.url] == null
  )

  useEffect(() => {
    if (router.isReady) {
      if (!githubToken) {
        const sessionGithubToken = getSessionGithubToken()
        if (sessionGithubToken) {
          dispatch(setGithubToken(sessionGithubToken))
        }
      }
      else if (needRedirect) {
        const redirectPromises = pages.map(page => {
          return router.replace({
            pathname: getTemplateUrl(page.type.cmsConfig),
            query: { persistProps: true }
          })
        })
        Promise.allSettled(redirectPromises).then(() =>
          router.replace(router.asPath)
        )
      }
    }
  })

  useEffect(() => {
    document.querySelector('html').style.lineHeight = 1.5
    document.querySelector('html').style.fontSize = '16px'
    document.body.style.margin = 0
    document.body.style.fontFamily = //TODO: use noto sans
      '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif'
    document.body.style.background = '#F7F9FC'
    document.body.style.color = 'rgb(108, 117, 125)'
    return () => {
      document.querySelector('html').style = ''
      document.body.style = ''
    }
  })

  let layout;
  if (!loggedIn) {
    layout = <SignIn />
  }
  else if (needRedirect) {
    layout = <div>Waiting for redirect...</div>
  }
  else if (isPageUrl(router.asPath)) {
    let content = <div>Page not found</div>
    const configUrl = getConfigUrlFromCmsPageUrl(router.asPath)
    const page = pages.find(page => configUrl === page.type.cmsConfig.url)
    if (page && (isEditPageUrl(router.asPath) || isCreatePageUrl(router.asPath))) {
      content = <FilePage page={page} key={new Date().getTime()} />;
    }
    else if (page && isFolderPageUrl(router.asPath)) {
      content = <FolderPage page={page} key={new Date().getTime()} />
    }
    layout = (
      <CmsLayout pages={pages}>
        <Head>{/* TODO: 1. don't index this page. 2. add title */}</Head>
        {content}
      </CmsLayout>);
  }
  else if (isImageUrl(router.asPath)) {
    console.log('123')
    layout = (
      <CmsLayout pages={pages}>
        <Head>{/* TODO: 1. don't index this page. 2. add title */}</Head>
        <ImageResources key={new Date().getTime()}/>
      </CmsLayout>);
  }
  else {
    layout = (
      <CmsLayout pages={pages}>
        <Head>{/* TODO: 1. don't index this page. 2. add title */}</Head>
        <div>Not found</div>
      </CmsLayout>);
  }
  return (
    <RemoteContext.Provider value={{ owner, repo }}>
      {layout}
    </RemoteContext.Provider>
  )
}
