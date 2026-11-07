import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../components/Workspace.tsx',import.meta.url),'utf8');
test('namoz kartasi taymer maydonlari rows dan olinadi',()=>{
 assert.match(source,/return \{pr,status,timeExpired,mayClaimOnTime,isCurrent,isUpcoming,windowTime,statusClass,countLabel,timeLabel\};/);
 assert.match(source,/rows\.map\(\(\{pr,status,timeExpired,mayClaimOnTime,isCurrent,isUpcoming,windowTime,statusClass,countLabel,timeLabel\}\)=>/);
});
