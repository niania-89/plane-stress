const $=s=>document.querySelector(s);
const r2=v=>Math.round(v*100)/100;
const SEC=[['home','Home'],['objectives','Learning Objectives'],['basics','Plane Stress Basics'],['transform','Stress Transformation'],['mohr',"Mohr's Circle Tutorial"],['calc','Interactive Calculator'],['examples','Worked Examples'],['practice','Practice Questions'],['formulas','Formula Sheet']];
let seen={};try{seen=JSON.parse(localStorage.getItem('ps_seen')||'{}')}catch(e){}

function show(){
  let id=location.hash.slice(1);if(!SEC.some(s=>s[0]===id))id='home';
  document.querySelectorAll('section').forEach(s=>s.classList.toggle('on',s.id===id));
  seen[id]=1;try{localStorage.setItem('ps_seen',JSON.stringify(seen))}catch(e){}
  $('#nav').innerHTML=SEC.map(s=>`<a href="#${s[0]}" class="${s[0]===id?'on ':''}${seen[s[0]]&&s[0]!==id?'done':''}">${s[1]}</a>`).join('');
  const n=SEC.filter(s=>seen[s[0]]).length;
  $('#bar i').style.width=(n/SEC.length*100)+'%';
  $('#ptxt').textContent=`You have visited ${n} of ${SEC.length} sections.`;
  window.scrollTo(0,0);
}

/* Stress element. t>0: right face shear up (ccw). deg: ccw rotation. */
function elem(sx,sy,t,deg,cap){
  const a=(x1,y1,x2,y2,c)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="3" marker-end="url(#ah)"/>`;
  const B='#2f80c8',S='#d85a30';let g='';
  if(sx)g+=sx>0?a(130,100,168,100,B)+a(70,100,32,100,B):a(168,100,130,100,B)+a(32,100,70,100,B);
  if(sy)g+=sy>0?a(100,70,100,32,B)+a(100,130,100,168,B):a(100,32,100,70,B)+a(100,168,100,130,B);
  if(t){const s=t>0?1:-1;g+=a(142,100+16*s,142,100-16*s,S)+a(58,100-16*s,58,100+16*s,S)+a(100-16*s,58,100+16*s,58,S)+a(100+16*s,142,100-16*s,142,S);}
  return `<div class="card"><svg viewBox="0 0 200 200" role="img" aria-label="${cap}"><defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5"/></marker></defs><g transform="rotate(${-deg} 100 100)"><rect x="70" y="70" width="60" height="60" fill="#e8f3fc" stroke="#0b2a4a" stroke-width="2"/>${g}</g></svg><small>${cap}</small></div>`;
}

/* Mohr's circle. tau axis points DOWN so positive tau_xy plots down. */
function mohr(sx,sy,t,o){
  const C=(sx+sy)/2,hd=(sx-sy)/2,R=Math.hypot(hd,t)||0.001;
  const xmin=Math.min(0,C-R),xmax=Math.max(0,C+R);
  const sc=Math.min(330/(xmax-xmin),110/R),off=(400-(xmax-xmin)*sc)/2;
  const X=v=>off+(v-xmin)*sc,Y=v=>150+v*sc,cx=X(C),cy=150,r=R*sc;
  const P=(a,rr)=>[cx+rr*Math.cos(a*Math.PI/180),cy-rr*Math.sin(a*Math.PI/180)];
  const T=(x,y,s,anc,col)=>`<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="13" text-anchor="${anc||'start'}" fill="${col||'#0b2a4a'}">${s}</text>`;
  const pt=(x,y,col,info,lab,co,dx,dy)=>`<g class="pt" data-info="${info}"><title>${info}</title><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="${col}"/>${T(x+dx,y+dy,lab+(o.coords&&co?' '+co:''),dx<0?'end':'start')}</g>`;
  let s='<defs><marker id="mh" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5"/></marker></defs>';
  if(o.ax)s+=`<line x1="6" y1="150" x2="394" y2="150" stroke="#5b6f84"/><line x1="${X(0)}" y1="8" x2="${X(0)}" y2="292" stroke="#5b6f84"/>`+T(394,140,'σ (MPa)','end','#5b6f84')+T(X(0)+6,20,'τ (MPa), positive down','start','#5b6f84');
  if(o.circ)s+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#2f80c8" stroke-width="2.5"/>`;
  const A=[X(sx),Y(t)],Bp=[X(sy),Y(-t)];
  if(o.cons&&o.pts)s+=`<line x1="${A[0]}" y1="${A[1]}" x2="${Bp[0]}" y2="${Bp[1]}" stroke="#d85a30" stroke-width="1.5" stroke-dasharray="5 3"/>`;
  if(o.rbar)s+=`<line x1="${cx}" y1="${cy+22}" x2="${cx+r}" y2="${cy+22}" stroke="#ba7517" stroke-width="2" stroke-dasharray="5 3"/>`+T(cx+r/2,cy+40,'R = '+r2(R),'middle','#ba7517');
  if(o.rad)s+=`<line x1="${cx}" y1="${cy}" x2="${A[0]}" y2="${A[1]}" stroke="#ba7517" stroke-width="2"/>`+T((cx+A[0])/2+6,(cy+A[1])/2-4,'R','start','#ba7517');
  if(o.ang){const d=Math.atan2(t,hd)*180/Math.PI,rr=0.45*r,p0=P(-d,rr),p1=P(0,rr);
    if(Math.abs(d)>1)s+=`<path d="M${p0[0]} ${p0[1]} A${rr} ${rr} 0 0 ${d>0?0:1} ${p1[0]} ${p1[1]}" fill="none" stroke="#1d9e75" stroke-width="2" marker-end="url(#mh)"/>`+T(cx+rr+8,cy+(d>0?16:-8),'2θp = '+r2(d)+'°','start','#1d9e75');}
  if(o.C)s+=pt(cx,cy,'#0b2a4a',`Centre C = (σx+σy)/2 = ${r2(C)} MPa. The average normal stress. It lies on the σ axis.`,'C',`(${r2(C)}, 0)`,6,16);
  if(o.pts){
    s+=pt(A[0],A[1],'#d85a30',`Point A = (σx, τxy) = (${sx}, ${t}). It represents the vertical x-faces of the element.`,'A',`(${sx}, ${t})`,A[0]>=cx?9:-9,t>=0?16:-9);
    s+=pt(Bp[0],Bp[1],'#d85a30',`Point B = (σy, −τxy) = (${sy}, ${-t}). It represents the horizontal y-faces, always opposite A.`,'B',`(${sy}, ${r2(-t)})`,Bp[0]>=cx?9:-9,t>=0?-9:16);}
  if(o.pr){
    s+=pt(X(C+R),cy,'#1d9e75',`σ1 = C + R = ${r2(C+R)} MPa. Maximum principal stress. Shear is zero on this plane because the point is on the σ axis.`,'σ1',`(${r2(C+R)}, 0)`,6,-10);
    s+=pt(X(C-R),cy,'#1d9e75',`σ2 = C − R = ${r2(C-R)} MPa. Minimum principal stress. Shear is zero here too.`,'σ2',`(${r2(C-R)}, 0)`,-6,-10);}
  if(o.tm){
    s+=pt(cx,cy-r,'#ba7517',`Top of the circle: τmax = R = ${r2(R)} MPa (clockwise shear), with σ = C = ${r2(C)} MPa.`,'τmax',`(${r2(C)}, ${r2(-R)})`,8,-6);
    s+=pt(cx,cy+r,'#ba7517',`Bottom of the circle: τmax = R = ${r2(R)} MPa (counterclockwise shear), with σ = C = ${r2(C)} MPa.`,'τmax',`(${r2(C)}, ${r2(R)})`,8,16);}
  return s;
}

/* Tutorial stepper */
const ST=[
 ['<b>Step 1: read the stresses.</b><br>σx = 80 MPa (T) pulls on the left and right faces. σy = 20 MPa (T) pulls on the top and bottom faces. τxy = 30 MPa slides along the faces, and it is positive because the right-face shear points up.',{}],
 ['<b>Step 2: draw the axes.</b><br>σ runs right (tension positive). τ runs down, so positive τxy plots down. Mohr\'s circle angles are double the physical angles: faces 90° apart on the element are 180° apart on the circle.',{ax:1}],
 ['<b>Step 3: centre.</b><br>C = (σx + σy)/2 = (80 + 20)/2 = 50 MPa.<br>It sits on the σ axis, so C = (50, 0).',{ax:1,C:1}],
 ['<b>Step 4: radius.</b><br>R = √[((80 − 20)/2)² + 30²] = √(30² + 30²) = √1800 = 42.43 MPa.<br>The dashed bar shows R measured from the centre. R sets the circle\'s size.',{ax:1,C:1,rbar:1}],
 ['<b>Step 5: plot A and B.</b><br>A = (σx, τxy) = (80, 30). B = (σy, −τxy) = (20, −30).<br>The τ axis points down, so A is below the axis and B is above. They are the ends of a diameter through C. This rule never changes: B always takes the opposite sign of A.',{ax:1,C:1,pts:1,cons:1,coords:1}],
 ['<b>Step 6: draw the circle.</b><br>Put the compass point on C, the pencil on A, and swing round. It must pass through B. If it misses B, recheck R or the signs.',{ax:1,C:1,pts:1,cons:1,coords:1,circ:1,rad:1}],
 ['<b>Step 7: principal stresses.</b><br>The circle crosses the σ axis where τ = 0, so those planes have no shear.<br>σ1 = C + R = 50 + 42.43 = 92.43 MPa<br>σ2 = C − R = 50 − 42.43 = 7.57 MPa',{ax:1,C:1,pts:1,cons:1,coords:1,circ:1,pr:1}],
 ['<b>Step 8: maximum shear.</b><br>The top and bottom of the circle give τmax = R = 42.43 MPa. The normal stress on those planes is σavg = C = 50 MPa.',{ax:1,C:1,pts:1,cons:1,coords:1,circ:1,pr:1,tm:1}],
 ['<b>Step 9: principal plane angle.</b><br>tan 2θp = 2τxy/(σx − σy) = 60/60 = 1. Numerator and denominator are both positive, so 2θp = 45° (first quadrant).<br>On the circle, going counterclockwise 45° from A reaches σ1. Halve it: θp = 22.5° counterclockwise from the x-face.<br>The rotated element carries only σ1 and σ2, with no shear.',{ax:1,C:1,pts:1,cons:1,coords:1,circ:1,pr:1,ang:1}]
];
let si=0,tm=null;
function step(i){
  si=Math.max(0,Math.min(ST.length-1,i));
  $('#msvg').innerHTML=mohr(80,20,30,ST[si][1])+(si===0?'<text x="200" y="150" text-anchor="middle" font-size="14" fill="#5b6f84">The circle appears as you step through.</text>':'');
  $('#stext').innerHTML=ST[si][0];$('#stepn').textContent=`Step ${si+1} of ${ST.length}`;
  $('#stepEls').innerHTML=elem(80,20,30,0,'Original element')+(si===8?elem(92.43,7.57,0,22.5,'Rotated 22.5° ccw: principal element'):'');
}
function play(){clearInterval(tm);step(0);tm=setInterval(()=>{if(si>=ST.length-1)clearInterval(tm);else step(si+1)},1600);}

/* Calculator */
function calc(){
  const sx=+$('#cx').value||0,sy=+$('#cy').value||0,t=+$('#ct').value||0;
  const C=(sx+sy)/2,R=Math.hypot((sx-sy)/2,t),d=Math.atan2(t,sx-sy)*180/Math.PI/2*2;
  const th=Math.atan2(2*t,sx-sy)*90/Math.PI;
  const o={ax:1,C:1,pts:1,circ:1,coords:$('#oc').checked,rad:$('#orr').checked,cons:$('#oco').checked,pr:$('#opr').checked,ang:$('#opr').checked,tm:$('#otm').checked};
  $('#csvg').innerHTML=mohr(sx,sy,t,o);
  $('#cout').innerHTML=`C = σavg = ${r2(C)} MPa<br>R = τmax = ${r2(R)} MPa<br>σ1 = ${r2(C+R)} MPa, σ2 = ${r2(C-R)} MPa<br>2θp = ${r2(2*th)}°, θp = ${r2(th)}° (counterclockwise from x-face to σ1)<br>σ2 plane at θp + 90° = ${r2(th+90)}°<br>Check: σ1 + σ2 = ${r2(2*C)} = σx + σy = ${r2(sx+sy)}`;
}

/* Practice */
const Q=[
 {q:'A bar of area 200 mm² carries 30 kN in tension. What is the direct stress?',o:['150 MPa','0.15 MPa','6.67 MPa','15 MPa'],a:0,h:['Use σ = F/A.','Convert kN to N first: 30 kN = 30 000 N.'],m:['','You skipped the kN to N conversion.','You divided area by force (200/30).','You used 3 kN instead of 30 kN.'],w:'σ = 30 000 N / 200 mm² = 150 N/mm² = 150 MPa'},
 {q:'σx = 80, σy = 20, τxy = 30 MPa. What is the centre of Mohr\'s circle?',o:['50 MPa','60 MPa','30 MPa','42.4 MPa'],a:0,h:['The centre is an average.','Add the two direct stresses and halve.'],m:['','That is σx − σy. The centre uses the sum.','That is (σx − σy)/2 or τxy, not the average.','That is the radius.'],w:'C = (80 + 20)/2 = 50 MPa'},
 {q:'σx = 100, σy = 20, τxy = 30 MPa. What is the radius R?',o:['50 MPa','40 MPa','85.4 MPa','70 MPa'],a:0,h:['R = √[((σx − σy)/2)² + τxy²].','(σx − σy)/2 = 40.'],m:['','You left out τxy.','You forgot to halve σx − σy.','You added 40 + 30 instead of using Pythagoras.'],w:'R = √(40² + 30²) = √2500 = 50 MPa'},
 {q:'Pure shear: σx = σy = 0, τxy = 40 MPa. What are the principal stresses?',o:['+40 and −40 MPa','+80 and −80 MPa','40 and 0 MPa','0 and 0 MPa'],a:0,h:['Find C first.','σ1,2 = C ± R.'],m:['','R is 40, not 80.','C = 0, so the two values are symmetric, ±R.','Shear is not zero, so the circle has radius 40.'],w:'C = 0, R = √(0² + 40²) = 40, so σ1,2 = ±40 MPa'},
 {q:'With the convention on this site, positive τxy on the right-hand face points:',o:['Up','Down','Left','Right'],a:0,h:['Positive τxy gives a counterclockwise turn on the vertical faces.'],m:['','That would be negative τxy.','Shear acts along the face, not into it.','Shear acts along the face, not out of it.'],w:'Positive τxy: right face up, left face down, top face right, bottom face left.'}
];
function practice(){
  $('#pq').innerHTML=Q.map((q,i)=>`<div class="card" id="q${i}"><b>Q${i+1}.</b> ${q.q}<div class="row"><button class="btn alt" data-hint="${i}">Show a hint</button><span id="h${i}"></span></div>${q.o.map((x,j)=>`<button class="opt" data-q="${i}" data-o="${j}">${x}</button>`).join('')}<div id="f${i}"></div></div>`).join('');
}

document.addEventListener('click',e=>{
  const p=e.target.closest('.pt');if(p&&p.closest('#csvg'))$('#cinfo').textContent=p.dataset.info;
  const h=e.target.closest('[data-hint]');
  if(h){const i=+h.dataset.hint,el=$('#h'+i);const n=+(el.dataset.n||0);if(n<Q[i].h.length){el.innerHTML+=` Hint ${n+1}: ${Q[i].h[n]}`;el.dataset.n=n+1;}}
  const b=e.target.closest('[data-o]');
  if(b){const i=+b.dataset.q,j=+b.dataset.o,q=Q[i];
    document.querySelectorAll(`#q${i} .opt`).forEach(x=>x.classList.remove('right','wrong'));
    b.classList.add(j===q.a?'right':'wrong');
    $('#f'+i).innerHTML=j===q.a?`<div class="tip" style="border-color:#1d9e75;background:#e3f5ee"><b>Correct.</b> ${q.w}</div>`:`<div class="tip"><b>Not quite.</b> ${q.m[j]} Try again, or use a hint.</div>`;}
});
$('#prev').onclick=()=>{clearInterval(tm);step(si-1)};
$('#next').onclick=()=>{clearInterval(tm);step(si+1)};
$('#replay').onclick=play;
['cx','cy','ct','oc','orr','oco','opr','otm'].forEach(id=>$('#'+id).addEventListener('input',calc));
$('#els').innerHTML=elem(80,0,0,0,'Direct stress (tension)')+elem(-60,0,0,0,'Direct stress (compression)')+elem(0,0,40,0,'Shear stress only')+elem(80,20,30,0,'Combined: σx, σy and τxy');
$('#exsvg').innerHTML=mohr(80,20,30,{ax:1,C:1,pts:1,circ:1,rad:1,pr:1,tm:1,cons:1,coords:1});
window.addEventListener('hashchange',show);
show();step(0);calc();practice();
