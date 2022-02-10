import Link from 'next/link'
import { useRouter } from 'next/router'
import { useContext, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RemoteContext } from './contexts'
import widgetStyle from './widget.module.scss'
import style from './folder-page.module.scss'
import {
  deleteFile,
  getFolder,
  getCmsPageCreateNewEntryUrl,
  getEditPageUrl,
  PAGE_CONTENT_FOLDER,
} from './utils'
import { TEMPLATE_FILE_NAME } from './interface'
import { pushNotification } from '../redux/actions'

export default function FolderPage({ page }) {
  const config = page.type.cmsConfig
  const storedGithubToken = useSelector((state) => state.reducer.githubToken)
  const { owner, repo } = useContext(RemoteContext)
  const markdownFolder = `${PAGE_CONTENT_FOLDER}${config.url}`
  const [folder, setFolder] = useState(null)
  useEffect(async () => {
    setFolder(await getFolder(storedGithubToken, owner, repo, markdownFolder))
  }, [storedGithubToken, owner, repo, markdownFolder])
  let files = folder?.filter((file) => file.name !== `${TEMPLATE_FILE_NAME}.md`)
  if (files) {
    files = files.sort((f1, f2) => {
      const time1 = Number(f1.name.substring(0, f1.name.indexOf('-')))
      const time2 = Number(f2.name.substring(0, f2.name.indexOf('-')))
      return time1 === time2 ? 0 : time1 > time2 ? -1 : 1
    })
  }
  const dispatch = useDispatch()
  const router = useRouter()
  return files ? (
    <div className={widgetStyle.container}>
      <div className={widgetStyle.headline}>
        <h1>{config.name}</h1>
        <Link href={getCmsPageCreateNewEntryUrl(config)}>
          <button className={`${widgetStyle.btn} ${widgetStyle.btnPrimary}`}>
            <span className={widgetStyle.center}>
              <svg
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 448 512"
              >
                <path
                  fill="currentColor"
                  d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"
                ></path>
              </svg>
              <span style={{ marginLeft: '0.5rem' }}>新增{config.name}</span>
            </span>
          </button>
        </Link>
      </div>
      <div className={widgetStyle.card}>
        <table className={style.table}>
          <thead>
            <tr>
              <th className={style.name}>Name</th>
              <th>Date</th>
              <th className={style.actions}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {files &&
              files.map((file) => {
                const indexOfDash = file.name.indexOf('-')
                const date = new Date(
                  Number(file.name.substring(0, indexOfDash)),
                )
                const title = file.name
                  .substring(indexOfDash + 1)
                  .replace(/\.md$/, '')
                return (
                  <tr key={file.name}>
                    <td>
                      <Link href={getEditPageUrl(config.url, file.name)}>
                        {title}
                      </Link>
                    </td>
                    <td>
                      {date.toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </td>
                    <td className={style.actions}>
                      <Link href={getEditPageUrl(config.url, file.name)}>
                        <a className={style.action}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                          </svg>
                        </a>
                      </Link>
                      <a
                        href="#"
                        className={`${widgetStyle.danger} ${style.action}`}
                        onClick={async (e) => {
                          e.preventDefault()
                          if (window.confirm(`確定要刪除 ${title} 嗎?`)) {
                            await deleteFile(
                              storedGithubToken,
                              owner,
                              repo,
                              `${PAGE_CONTENT_FOLDER}${file.path.match(
                                new RegExp(`${PAGE_CONTENT_FOLDER}(.*)\.md`),
                              )[1]}`,
                              file.sha,
                            )
                            dispatch(pushNotification('刪除完成'))
                            router.replace(router.asPath)
                          }
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </a>
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>
    </div>
  ) : (
    <div>loading</div>
  )
}
