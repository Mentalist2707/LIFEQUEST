import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const route=readFileSync(new URL('../app/api/state/route.ts',import.meta.url),'utf8');
test('server combines baseline and proposed state with locked latest row',()=>{
 assert.match(route,/mergeStates\(baseline,proposed,latest\)/);
 assert.match(route,/if\(!payload\.baseState\)/);
 assert.match(route,/stableEqual\(merged,latest\)/);
});
test('transaction locks each user row and commits atomically',()=>{
 assert.match(route,/await connection\.query\('BEGIN'\)/);
 assert.match(route,/FOR UPDATE/);
 assert.match(route,/ON CONFLICT \(id\) DO NOTHING/);
 assert.match(route,/await connection\.query\('COMMIT'\)/);
 assert.match(route,/await connection\.query\('ROLLBACK'\)/);
 assert.doesNotMatch(route,/attempt<8/);
 assert.doesNotMatch(route,/DO UPDATE SET data=EXCLUDED\.data/);
});
