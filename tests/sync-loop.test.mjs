import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const cloud=readFileSync(new URL('../lib/cloud.ts',import.meta.url),'utf8');
const workspace=readFileSync(new URL('../components/Workspace.tsx',import.meta.url),'utf8');
test('conflict retries are bounded and server response carries latest revision',()=>{
 assert.match(cloud,/attempt<2/);
 assert.match(cloud,/err\.payload\?\.state/);
 assert.doesNotMatch(cloud,/attempt<4/);
});
test('UI autosave is debounced and clears on unmount or state change',()=>{
 assert.match(workspace,/const saveTimer=window\.setTimeout/);
 assert.match(workspace,/window\.clearTimeout\(saveTimer\)/);
});
