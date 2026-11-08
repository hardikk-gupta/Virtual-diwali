const headers = {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers});
export async function api(request,env){
 const url=new URL(request.url);

 if(url.pathname!=='/api/lanterns')return json({error:'Not found'},404);
 if(!env.DB)return json({error:'The shared sky is temporarily unavailable. Please try again shortly.'},503);
 try{
 if(request.method==='GET'){
 const [list,count]=await Promise.all([env.DB.prepare('SELECT id, name, created_at FROM lanterns ORDER BY created_at DESC LIMIT 100').all(),env.DB.prepare('SELECT COUNT(*) AS total FROM lanterns').first()]);
 return json({lanterns:list.results,total:count.total});
 }
 if(request.method!=='POST')return json({error:'Method not allowed'},405);
 const origin=request.headers.get('origin');if(origin&&origin!==url.origin)return json({error:'Please release your lantern from this website.'},403);
 if(Number(request.headers.get('content-length')||0)>1024)return json({error:'Request too large'},413);
 const raw=await request.text();if(raw.length>1024)return json({error:'Request too large'},413);
 let body;try{body=JSON.parse(raw)}catch{return json({error:'Please enter a name.'},400)}
 const name=typeof body.name==='string'?body.name.normalize('NFC').trim().replace(/\s+/g,' '):'';
 const visitor=body.visitor;
 if(name.length<2||name.length>24||!/^\p{L}[\p{L}\p{M} .’'\-]*$/u.test(name))return json({error:'Use 2–24 letters for your name. Hindi and other scripts are welcome.'},400);
 if(typeof visitor!=='string'||! /^[a-f0-9-]{36}$/i.test(visitor))return json({error:'Please refresh the page and try again.'},400);
 const existing=await env.DB.prepare('SELECT id, name, created_at FROM lanterns WHERE visitor_key = ?').bind(visitor).first();
 if(existing)return json({lantern:existing,existing:true});
 const count=await env.DB.prepare('SELECT COUNT(*) AS total FROM lanterns WHERE created_at > ?').bind(Date.now()-60000).first();
 if(count.total>=30)return json({error:'Lots of wishes are taking flight. Try again in a minute.'},429);
 const lantern={id:crypto.randomUUID(),name,created_at:Date.now()};
 await env.DB.prepare('INSERT OR IGNORE INTO lanterns (id, visitor_key, name, created_at) VALUES (?, ?, ?, ?)').bind(lantern.id,visitor,name,lantern.created_at).run();
 const saved=await env.DB.prepare('SELECT id, name, created_at FROM lanterns WHERE visitor_key = ?').bind(visitor).first();
 return json({lantern:saved,existing:saved.id!==lantern.id},201);
 }catch{return json({error:'The shared sky is taking a moment. Please try again.'},503)}
}
