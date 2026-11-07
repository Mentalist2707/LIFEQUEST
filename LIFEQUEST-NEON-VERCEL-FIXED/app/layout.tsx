import './globals.css';
import type {Metadata,Viewport} from 'next';
export const metadata:Metadata={title:'LIFEQUEST — Hayotingiz, sarguzashtingiz',description:'Hayotingizni RPG kabi rivojlantiring',manifest:'/manifest.webmanifest',appleWebApp:{capable:true,title:'LIFEQUEST'}};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#050B16'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="uz"><body>{children}</body></html>}
