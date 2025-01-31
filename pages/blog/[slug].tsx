import React, { FC } from 'react'
import hydrate from 'next-mdx-remote/hydrate'
import { majorScale, Pane, Heading, Spinner } from 'evergreen-ui'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Post } from '../../types'
import Container from '../../components/container'
import HomeNav from '../../components/homeNav'
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { posts } from "../../content"
import renderToString from 'next-mdx-remote/render-to-string'

const BlogPost: FC<Post> = ({ source, frontMatter }) => {
  // const content = hydrate(source) // me: this isn't working, I think it's deprecated 🤔
  const content = source;
  const router = useRouter()

  if (router.isFallback) {
    return (
      <Pane width="100%" height="100%">
        <Spinner size={48} />
      </Pane>
    )
  }
  return (
    <Pane>
      <Head>
        <title>{`Known Blog | ${frontMatter.title}`}</title>
        <meta name="description" content={frontMatter.summary} />
      </Head>
      <header>
        <HomeNav />
      </header>
      <main>
        <Container>
          <Heading fontSize="clamp(2rem, 8vw, 6rem)" lineHeight="clamp(2rem, 8vw, 6rem)" marginY={majorScale(3)}>
            {frontMatter.title}
          </Heading>
          <Pane>{content?.scope?.summary}</Pane>
        </Container>
      </main>
    </Pane>
  )
}

BlogPost.defaultProps = {
  source: '',
  frontMatter: { title: 'default title', summary: 'summary', publishedOn: '' },
}

/**
 * Need to get the paths here
 * then the the correct post for the matching path
 * Posts can come from the fs or our CMS
 */
export function getStaticPaths() {
  const postsPath = path.join(process.cwd(), 'posts')
  const filenames = fs.readdirSync(postsPath)
  const paths = filenames.map((name) => ({ params: { slug: name.replace('.mdx', '') } }))
  // dont get paths for cms posts, instead, let fallback handle it
  return { 
    paths, 
    fallback: true // generate paths at runtime (in case slug is missing from filepath)
  }
  // const slugs = filenames.map(name => {
  //   const fullPath = path.join(postsPath, name)
  //   const file = fs.readFileSync(fullPath, 'utf-8')
  //   const { data } = matter(file)
  //   return data
  // })
  // return {
  //   paths: slugs.map(slug => ({params: {slug: slug.slug}})),
  //   fallback: false // 'blocking'
  // }
}

export async function getStaticProps({ params, preview }) {
  let postFile
  try {
    const postPath = path.join(process.cwd(), 'posts', `${params.slug}.mdx`)
    postFile = fs.readFileSync(postPath, 'utf-8')
  } catch {
    // must be from cms or its a 404
    const collection = preview ? posts.draft : posts.published

    postFile = collection.find((p) => {
      const { data } = matter(p)
      return data.slug === params.slug
    })
  }

  if (!postFile) {
    throw new Error('no post')
  }

  const { content, data } = matter(postFile)
  const mdxSource = await renderToString(content, { scope: data })

  return {
    props: {
      source: mdxSource,
      frontMatter: data,
    }
  }
}


export default BlogPost
