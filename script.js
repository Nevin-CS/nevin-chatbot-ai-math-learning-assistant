const q = document.getElementById('question');
const level = document.getElementById('level');
const answer = document.getElementById('answerContent');
const title = document.getElementById('answerTitle');
const statusBadge = document.getElementById('statusBadge');

document.querySelectorAll('[data-q]').forEach(btn => btn.addEventListener('click', () => { q.value = btn.dataset.q; q.focus(); }));
document.getElementById('clearBtn').addEventListener('click', () => {
  q.value=''; title.textContent='Ready when you are'; statusBadge.textContent='Prototype';
  answer.className='answer-content empty-state';
  answer.innerHTML='<div><div class="empty-icon">ƒ(x)</div><p>Enter a supported arithmetic expression or a simple linear equation in <strong>x</strong> to see the Day 2 learning flow.</p></div>';
});
document.getElementById('solveBtn').addEventListener('click', solve);
q.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') solve(); });

function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
function fmt(n){ return Number.isInteger(n) ? String(n) : Number(n.toFixed(6)).toString(); }

function solve(){
  const raw=q.value.trim();
  if(!raw){showError('Please enter a math question first.');return;}
  const linear=tryLinear(raw);
  if(linear){render(linear);return;}
  const arithmetic=tryArithmetic(raw);
  if(arithmetic){render(arithmetic);return;}
  showError('This Day 2 prototype currently supports arithmetic expressions and simple linear equations in x, such as “2x + 3 = 11”. The LLM/API version planned for later days will support broader math questions.');
}

function tryLinear(raw){
  const s=raw.toLowerCase().replace(/\s+/g,'').replace(/−/g,'-');
  if(!s.includes('=') || !s.includes('x')) return null;
  const parts=s.split('='); if(parts.length!==2) return null;
  const left=parseLinearSide(parts[0]), right=parseLinearSide(parts[1]);
  if(!left||!right) return null;
  const a=left.a-right.a, b=right.b-left.b;
  if(Math.abs(a)<1e-12) return {concept:'Linear equations',steps:['Collect the x-terms and constants on opposite sides.','After simplifying, the x-coefficient becomes 0.'],result: Math.abs(b)<1e-12?'Every real x satisfies this equation.':'There is no solution because the two sides cannot be equal.',detail:'A linear equation can be written in the form ax + b = c. We isolate x by undoing addition/subtraction and then multiplication/division.'};
  const x=b/a;
  const steps=[`Move all x-terms to one side: ${fmt(a)}x = ${fmt(b)}.`,`Divide both sides by ${fmt(a)}.`,`x = ${fmt(b)} ÷ ${fmt(a)} = ${fmt(x)}.`];
  return {concept:'Solving a linear equation',steps,result:`x = ${fmt(x)}`,detail:'The goal is to isolate x while performing the same operation on both sides of the equation.'};
}
function parseLinearSide(s){
  s=s.replace(/\*/g,'');
  if(!/^[+\-]?([0-9.]*x|[0-9.]+)([+\-]([0-9.]*x|[0-9.]+))*$/.test(s)) return null;
  const terms=s.match(/[+\-]?[^+\-]+/g)||[]; let a=0,b=0;
  for(const t of terms){
    if(t.includes('x')){let c=t.replace('x',''); if(c===''||c==='+')c='1'; if(c==='-')c='-1'; c=Number(c); if(!Number.isFinite(c))return null; a+=c;}
    else{const n=Number(t); if(!Number.isFinite(n))return null; b+=n;}
  }
  return {a,b};
}

function tryArithmetic(raw){
  const normalized=raw.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/\^/g,'**').trim();
  if(!/^[0-9+\-*/().\s*]+$/.test(normalized)) return null;
  try{
    const tokens=tokenize(normalized); const value=evaluate(tokens);
    if(!Number.isFinite(value)) return null;
    const detail = level.value==='simple' ? 'Use the order of operations: brackets first, then multiplication/division, then addition/subtraction.' : level.value==='detailed' ? 'Arithmetic expressions are evaluated using the order of operations. Parentheses are handled first, followed by multiplication and division, then addition and subtraction from left to right.' : 'Apply the order of operations carefully so each operation is completed in the correct sequence.';
    return {concept:'Arithmetic and order of operations',steps:[`Read the expression: ${raw}.`,'Evaluate any parentheses first.','Complete multiplication or division before addition or subtraction.',`The expression evaluates to ${fmt(value)}.`],result:`Answer = ${fmt(value)}`,detail};
  }catch{return null;}
}
function tokenize(s){
  const arr=[]; let i=0;
  while(i<s.length){const c=s[i]; if(/\s/.test(c)){i++;continue;} if(/[0-9.]/.test(c)){let j=i; while(j<s.length&&/[0-9.]/.test(s[j]))j++; const n=Number(s.slice(i,j)); if(!Number.isFinite(n))throw 0; arr.push(n); i=j; continue;} if('+-*/()'.includes(c)){arr.push(c);i++;continue;} throw 0;} return arr;
}
function evaluate(tokens){
  let p=0; function expr(){let v=term(); while(tokens[p]=='+'||tokens[p]=='-'){const op=tokens[p++],r=term(); v=op=='+'?v+r:v-r;}return v;} function term(){let v=factor(); while(tokens[p]=='*'||tokens[p]=='/'){const op=tokens[p++],r=factor(); v=op=='*'?v*r:v/r;}return v;} function factor(){if(tokens[p]=='-'){p++;return -factor();} if(tokens[p]=='('){p++;const v=expr();if(tokens[p++]!==')')throw 0;return v;} if(typeof tokens[p]==='number')return tokens[p++];throw 0;} const v=expr(); if(p!==tokens.length)throw 0; return v;
}
function render(data){
  title.textContent=data.concept; statusBadge.textContent='Solved locally'; answer.className='answer-content';
  answer.innerHTML=`<div class="solution-block"><h4>Concept</h4><p>${esc(data.detail)}</p></div><div class="solution-block"><h4>Step-by-step</h4><ol>${data.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol></div><div class="solution-block"><h4>Result</h4><p class="result">${esc(data.result)}</p></div><div class="solution-block"><h4>Learning check</h4><p>Try changing one number in the question and solve it again. Can you predict how the result will change?</p></div>`;
}
function showError(msg){title.textContent='Prototype limitation';statusBadge.textContent='Needs later AI integration';answer.className='answer-content';answer.innerHTML=`<div class="solution-block"><h4>Not supported yet</h4><p>${esc(msg)}</p></div>`;}
