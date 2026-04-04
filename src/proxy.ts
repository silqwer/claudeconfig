export { auth as proxy } from '@/auth'

export const config = {
  matcher: ['/repos/:path*', '/:owner/:repo/:path*'],
}
