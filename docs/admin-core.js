export const CODE=/^[A-Z0-9_-]{6,40}$/;
export const normalize=v=>String(v??'').trim().toUpperCase();
export const counts=codes=>({total:codes.length,tierSafe:codes.filter(c=>c.tier==='safe').length,tierRisky:codes.filter(c=>c.tier==='risky').length,tierUnknown:codes.filter(c=>!c.tier||c.tier==='unknown').length});
const allowed=new Set(['safe','risky','unknown','broken']);
const date=v=>!v||(!Number.isNaN(Date.parse(v))&&/^\d{4}-\d\d-\d\dT/.test(v));
export function validate(feed,expired) {
 const errors=[];if(!feed||!Array.isArray(feed.codes))return ['codes.json thiếu mảng codes'];
 const ids=new Set(),seen=new Set();
 for(const [i,c] of feed.codes.entries()){
  const code=normalize(c?.code);if(!CODE.test(code)||!/[A-Z]/.test(code))errors.push('Mã không hợp lệ ở dòng '+(i+1));
  if(seen.has(code))errors.push('Mã trùng: '+code);seen.add(code);
  if(!c?.id||ids.has(c.id))errors.push('ID thiếu/trùng: '+(c?.id||i));ids.add(c?.id);
  if(!allowed.has(c.tier||'unknown'))errors.push('Tier không hợp lệ: '+code);
  for(const k of ['addedAt','verifiedAt','validFrom','validUntil'])if(c[k]&&!(k==='verifiedAt' ? (date(c[k])||/^([01]\d|2[0-3]):[0-5]\d (0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/.test(c[k])) : date(c[k])))errors.push('Ngày không hợp lệ: '+code+'/'+k);
  if(c.validFrom&&c.validUntil&&Date.parse(c.validFrom)>Date.parse(c.validUntil))errors.push('Hạn trước ngày bắt đầu: '+code);
  if(c.source&&!/^https:\/\//i.test(c.source))errors.push('Nguồn không phải HTTPS: '+code);
 }
 if(expired){if(!Array.isArray(expired.codes))errors.push('expired.json thiếu codes');else {
  const e=new Set();for(const c of expired.codes){const k=normalize(c.code);if(e.has(k))errors.push('Trùng mã hết hạn: '+k);if(seen.has(k))errors.push('Mã tồn tại cả hai kho: '+k);e.add(k)}
 }}
 return errors;
}
function makeId(code,existing){let id='df-'+code.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,32);let n=2;const ids=new Set(existing.map(x=>x.id));while(ids.has(id))id='df-'+code.toLowerCase().slice(0,26)+'-'+n++;return id}
export function applyBatch(original,expiredOriginal,changes,now=new Date().toISOString()){
 if(!Array.isArray(changes)||changes.length<1||changes.length>100)throw Error('Cần 1–100 thay đổi');
 const feed=structuredClone(original),expired=structuredClone(expiredOriginal);
 if(!Array.isArray(feed.codes)||!Array.isArray(expired.codes))throw Error('Dữ liệu nguồn không hợp lệ');
 const edited=new Set();
 for(const x of changes){
  const code=normalize(x.code);if(!CODE.test(code)||!/[A-Z]/.test(code))throw Error('Mã sai định dạng: '+code);
  if(edited.has(code))throw Error('Thay đổi trùng mã trong cùng lô: '+code);edited.add(code);
  const i=feed.codes.findIndex(c=>normalize(c.code)===code),oldExpired=expired.codes.findIndex(c=>normalize(c.code)===code);
  if(x.action==='add'){
   if(i!==-1||oldExpired!==-1)throw Error('Mã đã tồn tại (bao gồm kho hết hạn): '+code);
   const tier=x.tier||'unknown';if(!allowed.has(tier)||tier==='broken')throw Error('Tier mới không hợp lệ');
   const c={id:makeId(code,feed.codes),code,title:String(x.title||('Giftcode '+code)).slice(0,100),description:String(x.description||'').slice(0,320),tier,addedAt:now};
   if(x.source)c.source=x.source;if(x.validUntil)c.validUntil=x.validUntil;if(x.validFrom)c.validFrom=x.validFrom;
   if(tier==='safe')c.verifiedAt=now;
   feed.codes.push(c);
  }else if(x.action==='update'){
   if(i<0)throw Error('Không tìm thấy mã: '+code);
   const c=feed.codes[i];for(const k of ['title','description','source','tier','validFrom','validUntil'])if(Object.hasOwn(x,k)){
    if((k==='validUntil'||k==='validFrom'||k==='source')&&!x[k])delete c[k];else c[k]=x[k];
   }
   if(c.tier==='safe'&&!c.verifiedAt)c.verifiedAt=now;
  }else if(x.action==='expire'){
   if(i<0)throw Error('Không tìm thấy mã hoạt động: '+code);
   if(!String(x.reason||'').trim())throw Error('Cần lý do hết hạn: '+code);
   const old=feed.codes.splice(i,1)[0];
   if(oldExpired!==-1)throw Error('Mã đã trong kho hết hạn: '+code);
   expired.codes.push({id:old.id,code,expiredAt:now,reason:String(x.reason).slice(0,240)});
  }else if(x.action==='restore'){
   if(oldExpired<0||i>=0)throw Error('Không tìm thấy mã trong kho hết hạn: '+code);
   const old=expired.codes.splice(oldExpired,1)[0];
   feed.codes.push({id:old.id||makeId(code,feed.codes),code,title:String(x.title||('Giftcode '+code)).slice(0,100),tier:'unknown',addedAt:now});
  }else throw Error('Hành động không hỗ trợ: '+x.action);
 }
 feed.counts=counts(feed.codes);feed.lastUpdated=now;expired.lastUpdated=now;
 const errors=validate(feed,expired);if(errors.length)throw Error(errors.slice(0,8).join('; '));
 return {feed,expired};
}
