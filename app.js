/* ===== Utilidades ===== */
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const U=['zero','um','dois','três','quatro','cinco','seis','sete','oito','nove','dez','onze','doze','treze','quatorze','quinze','dezesseis','dezessete','dezoito','dezenove'],
D10=['','','vinte','trinta','quarenta','cinquenta','sessenta','setenta','oitenta','noventa'],
C100=['','cento','duzentos','trezentos','quatrocentos','quinhentos','seiscentos','setecentos','oitocentos','novecentos'];
function w(n){if(n<20)return U[n];if(n<100)return D10[n/10|0]+(n%10?' e '+U[n%10]:'');if(n==100)return'cem';
 if(n<1000)return C100[n/100|0]+(n%100?' e '+w(n%100):'');const m=n/1000|0,r=n%1000;
 return(m==1?'mil':w(m)+' mil')+(r?(r<100||r%100==0?' e ':' ')+w(r):'')}
const mes=n=>{n=+n;return Number.isInteger(n)&&n<1e6?`${n} (${w(n)}) ${n==1?'mês':'meses'}`:n+' meses'};
const pct=n=>{n=+n;return Number.isInteger(n)?`${n}% (${w(n)} por cento)`:n+'%'};
function money(v){v=+v;if(!(v>=0)||v>=1e6)return'R$ '+v;const r=Math.floor(v),c=Math.round((v-r)*100);
 return'R$ '+v.toLocaleString('pt-BR',{minimumFractionDigits:2})+' ('+w(r)+(r==1?' real':' reais')+(c?' e '+w(c)+(c==1?' centavo':' centavos'):'')+')'}
const UN=['','Primeira','Segunda','Terceira','Quarta','Quinta','Sexta','Sétima','Oitava','Nona'],TN={1:'Décima',2:'Vigésima',3:'Trigésima'};
const ord=n=>n<10?UN[n]:TN[n/10|0]+(n%10?' '+UN[n%10]:'');
const ordM=n=>ord(n).replace(/a\b/g,'o');
const today=()=>new Date().toISOString().slice(0,10);

/* ===== Etapas e campos ===== */
const civil=['Solteiro(a)','Casado(a)','União estável','Divorciado(a)','Viúvo(a)'];
const pessoa=p=>[
 {k:p+'_nome',l:'Nome completo',ph:'Ex.: Maria da Silva Souza',full:1},
 {k:p+'_civil',l:'Estado civil',opt:civil},
 {k:p+'_prof',l:'Profissão',ph:'Ex.: Professora'},
 {k:p+'_rg',l:'RG',ph:'Ex.: 12.345.678-9'},
 {k:p+'_cpf',l:'CPF',ph:'000.000.000-00',mask:'cpf',im:'numeric',pat:'.{14}'}];
const STEPS=[
 {n:'Locador',t:'Dados do locador',s:'Quem é o dono do imóvel e vai receber o aluguel.',f:[...pessoa('l'),
  {k:'l_end',l:'Rua / Avenida',ph:'Ex.: Rua das Flores',full:1},{k:'l_num',l:'Número',ph:'Ex.: 120'},{k:'l_bairro',l:'Bairro',ph:'Ex.: Centro'},
  {k:'l_cidade',l:'Cidade/UF',ph:'Ex.: Rio de Janeiro/RJ'},{k:'l_cep',l:'CEP',ph:'00000-000',mask:'cep',im:'numeric'}]},
 {n:'Locatário',t:'Dados do locatário',s:'Quem vai morar no imóvel (inquilino).',f:pessoa('t')},
 {n:'Imóvel',t:'Imóvel alugado',s:'Endereço do imóvel que será locado.',f:[
  {k:'i_end',l:'Rua / Avenida',ph:'Ex.: Av. Atlântica',full:1},{k:'i_num',l:'Número',ph:'Ex.: 500'},
  {k:'i_compl',l:'Complemento',ph:'Ex.: apto 301',req:0},{k:'i_bairro',l:'Bairro',ph:'Ex.: Copacabana'},
  {k:'i_cidade',l:'Cidade/UF',ph:'Ex.: Rio de Janeiro/RJ'},{k:'i_cep',l:'CEP',ph:'00000-000',mask:'cep',im:'numeric',full:1}]},
 {n:'Aluguel',t:'Prazo e valor',s:'Duração do contrato e valor mensal.',f:[
  {k:'prazo',l:'Prazo (meses)',ph:'Ex.: 12',t:'number',min:1},{k:'valor',l:'Aluguel mensal (R$)',ph:'Ex.: 1500.00',t:'number',step:'0.01',min:0.01},
  {k:'dia',l:'Dia do vencimento',ph:'Ex.: 5',t:'number',min:1,max:31},{k:'data',l:'Data do contrato',t:'date',def:today()},
  {k:'foro',l:'Foro (cidade/UF)',ph:'Ex.: Rio de Janeiro/RJ',full:1}]},
{n:'Utensílios',t:'Animais, utensílios e contas',s:'Responda sim ou não. Só pedimos os dados do que você escolher incluir.',f:[
 {k:'q_animais',yn:1,l:'Animais de estimação são permitidos?',sub:[]},
 {k:'q_uten',yn:1,l:'O imóvel está sendo alugado com utensílios ou móveis?',sub:[{k:'itens',l:'Quais itens?',ph:'Ex.: fogão, geladeira, ar-condicionado',full:1,ta:1}]},
 {k:'q_contas',yn:1,l:'O locatário deve transferir as contas (água, luz, gás) para o nome dele?',sub:[{k:'diasContas',l:'Prazo (dias)',ph:'Ex.: 15',t:'number',min:1},{k:'extra',l:'Outras contas',ph:'Ex.: internet',req:0}]}]},
 {n:'Atrasos',t:'Atraso no pagamento',s:'Cláusulas de cobrança. Se responder “Não”, elas não entram no contrato.',f:[
 {k:'q_atraso',yn:1,l:'Cobrar acréscimo (multa e juros) se o aluguel atrasar?',sub:[{k:'atraso',l:'Multa (%)',ph:'Ex.: 2',t:'number',min:0},{k:'juros',l:'Juros ao mês (%)',ph:'Ex.: 1',t:'number',min:0}]},
 {k:'q_dias',yn:1,l:'Permitir rescindir o contrato se o atraso passar de certo prazo?',sub:[{k:'dias',l:'Atraso máximo (dias)',ph:'Ex.: 30',t:'number',min:1}]},
 {k:'q_honor',yn:1,l:'Cobrar honorários advocatícios na cobrança do atraso?',sub:[{k:'honor',l:'Honorários (%)',ph:'Ex.: 20',t:'number',min:0,def:'20'}]}]},
 {n:'Multas',t:'Multa por descumprimento',s:'Multa em meses de aluguel.',f:[
 {k:'q_multa',yn:1,l:'Prever multa por saída antecipada, devolução fora do prazo ou descumprimento do contrato?',sub:[{k:'multa',l:'Multa (meses de aluguel)',ph:'Ex.: 3',t:'number',min:1}]}]}];
const REV=STEPS.length, FIM=REV+1;

/* ===== Cláusulas do modelo ===== */
const L='(a) LOCATÁRIO (A)',R='(a) LOCADOR (A)';
const C0=[
{id:'objeto',t:'Objeto',x:'O objeto de locação é o imóvel residencial, localizado na {end}, nº {num}{compl}, {bairro}, {cidade}, CEP {cep}.'},
{id:'prazo',t:'Prazo',x:'O prazo da locação é de {prazo} meses, tendo início na data da assinatura do presente contrato, ocasião em que são entregues as chaves do imóvel ao (à) LOCATÁRIO (A).',
 p:['@q_multa@Se o '+L+' desocupar o imóvel antes do prazo estipulado na [#prazo], ficará obrigado a pagar, a título de multa, o valor equivalente a {multa} de aluguel, podendo ser isentado a critério do '+R+' quando da desocupação, mediante termo aditivo expresso e formal.']},
{id:'devol',t:'Término do prazo',x:'No dia subsequente ao término do prazo estipulado na [#prazo], o (à) LOCATÁRIO (A), independentemente de aviso, notificação ou interpelação judicial ou extrajudicial, deverá restituir o imóvel{mt1}, SALVO se, em comum acordo, o presente contrato de locação for prorrogado, ocasião em que deverá ser elaborado obrigatoriamente termo aditivo de locação estipulando novo prazo e com reajuste do preço do aluguel.'},
{id:'aluguel',t:'Valor do aluguel',x:'O valor do aluguel mensal será de {valor}, que deverá ser pago obrigatoriamente até o dia {dia} de cada mês, em moeda corrente e em mãos do '+R+'.',
 p:['@q_atraso@Em caso de atraso no pagamento do aluguel no prazo estipulado na [#aluguel], será aplicada automaticamente multa de {atraso} sobre o valor do aluguel, juros de mora de {juros} e correção pelo INPC do montante devido.',
 'O (A) LOCATÁRIO (A) não poderá reter o pagamento do aluguel mensal ou outros encargos, sob a alegação de não atendimento de suas eventuais exigências.']},
{id:'atraso',q:'q_dias',t:'Rescisão por atraso',x:'O atraso no pagamento do aluguel, bem como das despesas ordinárias que incidam sobre o imóvel por mais de {dias} dias, será causa de rescisão do contrato de locação{mt2}.'},
{id:'honor',q:'q_honor',t:'Honorários advocatícios',x:'Em caso de atraso no pagamento do aluguel será realizada a cobrança por meio de escritório de advocacia, e ficará o (a) LOCATÁRIO (A) sujeito ao pagamento dos honorários advocatícios no valor de {honor} sobre o valor do débito atualizado, independentemente das multas e demais cominações legais.',
 p:['@q_honor@Os honorários advocatícios de {honor} descritos na [#honor] se aplicam para qualquer outra medida judicial ou extrajudicial adotada em desfavor do (da) LOCATÁRIO (A).']},
{id:'encargos',t:'Encargos e despesas',x:'Será de responsabilidade do (a) LOCATÁRIO (A), além do pagamento do aluguel, os pagamentos de IPTU, condomínio, água, luz, seguro contra incêndio e todas as demais despesas referentes à conservação do imóvel e eventuais taxas ou tributos que incidam sobre ele.',
 p:['Os prazos e as obrigações do (a) LOCATÁRIO (A) se vencerão independentemente de interpelação, notificação ou aviso, judicial ou extrajudicial.',
 '@q_contas@O (A) LOCATÁRIO (A) se obriga a tomar as providências cabíveis junto às concessionárias de serviços públicos, dentro de {diasContas} dias contados da assinatura do presente contrato, a fim de transferir para o seu nome as contas de consumo de {contas}, sob pena de incorrer em infração contratual, respondendo, ademais, por estas contas durante a locação, ainda que lançadas em nome de terceiros, bem como de eventuais indenizações por dano moral ou material que der causa.']},
{id:'devimovel',t:'Devolução do imóvel',x:'O (A) LOCATÁRIO (A) está obrigado a devolver o imóvel{utens}, nas condições em que recebeu, limpo e conservado, e em pleno funcionamento, ao término do contrato, ainda que rescindido antecipadamente.',
 p:['Caso o imóvel{dep} não forem restituídos nas mesmas condições, o aluguel e seus acessórios continuarão a correr, até que o (a) LOCATÁRIO (A) cumpra todas as exigências do '+R+'{mt3}.']},
{id:'quita',t:'Quitação na desocupação',x:'Quando da desocupação e entrega do imóvel, o (a) LOCATÁRIO (A) liquidará o aluguel e deverá apresentar os comprovantes de que estão completamente quitadas todas as contas de energia elétrica, água, gás, IPTU, condomínio e quaisquer outras taxas que incidam sobre o imóvel exigidas pelo '+R+', correndo a locação até o momento em que forem apresentados os comprovantes mencionados{mt3}.'},
{id:'uso',t:'Uso e sublocação',x:'O (A) LOCATÁRIO (A) declara que o imóvel ora locado destina-se única e exclusivamente para o seu uso residencial e de sua família, sendo expressamente proibido sublocar, transferir ou ceder o imóvel, sendo nulo de pleno direito qualquer ato praticado com este fim sem o consentimento prévio e por escrito do '+R+'.'},
{id:'animais',t:'Animais de estimação',x:'{animais}'},
{id:'rescisao',t:'Rescisão por descumprimento',x:'O (A) LOCADOR (A) poderá dar como rescindido o presente contrato de locação de pleno direito, independentemente de qualquer interpelação judicial, sem que assista ao (a) LOCATÁRIO (A) direito a qualquer indenização ou reclamação, quando, ao seu critério, ocorrer o descumprimento de qualquer cláusula do presente contrato.',
 p:['Uma vez tendo o (a) LOCATÁRIO (A) dado motivo à rescisão do contrato de locação,{mt4} fica assegurado ao (à) LOCADOR (A) o direito de ingressar com ação de despejo para desocupação do imóvel a qualquer tempo, ou outra medida judicial necessária.']},
{id:'placas',t:'Placas e painéis',x:'É vedado ao (à) LOCATÁRIO (A) a colocação de placas, bandeiras, cartazes, painéis, luminosos, antenas, ou quaisquer outras, nas paredes externas do imóvel, sem a prévia e expressa autorização do '+R+', respondendo pelos danos que forem causados ao imóvel ainda que eventualmente autorizado.'},
{id:'lei',t:'Cumprimento da legislação',x:'O (A) LOCATÁRIO (A) obriga-se, por si e sua família, a respeitar toda legislação, normas e regulamentos municipais, estaduais e federais, ficando responsável por eventuais multas a que der causa.'},
{id:'zelo',t:'Conservação e reformas',x:'O (A) LOCATÁRIO (A) se responsabiliza em zelar pela limpeza e conservação do imóvel, incluída a pintura, sendo vedadas reformas e quaisquer alterações no imóvel sem a prévia e expressa autorização do '+R+'.'},
{id:'avisar',t:'Comunicação de danos',x:'Deve o (a) LOCATÁRIO (A) levar imediatamente ao conhecimento do '+R+' o surgimento de qualquer dano ou defeito cuja reparação a este incumba, bem como todas as intimações ou avisos de autoridades públicas recebidas no imóvel, sob pena de ser responsabilizado pelos prejuízos decorrentes da inércia.'},
{id:'reparo',t:'Reparação de danos',x:'Deve o (a) LOCATÁRIO (A) realizar a imediata reparação dos danos causados no imóvel provocados por si, seus dependentes, familiares ou visitantes, vedada a retenção do aluguel.'},
{id:'vistoria',t:'Vistoria',x:'É facultado ao (à) LOCADOR (A) vistoriar, por si ou seus procuradores, sempre que achar conveniente, para a certeza do cumprimento das obrigações assumidas neste contrato.'},
{id:'fortuito',t:'Caso fortuito',x:'O (A) LOCADOR (A) não se responsabiliza por eventuais danos sofridos pelo (a) LOCATÁRIO (A) em caso de acidentes ocasionados por caso fortuito ou de força maior.'},
{id:'toler',t:'Tolerância',x:'Quaisquer tolerâncias ou concessões do (a) LOCADOR (A) não constituirão precedente invocável e não terão a virtude de alterar as obrigações que lhe são impostas neste instrumento.'},
{id:'foro',t:'Foro',x:'As Partes elegem o foro da Comarca de {foro} para dirimir eventuais dúvidas e outras questões, renunciando a qualquer outro, por mais privilegiado que seja.'}];

/* ===== Estado ===== */
let step=0,ci=0,edit=null,theme=localStorage.getItem('tema')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
const DATA={};STEPS.forEach(s=>s.f.forEach(f=>{if(f.def)DATA[f.k]=f.def}));
const CL=C0.map(c=>({id:c.id,q:c.q,t:c.t,x:c.x,off:false,ps:(c.p||[]).map(s=>{const m=s.match(/^@(\w+)@/);return{x:m?s.slice(m[0].length):s,q:m&&m[1],off:false}})}));
const hid=o=>o.q&&DATA[o.q]!=='sim';
const act=()=>CL.filter(c=>!c.off&&!hid(c));
const ref=id=>{const i=act().findIndex(c=>c.id==id);return i<0?'cláusula correspondente':'Cláusula '+ord(i+1)};
function fill(x){const d=DATA,ok=d.q_multa==='sim',M=ok?mes(d.multa):'',
 v={end:d.i_end,num:d.i_num,compl:d.i_compl?', complemento '+d.i_compl:'',bairro:d.i_bairro,cidade:d.i_cidade,cep:d.i_cep,
 multa:M,prazo:d.prazo,atraso:pct(d.atraso),juros:pct(d.juros),honor:pct(d.honor),dias:d.dias,diasContas:d.diasContas,valor:money(d.valor),dia:d.dia,foro:d.foro,
 contas:'água e esgoto, luz, gás'+(d.extra?' e '+d.extra:''),
 utens:d.q_uten==='sim'?' e utensílios, tais como '+d.itens:'',dep:d.q_uten==='sim'?', suas dependências e utensílios nele existentes,':' e suas dependências',
 mt1:ok?' sob pena de, não o fazendo, ficar sujeito ao pagamento de multa equivalente a '+M+' de aluguel':'',
 mt2:ok?', ficando o (a) LOCATÁRIO (A) sujeito a multa equivalente a '+M+' de aluguel, mais os valores devidos até então':', sem prejuízo dos valores devidos até então',
 mt3:ok?', ficando ainda sujeito a multa equivalente a '+M+' de aluguel':'',
 mt4:ok?' pagará multa equivalente a '+M+' de aluguel, independentemente das sanções anteriormente previstas, e':'',
 animais:d.q_animais==='sim'?'É permitida a permanência de animais de estimação no imóvel, ficando o (a) LOCATÁRIO (A) responsável por eventuais danos, ruídos e pela higiene, bem como pelo cumprimento das normas do condomínio, se houver.':'É vedada a criação ou permanência de animais de qualquer espécie no imóvel, sem prévia e expressa autorização por escrito do '+R+'.'};
 return x.replace(/\{(\w+)\}/g,(m,k)=>v[k]??m).replace(/\[#(\w+)\]/g,(m,id)=>ref(id))}

/* ===== Renderização ===== */
const stage=$('#stage');
function render(){
 document.documentElement.dataset.theme=theme;$('#themeBtn').textContent=theme=='dark'?'☀️':'🌙';
 $('#bar').style.width=((step+1)/(FIM+1)*100)+'%';
 $('#back').disabled=step==0;
 $('#next').textContent=step==REV?'Gerar contrato ›':step==FIM?'⬇ Baixar PDF':'Continuar ›';
 $('#stepName').textContent=step<REV?`Etapa ${step+1} de ${FIM+1} · ${STEPS[step].n}`:step==REV?`Etapa ${REV+1} de ${FIM+1} · Cláusulas`:`Etapa ${FIM+1} de ${FIM+1} · Contrato pronto`;
 stage.innerHTML=step<REV?formHTML(STEPS[step]):step==REV?reviewHTML():finalHTML();
 stage.scrollTop=0;
 if(step<REV)bindForm();
}
const fld=f=>{
 const a=`id="${f.k}" name="${f.k}" ${f.req===0?'':'required'} placeholder="${esc(f.ph||'')}" value="${esc(DATA[f.k]||'')}"`;
 const inp=f.opt?`<select ${a.replace(/placeholder="[^"]*"|value="[^"]*"/g,'')}><option value="">Selecione…</option>${f.opt.map(o=>`<option${DATA[f.k]==o?' selected':''}>${o}</option>`).join('')}</select>`
 :f.ta?`<textarea ${a.replace(/value="[^"]*"/,'')} style="min-height:80px">${esc(DATA[f.k]||'')}</textarea>`
 :`<input ${a} type="${f.t||'text'}" ${f.im?`inputmode="${f.im}"`:f.t=='number'?'inputmode="decimal"':''} ${f.step?`step="${f.step}"`:f.t=='number'?'step="any"':''} ${f.min!=null?`min="${f.min}"`:''} ${f.max?`max="${f.max}"`:''} ${f.pat?`pattern="${f.pat}" title="Formato: ${f.ph}"`:''}>`;
 return`<div class="${f.full?'full':''}"><label for="${f.k}">${f.l}${f.req===0?'':' <em>*</em>'}</label>${inp}</div>`};
const allF=s=>s.f.flatMap(f=>f.yn?f.sub:[f]);
function formHTML(s){return`<section><h2>${s.t}</h2><p class="sub">${s.s}</p><form id="f" class="grid" autocomplete="off">`+s.f.map(f=>f.yn?
 `<div class="full"><label>${f.l} <em>*</em></label><div class="seg">${['sim','nao'].map(v=>`<label><input type="radio" name="${f.k}" value="${v}" ${DATA[f.k]==v?'checked':''} required><span>${v=='sim'?'Sim':'Não'}</span></label>`).join('')}</div><div class="grid sub" id="sub_${f.k}">${f.sub.map(fld).join('')}</div></div>`:fld(f)).join('')+`</form></section>`}
function bindForm(){const s=STEPS[step];
 s.f.filter(f=>f.yn).forEach(f=>{const sub=$('#sub_'+f.k),sync=()=>{const on=DATA[f.k]=='sim';sub.hidden=!on;sub.querySelectorAll('input,textarea,select').forEach(e=>e.disabled=!on)};
  document.getElementsByName(f.k).forEach(r=>r.onchange=()=>{DATA[f.k]=r.value;sync()});sync()});
 allF(s).forEach(f=>{const el=$('#'+f.k);
 el.oninput=()=>{let v=el.value;if(f.mask=='cpf'){v=v.replace(/\D/g,'').slice(0,11).replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2');el.value=v}
  if(f.mask=='cep'){v=v.replace(/\D/g,'').slice(0,8).replace(/(\d{5})(\d)/,'$1-$2');el.value=v}DATA[f.k]=v;
  if(f.k=='foro')DATA._foroAuto=0;
  if(f.k=='i_cidade'&&(!DATA.foro||DATA._foroAuto)){DATA.foro=v;DATA._foroAuto=1}};
 el.onchange=el.oninput});
 if(s.n=='Aluguel'&&DATA._foroAuto&&DATA.foro)$('#foro').value=DATA.foro}
function blk(title,text,off,key,custom){
 if(edit==key)return`<div class="blk"><h4>${title}</h4><textarea id="ed">${esc(text)}</textarea><div class="acts"><button class="sm ok" data-a="save" data-k="${key}">Salvar</button><button class="sm" data-a="cancel">Cancelar</button></div></div>`;
 return`<div class="blk${off?' off':''}"><h4>${title}</h4><p>${esc(text)||'(vazio — clique em Editar)'}</p><div class="acts">${off?`<button class="sm" data-a="restore" data-k="${key}">Restaurar</button>`:`<button class="sm" data-a="edit" data-k="${key}">✏️ Editar</button><button class="sm del" data-a="del" data-k="${key}">🗑 Remover</button>`}</div></div>`}
function reviewHTML(){
 const vis=CL.filter(c=>!hid(c));ci=Math.max(0,Math.min(ci,vis.length-1));
 const c=vis[ci],ki=CL.indexOf(c),n=act().indexOf(c)+1;
 let h=`<section><h2>Revise as cláusulas</h2><p class="sub">Edite ou remova o que não se aplica. A numeração se ajusta sozinha.</p>
 <div class="pager"><button data-a="prev" ${ci==0?'disabled':''}>‹</button><span><b>${c.off?'Removida':'Cláusula '+ord(n)}</b> · ${esc(c.t)}<br>${ci+1} de ${vis.length} · ${act().length} no contrato</span><button data-a="next" ${ci==vis.length-1?'disabled':''}>›</button></div>`;
 h+=blk(c.off?'Cláusula removida':'Cláusula '+ord(n),fill(c.x),c.off,ki);
 if(!c.off){const pv=c.ps.map((p,j)=>[p,j]).filter(([p])=>!hid(p));pv.forEach(([p,j],i)=>{h+=blk(`Parágrafo ${pv.length>1?ordM(i+1):'único'}`,fill(p.x),p.off,ki+':'+j)})}
 return h+`<button class="sm add" data-a="add">+ Adicionar nova cláusula</button></section>`}
function finalHTML(){
 const d=DATA,dt=new Date(d.data+'T12:00:00'),ds=dt.toLocaleDateString('pt-BR',{day:'numeric',month:'long',year:'numeric'});
 const sig=(r,n)=>`<div class="sg"><span class="ln"></span><b>${r}</b>${n?`<small>${esc(n)}</small>`:''}</div>`;
 const rs=n=>(+n).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
 let n=0;
 const body=act().map(c=>{n++;const ps=c.ps.filter(p=>!p.off&&!hid(p));
  return`<div class="cl"><h3>Cláusula ${ord(n)}${c.t&&c.t!=='Nova cláusula'?`<em>${esc(c.t)}</em>`:''}</h3><p>${esc(fill(c.x))}</p>`+
  ps.map((p,j)=>`<p class="par"><b>Parágrafo ${ps.length>1?ordM(j+1):'único'}.</b> ${esc(fill(p.x))}</p>`).join('')+`</div>`}).join('');
 const party=(tag,p,txt)=>`<div class="party"><span class="tag">${tag}</span><b>${esc(d[p+'_nome'])}</b><p>${txt}</p></div>`;
 return`<section><p class="tip noprint">Pronto! Confira abaixo. Toque em <b>Baixar PDF</b> e escolha “Salvar como PDF”.</p><article class="paper"><table class="pg"><thead><tr><td><div class="sp"></div></td></tr></thead><tbody><tr><td>
 <div class="ph"><span class="orn">§</span><h1>Contrato de Locação</h1><div class="sb">Imóvel Residencial</div></div>
 <div class="resumo">
  <div><small>Imóvel</small>${esc(d.i_end)}, nº ${esc(d.i_num)}${d.i_compl?' – '+esc(d.i_compl):''}<br>${esc(d.i_bairro)} · ${esc(d.i_cidade)}</div>
  <div><small>Prazo</small>${esc(d.prazo)} meses</div>
  <div><small>Aluguel mensal</small>${rs(d.valor)}</div>
  <div><small>Vencimento</small>Todo dia ${esc(d.dia)}</div></div>
 <h2 class="sec">Das Partes</h2>
 <div class="parties">${party('Locador (a)','l',`${esc(d.l_civil)}, ${esc(d.l_prof)}, RG nº ${esc(d.l_rg)} e CPF ${esc(d.l_cpf)}, residente e domiciliado (a) na ${esc(d.l_end)}, nº ${esc(d.l_num)}, Bairro ${esc(d.l_bairro)}, ${esc(d.l_cidade)}, CEP ${esc(d.l_cep)}.`)}
 ${party('Locatário (a)','t',`${esc(d.t_civil)}, ${esc(d.t_prof)}, RG nº ${esc(d.t_rg)} e CPF ${esc(d.t_cpf)}, residente e domiciliado (a) no endereço do imóvel objeto do presente contrato.`)}</div>
 <p class="intro">As partes acima mencionadas, pelo presente contrato particular, ajustam a locação de um imóvel residencial, de acordo com as cláusulas que seguem.</p>
 <h2 class="sec">Das Cláusulas</h2>${body}
 <div class="fim"><p class="loc">${esc(d.foro)}, ${ds}.</p>
 <div class="sign">${sig('Locador (a)',d.l_nome)}${sig('Locatário (a)',d.t_nome)}${sig('Testemunha 1','')}${sig('Testemunha 2','')}</div></div></td></tr></tbody><tfoot><tr><td><div class="sp"></div></td></tr></tfoot></table></article></section>`}

/* ===== Eventos ===== */
stage.onclick=e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,k=b.dataset.k;
 const get=k=>{const[i,j]=String(k).split(':');return j!=null?CL[i].ps[j]:CL[i]};
 if(a=='prev')ci--;if(a=='next')ci++;
 if(a=='edit')edit=k;if(a=='cancel')edit=null;
 if(a=='save'){const o=get(k),shown=fill(o.x),v=$('#ed').value;if(v!==shown)o.x=v;edit=null}
 if(a=='del')get(k).off=true;if(a=='restore')get(k).off=false;
 if(a=='add'){CL.push({id:'c'+Date.now(),t:'Nova cláusula',x:'',off:false,ps:[]});ci=CL.filter(c=>!hid(c)).length-1;edit=String(CL.length-1)}
 render()};
$('#next').onclick=()=>{
 if(step<REV){const f=$('#f');if(!f.reportValidity())return}
 if(step==FIM)return print();
 edit=null;step++;render()};
$('#back').onclick=()=>{if(step>0){edit=null;step--;render()}};
$('#themeBtn').onclick=()=>{theme=theme=='dark'?'light':'dark';localStorage.setItem('tema',theme);render()};
render();
