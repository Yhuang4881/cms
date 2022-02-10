import style from './cms-layout.module.scss'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router';
import { isItemActive } from './utils';

export default function SidebarItem({ name, items, icon }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(true);
  const sidebarDropdownElement = useRef(null);
  useEffect(() => {
    sidebarDropdownElement.current.style.height = expanded ? `${sidebarDropdownElement.current.scrollHeight}px` : '0px'
  }, [sidebarDropdownElement, expanded])

  return (
    <li className={style.sidebarItem}>
      <a className={`${style.sidebarLink} ${style.collapse} ${expanded ? style.expanded : ''}`}
        onClick={() => setExpanded(expanded => !expanded)}>
        {icon}
        <span className={style.alignMiddle}>{name}</span>
      </a>
      <ul className={style.sidebarDropdown} ref={sidebarDropdownElement}>
        {items.map(item => (
          <li className={style.sidebarItem} key={item.href}>
            <Link href={item.href} >
              <a className={style.sidebarLink} >
                <span className={`${style.alignMiddle} ${(isItemActive(item.href, router.asPath)) ? style.active : ''}`}>
                  {item.name}
                </span>
              </a>
            </Link>
          </li>))}
      </ul>
    </li>)
}