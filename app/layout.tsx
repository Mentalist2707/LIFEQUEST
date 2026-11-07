import './globals.css';
import type {Metadata,Viewport} from 'next';
import Workspace from '@/components/Workspace';
export const metadata:Metadata={title:'LIFEQUEST — Hayotingiz, sarguzashtingiz',description:'Hayotingizni RPG kabi rivojlantiring',manifest:'/manifest.webmanifest',appleWebApp:{capable:true,title:'LIFEQUEST'}};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#102036'};
export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="uz"><body><Workspace/>{children}</body></html>;
}
