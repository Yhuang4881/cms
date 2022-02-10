import Layout from '../../components/layout'
import { getAllPostIds, getPostData } from '../../lib/posts'
import Head from 'next/head'
import Date from '../../components/date'
import { CmsConfig } from '../../cms/interface'

export default function Post({ title, author, date, content }) {
  return (
    <Layout>
      <Head>
        <title>{title}</title>
      </Head>
      <article>
        <h1 className="headingXl">{title}</h1>
        <h2>{author}</h2>
        <div className="lightText">
          <Date dateString={date} />
        </div>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </article>
    </Layout>
  )
}

export async function getStaticPaths() {
  const paths = getAllPostIds()
  return {
    paths,
    fallback: false
  }
}

export async function getStaticProps({ params }) {
  const postData = await getPostData(params.id)
  return {
    props: {
      ...postData
    }
  }
}

const cmsConfig: CmsConfig = {
  url: `/posts`,
  name: '文章',
  isFolder: true,
  filenameField: 'title',
  fields: {
    title: {
      name: "標題",
      type: "text",
      defaultValue: ""
    },
    author: {
      name: "作者",
      type: "text",
      defaultValue: ""
    },
    content: {
      name: "內容",
      type: "textarea",
      defaultValue: ""
    },
  },
}
Post.cmsConfig = cmsConfig;