import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(p)=>readFileSync(new URL(p,import.meta.url),'utf8');
const layout=read('../app/layout.tsx');
const root=read('../app/page.tsx');
const sections=read('../app/[section]/page.tsx');
const workspace=read('../components/Workspace.tsx');
const cloud=read('../lib/cloud.ts');
const bootstrap=read('../app/api/bootstrap/route.ts');
const db=read('../lib/cache.ts');
const auth=read('../lib/server/auth.ts');
test('root layout keeps exactly one Workspace across routes',()=>{
 assert.match(layout,/<Workspace\s*\/>/);
 assert.doesNotMatch(root,/<Workspace/);
 assert.doesNotMatch(sections,/<Workspace/);
 assert.match(workspace,/usePathname\(\)/);
});
test('session and state bundled into one authenticated initial request',()=>{
 assert.match(workspace,/await bootstrapCloud\(\)/);
 assert.match(cloud,/request\('\/api\/bootstrap','GET'\)/);
 assert.match(bootstrap,/userFromRequest\(req,sql\)/);
 assert.match(bootstrap,/SELECT data,revision FROM lifequest_state/);
});
test('IndexedDB cache is account-scoped and has crash-recovery pending marker',()=>{
 assert.match(db,/lifequest-private-cache-v2/);
 assert.match(db,/user:\$\{id\}/);
 assert.match(db,/pending:boolean/);
 assert.match(workspace,/cached\?\.pending\?mergeStates\(cached.base,cached.state,remote\):remote/);
});
test('prayer time cache is per city/month and one-second clock isolated',()=>{
 assert.match(workspace,/sessionStorage\.setItem\(key/);
 assert.match(workspace,/lifequest-prayer-v1:\$\{activeCity\}:\$\{month\}/);
 assert.match(workspace,/function Countdown\(/);
 assert.match(workspace,/window\.setInterval\(\(\)=>setClock\(Date\.now\(\)\),30000\)/);
});
test('schema only initialized once in warm server process',()=>{
 assert.match(auth,/let schemaReady:Promise<void>\|null=null/);
 assert.match(auth,/schemaReady=createSchema\(sql\)/);
});
