export type VITE_ENV = 'development' | 'test' | 'production'

export interface AppEnv {
  mode: VITE_ENV
  firebase: {
    apiKey: string
    authDomain: string
    projectId: string
    storageBucket: string
    messagingSenderId: string
    appId: string
  }
}
