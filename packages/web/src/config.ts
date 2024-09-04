if (process.env.NODE_ENV !== 'development' && process.env.NEXT_PUBLIC_CONNECT_DOMAIN == null) {
  throw new Error('NEXT_PUBLIC_CONNECT_DOMAIN is not set')
}

export const env = {
  protocol: process.env.NODE_ENV === 'development' ? 'http' : 'https',
  domain:
    process.env.NODE_ENV === 'development'
      ? 'ntm-connect.local:3004'
      : process.env.NEXT_PUBLIC_CONNECT_DOMAIN,
}
