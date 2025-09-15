/// <reference types="vinxi/types/server" />
import { renderToReadableStream } from 'react-dom/server'
import { StartServer } from '@tanstack/start/server'
import { createRouter } from './router'

export default async function handler(request: Request): Promise<Response> {
  const router = createRouter()
  const stream = await renderToReadableStream(<StartServer router={router} />)
  
  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}