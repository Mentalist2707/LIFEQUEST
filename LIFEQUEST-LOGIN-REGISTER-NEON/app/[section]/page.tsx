import Workspace from '@/components/Workspace';
export function generateStaticParams(){return ['quests','character','skills','achievements','calendar','inventory','statistics','settings'].map(section=>({section}))}
export default function Page({params}:{params:{section:string}}){return <Workspace section={params.section}/>}
