import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const route=readFileSync(new URL('../app/api/state/route.ts',import.meta.url),'utf8');
test('server combines baseline and proposed state with latest row',()=>{
 assert.match(route,/mergeStates\(baseline,proposed,latest\)/);
 assert.match(route,/if\(!payload\.baseState\)/);
 assert.match(route,/stableEqual\(merged,latest\)/);
});
test('CAS ensures only one writer wins each revision',()=>{
 assert.match(route,/AND revision=\$\{latestRevision\} RETURNING revision/);
 assert.match(route,/ON CONFLICT \(id\) DO NOTHING RETURNING revision/);
 assert.match(route,/attempt<8/);
 assert.doesNotMatch(route,/DO UPDATE SET data=EXCLUDED.data/);
});
