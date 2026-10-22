const {readFileSync}=require('fs');
const vm=require('vm');
const assert=require('node:assert/strict');
const code=readFileSync(require('node:path').join(__dirname, '../contact-form.js'), 'utf8');
function setup(fetch){
 const events={}, values={firstname:'  Test  ',lastname:'Test',email:'test@example.com',message:'Hej'};
 const inputs=Object.fromEntries(Object.entries(values).map(([k,value])=>[k,{value,setCustomValidity(v){this.error=v}}]));
 const button={innerHTML:'Skicka',disabled:true}; const status={dataset:{},focus(){}};
 const form={querySelector:s=>s.startsWith('button')?button:status,addEventListener:(n,f)=>events[n]=f,elements:{namedItem:n=>inputs[n]},reportValidity:()=>Object.values(inputs).every(i=>!i.error),setAttribute(){},removeAttribute(){},reset(){Object.values(inputs).forEach(i=>i.value='')}};
 vm.runInNewContext(code,{document:{querySelector:()=>form,title:'Test'},location:{origin:'https://example.com',pathname:'/'},fetch,AbortController,setTimeout,clearTimeout});
 return {submit:()=>events.submit({preventDefault(){}}),inputs,button,status};
}
(async()=>{
 let payload; const success=setup(async(u,o)=>{payload=JSON.parse(o.body);return {ok:true}}); await success.submit();assert.equal(success.status.dataset.state,'success');assert.equal(payload.fields[0].value,'Test');assert.equal(success.inputs.message.value,'');assert.equal(success.button.disabled,false);
 for(const status of [400,403,429,500]){const t=setup(async()=>({ok:false,status}));await t.submit();assert.equal(t.status.dataset.state,'error');assert.equal(t.inputs.message.value,'Hej');assert.equal(t.button.disabled,false);}
 const offline=setup(async()=>{throw new TypeError('offline')});await offline.submit();assert.equal(offline.status.dataset.state,'error');assert.equal(offline.inputs.email.value,'test@example.com');
 let count=0,done;const pending=setup(()=>{count++;return new Promise(r=>done=r)});const p=pending.submit();await pending.submit();assert.equal(count,1);assert.equal(pending.button.disabled,true);done({ok:true});await p;
 const blank=setup(()=>{throw Error('Must not submit')});blank.inputs.firstname.value='  ';await blank.submit();assert.equal(blank.inputs.firstname.error,'Fyll i det här fältet.');
 console.log('PASS: success, field mapping/trim, 400/403/429/500, network failure, retained input, duplicate prevention, whitespace validation');
})();
