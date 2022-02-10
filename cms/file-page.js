import { useRouter } from 'next/router'
import { Fragment, useContext, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'
import { RemoteContext } from './contexts'
import widgetStyle from './widget.module.scss'
import style from './file-page.module.scss'
import utf8 from 'utf8'

import {
  encodeBase64,
  getEditPageUrl,
  getFile,
  getSlug,
  isCreatePageUrl,
  isEditPageUrl,
  PAGE_CONTENT_FOLDER,
  putFile,
} from './utils'
import matter from 'gray-matter'
import html from 'remark-html'
import { remark } from 'remark'
import { pushNotification } from '../redux/actions'

import { EditorState, ContentState, convertToRaw, convertFromHTML } from 'draft-js';
import '../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
// import { Editor } from 'react-draft-wysiwyg'
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import dynamic from 'next/dynamic'
const Editor = dynamic(
  () => import('react-draft-wysiwyg').then(wysiwyg => wysiwyg.Editor),
  { ssr: false }
)

export default function FilePage({ page }) {
  const cmsConfig = page.type.cmsConfig

  const router = useRouter()
  const storedGithubToken = useSelector((state) => state.reducer.githubToken)
  const { owner, repo } = useContext(RemoteContext)
  const isEdit = isEditPageUrl(router.asPath)
  const [frontMatter, setFrontMatter] = useState({})
  const [sha, setSha] = useState(null)
  const getDefaultValues = (config) => {
    let values = {}
    Object.entries(config.fields).forEach(
      ([propName, meta]) => (values[propName] = meta.defaultValue),
    )
    return values
  }
  const [values, setValues] = useState(() => getDefaultValues(cmsConfig))
  const [htmlValues, setHtmlValues] = useState(() => getDefaultValues(cmsConfig))
  useEffect(async () => {
    if (isEdit) {
      const slug = `${PAGE_CONTENT_FOLDER}${isEdit ? getSlug(router.asPath) : ''}`
      const { file, sha } = await getFile(storedGithubToken, owner, repo, slug)
      setSha(sha);
      const markdown = matter(file)
      const frontMatter = { ...markdown.data }
      setFrontMatter(frontMatter)
      let values = {};
      let htmlValues = {}
      Object.entries(frontMatter).forEach(([name, value]) => {
        if (cmsConfig.fields[name]?.type === "textarea") {
          const contentState = ContentState.createFromBlockArray(htmlToDraft(frontMatter[name]).contentBlocks);
          const editorState = EditorState.createWithContent(contentState);
          values[name] = editorState
          htmlValues[name] = frontMatter[name]
        }
        else {
          values[name] = frontMatter[name]
          htmlValues[name] = frontMatter[name]
        }
      })
      setValues(values)
      setHtmlValues(htmlValues)
    }
  }, [storedGithubToken, owner, repo, isEdit, setValues, setHtmlValues, htmlToDraft])
  const allPageStaticProps = useSelector(
    (state) => state.reducer.pageStaticProps,
  )
  let thisPageStaticProps = allPageStaticProps[page.type.cmsConfig.url]
  thisPageStaticProps = { ...thisPageStaticProps, ...frontMatter, ...values, ...htmlValues }

  const [iframeRef, setIframeRef] = useState(null)
  const mountNode = iframeRef?.contentWindow?.document?.body
  useEffect(() => {
    if (iframeRef) {
      const iframeWindow = iframeRef?.contentWindow
      //TODO: don't add cms css modules to the privew iframe
      const styles = iframeWindow.parent.document.querySelectorAll('style')
      styles.forEach((style) => {
        iframeWindow.document.head.appendChild(style.cloneNode(true))
      })
      const styleSheets = iframeWindow.parent.document.querySelectorAll('link[rel=stylesheet]')
      styleSheets.forEach((styleSheet) => {
        iframeWindow.document.head.appendChild(styleSheet.cloneNode(true))
      })
    }
  }, [iframeRef])
  const dispatch = useDispatch();

  return (
    <div className={style.pageContainer}>
      <div className={`${widgetStyle.container} ${style.panel}`}>
        <div className={widgetStyle.headline}>
          <h1>{cmsConfig.name}</h1>
          {isEdit ? (
            <button className={`${widgetStyle.btn} ${widgetStyle.btnPrimary}`}
              onClick={async () => {
                if (window.confirm(`確定要儲存變更嗎?`)) {
                  const content = Object.entries(cmsConfig.fields).reduce((s, [propName]) => {
                    return `${s}\n${propName}: '${htmlValues[propName].replaceAll(`'`, `''`)}'`
                  }, '---');
                  content += '\n---'
                  await putFile(
                    storedGithubToken,
                    owner,
                    repo,
                    `${PAGE_CONTENT_FOLDER}${getSlug(router.asPath)}.md`,
                    encodeBase64(utf8.encode(content)),
                    sha
                  )
                  dispatch(pushNotification('更新完成'));
                  router.replace(router.asPath)
                }
              }}
            >
              儲存{cmsConfig.name}
            </button>
          ) : (
            <button
              className={`${widgetStyle.btn} ${widgetStyle.btnPrimary}`}
              onClick={async () => {
                if (window.confirm(`確定要新增${cmsConfig.name}嗎?`)) {
                  const filename = `${new Date().getTime()}-${htmlValues[cmsConfig.filenameField]}`
                  const content = Object.entries(cmsConfig.fields).reduce((s, [propName]) => {
                    return `${s}\n${propName}: '${htmlValues[propName].replaceAll(`'`, `''`)}'`
                  }, '---');
                  content += '\n---'
                  await putFile(
                    storedGithubToken,
                    owner,
                    repo,
                    `${PAGE_CONTENT_FOLDER}${getSlug(router.asPath, filename)}.md`,
                    encodeBase64(utf8.encode(content)),
                  )
                  dispatch(pushNotification('新增完成'));
                  router.replace(getEditPageUrl(cmsConfig.url, `${filename}.md`))
                }
              }}
            >
              新增{cmsConfig.name}
            </button>
          )}
        </div>
        <div className={`${widgetStyle.card} ${widgetStyle.padding}`}>
          {Object.entries(cmsConfig.fields).map(([propName, meta]) => {
            let Component;
            let props = {};
            if (meta.type == 'textarea') {
              if (Editor) {
                Component = Editor;
                props.wrapperClassName = widgetStyle.formControl
                props.wrapperStyle = {
                  width: 'unset',
                }
                props.toolbarClassName = "toolbar-class"
                props.toolbarStyle = {
                  width: 'unset',
                  border: 'unset',
                }
                props.editorClassName = "editor-class"
                props.editorStyle = {
                  minHeight: '150px'
                }
                props.editorState = (values?.[propName]) ? values[propName] : EditorState.createEmpty()
                props.onEditorStateChange = editorState => {
                  setValues({ ...values, [propName]: editorState })
                  setHtmlValues({ ...htmlValues, [propName]: draftToHtml(convertToRaw(editorState.getCurrentContent())) })
                }
              }
              else {
                Component = 'textarea';
              }
            }
            else {
              Component = 'input';
              props = {
                className: widgetStyle.formControl,
                value: values?.[propName] || '',
                onChange: (e) => {
                  setValues({ ...values, [propName]: e.target.value })
                  setHtmlValues({ ...htmlValues, [propName]: e.target.value })
                }
              };
              switch (meta.type) {
                case 'text':
                  props.type = 'text'
                  break;
                case 'boolean':
                  props.type = 'checkbox'  //TODO: use "checked" for its value
                  break;
                case 'number':
                  props.type = 'number'
                  break;
              }
            }
            return (
              <Fragment key={propName}>
                <label>{meta.name}</label>
                <Component {...props} />
              </Fragment>
            )
          })}
        </div>
      </div>
      <div className={style.divider}></div>
      <div className={style.previewPanel}>
        <iframe ref={setIframeRef} className={`${style.preview}`}>
          {mountNode && (!isEdit || Object.entries(frontMatter).length !== 0) &&
            createPortal(<page.type {...thisPageStaticProps} />, mountNode)}
        </iframe>
      </div>
    </div>
  )
}
