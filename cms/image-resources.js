import Link from 'next/link'
import { useRouter } from 'next/router'
import { useContext, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RemoteContext } from './contexts'
import widgetStyle from './widget.module.scss'
import style from './image-resources.module.scss'
import {
  deleteFile,
  getFolder,
  getCmsPageCreateNewEntryUrl,
  getEditPageUrl,
  CONTENT_FOLDER,
  PAGE_CONTENT_FOLDER,
  IMAGE_CONTENT_FOLDER,
  putFile,
} from './utils'
import { pushNotification } from '../redux/actions'

export default function ImageResources() {
  const storedGithubToken = useSelector((state) => state.reducer.githubToken)
  const { owner, repo } = useContext(RemoteContext)
  const [folder, setFolder] = useState(null)
  useEffect(async () => {
    setFolder(await getFolder(storedGithubToken, owner, repo, IMAGE_CONTENT_FOLDER))
  }, [storedGithubToken, owner, repo])
  let files = (folder?.length > 0) ? folder : []; //TODO: files will be a json with error message when folder doesn't exist
  if (files) {
    files = files.sort((f1, f2) => {
      const time1 = Number(f1.name.substring(0, f1.name.indexOf('-')))
      const time2 = Number(f2.name.substring(0, f2.name.indexOf('-')))
      return time1 === time2 ? 0 : time1 > time2 ? -1 : 1
    })
  }
  const dispatch = useDispatch()
  const fileInput = useRef(null)
  const router = useRouter()

  return (
    <div className={`${widgetStyle.container} `}>
      <div className={widgetStyle.headline}>
        <h1>圖片</h1>
        <button className={`${widgetStyle.btn} ${widgetStyle.btnPrimary}`}
          onClick={e => {
            if (fileInput.current) fileInput.current.click()
          }}>
          新增圖片
        </button>
        <input
          ref={fileInput}
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={e => {
            ([...e.target.files]).forEach(file => {
              var reader = new FileReader();
              reader.addEventListener('load', async () => {
                const filename = `${new Date().getTime()}-${file.name}`
                const content = reader.result.replace(/^data:image.*?base64,/, '')
                await putFile(
                  storedGithubToken,
                  owner,
                  repo,
                  `${IMAGE_CONTENT_FOLDER}/${filename}`,
                  content,
                )
                dispatch(pushNotification('新增完成'));
                router.replace(router.asPath)
              }, false);
              reader.readAsDataURL(file)
              e.target.value = ''
            })
          }}
        />
      </div>
      <div className={`${widgetStyle.card} ${widgetStyle.padding} ${style.album}`}>
        {files.map(file => (
          <img className={style.image} src={file.download_url} key={file.name} ></img>
        ))}
      </div>
    </div>
  )
}