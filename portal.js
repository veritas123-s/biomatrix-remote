const message=document.getElementById('connection-message'),link=document.getElementById('open-workbench');
let bestConfig=null,lastApiRead=0;
async function fetchJSON(url,timeout=10000){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout);try{const response=await fetch(url,{cache:'no-store',credentials:'omit',signal:controller.signal});if(!response.ok)throw Error('HTTP '+response.status+' '+url);return await response.json();}finally{clearTimeout(timer);}}
function remember(cfg){
 const origin=new URL(cfg.origin);if(origin.protocol!=='https:'||!origin.hostname.endsWith('.trycloudflare.com'))throw Error('Invalid origin');
 if(!bestConfig||Date.parse(cfg.updated_at)>=Date.parse(bestConfig.updated_at))bestConfig=cfg;
 return bestConfig;
}
async function config(force=false){
 if(!bestConfig||(force&&Date.now()-lastApiRead>60000)){
  lastApiRead=Date.now();try{const out=await fetchJSON('https://api.github.com/repos/veritas123-s/biomatrix-remote/contents/endpoint.json?ts='+Date.now());return remember(JSON.parse(atob(out.content)));}catch(error){console.warn('[BioMatrix config]',error.message);}
 }
 try{return remember(await fetchJSON('https://raw.githubusercontent.com/veritas123-s/biomatrix-remote/main/endpoint.json?ts='+Date.now()));}
 catch{try{return remember(await fetchJSON('endpoint.json?ts='+Date.now()));}catch(error){if(bestConfig)return bestConfig;throw error;}}
}
async function online(cfg){const origin=new URL(cfg.origin).origin;message.dataset.checkedOrigin=origin;const health=await fetchJSON(origin+'/remote/health');if(health.online!==true)throw Error('Computer offline');return origin;}
async function checkConnection(){
 try{
  let cfg=await config(),origin;
  try{origin=await online(cfg);}catch{cfg=await config(true);origin=await online(cfg);}
  link.href=origin+'/';link.hidden=false;message.className='';message.textContent='工作台在线。点击上方按钮后输入账号和密码。';delete message.dataset.connectionError;
 }catch(error){
  console.warn('[BioMatrix connection]',error.message);message.dataset.connectionError=error.message;
  link.hidden=true;link.removeAttribute('href');message.className='error';message.textContent='计算机离线或连接正在恢复，将自动重试。也可以联系工作台主人确认电脑是否开机联网。';
 }finally{setTimeout(checkConnection,20000);}
}
checkConnection();
