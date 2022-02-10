import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const contentDirectory = path.join(process.cwd(), 'public', 'content', 'pages')

export async function parseMarkdownFile(...paths: string[]): Promise<{ data: Object, content: string }> {
  const markdownPath = path.join(contentDirectory, ...paths)
  const markdown = await fs.promises.readFile(markdownPath, { encoding: 'utf8' })
  return matter(markdown)
}

export async function toBase64(path) {
  var bitmap = await fs.promises.readFile(path);
  return Buffer.from(bitmap).toString('base64');
}