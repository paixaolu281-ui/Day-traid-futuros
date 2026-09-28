'use strict';
const K='fbp_v1',$=s=>document.querySelector(s),PRE={BRL:'R$',USD:'US$',USDT:'USDT '};
const TF=['1m','5m','15m','30m','1h','4h','12h','1D'],LV=[1,2,3,5,10,20,50,100];
const pad=x=>String(x).padStart(2,'0'),ymd=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()),today=()=>ymd(new Date());
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const n=v=>{const x=parseFloat(String(v).replace(',','.'));return isFinite(x)?x:null};
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const sum=a=>a.reduce((x,y)=>x+y,0);
const fmt=(v,sg)=>{if(Math.abs(v)<.005)v=0;return(v<0?'-':sg&&v>0?'+':'')+PRE[S.cfg.cur]+Math.abs(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})};
const pc=(v,sg)=>{if(Math.abs(v)<.005)v=0;return(v<0?'-':sg&&v>0?'+':'')+Math.abs(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+'%'};
const cl=v=>v>=.005?'g':v<=-.005?'r':'n';
function seed(){const d=today(),b={date:d,margin:20,lev:10,fin:.02,fout:.05,funding:0,ex:1,strat:'Exemplo',notes:'',diary:{}};
return{cfg:{cur:'USD',init:100,dg:5,mg:100,dl:5,ml:20,fin:.02,fout:.05,rate:5.18},txs:[],sample:true,trades:[
{...b,id:uid(),time:'10:00',asset:'BTCUSDT',dir:'LONG',entry:60000,exit:60600,sl:59700,tp:61200,tf:'15m'},
{...b,id:uid(),time:'11:30',asset:'ETHUSDT',dir:'SHORT',entry:3000,exit:3030,sl:3030,tp:2900,tf:'5m',lev:5},
{...b,id:uid(),time:'14:15',asset:'SOLUSDT',dir:'SHORT',entry:150,exit:147,sl:152,tp:145,tf:'1h',lev:3}]}}
let S;try{S=JSON.parse(localStorage.getItem(K))||seed()}catch{S=seed()}
const save=()=>{try{localStorage.setItem(K,JSON.stringify(S))}catch{alert('Não foi possível salvar (armazenamento cheio ou bloqueado).')}};save();
function calc(o){const m=n(o.margin),l=n(o.lev),e=n(o.entry),x=n(o.exit),man=n(o.manual),f1=n(o.fin)||0,f2=n(o.fout)||0,fu=n(o.funding)||0;
if(m==null||m<=0)return{err:'Informe uma margem maior que zero.'};
if(l==null||l<1)return{err:'Alavancagem inválida (mínimo 1x).'};
if(e==null||e<=0)return{err:'O preço de entrada deve ser maior que zero.'};
if(f1<0||f2<0)return{err:'Taxas não podem ser negativas.'};
const pos=m*l;let mv=null,gross=null;
if(x!=null&&x>0){mv=(o.dir==='SHORT'?e-x:x-e)/e*100;gross=pos*mv/100}else if(man==null)return{err:'Informe o preço de saída ou o resultado manual.'};
const fees=pos*(f1+f2)/100,costs=fees+fu,net=man!=null?man:gross-costs;
return{pos,mv,gross,fees,fu,costs,net,roi:net/m*100,manual:man!=null}}
const nt=t=>{const r=calc(t);return r.err?0:r.net};
const bal=()=>S.cfg.init+sum(S.txs.map(x=>x.type==='dep'?x.amt:-x.amt))+sum(S.trades.map(nt));
const sm=f=>sum(S.trades.filter(t=>t.date>=f).map(nt));
const wk=()=>{const d=new Date();d.setDate(d.getDate()-((d.getDay()+6)%7));return ymd(d)};
const res=(r,base)=>r.err?`<p class="r">${r.err}</p>`:`<div class="box"><p><span>Posição</span><b>${fmt(r.pos)}</b></p><p><span>Movimento</span><b>${r.mv==null?'—':pc(r.mv,1)}</b></p><p><span>PNL bruto</span><b class="${cl(r.gross||0)}">${r.gross==null?'—':fmt(r.gross,1)}</b></p><p><span>Custos (taxas ${fmt(r.fees)} + funding ${fmt(r.fu)})</span><b class="r">${fmt(-r.costs)}</b></p><p><span>PNL líquido${r.manual?' (manual)':''}</span><b class="${cl(r.net)}">${fmt(r.net,1)}</b></p><p><span>ROI</span><b class="${cl(r.roi)}">${pc(r.roi,1)}</b></p>${base==null?'':`<p><span>Saldo após operação</span><b>${fmt(base+r.net)}</b></p>`}</div>`;
const kpi=(l,v,c='')=>`<div class="k"><small>${l}</small><b class="${c}">${v}</b></div>`;
let V='dash',F={},RG=90;
const NAV=[['dash','Painel','▦'],['ops','Operações','☰'],['calc','Calculadora','🖩'],['stats','Análises','◔'],['cfg','Config','⚙']];
function go(v){V=v;$('#nav').innerHTML=NAV.map(x=>`<button class="${x[0]==v?'on':''}" onclick="go('${x[0]}')"><i>${x[2]}</i>${x[1]}</button>`).join('');
$('#v').innerHTML={dash,ops,calc:calcV,stats,cfg}[v]();if(v=='dash')draw();if(v=='calc')cc();scrollTo(0,0)}
function M(h){const m=$('#m');m.innerHTML='<div>'+h+'</div>';m.hidden=false}const X=()=>{$('#m').hidden=true;$('#m').innerHTML=''};
function dash(){const c=S.cfg,b=bal(),t=today(),d=sm(t),w=sm(wk()),mo=sm(t.slice(0,8)+'01'),tot=sum(S.trades.map(nt));let al='';
if(c.dg>0)al+=`<div class="card"><small>Meta diária</small><p>Meta ${fmt(c.dg)} · Resultado <b class="${cl(d)}">${fmt(d,1)}</b> · ${Math.round(Math.max(0,d)/c.dg*100)}%</p><div class="bar"><div style="width:${Math.min(100,Math.max(0,d)/c.dg*100)}%"></div></div>${d>=c.dg?'<p class="g"><b>Meta diária atingida</b></p>':''}</div>`;
if(c.dl>0&&d<=-c.dl)al+='<div class="warn">Limite diário de perda atingido.</div>';
if(c.ml>0&&mo<=-c.ml)al+='<div class="warn">Limite mensal de perda atingido.</div>';
if(c.mg>0&&mo>=c.mg)al+='<div class="card g"><b>Meta mensal atingida</b></div>';
return`${S.sample?'<div class="warn"><b>DADOS DE EXEMPLO</b> <button class="s" onclick="clrEx()">Limpar dados de exemplo</button></div>':''}
<div class="card"><small>SALDO ATUAL</small><div class="big">${fmt(b)}</div><small>Banca inicial ${fmt(c.init)} · Crescimento <b class="${cl(tot)}">${pc(c.init?tot/c.init*100:0,1)}</b></small></div>${al}
<div class="grid">${kpi('Hoje',fmt(d,1),cl(d))}${kpi('Esta semana',fmt(w,1),cl(w))}${kpi('Este mês',fmt(mo,1),cl(mo))}${kpi('Total',fmt(tot,1),cl(tot))}</div>
<h3>Evolução da banca</h3><div class="card"><canvas id="cv"></canvas><div class="row">${[[7,'7 dias'],[30,'30 dias'],[90,'90 dias'],[0,'Todos']].map(x=>`<button class="${RG==x[0]?'':'s'}" onclick="RG=${x[0]};go('dash')">${x[1]}</button>`).join('')}</div></div>
<small>Seus dados são armazenados localmente neste dispositivo.</small>`}
function clrEx(){if(!confirm('Remover as operações de exemplo?'))return;S.trades=S.trades.filter(t=>!t.ex);S.sample=false;save();go('dash')}
function draw(){const cv=$('#cv');if(!cv)return;const W=cv.width=cv.clientWidth*2,H=cv.height=360,x=cv.getContext('2d');
const ev=[...S.trades.map(t=>[t.date,nt(t)]),...S.txs.map(t=>[t.date,t.type==='dep'?t.amt:-t.amt])].sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:0);
let v=S.cfg.init,p=[[ev.length?ev[0][0]:today(),v]];ev.forEach(e=>{v+=e[1];p.push([e[0],v])});
if(RG){const f=ymd(new Date(Date.now()-RG*864e5));const q=p.filter(a=>a[0]>=f);p=q.length?q:[p[p.length-1]]}
const ys=p.map(a=>a[1]),mn=Math.min(...ys),mx=Math.max(...ys),sp=(mx-mn)||1;x.strokeStyle='#5b8def';x.lineWidth=4;x.beginPath();
p.forEach((a,i)=>{const px=p.length<2?W/2:30+i*(W-60)/(p.length-1),py=H-30-(a[1]-mn)/sp*(H-60);i?x.lineTo(px,py):x.moveTo(px,py)});x.stroke();
x.fillStyle='#8a98b0';x.font='24px sans-serif';x.fillText(fmt(mx),8,22);x.fillText(fmt(mn),8,H-4)}
const opt=(l,v,a)=>`<option value="${l}" ${l==v?'selected':''}>${a||l}</option>`;
const flt=()=>S.trades.filter(t=>{const r=nt(t);return(!F.df||t.date>=F.df)&&(!F.a||t.asset.toLowerCase().includes(F.a.toLowerCase()))&&(!F.d||t.dir==F.d)&&(!F.tf||t.tf==F.tf)&&(!F.r||(F.r=='w'?r>0:r<0))&&(!F.l||t.lev==F.l)&&(!F.s||(t.strat||'').toLowerCase().includes(F.s.toLowerCase()))}).sort((a,b)=>(b.date+b.time)>(a.date+a.time)?1:-1);
const lst=()=>flt().map(t=>{const r=calc(t);return`<div class="it" onclick="det('${t.id}')"><div><b>${esc(t.asset)}</b> <span class="tag">${t.dir}</span> <span class="tag">${t.lev}x</span><br><small>${t.date} ${t.time||''} · ${t.tf||''}</small></div><div style="text-align:right"><b class="${cl(r.net||0)}">${r.err?'—':fmt(r.net,1)}</b><br><small class="${cl(r.roi||0)}">${r.err?'':pc(r.roi,1)}</small></div></div>`}).join('')||'<p class="mu">Nenhuma operação encontrada.</p>';
const sf=(k,v)=>{F[k]=v;$('#list').innerHTML=lst()};
function ops(){return`<div class="row"><button onclick="form()">+ Nova operação</button></div><div class="card"><div class="g2">
<label>A partir de<input type="date" value="${F.df||''}" onchange="sf('df',this.value)"></label><label>Ativo<input value="${esc(F.a)}" oninput="sf('a',this.value)"></label>
<label>Direção<select onchange="sf('d',this.value)">${opt('',F.d,'Todas')}${opt('LONG',F.d)}${opt('SHORT',F.d)}</select></label>
<label>Timeframe<select onchange="sf('tf',this.value)">${opt('',F.tf,'Todos')}${TF.map(x=>opt(x,F.tf)).join('')}</select></label>
<label>Resultado<select onchange="sf('r',this.value)">${opt('',F.r,'Todas')}${opt('w',F.r,'Lucro')}${opt('l',F.r,'Prejuízo')}</select></label>
<label>Alavancagem<select onchange="sf('l',this.value)">${opt('',F.l,'Todas')}${LV.map(x=>opt(x,F.l,x+'x')).join('')}</select></label>
<label>Estratégia<input value="${esc(F.s)}" oninput="sf('s',this.value)"></label></div></div><div id="list">${lst()}</div>`}
const DB=[['plan','Segui meu plano?'],['stop','Respeitei o Stop?'],['tp','Respeitei o Take Profit?'],['early','Saí antes?'],['imp','Entrei por impulso?']],DT=[['why','Por que entrei?'],['ana','Qual era minha análise?'],['exp','Qual era minha expectativa?'],['learn','O que aprendi?']];
let EID=null;
function form(id,dup){const o=S.trades.find(x=>x.id==id),t=o||{date:today(),time:new Date().toTimeString().slice(0,5),dir:'LONG',tf:'15m',lev:10,fin:S.cfg.fin,fout:S.cfg.fout,funding:0,diary:{}},d=t.diary||{};
if(dup&&o){t.date=today();t.ex=0}EID=o&&!dup?id:null;
const i=(k,l,type)=>`<label>${l}<input id="f_${k}" ${type=='date'||type=='time'?`type="${type}"`:'inputmode="decimal"'} ${k=='lev'?'list="lv"':''} value="${esc(t[k])}"></label>`;
const tx=(k,l,v)=>`<label>${l}<input id="f_${k}" value="${esc(v)}"></label>`;
M(`<h3>${EID?'Editar':'Nova'} operação</h3><div class="g2">${i('date','Data','date')}${i('time','Hora','time')}${tx('asset','Ativo (ex: BTCUSDT)',t.asset)}
<label>Direção<select id="f_dir">${opt('LONG',t.dir)}${opt('SHORT',t.dir)}</select></label>${i('margin','Margem')}${i('lev','Alavancagem (x)')}${i('entry','Preço de entrada')}${i('exit','Preço de saída')}${i('sl','Stop Loss')}${i('tp','Take Profit')}
<label>Timeframe<select id="f_tf">${TF.map(x=>opt(x,t.tf)).join('')}</select></label>${tx('strat','Estratégia',t.strat)}${i('fin','Taxa entrada (%)')}${i('fout','Taxa saída (%)')}${i('funding','Funding pago (+) / recebido (−)')}${i('manual','Resultado manual (opcional)')}</div>
<label>Observações<textarea id="f_notes">${esc(t.notes)}</textarea></label><div id="pv"></div>
<h4>Diário</h4>${DT.map(x=>`<label>${x[1]}<textarea id="f_${x[0]}">${esc(d[x[0]])}</textarea></label>`).join('')}${DB.map(x=>`<label><input type="checkbox" id="f_${x[0]}" ${d[x[0]]?'checked':''}>${x[1]}</label>`).join('')}
<label>Nota da execução do plano (1 a 5, avaliação pessoal)<select id="f_score">${['',1,2,3,4,5].map(x=>opt(x,d.score,x||'—')).join('')}</select></label>
<div class="row"><button onclick="saveT()">Salvar</button><button class="s" onclick="X()">Cancelar</button></div>`);
$('#m').oninput=pv;pv()}
const gv=k=>$('#f_'+k).value;
function pv(){const o={};['dir','margin','lev','entry','exit','fin','fout','funding','manual'].forEach(k=>o[k]=gv(k));const old=S.trades.find(x=>x.id==EID);
$('#pv').innerHTML=res(calc(o),bal()-(old?nt(old):0))}
function saveT(){const t={id:EID||uid(),date:gv('date'),time:gv('time'),asset:gv('asset').toUpperCase().trim(),strat:gv('strat').trim(),tf:gv('tf'),dir:gv('dir'),notes:gv('notes'),diary:{score:gv('score')}};
['margin','lev','entry','exit','sl','tp','fin','fout','funding','manual'].forEach(k=>t[k]=n(gv(k)));
DT.forEach(x=>t.diary[x[0]]=gv(x[0]));DB.forEach(x=>t.diary[x[0]]=$('#f_'+x[0]).checked);
if(!t.date||!t.asset)return alert('Informe a data e o ativo.');const r=calc(t);if(r.err)return alert(r.err);
for(const[k,nm]of[['sl','Stop Loss'],['tp','Take Profit']]){const v=t[k];if(v==null)continue;const bad=v<=0||(k=='sl'?(t.dir=='LONG'?v>=t.entry:v<=t.entry):(t.dir=='LONG'?v<=t.entry:v>=t.entry));if(bad)return alert(nm+' inválido para a direção '+t.dir+'.')}
const ix=S.trades.findIndex(x=>x.id==t.id);ix>=0?S.trades[ix]=t:S.trades.push(t);save();X();go(V)}
function det(id){const t=S.trades.find(x=>x.id==id),d=t.diary||{};
M(`<h3>${esc(t.asset)} <span class="tag">${t.dir}</span></h3><p class="mu">${t.date} ${t.time||''} · ${t.tf} · ${t.lev}x · Margem ${fmt(t.margin)}<br>Entrada ${t.entry} · Saída ${t.exit??'—'} · SL ${t.sl??'—'} · TP ${t.tp??'—'}<br>Estratégia: ${esc(t.strat)||'—'}</p>${res(calc(t))}<p>${esc(t.notes)}</p><h4>Diário</h4>`+
DT.map(x=>d[x[0]]?`<p><small>${x[1]}</small><br>${esc(d[x[0]])}</p>`:'').join('')+DB.map(x=>`<p>${x[1]} <b>${d[x[0]]?'Sim':'Não'}</b></p>`).join('')+`<p>Nota: <b>${d.score||'—'}</b></p>
<div class="row"><button onclick="form('${id}')">Editar</button><button class="s" onclick="form('${id}',1)">Duplicar</button><button class="d" onclick="del('${id}')">Excluir</button></div><button class="s" style="width:100%" onclick="X()">Fechar</button>`)}
function del(id){if(!confirm('Excluir esta operação? Não é possível desfazer.'))return;S.trades=S.trades.filter(t=>t.id!=id);save();X();go(V)}
const inp=(id,l,v='')=>`<label>${l}<input id="${id}" inputmode="decimal" value="${v}" oninput="cc()"></label>`,dirS=id=>`<label>Direção<select id="${id}" onchange="cc()"><option>LONG<option>SHORT</select></label>`;
function calcV(){return`<div class="warn">Os valores abaixo são estimativas matemáticas, não garantia de resultado.</div>
<h3>Calculadora de futuros</h3><div class="card"><div class="g2">${inp('k_m','Capital/margem','20')}${inp('k_l','Alavancagem (x)','10')}${inp('k_mv','Movimento esperado %','5')}${dirS('k_d')}${inp('k_e','Preço de entrada')}${inp('k_x','Preço de saída (opcional)')}${inp('k_f1','Taxa entrada %',S.cfg.fin)}${inp('k_f2','Taxa saída %',S.cfg.fout)}${inp('k_fu','Funding (+pago/−recebido)','0')}</div><div id="o1"></div></div>
<h3>Gestão de risco</h3><div class="card"><div class="g2">${inp('r_b','Saldo da banca',bal().toFixed(2))}${inp('r_p','% máximo a perder','1')}${inp('r_e','Preço de entrada')}${inp('r_s','Preço do Stop Loss')}${inp('r_l','Alavancagem (x)','10')}${dirS('r_d')}</div><div id="o2"></div></div>
<h3>Take Profit</h3><div class="card"><div class="g2">${inp('t_e','Entrada')}${inp('t_t','Take Profit')}${inp('t_m','Margem','20')}${inp('t_l','Alavancagem (x)','10')}${dirS('t_d')}${inp('t_s','Stop Loss (opcional)')}</div><div id="o3"></div></div>
<h3>Conversor USD/BRL</h3><div class="card">${inp('cv_r','Cotação USD/BRL',S.cfg.rate)}<div id="o4"></div></div>`}
const v$=id=>$('#'+id).value,W=(id,h)=>$('#'+id).innerHTML=h;
function cc(){if(!$('#o1'))return;
let e=n(v$('k_e'))||100,d=v$('k_d'),x=n(v$('k_x')),mv=n(v$('k_mv'));
if(x==null){if(mv==null)return W('o1','<p class="mu">Informe o movimento % ou o preço de saída.</p>');x=e*(1+(d=='SHORT'?-1:1)*mv/100)}
const r=calc({dir:d,margin:v$('k_m'),lev:v$('k_l'),entry:e,exit:x,fin:v$('k_f1'),fout:v$('k_f2'),funding:v$('k_fu')});
W('o1',r.err?`<p class="r">${r.err}</p>`:res(r)+`<p>Saldo final estimado: <b>${fmt(n(v$('k_m'))+r.net)}</b> (margem + resultado)</p>`);
// risco
{const b=n(v$('r_b')),p=n(v$('r_p')),en=n(v$('r_e')),sl=n(v$('r_s')),l=n(v$('r_l')),dr=v$('r_d');let h='';
if([b,p,en,sl,l].some(a=>a==null))h='<p class="mu">Preencha todos os campos.</p>';
else if(b<=0||p<=0||p>100||en<=0||sl<=0||l<1)h='<p class="r">Valores inválidos.</p>';
else if(dr=='LONG'?sl>=en:sl<=en)h='<p class="r">Stop inválido para a direção escolhida.</p>';
else{const ds=Math.abs(en-sl)/en*100,rk=b*p/100,mp=rk/(ds/100),R=S.cfg.rate,br=S.cfg.cur=='BRL';
h=`<div class="box"><p><span>Risco (${S.cfg.cur})</span><b>${fmt(rk)}</b></p><p><span>Risco em USD</span><b>US$${(br?rk/R:rk).toFixed(2).replace('.',',')}</b></p><p><span>Risco em BRL</span><b>R$${(br?rk:rk*R).toFixed(2).replace('.',',')}</b></p><p><span>Distância até o Stop</span><b>${pc(ds)}</b></p><p><span>Tamanho máx. da posição</span><b>${fmt(mp)}</b></p><p><span>Margem necessária (${l}x)</span><b>${fmt(mp/l)}</b></p><p><span>Risco % da banca</span><b>${pc(p)}</b></p></div>`}W('o2',h)}
// TP
{const en=n(v$('t_e')),tp=n(v$('t_t')),m=n(v$('t_m')),l=n(v$('t_l')),sl=n(v$('t_s')),dr=v$('t_d'),sg=dr=='SHORT'?-1:1;let h='';
if([en,tp,m,l].some(a=>a==null))h='<p class="mu">Preencha entrada, TP, margem e alavancagem.</p>';
else if(en<=0||tp<=0||m<=0||l<1)h='<p class="r">Valores inválidos.</p>';
else if(sg*(tp-en)<=0)h='<p class="r">Take Profit inválido para a direção escolhida.</p>';
else if(sl!=null&&(sl<=0||sg*(sl-en)>=0))h='<p class="r">Stop inválido para a direção escolhida.</p>';
else{const a=sg*(tp-en)/en*100,lu=m*l*a/100;h=`<div class="box"><p><span>Movimento</span><b class="g">${pc(a,1)}</b></p><p><span>Lucro estimado</span><b class="g">${fmt(lu,1)}</b></p><p><span>ROI</span><b class="g">${pc(lu/m*100,1)}</b></p>`;
if(sl!=null){const rs=Math.abs(en-sl)/en*100;h+=`<p><span>Risco</span><b>${pc(rs)}</b></p><p><span>Alvo</span><b>${pc(a)}</b></p><p><span>Risco/Retorno</span><b>1:${(a/rs).toFixed(2).replace('.',',')}</b></p>`}h+='</div>'}W('o3',h)}
{const r=n(v$('cv_r'));if(r&&r>0){S.cfg.rate=r;save()}W('o4',r&&r>0?`<table>${[20,100,500,1000].map(u=>`<tr><td>US$${u.toLocaleString('pt-BR')}</td><td>R$${(u*r).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}</td></tr>`).join('')}</table>`:'<p class="r">Cotação inválida.</p>')}}
const grp=L=>{const p=L.map(nt),w=p.filter(a=>a>0),l=p.filter(a=>a<0),pnl=sum(p),mg=sum(L.map(t=>n(t.margin)||0));return{n:L.length,w:w.length,l:l.length,pnl,gw:sum(w),gl:sum(l),roi:mg?pnl/mg*100:0,hit:L.length?w.length/L.length*100:0,mw:w.length?Math.max(...w):0,ml:l.length?Math.min(...l):0}};
const tbl=(t,ks,f,lb)=>{const rows=ks.map(k=>[lb?lb(k):k,grp(S.trades.filter(x=>f(x,k)))]);return`<h3>${t}</h3><div class="card" style="overflow:auto"><table><tr><th></th><th>Ops</th><th>V/D</th><th>PNL</th><th>ROI</th><th>Acerto</th></tr>${rows.map(([k,g])=>`<tr><td>${k}</td><td>${g.n}</td><td>${g.w}/${g.l}</td><td class="${cl(g.pnl)}">${fmt(g.pnl,1)}</td><td>${pc(g.roi)}</td><td>${g.n?pc(g.hit):'—'}</td></tr>`).join('')}</table></div>`};
function stats(){const g=grp(S.trades),fees=sum(S.trades.map(t=>{const r=calc(t);return r.err?0:r.fees})),fu=sum(S.trades.map(t=>{const r=calc(t);return r.err?0:r.fu}));
return`<div class="grid">${kpi('Operações',g.n)}${kpi('Vencedoras',g.w,'g')}${kpi('Perdedoras',g.l,'r')}${kpi('Taxa de acerto',g.n?pc(g.hit):'—')}${kpi('Lucro total',fmt(g.gw),'g')}${kpi('Prejuízo total',fmt(g.gl),'r')}${kpi('Resultado líquido',fmt(g.pnl,1),cl(g.pnl))}${kpi('Média de lucro',g.w?fmt(g.gw/g.w):'—')}${kpi('Média de prejuízo',g.l?fmt(g.gl/g.l):'—')}${kpi('Maior lucro',fmt(g.mw))}${kpi('Maior prejuízo',fmt(g.ml))}${kpi('Profit Factor',g.gl?(g.gw/-g.gl).toFixed(2).replace('.',','):'—')}${kpi('Expectativa/op.',g.n?fmt(g.pnl/g.n,1):'—')}${kpi('Total de taxas',fmt(fees))}${kpi('Total de funding',fmt(fu))}${kpi('ROI acum. (s/ margens)',pc(g.roi,1),cl(g.roi))}</div>`+
tbl('Por timeframe',TF,(t,k)=>t.tf==k)+tbl('LONG vs SHORT',['LONG','SHORT'],(t,k)=>t.dir==k)+tbl('Por alavancagem',LV,(t,k)=>t.lev==k,k=>k+'x')+'<small>Estatísticas descritivas dos dados registrados por você; não indicam resultados futuros.</small>'}
function ledger(){const ev=[...S.txs.map(x=>({d:x.date,l:x.type==='dep'?'Depósito':'Retirada',v:x.type==='dep'?x.amt:-x.amt,id:x.id})),...S.trades.map(t=>{const r=calc(t);return[{d:t.date,l:'Resultado bruto '+esc(t.asset),v:r.err?0:(r.manual?r.net+r.costs:r.gross)},{d:t.date,l:'Taxas '+esc(t.asset),v:r.err?0:-r.fees},{d:t.date,l:'Funding '+esc(t.asset),v:r.err?0:-r.fu}]}).flat()].filter(e=>Math.abs(e.v)>=.005).sort((a,b)=>a.d<b.d?-1:a.d>b.d?1:0);
let b=S.cfg.init;const rows=ev.map(e=>{b+=e.v;return`<tr><td>${e.d.slice(8)}/${e.d.slice(5,7)}</td><td>${e.l}</td><td class="${cl(e.v)}">${fmt(e.v,1)}</td><td>${fmt(b)}</td></tr>`});
return`<table><tr><th>Data</th><th>Evento</th><th>Valor</th><th>Saldo</th></tr><tr><td></td><td>Saldo inicial</td><td></td><td>${fmt(S.cfg.init)}</td></tr>${rows.slice(-60).join('')}</table>${S.txs.map(x=>`<div class="it" onclick="delTx('${x.id}')"><span>${x.date} ${x.type==='dep'?'Depósito':'Retirada'} ${fmt(x.amt)}</span><small>excluir</small></div>`).join('')}`}
function cfg(){const c=S.cfg,i=(k,l)=>`<label>${l}<input id="cf_${k}" inputmode="decimal" value="${c[k]}"></label>`;
return`<h3>Configurar banca</h3><div class="card"><div class="g2"><label>Moeda principal<select id="cf_cur">${['BRL','USD','USDT'].map(x=>opt(x,c.cur)).join('')}</select></label>${i('init','Saldo inicial')}${i('dg','Meta diária')}${i('mg','Meta mensal')}${i('dl','Limite de perda diário')}${i('ml','Limite de perda mensal')}${i('fin','Taxa de entrada padrão (%)')}${i('fout','Taxa de saída padrão (%)')}${i('rate','Cotação USD/BRL')}</div><small>Maker/Taker: informe a taxa % da sua corretora (taxas típicas variam; edite livremente).</small><div class="row"><button onclick="saveC()">Salvar</button></div></div>
<h3>Depósito / Retirada</h3><div class="card"><div class="g2"><label>Valor<input id="tx_a" inputmode="decimal"></label><label>Data<input id="tx_d" type="date" value="${today()}"></label></div><div class="row"><button onclick="addTx('dep')">Depositar</button><button class="s" onclick="addTx('ret')">Retirar</button></div></div>
<h3>Histórico financeiro</h3><div class="card" style="overflow:auto">${ledger()}</div>
<h3>Backup</h3><div class="card"><div class="row"><button onclick="exp()">Exportar dados (JSON)</button><button class="s" onclick="$('#fi').click()">Importar dados</button></div><input id="fi" type="file" accept=".json,application/json" hidden onchange="imp(event)"><div class="row"><button class="d" onclick="wipe()">Apagar todos os dados</button></div></div>
<small>Seus dados são armazenados localmente neste dispositivo.</small><div class="warn">Este aplicativo é uma ferramenta de registro, cálculo e análise pessoal. Os resultados calculados são estimativas matemáticas e não representam garantia de lucro. Operações com alavancagem envolvem risco elevado, incluindo possibilidade de perda da margem utilizada.</div>`}
function saveC(){const g=k=>n($('#cf_'+k).value),o={cur:$('#cf_cur').value};
for(const k of['init','dg','mg','dl','ml','fin','fout','rate']){const v=g(k);if(v==null||v<0)return alert('Valor inválido em: '+k);o[k]=Math.abs(v)}
if(o.rate<=0)return alert('Cotação inválida.');S.cfg=o;save();go('cfg')}
function addTx(t){const a=n($('#tx_a').value),d=$('#tx_d').value;if(a==null||a<=0||!d)return alert('Informe valor positivo e data.');S.txs.push({id:uid(),type:t,amt:a,date:d});save();go('cfg')}
function delTx(id){if(confirm('Excluir esta movimentação?')){S.txs=S.txs.filter(x=>x.id!=id);save();go('cfg')}}
function exp(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,1)],{type:'application/json'}));a.download='futures-bank-pro-'+today()+'.json';a.click()}
function imp(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!d.cfg||!Array.isArray(d.trades))throw 0;d.txs=d.txs||[];if(!confirm('Substituir os dados atuais pelo backup?'))return;S=d;save();go('cfg')}catch{alert('Arquivo inválido.')}};r.readAsText(f)}
function wipe(){if(confirm('Apagar TODOS os dados deste dispositivo?')){S={cfg:{...S.cfg,init:0},trades:[],txs:[],sample:false};save();go('cfg')}}
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('service-worker.js').catch(()=>{}));
go('dash');
