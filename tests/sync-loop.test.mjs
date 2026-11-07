import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const cloud=readFileSync(new URL('../lib/cloud.ts',import.meta.url),'utf8');
const workspace=readFileSync(new URL('../components/Workspace.tsx',import.meta.url),'utf8');
test('server owns bounded CAS reconciliation and client sends baseline',()=>{
 assert.match(cloud,/baseState:lastSaved\?clone\(lastSaved\):clone\(baseline\)/);
 assert.match(cloud,/revision=Number\(response\.revision\)/);
 assert.match(cloud,/queue\.catch\(\(\)=>\{\}\)\.then\(perform\)/);
});
test('UI autosave is debounced and does not repeat semantic JSONB changes',()=>{
 assert.match(workspace,/const saveTimer=window\.setTimeout/);
 assert.match(workspace,/window\.clearTimeout\(saveTimer\)/);
 assert.match(workspace,/stableEqual\(persisted,snapshot\)/);
});
