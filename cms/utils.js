import { TEMPLATE_FILE_NAME } from './interface'
import utf8 from 'utf8'
import { SESSION_GITHUB_TOKEN } from '../redux/actions'

const CMS_PAGES_PATH = '/cms/pages'
const CMS_PAGES_EDIT_URL = CMS_PAGES_PATH + '/edit'
const CMS_PAGES_CREATE_URL = CMS_PAGES_PATH + '/create'
const CMS_PAGES_FOLDER_URL = CMS_PAGES_PATH + '/folder'
const CMS_RESOURCES_URL = '/cms/resources'
const CMS_RESOURCES_IMAGES_URL = CMS_RESOURCES_URL + '/images'
const CMS_RESOURCES_FILES_URL = CMS_RESOURCES_URL + '/files'
const INDEX_PAGE_ALIAS = '/index'

export const PAGE_CONTENT_FOLDER = 'public/content/pages'
export const IMAGE_CONTENT_FOLDER = 'public/content/resources/images'

export function getPageSidebarUrl(cmsConfig) {
  const url = cmsConfig.url === '/' ? '/index' : cmsConfig.url
  return `${cmsConfig.isFolder ? CMS_PAGES_FOLDER_URL : CMS_PAGES_EDIT_URL}${url}`
}

export function getImagesSidebarUrl(cmsConfig) {
  return CMS_RESOURCES_IMAGES_URL;
}

export function getFilesSidebarUrl(cmsConfig) {
  return CMS_RESOURCES_FILES_URL;
}

export function isPageUrl(url) {
  return isEditPageUrl(url) || isCreatePageUrl(url) || isFolderPageUrl(url)
}

export function isImageUrl(url) {
  return url.startsWith(CMS_RESOURCES_IMAGES_URL)
}

export function isItemActive(itemUrl, currentUrl) {
  if (isPageUrl(itemUrl) && isPageUrl(currentUrl)) {
    return itemUrl.split('/')[4] === currentUrl.split('/')[4]
  }
  return itemUrl === currentUrl
}

export function getCmsPageCreateNewEntryUrl(cmsConfig) {
  return cmsConfig.isFolder ? `${CMS_PAGES_CREATE_URL}${cmsConfig.url}` : null
}

// The returned url is used to get static props
export function getTemplateUrl(cmsConfig) {
  return cmsConfig.isFolder
    ? `${cmsConfig.url}/${TEMPLATE_FILE_NAME}`
    : cmsConfig.url
}

export function isEditPageUrl(cmsPageUrl) {
  return cmsPageUrl.startsWith(CMS_PAGES_EDIT_URL)
}

export function isCreatePageUrl(cmsPageUrl) {
  return cmsPageUrl.startsWith(CMS_PAGES_CREATE_URL)
}

export function isFolderPageUrl(cmsPageUrl) {
  return cmsPageUrl.startsWith(CMS_PAGES_FOLDER_URL)
}

export function getConfigUrlFromCmsPageUrl(cmsPageUrl) {
  if (isEditPageUrl(cmsPageUrl)) {
    let page = cmsPageUrl.substring(CMS_PAGES_EDIT_URL.length)
    if (page.indexOf('/', 1) > 0) page = page.substring(0, page.indexOf('/', 1))
    return INDEX_PAGE_ALIAS === page ? '/' : page
  }
  if (isCreatePageUrl(cmsPageUrl))
    return cmsPageUrl.substring(CMS_PAGES_CREATE_URL.length)
  if (isFolderPageUrl(cmsPageUrl))
    return cmsPageUrl.substring(CMS_PAGES_FOLDER_URL.length)
  return null
}

export function getSlug(cmsPageUrl, newEntry) {
  if (isCreatePageUrl(cmsPageUrl))
    return `${cmsPageUrl.substring(CMS_PAGES_CREATE_URL.length)}/${newEntry}`
  if (isEditPageUrl(cmsPageUrl))
    return cmsPageUrl.substring(CMS_PAGES_EDIT_URL.length)
  return null
}

export function getEditPageUrl(folder, filename) {
  return `pages/edit${folder}/${filename.replace(/\.md$/, '')}`
}

export function encodeBase64(str) {
  return btoa(str)
}

export function decodeBase64(str) {
  return atob(str)
}

export function getSessionGithubToken() {
  return window.sessionStorage[SESSION_GITHUB_TOKEN]
}

//TODO: handler exceptions
//TODO: check why token is sometimes undefined
export async function getFolder(token, owner, repo, folder) {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${folder}?time=${(new Date()).getTime()}`,
    {
      headers: { Authorization: `token ${token}` },
      method: 'GET',
    },
  )
  return await res.json()
}

//TODO: handler exceptions
export async function getFile(token, owner, repo, slug) {
  let res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${slug}.md?time=${(new Date()).getTime()}`,
    {
      headers: { Authorization: `token ${token}` },
      method: 'GET',
    },
  )
  const { content, sha } = await res.json()
  return { file: utf8.decode(decodeBase64(content)), sha }
}

//TODO: handler exceptions
export async function putFile(token, owner, repo, slug, content, sha) {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${slug}`,
    {
      headers: { Authorization: `token ${token}` },
      method: 'PUT',
      body: JSON.stringify({
        message: `Update ${slug}`,
        content: content,
        sha,
      }),
    },
  )
  return await res.json()
}

//TODO: handler exceptions
//TODO: update commit message
export async function deleteFile(token, owner, repo, slug, sha) {
  let res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${slug}.md`, {
    headers: { Authorization: `token ${token}` },
    method: 'DELETE',
    body: JSON.stringify({
      message: `Delete ${slug}`,
      sha,
    }),
  })
  await res.json()
}
