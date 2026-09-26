let docKind='contract';
const kindNames={contract:'عقد خدمات',quote:'عرض سعر',invoice:'فاتورة'};
const kindEnglish={contract:'SERVICES AGREEMENT',quote:'QUOTATION',invoice:'INVOICE'};
const field=k=>document.querySelector(`[data-field="${k}"]`)?.value||'';
const esc=escapeHtml;
const num=k=>Math.max(0,Number(field(k))||0);
const money=n=>new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
const input=(key,label,type='text',value='')=>`<label class="fld"><span class="lbl">${label}</span><input type="${type}" data-field="${key}" value="${value}" ${type==='number'?'min="0" step="0.01"':''}></label>`;
document.querySelectorAll('[data-field=discount]').forEach(e=>e.closest('fieldset').remove());
const financial=document.createElement('fieldset');
financial.innerHTML=`<legend>الحسابات وبيانات السداد</legend><div class="field-grid">${input('discount','الخصم (مبلغ)','number','0')}${input('taxRate','نسبة الضريبة %','number','0')}${input('paid','المبلغ المدفوع','number','0')}${input('dueDate','تاريخ الاستحقاق / انتهاء العرض','date')}${input('companyTax','الرقم الضريبي لبيكسل')}${input('clientTax','الرقم الضريبي للعميل')}${input('bank','اسم البنك')}${input('iban','رقم الحساب / IBAN')}</div><p class="tip">أدخل الضريبة المطبقة على معاملتك. لا تُضاف ضريبة تلقائياً.</p>`;
document.querySelector('.action-bar').before(financial);
const fields=document.querySelectorAll('#contract-form > fieldset');
fields[5].dataset.contractOnly='';fields[6].dataset.contractOnly='';
const currency=document.querySelector('[data-field="currency"]');
if([...currency.options].some(o=>o.value==='ريال سعودي'))currency.value='ريال سعودي';
document.querySelector('[data-field="partyAEmail"]').placeholder='البريد الإلكتروني للشركة';
document.querySelector('[data-field="contractNumber"]').value='PX-CTR-'+new Date().getFullYear()+'-001';
document.querySelector('[data-field="dueDate"]').value=new Date(Date.now()+14*86400000).toISOString().slice(0,10);
document.querySelectorAll('[data-field]').forEach(i=>syncFieldOutputs(i.dataset.field,i.value));

for(const prefix of ['partyA','partyB']){
 const group=document.querySelector(`[data-field="${prefix}Name"]`).closest('fieldset');
 const grid=group.querySelector('.field-grid')||group;
 if(prefix==='partyB'){
  const existing=document.querySelector('[data-field="partyBID"]');
  existing.dataset.field='partyBCR';existing.previousElementSibling.textContent='السجل التجاري';existing.placeholder='رقم السجل التجاري';
 }else grid.insertAdjacentHTML('beforeend',input('partyACR','السجل التجاري'));
 grid.insertAdjacentHTML('beforeend',input(prefix+'Website','الموقع الإلكتروني','url'));
 document.querySelector(`[data-field="${prefix}Rep"]`).previousElementSibling.textContent='يمثلها في هذا المستند';
}
document.querySelector('[data-field="partyAEmail"]').value='info@pixelagencysa.com';
const customInput=document.querySelector('[data-field="customTerms"]');
customInput.previousElementSibling.textContent='عنوان البند في السطر الأول، والتفاصيل تحته. افصل بين البنود بسطر فارغ.';
customInput.placeholder='عنوان البند الإضافي\nتفاصيل البند وشروطه\n\nعنوان البند التالي\nتفاصيل البند التالي';
const signEditor=document.createElement('fieldset');
signEditor.innerHTML='<legend>الأسماء والتوقيعات</legend>'+['partyA','partyB'].map((prefix,i)=>`<h3>${i?'الطرف الثاني':'الطرف الأول'}</h3><div class="field-grid">${input(prefix+'SignName','الاسم')}${input(prefix+'Signature','التوقيع المكتوب')}${input(prefix+'SignDate','التاريخ','date')}</div>`).join('');
document.querySelector('.action-bar').before(signEditor);
const goldEditor=document.createElement('fieldset');goldEditor.dataset.contractOnly='';
goldEditor.innerHTML=`<legend>الضمان الذهبي</legend><label class="fld"><span class="lbl">إضافة الضمان إلى العقد</span><select data-field="goldEnabled"><option value="no">غير مفعّل</option><option value="yes">تفعيل الضمان الذهبي</option></select></label><div id="gold-fields" hidden>${input('goldTitle','عنوان الضمان','text','الضمان الذهبي')}<label class="fld"><span class="lbl">وصف الضمان</span><textarea data-field="goldDescription" rows="3" placeholder="اكتب الالتزام الذي يشمله هذا الضمان"></textarea></label><label class="fld"><span class="lbl">نطاق الضمان وشروطه ومدته</span><textarea data-field="goldConditions" rows="4" placeholder="حدد الحالات المشمولة والاستثناءات والمدة وآلية الاستفادة"></textarea></label></div>`;
document.querySelector('.action-bar').before(goldEditor);
document.querySelector('[data-field="goldEnabled"]').addEventListener('change',()=>{document.querySelector('#gold-fields').hidden=field('goldEnabled')!=='yes'});
document.querySelector('#btn-reset').addEventListener('click',()=>{document.querySelector('#gold-fields').hidden=field('goldEnabled')!=='yes'});

let raf;
function schedule(){cancelAnimationFrame(raf);raf=requestAnimationFrame(renderPixel)}
document.querySelector('#contract-form').addEventListener('input',schedule);
document.querySelector('#contract-form').addEventListener('change',schedule);
document.querySelector('#contract-form').addEventListener('click',()=>setTimeout(schedule,0));
document.querySelectorAll('.theme-btn').forEach(b=>b.addEventListener('click',schedule));
const choose=k=>{docKind=k;document.body.classList.remove('choosing');document.querySelector('.form-title').textContent=kindNames[k];document.querySelector('[data-field="contractNumber"]').value=`PX-${{contract:'CTR',quote:'QUO',invoice:'INV'}[k]}-${new Date().getFullYear()}-001`;document.querySelectorAll('[data-contract-only]').forEach(e=>e.hidden=k!=='contract');document.querySelector('[data-field="paid"]').closest('label').hidden=k!=='invoice';document.querySelector('[data-field="dueDate"]').closest('label').hidden=k==='contract';document.querySelector('[data-field="dueDate"]').previousElementSibling.textContent=k==='quote'?'العرض صالح حتى':'تاريخ استحقاق الفاتورة';fields[0].querySelector('legend').innerHTML='<span class="num">1</span> بيانات المستند';document.querySelector('[data-field="contractNumber"]').previousElementSibling.textContent='رقم المستند';document.querySelector('#formSide').classList.add('active');document.querySelector('#formSide').scrollTop=0;document.querySelector('#previewSide').classList.remove('active');document.querySelectorAll('.tab-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab==='form'));renderPixel();window.scrollTo(0,0);document.querySelector('.form-title').setAttribute('tabindex','-1');document.querySelector('.form-title').focus({preventScroll:true})};
document.querySelectorAll('[data-kind]').forEach(b=>b.addEventListener('click',()=>choose(b.dataset.kind)));
document.querySelector('#choose-type').addEventListener('click',()=>{document.body.classList.add('choosing');document.querySelector(`[data-kind="${docKind}"]`).focus()});
document.querySelectorAll('.tab-btn').forEach(b=>b.addEventListener('click',()=>requestAnimationFrame(renderPixel)));
function brandLogo(){return document.documentElement.dataset.theme==='dark'?'./logo-dark.webp':'./logo-light.webp'}
function pixelSeal(){
 return `<span class="pixel-seal" role="img" aria-label="ختم Pixel Agency"><img src="./logo-white.webp" alt="Pixel Agency"><span class="seal-en" dir="ltr">PIXEL AGENCY</span></span>`;
}
function renderPixel(){
 document.querySelectorAll('.pixel-logo').forEach(i=>i.src=brandLogo());
 const host=document.querySelector('#pages');host.innerHTML='';
 const curr=esc(field('currency'));const val=k=>esc(field(k)||'—');const date=k=>field(k)?esc(fmtDate(field(k))):'—';
 const subtotal=Math.round(state.packages.reduce((s,p)=>s+Math.max(0,Number(p.price)||0),0)*100)/100;
 const discount=Math.min(num('discount'),subtotal);const taxable=subtotal-discount;const rate=Math.min(num('taxRate'),100);const tax=Math.round(taxable*rate)/100;const total=Math.round((taxable+tax)*100)/100;const paid=num('paid');const due=Math.max(0,total-paid);
 const blocks=[];const add=(html,cls='')=>blocks.push(`<div class="px-block ${cls}">${html}</div>`);
 add(`<h1 class="px-title">${kindNames[docKind]}</h1><div class="px-en">${kindEnglish[docKind]}</div><div class="px-meta"><span>تاريخ الإصدار: <b>${date('contractDate')}</b></span><span>المدينة: <b>${val('city')}</b></span>${docKind!=='contract'?`<span>${docKind==='quote'?'صالح حتى':'تاريخ الاستحقاق'}: <b>${date('dueDate')}</b></span>`:''}</div>`);
 const party=(prefix,label)=>`<section class="px-party"><h3>${label}</h3><table class="party-table"><tbody>${[['Name','الاسم'],['CR','السجل التجاري'],['Address','العنوان'],['Email','البريد الإلكتروني'],['Website','الموقع الإلكتروني'],['Phone','رقم الجوال'],['Rep','يمثلها في هذا المستند']].map(([k,label])=>`<tr><th>${label}</th><td><bdi>${val(prefix+k)}</bdi></td></tr>`).join('')}${field(prefix==='partyA'?'companyTax':'clientTax')?`<tr><th>الرقم الضريبي</th><td><bdi>${val(prefix==='partyA'?'companyTax':'clientTax')}</bdi></td></tr>`:''}</tbody></table></section>`;
 add(party('partyA','بيانات الطرف الأول · مقدم الخدمة'));
 add(party('partyB','بيانات الطرف الثاني · المستفيد'));
 if(docKind==='contract')add('اتفق الطرفان على تقديم الخدمات التسويقية والإبداعية الموضحة أدناه، وفق نطاق العمل والمقابل المالي والمدة والشروط الواردة في هذا العقد.');
 if(docKind==='quote')add('يسر بيكسل تقديم عرضها للخدمات التالية. يوضح هذا العرض نطاق العمل والتكلفة وشروط البدء، ويصبح نافذاً بعد الاعتماد الكتابي والاتفاق على موعد التنفيذ.');
 if(field('projectTitle'))add(`<strong>${val('projectTitle')}</strong>`);
 add(`<div class="px-table-head"><b>الخدمة / نطاق العمل</b><b>القيمة · ${curr}</b></div>`);
 state.packages.forEach((p,i)=>{const lines=(p.details||'').split('\n').filter(x=>x.trim());add(`<div class="px-item"><div class="px-item-head"><b>${i+1}. ${esc(p.name||'اسم الخدمة')}</b><b dir="ltr">${money(Math.max(0,Number(p.price)||0))}</b></div>${lines.length?`<p>${esc(lines.slice(0,8).join('\n'))}</p>`:''}</div>`);for(let j=8;j<lines.length;j+=8)add(`<div class="px-item"><small>${esc(p.name||'الخدمة')} · تابع</small><p>${esc(lines.slice(j,j+8).join('\n'))}</p></div>`)});
 const row=(a,b,final=false)=>`<div class="px-total-row ${final?'final':''}"><span>${a}</span><b dir="ltr">${money(b)} ${curr}</b></div>`;
 add(`<div class="px-totals">${row('الإجمالي قبل الخصم',subtotal)}${discount?row('الخصم',discount):''}${row(`الضريبة (${rate}%)`,tax)}${row('الإجمالي شامل الضريبة',total,true)}${docKind==='invoice'?row('المدفوع',paid)+row('المتبقي المستحق',due,true)+(paid>total?row('رصيد زائد للعميل',paid-total):''):''}</div>`);
 if(docKind==='invoice')add(`<span class="px-stamp">${paid>=total&&total>0?'مسددة':paid>0?'مسددة جزئياً':'بانتظار السداد'}</span>`);
 const payment=[`طريقة الدفع: ${val('paymentMethod')}`,field('bank')?`البنك: ${val('bank')}`:'',field('iban')?`الحساب: <bdi>${val('iban')}</bdi>`:'',field('paymentNotes')?val('paymentNotes'):''].filter(Boolean).join('<br>');
 add(`<h2 class="px-section-title">${docKind==='quote'?'شروط العرض والسداد':'بيانات السداد'}</h2><div>${payment}</div>`);
 if(docKind==='contract'){
 add(`<h2 class="px-section-title">مدة التنفيذ</h2><p>من ${date('startDate')} إلى ${date('endDate')}${field('durationNotes')?' · '+val('durationNotes'):''}. يبدأ التنفيذ بعد اعتماد نطاق العمل واستلام الدفعة المتفق عليها والمواد والصلاحيات اللازمة.</p>`);
 add('<h2 class="px-section-title">الشروط والأحكام</h2>');
 const terms=[['نطاق الخدمات والميزانية الإعلانية','تقتصر الخدمات على البنود والكميات المحددة في هذا العقد. ميزانيات شراء الإعلانات ورسوم المنصات والأدوات والتراخيص الخارجية غير مشمولة في أتعاب بيكسل إلا إذا ذُكرت صراحة ضمن البنود المالية.'],['الاعتمادات والتعاون','يوفر العميل المواد والمعلومات الصحيحة والصلاحيات اللازمة، ويعتمد الأعمال كتابةً من ممثله المخول. يترتب على التأخر في توفير المتطلبات أو الاعتماد تعديل الجدول الزمني بما يتناسب مع مدة التأخير.'],['التعديلات وتغيير النطاق',`يشمل نطاق العمل ${val('revisionsCount')} لكل مخرج. تتطلب الطلبات الإضافية أو تغيير الاتجاه بعد الاعتماد عرضاً مستقلاً وموافقة كتابية على التكلفة والمدة قبل التنفيذ.`],['الدفعات والتوقف',`تُسدد المستحقات حسب آلية الدفع المتفق عليها. عند التأخر لمدة ${val('paymentGraceDays')} بعد الاستحقاق، يجوز تعليق الخدمات بعد إشعار العميل حتى السداد، مع تحديث مواعيد التسليم.`],['الأداء والتقارير','تلتزم بيكسل بالتنفيذ والتحسين المهني وتقديم التقارير ضمن النطاق المتفق عليه. لا يشكل العقد ضماناً لعدد مبيعات أو عائد إعلاني محدد؛ إذ تتأثر النتائج بالمنتج والعرض والموقع والسوق وسياسات المنصات.'],['الملكية والسرية',`تنتقل حقوق استخدام المخرجات النهائية المتفق عليها بعد سداد المستحقات، ولا تشمل الملفات المصدرية أو تراخيص الأطراف الأخرى إلا بنص صريح. يحافظ الطرفان على سرية المعلومات لمدة ${val('confidentialityDuration')} بعد انتهاء التعاون، ولا تُنشر معلومات العميل السرية دون موافقته.`],['إنهاء التعاون',`يجوز إنهاء العقد بإشعار كتابي قبل ${val('terminationNotice')}. تُسوّى قيمة الأعمال المنجزة والمصروفات المعتمدة، ويُرد الرصيد المقابل للأعمال غير المنفذة بعد التسوية.`],['الظروف الخارجة عن السيطرة','يُخطر الطرف المتأثر الطرف الآخر عند تعطل المنصات أو حدوث ظرف خارج عن السيطرة، ويتعاون الطرفان لتعديل التنفيذ والجدول الزمني بما يتناسب مع أثره.'],['تسوية الخلافات',`يسعى الطرفان لحل الخلاف ودياً خلال ${val('amicableDays')}. ويكون القانون الحاكم: ${val('jurisdiction')}، والجهة المختصة: ${val('courts')} وفق ما يعتمده الطرفان.`]];
 terms.forEach((t,i)=>add(`<strong>${i+1}. ${t[0]}</strong><p>${t[1]}</p>`,'px-term'));
 }else if(docKind==='quote'){
 ['الأسعار مخصصة لنطاق العمل الموضح، وأي إضافة أو تعديل خارج النطاق يُسعّر بشكل مستقل.','لا تشمل الأتعاب ميزانيات الإعلانات أو رسوم المنصات والأدوات الخارجية ما لم يُذكر خلاف ذلك في تفاصيل الخدمات.','يبدأ التنفيذ بعد اعتماد العرض كتابياً والاتفاق على الجدول الزمني واستلام الدفعة والمتطلبات اللازمة.','يعكس الإجمالي نسبة الضريبة المدخلة في هذا العرض. لا يُعد عرض السعر إثباتاً للسداد.'].forEach((t,i)=>add(`<strong>${i+1}. ${t}</strong>`,'px-note'));
 }else{
 add('<h2 class="px-section-title">ملاحظات الفاتورة</h2><p>يرجى إرفاق رقم الفاتورة مع التحويل، وإرسال إشعار السداد إلى جهة التواصل الموضحة أعلاه لمطابقة الدفعة. لا تُعد هذه الفاتورة إيصالاً باستلام المبلغ إلا في حدود المبلغ المدفوع المبيّن فيها.</p>','px-note');
 }
 const custom=field('customTerms').split(/\n\s*\n/).filter(t=>t.trim());
 if(custom.length){
  add('<h2 class="px-section-title">الشروط المخصصة</h2>');
  custom.forEach((t,i)=>{const lines=t.trim().split('\n');const title=lines.shift();add(`<strong>${(docKind==='contract'?9:0)+i+1}. ${esc(title)}</strong>${lines.length?`<p>${esc(lines.join('\n'))}</p>`:''}`,'px-term')});
 }
 if(docKind==='contract'&&field('goldEnabled')==='yes'){
  add(`<div class="gold-guarantee"><div class="gold-badge" aria-label="ختم الضمان الذهبي"><span>✦</span><b>الضمان الذهبي</b><small>PIXEL AGENCY</small></div><div><h2>${val('goldTitle')}</h2><p>${val('goldDescription')}</p>${field('goldConditions')?`<h3>نطاق الضمان وشروطه</h3><p>${val('goldConditions')}</p>`:''}</div></div>`);
 }
 const signature=prefix=>`<div class="signature-fields">${[['SignName','الاسم','text'],['Signature','التوقيع','text'],['SignDate','التاريخ','date']].map(([key,label,type])=>`<div class="signature-row"><span>${label}</span><span class="signature-line"><span>${key==='SignDate'? (field(prefix+key)?date(prefix+key):''):esc(field(prefix+key))}</span></span></div>`).join('')}</div>`;
 add(`<div class="px-signatures"><div><b>${val('partyAName')}</b>${signature('partyA')}<div class="seal-slot">${pixelSeal()}</div></div><div><b>${val('partyBName')}</b>${signature('partyB')}<div class="seal-slot"></div></div></div>`);
 let content;const newPage=()=>{let page=document.createElement('article');page.className='px-page px-'+docKind;page.innerHTML=`<header class="px-head"><img src="${brandLogo()}" alt="بيكسل"><div><small>${kindEnglish[docKind]}</small><b dir="ltr">${val('contractNumber')}</b></div></header><div class="px-content"></div><footer class="px-foot"><span>PIXEL AGENCY · بكسل للتسويق الإلكتروني<br><bdi>info@pixelagencysa.com</bdi></span><span class="px-pagination"></span></footer>`;host.append(page);content=page.querySelector('.px-content');return page};newPage();
 const insert=html=>{const wrap=document.createElement('div');wrap.innerHTML=html;const node=wrap.firstElementChild;content.append(node);if(content.scrollHeight>content.clientHeight+1&&content.children.length>1){node.remove();const prev=content.lastElementChild;const heading=prev?.children.length===1&&prev.firstElementChild?.classList.contains('px-section-title')?prev:null;if(heading)heading.remove();newPage();if(heading)content.append(heading);content.append(node)}if(content.scrollHeight>content.clientHeight+1){ // split exceptional long text without truncation
 const text=node.innerText;node.remove();const words=text.split(/\s+/);let chunk='';for(const word of words){const candidate=chunk+' '+word;const probe=document.createElement('div');probe.className='px-block px-note';probe.textContent=candidate;content.append(probe);if(content.scrollHeight>content.clientHeight+1){probe.remove();if(chunk){const done=document.createElement('div');done.className='px-block px-note';done.textContent=chunk;content.append(done)}newPage();chunk=word}else{probe.remove();chunk=candidate}}if(chunk){const done=document.createElement('div');done.className='px-block px-note';done.textContent=chunk;content.append(done)}}};blocks.forEach(insert);
 const pages=[...host.children];pages.forEach((p,i)=>p.querySelector('.px-pagination').textContent=`${i+1} / ${pages.length}`);document.querySelector('#page-count').textContent=`${pages.length} ${pages.length===1?'صفحة':'صفحات'}`;scalePages();
}
function scalePages(){const viewport=document.querySelector('#page-viewport'),pages=document.querySelector('#pages');const width=viewport.clientWidth;if(!width)return;const scale=Math.min(1,width/794);pages.style.transform=`scale(${scale})`;viewport.style.height=(pages.scrollHeight*scale)+'px'}
window.addEventListener('resize',scalePages);window.addEventListener('beforeprint',renderPixel);document.fonts.ready.then(renderPixel);
if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({name:'start_pixel_document',description:'Open a contract, quotation, or invoice for editing. Does not save or issue a document.',inputSchema:{type:'object',properties:{kind:{type:'string',enum:['contract','quote','invoice']}},required:['kind'],additionalProperties:false},annotations:{readOnlyHint:false},execute(input){if(!input||!Object.hasOwn(kindNames,input.kind))throw new Error('Invalid document kind');choose(input.kind);return{kind:docKind,title:kindNames[docKind]}}})).catch(()=>{})}catch{}}
