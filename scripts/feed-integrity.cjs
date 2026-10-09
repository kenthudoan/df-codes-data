'use strict';
// Usage: node scripts/feed-integrity.cjs [--write] [path/to/codes.json]
// Read-only by default. --write removes the known 2099 sentinel and corrects counts.
const fs=require('node:fs'),path=require('node:path');
const args=process.argv.slice(2),write=args.includes('--write');
const filepath=path.resolve(args.find(x=>!x.startsWith('--'))||'codes.json');
const data=JSON.parse(fs.readFileSync(filepath,'utf8'));
if(!Array.isArray(data.codes))throw Error('codes must be an array');
const seenCodes=new Set(),seenIds=new Set(),bad=[],validTiers=new Set(['safe','risky','broken','unknown']);
let sentinel=0;
for(let i=0;i<data.codes.length;i++){
 const c=data.codes[i];
 if(!c||typeof c.code!=='string'||!(/^[A-Za-z0-9_-]{6,40}$/.test(c.code))||!/[A-Za-z]/.test(c.code))bad.push(`Bad code #${i}`);
 if(!c||typeof c.id!=='string'||!c.id)bad.push(`Bad id #${i}`);
 if(seenCodes.has(c.code))bad.push(`Duplicate code ${c.code}`);
 if(seenIds.has(c.id))bad.push(`Duplicate id ${c.id}`);
 seenCodes.add(c.code);seenIds.add(c.id);
 if(!validTiers.has(c.tier||'unknown'))bad.push(`Bad tier #${i}`);
 if(c.validUntil==='2099-12-31T23:59:59Z')sentinel++;
}
const actual={total:data.codes.length,tierSafe:data.codes.filter(c=>c.tier==='safe').length,tierRisky:data.codes.filter(c=>c.tier==='risky').length,tierUnknown:data.codes.filter(c=>!c.tier||c.tier==='unknown').length};
const countMismatch=Object.keys(actual).some(k=>data.counts?.[k]!==actual[k]);
console.log(JSON.stringify({file:filepath,actual,countMismatch,placeholderExpiryCount:sentinel,invalidRecords:bad.length},null,2));
if(bad.length){console.error(bad.slice(0,20).join('\n'));process.exitCode=1;}
else if(write){
 for(const c of data.codes)if(c.validUntil==='2099-12-31T23:59:59Z')delete c.validUntil;
 if(sentinel||countMismatch){data.counts=actual;data.lastUpdated=new Date().toISOString();fs.writeFileSync(filepath,JSON.stringify(data,null,2)+'\n');console.log('Updated codes.json; commit after reviewing diff.');}
}else if(sentinel||countMismatch){console.warn('Warnings: run with --write only after reviewing placeholders and backing up codes.json.');}
