import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Fragment, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import style from './cms-layout.module.scss'
import sidgetStyle from './widget.module.scss'
import SidebarItem from './sidebarItem'
import { getFilesSidebarUrl, getImagesSidebarUrl, getPageSidebarUrl } from './utils'

export default function CmsLayout({ pages, children }) {
  const [slidebarCollapsed, setSlidebarCollapsed] = useState(false);

  const notifications = useSelector((state) => state.reducer.notifications)

  const router = useRouter();
  useEffect(() => {
    const handleRouteChange = () => {
      if (!slidebarCollapsed && window.matchMedia('(max-width: 576px)').matches) {
        setSlidebarCollapsed(true);
      }
    }
    router.events.on('routeChangeStart', handleRouteChange)
    return () => {
      router.events.off('routeChangeStart', handleRouteChange)
    }
  }, [slidebarCollapsed, setSlidebarCollapsed])

  return (
    <>
      <div className={`${style.wrapper} ${slidebarCollapsed ? style.slidebarCollapsed : ''}`}>
        <span className={style.sidebarToggle} onClick={() => {
          setSlidebarCollapsed(setSlidebarCollapsed => !setSlidebarCollapsed)
        }}>
          <i className={style.hamburger}></i>
        </span>
        <nav className={style.sidebar}>
          <div className={style.sidebarContent}>
            <a className={style.sidebarBrand}> sidebarBrand </a>
            <ul className={style.sidebarNav}>
              <li className={style.sidebarHeader}> 內容管理 </li>
              <SidebarItem
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                }
                name="頁面"
                items={pages.map((page) => ({
                  href: getPageSidebarUrl(page.type.cmsConfig),
                  name: page.type.cmsConfig.name,
                }))}
              />
              <SidebarItem
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                }
                name="資源"
                items={[
                  {
                    href: getImagesSidebarUrl(),
                    name: '圖片',
                  }]}
              />
            </ul>
          </div>
        </nav>
        <nav className={style.navbar}>
        </nav>
        <main className={style.main}>
          <div className={style.content}>{children}</div>
        </main>
      </div>
      <div className={style.notificationContainer}>
        {notifications.map((notification) => {
          return (
            <div key={notification.id} className={`${style.notification} ${notification.className ? sidgetStyle[notification.className] : ''}`}>
              {notification.content}
            </div>
          )
        })}
      </div>
    </>
  )
}
