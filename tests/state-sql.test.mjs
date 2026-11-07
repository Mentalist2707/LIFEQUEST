import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const route=readFileSync(new URL('../app/api/state/route.ts',import.meta.url),'utf8');
test('state endpoint does not suppress UPDATE when revision exceeds zero',()=>{
 assert.match(route,/INSERT INTO lifequest_state \(id,data,revision\) VALUES \(/);
 assert.doesNotMatch(route,/SELECT \$\{id\},\$\{data\}::jsonb,1 WHERE \$\{payload\.revision\}=0/);
 assert.match(route,/ON CONFLICT \(id\) DO UPDATE/);
});
test('state endpoint preserves conflict protection for stale revisions',()=>{
 assert.match(route,/WHERE lifequest_state\.revision=\$\{payload\.revision\} RETURNING revision/);
 assert.match(route,/if\(!rows\.length\)return json\(\{error:.*\},409\)/);
});
