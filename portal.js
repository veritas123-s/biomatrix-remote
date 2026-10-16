const message=document.getElementById('connection-message'),link=document.getElementById('open-workbench');
let firstLoad=true;
async function fetchJSON(url,timeout=10000){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout);try{const response=await fetch(url,{cache:'no-store',credentials:'omit',signal:controller.signal});if(!response.ok)throw Error('HTTP '+response.status);return await response.json();}finally{clearTimeout(timer);}}
async function config(){
 if(firstLoad){firstLoad=false;try{const out=await fetchJSON('https://api.github.com/repos/veritas123-s/biomatrix-remote/contents/endpoint.json?ts='+Date.now());return JSON.parse(atob(out.content));}catch{}}
 try{return await fetchJSON('https://raw.githubusercontent.com/veritas123-s/biomatrix-remote/main/endpoint.json?ts='+Date.now());}
 catch{return await fetchJSON('endpoint.json?ts='+Date.now());}
}
async function checkConnection(){
 try{
  const cfg=await config(),origin=new URL(cfg.origin);
  if(origin.protocol!=='https:'||!origin.hostname.endsWith('.trycloudflare.com'))throw Error('Invalid origin');
  const health=await fetchJSON(origin.origin+'/remote/health');if(health.online!==true)throw Error('Offline');
  link.href=origin.origin+'/';link.hidden=false;message.className='';message.textContent='工作台在线。点击上方按钮后输入账号和密码。';
 }catch{
  link.hidden=true;link.removeAttribute('href');message.className='error';message.textContent='计算机离线或连接正在恢复，将自动重试。也可以联系工作台主人确认电脑是否开机联网。';
 }finally{setTimeout(checkConnection,20000);}
}
checkConnection();
