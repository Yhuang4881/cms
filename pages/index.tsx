import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import { getSortedPostsData } from '../lib/posts'
import Link from 'next/link'
import Date from '../components/date'
import { CmsConfig } from '../cms/interface'
import { parseMarkdownFile } from '../lib/utils'

export default function Home({ title, introduction, allPostsData }) {
  return (
    <Layout>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <h1 className="heading2Xl">{title}</h1>
      <section className="headingMd">
        <p>{introduction}</p>
        <p>
          (This is a sample website - you’ll be building a site like this in{' '}
          <a href="https://nextjs.org/learn">our Next.js tutorial</a>.)
        </p>
      </section>
      <section className={`$headingMd $padding1px`}>
        <h2 className="headingLg">Blog</h2>
        <ul className="list">
          {allPostsData.map(({ id, date, title }) => (
            <li className="listItem" key={id}>
              <Link href={`/posts/${id}`}>
                <a>{title}</a>
              </Link>
              <br />
              <small className="lightText">
                <Date dateString={date} />
              </small>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  )
}

const cmsConfig: CmsConfig = {
  url: '/',
  name: '首頁',
  isFolder: false,
  fields: {
    title: {
      name: "標題",
      type: "text",
      defaultValue: ""
    },
    introduction: {
      name: "簡介",
      type: "text",
      defaultValue: ""
    }
  }
}
Home.cmsConfig = cmsConfig;

export async function getStaticProps() {
  const { data: frontMatter } = await parseMarkdownFile('index.md');
  const allPostsData = getSortedPostsData()
  return {
    props: {
      ...frontMatter,
      allPostsData
    }
  }
}