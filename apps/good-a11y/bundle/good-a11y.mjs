#!/usr/bin/env node
import { createRequire as __goodA11yCreateRequire } from "node:module";
const require = __goodA11yCreateRequire(import.meta.url);
var SB=Object.defineProperty;var qr=(e,t)=>{for(var n in t)SB(e,n,{get:t[n],enumerable:!0})};var re=(e,t)=>{switch(t.length){case 0:return e;case 1:return t[0](e);case 2:return t[1](t[0](e));case 3:return t[2](t[1](t[0](e)));case 4:return t[3](t[2](t[1](t[0](e))));case 5:return t[4](t[3](t[2](t[1](t[0](e)))));case 6:return t[5](t[4](t[3](t[2](t[1](t[0](e))))));case 7:return t[6](t[5](t[4](t[3](t[2](t[1](t[0](e)))))));case 8:return t[7](t[6](t[5](t[4](t[3](t[2](t[1](t[0](e))))))));case 9:return t[8](t[7](t[6](t[5](t[4](t[3](t[2](t[1](t[0](e)))))))));default:{let n=e;for(let r=0,o=t.length;r<o;r++)n=t[r](n);return n}}},bx={pipe(){return re(this,arguments)}},ys=(function(){function e(){}return e.prototype=bx,e})();var h=function(e,t){if(typeof e=="function")return function(){return e(arguments)?t.apply(this,arguments):n=>t(n,...arguments)};switch(e){case 0:case 1:throw new RangeError(`Invalid arity ${e}`);case 2:return function(n,r){return arguments.length>=2?t(n,r):function(o){return t(o,n)}};case 3:return function(n,r,o){return arguments.length>=3?t(n,r,o):function(s){return t(s,n,r)}};default:return function(){if(arguments.length>=e)return t.apply(this,arguments);let n=arguments;return function(r){return t(r,...n)}}}};var F=e=>e;var it=e=>()=>e,Fn=it(!0),Gu=it(!1),zd=it(null),Rn=it(void 0),No=Rn;function Wr(e,...t){return re(e,t)}function dr(e){let t=new WeakMap;return n=>{let r=t.get(n);if(r!==void 0)return r;let o=e(n);return t.set(n,o),o}}function ua(e){let t=new WeakMap;return n=>{let r=t.get(n);if(r!==void 0)return r;let o=e(n);return t.set(n,o),o!==n&&t.set(o,o),o}}var Ku=e=>{let t=new Set(Reflect.ownKeys(e));if(e.constructor===Object)return t;e instanceof Error&&t.delete("stack");let n=Object.getPrototypeOf(e),r=n;for(;r!==null&&r!==Object.prototype;){let o=Reflect.ownKeys(r);for(let s=0;s<o.length;s++)t.add(o[s]);r=Object.getPrototypeOf(r)}return t.has("constructor")&&typeof e.constructor=="function"&&n===e.constructor.prototype&&t.delete("constructor"),t},Ri=new WeakSet,Ju=e=>new Uint8Array(e.buffer,e.byteOffset,e.byteLength);var la=0,Vk=()=>{la++};function pr(e){return typeof e=="string"}function Zu(e){return typeof e=="number"}function qd(e){return typeof e=="boolean"}function Gk(e){return typeof e=="bigint"}function Sx(e){return typeof e=="symbol"}function Wd(e){return pr(e)||Zu(e)||Sx(e)}function bn(e){return typeof e=="function"}function bs(e){return e===void 0}function ct(e){return e!==void 0}function Qu(e){return e!==null}function Kk(e){return e==null}function Hd(e){return e!=null}function Jk(e){return!1}function Ex(e){return!0}function Mn(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Yu(e){return typeof e=="object"&&e!==null||bn(e)}var _=h(2,(e,t)=>Yu(e)&&t in e),Nn=h(2,(e,t)=>_(e,"_tag")&&e._tag===t);function Zk(e){return e instanceof Error}function Hr(e){return _(e,Symbol.iterator)||pr(e)}var oe="~effect/Hash",G=e=>{switch(typeof e){case"number":return Et(e);case"bigint":return Ie(e.toString(10));case"string":return Ie(e);case"function":case"object":{if(e===null)break;if(e instanceof Date)return Number.isNaN(e.getTime())?Ie("Invalid Date"):Ie(e.toISOString());if(e instanceof RegExp)return Ie(e.toString());{if(Ri.has(e))return Vd(e);let t=Yk.get(e);if(t!==void 0)return t;if(kx.has(e))return Vk(),Ie("[Circular]");kx.add(e);let n=la,r;try{oe in e?r=e[oe]():typeof e=="function"?r=Vd(e):e instanceof DataView?r=Vr(Ju(e)):Array.isArray(e)||ArrayBuffer.isView(e)?r=Vr(e):e instanceof Map?r=vB(e):e instanceof Set?r=wB(e):r=Xu(e)}finally{kx.delete(e)}return n===la&&Yk.set(e,r),r}}}return $t(Xk(Ie(String(e))))},Vd=e=>(wx.has(e)||wx.set(e,$t(Math.random()*4294967296|0)),wx.get(e)),Xk=e=>(e^=e>>>16,e=Math.imul(e,2246822507),e^=e>>>13,e=Math.imul(e,3266489909),e^e>>>16),ce=h(2,(e,t)=>Xk(Math.imul(e,2654435761)+Math.imul(t,2246822507))),$t=e=>e&3221225471|e>>>1&1073741824;var vx=new DataView(new ArrayBuffer(8)),Et=e=>{let t=e|0;return t===e?$t(t):(vx.setFloat64(0,e!==e?NaN:e),$t(ce(vx.getInt32(0),vx.getInt32(4))))},Ie=e=>{let t=5381,n=e.length;for(;n;)t=t*33^e.charCodeAt(--n);return $t(t)},Ix=(e,t)=>{let n=12289;for(let r of t)n^=ce(G(r),G(e[r]));return $t(n)},Xu=e=>Ix(e,Ku(e)),eI=(e,t)=>n=>{let r=e;for(let o of n)r^=t(o);return $t(r)},Vr=e=>{let t=6151;for(let n of e)t=ce(t,G(n));return $t(t)},vB=eI(Ie("Map"),([e,t])=>ce(G(e),G(t))),Qk=Ie("Set"),wB=eI(Qk,e=>ce(Qk,G(e))),wx=new WeakMap,Yk=new WeakMap,kx=new WeakSet;var se="~effect/Equal";function Q(){return arguments.length===1?e=>fa(e,arguments[0]):fa(arguments[0],arguments[1])}function fa(e,t){if(e===t)return!0;if(e==null||t==null)return!1;let n=typeof e;return n!==typeof t?!1:n==="number"&&e!==e&&t!==t?!0:n!=="object"&&n!=="function"||Ri.has(e)||Ri.has(t)?!1:kB(e,t)}function kB(e,t){let n=Gd.length;for(let s=n;s-- >0;)if(Gd[s]===e&&Cx[s]===t)return!0;if(n)return tI(e,t);let r=nI.get(e);r||nI.set(e,r=new WeakMap);let o=r.get(t);return o===void 0&&r.set(t,o=tI(e,t)),o}function tI(e,t){Gd.push(e),Cx.push(t);try{return IB(e,t)}finally{Gd.pop(),Cx.pop()}}var Gd=[],Cx=[],nI=new WeakMap;function IB(e,t){if(G(e)!==G(t))return!1;if(e instanceof Date){if(!(t instanceof Date))return!1;let r=e.getTime(),o=t.getTime();return r===o||Number.isNaN(r)&&Number.isNaN(o)}else if(e instanceof RegExp)return t instanceof RegExp&&e.toString()===t.toString();let n=oI(e);if(n!==oI(t)||typeof e=="function"&&!n)return!1;if(n)return e[se](t);if(Array.isArray(e))return!Array.isArray(t)||e.length!==t.length?!1:CB(e,t);if(ArrayBuffer.isView(e)){let r=e instanceof DataView;return!ArrayBuffer.isView(t)||e.byteLength!==t.byteLength||r!==t instanceof DataView?!1:r?rI(Ju(e),Ju(t)):rI(e,t)}else{if(e instanceof Map)return!(t instanceof Map)||e.size!==t.size?!1:Tx(e,t,AB,OB);if(e instanceof Set)return!(t instanceof Set)||e.size!==t.size?!1:Tx(e,t,G,fa)}return TB(e,t)}function CB(e,t){for(let n=0;n<e.length;n++)if(!fa(e[n],t[n]))return!1;return!0}function rI(e,t){if(e.length!==t.length)return!1;for(let n=0;n<e.length;n++)if(e[n]!==t[n])return!1;return!0}function TB(e,t){let n=Ku(e),r=Ku(t);if(n.size!==r.size)return!1;for(let o of n)if(!r.has(o)||!fa(e[o],t[o]))return!1;return!0}function Tx(e,t,n,r){let o=new Map;for(let s of t){let a=n(s),i=o.get(a);i?i.push(s):o.set(a,[s])}e:for(let s of e){let a=o.get(n(s));if(a){for(let i=0;i<a.length;i++)if(r(s,a[i])){a[i]=a[a.length-1],a.pop();continue e}}return!1}return!0}var AB=e=>G(e[0]),OB=(e,t)=>fa(e[0],t[0])&&fa(e[1],t[1]),_B=()=>0;function Kd(e,t){return el((n,r)=>e(n[0],r[0])&&t(n[1],r[1]))}function el(e){return function(n,r){return Tx(n,r,_B,e)}}var oI=e=>_(e,se);var sI=e=>(Ri.add(e),e);var da=Symbol.for("~effect/Redactable"),PB=e=>_(e,da);function Ss(e){return PB(e)?Ax(e):e}function Ax(e){return e[da](globalThis[Mi]?.context??FB)}var Mi="~effect/Fiber/currentFiber",aI=new Map,FB={"~effect/Context":{},base:aI,depth:0,mapUnsafe:aI,pipe(){return re(this,arguments)}};function M(e,t){let n=t?.space??0,r=new WeakSet,o=n?typeof n=="number"?" ".repeat(n):n:"",s=l=>o.repeat(l),a=(l,f)=>{let d=l?.constructor;return d&&d!==Object.prototype.constructor&&d.name?`${d.name}(${f})`:f},i=l=>{try{return Reflect.ownKeys(l)}catch{return["[ownKeys threw]"]}};function c(l,f=0){try{return u(l,f)}catch{return(typeof l=="object"&&l!==null||typeof l=="function")&&r.delete(l),"[inspection threw]"}}function u(l,f=0){if(typeof l=="string")return JSON.stringify(l);if(typeof l=="number"||l==null||typeof l=="boolean"||typeof l=="symbol")return String(l);if(typeof l=="bigint")return String(l)+"n";if(typeof l=="object"||typeof l=="function"){if(r.has(l))return RB;r.add(l);let d;if(da in l)d=c(Ax(l),f);else if(Array.isArray(l))d=!o||l.length<=1?`[${l.map(m=>c(m,f)).join(",")}]`:`[
${s(f+1)}${l.map(m=>c(m,f+1)).join(`,
`+s(f+1))}
${s(f)}]`;else if(l instanceof Date)d=Ox(l);else if(!t?.ignoreToString&&_(l,"toString")&&typeof l.toString=="function"&&l.toString!==Object.prototype.toString&&l.toString!==Array.prototype.toString){let m=MB(l);d=l instanceof Error&&l.cause!==void 0?`${m} (cause: ${c(l.cause,f)})`:m}else if(Symbol.iterator in l)d=`${l.constructor.name}(${c(Array.from(l),f)})`;else{let m=i(l);if(!o||m.length<=1){let g=`{${m.map(x=>`${Gr(x)}:${c(cI(l,x),f)}`).join(",")}}`;d=a(l,g)}else{let g=`{
${m.map(x=>`${s(f+1)}${Gr(x)}: ${c(cI(l,x),f+1)}`).join(`,
`)}
${s(f)}}`;d=a(l,g)}}return r.delete(l),d}return String(l)}return c(e,0)}var RB="[Circular]";function Gr(e){return typeof e=="string"?JSON.stringify(e):String(e)}function Jd(e){return e.map(t=>`[${Gr(t)}]`).join("")}function Ox(e){try{return e.toISOString()}catch{return"Invalid Date"}}function MB(e){try{let t=e.toString();return typeof t=="string"?t:String(t)}catch{return"[toString threw]"}}function cI(e,t){try{return e[t]}catch{return"[property access threw]"}}function pa(e,t){let n=[];return JSON.stringify(e,function(r,o){let s=Object.getOwnPropertyDescriptor(this,r)?.value,a=_(s,da)?Ss(s):Ss(o);if(typeof a=="bigint")return M(a);if(typeof a!="object"||a===null)return a;let i=a instanceof Error&&!_(a,"toJSON")?{...a,name:a.name,message:a.message}:a;for(;n.length>0&&n[n.length-1]!==this;)n.pop();if(!n.includes(a))return n.push(a),i!==a&&n.push(i),i},t?.space)??"null"}var Ee=Symbol.for("nodejs.util.inspect.custom"),Lt=e=>{try{return e=Ss(e),_(e,"toJSON")&&bn(e.toJSON)&&e.toJSON.length===0?e.toJSON():Array.isArray(e)?e.map(Lt):e}catch{return"[toJSON threw]"}},lI=(e,t=2)=>{if(typeof e=="string")return e;try{return typeof e=="object"?pa(e,{space:t}):M(e,{space:t})}catch{return String(e)}},Es={toJSON(){return Lt(this)},[Ee](){return this.toJSON()},toString(){return M(this.toJSON())}},uI=class{[Ee](){return this.toJSON()}toString(){return M(this.toJSON())}};var DB=()=>{let e=Object.getOwnPropertyDescriptor(Error,"stackTraceLimit");return e===void 0?Object.isExtensible(Error):Object.hasOwn(e,"writable")?e.writable===!0:e.set!==void 0},UB=DB(),Kr=()=>Error.stackTraceLimit,Dn=e=>{UB&&(Error.stackTraceLimit=e)};var vs=class{constructor(t){this.value=t,this.done=!1}next(t){return this.done?(this.value=t,this):(this.done=!0,{value:this.value,done:!1})}},$B=()=>{let e="~effect/Utils/internal",t={[e]:o=>o()},n={[e]:o=>o()};return Kr()!==0&&t[e](()=>new Error().stack)?.includes(e)===!0?t[e]:n[e]},ws=$B();function N(e,t,n){t==="__proto__"?Object.defineProperty(e,t,{value:n,writable:!0,enumerable:!0,configurable:!0}):e[t]=n}function Zd(e,t){for(let n of Reflect.ownKeys(t))Object.prototype.propertyIsEnumerable.call(t,n)&&N(e,n,t[n])}var Qr="~effect/Effect",ma="~effect/Exit",BB={_A:F,_E:F,_R:F},dI=`${Qr}/identifier`,fe=`${Qr}/args`,nt=`${Qr}/evaluate`,Tt=`${Qr}/successCont`,Un=`${Qr}/failureCont`,ha=`${Qr}/ensureCont`,xa=Symbol.for("effect/Effect/Yield"),Jt={pipe(){return re(this,arguments)},toJSON(){return{...this}},toString(){return M(this.toJSON(),{ignoreToString:!0,space:2})},[Ee](){return this.toJSON()}},pI={[oe](){return Ix(this,Object.keys(this))},[se](e){let t=Object.keys(this),n=Object.keys(e);if(t.length!==n.length)return!1;for(let r=0;r<t.length;r++)if(t[r]!==n[r]||!Q(this[t[r]],e[t[r]]))return!1;return!0}},jB={[Qr]:BB,...Jt,[Symbol.iterator](){return new vs(this)},toJSON(){return{_id:"Effect",op:this[dI],...fe in this?{args:this[fe]}:void 0}}},ae=e=>_(e,Qr),_x=e=>_(e,ma),Qd="~effect/Cause",nl="~effect/Cause/Reason",Ui=e=>_(e,Qd),mI=e=>_(e,nl),Jr=class{constructor(t){this[Qd]=Qd,this.reasons=t}pipe(){return re(this,arguments)}toJSON(){return{_id:"Cause",failures:this.reasons.map(t=>t.toJSON())}}toString(){return`Cause(${M(this.reasons)})`}[Ee](){return this.toJSON()}[se](t){return Ui(t)&&this.reasons.length===t.reasons.length&&this.reasons.every((n,r)=>Q(n,t.reasons[r]))}[oe](){return Vr(this.reasons)}},fI=new WeakMap,Ni=class{[nl];annotations;_tag;constructor(t,n,r){if(this[nl]=nl,this._tag=t,n!==ol&&typeof r=="object"&&r!==null&&n.size>0){let o=fI.get(r);o&&(n=new Map([...o,...n])),fI.set(r,n)}this.annotations=n}annotate(t,n){if(t.mapUnsafe.size===0)return this;let r=new Map(this.annotations);t.mapUnsafe.forEach((s,a)=>{n?.overwrite!==!0&&r.has(a)||r.set(a,s)});let o=Object.assign(Object.create(Object.getPrototypeOf(this)),this);return o.annotations=r,o}pipe(){return re(this,arguments)}toString(){return M(this)}[Ee](){return this.toString()}},ol=new Map,ga=class extends Ni{constructor(t,n=ol){super("Fail",n,t),this.error=t}toString(){return`Fail(${M(this.error)})`}toJSON(){return{_tag:"Fail",error:this.error}}[se](t){return Is(t)&&Q(this.error,t.error)&&Q(this.annotations,t.annotations)}[oe](){return ce(Ie(this._tag))(ce(G(this.error))(G(this.annotations)))}},ks=e=>new Jr(e),Px=new Jr([]),sl=e=>new Jr([new ga(e)]),rl=class extends Ni{constructor(t,n=ol){super("Die",n,t),this.defect=t}toString(){return`Die(${M(this.defect)})`}toJSON(){return{_tag:"Die",defect:this.defect}}[se](t){return cl(t)&&Q(this.defect,t.defect)&&Q(this.annotations,t.annotations)}[oe](){return ce(Ie(this._tag))(ce(G(this.defect))(G(this.annotations)))}},al=e=>new Jr([new rl(e)]),il=h(e=>Ui(e[0]),(e,t,n)=>t.mapUnsafe.size===0?e:new Jr(e.reasons.map(r=>r.annotate(t,n)))),Is=e=>e._tag==="Fail",cl=e=>e._tag==="Die",ul=e=>e._tag==="Interrupt";function zB(e){return Ln("Effect.evaluate: Not implemented")}var $n=e=>({...jB,[dI]:e.op,[nt]:e[nt]??zB,[Tt]:e[Tt],[Un]:e[Un],[ha]:e[ha]}),Yr=e=>{let t=$n(e),n=function(r){this[fe]=r};return n.prototype=t,function(r){return new n(r)}},hI=e=>{let t={[ma]:ma,_tag:e.op,get[e.prop](){return this[fe]},...$n(e),toString(){return`${e.op}(${M(this[fe])})`},toJSON(){return{_id:"Exit",_tag:e.op,[e.prop]:this[fe]}},[se](r){return _x(r)&&r._tag===this._tag&&Q(this[fe],r[fe])},[oe](){return ce(Ie(e.op),G(this[fe]))}},n=function(r){this[fe]=r};return n.prototype=t,function(r){return new n(r)}},Oe=hI({op:"Success",prop:"value",[nt](e){let t=e.getCont(Tt);return t?t[Tt](this[fe],e,this):e.yieldWith(this)}}),Xd={key:"effect/Cause/StackTrace"},Fx={key:"effect/Cause/InterruptorStackTrace"},Zt=hI({op:"Failure",prop:"cause",[nt](e){let t=this[fe],n=!1;e.cache.stackFrame&&(t=il(t,{mapUnsafe:new Map([[Xd.key,e.cache.stackFrame]])}),n=!0);let r=e.getCont(Un);for(;e.interruptible&&e._interruptedCause&&r;)r=e.getCont(Un);return r?r[Un](t,e,n?void 0:this):e.yieldWith(n?Zt(t):this)}}),nr=e=>Zt(sl(e)),Ln=e=>Zt(al(e)),te=Yr({op:"WithFiber",[nt](e){return this[fe](e)}}),gI=Yr({op:"WithFiberSucceed",[nt](e){let t=this[fe](e),n=e.getCont(Tt);return n?n[Tt](t,e):e.yieldWith(Oe(t))}}),qB=(function(){class e extends globalThis.Error{}let t=$n({op:"YieldableError",[nt](){return nr(this)}});return delete t.toString,Object.assign(e.prototype,t),e})(),ll=(function(){let e=Symbol.for("effect/Data/Error/plainArgs");return class extends qB{constructor(n){super(n?.message,n?.cause?{cause:n.cause}:void 0),n&&(Zd(this,n),Object.defineProperty(this,e,{value:n,enumerable:!1}))}toJSON(){return{...this[e],...this}}}})(),Do=e=>{class t extends ll{_tag=e}return t.prototype.name=e,t},Yd="~effect/Cause/NoSuchElementError",Rx=e=>_(e,Yd),Zr=class extends Do("NoSuchElementError"){[Yd]=Yd;constructor(t){super({message:t})}},Di="~effect/Cause/Done",fl=e=>_(e,Di),xI={[Di]:Di,_tag:"Done",value:void 0},$i=e=>e===void 0?xI:{[Di]:Di,_tag:"Done",value:e},WB=nr(xI),yI=e=>e===void 0?WB:nr($i(e));var Qt=e=>(t,n)=>t===n||e(t,n),HB=(e,t)=>e===t,ya=()=>HB;function bI(e){return Qt((t,n)=>{if(t.length!==n.length)return!1;for(let r=0;r<t.length;r++)if(!e[r](t[r],n[r]))return!1;return!0})}function ep(e){return Qt((t,n)=>{if(t.length!==n.length)return!1;for(let r=0;r<t.length;r++)if(!e(t[r],n[r]))return!1;return!0})}var Mx=e=>e.length>0;var dl=e=>e>0?Math.floor(e):0;var tp=e=>h(3,(t,n,r)=>e(t,o=>({...o,[n]:r(o)}))),np=e=>h(2,(t,n)=>e(t,r=>({[n]:r}))),rp=(e,t)=>h(3,(n,r,o)=>t(n,s=>e(o(s),a=>({...s,[r]:a}))));var vI="~effect/Option",wI={[vI]:{_A:e=>e},...Jt,[Symbol.iterator](){return new vs(this)}},GB=Object.defineProperty(Object.assign(Object.create(wI),{_tag:"Some",_op:"Some",[se](e){return op(e)&&Nx(e)&&Q(this.value,e.value)},[oe](){return ce(G(this._tag))(G(this.value))},toString(){return`some(${M(this.value)})`},toJSON(){return{_id:"Option",_tag:this._tag,value:Lt(this.value)}}}),"valueOrUndefined",{get(){return this.value}}),KB=G("None"),JB=Object.assign(Object.create(wI),{_tag:"None",_op:"None",valueOrUndefined:void 0,[se](e){return op(e)&&Cs(e)},[oe](){return KB},toString(){return"none()"},toJSON(){return{_id:"Option",_tag:this._tag}}}),op=e=>_(e,vI),Cs=e=>e._tag==="None",Nx=e=>e._tag==="Some",ba=Object.create(JB),kI=function(e){this.value=e};kI.prototype=GB;var Uo=e=>new kI(e);var II="~effect/Result",CI={[II]:{_A:e=>e,_E:e=>e},...Jt,[Symbol.iterator](){return new vs(this)}},ZB=Object.assign(Object.create(CI),{_tag:"Success",_op:"Success",[se](e){return sp(e)&&ip(e)&&Q(this.success,e.success)},[oe](){return ce(G(this._tag))(G(this.success))},toString(){return`success(${M(this.success)})`},toJSON(){return{_id:"Result",_tag:this._tag,value:Lt(this.success)}}}),QB=Object.assign(Object.create(CI),{_tag:"Failure",_op:"Failure",[se](e){return sp(e)&&ap(e)&&Q(this.failure,e.failure)},[oe](){return ce(G(this._tag))(G(this.failure))},toString(){return`failure(${M(this.failure)})`},toJSON(){return{_id:"Result",_tag:this._tag,failure:Lt(this.failure)}}}),sp=e=>_(e,II),ap=e=>e._tag==="Failure",ip=e=>e._tag==="Success",TI=function(e){this.failure=e};TI.prototype=QB;var Ux=e=>new TI(e),AI=function(e){this.success=e};AI.prototype=ZB;var $x=e=>new AI(e),OI=e=>ip(e)?ba:Uo(e.failure),_I=e=>ap(e)?ba:Uo(e.success),PI=h(2,(e,t)=>Cs(e)?Ux(t()):$x(e.value));function Li(e){return(t,n)=>t===n?0:e(t,n)}var FI=Li((e,t)=>e<t?-1:1),$o=Li((e,t)=>globalThis.Number.isNaN(e)&&globalThis.Number.isNaN(t)?0:globalThis.Number.isNaN(e)?-1:globalThis.Number.isNaN(t)?1:e<t?-1:1);var Bi=Li((e,t)=>e<t?-1:1);var Lx=h(2,(e,t)=>Li((n,r)=>e(t(n),t(r)))),ji=Lx($o,e=>e.getTime());var cp=e=>h(2,(t,n)=>e(t,n)===-1),zi=e=>h(2,(t,n)=>e(t,n)===1),up=e=>h(2,(t,n)=>e(t,n)!==1),lp=e=>h(2,(t,n)=>e(t,n)!==-1);var A=()=>ba,R=Uo,dp=op,He=Cs,$e=Nx,_e=h(2,(e,{onNone:t,onSome:n})=>He(e)?t():n(e.value));var gt=h(2,(e,t)=>He(e)?t():e.value);var Sa=e=>e==null?A():R(e),Ts=e=>e===void 0?A():R(e),RI=e=>e===null?A():R(e);var Bx=gt(zd),mn=gt(Rn),eo=e=>(...t)=>{try{return R(e(...t))}catch{return A()}};var As=h(2,(e,t)=>He(e)?A():R(t(e.value)));var pp=h(2,(e,t)=>He(e)?A():t(e.value));var qi=pp(F);var Wi=h(2,(e,t)=>He(e)?A():t(e.value)?R(e.value):A());var MI=h(2,(e,t)=>t(e)?R(e):A());var NI=h(2,(e,t)=>He(e)?!1:t(e.value));var Ke={};qr(Ke,{Do:()=>gj,all:()=>$I,andThen:()=>pj,bind:()=>xj,bindTo:()=>yj,fail:()=>K,failVoid:()=>ej,filterOrFail:()=>cj,flatMap:()=>ut,flip:()=>mj,fromNullishOr:()=>tj,fromOption:()=>nj,gen:()=>hj,getFailure:()=>oj,getOrElse:()=>Os,getOrNull:()=>lj,getOrThrow:()=>Ea,getOrThrowWith:()=>UI,getOrUndefined:()=>fj,getSuccess:()=>rj,isFailure:()=>he,isResult:()=>mp,isSuccess:()=>Ft,let:()=>bj,liftPredicate:()=>ij,makeEquivalence:()=>sj,map:()=>wt,mapBoth:()=>aj,mapError:()=>pl,match:()=>on,merge:()=>uj,orElse:()=>dj,succeed:()=>$,succeedNone:()=>jx,succeedSome:()=>vj,tap:()=>wj,transposeMapOption:()=>Ej,transposeOption:()=>Sj,try:()=>DI,void:()=>XB});var $=$x,K=Ux,XB=$(void 0);var ej=K(void 0),tj=h(2,(e,t)=>e==null?K(t(e)):$(e)),nj=PI,DI=e=>{if(bn(e))try{return $(e())}catch(t){return K(t)}else try{return $(e.try())}catch(t){return K(e.catch(t))}};var mp=sp,he=ap,Ft=ip,rj=_I,oj=OI,sj=(e,t)=>Qt((n,r)=>he(n)?he(r)&&t(n.failure,r.failure):Ft(r)&&e(n.success,r.success)),aj=h(2,(e,{onFailure:t,onSuccess:n})=>he(e)?K(t(e.failure)):$(n(e.success))),pl=h(2,(e,t)=>he(e)?K(t(e.failure)):e),wt=h(2,(e,t)=>Ft(e)?$(t(e.success)):e),on=h(2,(e,{onFailure:t,onSuccess:n})=>he(e)?t(e.failure):n(e.success)),ij=h(3,(e,t,n)=>t(e)?$(e):K(n(e))),cj=h(3,(e,t,n)=>ut(e,r=>t(r)?$(r):K(n(r)))),uj=on({onFailure:F,onSuccess:F}),Os=h(2,(e,t)=>he(e)?t(e.failure):e.success),lj=Os(zd),fj=Os(Rn),UI=h(2,(e,t)=>{if(Ft(e))return e.success;throw t(e.failure)}),Ea=UI(F),dj=h(2,(e,t)=>he(e)?t(e.failure):$(e.success)),ut=h(2,(e,t)=>he(e)?K(e.failure):t(e.success)),pj=h(2,(e,t)=>ut(e,n=>{let r=bn(t)?t(n):t;return mp(r)?r:$(r)})),$I=e=>{if(Symbol.iterator in e){let n=[];for(let r of e){if(he(r))return r;n.push(r.success)}return $(n)}let t={};for(let n of Object.keys(e)){let r=e[n];if(he(r))return r;N(t,n,r.success)}return $(t)},mj=e=>he(e)?$(e.failure):K(e.success),hj=(...e)=>{let n=(e.length===1?e[0]:e[1].bind(e[0]))(),r=n.next();for(;!r.done;){let o=r.value;if(he(o))return o;r=n.next(o.success)}return $(r.value)},gj=$({}),xj=rp(wt,ut),yj=np(wt),bj=tp(wt);var Sj=e=>Cs(e)?jx:wt(e.value,Uo),Ej=h(2,(e,t)=>Cs(e)?jx:wt(t(e.value),Uo)),jx=$(ba),vj=e=>$(Uo(e)),wj=h(2,(e,t)=>(Ft(e)&&t(e.success),e));var LI=bI;var jI=h(2,(e,t)=>{let n=0;for(let r of e){let o=t(r,n);if(qd(o)){if(o)return R(r)}else if($e(o))return o;n++}return A()});var zI=h(2,(e,t)=>({[Symbol.iterator](){let n=e[Symbol.iterator](),r=0;return{next(){let o=n.next();for(;!o.done;){if(t(o.value,r++))return{done:!1,value:o.value};o=n.next()}return{done:!0,value:void 0}}}}}));var kj=h(2,(e,t)=>Object.hasOwn(e,t));var hp=h(2,(e,t)=>{let n={...e};for(let r of qI(e))N(n,r,t(e[r],r));return n});var qI=e=>Object.keys(e);var Ij=e=>h(2,(t,n)=>{for(let r of qI(t))if(!kj(n,r)||!e(t[r],n[r]))return!1;return!0});var WI=e=>{let t=Ij(e);return(n,r)=>t(n,r)&&t(r,n)};var qx=globalThis.Array;var Yt=e=>qx.isArray(e)?e:qx.from(e);var ml=h(2,(e,{onEmpty:t,onNonEmpty:n})=>_s(e)?n(e):t());var xp=h(2,(e,t)=>[...e,t]);var Cj=qx.isArray;var va=Mx,_s=Mx;function Hi(e){let t=Number(e);return String(t)===e&&Number.isInteger(t)&&t>=0&&t<2**32-1}var yp=h(2,(e,t)=>{let n=0;for(let r of e){if(t(r,n))return R(n);n++}return A()});var hl=jI;var bp=h(2,(e,t)=>{let n=Yt(e);for(let r=n.length-1;r>=0;r--){let o=n[r],s=t(o,r);if(typeof s=="boolean"){if(s)return R(o)}else if($e(s))return s}return A()});var Tj=(e,t)=>{let n=G(t),r=e.get(n);if(r===void 0)return e.set(n,[t]),!0;for(let o of r)if(Q(o,t))return!1;return r.push(t),!0};var wa=()=>[],ka=e=>[e],At=h(2,(e,t)=>e.map(t));var Wx=h(2,(e,t)=>{let n=[],r=[],o=0;for(let s of e){let a=t(s,o++);Ft(a)?n.push(a.success):r.push(a.failure)}return[n,r]});var Vi=h(3,(e,t,n)=>Yt(e).reduce((r,o,s)=>n(r,o,s),t));var HI=ep;var Sp=e=>{let t=Yt(e);if(t.length<2)return[...t];let n=new Map,r=[];for(let o of t)Tj(n,o)&&r.push(o);return r};var to=e=>$n({op:e.label,[nt]:e.evaluate});var VI="~effect/Context/Service",Je=function(){function e(){}let t=e;Object.setPrototypeOf(t,Aj);let n=(r,o)=>(t.key=r,o?.defaultValue&&(t[Vx]=Vx,t.defaultValue=o.defaultValue),o?.make&&(t.make=o.make),o?.fiberCached&&GI.add(r),t);return arguments.length>0?n(arguments[0],arguments[1]):n},Aj={[VI]:VI,...to({label:"Service",evaluate(e){return Oe(rt(e.context,this))}}),toJSON(){return{_id:"Service",key:this.key}},of(e){return e},context(e){return Lo(this,e)},use(e){return te(t=>e(rt(t.context,this)))},useSync(e){return te(t=>Oe(e(rt(t.context,this))))}},GI=new Set,Vx="~effect/Context/Reference",KI="~effect/Context",Oj=8,_j=8,Gx=(e,t,n,r)=>{let o=Object.create(Fj);return o.cacheRoot=e??o,o.base=t,o.overlay=n,o.depth=r,o._flat=void 0,o.baseHits=0,o},JI=(e,t)=>{t&&(JI(e,t.parent),e.set(t.key,t.value))},ZI=e=>{if(e._flat)return e._flat;if(!e.overlay)return e._flat=e.base;let t=new Map(e.base);return JI(t,e.overlay),e._flat=t},Pj=(e,t)=>{let n=new Map(e.mapUnsafe);return t(n),Ki(n)},Ep=Symbol(),Kx=(e,t)=>{let n=e;for(let o=n.overlay;o;o=o.parent)if(o.key===t)return o.value;let r=n.base.get(t);return r===void 0&&!n.base.has(t)?Ep:(n.overlay&&++n.baseHits>=n.base.size&&n.baseHits>=_j&&(n.base=ZI(n),n.overlay=void 0,n.depth=0),r)},Ki=e=>Gx(void 0,e,void 0,0),Fj={get mapUnsafe(){return ZI(this)},...Jt,[KI]:{_Services:e=>e},toJSON(){return{_id:"Context",services:Array.from(this.mapUnsafe).map(([e,t])=>({key:e,value:t}))}},[se](e){if(!Jx(e))return!1;let t=this.mapUnsafe,n=e.mapUnsafe;if(t.size!==n.size)return!1;for(let[r,o]of t)if(!n.has(r)||!Q(o,n.get(r)))return!1;return!0},[oe](){return Et(this.mapUnsafe.size)}},QI=(e,t)=>e.cacheRoot===t.cacheRoot,Jx=e=>_(e,KI);var YI=e=>!!e[Vx],sn=()=>Rj,Rj=Ki(new Map),Lo=(e,t)=>Ki(new Map([[e.key,t]])),Xt=h(3,(e,t,n)=>Mj(e,t.key,n)),Mj=(e,t,n)=>{let r=e,o=GI.has(t)?void 0:r.cacheRoot;if(r.depth>=Oj){let s=new Map(r.mapUnsafe);return s.set(t,n),Gx(o,s,void 0,0)}return Gx(o,r.base,{key:t,value:n,parent:r.overlay},r.depth+1)};var vp=h(2,(e,t)=>gl(e,t.key)),gl=(e,t)=>{let n=Kx(e,t);return n===Ep?void 0:n},no=h(2,(e,t)=>{let n=Kx(e,t.key);if(n===Ep){if(YI(t))return XI(t);throw Nj(t)}return n}),rt=no,Hx="~effect/Context/defaultValue",XI=e=>Hx in e?e[Hx]:e[Hx]=e.defaultValue(),Nj=e=>{let t=new Error(`Service not found${e.key?`: ${String(e.key)}`:""}`);if(t.stack){let n=t.stack.split(`
`);n.splice(1,3),t.stack=n.join(`
`)}return t},wp=h(2,(e,t)=>{let n=Kx(e,t.key);return n!==Ep?R(n):YI(t)?R(XI(t)):A()}),Ia=h(2,(e,t)=>e.mapUnsafe.size===0?t:t.mapUnsafe.size===0?e:Pj(e,n=>t.mapUnsafe.forEach((r,o)=>n.set(o,r)))),eC=(...e)=>{let t=new Map;for(let n=0;n<e.length;n++)e[n].mapUnsafe.forEach((r,o)=>{t.set(o,r)});return Ki(t)};var xe=Je;var Ip="~effect/Duration",Yi=BigInt(0),aC=BigInt(1),Dj=BigInt(2),Uj=BigInt(10),tC=BigInt(24),kp=BigInt(60),Zx=BigInt(1e3),nC=BigInt(1e6);var Cp=e=>BigInt(e<0?Math.ceil(e-.5):Math.floor(e+.5)),iC=e=>Cp(e*1e6),rC=(e,t)=>{let n=e.indexOf(".");if(n===-1)return BigInt(e)*t;let r=e[0]==="-",o=e.slice(n+1),s=Uj**BigInt(o.length),a=(BigInt(e.slice(r?1:0,n))*s+BigInt(o))*t,i=a/s+(a%s*Dj>=s?aC:Yi);return r?-i:i};var $j=/^(-?\d+(?:\.\d+)?)\s+(nanos?|micros?|millis?|seconds?|minutes?|hours?|days?|weeks?)$/,Rt=e=>{switch(typeof e){case"number":return Qi(e);case"bigint":return ro(e);case"string":{if(e==="Infinity")return Ca;if(e==="-Infinity")return Zi;let t=$j.exec(e);if(!t)break;let[n,r,o]=t;if(o==="nano"||o==="nanos")return ro(rC(r,aC));if(o==="micro"||o==="micros")return ro(rC(r,Zx));let s=Number(r);switch(o){case"milli":case"millis":return Qi(s);case"second":case"seconds":return Yx(s);case"minute":case"minutes":return Hj(s);case"hour":case"hours":return Vj(s);case"day":case"days":return Gj(s);case"week":case"weeks":return Kj(s)}break}case"object":{if(e===null)break;if(Ip in e)return e;if(Array.isArray(e))return e.length!==2||!e.every(Zu)?oC(e):Number.isNaN(e[0])||Number.isNaN(e[1])?Ji:e[0]===-1/0||e[1]===-1/0?Zi:e[0]===1/0||e[1]===1/0?Ca:en(Cp(e[0]*1e9+e[1]));let t=e,n=0;return t.weeks&&(n+=t.weeks*6048e5),t.days&&(n+=t.days*864e5),t.hours&&(n+=t.hours*36e5),t.minutes&&(n+=t.minutes*6e4),t.seconds&&(n+=t.seconds*1e3),t.milliseconds&&(n+=t.milliseconds),!t.microseconds&&!t.nanoseconds?en(n):en(Cp(n*1e6+(t.microseconds??0)*1e3+(t.nanoseconds??0)))}}return oC(e)},oC=e=>{throw new Error(`Invalid Input: ${e}`)},cC=eo(Rt),sC={_tag:"Millis",millis:0},Lj={_tag:"Infinity"},Bj={_tag:"NegativeInfinity"},jj={[Ip]:Ip,[oe](){switch(this.value._tag){case"Millis":{let e=this.value.millis*1e6;return Number.isFinite(e)?G(Cp(e)):Et(this.value.millis)}case"Nanos":return G(this.value.nanos);default:return Xu(this.value)}},[se](e){return Qx(e)&&Zj(this,e)},toString(){switch(this.value._tag){case"Infinity":return"Infinity";case"NegativeInfinity":return"-Infinity";case"Nanos":return`${this.value.nanos} nanos`;case"Millis":return`${this.value.millis} millis`}},toJSON(){switch(this.value._tag){case"Millis":return{_id:"Duration",_tag:"Millis",millis:this.value.millis};case"Nanos":return{_id:"Duration",_tag:"Nanos",nanos:String(this.value.nanos)};case"Infinity":return{_id:"Duration",_tag:"Infinity"};case"NegativeInfinity":return{_id:"Duration",_tag:"NegativeInfinity"}}},[Ee](){return this.toJSON()},pipe(){return re(this,arguments)}},en=e=>{let t=Object.create(jj);return typeof e=="number"?isNaN(e)||e===0||Object.is(e,-0)?t.value=sC:Number.isFinite(e)?Number.isInteger(e)?t.value={_tag:"Millis",millis:e}:t.value={_tag:"Nanos",nanos:iC(e)}:t.value=e>0?Lj:Bj:e===Yi?t.value=sC:t.value={_tag:"Nanos",nanos:e},t},Qx=e=>_(e,Ip),Ap=e=>e.value._tag!=="Infinity"&&e.value._tag!=="NegativeInfinity",zj=e=>{switch(e.value._tag){case"Millis":return e.value.millis===0;case"Nanos":return e.value.nanos===Yi;case"Infinity":case"NegativeInfinity":return!1}},qj=e=>{switch(e.value._tag){case"Millis":return e.value.millis<0;case"Nanos":return e.value.nanos<Yi;case"NegativeInfinity":return!0;case"Infinity":return!1}};var Wj=e=>{switch(e.value._tag){case"Infinity":case"NegativeInfinity":return Ca;case"Millis":return e.value.millis<0?en(-e.value.millis):e;case"Nanos":return e.value.nanos<Yi?en(-e.value.nanos):e}};var Ji=en(0),Ca=en(1/0),Zi=en(-1/0),ro=e=>en(e);var Qi=e=>en(e),Yx=e=>en(e*1e3),Hj=e=>en(e*6e4),Vj=e=>en(e*36e5),Gj=e=>en(e*864e5),Kj=e=>en(e*6048e5),Bo=e=>fC(Rt(e),{onMillis:F,onNanos:t=>Number(t)/1e6,onInfinity:()=>1/0,onNegativeInfinity:()=>-1/0}),uC=e=>fC(Rt(e),{onMillis:t=>t/1e3,onNanos:t=>Number(t)/1e9,onInfinity:()=>1/0,onNegativeInfinity:()=>-1/0});var Tp=e=>{let t=Rt(e);switch(t.value._tag){case"Infinity":case"NegativeInfinity":throw new Error("Cannot convert infinite duration to nanos");case"Nanos":return t.value.nanos;case"Millis":return iC(t.value.millis)}},lC=eo(Tp);var fC=h(2,(e,t)=>{switch(e.value._tag){case"Millis":return t.onMillis(e.value.millis);case"Nanos":return t.onNanos(e.value.nanos);case"Infinity":return t.onInfinity();case"NegativeInfinity":return(t.onNegativeInfinity??t.onInfinity)()}}),dC=h(3,(e,t,n)=>e.value._tag==="Infinity"||e.value._tag==="NegativeInfinity"||t.value._tag==="Infinity"||t.value._tag==="NegativeInfinity"?n.onInfinity(e,t):e.value._tag==="Millis"?t.value._tag==="Millis"?n.onMillis(e.value.millis,t.value.millis):n.onNanos(Tp(e),t.value.nanos):n.onNanos(e.value.nanos,Tp(t)));var Jj=(e,t)=>dC(e,t,{onMillis:(n,r)=>n===r,onNanos:(n,r)=>n===r,onInfinity:(n,r)=>n.value._tag===r.value._tag});var pC=h(2,(e,t)=>dC(e,t,{onMillis:(n,r)=>en(n-r),onNanos:(n,r)=>en(n-r),onInfinity:(n,r)=>{let o=n.value._tag,s=r.value._tag;return o==="Infinity"?s==="Infinity"?Ji:Ca:o==="NegativeInfinity"?s==="NegativeInfinity"?Ji:Zi:s==="Infinity"?Zi:Ca}}));var Zj=h(2,(e,t)=>Jj(e,t)),Qj=e=>{if(e.value._tag==="Infinity")return{days:1/0,hours:1/0,minutes:1/0,seconds:1/0,millis:1/0,nanos:1/0};if(e.value._tag==="NegativeInfinity")return{days:-1/0,hours:-1/0,minutes:-1/0,seconds:-1/0,millis:-1/0,nanos:-1/0};let t=Tp(e),n=t<Yi,r=n?-t:t,o=r/nC,s=o/Zx,a=s/kp,i=a/kp,c=i/tC,u=n?-1:1;return{days:u*Number(c),hours:u*Number(i%tC),minutes:u*Number(a%kp),seconds:u*Number(s%kp),millis:u*Number(o%Zx),nanos:u*Number(r%nC)}},Xx=e=>{if(e.value._tag==="Infinity")return"Infinity";if(e.value._tag==="NegativeInfinity")return"-Infinity";if(zj(e))return"0";if(qj(e))return"-"+Xx(Wj(e));let t=Qj(e),n=[];return t.days!==0&&n.push(`${t.days}d`),t.hours!==0&&n.push(`${t.hours}h`),t.minutes!==0&&n.push(`${t.minutes}m`),t.seconds!==0&&n.push(`${t.seconds}s`),t.millis!==0&&n.push(`${t.millis}ms`),t.nanos!==0&&n.push(`${t.nanos}ns`),n.join(" ")};var xl=xe("effect/Scheduler",{fiberCached:!0,defaultValue:()=>new Ta}),mC=e=>{let t=!1;return Promise.resolve().then(()=>{t||e()}),()=>{t=!0}},Yj="setImmediate"in globalThis?e=>{let t=globalThis.setImmediate(e);return()=>globalThis.clearImmediate(t)}:e=>{let t=setTimeout(e,0);return()=>clearTimeout(t)},hC=e=>{try{return Yj(e)}catch{return mC(e)}},ey=class{buckets=[];scheduleTask(t,n){let r=this.buckets,o=r.length,s,a=0;for(;a<o&&!(r[a][0]>n);a++)s=r[a];s&&s[0]===n?s[1].push(t):a===o?r.push([n,[t]]):r.splice(a,0,[n,[t]])}drain(){let t=this.buckets;return this.buckets=[],t}},Ta=class{executionMode;setImmediate;constructor(t="async",n){this.executionMode=t,this.setImmediate=n??(t==="sync"?mC:hC)}shouldYield(t){return t.currentOpCount>=t.cache.maxOpsBeforeYield}makeDispatcher(){return new ty(this.setImmediate)}},ty=class{tasks=new ey;running=void 0;setImmediate;constructor(t=hC){this.setImmediate=t}scheduleTask(t,n){this.tasks.scheduleTask(t,n),this.running===void 0&&(this.running=this.setImmediate(this.afterScheduled))}afterScheduled=()=>{this.running=void 0,this.runTasks()};runTasks(){let t=this.tasks.drain();for(let n=0;n<t.length;n++){let r=t[n][1];for(let o=0;o<r.length;o++)r[o]()}}flush(){for(;this.tasks.buckets.length>0;)this.running!==void 0&&(this.running(),this.running=void 0),this.runTasks()}},gC=xe("effect/Scheduler/MaxOpsBeforeYield",{fiberCached:!0,defaultValue:()=>2048}),xC=xe("effect/Scheduler/PreventSchedulerYield",{fiberCached:!0,defaultValue:()=>!1});var yC=class extends ys{constructor(e){super(),e&&Zd(this,e)}};var bC=()=>new Proxy({},{get(e,t,n){return t==="$is"?Nn:t==="$match"?Xj:r=>({...r,_tag:t})}});function Xj(){if(arguments.length===1){let n=arguments[0];return function(r){return n[r._tag](r)}}let e=arguments[0];return arguments[1][e._tag](e)}var Op=ll,hr=Do;var SC="~effect/encoding/EncodingError",rr=class extends hr("EncodingError"){[SC]=SC};var wC=e=>EC(typeof e=="string"?rz.encode(e):e),ry=e=>{switch(e){case 16:return tz();case 32:return nz();default:{let t="";for(let n=e>>>3;n>0;n--)t+=ez();return t}}},Y=Uint8Array.from("0123456789abcdef",e=>e.charCodeAt(0)),Oa=()=>Math.random()*4294967296>>>0,ez=()=>{let e=Oa();return String.fromCharCode(Y[e>>>28],Y[e>>>24&15],Y[e>>>20&15],Y[e>>>16&15],Y[e>>>12&15],Y[e>>>8&15],Y[e>>>4&15],Y[e&15])},tz=()=>{let e=Oa(),t=Oa();return String.fromCharCode(Y[e>>>28],Y[e>>>24&15],Y[e>>>20&15],Y[e>>>16&15],Y[e>>>12&15],Y[e>>>8&15],Y[e>>>4&15],Y[e&15],Y[t>>>28],Y[t>>>24&15],Y[t>>>20&15],Y[t>>>16&15],Y[t>>>12&15],Y[t>>>8&15],Y[t>>>4&15],Y[t&15])},nz=()=>{let e=Oa(),t=Oa(),n=Oa(),r=Oa();return String.fromCharCode(Y[e>>>28],Y[e>>>24&15],Y[e>>>20&15],Y[e>>>16&15],Y[e>>>12&15],Y[e>>>8&15],Y[e>>>4&15],Y[e&15],Y[t>>>28],Y[t>>>24&15],Y[t>>>20&15],Y[t>>>16&15],Y[t>>>12&15],Y[t>>>8&15],Y[t>>>4&15],Y[t&15],Y[n>>>28],Y[n>>>24&15],Y[n>>>20&15],Y[n>>>16&15],Y[n>>>12&15],Y[n>>>8&15],Y[n>>>4&15],Y[n&15],Y[r>>>28],Y[r>>>24&15],Y[r>>>20&15],Y[r>>>16&15],Y[r>>>12&15],Y[r>>>8&15],Y[r>>>4&15],Y[r&15])},oy=e=>{let t=new TextEncoder().encode(e);if(t.length%2!==0)return K(new rr({module:"Hex",kind:"Decode",input:e,message:`Length must be a multiple of 2, but is ${t.length}`}));try{let n=t.length/2,r=new Uint8Array(n);for(let o=0;o<n;o++){let s=vC(t[o*2]),a=vC(t[o*2+1]);r[o]=s<<4|a}return $(r)}catch(n){return K(new rr({module:"Hex",kind:"Decode",input:e,message:n instanceof Error?n.message:"Invalid input"}))}},kC=e=>wt(oy(e),t=>oz.decode(t)),rz=new TextEncoder,oz=new TextDecoder,sz=Array.from({length:256},(e,t)=>t.toString(16).padStart(2,"0")),EC=e=>{let t="";for(let n=0;n<e.length;n++)t+=sz[e[n]];return t},vC=e=>{if(48<=e&&e<=57)return e-48;if(97<=e&&e<=102)return e-97+10;if(65<=e&&e<=70)return e-65+10;throw new TypeError("Invalid input")};var ay="effect/Tracer/ParentSpan",yl=class extends Je()(ay,{fiberCached:!0}){},az=e=>e;var _p=xe("effect/Tracer/DisablePropagation",{defaultValue:Gu}),CC=xe("effect/Tracer/CurrentTraceLevel",{defaultValue:()=>"Info"}),TC=xe("effect/Tracer/MinimumTraceLevel",{defaultValue:()=>"All"}),iy="effect/Tracer",cy=xe(iy,{fiberCached:!0,defaultValue:()=>uy}),uy=az({span:e=>new sy(e)}),sy=class{_tag="Span";sampled;name;parent;annotations;links;startTime;kind;status;_traceId=void 0;_spanId=void 0;_attributes=void 0;_events=void 0;constructor(t){this.name=t.name,this.parent=t.parent,this.annotations=t.annotations,this.links=t.links,this.startTime=t.startTime,this.kind=t.kind,this.sampled=t.sampled,this.status={_tag:"Started",startTime:t.startTime}}get traceId(){return this._traceId??=mn(this.parent)?.traceId??ry(32)}get spanId(){return this._spanId??=ry(16)}get attributes(){return this._attributes??=new Map}get events(){return this._events??=[]}end(t,n){this.status={_tag:"Ended",endTime:t,exit:n,startTime:this.status.startTime}}attribute(t,n){this.attributes.set(t,n)}event(t,n,r){this.events.push([t,n,r??{}])}addLinks(t){this.links.push(...t)}};var OC="effect/Metric/FiberRuntimeMetrics";var _C=xe("effect/ErrorReporter/CurrentErrorReporters",{defaultValue:()=>new Set}),bl=xe("effect/References/CurrentStackFrame",{fiberCached:!0,defaultValue:Rn}),Pp=xe("effect/References/TracerEnabled",{fiberCached:!0,defaultValue:Fn}),Xi=xe("effect/References/TracerTimingEnabled",{defaultValue:Fn}),Sl=xe("effect/References/TracerSpanAnnotations",{defaultValue:()=>({})}),El=xe("effect/References/TracerSpanLinks",{defaultValue:()=>[]}),zo=xe("effect/References/CurrentLogAnnotations",{defaultValue:()=>({})}),ly=xe("effect/References/CurrentLogLevel",{fiberCached:!0,defaultValue:()=>"Info"}),Fp=xe("effect/References/MinimumLogLevel",{fiberCached:!0,defaultValue:()=>"Info"});var Rp=xe("effect/References/CurrentLogSpans",{defaultValue:()=>[]});var Mp=e=>{if(e?.captureStackTrace===!1)return e;if(e?.captureStackTrace!==void 0&&typeof e.captureStackTrace!="boolean")return e;let t=Kr();if(t===0&&e?.captureStackTrace!==!0)return{...e,captureStackTrace:!1};Dn(3);let n=new Error;return Dn(t),{...e,captureStackTrace:uz(()=>n.stack)}},fy=e=>t=>{let n;return()=>{if(n!==void 0)return n;let r=t();if(!r)return;let o=r.split(`
`);if(o[e]!==void 0)return n=o[e].trim(),n}},uz=fy(3);var Np=class extends Ni{constructor(t,n=ol){super("Interrupt",n,"Interrupted"),this.fiberId=t}toString(){return`Interrupt(${this.fiberId})`}toJSON(){return{_tag:"Interrupt",fiberId:this.fiberId}}[se](t){return ul(t)&&this.fiberId===t.fiberId&&this.annotations===t.annotations}[oe](){return ce(Ie(`${this._tag}:${this.fiberId}`))(Vd(this.annotations))}},UC=e=>new Np(e),rc=e=>new Jr([new Np(e)]);var $C=e=>{let t=e.reasons.find(Is);return t?$(t):K(e)},qo=e=>{for(let t=0;t<e.reasons.length;t++){let n=e.reasons[t];if(n._tag==="Fail")return $(n.error)}return K(e)};var LC=e=>e.reasons.some(cl);var Ty=e=>{let t=e.reasons.find(cl);return t?$(t.defect):K(e)},BC=e=>e.reasons.some(ul);var jC=e=>{let t;for(let n=0;n<e.reasons.length;n++){let r=e.reasons[n];r._tag==="Interrupt"&&(t??=new Set,r.fiberId!==void 0&&t.add(r.fiberId))}return t?$(t):K(e)};var zC=e=>e.reasons.length>0&&e.reasons.every(ul);var lz=(e,t)=>{let n=new Map,r=[];for(let o of e.concat(t)){let s=G(o),a=n.get(s);if(a===void 0)n.set(s,[o]);else{if(a.some(i=>Q(i,o)))continue;a.push(o)}r.push(o)}return r},kl=h(2,(e,t)=>{if(e.reasons.length===0)return t;if(t.reasons.length===0)return e;let n=new Jr(lz(e.reasons,t.reasons));return Q(e,n)?e:n}),qC=h(2,(e,t)=>{let n=!1,r=e.reasons.map(o=>Is(o)?(n=!0,new ga(t(o.error),o.annotations)):o);return n?ks(r):e}),zp=e=>{let t;for(let n of e.reasons){if(n._tag==="Fail")return n.error;n._tag==="Die"&&(t??=n)}return t!==void 0?t.defect:e.reasons.length>0?new globalThis.Error("All fibers interrupted without error"):new globalThis.Error("Empty cause")},WC=(e,t)=>{let n=[],r=[];if(e.reasons.length===0)return n;let o=Kr();o!==0&&Dn(1);try{for(let s of e.reasons){if(s._tag==="Interrupt"){r.push(s);continue}n.push(py(s._tag==="Die"?s.defect:s.error,s.annotations,t))}if(n.length===0){let s=new Error("The fiber was interrupted by:");s.name="InterruptCause",s.stack=mz(s,r);let a=new globalThis.Error("All fibers interrupted without error",{cause:s});a.name="InterruptError",a.stack=`${a.name}: ${a.message}`,n.push(py(a,r[0].annotations,t))}}finally{o!==0&&Dn(o)}return n},py=(e,t,n)=>{let r=typeof e,o;if(e&&r==="object"){if(o=new globalThis.Error(fz(e),{cause:e.cause?py(e.cause):void 0}),typeof e.name=="string"&&(o.name=e.name),typeof e.stack=="string")o.stack=pz(e.stack,o,t);else{let s=`${o.name}: ${o.message}`;o.stack=t?HC(s,t):s}n?.includeCauseInStack&&(o.stack=GC(o));for(let s of Object.keys(e))s in o||(o[s]=e[s])}else o=new globalThis.Error(e?r==="string"?e:pa(e):`Unknown error: ${e}`);return o},fz=e=>{if(typeof e.message=="string")return e.message;if(typeof e.toString=="function"&&e.toString!==Object.prototype.toString&&e.toString!==Array.prototype.toString)try{return e.toString()}catch{}return pa(e)},dz=/\((.*)\)/g,pz=(e,t,n)=>{let r=`${t.name}: ${t.message}`,o=(e.startsWith(r)?e.slice(r.length):e).split(`
`),s=[r];for(let a=1;a<o.length&&!/Generator\.next|~effect\/(?:Effect|Utils)/.test(o[a]);a++)s.push(o[a]);return n?HC(s.join(`
`),n):s.join(`
`)},HC=(e,t)=>{let n=t?.get(Xd.key);return n&&(e=`${e}
${VC(n)}`),e},mz=(e,t)=>{let n=[`${e.name}: ${e.message}`];for(let r of t){let o=r.fiberId!==void 0?`#${r.fiberId}`:"unknown",s=r.annotations.get(Fx.key);n.push(`    at fiber (${o})`),s&&n.push(VC(s))}return n.join(`
`)},VC=e=>{let t=[],n=e,r=0;for(;n&&r<10;){let o=n.stack();if(o){let s=o.matchAll(dz),a=!1;for(let[,i]of s)a=!0,t.push(`    at ${n.name} (${i})`);a||t.push(`    at ${n.name} (${o.replace(/^at /,"")})`)}else t.push(`    at ${n.name}`);n=n.parent,r++}return t.join(`
`)},qp=e=>WC(e).map(GC).join(`
`),GC=e=>e.cause?`${e.stack} {
${KC(e.cause,"  ")}
}`:e.stack,KC=(e,t)=>{let n=e.stack.split(`
`),r=`${t}[cause]: ${n[0]}`;for(let o=1,s=n.length;o<s;o++)r+=`
${t}${n[o]}`;return e.cause&&(r+=` {
${KC(e.cause,`${t}  `)}
${t}}`),r},Ay="~effect/Fiber",hz={_A:F,_E:F},gz={id:0},Fs=()=>globalThis[Mi],Dp=class{constructor(t,n=!0){this.setContext(t),this.id=++gz.id,this.currentOpCount=0,this.interruptible=n,this._stack=[],this._observers=void 0,this._exit=void 0,this._children=void 0,this._interruptedCause=void 0,this._yielded=void 0,this._running=!1,this._deferredInterrupt=!1,this._parent=void 0,this.cache.runtimeMetrics?.recordFiberStart(this.context)}get[Ay](){return hz}get currentDispatcher(){return this._dispatcher??=this.cache.scheduler.makeDispatcher()}getRef(t){return rt(this.context,t)}addObserver(t){return this._exit?(t(this._exit),No):(this._observers===void 0?this._observers=[t]:this._observers.push(t),()=>this.removeObserver(t))}removeObserver(t){if(this._exit||this._observers===void 0)return;let n=this._observers.indexOf(t);n>=0&&this._observers.splice(n,1)}interruptUnsafe(t,n){if(this._exit)return;let r=rc(t);this.cache.stackFrame&&(r=il(r,Lo(Xd,this.cache.stackFrame))),n&&(r=il(r,n)),this._interruptedCause=this._interruptedCause?kl(this._interruptedCause,r):r,this.interruptible&&(this._running?this._deferredInterrupt=!0:this.evaluate(Re(this._interruptedCause)))}pollUnsafe(){return this._exit}evaluate(t){if(this._exit)return;if(this._yielded!==void 0){let o=this._yielded;this._yielded=void 0,o()}let n=this.runLoop(t);if(n===xa)return;let r=my.interruptChildren&&my.interruptChildren(this);if(r!==void 0)return this.evaluate(V(r,()=>n));if(this._exit=n,this.cache.runtimeMetrics?.recordFiberEnd(this.context,this._exit),this._parent&&(this._parent._children?.delete(this),this._parent=void 0),this._observers!==void 0){let o=this._observers;this._observers=void 0;for(let s=0;s<o.length;s++)o[s](n)}this._stack.length=0,this._children=void 0,this.context=sn()}runLoop(t){let n=globalThis[Mi];globalThis[Mi]=this;let r=this._running;this._running=!0;let o=!1,s=t;this.currentOpCount=0;try{for(;;){this._deferredInterrupt&&(this._deferredInterrupt=!1,s=Re(this._interruptedCause)),this.currentOpCount++;let a=this.cache;if(!o&&!a.preventYield&&a.scheduler.shouldYield(this)){o=!0;let i=s;s=V(sc,()=>i)}if(s=a.tracerContext?a.tracerContext(s,this):s[nt](this),s===xa){let i=this._yielded;if(ma in i)return this._deferredInterrupt=!1,this._yielded=void 0,i;if(this._deferredInterrupt){this._yielded=void 0,i();continue}return xa}}}catch(a){return _(s,nt)?this.runLoop(Ln(a)):Ln(`Fiber.runLoop: Not a valid effect: ${String(s)}`)}finally{this._running=r,globalThis[Mi]=n}}getCont(t){if(this._deferredInterrupt)return this._deferredInterrupt=!1,yz;for(;;){let n=this._stack.pop();if(!n)return;let r=n[ha];if(r!==void 0){let o=r.call(n,this);if(o)return o[t]=o,o}if(n[t])return n}}succeedWith(t){if((++this.currentOpCount&bz-1)===0)return Oe(t);let n=this.getCont(Tt);return n?n[Tt](t,this):this.yieldWith(Oe(t))}yieldWith(t){return this._yielded=t,xa}children(){return this._children??=new Set}pipe(){return re(this,arguments)}setContext(t){let n=this.context;if(this.context=t,n!==void 0&&QI(n,t))return;let r=t.cacheRoot,o=r._fiberCache??=xz(t);this.cache?.scheduler!==o.scheduler&&(this._dispatcher=void 0),this.cache=o}get currentSpanLocal(){let t=this.cache.span;return t?._tag==="Span"?t:void 0}},xz=e=>{let t=gl(e,iy);return{scheduler:rt(e,xl),tracer:t,tracerContext:t?t.context:void 0,tracerEnabled:rt(e,Pp),span:gl(e,ay),logLevel:rt(e,ly),minimumLogLevel:rt(e,Fp),stackFrame:rt(e,bl),runtimeMetrics:gl(e,OC),maxOpsBeforeYield:rt(e,gC),preventYield:rt(e,xC)}},yz={[Tt](e,t){return Re(t._interruptedCause)},[Un](e,t){return Re(t._interruptedCause)}},bz=32,my={interruptChildren:void 0},Wp=e=>{if(!e.cache.stackFrame)return;let t=new Map;return t.set(Fx.key,e.cache.stackFrame),Ki(t)},Sz=e=>{if(!(e._children===void 0||e._children.size===0))return ec(e._children)},JC=e=>{let t=e;return t._exit?U(t._exit):Mt(n=>t._exit?n(U(t._exit)):W(e.addObserver(r=>n(U(r)))))},Hp=e=>Mt(t=>{let n=e[Symbol.iterator](),r=[],o;function s(){let a=n.next();for(;!a.done;){if(a.value._exit){r.push(a.value._exit),a=n.next();continue}o=a.value.addObserver(i=>{r.push(i),s()});return}t(U(r))}return s(),W(()=>o?.())});var Vp=e=>te(t=>ZC(e,t.id)),ZC=h(e=>_(e[0],Ay),(e,t,n)=>te(r=>{let o=Wp(r);return o=o&&n?Ia(o,n):o??n,e.interruptUnsafe(t,o),Il(JC(e))})),ec=e=>te(t=>{let n=Wp(t),r=wa();for(let o of e)o.interruptUnsafe(t.id,n),r.push(o);return Il(Hp(r))});var U=Oe,Re=Zt,Ve=nr,W=Yr({op:"Sync",[nt](e){let t=this[fe](),n=e.getCont(Tt);return n?n[Tt](t,e):e.yieldWith(Oe(t))}}),ee=Yr({op:"Suspend",[nt](e){return this[fe]()}}),Oy=h(e=>e.length>=2||dp(e[0]),(e,t)=>He(e)?Ve(t?t():new Zr("Effect.fromOption: Option.none")):U(e.value)),oc=on({onFailure:Ve,onSuccess:U}),QC=e=>e==null?Ve(new Zr):U(e),_y=Yr({op:"Yield",[nt](e){let t=!1;return e.currentDispatcher.scheduleTask(()=>{t||e.evaluate(an)},this[fe]??0),e.yieldWith(()=>{t=!0})}}),sc=_y(0),Py=e=>U(R(e)),Fa=U(A()),YC=e=>He(e)?Fa:Me(e.value,R),XC=e=>ee(()=>Re(e())),Rs=e=>Ln(e),Gp=e=>ee(()=>Ve(e())),ue=U(void 0);var eT=e=>{let t=typeof e=="function"?e:e.try,n=typeof e=="function"?r=>new nc(r,"An error occurred in Effect.try"):e.catch;return ee(()=>{try{return U(t())}catch(r){return Ve(n(r))}})};var Fy=e=>Ry(function(t,n){e(n).then(r=>t(U(r)),r=>t(Rs(r)))},e.length!==0),tT=e=>{let t=typeof e=="function"?e:e.try,n=typeof e=="function"?r=>new nc(r,"An error occurred in Effect.tryPromise"):e.catch;return Ry(function(r,o){let s=a=>{try{r(Ve(ws(()=>n(a))))}catch(i){r(Rs(i))}};try{t(o).then(a=>r(U(a)),s)}catch(a){s(a)}},t.length!==0)},nT=e=>te(t=>e(t.id)),rT=te(U),oT=nT(U),Ry=(function(){let e=$n({op:"Async",[nt](n){let r=!1,o=!1,s=this.withSignal?new AbortController:void 0,a=this.register.call(n.cache.scheduler,i=>{r||(r=!0,o?n.evaluate(i):o=i)},s?.signal);return o!==!1?o:(o=!0,n._yielded=()=>{r=!0},s===void 0&&a===void 0?xa:(n._stack.push(Ez(()=>(r=!0,s?.abort(),a??an))),xa))}}),t=function(n,r){this.register=n,this.withSignal=r};return t.prototype=e,function(n,r){return new t(n,r)}})(),Ez=Yr({op:"AsyncFinalizer",[ha](e){e.interruptible&&(e.interruptible=!1,e._stack.push(Rl))},[Un](e,t){return BC(e)?V(rA(Zt(e),this[fe]()),()=>Re(e)):Re(e)}}),Mt=e=>Ry(e,e.length>=2),Kp=Mt(No),sT=(...e)=>{if(e.length===1){let r=e[0];return ee(()=>Pa(r()))}let[t,n]=e;return ee(()=>Pa(n.call(t.self)))},My=(e,...t)=>{let n=t.length===0?function(){return ee(()=>Pa(e.apply(this,arguments)))}:function(){let r=ee(()=>Pa(e.apply(this,arguments)));for(let o=0;o<t.length;o++)r=t[o](r,...arguments);return r};return Ny(e.length,n)},Ny=(e,t)=>Object.defineProperty(t,"length",{value:e,configurable:!0}),PC=fy(2),aT=function(){let e=typeof arguments[0]=="string",t=e?arguments[0]:"Effect.fn",n=e?arguments[1]:void 0,r=Kr(),o;return r!==0&&(Dn(2),o=new globalThis.Error,Dn(r)),e?(s,...a)=>FC(t,s,o,a,e,n):FC(t,arguments[0],o,Array.prototype.slice.call(arguments,1),e,n)},FC=(e,t,n,r,o,s)=>{let a=typeof t=="function"?t:r.shift().bind(t.self),i=`${e} (definition)`,c=n?PC(()=>n.stack):Rn;return Ny(a.length,function(...u){let l=ee(()=>{let m=a.apply(this,arguments);return ae(m)?m:Pa(m)});for(let m=0;m<r.length;m++)l=r[m](l,...u);if(!ae(l))return l;let f=Kr(),d;return f!==0&&(Dn(2),d=new globalThis.Error,Dn(f)),Ho(o?wl(e,s,m=>by(l,m)):l,bl,m=>({name:e,stack:d?PC(()=>d.stack):Rn,parent:{name:i,stack:c,parent:m}}))})},iT=(e,...t)=>Ny(e.length,t.length===0?function(){return RC(()=>e.apply(this,arguments))}:function(){let n=RC(()=>e.apply(this,arguments));for(let r of t)n=r(n,...arguments);return n}),RC=e=>{try{let t=e(),n;for(;;){let r=t.next(n);if(r.done)return U(r.value);let o=r.value;if(o&&o._tag==="Success"){n=o.value;continue}else{if(o&&o._tag==="Failure")return r.value;{let s=!0;return ee(()=>s?(s=!1,V(r.value,a=>Pa(t,a))):ee(()=>Pa(e())))}}}}catch(t){return Rs(t)}},Pa=(function(){let e=$n({op:"Iterator",[Tt](n,r){let o=this.iterator;for(;;){let s=o.next(n);if(s.done)return U(s.value);if(Ne(s.value)){if(s.value._tag==="Failure")return s.value}else return r._stack.push(this),s.value;n=s.value.value}},[nt](n){return this[Tt](this.initial,n)}}),t=function(n,r){this.iterator=n,this.initial=r};return t.prototype=e,function(n,r){return new t(n,r)}})(),hn=h(2,(e,t)=>new Wo(e,Dy,U(t))),Jp=function(e){return e._stack.push(this),this[fe]},vz=$n({op:"OnSuccess",[nt]:Jp}),Wo=function(e,t,n){this[fe]=e,this[Tt]=t,this.payload=n};Wo.prototype=vz;var Dy=function(){return this.payload},cT=function(e,t){return t.succeedWith(this.payload)},Zp=(()=>{let e="~effect/Effect/stackProbe";return{[e]:function(){return new Error().stack}}[e]()?.includes("[as "+e+"]")===!0})(),wz=function(e,t){let n=this.payload;return t.succeedWith(Zp?n(e):ws(()=>n(e)))},uT=function(e){let t=this.payload;return t(e)},kz=function(e){let t=this.payload;return new Wo(t(e),cT,e)},Iz=function(e){return new Wo(this.payload,cT,e)},ac=e=>Me(e,R),lT=e=>uc(e,{onFailure:U,onSuccess:Ve}),so=h(2,(e,t)=>new Wo(e,ae(t)?Dy:uT,t)),Ra=h(2,(e,t)=>new Wo(e,ae(t)?Iz:kz,t)),Il=e=>new Wo(e,Dy,an),fT=e=>jn(e,Ve),Uy=(e,t)=>te(n=>{let r=new Set;return Na(n,()=>r.size===0?void 0:ec(r)),Mt(o=>{let s=Yt(e),a=s.length,i=0,c=!1,u=[],l=(f,d,m)=>{if(i++,f._tag==="Failure"){u.push(...f.cause.reasons),i>=a&&o(Re(ks(u)));return}let g=!c;c=!0,o(f),g&&t?.onWinner&&t.onWinner({fiber:d,index:m,parentFiber:n})};for(let f=0;f<a;f++){let d=Ua(n,s[f],!0,!0,!1);if(r.add(d),d.addObserver(m=>{r.delete(d),l(m,d,f)}),c)break}})}),$y=(e,t)=>te(n=>{let r=new Set;return Na(n,()=>r.size===0?void 0:ec(r)),Mt(o=>{let s=!1,a=0;for(let i of e){if(s)break;let c=a++,u=Ua(n,i,!0,!0,!1);r.add(u),u.addObserver(l=>{r.delete(u);let f=!s;s=!0,o(l),f&&t?.onWinner&&t.onWinner({fiber:u,index:c,parentFiber:n})})}})}),dT=h(e=>ae(e[1]),(e,t,n)=>Uy([e,t],n)),Ly=h(e=>ae(e[1]),(e,t,n)=>$y([e,t],n)),V=h(2,(e,t)=>new Wo(e,uT,t)),pT=h(2,(e,t)=>Ne(e)?e._tag==="Success"?t.onSuccess(e.value):t.onFailure(e.cause):oo(e,t)),Ne=e=>e[ma]!==void 0,mT=h(2,(e,t)=>Ne(e)?e._tag==="Success"?t(e.value):e:V(e,t)),hT=e=>V(e,F),Me=h(2,(e,t)=>new Wo(e,wz,t)),gT=h(2,(e,t)=>Ne(e)?ET(e,t):Me(e,t)),xT=h(2,(e,t)=>Ne(e)?vT(e,t):Gy(e,t)),yT=h(2,(e,t)=>Ne(e)?wT(e,t):Ky(e,t)),bT=h(2,(e,t)=>{if(Ne(e)){if(e._tag==="Success")return e;let n=qo(e.cause);return he(n)?e:t(n.success)}return zn(e,t)}),Cl=e=>Zt(rc(e)),Tl=e=>e._tag==="Success";var By=e=>e._tag==="Failure";var ST=e=>e._tag==="Failure"?$(e.cause):K(e);var an=Oe(void 0),ET=h(2,(e,t)=>e._tag==="Success"?Oe(t(e.value)):e),vT=h(2,(e,t)=>{if(e._tag==="Success")return e;let n=qo(e.cause);return he(n)?e:nr(t(n.success))}),wT=h(2,(e,t)=>{if(e._tag==="Success")return Oe(t.onSuccess(e.value));let n=qo(e.cause);return he(n)?e:nr(t.onFailure(n.success))});var kT=h(2,(e,t)=>Tl(e)?t:e);var IT=e=>{let t=[];for(let n of e)n._tag==="Failure"&&t.push(...n.cause.reasons);return t.length===0?an:Zt(ks(t))};var CT=e=>e,TT=e=>te(t=>U(wp(t.context,e))),Cz=e=>te(t=>Oy(wp(t.context,e))),ic=h(2,(e,t)=>te(n=>{let r=n.context,o=t(r);return r===o||(n.setContext(o),Na(n,()=>{n.setContext(r)})),e})),Ho=h(3,(e,t,n)=>ic(e,r=>{let o=no(r,t),s=n(o);return o===s?r:Xt(r,t,s)})),AT=(e,t,n)=>Da(te(r=>{let o=no(r.context,e),s=t(o);return r.setContext(Xt(r.context,e,s)),Ds(no(r.context,Ns),a=>{let i=wp(r.context,e);if(He(i))return ue;let c=i.value,u;if(n?.reset===void 0){if(c!==s)return ue;u=o}else u=n.reset(o,s,c);return r.setContext(Xt(r.context,e,u)),ue})})),jy=()=>Tz,Tz=te(e=>U(e.context)),Ms=e=>te(t=>e(t.context)),OT=h(2,(e,t)=>ic(e,it(t))),gr=h(2,(e,t)=>Ne(e)?e:ic(e,Ia(t))),gn=function(){return arguments.length===1?h(2,(e,t)=>MC(e,arguments[0],t)):h(3,(e,t,n)=>MC(e,t,n)).apply(this,arguments)},MC=(e,t,n)=>ic(e,Xt(t,n)),Qp=h(3,(e,t,n)=>V(n,r=>gn(e,t,r))),_T=h(e=>ae(e[1]),(e,t,n)=>zy(e,t,(r,o)=>[r,o],n)),zy=h(e=>ae(e[1]),(e,t,n,r)=>r?.concurrent?Me(Ml([e,t],{concurrency:2}),([o,s])=>n(o,s)):V(e,o=>Me(t,s=>n(o,s)))),PT=h(e=>ae(e[0]),(e,t,n)=>lb(e,t,n?r=>Ve(n(r)):()=>Ve(new Zr))),FT=h(2,(e,t)=>V(t,n=>n?ac(e):Fa)),qy=h(2,(e,t)=>Array.from({length:t},()=>e)),RT=h(e=>ae(e[0]),(e,t,n)=>Ml(qy(e,t),n)),Yp=h(e=>ae(e[0]),(e,t)=>io({while:Fn,body:it(t?.disableYield?e:V(e,n=>sc)),step:No})),jn=h(2,(e,t)=>new MT(e,t.length!==1?n=>t(n):t)),Az=$n({op:"OnFailure",[nt]:Jp}),MT=function(e,t){this[fe]=e,this[Un]=t};MT.prototype=Az;var Wy=h(3,(e,t,n)=>jn(e,r=>t(r)?n(r):Re(r))),cc=h(3,(e,t,n)=>jn(e,r=>{let o=t(r);return he(o)?Re(o.failure):n(o.success,r)})),zn=h(2,(e,t)=>cc(e,qo,n=>t(n))),NT=e=>uc(e,{onFailure:t=>Rx(t)?Fa:Ve(t),onSuccess:Py}),DT=h(2,(e,t)=>cc(e,Ty,t)),UT=h(2,(e,t)=>jn(e,n=>so(t(n),Re(n)))),$T=h(3,(e,t,n)=>Wy(e,t,r=>so(n(r),Re(r)))),Xp=h(3,(e,t,n)=>jn(e,r=>{let o=t(r);return he(o)?Re(r):so(n(o.success,r),Re(r))})),Hy=h(2,(e,t)=>Xp(e,qo,n=>t(n))),LT=h(3,(e,t,n)=>{let r=Array.isArray(t)?o=>_(o,"_tag")&&t.includes(o._tag):Nn(t);return Hy(e,o=>r(o)?n(o):ue)}),BT=h(2,(e,t)=>Xp(e,Ty,n=>t(n))),Al=h(e=>ae(e[0]),(e,t,n,r)=>jn(e,o=>{let s=qo(o);return he(s)?Re(s.failure):t(s.success)?n(s.success):r?r(s.success):Re(o)})),em=h(e=>ae(e[0]),(e,t,n,r)=>jn(e,o=>{let s=qo(o);if(he(s))return Re(s.failure);let a=t(s.success);return he(a)?r?r(a.failure):Re(o):n(a.success)})),Vy=h(e=>ae(e[0]),(e,t,n,r)=>{let o=Array.isArray(t)?s=>_(s,"_tag")&&t.includes(s._tag):Nn(t);return Al(e,o,n,r)}),jT=h(e=>ae(e[0]),(e,t,n)=>{let r;return em(e,o=>(r??=Object.keys(t),_(o,"_tag")&&pr(o._tag)&&r.includes(o._tag)?$(o):K(o)),o=>t[o._tag](o),n)}),zT=h(e=>ae(e[0]),(e,t,n,r,o)=>Al(e,s=>Nn(s,t)&&_(s,"reason")&&(o!==void 0||Nn(s.reason,n)),s=>{let a=s.reason;return Nn(a,n)?r(a,s):o?o(a,s):Ve(s)})),qT=h(e=>ae(e[0]),(e,t,n,r)=>{let o;return Al(e,s=>Nn(s,t)&&_(s,"reason")&&_(s.reason,"_tag")&&pr(s.reason._tag)&&(r!==void 0||(o??=Object.keys(n)).includes(s.reason._tag)),s=>{let a=s.reason;return o??=Object.keys(n),o.includes(a._tag)?n[a._tag](a,s):r?r(a,s):Ve(s)})}),WT=h(2,(e,t)=>em(e,n=>Nn(n,t)&&_(n,"reason")?$(n.reason):K(n),Ve)),Gy=h(2,(e,t)=>zn(e,n=>Gp(()=>t(n)))),Ky=h(2,(e,t)=>uc(e,{onFailure:n=>Gp(()=>t.onFailure(n)),onSuccess:n=>W(()=>t.onSuccess(n))})),Jy=e=>zn(e,Rs),HT=h(2,(e,t)=>zn(e,n=>W(()=>t(n)))),VT=e=>ee(()=>{let t=e[Symbol.iterator](),n=t.next();if(n.done)return Rs(new Error("Received an empty collection of effects"));function r(o){let s=t.next();return s.done?o.value:zn(o.value,a=>r(s))}return r(n)}),Zy=e=>zn(e,t=>V(sc,()=>Zy(e))),GT=h(e=>ae(e[0]),(e,t)=>{if(!t?.log)return uc(e,{onFailure:r=>ue,onSuccess:r=>ue});let n=yr(t.log===!0?void 0:t.log);return oo(e,{onFailure(r){let o=$C(r);return he(o)?Re(o.failure):t.message===void 0?n(r):n(t.message,r)},onSuccess:r=>ue})}),tm=h(e=>ae(e[0]),(e,t)=>{if(!t?.log)return oo(e,{onFailure:r=>ue,onSuccess:r=>ue});let n=yr(t.log===!0?void 0:t.log);return oo(e,{onFailure:r=>t.message===void 0?n(r):n(t.message,r),onSuccess:r=>ue})}),KT=e=>nm(e,{onFailure:A,onSuccess:R}),Ps=e=>Ol(e,{onFailure:K,onSuccess:$}),oo=h(2,(e,t)=>new JT(e,t.onSuccess.length!==1?n=>t.onSuccess(n):t.onSuccess,t.onFailure.length!==1?n=>t.onFailure(n):t.onFailure)),Oz=$n({op:"OnSuccessAndFailure",[nt]:Jp}),JT=function(e,t,n){this[fe]=e,this[Tt]=t,this[Un]=n};JT.prototype=Oz;var _z=function(e,t){let n=this.payload;return t.succeedWith(Zp?n.onSuccess(e):ws(()=>n.onSuccess(e)))},ZT=(e,t)=>{let n=$n({op:e,[nt]:Jp,[Tt]:_z,[Un]:t}),r=function(o,s){this[fe]=o,this.payload=s};return r.prototype=n,r},Pz=ZT("Match",function(e,t){let n=e.reasons.find(Is);if(n===void 0)return Re(e);let r=this.payload;return t.succeedWith(Zp?r.onFailure(n.error):ws(()=>r.onFailure(n.error)))}),Fz=ZT("MatchCause",function(e,t){let n=this.payload;return t.succeedWith(Zp?n.onFailure(e):ws(()=>n.onFailure(e)))}),Qy=h(2,(e,t)=>new Fz(e,t)),uc=h(2,(e,t)=>oo(e,{onFailure:n=>{let r=n.reasons.find(Is);return r?t.onFailure(r.error):Re(n)},onSuccess:t.onSuccess})),nm=h(2,(e,t)=>new Pz(e,t)),Ol=h(2,(e,t)=>{if(Ne(e)){if(e._tag==="Success")return Oe(t.onSuccess(e.value));let n=qo(e.cause);return he(n)?e:Oe(t.onFailure(n.success))}return nm(e,t)}),QT=h(2,(e,t)=>Ne(e)?e._tag==="Success"?Oe(t.onSuccess(e.value)):Oe(t.onFailure(e.cause)):Qy(e,t)),_l=e=>Ne(e)?Oe(e):Rz(e),Rz=Yr({op:"Exit",[nt](e){return e._stack.push(this),this[fe]},[Tt](e,t,n){return t.succeedWith(n??Oe(e))},[Un](e,t,n){return t.succeedWith(n??Zt(e))}}),YT=Ol({onFailure:()=>!0,onSuccess:()=>!1}),XT=Ol({onFailure:()=>!1,onSuccess:()=>!0}),eA=h(2,(e,t)=>so(fc(t),e)),Yy=h(2,(e,t)=>V(Xy(e,t.duration),n=>He(n)?t.orElse():U(n.value))),Mz=e=>new Lp(`Operation timed out after '${Xx(e)}'`),tA=h(2,(e,t)=>{let n=Rt(t);return Yy(e,{duration:n,orElse:()=>Ve(Mz(n))})}),Xy=h(2,(e,t)=>Ly(ac(e),hn(fc(t),A()))),nA=e=>co(t=>{let n=t.monotonicTimeNanosUnsafe();return Me(e,r=>[ro(t.monotonicTimeNanosUnsafe()-n),r])}),hy="~effect/Scope",gy="~effect/Scope/Closeable",Ns=Je("effect/Scope"),eb=(e,t)=>te(n=>{let r=rm(e,t);return r===void 0?ue:(Uz(n),r)}),rm=(e,t)=>{let n=e.state;if(n._tag==="Closed"||(e.state={_tag:"Closed",exit:t},e.parent!==void 0&&tb(e.parent,e),n._tag==="Empty"))return;if(n.finalizer!==void 0)return Up(n.finalizer,t);let r=n.finalizers;return r.size===1?Up(r.values().next().value,t):Nz(e,r,t)},Up=(e,t)=>{try{return e(t)}catch(n){return Ln(n)}},rA=(e,t)=>Tl(e)?t:jn(t,n=>Re(kl(e.cause,n))),Nz=My(function*(e,t,n){let r=[],o=[],s=Array.from(t.values()),a=Fs();for(let i=s.length-1;i>=0;i--){let c=s[i];e.strategy==="sequential"?r.push(yield*_l(Up(c,n))):o.push(Ua(a,Up(c,n),!0,!0,"inherit"))}return o.length>0&&(r=yield*Hp(o)),yield*IT(r)});var oA=(e,t)=>{let n=aA(t,e);return e.state._tag==="Closed"?(n.state=e.state,n):(lc(e,n,r=>eb(n,r)),n)},Ds=(e,t)=>ee(()=>e.state._tag==="Closed"?t(e.state.exit):(lc(e,{},t),ue)),sA=(e,t)=>Ds(e,it(t)),lc=(e,t,n)=>{if(e.state._tag==="Empty")e.state={_tag:"Open",finalizerKey:t,finalizer:n,finalizers:void 0};else if(e.state._tag==="Open"){let r=e.state;r.finalizer!==void 0&&(r.finalizers=new Map([[r.finalizerKey,r.finalizer]]),r.finalizerKey=void 0,r.finalizer=void 0),r.finalizers.set(t,n)}},tb=(e,t)=>{if(e.state._tag!=="Open")return;let n=e.state;n.finalizerKey===t?e.state=xy:n.finalizers!==void 0&&(n.finalizers.delete(t),n.finalizers.size===0&&(e.state=xy))},om=e=>aA(e,void 0),aA=(e="sequential",t)=>({[gy]:gy,[hy]:hy,strategy:e,parent:t,state:xy}),xy={_tag:"Empty"};var Pl=Ns,iA=gn(Ns),nb=e=>te(t=>{let n=t.context,r=om();return t.setContext(Xt(t.context,Ns,r)),Na(t,o=>(t.setContext(n),rm(r,o))),e});var sm=e=>ee(()=>{let t=om();return qn(e(t),n=>ee(()=>rm(t,n)??ue))}),Ma=(e,t,n)=>Ms(r=>xr(o=>V(Pl,s=>Ra(n?.interruptible?o(e):e,a=>Ds(s,i=>gr(t(a,i),r)))))),rb=e=>V(Pl,t=>Ms(n=>Ds(t,r=>gr(e(r),n)))),cA=(function(){let e=$n({op:"OnExit",[nt](n){return n._stack.push(this),this.effect},[ha](n){n.interruptible&&this.interruptible!==!0&&(n._stack.push(Rl),n.interruptible=!1)},[Tt](n,r,o){o??=Oe(n);let s;try{s=this.onExit(o)}catch(a){s=Ln(a)}return s?V(s,a=>o):o},[Un](n,r,o){o??=Zt(n);let s;try{s=this.onExit(o)}catch(a){s=Ln(a)}return s?V(rA(o,s),a=>o):o}}),t=function(n,r,o){this.effect=n,this.onExit=r,this.interruptible=o};return t.prototype=e,t})(),ao=(e,t,n)=>new cA(e,t,n),Na=(e,t)=>{e._stack.push(new cA(void 0,t,void 0))},qn=h(2,ao),uA=h(2,(e,t)=>qn(e,n=>t)),ob=h(3,(e,t,n)=>qn(e,r=>t(r)?n(r):ue)),sb=h(3,(e,t,n)=>qn(e,r=>{let o=t(r);return he(o)?ue:n(o.success,r)})),ab=h(2,(e,t)=>sb(e,ST,t)),lA=h(3,(e,t,n)=>ob(e,r=>r._tag!=="Failure"?!1:t(r.cause),r=>n(r.cause))),ib=h(3,(e,t,n)=>qn(e,r=>{if(r._tag!=="Failure")return ue;let o=t(r.cause);return he(o)?ue:n(o.success,r.cause)})),fA=h(2,(e,t)=>ib(jC,t)(e)),Fl=(e,t,n)=>xr(r=>V(e,o=>ao(ee(()=>r(t(o))),s=>n(o,s),!0))),dA=e=>Ma(e,t=>_(t,Symbol.asyncDispose)?Fy(()=>t[Symbol.asyncDispose]()):W(()=>t[Symbol.dispose]())),cb=h(2,(e,t)=>W(()=>{let n=typeof t=="function"?c=>Bo(Rt(t(c))):it(Bo(Rt(t))),r=fm(!1),o=0,s=!1,a,i=V(r.await,()=>a);return[te(c=>{let u=c.getRef(Go),l=o===1/0?0:u.currentTimeMillisUnsafe();return s||l<o?a??i:(s=!0,r.closeUnsafe(),a=void 0,Na(c,f=>W(()=>{try{let d=n(f);o=u.currentTimeMillisUnsafe()+d,a=f}catch(d){let m=al(d);throw a=Zt(By(f)?kl(f.cause,m):m),d}finally{s=!1,r.openUnsafe()}})),e)}),W(()=>{o=0,r.closeUnsafe(),a=void 0})]})),pA=h(2,(e,t)=>Me(cb(e,t),n=>n[0])),mA=e=>W(()=>{let t=fm(!1),n=!1,r,o=V(t.await,()=>r);return te(s=>r!==void 0?r:n?o:(n=!0,Na(s,a=>W(()=>{r=a,t.openUnsafe()})),e))}),hA=te(e=>Re(rc(e.id))),Da=e=>te(t=>(t.interruptible&&(t.interruptible=!1,t._stack.push(Rl)),e)),gA=Yr({op:"SetInterruptible",[ha](e){if(e.interruptible=this[fe],e._interruptedCause&&e.interruptible)return()=>Re(e._interruptedCause)}}),Rl=gA(!0),Dz=gA(!1),xA=e=>{if(e.interruptible=!0,e._stack.push(Dz),e._interruptedCause)return Re(e._interruptedCause)},Uz=e=>{let t=e;t.interruptible&&(t.interruptible=!1,t._stack.push(Rl))};var am=e=>te(t=>t.interruptible?e:xA(t)??e),xr=e=>te(t=>t.interruptible?(t.interruptible=!1,t._stack.push(Rl),e(am)):e(F)),yA=e=>te(t=>{if(t.interruptible)return e(F);let n=xA(t),r=e(Da);return n??r}),bA=Me(Ma(W(()=>new AbortController),e=>W(()=>e.abort())),e=>e.signal),Ml=(e,t)=>Hr(e)?t?.mode==="result"?Bn(e,Ps,t):Bn(e,F,t):t?.discard?t.mode==="result"?Bn(Object.values(e),Ps,t):Bn(Object.values(e),F,t):ee(()=>{let n={};return hn(Bn(Object.entries(e),([r,o])=>Me(t?.mode==="result"?Ps(o):o,s=>{N(n,r,s)}),{discard:!0,concurrency:t?.concurrency}),n)}),ub=h(e=>Hr(e[0])&&!ae(e[0]),(e,t,n)=>Me(Bn(e,(r,o)=>Ps(t(r,o)),n),r=>Wx(r,F))),SA=h(3,(e,t,n)=>{let r=Yt(e);return r.length===0?W(t):ee(()=>{let o=0,s=t();return Me(io({while:()=>o<r.length,body:()=>n(s,r[o],o),step(a){s=a,o++}}),()=>s)})}),EA=h(e=>Hr(e[0])&&!ae(e[0]),(e,t,n)=>V(ub(e,t,{concurrency:n?.concurrency}),([r,o])=>va(o)?Ve(o):n?.discard?ue:U(r))),vA=h(e=>Hr(e[0])&&!ae(e[0]),(e,t)=>ee(()=>{let n=e[Symbol.iterator](),r=n.next();return r.done?U(A()):wA(n,0,t,r.value)})),wA=(e,t,n,r)=>V(n(r,t),o=>{if(o)return U(R(r));let s=e.next();return s.done?U(A()):wA(e,t+1,n,s.value)}),kA=h(e=>Hr(e[0])&&!ae(e[0]),(e,t)=>ee(()=>{let n=e[Symbol.iterator](),r=n.next();return r.done?U(A()):IA(n,0,t,r.value)})),IA=(e,t,n,r)=>V(n(r,t),o=>{if(Ft(o))return U(R(o.success));let s=e.next();return s.done?U(A()):IA(e,t+1,n,s.value)}),io=Yr({op:"While",[Tt](e,t){return this[fe].step(e),this[fe].while()?(t._stack.push(this),this[fe].body()):an},[nt](e){return this[fe].while()?(e._stack.push(this),this[fe].body()):an}}),Bn=h(e=>typeof e[1]=="function",(e,t,n)=>ee(()=>{let r=Nl(n?.concurrency);if(r===1)return $z(e,t,n);let o=Yt(e),s=o.length;if(s===0)return n?.discard?ue:U([]);let a=n?.discard?void 0:new Array(s),i=Lz({f:t,out:a},o,{concurrency:r});return i?hn(i,a):U(a)})),CA=e=>V(e,t=>{let n=t[Symbol.iterator]().next();return n.done?Ve(new Zr):U(n.value)}),$z=(e,t,n)=>ee(()=>{let r=n?.discard?void 0:[],o=e[Symbol.iterator](),s=o.next(),a=0;return hn(io({while:()=>!s.done,body:()=>t(s.value,a++),step:i=>{r&&r.push(i),s=o.next()}}),r)}),Nl=e=>e==="unbounded"?Number.POSITIVE_INFINITY:Math.max(1,e??1),im=()=>e=>{let t=e.onItem,n=e.step,r=(s,a,i,c,u)=>V(_l(u),l=>n(s,a[i],l,i)??o(s,a,i+1,c)??ue),o=(s,a,i=0,c=a.length)=>{for(;i<c;i++){let u=a[i],l=t(s,u,i);if(!Ne(l))return r(s,a,i,c,l);let f=n(s,u,l,i);if(f)return f._tag==="Failure"?f:void 0}};return o},TA=e=>{let t=e.onItem,n=e.step;return(r,o,s)=>{let a=0,i=s.end??o.length,c=s.concurrency,u=!1,l,f,d,m,g,x=k=>{let w=Ln(k);return m=w,u=!0,f&&f.size>0?V(Da(ec(Array.from(f))),()=>m??w):w},E=()=>{let k=!1;for(;!m&&a<i;a++){let w=o[a],P=g??t(r,w,a);if(Ne(P)){if(m=n(r,w,P,a),m)break}else if(l){g=void 0;let T=Ua(l,P,!0,!0,"inherit");if(T._exit){if(m=n(r,w,T._exit,a),m)break;continue}f.add(T);let p=a;if(T.addObserver(y=>{f.delete(T);try{if(m){if(y._tag==="Failure"){let S=y.cause.reasons.filter(v=>v._tag!=="Interrupt");if(S.length>0){let v=ks(S);m=Zt(m._tag==="Failure"?kl(m.cause,v):v)}}}else{let S=n(r,w,y,p);S&&(m=S,E())}if(k){let S=E();S&&d(S)}else u&&f.size===0&&d(m??ue)}catch(S){d(x(S))}}),f.size<c)continue;k=!0,a++;return}else return Mt(T=>{l=Fs(),f=new Set,g=P,d=T;let p;try{p=E()}catch(y){return T(x(y))}return p?T(p):ee(()=>(m??=an,V(f?ec(f):ue,()=>m?._tag==="Failure"?m:ue)))})}if(u=!0,m){if(f&&f.size>0){let w=Wp(l);f.forEach(P=>P.interruptUnsafe(l.id,w));return}if(d||m._tag==="Failure")return m}else if(d)if(f)f.size===0&&d(ue);else return an};return E()}},cm=()=>e=>TA(e),Lz=TA({onItem(e,t,n){return e.f(t,n)},step(e,t,n,r){if(n._tag==="Failure")return n;e.out&&(e.out[r]=n.value)}}),lb=h(3,(e,t,n)=>V(e,r=>t(r)?U(r):n(r))),fb=h(3,(e,t,n)=>V(e,r=>{let o=t(r);return he(o)?n(o.failure):U(o.success)})),AA=h(e=>ae(e[0]),(e,t,n)=>fb(e,t,n?r=>Ve(n(r)):()=>Ve(new Zr))),OA=h(e=>Hr(e[0])&&!ae(e[0]),(e,t,n)=>ee(()=>{let r=[];return hn(Bn(e,(o,s)=>{let a=t(o,s);return typeof a=="boolean"?(a&&r.push(o),ue):Me(a,i=>{i&&r.push(o)})},{discard:!0,concurrency:n?.concurrency}),r)})),_A=h(e=>Hr(e[0])&&!ae(e[0]),(e,t)=>ee(()=>{let n=[];for(let r of e){let o=t(r);Ft(o)&&n.push(o.success)}return U(n)})),PA=h(e=>Hr(e[0])&&!ae(e[0]),(e,t,n)=>ee(()=>{let r=[];return hn(Bn(e,o=>Me(t(o),s=>{Ft(s)&&r.push(s.success)}),{discard:!0,concurrency:n?.concurrency}),r)})),FA=U({}),RA=np(Me),MA=rp(Me,V),NA=tp(Me);var DA=h(e=>ae(e[0]),(e,t)=>te(n=>(eq(),U(Ua(n,e,t?.startImmediately,!1,t?.uninterruptible??!1))))),Ua=(e,t,n=!1,r=!1,o=!1)=>{let s=e,a=o==="inherit"?s.interruptible:!o,i=new Dp(s.context,a);return n?i.evaluate(t):s.currentDispatcher.scheduleTask(()=>i.evaluate(t),0),!r&&!i._exit&&(s.children().add(i),i._parent=s),i},UA=h(e=>ae(e[0]),(e,t)=>te(n=>U(Ua(n,e,t?.startImmediately,!0,t?.uninterruptible)))),$A=e=>te(t=>{let n=t._children&&new Set(t._children),r=t.interruptible;return ao(e,o=>{let s=t._children;if(s===void 0||s.size===0)return ue;n&&(s=zI(s,i=>!n.has(i)));let a=Il(Hp(s));return r?am(a):a})}),db=h(e=>ae(e[0]),(e,t,n)=>te(r=>{let o=Ua(r,e,n?.startImmediately,!0,n?.uninterruptible);if(!o._exit)if(t.state._tag!=="Closed"){let s={};lc(t,s,()=>nT(i=>i===o.id?ue:Vp(o))),o.addObserver(()=>tb(t,s))}else o.interruptUnsafe(r.id,Wp(r));return U(o)})),LA=h(e=>ae(e[0]),(e,t)=>V(Pl,n=>db(e,n,t))),Vo=e=>(t,n)=>{let r=new Dp(n?.scheduler?Xt(e,xl,n.scheduler):e,n?.uninterruptible!==!0);if(r.evaluate(t),r._exit)return r;if(n?.signal)if(n.signal.aborted)r.interruptUnsafe();else{let o=()=>r.interruptUnsafe();n.signal.addEventListener("abort",o,{once:!0}),r.addObserver(()=>n.signal.removeEventListener("abort",o))}return n?.onFiberStart&&n.onFiberStart(r),r},BA=h(2,(e,t)=>{if(e._exit)return e;if(t.state._tag==="Closed")return e.interruptUnsafe(e.id),e;let n={};return lc(t,n,()=>Vp(e)),e.addObserver(()=>tb(t,n)),e}),jA=Vo(sn()),pb=e=>{let t=Vo(e);return(n,r)=>{let o=t(n,r);return r?.onExit&&o.addObserver(r.onExit),s=>o.interruptUnsafe(s)}},zA=pb(sn()),um=e=>{let t=Vo(e);return(n,r)=>{let o=t(n,r);return new Promise(s=>{o.addObserver(a=>s(a))})}},qA=um(sn()),mb=e=>{let t=um(e);return(n,r)=>t(n,r).then(o=>{if(o._tag==="Failure")throw zp(o.cause);return o.value})},WA=mb(sn()),lm=e=>{let t=Vo(e);return n=>{if(Ne(n))return n;let r=new Ta("sync"),o=t(n,{scheduler:r});return o._dispatcher?.flush(),o._exit??Ln(new jp(o))}},HA=lm(sn()),hb=e=>{let t=lm(e);return n=>{let r=t(n);if(r._tag==="Failure")throw zp(r.cause);return r.value}},VA=hb(sn()),NC=U(!0),DC=U(!1),yy=class{waiters=[];scheduled=void 0;_isOpen;constructor(t){this._isOpen=t}scheduleUnsafe(t){if(this.waiters.length===0)return NC;if(this.scheduled===void 0)this.scheduled=this.waiters,t.currentDispatcher.scheduleTask(this.flushScheduled,0);else for(let n=0;n<this.waiters.length;n++)this.scheduled.push(this.waiters[n]);return this.waiters=[],NC}flushScheduled=()=>{if(this.scheduled===void 0)return;let t=this.scheduled;this.scheduled=void 0;for(let n=0;n<t.length;n++)t[n](an)};flushWaiters(){let t=this.waiters;this.waiters=[],this.flushScheduled();for(let n=0;n<t.length;n++)t[n](an)}open=te(t=>this._isOpen?DC:(this._isOpen=!0,this.scheduleUnsafe(t)));release=te(t=>this._isOpen?DC:this.scheduleUnsafe(t));openUnsafe(){return this._isOpen?!1:(this._isOpen=!0,this.flushWaiters(),!0)}await=Mt(t=>this._isOpen?t(ue):(this.waiters.push(t),W(()=>{let n=this.waiters.indexOf(t);n!==-1?this.waiters.splice(n,1):this.scheduled!==void 0&&(n=this.scheduled.indexOf(t),n!==-1&&this.scheduled.splice(n,1))})));closeUnsafe(){return this._isOpen?(this._isOpen=!1,!0):!1}close=W(()=>this.closeUnsafe());whenOpen=t=>V(this.await,()=>t);isOpen(){return this._isOpen}},fm=e=>new yy(e??!1);var GA=te(e=>U(e.getRef(cy))),KA=h(2,(e,t)=>gn(e,cy,t)),JA=gn(Pp),ZA=gn(Xi),$p=BigInt(0),Bz={_tag:"Span",spanId:"noop",traceId:"noop",sampled:!1,status:{_tag:"Ended",startTime:$p,endTime:$p,exit:an},attributes:new Map,links:[],kind:"internal",attribute(){},event(){},end(){},addLinks(){}},jz=e=>Object.assign(Object.create(Bz),e),QA=e=>e?rt(e.annotations,_p)?e._tag==="Span"?QA(mn(e.parent)):A():R(e):A(),gb=(e,t,n)=>{let r=!e.cache.tracerEnabled||n?.annotations&&rt(n.annotations,_p),o=n?.parent!==void 0?R(n.parent):n?.root?A():QA(e.cache.span),s;if(r)s=jz({name:t,parent:o,annotations:Xt(n?.annotations??sn(),_p,!0)});else{let a=e.cache.tracer??uy,i=e.getRef(Go),c=e.getRef(Xi),u=e.getRef(Sl),l=e.getRef(El),f=n?.level??e.getRef(CC),d=n?.links!==void 0?[...l,...n.links]:l.length===0?[]:l.slice();s=a.span({name:t,parent:o,annotations:n?.annotations??sn(),links:d,startTime:c?i.currentTimeNanosUnsafe():$p,kind:n?.kind??"internal",root:n?.root??He(o),sampled:n?.sampled??($e(o)&&o.value.sampled===!1?!1:!dO(e.getRef(TC),f))});for(let m in u)s.attribute(m,u[m]);if(n?.attributes!==void 0)for(let m in n.attributes)s.attribute(m,n.attributes[m])}return s},YA=(e,t)=>te(n=>U(gb(n,e,t))),vl=(e,t)=>Da(te(n=>{let r=no(n.context,Ns),o=gb(n,e,t??{}),s=n.getRef(Go),a=n.getRef(Xi);return hn(Ds(r,i=>rO(o,i,s,a)),o)})),XA=function(){let e=typeof arguments[0]!="string",t=e?arguments[1]:arguments[0],n=Mp(e?arguments[2]:arguments[1]);if(e){let r=arguments[0];return V(vl(t,n),o=>tc(r,o,n))}return r=>V(vl(t,n),o=>tc(r,o,n))},zz=(e,t)=>(t=typeof t=="function"?t:Rn,Ho(bl,n=>({name:e,stack:t,parent:n}))),eO=Sl,tO=El,nO=h(e=>ae(e[0]),(e,t,n={})=>{let o=(Array.isArray(t)?t:[t]).map(s=>({span:s,attributes:n}));return Ho(e,El,s=>[...s,...o])}),rO=(e,t,n,r)=>W(()=>{e.status._tag!=="Ended"&&e.end(r?n.currentTimeNanosUnsafe():$p,t)}),wl=(e,...t)=>{let n=t.length===1?void 0:t[0],r=t[t.length-1];return te(o=>{let s=gb(o,e,n),a=o.getRef(Go),i=o.getRef(Xi);return Na(o,c=>rO(s,c,a,i)),r(s)})},by=gn(yl),tc=function(){let e=ae(arguments[0]),t=e?arguments[1]:arguments[0],n=e?arguments[2]:arguments[1],r=F;return t._tag==="Span"&&(n=Mp(n),r=zz(t.name,n?.captureStackTrace)),e?by(r(arguments[0]),t):o=>by(r(o),t)},oO=function(){let e=typeof arguments[0]!="string",t=e?arguments[1]:arguments[0],n=Mp(arguments[2]);if(e){let s=arguments[0];return wl(t,arguments[2],a=>tc(s,a,n))}let r=typeof arguments[1]=="function"?arguments[1]:void 0,o=r?void 0:arguments[1];return(s,...a)=>wl(t,r?r(...a):o,i=>tc(s,i,n))},sO=h(e=>ae(e[0]),(e,...t)=>Ho(e,Sl,n=>{let r=t.length===1?{...n,...t[0]}:{...n};return t.length===1||N(r,t[0],t[1]),r})),aO=(...e)=>te(t=>{let n=t.currentSpanLocal;if(n)if(e.length===1)for(let[r,o]of Object.entries(e[0]))n.attribute(r,o);else n.attribute(e[0],e[1]);return ue}),iO=te(e=>{let t=e.currentSpanLocal;return t?U(t):Ve(new Zr)}),cO=Cz(yl),Go=xe("effect/Clock",{defaultValue:()=>new Sy}),dy=2**31-1,Sy=class{currentTimeMillisUnsafe(){return Date.now()}currentTimeMillis=W(()=>this.currentTimeMillisUnsafe());currentTimeNanosUnsafe(){return qz()}currentTimeNanos=W(()=>this.currentTimeNanosUnsafe());monotonicTimeNanosUnsafe(){return lO()}monotonicTimeNanos=W(()=>this.monotonicTimeNanosUnsafe());sleep(t){return this.sleepMillis(Bo(t))}sleepMillis(t){return t<=0?sc:Number.isFinite(t)?Mt(n=>{let r=t>dy?this.sleepMillis(t-dy):ue,o=setTimeout(()=>n(r),Math.min(t,dy));return W(()=>clearTimeout(o))}):Kp}},uO=BigInt(1e6),lO=(function(){let e=globalThis.process?.hrtime;if(typeof e?.bigint=="function")return()=>e.bigint();if(typeof performance<"u"&&typeof performance.now=="function")return()=>BigInt(Math.round(performance.now()*1e6));let t=BigInt(0);return()=>{let n=BigInt(Date.now())*uO;return n>t&&(t=n),t}})(),qz=(function(){let e=BigInt(1e9),t;return()=>{let n=lO(),r=BigInt(Date.now())*uO;if(t===void 0)t=r-n;else{let o=t+n;(r>o?r-o:o-r)>e&&(t=r-n)}return t+n}})(),co=e=>te(t=>e(t.getRef(Go))),fc=e=>co(t=>t.sleep(Rt(e))),fO=co(e=>e.currentTimeMillis);var Ey="~effect/Cause/TimeoutError";var Lp=class extends Do("TimeoutError"){[Ey]=Ey;constructor(t){super({message:t})}},vy="~effect/Cause/IllegalArgumentError";var Bp=class extends Do("IllegalArgumentError"){[vy]=vy;constructor(t){super({message:t})}},wy="~effect/Cause/ExceededCapacityError";var ky=class extends Do("ExceededCapacityError"){[wy]=wy;constructor(t){super({message:t})}},Iy="~effect/Cause/AsyncFiberError";var jp=class extends Do("AsyncFiberError"){[Iy]=Iy;constructor(t){super({message:"An asynchronous Effect was executed with Effect.runSync",fiber:t})}},Cy="~effect/Cause/UnknownError";var nc=class extends Do("UnknownError"){[Cy]=Cy;constructor(t,n){super({message:n,cause:t})}},xb=xe("effect/Console",{defaultValue:()=>globalThis.console}),Wz=e=>{switch(e){case"All":return Number.MIN_SAFE_INTEGER;case"Fatal":return 5e4;case"Error":return 4e4;case"Warn":return 3e4;case"Info":return 2e4;case"Debug":return 1e4;case"Trace":return 0;case"None":return Number.MAX_SAFE_INTEGER}},Hz=Lx($o,Wz),dO=zi(Hz),yb=xe("effect/Logger/CurrentLoggers",{defaultValue:()=>new Set([Yz,Xz])}),Vz=xe("effect/Logger/LogToStderr",{defaultValue:Gu}),pO=function(){let e=typeof arguments[0]=="string"?[[arguments[0],arguments[1]]]:Object.entries(arguments[0]);return Da(te(t=>{let n=t.getRef(zo),r={...n};for(let o=0;o<e.length;o++){let[s,a]=e[o];N(r,s,a)}return t.setContext(Xt(t.context,zo,r)),Ds(no(t.context,Ns),o=>{let s=t.getRef(zo),a={...s};for(let i=0;i<e.length;i++){let[c,u]=e[i];s[c]!==u&&!Object.is(s[c],u)||(Object.hasOwn(n,c)?N(a,c,n[c]):delete a[c])}return t.setContext(Xt(t.context,zo,a)),ue})}))},Gz="~effect/Logger",Kz={[Gz]:{_Message:F,_Output:F},pipe(){return re(this,arguments)}},mO=e=>{let t=Object.create(Kz);return t.log=e,t},Jz=e=>e.replace(/[\s="]/g,"_"),Zz=(e,t)=>`${Jz(e[0])}=${t-e[1]}ms`;var yr=e=>(...t)=>{let n;for(let r=0,o=t.length;r<o;r++){let s=t[r];Ui(s)&&(n?t.splice(r,1):t=t.slice(0,r).concat(t.slice(r+1)),n=n?ks(n.reasons.concat(s.reasons)):s,r--)}return n===void 0&&(n=Px),te(r=>{let o=e??r.cache.logLevel;if(dO(r.cache.minimumLogLevel,o))return ue;let s=r.getRef(Go),a=r.getRef(yb);if(a.size>0){let i=new Date(s.currentTimeMillisUnsafe());for(let c of a)c.log({cause:n,fiber:r,date:i,logLevel:o,message:t})}return ue})};var _a={bold:"1",red:"31",green:"32",yellow:"33",blue:"34",cyan:"36",white:"37",gray:"90",black:"30",bgBrightRed:"101"},nne={None:[],All:[],Trace:[_a.gray],Debug:[_a.blue],Info:[_a.green],Warn:[_a.yellow],Error:[_a.red],Fatal:[_a.bgBrightRed,_a.black]};var Qz=e=>`${e.getHours().toString().padStart(2,"0")}:${e.getMinutes().toString().padStart(2,"0")}:${e.getSeconds().toString().padStart(2,"0")}.${e.getMilliseconds().toString().padStart(3,"0")}`;var Yz=mO(({cause:e,date:t,fiber:n,logLevel:r,message:o})=>{let s=Array.isArray(o)?o.slice():[o];e.reasons.length>0&&s.push(qp(e));let a=t.getTime(),i=n.getRef(Rp),c="";for(let d of i)c+=` ${Zz(d,a)}`;let u=n.getRef(zo);Object.keys(u).length>0&&s.push(u);let l=n.getRef(xb);(n.getRef(Vz)?l.error:l.log)(`[${Qz(t)}] ${r.toUpperCase()} (#${n.id})${c}:`,...s)}),Xz=mO(({cause:e,fiber:t,logLevel:n,message:r})=>{let o=t.getRef(Go),s=t.getRef(zo),a=t.cache.span;if(a===void 0||a._tag==="ExternalSpan")return;let i={};for(let[c,u]of Object.entries(s))N(i,c,u);i["effect.fiberId"]=t.id,i["effect.logLevel"]=n.toUpperCase(),e.reasons.length>0&&(i["effect.cause"]=qp(e)),a.event(lI(Array.isArray(r)&&r.length===1?r[0]:r),o.currentTimeNanosUnsafe(),i)});function eq(){my.interruptChildren??=Sz}var bb=U(void 0);var hO=h(e=>ae(e[0]),(e,t)=>ab(e,n=>te(r=>(tq(r,n,t?.defectsOnly),ue)))),tq=(e,t,n)=>{let r=e.getRef(_C);if(r.size===0||n&&!LC(t))return;let o={cause:t,fiber:e,timestamp:e.getRef(Go).currentTimeNanosUnsafe()};r.forEach(s=>s.report(o))};var nq="~effect/Deferred";var rq={[nq]:{_A:F,_E:F},pipe(){return re(this,arguments)}},gO=function(){this.resumes=void 0,this.effect=void 0};gO.prototype=rq;var dm=()=>new gO;var dc=e=>Mt(t=>e.effect?t(e.effect):(e.resumes??=[],e.resumes.push(t),W(()=>{let n=e.resumes;if(n===void 0)return;let r=n.indexOf(t);r>=0&&n.splice(r,1)})));var Sb=e=>W(()=>Eb(e)),Eb=e=>e.effect!==void 0;var pm=(e,t)=>{if(e.effect)return!1;if(e.effect=t,e.resumes){let n=e.resumes;e.resumes=void 0;for(let r=0;r<n.length;r++)n[r](t)}return!0};var ie={};qr(ie,{Do:()=>e3,Transaction:()=>yc,TypeId:()=>Vq,abortSignal:()=>uW,acquireDisposable:()=>X3,acquireRelease:()=>ir,acquireUseRelease:()=>z_,addFinalizer:()=>$m,all:()=>O_,andThen:()=>fo,annotateCurrentSpan:()=>SW,annotateLogs:()=>QW,annotateLogsScoped:()=>YW,annotateSpans:()=>bW,as:()=>En,asSome:()=>R_,asVoid:()=>nS,awaitAllChildren:()=>MW,bind:()=>r3,bindTo:()=>t3,cached:()=>oW,cachedInvalidateWithTTL:()=>aW,cachedWithTTL:()=>sW,callback:()=>nn,catch:()=>Er,catchCause:()=>Vn,catchCauseFilter:()=>x3,catchCauseIf:()=>g3,catchDefect:()=>oS,catchEager:()=>af,catchFilter:()=>tf,catchIf:()=>m3,catchNoSuchElement:()=>h3,catchReason:()=>f3,catchReasons:()=>d3,catchTag:()=>Jo,catchTags:()=>rS,clockWith:()=>Oc,context:()=>Dm,contextWith:()=>B_,currentParentSpan:()=>vW,currentSpan:()=>EW,delay:()=>U_,die:()=>jt,effectify:()=>Ze,ensuring:()=>kc,eventually:()=>v3,exit:()=>Bs,fail:()=>I,failCause:()=>Ec,failCauseSync:()=>Ls,failSync:()=>Xb,fiber:()=>NW,fiberId:()=>DW,filter:()=>aS,filterMap:()=>U3,filterMapEffect:()=>L_,filterMapOrElse:()=>L3,filterMapOrFail:()=>j3,filterOrElse:()=>$3,filterOrFail:()=>B3,findFirst:()=>Zq,findFirstFilter:()=>Qq,firstSuccessOf:()=>_3,flatMap:()=>q,flatMapEager:()=>_t,flatten:()=>F_,flip:()=>l3,fn:()=>qW,fnUntraced:()=>B,fnUntracedEager:()=>dS,forEach:()=>ja,forever:()=>ho,forkChild:()=>fS,forkDetach:()=>RW,forkIn:()=>Tc,forkScoped:()=>Ac,fromNullishOr:()=>c3,fromOption:()=>a3,fromResult:()=>ef,gen:()=>Dt,head:()=>Yq,ignore:()=>wc,ignoreCause:()=>C3,interrupt:()=>qa,interruptible:()=>iW,interruptibleMask:()=>cW,isEffect:()=>Sn,isFailure:()=>G3,isSuccess:()=>K3,let:()=>n3,linkSpans:()=>IW,log:()=>WW,logDebug:()=>KW,logError:()=>Bm,logFatal:()=>HW,logInfo:()=>GW,logTrace:()=>JW,logWarning:()=>VW,logWithLevel:()=>J_,makeSpan:()=>V_,makeSpanScoped:()=>CW,map:()=>ne,mapBoth:()=>y3,mapBothEager:()=>zt,mapEager:()=>Wa,mapError:()=>kt,mapErrorEager:()=>sf,match:()=>js,matchCause:()=>W3,matchCauseEager:()=>H3,matchCauseEffect:()=>iS,matchCauseEffectEager:()=>V3,matchEager:()=>q3,matchEffect:()=>Nm,never:()=>Fm,onError:()=>Ic,onErrorFilter:()=>tW,onErrorIf:()=>eW,onExit:()=>Qo,onExitFilter:()=>rW,onExitIf:()=>nW,onExitPrimitive:()=>q_,onInterrupt:()=>W_,option:()=>u3,orDie:()=>po,orElseSucceed:()=>O3,partition:()=>Gq,promise:()=>__,provide:()=>cS,provideContext:()=>Zo,provideService:()=>mo,provideServiceEffect:()=>uS,race:()=>D3,raceAll:()=>$_,raceAllFirst:()=>N3,raceFirst:()=>za,reduce:()=>Kq,repeat:()=>lW,repeatOrElse:()=>fW,replicate:()=>dW,replicateEffect:()=>pW,request:()=>PW,requestUnsafe:()=>FW,result:()=>tS,retry:()=>w3,retryOrElse:()=>k3,runCallback:()=>$W,runCallbackWith:()=>UW,runFork:()=>go,runForkWith:()=>of,runPromise:()=>G_,runPromiseExit:()=>Lm,runPromiseExitWith:()=>LW,runPromiseWith:()=>K_,runSync:()=>BW,runSyncExit:()=>xo,runSyncExitWith:()=>zW,runSyncWith:()=>jW,sandbox:()=>I3,satisfiesErrorType:()=>lH,satisfiesServicesType:()=>fH,satisfiesSuccessType:()=>uH,schedule:()=>mW,scheduleFrom:()=>H_,scope:()=>nf,scoped:()=>zs,scopedWith:()=>lS,service:()=>j_,serviceOption:()=>Um,setContext:()=>J3,sleep:()=>Mm,spanAnnotations:()=>wW,spanLinks:()=>kW,succeed:()=>b,succeedNone:()=>Yl,succeedSome:()=>P_,suspend:()=>ke,sync:()=>pe,tap:()=>vc,tapCause:()=>Rm,tapCauseFilter:()=>E3,tapCauseIf:()=>S3,tapDefect:()=>D_,tapError:()=>sS,tapErrorTag:()=>b3,timed:()=>M3,timeout:()=>P3,timeoutOption:()=>F3,timeoutOrElse:()=>R3,tracer:()=>hW,track:()=>eH,trackDefects:()=>rH,trackDuration:()=>oH,trackErrors:()=>nH,trackSuccesses:()=>tH,transposeOption:()=>i3,try:()=>lt,tryPromise:()=>Sc,tx:()=>sH,txRetry:()=>cH,undefined:()=>Xq,uninterruptible:()=>rf,uninterruptibleMask:()=>Cc,unwrapReason:()=>p3,updateContext:()=>Z3,updateService:()=>Q3,updateServiceScoped:()=>Y3,useSpan:()=>TW,validate:()=>Jq,void:()=>ye,when:()=>z3,whileLoop:()=>bc,withErrorReporting:()=>A3,withExecutionPlan:()=>T3,withFiber:()=>Xl,withFiberSucceed:()=>s3,withLogSpan:()=>XW,withLogger:()=>ZW,withParentSpan:()=>_W,withSpan:()=>AW,withSpanScoped:()=>OW,withTracer:()=>gW,withTracerEnabled:()=>xW,withTracerTiming:()=>yW,yieldNow:()=>eS,yieldNowWith:()=>o3,zip:()=>M_,zipWith:()=>N_});var xO=_x,Ko=Oe,uo=Zt,br=nr;var Sr=an;var xt=Tl,Dl=By;var yO=zo;var bO=Rp;var SO=Fp;var Ul=Ns;var pc=om,$l=iA,mm=Ds,Ll=sA;var Us=oA,or=eb;var IO="~effect/Layer",vO="~effect/Layer/MemoMap",oq=(e,t)=>{let n={observers:0,deferred:dm(),scope:pc(),finalizer:r=>ee(()=>--n.observers>0?ue:(e.map.delete(t),or(n.scope,r)))};return n},wO=(e,t)=>t.state._tag==="Closed"?!1:(e.observers++,lc(t,{},e.finalizer),!0),CO=e=>_(e,IO),sq={[IO]:{_ROut:F,_E:F,_RIn:F},pipe(){return re(this,arguments)}},TO=e=>{let t=Object.create(sq);return t.build=e,t},wb=e=>TO((t,n)=>{let r=Us(n);return qn(e(t,r),o=>o._tag==="Failure"?or(r,o):ue)}),aq=e=>{let t=wb((n,r)=>n.getOrElseMemoize(t,r,e));return t},hm=class{get[vO](){return vO}parent;constructor(t){this.parent=t}map=new Map;get(t,n){let r=this.map.get(t);return r?(wO(r,n),r.deferred.effect??dc(r.deferred)):this.parent?.get(t,n)}getOrElseMemoize(t,n,r){return ee(()=>{let o;return ao(ee(()=>{let s=this.get(t,n);if(s)return s;let a=oq(this,t);return wO(a,n)?(o=a.deferred,this.map.set(t,a),r(this,a.scope)):r(this,n)}),s=>{o&&pm(o,s)})})}},kb=()=>new hm,iq=e=>new hm(e);var jl=class e extends Je()("effect/Layer/CurrentMemoMap"){static forkOrCreate(t){let n=vp(t,e);return n?iq(n):kb()}},Ib=h(3,(e,t,n)=>gn(Me(e.build(t,n),Xt(jl,t)),jl,t));var AO=h(2,(e,t)=>te(n=>Ib(e,jl.forkOrCreate(n.context),t))),sr=function(){return arguments.length===1?e=>gm(Lo(arguments[0],e)):gm(Lo(arguments[0],arguments[1]))},gm=e=>TO(it(U(e)));var mc=function(){return arguments.length===1?e=>kO(arguments[0],e):kO(arguments[0],arguments[1])},kO=(e,t)=>cq(Me(t,n=>Lo(e,n))),cq=e=>aq((t,n)=>$l(e,n));var OO=(e,t,n)=>{let r=Us(n,"parallel");return Bn(e,o=>o.build(t,Us(r,"sequential")),{concurrency:e.length}).pipe(Me(o=>eC(...o)))},xm=(...e)=>wb((t,n)=>OO(e,t,n));var _O=(e,t,n)=>wb((r,o)=>V(Array.isArray(t)?OO(t,r,o):t.build(r,o),s=>e.build(r,o).pipe(gr(s),Me(a=>n(a,s))))),PO=h(2,(e,t)=>_O(e,t,F)),FO=h(2,(e,t)=>_O(e,t,(n,r)=>Ia(r,n)));var RO="~effect/ExecutionPlan";var uq={[RO]:RO,get captureRequirements(){let e=this;return Ms(t=>U(lq(e.steps.map(n=>({...n,while:n.while?r=>gr(n.while(r),t):void 0,provide:CO(n.provide)?PO(n.provide,gm(t)):n.provide})))))},pipe(){return re(this,arguments)}},lq=e=>{let t=Object.create(uq);return t.steps=e,t};var MO=xe("effect/ExecutionPlan/CurrentMetadata",{defaultValue:it({attempt:0,stepIndex:0})});var DO=Ui,UO=mI,ym=Is;var zl=ks;var $O=sl,ql=al;var Cb=e=>new ga(e),Tb=e=>new rl(e),LO=UC,bm=zC,$s=qC;var Wl=zp;var BO=qp;var Ab=fl;var Sm=$i,Ot=yI;var Em=Bp;var jO=nc;var vm="~effect/DateTime",wm="~effect/DateTime/TimeZone",qO={[vm]:vm,pipe(){return re(this,arguments)},[Ee](){return this.toString()},toJSON(){return Gl(this).toJSON()}},fq={...qO,_tag:"Utc",[oe](){return Et(this.epochMilliseconds)},[se](e){return gc(e)&&e._tag==="Utc"&&this.epochMilliseconds===e.epochMilliseconds},toString(){return`DateTime.Utc(${Gl(this).toJSON()})`}},dq={...qO,_tag:"Zoned",[oe](){return ce(Et(this.epochMilliseconds))(G(this.zone))},[se](e){return gc(e)&&e._tag==="Zoned"&&this.epochMilliseconds===e.epochMilliseconds&&Q(this.zone,e.zone)},toString(){return`DateTime.Zoned(${Bb(this)})`}},WO={[wm]:wm,[Ee](){return this.toString()}},pq={...WO,_tag:"Named",[oe](){return Ie(`Named:${this.id}`)},[se](e){return $a(e)&&e._tag==="Named"&&this.id===e.id},toString(){return`TimeZone.Named(${this.id})`},toJSON(){return{_id:"TimeZone",_tag:"Named",id:this.id}}},mq={...WO,_tag:"Offset",[oe](){return Ie(`Offset:${this.offset}`)},[se](e){return $a(e)&&e._tag==="Offset"&&this.offset===e.offset},toString(){return`TimeZone.Offset(${Ub(this.offset)})`},toJSON(){return{_id:"TimeZone",_tag:"Offset",offset:this.offset}}},lo=(e,t,n)=>{let r=Object.create(dq);return r.epochMilliseconds=e,r.zone=t,Object.defineProperty(r,"partsUtc",{value:n,enumerable:!1,writable:!0}),Object.defineProperty(r,"adjustedEpochMillis",{value:void 0,enumerable:!1,writable:!0}),Object.defineProperty(r,"partsAdjusted",{value:void 0,enumerable:!1,writable:!0}),r},gc=e=>_(e,vm);var $a=e=>_(e,wm),HO=e=>$a(e)&&e._tag==="Offset",VO=e=>$a(e)&&e._tag==="Named",GO=e=>e._tag==="Utc",Pb=e=>e._tag==="Zoned",KO=Qt((e,t)=>e.epochMilliseconds===t.epochMilliseconds);var JO=e=>{let t=Object.create(fq);return t.epochMilliseconds=e,Object.defineProperty(t,"partsUtc",{value:void 0,enumerable:!1,writable:!0}),t},hc=e=>{let t=e.getTime();if(Number.isNaN(t))throw new Em("Invalid date");return JO(t)},Im=e=>{if(gc(e))return e;if(e instanceof Date)return hc(e);if(typeof e=="object"){if("epochMilliseconds"in e)return hc(new Date(e.epochMilliseconds));let t=new Date(0);return vq(t,e),hc(t)}else if(typeof e=="string"&&!hq(e))return hc(new Date(e+"Z"));return hc(new Date(e))},hq=e=>/Z|GMT|[+-]\d{2}$|[+-]\d{2}:?\d{2}$|\]$/.test(e),gq=-864e13+720*60*1e3,xq=864e13-840*60*1e3,Fb=(e,t)=>{let n=t?.timeZone;if(n===void 0&&gc(e)&&Pb(e))return e;let r=Im(e);if(r.epochMilliseconds<gq||r.epochMilliseconds>xq)throw new RangeError(`Epoch millis out of range: ${r.epochMilliseconds}`);n===void 0&&typeof e=="object"&&"timeZoneId"in e&&(n=e.timeZoneId);let o;if(n===void 0){let s=new Date(r.epochMilliseconds).getTimezoneOffset()*-60*1e3;o=Vl(s)}else if($a(n))o=n;else if(typeof n=="number")o=Vl(n);else{let s=Nb(n);if(He(s))throw new Em(`Invalid time zone: ${n}`);o=s.value}return t?.adjustForTimeZone!==!0?lo(r.epochMilliseconds,o,r.partsUtc):wq(r.epochMilliseconds,o,t?.disambiguation??"compatible")},Ob=eo(Fb),ZO=eo(Im),yq=/^(.{17,35})\[(.+)\]$/,QO=e=>{let t=yq.exec(e);if(t===null){let o=Lb(e);return o!==null?Ob(e,{timeZone:o}):A()}let[,n,r]=t;return Ob(n,{timeZone:r})};var YO=e=>JO(e.epochMilliseconds);var km=new Map,bq={day:"numeric",month:"numeric",year:"numeric",hour:"numeric",minute:"numeric",second:"numeric",timeZoneName:"longOffset",fractionalSecondDigits:3,hourCycle:"h23"},Sq=e=>{let t=e.resolvedOptions().timeZone,n=km.get(t);if(n!==void 0)return n;let r=Object.create(pq);return r.id=t,r.format=e,km.set(t,r),r},Rb=e=>{let t=km.get(e);if(t!==void 0)return t;try{let n=Sq(new Intl.DateTimeFormat("en-US",{...bq,timeZone:e}));return km.set(e,n),n}catch{throw new Em(`Invalid time zone: ${e}`)}},Vl=e=>{let t=Object.create(mq);return t.offset=e,t},Mb=eo(Rb);var Eq=/^(?:GMT|[+-])/,Nb=e=>{if(Eq.test(e)){let t=Lb(e);return t===null?A():R(Vl(t))}return Mb(e)},XO=e=>e._tag==="Offset"?Ub(e.offset):e.id;var Gl=e=>new Date(e.epochMilliseconds),Cm=e=>{if(e._tag==="Utc")return new Date(e.epochMilliseconds);if(e.zone._tag==="Offset")return new Date(e.epochMilliseconds+e.zone.offset);if(e.adjustedEpochMilliseconds!==void 0)return new Date(e.adjustedEpochMilliseconds);let t=e.zone.format.formatToParts(e.epochMilliseconds).filter(r=>r.type!=="literal"),n=new Date(0);return n.setUTCFullYear(Number(t[2].value),Number(t[0].value)-1,Number(t[1].value)),n.setUTCHours(Number(t[3].value),Number(t[4].value),Number(t[5].value),Number(t[6].value)),e.adjustedEpochMilliseconds=n.getTime(),n},Db=e=>Cm(e).getTime()-$b(e),Ub=e=>{let t=Math.abs(e),n=Math.floor(t/(3600*1e3)),r=Math.round(t%(3600*1e3)/(60*1e3));return r===60&&(n+=1,r=0),`${e<0?"-":"+"}${String(n).padStart(2,"0")}:${String(r).padStart(2,"0")}`},e_=e=>Ub(Db(e)),$b=e=>e.epochMilliseconds;var vq=(e,t)=>{if((t.year!==void 0||t.month!==void 0||t.day!==void 0)&&e.setUTCFullYear(t.year??e.getUTCFullYear(),t.month!==void 0?t.month-1:e.getUTCMonth(),t.day??e.getUTCDate()),t.weekDay!==void 0){let n=t.weekDay-e.getUTCDay();e.setUTCDate(e.getUTCDate()+n)}t.hour!==void 0&&e.setUTCHours(t.hour),t.minute!==void 0&&e.setUTCMinutes(t.minute),t.second!==void 0&&e.setUTCSeconds(t.second),t.millisecond!==void 0&&e.setUTCMilliseconds(t.millisecond)};var zO=1440*60*1e3,wq=(e,t,n)=>{if(t._tag==="Offset")return lo(e-t.offset,t);let r=Hl(e-zO,e,t),o=Hl(e+zO,e,t);if(r===o)return lo(e-r,t);let s=r<o,a=r-o;if(s){if(Hl(e-o,e,t)===o)return lo(e-o,t);let u=lo(e-r,t),l=Cm(u).getTime();if(e!==l)switch(n){case"reject":{let f=new Date(e).toISOString();throw new RangeError(`Gap time: ${f} does not exist in time zone ${t.id}`)}case"earlier":return lo(e-o,t);case"compatible":case"later":return u}return u}if(Hl(e-r,e,t)===r){if(n==="earlier"||n==="compatible"||Hl(e-r+a,e+a,t)===r)return lo(e-r,t);if(n==="reject"){let u=new Date(e).toISOString();throw new RangeError(`Ambiguous time: ${u} occurs twice in time zone ${t.id}`)}}return lo(e-o,t)},kq=/([+-])(\d{2}):(\d{2})$/,Lb=e=>{let t=kq.exec(e);if(t===null)return null;let[,n,r,o]=t;return(n==="+"?1:-1)*(Number(r)*60+Number(o))*60*1e3},Hl=(e,t,n)=>{let r=n.format.formatToParts(e).find(s=>s.type==="timeZoneName")?.value??"";if(r==="GMT")return 0;let o=Lb(r);return o===null?Db(lo(t,n)):o};var t_=e=>Gl(e).toISOString();var _b=e=>{let t=Cm(e);return e._tag==="Utc"?t.toISOString():`${t.toISOString().slice(0,-1)}${e_(e)}`},Bb=e=>e.zone._tag==="Offset"?_b(e):`${_b(e)}[${e.zone.id}]`;var zne=globalThis.Number;var r_=h(2,(e,t)=>{if(!globalThis.Number.isFinite(e)||!globalThis.Number.isFinite(t)||t===0)return NaN;if(globalThis.Number.isInteger(e)&&globalThis.Number.isInteger(t))return e%t;let[n,r]=n_(e),[o,s]=n_(t),a=Math.min(r,s),i=n*BigInt(10)**BigInt(r-a),c=o*BigInt(10)**BigInt(s-a),u=i%c;if(u===BigInt(0))return e<0||Object.is(e,-0)?-0:0;let l=globalThis.Number(`${u}e${a}`);return l===0?Math.sign(e)*globalThis.Number.MIN_VALUE:l});function n_(e){if(globalThis.Number.isInteger(e))return[BigInt(e),0];let t=Math.abs(e).toExponential(),n=t.indexOf("e"),r=t.slice(0,n).replace(".","");return[BigInt(r)*(e<0?-BigInt(1):BigInt(1)),globalThis.Number(t.slice(n+1))-r.length+1]}var o_=h(2,(e,t)=>{let n=Math.pow(10,t);return Math.round(e*n)/n});var qne=globalThis.String;var a_=e=>e.trim();var c_=(e,t,n)=>{let r=n*(t-e)+e;if(r!==t||e>=t||!Number.isFinite(t))return r;if(t===0)return-Number.MIN_VALUE;let o=new DataView(new ArrayBuffer(8));o.setFloat64(0,t);let s=o.getBigUint64(0);return o.setBigUint64(0,t>0?s-BigInt(1):s+BigInt(1)),o.getFloat64(0)};var Hn=h(2,(e,t)=>cc(e,Tq,n=>t(n))),Kl=e=>e.reasons.some(jb),jb=e=>e._tag==="Fail"&&Ab(e.error),Tm=e=>{let t,n=!1;for(let r of e.reasons)jb(r)?t??=r.error:r._tag!=="Interrupt"&&(n=!0);return t===void 0?K(e):n?K(zl(e.reasons.filter(r=>!jb(r)))):$(t)};var Tq=e=>{let t=Tm(e);return he(t)?t:$(t.success.value)},zb=e=>{let t=Tm(e);return he(t)?uo(t.failure):Ko(t.success.value)},Am=h(2,(e,t)=>oo(e,{onSuccess:t.onSuccess,onFailure:n=>{let r=Tm(n);return he(r)?t.onFailure(r.failure):t.onDone(r.success.value)}}));var u_="~effect/Schedule";var Ba=xe("effect/Schedule/CurrentMetadata",{defaultValue:it({input:void 0,output:void 0,duration:Ji,attempt:0,start:0,now:0,elapsed:0,elapsedSincePrevious:0})}),Aq={[u_]:{_Out:F,_In:F,_Env:F},pipe(){return re(this,arguments)}},qb=e=>_(e,u_),Wb=e=>{let t=Object.create(Aq);return t.step=e,t},Hb=()=>{let e=0,t,n;return(r,o)=>{n===void 0&&(n=r);let s=r-n,a=t===void 0?0:r-t;return t=r,{input:o,attempt:++e,start:n,now:r,elapsed:s,elapsedSincePrevious:a}}},Oq=e=>Wb(Me(e,t=>{let n=Hb();return(r,o)=>t(n(r,o))})),Vb=e=>jn(e.step,t=>U(()=>Re(t))),Om=e=>co(t=>Me(Vb(e),n=>{let r=Hb();return o=>ee(()=>{let s=t.currentTimeMillisUnsafe();return V(n(s,o),([a,i])=>{let c=r(s,o);return c.output=a,c.duration=i,hn(fc(i),c)})})}));var Gb=e=>Wb(Me(Vb(e),t=>(n,r)=>Am(t(n,r),{onSuccess:o=>U([r,o[1]]),onFailure:Re,onDone:()=>Ot(r)}))),l_=e=>Jl(Kb,({attempt:t})=>U(t<=e)),_q=e=>{let t=Rt(e);return Oq(U(n=>U([n.attempt-1,t])))};var Jl=h(2,(e,t)=>Wb(Me(Vb(e),n=>{let r=Hb();return(o,s)=>V(n(o,s),a=>{let[i,c]=a,u=t({...r(o,s),output:i,duration:c});return V(ae(u)?u:U(u),l=>l?U(a):Ot(i))})})));var Kb=_q(Ji);var Pq=(e,t,n)=>sm(r=>V(n?.local?Ib(t,kb(),r):AO(t,r),o=>gr(e,o))),_m=h(e=>ae(e[0]),(e,t,n)=>Jx(t)?gr(e,t):Pq(e,Array.isArray(t)?xm(...t):t,n));var Zb=h(3,(e,t,n)=>V(Om(t),r=>{let o=Ba.defaultValue();return zn(Yp(Ra(V(ee(()=>gn(e,Ba,o)),r),s=>W(()=>{o=s})),{disableYield:!0}),s=>fl(s)?U(s.value):n(s,o.attempt===0?A():R(o)))})),Qb=h(3,(e,t,n)=>V(Om(t),r=>{let o=Ba.defaultValue(),s,a=zn(ee(()=>gn(e,Ba,o)),i=>(s=i,V(r(i),c=>(o=c,a))));return Hn(a,i=>ws(()=>n(s,i)))})),d_=h(2,(e,t)=>{let n=typeof t=="function"?t(F):qb(t)?t:Ql(t);return Zb(e,n,Ve)}),Zl=h(2,(e,t)=>{let n=typeof t=="function"?t(F):qb(t)?t:Ql(t);return Qb(e,n,Ve)}),p_=h(3,(e,t,n)=>V(Om(n),r=>{let o=Ba.defaultValue(),s=ee(()=>gn(e,Ba,o));return zn(V(r(t),a=>{o=a;let i=it(V(s,r));return io({while:Fn,body:i,step(c){o=c}})}),a=>fl(a)?U(a.value):Ve(a))})),Fq=Gb(Kb),Ql=e=>{let t=e.schedule?Gb(e.schedule):Fq;return e.while&&(t=Jl(t,({input:n})=>{let r=e.while(n);return ae(r)?r:U(r)})),e.until&&(t=Jl(t,({input:n})=>{let r=e.until(n);return ae(r)?Me(r,o=>!o):U(!r)})),e.times!==void 0&&(t=Jl(t,({attempt:n})=>U(n<=e.times))),t};var Rq=(e,t)=>{let n=-1,r=0,o=s=>tm(e(s));return{begin:co(s=>ee(()=>{let a=t();a.stepIndex!==n&&(n=a.stepIndex,r=0),r++;let i={attempt:a.attempt,stepAttempt:r,stepIndex:a.stepIndex,startNanos:s.monotonicTimeNanosUnsafe()};return hn(o({_tag:"AttemptStart",attempt:i.attempt,stepAttempt:i.stepAttempt,stepIndex:i.stepIndex}),i)})),end:(s,a)=>co(i=>{let c=ro(i.monotonicTimeNanosUnsafe()-s.startNanos);return o(a._tag==="Success"?{_tag:"AttemptSuccess",attempt:s.attempt,stepAttempt:s.stepAttempt,stepIndex:s.stepIndex,duration:c}:{_tag:"AttemptFailure",attempt:s.attempt,stepAttempt:s.stepAttempt,stepIndex:s.stepIndex,duration:c,cause:a.cause})})}},g_=h(e=>ae(e[0]),(e,t,n)=>ee(()=>{let r=0,o={attempt:0,stepIndex:0},s=Qp(MO,W(()=>(o={attempt:o.attempt+1,stepIndex:r},o))),a=n?.onEvent===void 0?void 0:Rq(n.onEvent,()=>o),i=a===void 0?F:u=>xr(l=>V(a.begin,f=>qn(l(u),d=>a.end(f,d)))),c;return V(io({while:()=>r<t.steps.length&&(c===void 0||he(c)),body(){let u=t.steps[r],l=s(i(_m(e,u.provide)));if(c){let f=!1,d=l;l=ee(()=>f?d:(f=!0,oc(c))),l=Zl(l,h_(u,!1))}else{let f=h_(u,!0);l=f?Zl(l,f):l}return Ps(l)},step(u){c=u,r++}}),()=>oc(c))})),h_=(e,t)=>{if(t){if(e.attempts===1||!(e.schedule||e.attempts))return}else return Ql({schedule:e.schedule?e.schedule:e.attempts?void 0:Mq,times:e.attempts,while:e.while});return Ql({schedule:e.schedule,while:e.while,times:e.attempts?e.attempts-1:void 0})},Mq=l_(1);var Dq="~effect/Request",Uq=sI({_E:e=>e,_A:e=>e,_R:e=>e}),sre={...pI,[Dq]:Uq};var x_=e=>e;var b_=h(2,(e,t)=>{let n=r=>Mt(o=>{let s=E_(r,e,o,Fs());return Lq(r,s)});return ae(t)?V(t,n):n(t)}),S_=(e,t)=>{let n=E_(t.resolver,e,t.onExit,{context:t.context,cache:{scheduler:rt(t.context,xl)}});return()=>v_(t.resolver,n)},Pm=[],Yb=new WeakMap,E_=(e,t,n,r)=>{let o=Yb.get(e);o||(o=new Map,Yb.set(e,o));let s,a=!1,i=x_({request:t,context:r.context,uninterruptible:!1,completeUnsafe(u){a||(a=!0,!(s&&!s.entrySet.delete(i))&&n(u))}});if(e.preCheck!==void 0&&!e.preCheck(i))return i;let c=e.batchKey(i);if(s=o.get(c),!s){if(Pm.length>0)s=Pm.pop(),s.key=c,s.resolver=e,s.map=o;else{let u={key:c,resolver:e,map:o,entrySet:new Set,entries:new Set,delayEffect:V(ee(()=>u.resolver.delay),l=>y_(u)),run:qn(ee(()=>u.resolver.runAll(Array.from(u.entries),u.key)),l=>{for(let f of u.entrySet)f.completeUnsafe(l._tag==="Success"?Ln(new Error("Effect.request: RequestResolver did not complete request",{cause:f.request})):l);return u.entries.clear(),Pm.length<128&&(u.entrySet.clear(),u.key=void 0,u.fiber=void 0,u.resolver=void 0,u.map=void 0,Pm.push(u)),ue})};s=u}o.set(c,s),s.fiber=Vo(r.context)(s.delayEffect,{scheduler:r.cache.scheduler})}return s.entrySet.add(i),s.entries.add(i),s.resolver.collectWhile(s.entries)||(s.fiber.interruptUnsafe(r.id),s.fiber=Vo(r.context)(y_(s),{scheduler:r.cache.scheduler})),i},v_=(e,t)=>{if(t.uninterruptible)return;let n=Yb.get(e);if(!n)return;let r=e.batchKey(t),o=n.get(r);if(!o||!o.entries.delete(t))return;o.entrySet.delete(t);let s;o.entries.size===0&&(n.delete(r),s=o.fiber),t.completeUnsafe(Cl()),s?.interruptUnsafe()},Lq=(e,t)=>W(()=>v_(e,t));function y_(e){return e.map.has(e.key)?(e.map.delete(e.key),e.run):ue}var jq="effect/Metric/CurrentMetricAttributes",zq=xe(jq,{defaultValue:()=>({})}),qq="effect/Metric/MetricRegistry",Wq=xe(qq,{defaultValue:()=>new Map}),w_="~effect/Metric",k_=class{[w_]=w_;#t;#e="";id;description;attributes;constructor(t,n,r){this.id=t,this.description=n,this.attributes=r}valueUnsafe(t){return this.hook(t).get(t)}modifyUnsafe(t,n){return this.hook(n).modify(t,n)}updateUnsafe(t,n){return this.hook(n).update(t,n)}hook(t){let n=rt(t,zq);n!==this.#t&&(this.#t=n,this.#e=Hq(this,I_(this.attributes,n)));let r=rt(t,Wq),o=r.get(this.#e);return bs(o)&&(o={id:this.id,type:this.type,description:this.description,attributes:Object.keys(n).length>0?I_(this.attributes,n):this.attributes,hooks:this.createHooks()},r.set(this.#e,o)),o.hooks}pipe(){return re(this,arguments)}};var xc=h(2,(e,t)=>Ms(n=>W(()=>e.updateUnsafe(t,n))));function Hq(e,t){let n=Object.entries(t).sort((r,o)=>r[0]<o[0]?-1:r[0]>o[0]?1:0);return JSON.stringify([e.type,e.id,e.description,n])}function I_(e,t){return{...C_(e),...C_(t)}}function C_(e){return ct(e)&&Array.isArray(e)?e.reduce((t,[n,r])=>(N(t,n,r),t),{}):e}var Vq=Qr,Sn=ae,O_=Ml,Gq=ub,Kq=SA,Jq=EA,Zq=vA,Qq=kA,ja=Bn,Yq=CA,bc=io,__=Fy,Sc=tT,b=U,Yl=Fa,P_=Py,ke=ee,pe=W,ye=ue;var Xq=bb;var nn=Mt,Fm=Kp,e3=FA,t3=RA,n3=NA;var r3=MA,Dt=sT,I=Ve,Xb=Gp,Ec=Re,Ls=XC,jt=Rs,lt=eT;var eS=sc,o3=_y,Xl=te,s3=gI,ef=oc,a3=Oy,i3=YC,c3=QC,q=V,F_=hT,fo=so,vc=Ra,tS=Ps,u3=KT,Bs=_l,ne=Me,En=hn,R_=ac,nS=Il,l3=lT,M_=_T,N_=zy,Er=zn;var Jo=Vy,rS=jT,f3=zT,d3=qT,p3=WT,Vn=jn,oS=DT,m3=Al,tf=em,h3=NT,g3=Wy,x3=cc,kt=Gy,y3=Ky,po=Jy,sS=Hy,b3=LT,Rm=UT,S3=$T,E3=Xp,D_=BT,v3=Zy,w3=Zl,k3=Qb,I3=fT,wc=GT,C3=tm,T3=g_,A3=hO,O3=HT,_3=VT,P3=tA,F3=Xy,R3=Yy,U_=eA,Mm=fc,M3=nA,$_=Uy,N3=$y,D3=dT,za=Ly,aS=OA,U3=_A,L_=PA,$3=lb,L3=fb,B3=PT,j3=AA,z3=FT,js=nm,q3=Ol,W3=Qy,H3=QT,V3=pT,iS=oo,Nm=uc,G3=YT,K3=XT,Dm=jy,B_=Ms,cS=_m,Zo=gr,J3=OT,j_=CT,Um=TT,Z3=ic,Q3=Ho,Y3=AT,mo=gn,uS=Qp,nf=Pl,zs=nb,lS=sm,ir=Ma,X3=dA,z_=Fl,$m=rb,kc=uA,Ic=ab,eW=lA,tW=ib,q_=ao,Qo=qn,nW=ob,rW=sb,oW=mA,sW=pA,aW=cb,qa=hA,iW=am,W_=fA,rf=Da,Cc=xr,cW=yA,uW=bA,ho=Yp,lW=d_,fW=Zb,dW=qy,pW=RT,mW=h(2,(e,t)=>H_(e,void 0,t)),H_=p_,hW=GA,gW=KA,xW=JA,yW=ZA,bW=sO,SW=aO,EW=iO,vW=cO,wW=eO,kW=tO,IW=nO,V_=YA,CW=vl,TW=wl,AW=oO,OW=XA,_W=tc,PW=b_,FW=S_,fS=DA,Tc=db,Ac=LA,RW=UA,MW=$A,NW=rT,DW=oT,go=jA,of=Vo,UW=pb,$W=zA,G_=WA,K_=mb,Lm=qA,LW=um,BW=VA,jW=hb,xo=HA,zW=lm,B=My,qW=aT,Oc=co,J_=yr,WW=yr(),HW=yr("Fatal"),VW=yr("Warn"),Bm=yr("Error"),GW=yr("Info"),KW=yr("Debug"),JW=yr("Trace"),ZW=h(2,(e,t)=>Ho(e,yb,n=>new Set([...n,t]))),QW=h(e=>Sn(e[0]),(e,...t)=>Ho(e,yO,n=>{let r=t.length===1?{...n,...t[0]}:{...n};return t.length===1||N(r,t[0],t[1]),r})),YW=pO,XW=h(2,(e,t)=>V(fO,n=>Ho(e,bO,r=>[[t,n],...r]))),eH=h(e=>Sn(e[0]),(e,t,n)=>Qo(e,r=>{let o=n===void 0?r:n(r);return xc(t,o)})),tH=h(e=>Sn(e[0]),(e,t,n)=>vc(e,r=>{let o=n===void 0?r:n(r);return xc(t,o)})),nH=h(e=>Sn(e[0]),(e,t,n)=>sS(e,r=>{let o=n===void 0?r:n(r);return xc(t,o)})),rH=h(e=>Sn(e[0]),(e,t,n)=>D_(e,r=>{let o=n===void 0?r:n(r);return xc(t,o)})),oH=h(e=>Sn(e[0]),(e,t,n)=>Oc(r=>{let o=r.monotonicTimeNanosUnsafe();return Qo(e,()=>{let s=r.monotonicTimeNanosUnsafe(),a=pC(Rt(s),Rt(o)),i=n===void 0?a:n(a);return xc(t,i)})})),yc=class extends Je()("effect/Effect/Transaction"){},sH=e=>Xl(t=>{let n=vp(t.context,yc);if(n)return e;n={journal:new Map,retry:!1};let r;return Cc(o=>q(bc({while:()=>!r,body:it(o(e).pipe(mo(yc,n),Rm(()=>n.retry?o(aH(n)):ye),Bs)),step(s){if(n.retry||!Z_(n))return A_(n);xt(s)?iH(t,n):A_(n),r=s}}),()=>r))}),Z_=e=>{for(let[t,{version:n}]of e.journal)if(t.version!==n)return!1;return!0},aH=e=>nn(t=>{if(!Z_(e))return t(ye);let n={},r=Array.from(e.journal.keys()),o=()=>{for(let a of r)a.pending.delete(n)},s=()=>{o(),t(ye)};for(let a of r)a.pending.set(n,s);return pe(o)});function iH(e,t){for(let[n,{value:r,written:o}]of t.journal)if(o){Object.is(r,n.value)||(n.version=n.version+1,n.value=r);for(let s of n.pending.values())e.currentDispatcher.scheduleTask(s,0);n.pending.clear()}}function A_(e){e.retry=!1,e.journal.clear()}var cH=q(yc,e=>(e.retry=!0,qa)),Ze=(e,t,n)=>(...r)=>nn(o=>{try{e(...r,(s,a)=>{o(s?I(t?t(s,r):s):b(a))})}catch(s){o(n?I(n(s,r)):jt(s))}}),uH=()=>e=>e,lH=()=>e=>e,fH=()=>e=>e,Wa=gT,sf=xT,zt=yT,_t=mT,af=bT,dS=iT;var Ka={};qr(Ka,{FileSystem:()=>wr,FileTypeId:()=>Dc,WatchBackend:()=>Sf,isFile:()=>s4,layerNoop:()=>o4,make:()=>LS,makeNoop:()=>hP});var Q_=globalThis.BigInt;var jm=e=>e>Q_(Number.MAX_SAFE_INTEGER)||e<Q_(Number.MIN_SAFE_INTEGER)?A():R(Number(e));var mS=BigInt(0),pH=BigInt(1),yo=BigInt(1e3),qs=BigInt(1024),Y_=[{symbol:"B",factor:pH,names:["B","byte","bytes"]},{symbol:"kB",factor:yo,names:["kB","kilobyte","kilobytes"]},{symbol:"MB",factor:yo**BigInt(2),names:["MB","megabyte","megabytes"]},{symbol:"GB",factor:yo**BigInt(3),names:["GB","gigabyte","gigabytes"]},{symbol:"TB",factor:yo**BigInt(4),names:["TB","terabyte","terabytes"]},{symbol:"PB",factor:yo**BigInt(5),names:["PB","petabyte","petabytes"]},{symbol:"EB",factor:yo**BigInt(6),names:["EB","exabyte","exabytes"]},{symbol:"ZB",factor:yo**BigInt(7),names:["ZB","zettabyte","zettabytes"]},{symbol:"YB",factor:yo**BigInt(8),names:["YB","yottabyte","yottabytes"]},{symbol:"RB",factor:yo**BigInt(9),names:["RB","ronnabyte","ronnabytes"]},{symbol:"QB",factor:yo**BigInt(10),names:["QB","quettabyte","quettabytes"]}],mH=[Y_[0],{symbol:"KiB",factor:qs,names:["KiB","kibibyte","kibibytes"]},{symbol:"MiB",factor:qs**BigInt(2),names:["MiB","mebibyte","mebibytes"]},{symbol:"GiB",factor:qs**BigInt(3),names:["GiB","gibibyte","gibibytes"]},{symbol:"TiB",factor:qs**BigInt(4),names:["TiB","tebibyte","tebibytes"]},{symbol:"PiB",factor:qs**BigInt(5),names:["PiB","pebibyte","pebibytes"]},{symbol:"EiB",factor:qs**BigInt(6),names:["EiB","exbibyte","exbibytes"]},{symbol:"ZiB",factor:qs**BigInt(7),names:["ZiB","zebibyte","zebibytes"]},{symbol:"YiB",factor:qs**BigInt(8),names:["YiB","yobibyte","yobibytes"]}],hH=[...Y_,...mH.slice(1)],gH=new Map(hH.flatMap(e=>e.names.map(t=>[t,e])));var hS=e=>e;var _c=e=>{throw new Error(`Invalid ByteSize: ${e}`)},X_=e=>!Number.isSafeInteger(e)||e<0?_c(`expected a non-negative safe integer, received ${e}`):hS(BigInt(e));var e1=e=>{let t=/^\s*(\d+)(?:\.(\d+))?\s*([A-Za-z]+)\s*$/.exec(e);if(t===null)return _c(`unsupported syntax ${JSON.stringify(e)}`);let n=gH.get(t[3]);if(n===void 0)return _c(`unsupported unit ${JSON.stringify(t[3])}`);let r=t[2]??"",o=BigInt(10)**BigInt(r.length),s=BigInt(t[1]+r)*n.factor;return s%o!==mS?_c(`${JSON.stringify(e)} does not represent an integral number of bytes`):hS(s/o)},t1=eo(e1),cf=e=>{switch(typeof e){case"bigint":return e<mS?_c(`expected a non-negative bigint, received ${e}`):hS(e);case"number":return X_(e);case"string":return e1(e)}return _c(`unsupported input ${e}`)},gS=eo(cf),uf=e=>typeof e=="bigint"?cf(e):X_(e);var n1=e=>typeof e=="bigint"&&e>=mS;var zm=e=>e,r1=jm;var o1="~effect/PlatformError",bo=class extends hr("BadArgument"){get message(){return`${this.module}.${this.method}${this.description?`: ${this.description}`:""}`}},xS=class extends Op{get message(){return`${this._tag}: ${this.module}.${this.method}${this.pathOrDescriptor!==void 0?` (${this.pathOrDescriptor})`:""}${this.description?`: ${this.description}`:""}`}},qm=class extends hr("PlatformError"){constructor(t){"cause"in t?super({reason:t,cause:t.cause}):super({reason:t})}[o1]=o1;get message(){return this.reason.message}};var Gn=e=>new qm(new xS(e)),So=e=>new qm(new bo(e));var i1="~effect/Chunk";function s1(e,t,n,r,o){for(let s=t;s<Math.min(e.length,t+o);s++)n[r+s-t]=e[s];return n}var c1=[],bS=e=>Qt((t,n)=>{if(t.length!==n.length)return!1;let r=Ha(t),o=Ha(n);for(let s=0;s<r.length;s++)if(!e(r[s],o[s]))return!1;return!0}),xH=bS(Q),yH={[i1]:{_A:e=>e},toString(){return`Chunk(${M(Ha(this))})`},toJSON(){return{_id:"Chunk",values:Lt(Ha(this))}},[Ee](){return this.toJSON()},[se](e){return Wm(e)&&xH(this,e)},[oe](){return Vr(Ha(this))},[Symbol.iterator](){switch(this.backing._tag){case"IArray":return this.backing.array[Symbol.iterator]();case"IEmpty":return c1[Symbol.iterator]();default:return Ha(this)[Symbol.iterator]()}},pipe(){return re(this,arguments)}},SS=e=>{let t=Object.create(yH);switch(t.backing=e,e._tag){case"IEmpty":{t.length=0,t.depth=0,t.left=t,t.right=t;break}case"IConcat":{t.length=e.left.length+e.right.length,t.depth=1+Math.max(e.left.depth,e.right.depth),t.left=e.left,t.right=e.right;break}case"IArray":{t.length=e.array.length,t.depth=0,t.left=Yo,t.right=Yo;break}case"ISingleton":{t.length=1,t.depth=0,t.left=Yo,t.right=Yo;break}case"ISlice":{t.length=e.length,t.depth=0,t.left=Yo,t.right=Yo;break}}return t},Wm=e=>_(e,i1),Yo=SS({_tag:"IEmpty"}),bH=()=>Yo;var SH=e=>SS({_tag:"ISingleton",a:e}),ES=e=>Wm(e)?e:vH(Yt(e)),yS=(e,t,n)=>{switch(e.backing._tag){case"IArray":{s1(e.backing.array,0,t,n,e.length);break}case"IConcat":{yS(e.left,t,n),yS(e.right,t,n+e.left.length);break}case"ISingleton":{t[n]=e.backing.a;break}case"ISlice":{s1(Ha(e.backing.chunk),e.backing.offset,t,n,e.length);break}}};var EH=e=>{switch(e.backing._tag){case"IEmpty":return c1;case"IArray":return e.backing.array;default:{let t=new Array(e.length);return yS(e,t,0),e.backing={_tag:"IArray",array:t},e.left=Yo,e.right=Yo,e.depth=0,t}}},Ha=EH;var vH=e=>e.length===0?bH():e.length===1?SH(e[0]):SS({_tag:"IArray",array:e});var u1=e=>e.length;var l1=Vp;var f1=BA;var p1=fm;var h1="~effect/MutableRef",wH={[h1]:h1,...Jt,toJSON(){return{_id:"MutableRef",current:Lt(this.current)}}},g1=e=>{let t=Object.create(wH);return t.current=e,t};var kH=Symbol.for("effect/MutableList/Empty"),b1=()=>({head:void 0,tail:void 0,length:0}),S1=e=>{let t=e.head;t.offset>=1024&&t===e.tail&&t.mutable&&(t.array.length-t.offset)*8<=t.offset&&(e.head=e.tail={array:t.array.slice(t.offset),mutable:!0,offset:0,next:void 0})},y1=()=>({array:[],mutable:!0,offset:0,next:void 0}),Fc=(e,t)=>{e.tail?e.tail.mutable||(e.tail.next=y1(),e.tail=e.tail.next):e.head=e.tail=y1(),e.tail.array.push(t),e.length++};var Pc=e=>{e.head=e.tail=void 0,e.length=0},E1=(e,t)=>{if(t=dl(t),t<=0||!e.head)return[];if(t=Math.min(t,e.length),t===e.length&&e.head?.offset===0&&!e.head.next){let s=e.head.array;return Pc(e),s}let n=new Array(t),r=0,o=e.head;for(;o;){for(;o.offset<o.array.length;)if(n[r++]=o.array[o.offset],o.mutable&&(o.array[o.offset]=void 0),o.offset++,r===t)return e.head=o.offset===o.array.length&&o.next?o.next:o,e.length-=t,e.length===0?Pc(e):S1(e),n;o=o.next}return Pc(e),n};var wS=e=>{if(!e.head)return kH;let t=e.head.array[e.head.offset];return e.head.mutable&&(e.head.array[e.head.offset]=void 0),e.head.offset++,e.length--,e.head.offset===e.head.array.length?e.head.next?e.head=e.head.next:Pc(e):S1(e),t};var IH="~effect/Queue",CH="~effect/Queue/Enqueue",TH="~effect/Queue/Dequeue";var kS={_A:F,_E:F},AH={[IH]:kS,[CH]:kS,[TH]:kS,...Jt,toJSON(){return{_id:"effect/Queue",state:this.state._tag,size:_H(this)}}},Rc=e=>te(t=>{let n=Object.create(AH);return n.dispatcher=t.currentDispatcher,n.capacity=e?.capacity??Number.POSITIVE_INFINITY,n.strategy=e?.strategy??"suspend",n.messages=b1(),n.scheduleRunning=!1,n.state={_tag:"Open",takers:new Set,offers:new Set,awaiters:new Set},U(n)}),w1=e=>Rc({capacity:e});var df=h(2,(e,t)=>ee(()=>Va(e,t)?Hm:e.state._tag==="Open"&&e.strategy==="suspend"?MH(e,t):A1)),Va=(e,t)=>e.state._tag!=="Open"?!1:e.messages.length>=e.capacity?e.strategy==="sliding"?(wS(e.messages),Fc(e.messages,t),!0):e.capacity<=0&&e.state.takers.size>0?(Fc(e.messages,t),O1(e),!0):!1:(Fc(e.messages,t),_1(e),!0);var pf=h(2,(e,t)=>W(()=>mf(e,t))),mf=(e,t)=>{if(e.state._tag!=="Open")return!1;let n=Zt(t),r=kT(n,PH);return e.state.offers.size===0&&e.messages.length===0?(Vm(e,r),!0):(e.state={...e.state,_tag:"Closing",exit:r},_1(e),!0)};var Xo=e=>mf(e,sl($i()));var CS=e=>W(()=>OH(e)),OH=e=>{if(e.state._tag==="Done")return!1;Pc(e.messages);let t=e.state.offers;Vm(e,e.state._tag==="Open"?FH:e.state.exit);for(let n of t)F1(n);return!0};var k1=e=>I1(e,1,Number.POSITIVE_INFINITY);var I1=h(3,(e,t,n)=>(t=dl(t),n=dl(n),ee(()=>RH(e,t,n)??so(P1(e,()=>TS(e,t)),I1(e,t,n))))),es=e=>ee(()=>T1(e)??so(P1(e,()=>TS(e,1)),es(e))),C1=e=>ee(()=>{let t=T1(e);return t===void 0?U(A()):t._tag==="Success"?U(R(t.value)):U(A())});var T1=e=>{if(e.state._tag==="Done")return e.state.exit;if(e.messages.length>0){let t=wS(e.messages);return IS(e),Oe(t)}else if(e.capacity<=0&&e.state.offers.size>0){let t=R1(e.state.offers);return IS(e),Oe(t)}};var _H=e=>e.state._tag==="Done"?0:e.messages.length;var A1=Oe(!1),Hm=Oe(!0),PH=nr($i()),FH=Cl(),O1=e=>{if(!(e.state._tag==="Done"||e.state.takers.size===0)){for(let t of e.state.takers)if(t.ready()&&(e.state.takers.delete(t),t.resume(an),e.messages.length===0))break}},_1=e=>{e.scheduleRunning||e.state._tag==="Done"||e.state.takers.size===0||(e.scheduleRunning=!0,e.dispatcher.scheduleTask(()=>{e.scheduleRunning=!1,O1(e)},0))},RH=(e,t,n)=>{if(e.state._tag==="Done")return e.state.exit;if(n<=0||t<=0)return Oe([]);if(!TS(e,t))return;let r=e.messages.length>0?E1(e.messages,n):[R1(e.state.offers)];return IS(e),Oe(r)},TS=(e,t)=>e.messages.length>=(e.state._tag==="Closing"?1:Math.min(t,e.capacity||1))||e.capacity<=0&&e.state._tag!=="Done"&&e.state.offers.size>0,P1=(e,t)=>Mt(n=>{if(e.state._tag==="Done")return n(e.state.exit);if(t())return n(an);let r={ready:t,resume:n};return e.state.takers.add(r),W(()=>{e.state._tag!=="Done"&&e.state.takers.delete(r)})}),MH=(e,t)=>Mt(n=>Va(e,t)?n(Hm):NH(e,{_tag:"Single",message:t,resume:n})),NH=(e,t)=>{if(e.state._tag!=="Open")return F1(t);let n=e.state.offers;return n.add(t),W(()=>{e.state._tag!=="Done"&&(n.delete(t),e.state._tag==="Closing"&&n.size===0&&e.messages.length===0&&Vm(e,e.state.exit))})},F1=e=>e._tag==="Single"?e.resume(A1):e.resume(Oe(e.remaining.slice(e.offset))),R1=e=>{let t=e.values().next().value;if(t._tag==="Single")return e.delete(t),t.resume(Hm),t.message;let n=t.remaining[t.offset++];return t.offset===t.remaining.length&&(e.delete(t),t.resume(Oe([]))),n},IS=e=>{if(e.state._tag==="Done")return Kl(e.state.exit.cause);if(e.state.offers.size===0)return e.state._tag==="Closing"&&e.messages.length===0?(Vm(e,e.state.exit),Kl(e.state.exit.cause)):!1;for(let t of e.state.offers){let n=e.capacity-e.messages.length;if(n<=0)break;if(t._tag==="Single")Fc(e.messages,t.message),e.state.offers.delete(t),t.resume(Hm);else{for(;t.offset<t.remaining.length;t.offset++){if(n===0)return!1;Fc(e.messages,t.remaining[t.offset]),n--}e.state.offers.delete(t),t.resume(Oe([]))}}return!1};var Vm=(e,t)=>{if(e.state._tag==="Done")return;let n=e.state;e.state={_tag:"Done",exit:t};for(let r of n.takers)r.resume(t);n.takers.clear();for(let r of n.awaiters)r(t);n.awaiters.clear()};var N1=e=>new AS(e),M1=(e,t,n)=>Mt(r=>{if(e.free>=t)return r(n);let o=()=>{e.free<t||(e.waiters.delete(o),r(n))};return e.waiters.add(o),W(()=>{e.waiters.delete(o)})}),AS=class{waiters=new Set;taken=0;permits;constructor(t){this.permits=t}get free(){return this.permits-this.taken}take(t){let n=ee(()=>this.free<t?M1(this,t,n):(this.taken+=t,U(t)));return n}takeIfAvailable(t){return ee(()=>this.free<t?U(!1):(this.taken+=t,U(!0)))}releaseUnsafe(t,n){return this.taken-=n,this.waiters.size>0&&t.currentDispatcher.scheduleTask(()=>{for(let r of this.waiters){if(this.free<=0)break;r()}},0),this.free}resize(t){return te(n=>(this.permits=t,this.free<0?ue:(this.releaseUnsafe(n,0),ue)))}release(t){return te(n=>U(this.releaseUnsafe(n,t)))}get releaseAll(){return te(t=>U(this.releaseUnsafe(t,this.taken)))}withPermits(t){return n=>xr(r=>{let o=ee(()=>{if(this.free<t){let s=M1(this,t,ue);return V(r(s),()=>o)}return this.taken+=t,ao(r(n),()=>{this.releaseUnsafe(Fs(),t)},!0)});return o})}withPermit=this.withPermits(1);withPermitsIfAvailable(t){return n=>xr(r=>this.free<t?Fa:(this.taken+=t,ao(r(ac(n)),()=>{this.releaseUnsafe(Fs(),t)},!0)))}};var $1="~effect/Channel",U1=e=>_(e,$1),UH={[$1]:{_Env:F,_InErr:F,_InElem:F,_OutErr:F,_OutElem:F},pipe(){return re(this,arguments)}},cn=e=>{let t=Object.create(UH);return t.transform=(n,r)=>Vn(e(n,r),o=>b(Ec(o))),t},L1=(e,t)=>cn((n,r)=>q(vr(e)(n,r),o=>t(o,r))),gf=e=>cn((t,n)=>e),B1=e=>cn(B(function*(t,n){let r=Us(n),o=a=>or(r,zb(a)),s=yield*Ic(e(t,n,r),o);return Ic(s,o)})),vr=e=>e.transform;var $H=(e,t,n)=>Rc({capacity:n?.bufferSize,strategy:n?.strategy}).pipe(vc(r=>Ll(e,CS(r))),vc(r=>Tc($l(t(r),e),e)));var j1=(e,t)=>cn((n,r)=>ne($H(r,e,t),k1)),z1=e=>cn((t,n)=>ke(()=>vr(e())(t,n)));var q1=gf(b(Ot()));var W1=e=>gf(b(I(e)));var H1=h(2,(e,t)=>L1(e,n=>pe(()=>{let r=0;return ne(n,o=>t(o,r++))}))),OS=h(2,(e,t)=>LH(e,n=>b(t(n)))),LH=h(2,(e,t)=>L1(e,n=>b(Hn(n,r=>q(t(r),Ot)))));var V1=h(e=>U1(e[0])&&U1(e[1]),(e,t,n)=>B1(B(function*(r,o,s){let a=n?.haltStrategy??"both",i=yield*w1(0);yield*Ll(s,CS(i));let c=0;function u(f,d){if(c++,!Kl(d))return pf(i,d);switch(a){case"both":return c===2?pf(i,d):ye;case"left":case"right":return f===a?pf(i,d):ye;case"either":return pf(i,d)}}let l=(f,d,m)=>vr(d)(r,m).pipe(q(g=>g.pipe(q(x=>df(i,x)),ho)),Ic(g=>fo(or(m,zb(g)),u(f,g))),Tc(s));return yield*l("left",e,Us(s)),yield*l("right",t,Us(s)),es(i)})));var G1=()=>cn((e,t)=>pe(()=>{let n="",r=!1,o=A();function s(c){let u=[];function l(f){n.length===0?u.push(f):(u.push(n+f),n="")}for(let f=0;f<c.length;f++){let d=c[f];if(d.length!==0){let m=0,g=d.indexOf("\r"),x=d.indexOf(`
`);for(r&&(x===0&&(m=1,x=d.indexOf(`
`,m)),r=!1);g!==-1||x!==-1;)g===-1||x!==-1&&x<g?(l(d.substring(m,x)),m=x+1,x=d.indexOf(`
`,m)):(l(d.substring(m,g)),d.length===g+1?(r=!0,m=d.length,g=-1):(m=g+(x===g+1?2:1),g=d.indexOf("\r",m),x=d.indexOf(`
`,m)));n=n+d.substring(m)}}return _s(u)?u:null}let a=ke(()=>o._tag==="Some"?Ot(o.value):Am(e,{onSuccess:i,onFailure:Ec,onDone:c=>{if(o=R(c),n.length>0){let u=n;return n="",r=!1,b([u])}return Ot(c)}}));function i(c){let u=s(c);return u!==null?b(u):a}return a}));var K1=h(2,(e,t)=>cn((n,r)=>q(vr(e)(n,r),o=>vr(t)(o,r))));var Gm=e=>cn((t,n)=>{let r;return b(ke(()=>r||e.pipe($l(n),q(o=>vr(o)(t,n)),q(o=>r=o))))});var BH=(e,t,n)=>ke(()=>{let r=pc(),o=vr(e)(Ot(),r);return Hn(q(o,t),n||b).pipe(Qo(s=>or(r,s)))});var _S=h(3,(e,t,n)=>ke(()=>{let r=t();return BH(e,o=>bc({while:Fn,body:()=>o,step:s=>{r=n(r,s)}}),()=>b(r))}));var PS=(e,t)=>vr(e)(Ot(),t);var jH="~effect/Stream",zH={_R:F,_E:F,_A:F},J1=function(e){this.channel=e};J1.prototype={[jH]:zH,pipe(){return re(this,arguments)}};var Z1=e=>new J1(e);var Q1="~effect/Sink",Y1=b([void 0]),WH={_A:F,_In:F,_L:F,_E:F,_R:F},HH={[Q1]:WH,pipe(){return re(this,arguments)}},yf=e=>_(e,Q1),FS=e=>Km((t,n)=>vr(e)(t,n).pipe(q(ho({disableYield:!0})),Hn(b)));var Km=e=>{let t=Object.create(HH);return t.transform=e,t},VH=e=>cn((t,n)=>b(q(e.transform(t,n),Ot)));var GH=e=>Km(()=>e);var X1=e=>GH(I(e));var bf=Km(e=>Hn(ho(e,{disableYield:!0}),()=>Y1));var eP=e=>KH(ja(t=>e(t),{discard:!0})),KH=e=>Km(t=>t.pipe(q(e),ho({disableYield:!0}),Hn(()=>Y1)));var tP=e=>FS(Gm(ne(e,VH)));var JH="~effect/RcRef",RS={_tag:"Empty"},ZH={_tag:"Closed"},QH={_A:F,_E:F},MS=class{[JH]=QH;pipe(){return re(this,arguments)}state=RS;semaphore=N1(1);acquire;context;scope;idleTimeToLive;constructor(t,n,r,o){this.acquire=t,this.context=n,this.scope=r,this.idleTimeToLive=o}},nP=e=>Xl(t=>{let n=t.context,r=rt(n,Ul),o=new MS(e.acquire,n,r,e.idleTimeToLive!==void 0?Rt(e.idleTimeToLive):void 0);return En(mm(r,()=>{let s=o.state._tag==="Acquired"?or(o.state.scope,Sr):ye;return o.state=ZH,s}),o)}),rP=(e,t)=>{switch(e.state._tag){case"Closed":return qa;case"Acquired":{let n=e.state;return n.refCount++,n.fiber?En(l1(n.fiber),n):b(n)}case"Empty":return e.semaphore.withPermit(ke(()=>{if(e.state._tag!=="Empty")return rP(e,t);let n=pc();return t(Zo(e.acquire,Xt(e.context,Ul,n))).pipe(q(r=>{if(e.state._tag==="Closed")return qa;let o={_tag:"Acquired",value:r,scope:n,fiber:void 0,refCount:1,invalidated:!1};return e.state=o,b(o)}),Qo(r=>Dl(r)?or(n,r):ye))}))}},oP=e=>{let t=e;return Cc(n=>q(nf,r=>q(rP(t,n),o=>En(mm(r,()=>YH(t,o)),o.value))))},YH=(e,t)=>{if(t.refCount--,t.refCount>0)return ye;let n=e.idleTimeToLive;return n===void 0||t.invalidated?(e.state===t&&(e.state=RS),or(t.scope,Sr)):Ap(n)?(t.fiber=Cc(r=>q(r(Mm(n)),()=>e.state===t&&t.refCount===0?(e.state=RS,or(t.scope,Sr)):ye)).pipe(kc(pe(()=>{t.fiber=void 0})),of(e.context),f1(e.scope)),ye):ye};var sP=nP,NS=oP;var t4="~effect/Stream",Ga=e=>_(e,t4);var cr=Z1;var iP=e=>cr(gf(e)),n4=(e,t)=>cr(cn((n,r)=>q(PS(e.channel,r),o=>t(o,r))));var DS=e=>e.channel,cP=(e,t)=>cr(j1(e,t)),Mc=cr(q1);var uP=e=>cr(z1(()=>e().channel)),US=e=>cr(W1(e));var Ws=e=>cr(Gm(ne(e,DS)));var r4=h(2,(e,t)=>uP(()=>{let n=0;return cr(H1(e.channel,At(r=>t(r,n++))))}));var lP=h(e=>Ga(e[0])&&Ga(e[1]),(e,t,n)=>cr(V1(DS(e),DS(t),n)));var Zm=h(2,(e,t)=>n4(e,(n,r)=>pe(()=>{let o,s,a=ke(()=>{if(s!==void 0){let c=s;return s=void 0,b(c)}return n}).pipe(Er(c=>(o=br(c),Ot()))),i=ne(ke(()=>t.transform(a,r)),([c,u])=>(s=u,ka(c)));return ke(()=>o||i)})));var fP=h(e=>Ga(e[0]),(e,t)=>uP(()=>{let n=new TextDecoder(t?.encoding);return r4(e,r=>n.decode(r,{stream:!0}))}));var dP=e=>e.channel.pipe(K1(G1()),cr);var $S=h(2,(e,t)=>lS(n=>PS(e.channel,n).pipe(q(r=>t.transform(r,n)),ne(([r])=>r)))),pP=e=>_S(e.channel,()=>[],(t,n)=>{for(let r=0;r<n.length;r++)t.push(n[r]);return t});var mP=e=>_S(e.channel,()=>"",(t,n)=>t+n.join(""));var Qm="~effect/FileSystem",wr=Je("effect/FileSystem"),LS=e=>wr.of({...e,[Qm]:Qm,exists:t=>Wr(e.access(t),En(!0),Jo("PlatformError",n=>n.reason._tag==="NotFound"?b(!1):I(n))),readFileString:(t,n)=>q(e.readFile(t),r=>lt({try:()=>new TextDecoder(n).decode(r),catch:o=>So({module:"FileSystem",method:"readFileString",description:"invalid encoding",cause:o})})),stream:B(function*(t,n){let r=yield*e.open(t,{flag:"r"}),o=n?.offset===void 0?void 0:cf(n.offset);o&&(yield*r.seek(o,"start"));let s=n?.bytesToRead===void 0?void 0:cf(n.bytesToRead),a=BigInt(0),i=Number(BigInt(n?.chunkSize??64*1024)),c=r.readAlloc(i);return iP(b(q(ke(()=>s!==void 0&&s<=a?Ot():s!==void 0&&s-a<i?r.readAlloc(Number(s-a)):c),_e({onNone:()=>Ot(),onSome:u=>(a+=BigInt(u.length),b(ka(u)))}))))},Ws),sink:(t,n)=>Wr(e.open(t,{...n,flag:n?.flag??"w"}),ne(r=>eP(o=>r.writeAll(o))),tP),writeFileString:(t,n,r)=>q(lt({try:()=>new TextEncoder().encode(n),catch:o=>So({module:"FileSystem",method:"writeFileString",description:"could not encode string",cause:o})}),o=>e.writeFile(t,o,r))}),ft=(e,t)=>Gn({module:"FileSystem",method:e,_tag:"NotFound",description:"No such file or directory",pathOrDescriptor:t}),hP=e=>wr.of({[Qm]:Qm,access(t){return I(ft("access",t))},chmod(t){return I(ft("chmod",t))},chown(t){return I(ft("chown",t))},copy(t){return I(ft("copy",t))},copyFile(t){return I(ft("copyFile",t))},glob(t){return I(ft("glob",t))},exists(){return b(!1)},link(t){return I(ft("link",t))},makeDirectory(){return jt("not implemented")},makeTempDirectory(){return jt("not implemented")},makeTempDirectoryScoped(){return jt("not implemented")},makeTempFile(){return jt("not implemented")},makeTempFileScoped(){return jt("not implemented")},open(t){return I(ft("open",t))},readDirectory(t){return I(ft("readDirectory",t))},readFile(t){return I(ft("readFile",t))},readFileString(t){return I(ft("readFileString",t))},readLink(t){return I(ft("readLink",t))},realPath(t){return I(ft("realPath",t))},remove(){return ye},rename(t){return I(ft("rename",t))},sink(t){return X1(ft("sink",t))},stat(t){return I(ft("stat",t))},stream(t){return US(ft("stream",t))},symlink(t){return I(ft("symlink",t))},truncate(t){return I(ft("truncate",t))},utimes(t){return I(ft("utimes",t))},watch(t){return US(ft("watch",t))},writeFile(t){return I(ft("writeFile",t))},writeFileString(t){return I(ft("writeFileString",t))},...e}),o4=e=>sr(wr)(hP(e)),Dc="~effect/FileSystem/File",s4=e=>_(e,Dc),Sf=class extends Je()("effect/FileSystem/WatchBackend"){};var Uc={};qr(Uc,{Path:()=>ur,TypeId:()=>Eo,layer:()=>g4});var Eo="~effect/Path",ur=Je("effect/Path");function gP(e,t){let n="",r=0,o=-1,s=0,a;for(let i=0;i<=e.length;++i){if(i<e.length)a=e.charCodeAt(i);else{if(a===47)break;a=47}if(a===47){if(!(o===i-1||s===1))if(o!==i-1&&s===2){if(n.length<2||r!==2||n.charCodeAt(n.length-1)!==46||n.charCodeAt(n.length-2)!==46){if(n.length>2){let c=n.lastIndexOf("/");if(c!==n.length-1){c===-1?(n="",r=0):(n=n.slice(0,c),r=n.length-1-n.lastIndexOf("/")),o=i,s=0;continue}}else if(n.length===2||n.length===1){n="",r=0,o=i,s=0;continue}}t&&(n.length>0?n+="/..":n="..",r=2)}else n.length>0?n+="/"+e.slice(o+1,i):n=e.slice(o+1,i),r=i-o-1;o=i,s=0}else a===46&&s!==-1?++s:s=-1}return n}function a4(e,t){let n=t.dir||t.root,r=t.base||(t.name||"")+(t.ext||"");return n?n===t.root?n+r:n+e+r:r}function i4(e){if(e.protocol!=="file:")return I(new bo({module:"Path",method:"fromFileUrl",description:"URL must be of scheme file"}));if(e.hostname!=="")return I(new bo({module:"Path",method:"fromFileUrl",description:"Invalid file URL host"}));let t=e.pathname;for(let n=0;n<t.length;n++)if(t[n]==="%"){let r=t.codePointAt(n+2)|32;if(t[n+1]==="2"&&r===102)return I(new bo({module:"Path",method:"fromFileUrl",description:"must not include encoded / characters"}))}return b(decodeURIComponent(t))}var xP=function(){let t="",n=!1,r;for(let o=arguments.length-1;o>=-1&&!n;o--){let s;if(o>=0)s=arguments[o];else{let a=globalThis.process;r===void 0&&"process"in globalThis&&typeof a=="object"&&a!==null&&typeof a.cwd=="function"&&(r=a.cwd()),s=r}s.length!==0&&(t=s+"/"+t,n=s.charCodeAt(0)===47)}return t=gP(t,!n),n?t.length>0?"/"+t:"/":t.length>0?t:"."},c4=47;function u4(e){let t=new URL("file://"),n=xP(e);return e.charCodeAt(e.length-1)===c4&&n[n.length-1]!=="/"&&(n+="/"),t.pathname=h4(n),b(t)}var l4=/%/g,f4=/\\/g,d4=/\n/g,p4=/\r/g,m4=/\t/g;function h4(e){return e.includes("%")&&(e=e.replace(l4,"%25")),e.includes("\\")&&(e=e.replace(f4,"%5C")),e.includes(`
`)&&(e=e.replace(d4,"%0A")),e.includes("\r")&&(e=e.replace(p4,"%0D")),e.includes("	")&&(e=e.replace(m4,"%09")),e}var Ym=ur.of({[Eo]:Eo,resolve:xP,normalize(e){if(e.length===0)return".";let t=e.charCodeAt(0)===47,n=e.charCodeAt(e.length-1)===47;return e=gP(e,!t),e.length===0&&!t&&(e="."),e.length>0&&n&&(e+="/"),t?"/"+e:e},isAbsolute(e){return e.length>0&&e.charCodeAt(0)===47},join(){if(arguments.length===0)return".";let e;for(let t=0;t<arguments.length;++t){let n=arguments[t];n.length>0&&(e===void 0?e=n:e+="/"+n)}return e===void 0?".":Ym.normalize(e)},relative(e,t){if(e===t||(e=Ym.resolve(e),t=Ym.resolve(t),e===t))return"";let n=1;for(;n<e.length&&e.charCodeAt(n)===47;++n);let r=e.length,o=r-n,s=1;for(;s<t.length&&t.charCodeAt(s)===47;++s);let i=t.length-s,c=o<i?o:i,u=-1,l=0;for(;l<=c;++l){if(l===c){if(i>c){if(t.charCodeAt(s+l)===47)return t.slice(s+l+1);if(l===0)return t.slice(s+l)}else o>c&&(e.charCodeAt(n+l)===47?u=l:l===0&&(u=0));break}let d=e.charCodeAt(n+l),m=t.charCodeAt(s+l);if(d!==m)break;d===47&&(u=l)}let f="";for(l=n+u+1;l<=r;++l)(l===r||e.charCodeAt(l)===47)&&(f.length===0?f+="..":f+="/..");return f.length>0?f+t.slice(s+u):(s+=u,t.charCodeAt(s)===47&&++s,t.slice(s))},dirname(e){if(e.length===0)return".";let t=e.charCodeAt(0),n=t===47,r=-1,o=!0;for(let s=e.length-1;s>=1;--s)if(t=e.charCodeAt(s),t===47){if(!o){r=s;break}}else o=!1;return r===-1?n?"/":".":n&&r===1?"//":e.slice(0,r)},basename(e,t){let n=0,r=-1,o=!0,s;if(t!==void 0&&t.length>0&&t.length<=e.length){if(t.length===e.length&&t===e)return"";let a=t.length-1,i=-1;for(s=e.length-1;s>=0;--s){let c=e.charCodeAt(s);if(c===47){if(!o){n=s+1;break}}else i===-1&&(o=!1,i=s+1),a>=0&&(c===t.charCodeAt(a)?--a===-1&&(r=s):(a=-1,r=i))}return n===r?r=i:r===-1&&(r=e.length),e.slice(n,r)}else{for(s=e.length-1;s>=0;--s)if(e.charCodeAt(s)===47){if(!o){n=s+1;break}}else r===-1&&(o=!1,r=s+1);return r===-1?"":e.slice(n,r)}},extname(e){let t=-1,n=0,r=-1,o=!0,s=0;for(let a=e.length-1;a>=0;--a){let i=e.charCodeAt(a);if(i===47){if(!o){n=a+1;break}continue}r===-1&&(o=!1,r=a+1),i===46?t===-1?t=a:s!==1&&(s=1):t!==-1&&(s=-1)}return t===-1||r===-1||s===0||s===1&&t===r-1&&t===n+1?"":e.slice(t,r)},format:function(t){if(t===null||typeof t!="object")throw new TypeError('The "pathObject" argument must be of type Object. Received type '+typeof t);return a4("/",t)},parse(e){let t={root:"",dir:"",base:"",ext:"",name:""};if(e.length===0)return t;let n=e.charCodeAt(0),r=n===47,o;r?(t.root="/",o=1):o=0;let s=-1,a=0,i=-1,c=!0,u=e.length-1,l=0;for(;u>=o;--u){if(n=e.charCodeAt(u),n===47){if(!c){a=u+1;break}continue}i===-1&&(c=!1,i=u+1),n===46?s===-1?s=u:l!==1&&(l=1):s!==-1&&(l=-1)}return s===-1||i===-1||l===0||l===1&&s===i-1&&s===a+1?i!==-1&&(a===0&&r?t.base=t.name=e.slice(1,i):t.base=t.name=e.slice(a,i)):(a===0&&r?(t.name=e.slice(1,s),t.base=e.slice(1,i)):(t.name=e.slice(a,s),t.base=e.slice(a,i)),t.ext=e.slice(s,i)),a>0?t.dir=e.slice(0,a-1):r&&(t.dir="/"),t},sep:"/",fromFileUrl:i4,toFileUrl:u4,toNamespacedPath:F}),g4=sr(ur)(Ym);function ts(e){return e.checks?e.checks[e.checks.length-1].annotations:e.annotations}function Xm(e){return t=>ts(t)?.[e]}var vn="~structural",Ja="~identifier",Ef="~sentinels",eh="~constructor",yP=["title","description","default","examples","readOnly","writeOnly","format","contentEncoding","contentMediaType","contentSchema"],$c=Xm("identifier"),BS=Xm(Ja),jS=Xm("title");var vf=dr(e=>{let t=ts(e)?.identifier;return typeof t=="string"?t:e.getExpected(vf)}),bP=new Set([Ef,vn,"representation","arbitraryConstraint","toJsonSchema","toCode","toEquivalence","toFormatter","toCodec","toCodecJson","toCodecStringTree","toCodecIso","toCodecArbitrary"]);var me=Symbol();var qt=Ko,wn=qt(me),je=qt(me),wf=e=>e===me?A():R(e),zS=e=>e._tag==="None"?wn:qt(e.value);var Cf="~effect/SchemaIssue/Issue";function WS(e){return _(e,Cf)&&e[Cf]===Cf}function x4(e){return Object.hasOwn(e,"input")}var Kn=class{[Cf]=Cf;constructor(t,n){n?.reportInput===!0&&t!==me&&(this.input=t)}},SP=class extends Kn{_tag="Filter";filter;issue;constructor(e,t,n,r){super(n,r),this.filter=e,this.issue=t}},EP=class extends Kn{_tag="Encoding";ast;issue;constructor(e,t,n,r){super(n,r),this.ast=e,this.issue=t}},It=class extends Kn{_tag="Pointer";path;issue;constructor(e,t){super(),this.path=e,this.issue=t}},Gs=class extends Kn{_tag="MissingKey";annotations;constructor(e){super(),this.annotations=e}},HS=class extends Kn{_tag="UnexpectedKey";ast;constructor(e,t,n){super(t,n),this.ast=e}},Ct=class extends Kn{_tag="Composite";ast;issues;constructor(e,t,n,r){super(n,r),this.ast=e,this.issues=t}},dt=class extends Kn{_tag="InvalidType";ast;constructor(e,t,n){super(t,n),this.ast=e}},de=class extends Kn{_tag="InvalidValue";annotations;constructor(e,t,n){super(t,n),this.annotations=e}};function kn(e,t,n,r,o){return new Ct(e,[new It([t],n)],r,o)}var Tf=class extends Kn{_tag="Forbidden";annotations;constructor(e,t,n){super(t,n),this.annotations=e}},Af=class extends Kn{_tag="AnyOf";ast;issues;constructor(e,t,n,r){super(n,r),this.ast=e,this.issues=t}},vP=class extends Kn{_tag="OneOf";ast;successes;constructor(e,t,n,r){super(n,r),this.ast=e,this.successes=t}};function qS(e,t,n){if(WS(e))return e;if(typeof e=="string")return new de({message:e},t,n);let r=typeof e.issue=="string"?new de({message:e.issue},t,n):e.issue;return new It(e.path,r)}function wP(e,t,n){if(e!==void 0)return typeof e=="boolean"?e?void 0:new de(void 0,t,n):qS(e,t,n)}function kP(e,t,n,r){return Array.isArray(t)?_s(t)?t.length===1?qS(t[0],n,r):new Ct(e,At(t,o=>qS(o,n,r)),n,r):void 0:wP(t,n,r)}var IP=e=>{let t=Bc(e);if(t!==void 0)return t;switch(e._tag){case"InvalidType":return Vs(vf(e.ast),e);case"InvalidValue":{let n=VS(e);if(n!==void 0)return Vs(n,e);let r=th(e);return r===void 0?"Expected a valid value":`Invalid data ${r}`}case"MissingKey":return"Missing key";case"UnexpectedKey":{let n=th(e);return n===void 0?"Expected no excess property":`Unexpected key with value ${n}`}case"Forbidden":return"Forbidden operation";case"OneOf":{let n=th(e);return n===void 0?"Expected exactly one member to match":`Expected exactly one member to match the input ${n}`}}},CP=e=>Bc(e.issue)??Bc(e);function TP(e){return t=>({issues:Lc(t,[],e?.leafHook??IP,e?.checkHook??CP)})}function th(e){return x4(e)?M(e.input):void 0}function VS(e){let t=e.annotations?.expected;return typeof t=="string"?t:void 0}function Vs(e,t){let n=th(t);return n===void 0?`Expected ${e}`:`Expected ${e}, got ${n}`}function Lc(e,t,n,r){switch(e._tag){case"Filter":{let o=r(e);if(o!==void 0)return[{path:t,message:o}];if(e.issue._tag!=="InvalidValue")return Lc(e.issue,t,n,r);let s=VS(e.issue);return[{path:t,message:s===void 0?Vs(GS(e.filter),e):Vs(s,e.issue)}]}case"Encoding":return Lc(e.issue,t,n,r);case"Pointer":return Lc(e.issue,[...t,...e.path],n,r);case"Composite":return e.issues.flatMap(o=>Lc(o,t,n,r));case"AnyOf":return e.issues.length===0?[{path:t,message:Bc(e)??Vs(vf(e.ast),e)}]:e.issues.flatMap(o=>Lc(o,t,n,r));default:return[{path:t,message:n(e)}]}}function GS(e){let t=e.annotations?.expected;if(typeof t=="string")return t;switch(e._tag){case"Filter":return"<filter>";case"FilterGroup":return e.checks.map(n=>GS(n)).join(" & ")}}function y4(){return e=>If(e,"")}var AP=y4();function If(e,t){let n;switch(e._tag){case"Filter":{let r=CP(e);if(r!==void 0)n=r;else{if(e.issue._tag!=="InvalidValue")return If(e.issue,t);let o=VS(e.issue);n=o===void 0?Vs(GS(e.filter),e):Vs(o,e.issue)}break}case"Encoding":return If(e.issue,t);case"Pointer":return If(e.issue,t+Jd(e.path));case"Composite":case"AnyOf":{if(e._tag==="Composite"||e.issues.length>0)return e.issues.map(r=>If(r,t)).join(`
`);n=Bc(e)??Vs(vf(e.ast),e);break}default:n=IP(e);break}return t?`${n}
  at ${t}`:n}function Bc(e){if(e._tag==="Pointer")return;if(e._tag==="Encoding")return Bc(e.issue);let n=(e._tag==="Filter"?e.filter.annotations:"annotations"in e?e.annotations:e.ast.annotations)?.[e._tag==="MissingKey"?"messageMissingKey":e._tag==="UnexpectedKey"?"messageUnexpectedKey":"message"];if(typeof n=="string")return n}function Of(e){let t;for(let n of e.reasons){if(!ym(n)||!WS(n.error))return;t??=n.error}return t}function Jn(e,t){let n=Of(e);if(n===void 0)throw new Error(t,{cause:e});return n}var KS=gc,_P=$a,PP=HO,FP=VO,RP=GO,MP=Pb,NP=KO;var DP=Im;var UP=Fb;var JS=ZO,$P=QO;var ZS=YO;var QS=Rb,YS=Vl,LP=Mb;var BP=Nb,_f=XO;var jP=Gl;var zP=$b;var qP=t_;var XS=Bb;var jc=e=>b4(typeof e=="string"?S4.encode(e):e),Za=e=>{let t=v4(e),n=t.length;if(n%4!==0)return K(new rr({kind:"Decode",module:"Base64",input:t,message:`Length must be a multiple of 4, but is ${n}`}));let r=t.indexOf("=");if(r!==-1&&(r<n-2||r===n-2&&t[n-1]!=="="))return K(new rr({kind:"Decode",module:"Base64",input:t,message:"Found a '=' character, but it is not at the end"}));try{let o=t.endsWith("==")?2:t.endsWith("=")?1:0,s=new Uint8Array(3*(n/4)-o);for(let a=0,i=0;a<n;a+=4,i+=3){let c=nh(t.charCodeAt(a))<<18|nh(t.charCodeAt(a+1))<<12|nh(t.charCodeAt(a+2))<<6|nh(t.charCodeAt(a+3));s[i]=c>>16,s[i+1]=c>>8&255,s[i+2]=c&255}return $(s)}catch(o){return K(new rr({kind:"Decode",module:"Base64",input:t,message:o instanceof Error?o.message:"Invalid input"}))}},HP=e=>wt(Za(e),t=>E4.decode(t)),b4=e=>{let t=e.length,n="",r;for(r=2;r<t;r+=3)n+=kr[e[r-2]>>2],n+=kr[(e[r-2]&3)<<4|e[r-1]>>4],n+=kr[(e[r-1]&15)<<2|e[r]>>6],n+=kr[e[r]&63];return r===t+1&&(n+=kr[e[r-2]>>2],n+=kr[(e[r-2]&3)<<4],n+="=="),r===t&&(n+=kr[e[r-2]>>2],n+=kr[(e[r-2]&3)<<4|e[r-1]>>4],n+=kr[(e[r-1]&15)<<2],n+="="),n},S4=new TextEncoder,E4=new TextDecoder,v4=e=>e.replace(/[\n\r]/g,""),kr="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",Pf=new Uint8Array(123).fill(255);for(let e=0;e<kr.length;e++)Pf[kr.charCodeAt(e)]=e;Pf[61]=0;var nh=e=>{if(e>=Pf.length||Pf[e]===255)throw new TypeError(`Invalid character ${String.fromCharCode(e)}`);return Pf[e]};var VP=e=>jc(e).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_"),tE=e=>{let t=e.replace(/[\n\r]/g,""),n=t.length;if(n%4===1)return K(new rr({module:"Base64Url",kind:"Decode",input:t,message:`Length should be a multiple of 4, but is ${n}`}));if(!/^[-_A-Z0-9]*?={0,2}$/i.test(t))return K(new rr({module:"Base64Url",kind:"Decode",input:t,message:"Invalid input"}));let r=n%4===2?`${t}==`:n%4===3?`${t}=`:t;return r=r.replace(/-/g,"+").replace(/_/g,"/"),Za(r)},GP=e=>wt(tE(e),t=>w4.decode(t)),w4=new TextDecoder;var Ff=e=>Object.assign(Object.create(bx),e);function I4(e){return JP((t,n)=>I(e(t,n)))}function rh(e){return I4((t,n)=>{let r={message:e(t)};return $e(t)?new Tf(r,t.value,n):new Tf(r)})}var KP=rh(()=>"Encoding is not supported"),C4=Ff({_tag:"Passthrough"});function wo(){return C4}function le(e){return Ff({_tag:"Transform",transform:e})}function rn(e){return Ff({_tag:"TransformEffect",transform:e})}function oh(e){return Ff({_tag:"TransformOptional",transform:e})}function JP(e){return Ff({_tag:"TransformOptionalEffect",transform:e})}function nE(){return oh(()=>A())}function rE(e){return JP(t=>{let n=Wi(t,ct);return $e(n)?b(n):Wa(e,R)})}function Qa(){return le(globalThis.String)}function sh(){return le(globalThis.Number)}function ZP(){return le(globalThis.BigInt)}function oE(){return le(e=>new globalThis.Date(e))}function QP(){return le(a_)}function YP(e){return rn((t,n)=>lt({try:()=>JSON.parse(t,e?.reviver),catch:()=>new de({expected:"a valid JSON string"},t,n)}))}function XP(e){return rn((t,n)=>lt({try:()=>{let r=JSON.stringify(t,e?.replacer,e?.space);if(r===void 0)throw new TypeError("Value cannot be represented as JSON");return r},catch:()=>new de({expected:"a JSON-serializable value"},t,n)}))}function sE(){return le(jc)}function ah(){return le(VP)}function ih(){return le(wC)}function eF(){return rn((e,t)=>sf(ef(Za(e)),()=>new de({expected:"a valid Base64 string"},e,t)))}function tF(){return rn((e,t)=>on(HP(e),{onFailure:()=>I(new de({expected:"a valid Base64 string"},e,t)),onSuccess:b}))}function nF(){return rn((e,t)=>on(tE(e),{onFailure:()=>I(new de({expected:"a valid Base64Url string"},e,t)),onSuccess:b}))}function rF(){return rn((e,t)=>on(GP(e),{onFailure:()=>I(new de({expected:"a valid Base64Url string"},e,t)),onSuccess:b}))}function oF(){return rn((e,t)=>on(oy(e),{onFailure:()=>I(new de({expected:"a valid hexadecimal string"},e,t)),onSuccess:b}))}function sF(){return rn((e,t)=>on(kC(e),{onFailure:()=>I(new de({expected:"a valid hexadecimal string"},e,t)),onSuccess:b}))}function aF(){return le(encodeURIComponent)}function iF(){return rn((e,t)=>{try{return b(globalThis.decodeURIComponent(e))}catch{return I(new de({expected:"a valid URI component"},e,t))}})}function cF(){return le(e=>dF(Array.from(e.entries())))}var T4=pF(e=>typeof e=="string"||typeof Blob<"u"&&e instanceof Blob);function uF(){return le(e=>{let t=new FormData;return typeof e=="object"&&e!==null&&T4(e).forEach(([r,o])=>{t.append(r,o)}),t})}function lF(){return le(e=>dF(Array.from(e.entries())))}var A4=pF(pr);function fF(){return le(e=>typeof e=="object"&&e!==null?new URLSearchParams(A4(e)):new URLSearchParams)}function O4(e){if(e==="")return[""];let t=e.replace(/\[(.*?)\]/g,".$1"),n=t.split("."),r=t.startsWith(".")?1:0;return n.slice(r).map(o=>Hi(o)?globalThis.Number(o):o)}function dF(e){let t={},n=new WeakSet,r=new WeakSet;function o(s,a,i){let c=Object.hasOwn(s,a)?s[a]:void 0;if(n.has(c)&&Array.isArray(c)===i)return c;let u=i?[]:{};return n.add(u),N(s,a,u),u}return e.forEach(([s,a])=>{let i=O4(s),c=t;i.forEach((u,l)=>{let f=l===i.length-1;if(Array.isArray(c)&&u==="")if(f)c.push(a);else{let d=i[l+1],m=typeof d=="number"||d==="",g=c.length;c=o(c,g,m)}else if(f){let d=Object.hasOwn(c,u);if(d&&Array.isArray(c[u])&&(n.has(c[u])||r.has(c[u])))c[u].push(a);else if(d){let m=[c[u],a];r.add(m),N(c,u,m)}else N(c,u,a)}else{let d=i[l+1];c=o(c,u,typeof d=="number"||d==="")}})}),t}function pF(e){return t=>{let n=[];function r(o,s){if(e(s))n.push([o,s]);else if(Array.isArray(s))s.every(e)?s.forEach(i=>{n.push([o,i])}):s.forEach((i,c)=>{r(`${o}[${c}]`,i)});else if(typeof s=="object"&&s!==null)for(let[a,i]of Object.entries(s))r(`${o}[${a}]`,i)}for(let[o,s]of Object.entries(t))r(o,s);return n}}var mF=/^[+-]?\d+$/,iE="~effect/BigDecimal",_4={[iE]:iE,[oe](){let e=uE(this);return ce(Ie(String(e.value)),Et(e.scale))},[se](e){return cE(e)&&SF(this,e)===0},toString(){return`BigDecimal(${ns(this)})`},toJSON(){return{_id:"BigDecimal",value:String(this.value),scale:this.scale}},[Ee](){return this.toJSON()},pipe(){return re(this,arguments)}},cE=e=>_(e,iE),xF=(e,t)=>{if(!Number.isSafeInteger(t))throw new RangeError(`Scale must be a safe integer, got ${t}`);let n=Object.create(_4);return n.value=e,n.scale=t,n},yF=(e,t)=>{let n=xF(e,t);return n.normalized=n,n};var Ir=BigInt(0),P4=BigInt(1);var F4=BigInt(10),bF=yF(Ir,0);var uE=e=>{if(e.normalized===void 0)if(e.value===Ir)e.normalized=bF;else{let t=`${e.value}`,n=t.length;for(;t[n-1]==="0";)n--;e.normalized=yF(BigInt(t.slice(0,n)),e.scale-(t.length-n))}return e.normalized};var R4=100,M4=[P4],aE=(e,t)=>e===t?0:e<t?-1:1,hF=(e,t)=>{let n=`${e.value<Ir?-e.value:e.value}`,r=`${t.value<Ir?-t.value:t.value}`,o=BigInt(n.length-r.length)-BigInt(e.scale)+BigInt(t.scale);if(o!==Ir)return o<Ir?-1:1;let s=Math.max(n.length,r.length);return FI(n.padEnd(s,"0"),r.padEnd(s,"0"))},SF=(e,t)=>{if(e.scale===t.scale)return aE(e.value,t.value);let n=gF(e),r=gF(t);if(n!==r)return n<r?-1:1;if(n===0)return 0;let o=e.scale-t.scale,s=Math.abs(o);if(s>R4)return n===-1?hF(t,e):hF(e,t);let a=M4[s]??=F4**BigInt(s);return o>0?aE(e.value,t.value*a):aE(e.value*a,t.value)},zc=Li(SF);var gF=e=>e.value===Ir?0:e.value<Ir?-1:1;var EF=e=>{if(e==="")return R(bF);let t,n,r=e.search(/[eE]/);if(r!==-1){let c=e.slice(r+1);if(t=e.slice(0,r),n=Number(c),t===""||!Number.isSafeInteger(n)||!mF.test(c))return A()}else t=e,n=0;let o,s,a=t.search(/\./);if(a!==-1){let c=t.slice(0,a),u=t.slice(a+1);o=`${c}${u}`,s=u.length}else o=t,s=0;if(!mF.test(o))return A();let i=s-n;return Number.isSafeInteger(i)?R(xF(BigInt(o),i)):A()};var ns=e=>{let t=uE(e);if(Math.abs(t.scale)>=16)return N4(t);let n=t.value<Ir,r=`${n?-t.value:t.value}`,o=t.scale>0?r.padStart(t.scale+1,"0"):r.padEnd(r.length-t.scale,"0"),s=o.length-t.scale,a=t.scale>0?`${o.slice(0,s)}.${o.slice(s)}`:o;return n?`-${a}`:a},N4=e=>{if(D4(e))return"0e+0";let t=uE(e),n=`${t.value}`,r=t.value<Ir?2:1,o=n.slice(0,r),s=n.slice(r),a=s.length-t.scale;return`${o}${s===""?"":`.${s}`}e${a>=0?"+":""}${a}`};var D4=e=>e.value===Ir;var ch=class extends ys{_tag="Middleware";decode;encode;constructor(e,t){super(),this.decode=e,this.encode=t}flip(){return new ch(this.encode,this.decode)}},Mf="~effect/SchemaTransformation/Transformation",Pe=class extends ys{[Mf]=Mf;_tag="Transformation";decode;encode;constructor(e,t){super(),this.decode=e,this.encode=t}flip(){return new Pe(this.encode,this.decode)}};function U4(e){return _(e,Mf)&&e[Mf]===Mf}var uh=e=>U4(e)?e:new Pe(e.decode,e.encode);function Wt(e){return new Pe(rn(e.decode),rn(e.encode))}function Ce(e){return new Pe(le(e.decode),le(e.encode))}function lh(e){return new Pe(oh(e.decode),oh(e.encode))}function wF(){return new Pe(QP(),wo())}var $4=new Pe(wo(),wo());function qc(){return $4}var Wc=new Pe(sh(),Qa()),fh=new Pe(ZP(),Qa()),lE=new Pe(oE(),le(Ox)),kF=new Pe(oE(),le(e=>e.getTime()));var fE=Wt({decode:(e,t)=>_e(t1(e),{onNone:()=>I(new de({expected:"a valid ByteSize string"},e,t)),onSome:b}),encode:e=>b(`${e} ${e===BigInt(1)?"byte":"bytes"}`)}),IF=Wt({decode:(e,t)=>_e(gS(e),{onNone:()=>I(new de({expected:"a non-negative bigint byte count"},e,t)),onSome:b}),encode:e=>b(zm(e))}),CF=Wt({decode:(e,t)=>_e(gS(e),{onNone:()=>I(new de({expected:"a non-negative safe-integer byte count"},e,t)),onSome:b}),encode:(e,t)=>_e(r1(e),{onNone:()=>I(new de({expected:"a ByteSize representable as a safe integer"},e,t)),onSome:b})}),L4=e=>Mn(e)&&typeof e.message=="string",TF=e=>{let n=Object.hasOwn(e,"cause")?new Error(e.message,{cause:OF(e.cause)}):new Error(e.message);return typeof e.name=="string"&&e.name!=="Error"&&(n.name=e.name),typeof e.stack=="string"&&(n.stack=e.stack),n},B4=e=>{try{let t=pa(e);return t===void 0?M(e):JSON.parse(t)}catch{return M(e)}},j4=(e,t,n)=>{let r={name:e.name,message:typeof e.message=="string"?e.message:""};return t?.includeStack&&typeof e.stack=="string"&&(r.stack=e.stack),!t?.excludeCause&&e.cause!==void 0&&(r.cause=n(e.cause)),r},AF=e=>{let t=new WeakSet,n=r=>{if(Zk(r)){if(t.has(r))return"[Circular]";t.add(r);let o=j4(r,e,n);return t.delete(r),o}return B4(r)};return n},OF=e=>L4(e)?TF(e):e,_F=e=>Ce({decode:TF,encode:t=>AF(e)(t)}),PF=e=>Ce({decode:OF,encode:AF(e)});function FF(){return Ce({decode:RI,encode:Bx})}function RF(){return Ce({decode:Ts,encode:mn})}function MF(e){return Ce({decode:Sa,encode:e?.onNoneEncoding===null?Bx:mn})}function NF(){return lh({decode:R,encode:qi})}function DF(){return lh({decode:e=>e.pipe(Wi(ct),R),encode:qi})}var dE=Wt({decode:(e,t)=>URL.canParse(e)?b(new URL(e)):I(new de({expected:"a valid URL string"},e,t)),encode:e=>b(e.href)});var pE=new Pe(eF(),sE()),UF=new Pe(tF(),sE()),$F=new Pe(rF(),ah()),LF=new Pe(sF(),ih()),BF=new Pe(iF(),aF());function jF(e){return new Pe(YP(e??{}),XP(e))}var zF=new Pe(cF(),uF()),qF=new Pe(lF(),fF());function Js(e){return t=>t._tag===e}var Jc=Js("Declaration");var z4=Js("Never");var Vc=Js("Literal"),hE=Js("UniqueSymbol");var wE=Js("Arrays"),q4=Js("Objects"),QF=Js("Union"),YF=Js("Suspend"),ot=class{to;transformation;constructor(e,t){this.to=e,this.transformation=t}},Io={},ko=class{isOptional;isMutable;constructorDefault;annotations;constructor(e,t,n=void 0,r=void 0){this.isOptional=e,this.isMutable=t,this.constructorDefault=n,this.annotations=r}},WF="~effect/Schema",pt=class{[WF]=WF;annotations;checks;encoding;context;constructor(t=void 0,n=void 0,r=void 0,o=void 0){this.annotations=t,this.checks=n,this.encoding=r,this.context=o}toString(){return`<${this._tag}>`}},Zc=class extends pt{_tag="Declaration";typeParameters;run;encodingChecks;encodingRun;constructor(e,t,n,r,o,s,a,i){super(n,r,o,s),this.typeParameters=e,this.run=t,this.encodingChecks=a,this.encodingRun=i}getParser(){let e;return(t,n)=>t===me?wn:(e??=this.run(this.typeParameters))(t,this,n)}_rebuild(e,t,n,r,o){let s=Xa(this.typeParameters,e);return s===this.typeParameters&&t===this.checks&&n===this.encodingChecks&&r===this.run&&o===this.encodingRun?this:new Zc(s,r,this.annotations,t,void 0,this.context,n,o)}recur(e){return this._rebuild(e,this.checks,this.encodingChecks,this.run,this.encodingRun)}flip(e){return this._rebuild(e,this.encodingChecks,this.checks,this.encodingRun??this.run,this.run)}getExpected(){let e=this.annotations?.expected;return typeof e=="string"?e:"<Declaration>"}},W4=class extends pt{_tag="Null";getParser(){return vh(this,null)}getExpected(){return"null"}},kE=new W4;var H4=class extends pt{_tag="Undefined";getParser(){return vh(this,void 0)}toCodecJson(){return Ge(this,[XF])}getExpected(){return"undefined"}},XF=new ot(kE,new Pe(le(()=>{}),le(()=>null))),IE=new H4;var V4=class extends pt{_tag="Void";getParser(){let e=qt(void 0);return t=>t===me?wn:e}toCodecJson(){return Ge(this,[XF])}getExpected(){return"void"}},eR=new V4;var G4=class extends pt{_tag="Never";getParser(){return Ar(this,Jk)}getExpected(){return"never"}},CE=new G4,K4=class extends pt{_tag="Any";getParser(){return Ar(this,Ex)}getExpected(){return"any"}},tR=new K4,J4=class extends pt{_tag="Unknown";getParser(){return Ar(this,Ex)}getExpected(){return"unknown"}},rs=new J4,Z4=class extends pt{_tag="ObjectKeyword";getParser(){return Ar(this,Yu)}getExpected(){return"object | array | function"}},nR=new Z4,rR=class extends pt{_tag="Enum";enums;constructor(e,t,n,r,o){super(t,n,r,o);for(let[,s]of e)if(typeof s=="number"&&!globalThis.Number.isFinite(s))throw new Error(`A numeric enum value must be finite, got ${M(s)}`);this.enums=e}getParser(){let e=new Set(this.enums.map(([,t])=>t));return Ar(this,t=>e.has(t))}toCodecStringTree(){if(this.enums.some(([e,t])=>typeof t=="number")){let e=Object.fromEntries(this.enums.map(([t,n])=>[globalThis.String(n),n]));return Ge(this,[new ot(new In(Object.keys(e).map(t=>new Qn(t))),new Pe(le(t=>e[t]),Qa()))])}return this}getExpected(){return this.enums.map(([e,t])=>JSON.stringify(t)).join(" | ")}};function mE(e){return typeof e=="number"?`parts[${e}]`:e}function gE(e,t,n){if(n.has(e))return!0;if(e.encoding)throw new Error(`TemplateLiteral parts cannot have an encoding at ${mE(t)}`);let r;switch(e._tag){case"String":case"Number":case"BigInt":r=!0;break;case"Literal":r=!e.checks;break;case"TemplateLiteral":{let o=mE(t);r=!e.checks&&e.parts.every((s,a)=>gE(s,`${o}.parts[${a}]`,n));break}case"Union":{let o=mE(t);r=!e.checks&&e.types.every((s,a)=>gE(s,`${o}.types[${a}]`,n));break}default:return!1}return r&&n.add(e),r}var TE=class extends pt{_tag="TemplateLiteral";parts;encodedParts;literals;suffixLengths;constructor(e,t,n,r,o){super(t,n,r,o);let s=[],a=[],i=new Set;for(let u=0;u<e.length;u++){let l=e[u];if(!gE(l,u,i))throw new Error(`Invalid TemplateLiteral part ${l._tag}`);s.push(l),a.push(l._tag==="Literal"?globalThis.String(l.literal):void 0)}let c=new Array(s.length+1);c[s.length]=0;for(let u=s.length-1;u>=0;u--)c[u]=c[u+1]+(a[u]?.length??0);this.parts=e,this.encodedParts=s,this.literals=a,this.suffixLengths=c}getParser(e){let t=new lr(!1,this.parts.map(jE),[]),n=e(eu(Zn,t,sR(this)));return(r,o)=>{if(r===me)return wn;let s=n(r,o);return s._tag==="Success"?je:zt(s,{onSuccess:()=>r,onFailure:a=>new Ct(this,[a],r,o)})}}getExpected(){return"string"}matchPart(e,t){return _R(this,e,t)===void 0?void 0:e}};function oR(e){let t=dr(o=>{if(o._tag!=="Union")return o;let s=Xa(o.types,t);return(o.options?.mode??"anyOf")==="anyOf"&&s===o.types?o:new In(s,o.options===void 0?void 0:{...o.options,mode:"anyOf"},o.annotations,o.checks,void 0,o.context)}),n=new TE(e.map(o=>t(Tr(o)))),r=new lr(!1,e.map(jE),[]);return eu(n,r,sR(n))}function sR(e){return new Pe(rn((t,n)=>{let r=_R(e,t,n);return r?b(r):I(new de({expected:"a string matching template literal parts"},t,n))}),le(t=>t.join("")))}var aR=class extends pt{_tag="UniqueSymbol";symbol;constructor(e,t,n,r,o){super(t,n,r,o),this.symbol=e}getParser(){return vh(this,this.symbol)}toCodecStringTree(){let e=globalThis.Symbol.keyFor(this.symbol);return Ge(this,[new ot(e===void 0?CE:new Qn(globalThis.String(this.symbol)),RR.transformation)])}getExpected(){return globalThis.String(this.symbol)}},Qn=class extends pt{_tag="Literal";literal;constructor(e,t,n,r,o){if(super(t,n,r,o),typeof e=="number"&&!globalThis.Number.isFinite(e))throw new Error(`A numeric literal must be finite, got ${M(e)}`);this.literal=e}getParser(){return vh(this,this.literal)}matchPart(e,t){return e===globalThis.String(this.literal)?this.literal:void 0}toCodecJson(){return typeof this.literal=="bigint"?HF(this):this}toCodecStringTree(){return typeof this.literal=="string"?this:HF(this)}getExpected(){return typeof this.literal=="string"?JSON.stringify(this.literal):globalThis.String(this.literal)}};function HF(e){let t=globalThis.String(e.literal);return Ge(e,[new ot(new Qn(t),new Pe(le(()=>e.literal),le(()=>t)))])}var Q4=class extends pt{_tag="String";getParser(){return Ar(this,pr)}matchPart(e,t){let n=this.checks;return n&&!t.disableChecks&&Or(n,e,void 0,this,t)?void 0:e}getExpected(){return"string"}},Zn=new Q4,Y4=class extends pt{_tag="Number";getParser(){return Ar(this,Zu)}matchKey(e,t){return this._match(yV,e,t)}matchPart(e,t){return this._match(SE,e,t)}_match(e,t,n){if(!e.test(t))return;let r=globalThis.Number(t);return n.disableChecks||!this.checks?r:Or(this.checks,r,void 0,this,n)?void 0:r}toCodecJson(){return this.checks&&(xE(this.checks,"effect/schema/isFinite")||xE(this.checks,"effect/schema/isInt"))?this:Ge(this,[fV])}toCodecStringTree(){return this.toCodecJson()===this?Ge(this,[bV]):Ge(this,[SV])}getExpected(){return"number"}};function xE(e,t){return e.some(n=>n.annotations?.representation?.id===t||n._tag==="FilterGroup"&&xE(n.checks,t))}var AE=new Y4,X4=class extends pt{_tag="Boolean";getParser(){return Ar(this,qd)}getExpected(){return"boolean"}},iR=new X4,eV=class extends pt{_tag="Symbol";getParser(){return Ar(this,Sx)}matchKey(e,t){return t.disableChecks||!this.checks?e:Or(this.checks,e,void 0,this,t)?void 0:e}toCodecStringTree(){return Ge(this,[RR])}getExpected(){return"symbol"}},cR=new eV,tV=class extends pt{_tag="BigInt";getParser(){return Ar(this,Gk)}matchPart(e,t){if(!EE.test(e))return;let n=globalThis.BigInt(e);return t.disableChecks||!this.checks?n:Or(this.checks,n,void 0,this,t)?void 0:n}toCodecStringTree(){return Ge(this,[vV])}getExpected(){return"bigint"}},uR=new tV,lr=class extends pt{_tag="Arrays";isMutable;elements;rest;encodingChecks;constructor(e,t,n,r,o,s,a,i){super(r,o,s,a),this.isMutable=e,this.elements=t,this.rest=n,this.encodingChecks=i;let c=!1;for(let u=0;u<t.length;u++)if(Ht(t[u]))c=!0;else if(c)throw new Error("A required element cannot follow an optional element. ts(1257)");if(c&&n.length>1)throw new Error("A required element cannot follow an optional element. ts(1257)");for(let u=1;u<n.length;u++)if(Ht(n[u]))throw new Error("An optional element cannot follow a rest element. ts(1266)")}getParser(e,t=e){let n=this,r,o,s=n.elements.length,a=Math.max(0,n.rest.length-1);function i(l,f){return f<s?r[f]:f>=l?o[f-l+1]:o[0]}let c=l=>{let{input:f,len:d,options:m}=l;if(n.rest.length===0&&d>s)for(let g=s;g<d;g++){let x=new HS(n,f[g],m),E=new It([g],x);if(m.errors==="all")l.issues?l.issues.push(E):l.issues=[E];else return I(new Ct(n,[E],f,m))}return l.issues?I(new Ct(n,l.issues,f,m)):qt(l.output)},u=(l,f)=>{let d=l.length,m={ast:n,getParser:i,input:l,len:d,tailThreshold:Math.max(s,d-a),output:new globalThis.Array(d),issues:void 0,options:f},g=n.rest.length===0?s:Math.max(d,s+a),x=f.concurrency===void 0?1:Nl(f.concurrency),E=x===1?rV(m,l,0,g):oV(m,l,{concurrency:x,end:g});if(!E)return c(m);if(Ne(E))return _t(E,()=>c(m));let k=!0;return ke(()=>k?(k=!1,q(E,()=>c(m))):u(l,f))};return(l,f)=>{if(l===me)return wn;try{return Array.isArray(l)?(r||(r=n.elements.map(d=>({ast:d,parser:t(d)})),o=n.rest.map(d=>({ast:d,parser:t(d)}))),u(l,f)):I(new dt(n,l,f))}catch(d){return jt(d)}}}_rebuild(e,t,n){let r=Xa(this.elements,e),o=Xa(this.rest,e);return r===this.elements&&o===this.rest&&t===this.checks&&n===this.encodingChecks?this:new lr(this.isMutable,r,o,this.annotations,t,void 0,this.context,n)}recur(e){return this._rebuild(e,this.checks,this.encodingChecks)}flip(e){return this._rebuild(e,this.encodingChecks,this.checks)}getExpected(){return"array"}};function nV(e,t,n,r){if(n._tag==="Failure")return mh(e,e.ast,r,n);let o=n===je?t:n[fe];if(o!==me)e.output[r]=o;else{let s=e.getParser(e.tailThreshold,r);if(Ht(s.ast))return;let a=new It([r],new Gs(s.ast.context?.annotations));if(e.options.errors==="all")e.issues?e.issues.push(a):e.issues=[a];else return br(new Ct(e.ast,[a],e.input,e.options))}}var lR={onItem(e,t,n){let r=n<e.len?t:me;return e.getParser(e.tailThreshold,n).parser(r,e.options)},step:nV},rV=im()(lR),oV=cm()(lR),mh=(e,t,n,r)=>{if(r.cause.reasons.length===0)return r;let o=Of(r.cause);if(o===void 0)return uo($s(r.cause,a=>new Ct(t,[new It([n],a)],e.input,e.options)));let s=new It([n],o);if(e.options.errors==="all")e.issues?e.issues.push(s):e.issues=[s];else return br(new Ct(t,[s],e.input,e.options))},gh="[+-]?\\d*\\.?\\d+(?:[Ee][+-]?\\d+)?";function Ks(e,t,n=Io){let r,o;function s(a){switch(a._tag){case"String":case"TemplateLiteral":return(r??=Object.keys(e)).filter(i=>a.matchPart(i,n)!==void 0);case"Number":return(r??=Object.keys(e)).filter(i=>a.matchKey(i,n)!==void 0);case"Symbol":return(o??=Object.getOwnPropertySymbols(e)).filter(i=>Object.prototype.propertyIsEnumerable.call(e,i)&&a.matchKey(i,n)!==void 0);case"Union":return[...new Set(a.types.flatMap(s))];default:return[]}}return s(BE(Tr(t)))}var OE=class{name;type;constructor(e,t){this.name=e,this.type=t}};function fR(e){switch(e._tag){case"String":case"Number":case"Symbol":case"TemplateLiteral":return!0;case"Union":return e.types.every(fR);default:return!1}}function dR(e){let t=Yc(e);switch(t._tag){case"String":case"Number":case"Symbol":case"TemplateLiteral":return!0;case"Union":return t.types.every(dR);default:return!1}}function sV(e){return fR(e)&&dR(e)}var _E=class{parameter;type;constructor(e,t){if(!sV(e))throw new Error(`Invalid index signature parameter ${e._tag}`);if(this.parameter=e,this.type=t,Ht(t)&&!OR(t))throw new Error("Cannot use `Schema.optionalKey` with index signatures, use `Schema.optional` instead.")}},Nf=class extends pt{_tag="Objects";propertySignatures;indexSignatures;encodingChecks;constructor(e,t,n,r,o,s,a){super(n,r,o,s),this.propertySignatures=e,this.indexSignatures=t,this.encodingChecks=a}getParser(e,t=e){let n=this,r=n.propertySignatures.length,o=n.indexSignatures.length;if(!r&&!o)return Ar(n,Hd);let s,a,i=()=>(s||(s=n.propertySignatures.map(f=>({parser:t(f.type),name:f.name,type:f.type})),a=o?n.indexSignatures.map(f=>({is:f,parserKey:e(BE(f.parameter)),parserValue:t(f.type)})):void 0),s),c=()=>{let f=new Set(n.propertySignatures.map(E=>typeof E.name=="number"?globalThis.String(E.name):E.name)),d=(E,k,w,P,T)=>{if(T._tag==="Failure")return mh(E,n,k,T)??Sr;let p=T===je?P:T[fe];if(w!==me&&p!==me){if(r&&(f.has(k)||f.has(typeof w=="number"?globalThis.String(w):w)))return Sr;N(E.out,w,p)}return Sr},m=(E,k,w,P)=>{if(!P){let S=w.parserKey(k,E.options);if(!Ne(S))return q(Bs(S),v=>m(E,k,w,v));P=S}if(P._tag==="Failure")return mh(E,n,k,P)??Sr;let T=P===je?k:P[fe],p=E.input[k],y=w.parserValue(p,E.options);return Ne(y)?d(E,k,T,p,y):q(Bs(y),S=>d(E,k,T,p,S))},g=(E,k,w)=>{let P=E.input[k],T=w.parserValue(P,E.options);return Ne(T)?d(E,k,k,P,T):q(Bs(T),p=>d(E,k,k,P,p))},x=o?cm()({onItem:(E,[k,w])=>w.is.parameter===Zn?g(E,k,w):m(E,k,w),step:(E,k,w)=>w._tag==="Failure"?w:void 0}):void 0;return dS(function*(E,k){if(E===me)return me;if(!(typeof E=="object"&&E!==null&&!Array.isArray(E)))return yield*I(new dt(n,E,k));i();let w=E,P={},T={ast:n,input:w,out:P,issues:void 0,options:k},p=k.errors==="all",y=k.onExcessProperty==="error",S=k.concurrency===void 0?1:Nl(k.concurrency),v=o&&y?n.indexSignatures.map(C=>Ks(w,C.parameter,k)):void 0;if(y){let C=v?new Set(f):f;if(v)for(let D of v)for(let z of D)C.add(z);let O=Reflect.ownKeys(w);for(let D=0;D<O.length;D++){let z=O[D];if(!C.has(z)&&Object.prototype.propertyIsEnumerable.call(w,z)){let ge=new HS(n,w[z],k),X=new It([z],ge);if(p){T.issues?T.issues.push(X):T.issues=[X];continue}else return yield*I(new Ct(n,[X],E,k))}}}if(r){let C=S===1?VF(T,s):aV(T,s,{concurrency:S});C&&(yield*C)}if(o&&S===1)for(let C=0;C<o;C++){let O=a[C],D=O.is.parameter===Zn?g:m,z=v?.[C]??(O.is.parameter===Zn?Object.keys(w):Ks(w,O.is.parameter,k));for(let ge=0;ge<z.length;ge++){let X=D(T,z[ge],O);if(!Ne(X))yield*X;else if(X._tag==="Failure")return yield*X}}else if(x){let C=wa();for(let D=0;D<o;D++){let z=a[D],ge=v?.[D]??(z.is.parameter===Zn?Object.keys(w):Ks(w,z.is.parameter,k));for(let X=0;X<ge.length;X++)C.push([ge[X],z])}let O=x(T,C,{concurrency:S});O&&(yield*O)}return T.issues?yield*I(new Ct(n,T.issues,E,k)):P})};if(o)return c();let u,l=(f,d,m)=>{let g=s[d];return q(Bs(m),x=>{let E=yE(f,g,x);if(E)return E;let k=()=>qt(f.out),w=VF(f,s.slice(d+1));return w?_t(w,k):k()})};return(f,d)=>{if(f===me)return wn;if(d.errors==="all"||d.onExcessProperty!==void 0||d.concurrency!==void 0&&Nl(d.concurrency)!==1)return(u??=c())(f,d);if(!(typeof f=="object"&&f!==null&&!Array.isArray(f)))return I(new dt(n,f,d));let m=i(),g=f,x={},E={ast:n,input:g,out:x,issues:void 0,options:d};try{for(let k=0;k<m.length;k++){let w=m[k],P=w.name,T=Hc(g,P),p=T?g[P]:me,y=w.parser(p,d);if(!Ne(y))return l(E,k,y);if(y===je){T&&N(x,P,p);continue}let S=yE(E,w,y);if(S)return S}}catch(k){return jt(k)}return qt(x)}}_rebuild(e,t,n,r){let o=Xa(this.propertySignatures,a=>{let i=e(a.type);return i===a.type?a:new OE(a.name,i)}),s=Xa(this.indexSignatures,a=>{let i=t(a.parameter),c=e(a.type);return i===a.parameter&&c===a.type?a:new _E(i,c)});return o===this.propertySignatures&&s===this.indexSignatures&&n===this.checks&&r===this.encodingChecks?this:new Nf(o,s,this.annotations,n,void 0,this.context,r)}flip(e){return this._rebuild(e,e,this.encodingChecks,this.checks)}recur(e,t=e){return this._rebuild(e,t,this.checks,this.encodingChecks)}getExpected(){return this.propertySignatures.length===0&&this.indexSignatures.length===0?"object | array":"object"}};function yE(e,t,n){if(n._tag==="Failure")return mh(e,e.ast,t.name,n);if(n===je)return;let r=n[fe];if(r!==me){N(e.out,t.name,r);return}if(delete e.out[t.name],!Ht(t.type)){let o=new It([t.name],new Gs(t.type.context?.annotations));if(e.options.errors==="all"){e.issues?e.issues.push(o):e.issues=[o];return}else return br(new Ct(e.ast,[o],e.input,e.options))}}var pR={onItem(e,t){if(!Hc(e.input,t.name))return t.parser(me,e.options);let n=e.input[t.name];return N(e.out,t.name,n),t.parser(n,e.options)},step:yE},VF=im()(pR),aV=cm()(pR);function PE(e,t){return e?t?[...e,...t]:e:t}function xh(e,t,n){return new Nf(Reflect.ownKeys(e).map(r=>new OE(r,e[r].ast)),[],n,t)}function Df(e){return e.ast}function FE(e,t=void 0){return new lr(!1,e.map(n=>n.ast),[],void 0,t)}function yh(e,t,n){return new In(e.map(Df),t,void 0,n)}function mR(e,t){if(e.encoding||t.some(s=>s.encoding))throw new Error("StructWithRest does not support encodings");let n=e.propertySignatures,r=e.indexSignatures,o=e.checks;for(let s of t){for(let a of s.propertySignatures)if(n.some(i=>i.name===a.name))throw new Error(`Duplicate identifier: ${JSON.stringify(a.name)}. ts(2300)`);n=n.concat(s.propertySignatures),r=r.concat(s.indexSignatures),o=PE(o,s.checks)}return new Nf(n,r,void 0,o)}function hR(e,t){if(e.encoding)throw new Error("TupleWithRest does not support encodings");return new lr(e.isMutable,e.elements,t,void 0,e.checks)}function gR(e){if(e.encoding)throw new Error("mutable does not support encodings");return new lr(!0,e.elements,e.rest,e.annotations,e.checks,void 0,e.context,e.encodingChecks)}var RE=ua(e=>{for(;;){if(YF(e))return rs;let t=e.encoding;if(!t)return e.recur?.(RE,F)??e;if(t.some(n=>n.transformation._tag==="Middleware"&&n.transformation.decode!==F))return rs;e=t[t.length-1].to}});function xR(e){switch(e._tag){case"Null":return["null"];case"Undefined":return["undefined"];case"String":case"TemplateLiteral":return["string"];case"Number":return["number"];case"Boolean":return["boolean"];case"Symbol":case"UniqueSymbol":return["symbol"];case"BigInt":return["bigint"];case"Arrays":return["array"];case"ObjectKeyword":return["object","array","function"];case"Objects":return e.propertySignatures.length||e.indexSignatures.length?["object"]:["string","number","boolean","symbol","bigint","object","array","function"];case"Enum":return Array.from(new Set(e.enums.map(([,t])=>typeof t)));case"Literal":return[typeof e.literal];case"Union":return Array.from(new Set(e.types.flatMap(xR)));default:return["null","undefined","string","number","boolean","symbol","bigint","object","array","function"]}}function Gc(e){switch(e._tag){default:return[];case"Declaration":{let t=e.annotations?.[Ef];return Array.isArray(t)?t:[]}case"Objects":return e.propertySignatures.flatMap(t=>{let n=t.type;if(!Ht(n)){if(Vc(n))return[{key:t.name,literal:n.literal}];if(hE(n))return[{key:t.name,literal:n.symbol}]}return[]});case"Arrays":return e.elements.flatMap((t,n)=>{if(!Ht(t)){if(Vc(t))return[{key:n,literal:t.literal}];if(hE(t))return[{key:n,literal:t.symbol}]}return[]});case"Union":{if(e.types.length===0)return[];let t=e.types.map(n=>Gc(RE(n)));return t[0].filter(n=>t.every(r=>r.some(o=>o.key===n.key&&o.literal===n.literal)))}case"Suspend":return Gc(e.thunk())}}var GF=new WeakMap,ph=Object.freeze([]),KF=e=>e===null?"null":Array.isArray(e)?"array":typeof e,Hc=(e,t)=>t==="__proto__"?Object.hasOwn(e,t):t in e;function Uf(e){let t=GF.get(e);if(t)return t;let n,r=0,o,s,a=!0,i=[];for(let l=0;l<e.length;l++){let f=e[l],d=RE(f);if(z4(d))continue;if(Vc(d)||hE(d)){s??=new Map;let g=Vc(d)?d.literal:d.symbol;i[l]=g;let x=s.get(g);x||s.set(g,x=[]),x.push(l)}else a=!1;let m=Gc(d);if(m.length){n??=new Map,r++;for(let{key:g,literal:x}of m){let E=n.get(g);E||n.set(g,E=[new Map,new Set]),E[1].add(l);let k=E[0].get(x);k||E[0].set(x,k=new Set),k.add(l)}}else{o??={};let g=xR(d);for(let x of g)(o[x]??=[]).push(l)}}let c={},u=l=>c[l]??=Object.freeze(o?.[l]??ph);if(a&&s)s.forEach(Object.freeze),t=l=>s.get(l)??ph;else if(n?.size===1&&!o){let[l,[f]]=n.entries().next().value,d=new Map;for(let[g,x]of f)d.set(g,Object.freeze(Array.from(x)));let m=Object.freeze(e.map((g,x)=>x));t=(g,x)=>{if(Yu(g)){let E=Hc(g,l)?g[l]:void 0;if(E!==void 0)return d.get(E)??ph;if(x)return m}return ph}}else if(n){let l;for(let f of n)(!l||f[1][0].size>l[1][0].size)&&f[1][1].size===r&&(l=f);t=(f,d)=>{let m=KF(f);if(!Yu(f))return u(m);let g=new Set(o?.[m]),x;if(l){let[E,[k]]=l,w=Hc(f,E),P=w?f[E]:void 0;if(w&&(!d||P!==void 0)){let T=k.get(P);if(!T)return u(m);for(let p of T)g.add(p);x=E}}if(x===void 0)for(let[E,[k,w]]of n){let P=Hc(f,E),T=P?f[E]:void 0;if(P&&(!d||T!==void 0)){let p=k.get(T);if(p)for(let y of p)g.add(y)}else if(d)for(let p of w)g.add(p)}for(let[E,[k,w]]of n){if(E===x)continue;let P=Hc(f,E),T=P?f[E]:void 0;if(P&&(!d||T!==void 0)){let p=k.get(T);for(let y of g)w.has(y)&&!p?.has(y)&&g.delete(y)}}return Array.from(g).sort((E,k)=>E-k)}}else t=l=>{let f=u(KF(l));return s?f.filter(d=>i[d]===void 0||i[d]===l):f};return GF.set(e,t),t}var In=class extends pt{_tag="Union";types;options;encodingChecks;constructor(e,t,n,r,o,s,a){super(n,r,o,s),this.types=e,this.options=t,this.encodingChecks=a}getParser(e,t){let n=this,r=t!==void 0,o=[],s=i=>o[i]??=e(n.types[i]),a;return(i,c)=>{if(i===me)return wn;let u=(a??=Uf(n.types))(i,r);if(u.length===0)return I(new Af(n,[],i,c));if(u.length===1){let l=s(u[0])(i,c);return l._tag==="Success"?l:Ne(l)?yR(n,l.cause,i,c):iV(n,l,i,c)}return cV(n,s,u,i,c)}}_rebuild(e,t,n){let r=Xa(this.types,e);return r===this.types&&t===this.checks&&n===this.encodingChecks?this:new In(r,this.options,this.annotations,t,void 0,this.context,n)}recur(e){return this._rebuild(e,this.checks,this.encodingChecks)}flip(e){return this._rebuild(e,this.encodingChecks,this.checks)}matchPart(e,t){for(let n of this.types){let r=n.matchPart(e,t);if(r!==void 0)return r}}getExpected(e){let t=this.annotations?.expected;if(typeof t=="string")return t;if(this.types.length===0)return"never";let n=this.types.map(r=>{let o=Tr(r);switch(o._tag){case"Arrays":{let s=o.elements.filter(Vc);if(s.length>0)return`${JF(o.isMutable)}[ ${s.map(a=>e(a)+ZF(a.context?.isOptional)).join(", ")}, ... ]`;break}case"Objects":{let s=o.propertySignatures.filter(a=>Vc(a.type));if(s.length>0)return`{ ${s.map(a=>`${JF(a.type.context?.isMutable)}${Gr(a.name)}${ZF(a.type.context?.isOptional)}: ${e(a.type)}`).join(", ")}, ... }`;break}}return e(o)});return Array.from(new Set(n)).join(" | ")}};function yR(e,t,n,r){let o=Of(t);return o?br(new Af(e,[o],n,r)):uo(t)}function iV(e,t,n,r){return Vn(t,o=>yR(e,o,n,r))}function cV(e,t,n,r,o){let s={ast:e,parser:t,input:r,out:void 0,successes:e.options?.mode==="oneOf"?[]:void 0,issues:void 0,options:o},a=lV(s,n);return a?uV(a,s):s.out?s.out:I(new Af(e,s.issues??[],r,o))}function uV(e,t){return _t(e,n=>t.out===je?b(t.input):t.out?t.out:I(new Af(t.ast,t.issues??[],t.input,t.options)))}var lV=im()({onItem(e,t){return e.parser(t)(e.input,e.options)},step(e,t,n){if(n._tag==="Failure"){let r=Of(n.cause);if(r===void 0)return n;e.issues?e.issues.push(r):e.issues=[r]}else{if(e.out&&e.successes)return e.successes.push(e.ast.types[t]),br(new vP(e.ast,e.successes,e.input,e.options));if(e.out=n,e.successes)e.successes.push(e.ast.types[t]);else return Sr}}}),bR=new In([new Qn("Infinity"),new Qn("-Infinity"),new Qn("NaN")]);function JF(e){return e?"":"readonly "}function ZF(e){return e?"?":""}var ME=class extends pt{_tag="Suspend";thunk;constructor(e,t,n,r,o){if(n)throw new Error("Cannot add checks to Suspend");super(t,void 0,r,o);let s;this.thunk=()=>s??=e()}getParser(e){let t;return(n,r)=>(t??=e(this.thunk()))(n,r)}recur(e){return new ME(()=>e(this.thunk()),this.annotations,void 0,void 0,this.context)}getExpected(e){return e(this.thunk())}},hh=class extends ys{_tag="Filter";run;annotations;aborted;constructor(e,t=void 0,n=!1){super(),this.run=e,this.annotations=t,this.aborted=n}annotate(e){return new hh(this.run,{...this.annotations,...e},this.aborted)}abort(){return new hh(this.run,this.annotations,!0)}and(e,t){return new Ya([this,e],t)}},Ya=class extends ys{_tag="FilterGroup";checks;annotations;constructor(e,t=void 0){super(),this.checks=e,this.annotations=t}annotate(e){return new Ya(this.checks,{...this.annotations,...e})}and(e,t){return new Ya([this,e],t)}};function bh(e,t,n=!1){return new hh((r,o,s)=>kP(o,e(r,o,s),r,s),t,n)}function Sh(e,t){return new hh((n,r,o)=>e(n)?void 0:new de(void 0,n,o),t,!0)}function NE(e){return bh(t=>globalThis.Number.isFinite(t),{expected:"a finite number",representation:{id:"effect/schema/isFinite",payload:null},toJsonSchema:()=>({type:"number"}),toCode:()=>({runtime:"Schema.isFinite()"}),arbitraryConstraint:{number:"finite"},...e})}var DE=Co(AE,[NE()]),fV=new ot(new In([DE,bR]),new Pe(sh(),le(e=>globalThis.Number.isFinite(e)?e:globalThis.String(e))));function $f(e,t){let n=new globalThis.RegExp(e),r={source:n.source,flags:n.flags};return bh(o=>(n.lastIndex=0,n.test(o)),{expected:`a string matching the RegExp ${r.source}`,representation:{id:"effect/schema/isPattern",payload:r},toJsonSchema:()=>[{},!0],arbitraryConstraint:{patterns:[r]},...t})}var bE=new WeakMap;function Lf(e,t){let n=Object.assign(Object.create(Object.getPrototypeOf(e)),e,t);return Reflect.ownKeys(t).every(r=>r==="context"||r==="encoding")&&bE.set(n,Qc(e)),n}function Qc(e){let t=bE.get(e);if(t!==void 0)return t;if(e.encoding===void 0)return e;let n=Object.assign(Object.create(Object.getPrototypeOf(e)),e,{encoding:void 0});return bE.set(e,n),n}function Ge(e,t){return e.encoding===t?e:Lf(e,{encoding:t})}function ei(e,t){if(e.context===t)return e;let n=Qc(e);return n.context===t&&n.encoding===e.encoding?n:Lf(e,{context:t})}function Yc(e){return e.encoding?Yc(e.encoding[e.encoding.length-1].to):e}function Cr(e,t){if(e.checks){let n=e.checks[e.checks.length-1];return SR(e,xp(e.checks.slice(0,-1),n.annotate(t)))}return Lf(e,{annotations:{...e.annotations,...t}})}function SR(e,t){if(e._tag==="Suspend"&&t)throw new Error("Cannot add checks to Suspend");return e.checks===t?e:Lf(e,{checks:t})}function Co(e,t){return SR(e,PE(e.checks,t))}function Xc(e,t){let n=t(e.to);return n===e.to?e:new ot(n,e.transformation)}function ER(e,t){let n=e,r=n[n.length-1],o=Xc(r,t);return o===r?e:xp(e.slice(0,e.length-1),o)}function UE(e){return t=>t.encoding?Ge(t,ER(t.encoding,e)):t}function Eh(e,t){return UE(n=>ei(n,t))(e)}function ti(e,t){function n(r){if(r.encoding){let o=r.encoding[r.encoding.length-1];return t?.stopAt?.(o)?r:Ge(r,ER(r.encoding,n))}return e(r)}return ua(n)}function vR(e,t){return $E(e,t,yt(e))}function wR(e,t){return $E(Tr(e),t,e)}function $E(e,t,n){let r=new ot(e,t);return Ge(n,n.encoding?[...n.encoding,r]:[r])}function Xa(e,t){let n;for(let r=0;r<e.length;r++){let o=e[r],s=t(o);if(n)n[r]=s;else if(s!==o){n=new Array(e.length);for(let a=0;a<r;a++)n[a]=e[a];n[r]=s}}return n??e}function Bf(e,t){let n=e.context?new ko(e.context.isOptional,e.context.isMutable,e.context.constructorDefault,{...e.context.annotations,...t}):new ko(!1,!1,void 0,t);return ei(e,n)}var ni=ua(e=>{let t=e.context?e.context.isOptional===!1?new ko(!0,e.context.isMutable,e.context.constructorDefault,e.context.annotations):e.context:new ko(!0,!1);return dV(ei(e,t))}),dV=UE(ni),kR=dr(e=>ni(new In([e,IE]))),LE=ua(e=>{let t=e.context?e.context.isMutable===!1?new ko(e.context.isOptional,!0,e.context.constructorDefault,e.context.annotations):e.context:new ko(!1,!0);return pV(ei(e,t))}),pV=UE(LE);function IR(e,t){let n=e.context?new ko(e.context.isOptional,e.context.isMutable,t,e.context.annotations):new ko(!1,!1,t);return ei(e,n)}function eu(e,t,n){return $E(e,n,t)}function mV(e){let t=[],n=[];function r(o){switch(o._tag){case"Literal":Wd(o.literal)&&!t.includes(o.literal)&&t.push(o.literal);return;case"UniqueSymbol":t.includes(o.symbol)||t.push(o.symbol);return;case"Never":return;case"Union":for(let s=0;s<o.types.length;s++)r(o.types[s]);return;default:n.push(o)}}return r(e),{literals:t,parameters:n}}function CR(e,t){let{literals:n,parameters:r}=mV(e);return new Nf(n.map(o=>new OE(o,t)),r.map(o=>new _E(o,t)))}function Ht(e){return e.context?.isOptional??!1}function TR(e){return e.context?.isMutable??!1}function AR(e){return e.annotations?.[vn]===!0||e._tag==="FilterGroup"&&e.checks.every(AR)}function hV(e){function t(r){return AR(r)?[r]:r._tag==="FilterGroup"?r.checks.flatMap(t):[]}let n=e.flatMap(t);return va(n)?n:void 0}function gV(e){let t=!0;function n(r){return t=t&&!r.encoding&&!YF(r),t&&"recur"in r&&r.recur(n),r}return"recur"in e&&e.recur(n),t}var yt=ua(e=>{let t=Qc(e);if(t!==e){let r=yt(t);return r===t&&e.encoding===void 0?e:ei(r,e.context)}let n="recur"in e?e.recur(yt):e;if("encodingChecks"in n&&n.encodingChecks){let r=gV(e)?n.encodingChecks:wE(n)||q4(n)||Jc(n)&&n.typeParameters.length>0?hV(n.encodingChecks):void 0;return Lf(n,{encodingChecks:void 0,checks:PE(n.checks,r)})}return n}),Tr=ua(e=>yt(Yn(e)));function xV(e,t){let n=t,r=n.length,o=n[r-1],s=[new ot(Yn(Ge(e,void 0)),n[0].transformation.flip())];for(let i=1;i<r;i++)s.unshift(new ot(Yn(n[i-1].to),n[i].transformation.flip()));let a=Yn(o.to);return a.encoding?Ge(a,[...a.encoding,...s]):Ge(a,s)}var Yn=dr(e=>{if(e.encoding)return xV(e,e.encoding);let t=Qc(e);if(t!==e){let n=Yn(t);return n===t?e:ei(n,e.context)}return"flip"in e?e.flip(Yn):"recur"in e?e.recur(Yn):e});function OR(e){switch(e._tag){case"Undefined":return!0;case"Union":return e.types.some(OR);default:return!1}}function vh(e,t){let n=t===0?je:qt(t);return(r,o)=>r===me?wn:r===t?n:I(new dt(e,r,o))}function Ar(e,t){return(n,r)=>n===me?wn:t(n)?je:I(new dt(e,n,r))}function _R(e,t,n){let r=e.encodedParts,o=e.literals,s=t.length;for(let u=0;u<o.length;u++){let l=o[u];if(l&&!t.includes(l))return}if(e.suffixLengths[0]>s)return;let a=new Array(r.length),i;function c(u,l){if(u===r.length)return l===s;if(i?.has(u*(s+1)+l))return!1;let f=r[u];if(u===r.length-1){let d=t.slice(l);if(f.matchPart(d,n)!==void 0)return a[u]=d,!0}else if(f._tag==="Literal"){let d=o[u];if(t.startsWith(d,l)&&c(u+1,l+d.length))return a[u]=d,!0}else{let d=s-e.suffixLengths[u+1],m=o[u+1],g=m===void 0?d:t.lastIndexOf(m,d);for(;g>=l;){let x=t.slice(l,g);if(f.matchPart(x,n)!==void 0&&c(u+1,g))return a[u]=x,!0;if(g===0)break;g=m===void 0?g-1:t.lastIndexOf(m,g-1)}}return i??=new Set,i.add(u*(s+1)+l),!1}return c(0,0)?a:void 0}var BE=ti(e=>{switch(e._tag){default:return e;case"Number":return e.toCodecStringTree();case"Union":return e.recur(BE)}}),wh=ti(e=>{switch(e._tag){default:return e;case"Symbol":case"UniqueSymbol":return e.toCodecStringTree();case"Union":return e.recur(wh)}}),jE=ti(e=>{switch(e._tag){default:return e;case"Number":case"Literal":case"BigInt":return e.toCodecStringTree();case"Union":return e.recur(jE)}}),PR="[\\s\\S]*?",SE=new globalThis.RegExp(`^${gh}$`),yV=new globalThis.RegExp(`^(?:${gh}|Infinity|-Infinity|NaN)$`);function zE(e){return $f(SE,{expected:"a string representing a finite number",representation:{id:"effect/schema/isStringFinite",payload:null},toJsonSchema:()=>({pattern:SE.source}),...e})}var FR=Co(Zn,[zE()]),bV=new ot(FR,Wc),SV=new ot(new In([FR,bR]),Wc),EV="-?\\d+",EE=new globalThis.RegExp(`^${EV}$`);function qE(e){return $f(EE,{expected:"a string representing a bigint",representation:{id:"effect/schema/isStringBigInt",payload:null},toJsonSchema:()=>({pattern:EE.source}),...e})}var WE=Co(Zn,[qE({expected:"a string representing a bigint"})]),vV=new ot(WE,fh),wV="Symbol\\(([\\s\\S]*)\\)",vE=new globalThis.RegExp(`^${wV}$`),kV=Co(Zn,[HE()]),RR=new ot(kV,new Pe(le(e=>globalThis.Symbol.for(vE.exec(e)[1])),rn((e,t)=>globalThis.Symbol.keyFor(e)!==void 0?b(globalThis.String(e)):I(new Tf({message:"cannot serialize to string, Symbol is not registered"},e,t)))));function HE(e){return $f(vE,{expected:"a string representing a symbol",representation:{id:"effect/schema/isStringSymbol",payload:null},toJsonSchema:()=>({pattern:vE.source}),...e})}function Or(e,t,n,r,o){for(let s=0;s<e.length;s++){let a=e[s];if(a._tag==="FilterGroup"){if(n=Or(a.checks,t,n,r,o),n&&(o.errors!=="all"||n[n.length-1].filter.aborted))return n}else{let i=a.run(t,r,o);if(i){let c=new SP(a,i,t,o);if(n?n.push(c):n=[c],o.errors!=="all"||a.aborted)return n}}}return n}function MR(e,t){let n=Or(e,t,void 0,rs,{errors:"all"});if(n){let r=new Ct(rs,n);return K(r)}return $(t)}function NR(e){if(!Jc(e))return;let t=e.annotations?.[eh];return bn(t)?t(e.typeParameters):void 0}function IV(e){return e===null||typeof e=="string"||typeof e=="boolean"||typeof e=="number"&&globalThis.Number.isFinite(e)}function CV(e){return e===void 0||typeof e=="string"}function DR(e,t){let n=new WeakMap,r=[];e:for(;;){if(typeof e!="object"||e===null){if(!t(e))return!1}else{let o=e,s=n.get(o);if(s===!1)return!1;if(s===void 0){let a=Array.isArray(o);if(!a){let i=Object.getPrototypeOf(o);if(i!==null&&i!==Object.prototype&&Object.getPrototypeOf(i)!==null)return!1}n.set(o,!1),r.push({value:o,keys:a?o.length:Object.keys(o),index:0})}}for(;r.length>0;){let o=r[r.length-1],s=o.keys;if(typeof s=="number"){if(o.index<s){e=o.value[o.index++];continue e}}else if(o.index<s.length){e=o.value[s[o.index++]];continue e}n.set(o.value,!0),r.pop()}return!0}}function tu(e){return DR(e,IV)}var Kc=new Zc([],()=>(e,t,n)=>tu(e)?je:I(new dt(t,e,n)),{representation:{id:"effect/schema/Json",payload:null},expected:"JSON value",toCodecJson:()=>{},toCodecStringTree:()=>GE}),UR=Cr(Kc,{representation:{id:"effect/schema/MutableJson",payload:null}}),VE=new ot(Kc,qc()),$R=new ot(new In([new lr(!1,[],[Kc]),new Nf([],[new _E(Zn,Kc)])]),qc());function TV(e){return DR(e,CV)}var AV=new Zc([],()=>(e,t,n)=>TV(e)?je:I(new dt(t,e,n)),{expected:"StringTree",toCodecStringTree:()=>{}}),GE=new ot(AV,qc());function KE(){return Object.assign(e=>e,{option:e=>R(e),result:e=>$(e),is:e=>!0})}var jR=KE(),zR=KE(),BR="~effect/process/ChildProcessSpawner/ChildProcessHandle",OV={[BR]:BR,...Es,toJSON(){return{_id:"ChildProcessHandle",pid:this.pid}}},JE=e=>Object.setPrototypeOf({...e},OV),qR=e=>{let t=(r,o)=>e(r).pipe(ne(s=>fP(o?.includeStderr===!0?s.all:s.stdout)),Ws),n=(r,o)=>dP(t(r,o));return ri.of({spawn:e,exitCode:r=>zs(q(e(r),o=>o.exitCode)),streamString:t,streamLines:n,lines:(r,o)=>pP(n(r,o)),string:(r,o)=>mP(t(r,o))})},ri=class extends Je()("effect/process/ChildProcessSpawner"){};var WR="~effect/process/ChildProcess",_V={...to({label:"Command",evaluate(e){return no(e.context,ri).spawn(this)}}),[WR]:WR};var kh=(e,t,n)=>Object.assign(Object.create(_V),{_tag:"StandardCommand",command:e,args:t,options:n});var Ih=function(...t){if(HR(t[0])){let[s,...a]=t,i=VR(s,a);return kh(i[0]??"",i.slice(1),{})}if(typeof t[0]=="object"&&!Array.isArray(t[0])&&!HR(t[0])){let s=t[0];return function(a,...i){let c=VR(a,i);return kh(c[0]??"",c.slice(1),s)}}if(typeof t[0]=="string"&&!Array.isArray(t[1])){let[s,a={}]=t;return kh(s,[],a)}let[n,r=[],o={}]=t;return kh(n,r,o)};var HR=e=>Array.isArray(e)&&"raw"in e&&Array.isArray(e.raw),Ch=e=>{let t=/^fd(\d+)$/.exec(e);if(t===null)return;let n=parseInt(t[1],10);return n>=3?n:void 0},ZR=e=>`fd${e}`,VR=(e,t)=>{let n=[];for(let[r,o]of e.entries())n=PV(e,t,n,o,r);return n},PV=(e,t,n,r,o)=>{let s=e.raw[o];if(s===void 0)throw new Error(`Invalid backslash sequence: ${e.raw[o]}`);let{hasLeadingWhitespace:a,hasTrailingWhitespace:i,tokens:c}=RV(r,s),u=JR(n,c,a);if(o===t.length)return u;let l=t[o],f=Array.isArray(l)?l.map(d=>GR(d)):[GR(l)];return JR(u,f,i)},GR=e=>typeof e==="string"?e:String(e),KR=new Set([" ","	","\r",`
`]),FV={x:3,u:5},RV=(e,t)=>{if(t.length===0)return{tokens:[],hasLeadingWhitespace:!1,hasTrailingWhitespace:!1};let n=KR.has(t[0]),r=[],o=0;for(let a=0,i=0;a<e.length;a+=1,i+=1){let c=t[i];if(KR.has(c))o!==a&&r.push(e.slice(o,a)),o=a+1;else if(c==="\\"){let u=t[i+1];if(u===`
`)a-=1,i+=1;else if(u==="u"&&t[i+2]==="{"){let l=t.indexOf("}",i+3);parseInt(t.slice(i+3,l),16)>65535&&(a+=1),i=l}else i+=FV[u]??1}}let s=o===e.length;return s||r.push(e.slice(o)),{tokens:r,hasLeadingWhitespace:n,hasTrailingWhitespace:s}},JR=(e,t,n)=>n||e.length===0||t.length===0?[...e,...t]:[...e.slice(0,-1),`${e.at(-1)}${t.at(0)}`,...t.slice(1)];import*as Th from"node:child_process";import{PassThrough as ZE}from"node:stream";var QR=(e,t,n)=>{let r=e.detached??n!=="win32";return{...t,detached:r,shell:e.shell,windowsHide:e.windowsHide??!r}};var Le=(e,t)=>(n,[r])=>{let o="Unknown";switch(n.code){case"ENOENT":o="NotFound";break;case"EACCES":o="PermissionDenied";break;case"EEXIST":o="AlreadyExists";break;case"EISDIR":o="BadResource";break;case"ENOTDIR":o="BadResource";break;case"EBUSY":o="Busy";break;case"ELOOP":o="BadResource";break}return Gn({_tag:o,module:e,method:t,pathOrDescriptor:r,syscall:n.syscall,cause:n})};var nu=e=>FS(OS(NV(e),t=>[t])),NV=e=>cn(t=>{let n=e.evaluate();return b(DV({...e,writable:n,pull:t}))}),DV=e=>e.pull.pipe(q(t=>{let n=0;return nn(r=>{let o=!1,s=()=>{for(;n<t.length;){if(o)return;if(!e.writable.write(t[n++],e.encoding)){o||e.writable.once("drain",s);return}}o||r(ye)};return s(),pe(()=>{o=!0,e.writable.off("drain",s)})})}),ho({disableYield:!0}),e.endOnDone!==!1?Hn(t=>"closed"in e.writable&&e.writable.closed?Ot(t):nn(n=>{let r=()=>n(Ot(t));return e.writable.once("finish",r),e.writable.end(),pe(()=>{e.writable.off("finish",r)})})):F,za(nn(t=>{let n=r=>t(I(e.onError(r)));return e.writable.once("error",n),pe(()=>{e.writable.off("error",n)})})));var ru=e=>cr($V(e)),$V=e=>cn((t,n)=>LV({scope:n,readable:e.evaluate(),onError:e.onError??BV,chunkSize:e.chunkSize,closeOnDone:e.closeOnDone}));var LV=e=>{let t=e.readable,n=e.closeOnDone??!0,r=e.exit??g1(void 0),o=e.latch??p1(!1);function s(){o.openUnsafe()}function a(u){r.current=br(e.onError(u)),o.openUnsafe()}function i(){r.current=br(Sm()),o.openUnsafe()}t.on("readable",s),t.once("error",a),t.once("end",i);let c=ke(function u(){let l=e.readable.read(e.chunkSize);if(l===null)return r.current?r.current:t.readableEnded?I(Sm()):(o.closeUnsafe(),q(o.await,u));let f=ka(l);for(;l=e.readable.read(e.chunkSize),l!==null;)f.push(l);return b(f)});return En(Ll(e.scope,pe(()=>{t.off("readable",s),t.off("error",a),t.off("end",i),n&&"closed"in e.readable&&!e.readable.closed&&e.readable.destroy()})),c)};var BV=e=>new jO(e);var oi=e=>e instanceof globalThis.Error?e:new globalThis.Error(String(e)),To=(e,t,n)=>{let{commands:r}=nM(n),o=r.reduce((s,a)=>{let i=`${a.command} ${a.args.join(" ")}`;return s.length===0?i:`${s} | ${i}`},"");return Le("ChildProcess",e)(t,[o])},YR=1e3,zV=10,XR=(e,t)=>{if(!Eb(t))return!0;if(globalThis.process.platform==="win32")return!1;try{return globalThis.process.kill(-e.pid,0),!0}catch{return!1}},eM=(e,t=()=>{})=>Th.execFile("taskkill",["/pid",String(e.pid),"/T","/F"],{windowsHide:!0},t),qV=Dt(function*(){let e=yield*wr,t=yield*ur,n=B(function*(p){if(!bs(p.cwd))return yield*e.access(p.cwd),t.resolve(p.cwd)}),r=p=>p.extendEnv?{...globalThis.process.env,...p.env}:p.env,o=p=>Ga(p)?"pipe":p,s=p=>yf(p)?"pipe":p,a=p=>{let y={stream:"pipe",encoding:"utf-8",endOnDone:!0};return bs(p.stdin)?y:typeof p.stdin=="string"?{...y,stream:p.stdin}:Ga(p.stdin)?{...y,stream:p.stdin}:{stream:p.stdin.stream,encoding:p.stdin.encoding??y.encoding,endOnDone:p.stdin.endOnDone??y.endOnDone}},i=(p,y)=>{let S=p[y];return bs(S)?{stream:"pipe"}:typeof S=="string"?{stream:S}:yf(S)?{stream:S}:{stream:S.stream}},c=p=>{if(bs(p.additionalFds))return[];let y=[];for(let[S,v]of Object.entries(p.additionalFds)){let C=Ch(S);ct(C)&&y.push({fd:C,config:v})}return y.sort((S,v)=>S.fd-v.fd)},u=(p,y,S,v)=>{let C=[o(p.stream),s(y.stream),s(S.stream)];if(v.length===0)return C;let O=v.reduce((D,{fd:z})=>Math.max(D,z),2);for(let D=3;D<=O;D++)C[D]="ignore";for(let{fd:D}of v)C[D]="pipe";return C},l=B(function*(p,y,S){if(S.length===0)return{getInputFd:()=>bf,getOutputFd:()=>Mc};let v=new Map,C=new Map;for(let{config:O,fd:D}of S){let z=y.stdio[D];switch(O.type){case"input":{let ge=bf;z&&"write"in z&&(ge=nu({evaluate:()=>z,onError:X=>To(`fromWritable(fd${D})`,oi(X),p)})),O.stream&&(yield*Ac($S(O.stream,ge))),v.set(D,ge);break}case"output":{let ge=Mc;if(z&&"read"in z){let X=new ZE;z.on("error",we=>X.destroy(we)),z.pipe(X),ge=ru({evaluate:()=>X,onError:we=>To(`fromReadable(fd${D})`,oi(we),p)})}O.sink&&(ge=Zm(ge,O.sink)),C.set(D,ge);break}}}return{getInputFd:O=>v.get(O)??bf,getOutputFd:O=>C.get(O)??Mc}}),f=(p,y,S)=>ke(()=>{let v=bf;return Qu(y.stdin)&&(v=nu({evaluate:()=>y.stdin,onError:C=>To("fromWritable(stdin)",oi(C),p),endOnDone:S.endOnDone,encoding:S.encoding})),Ga(S.stream)?En(Ac($S(S.stream,v)),v):b(v)}),d=(p,y,S,v)=>{let C=y.stdout?(()=>{let z=new ZE;return y.stdout.on("error",ge=>z.destroy(ge)),y.stdout.pipe(z),ru({evaluate:()=>z,onError:ge=>To("fromReadable(stdout)",oi(ge),p)})})():Mc,O=y.stderr?(()=>{let z=new ZE;return y.stderr.on("error",ge=>z.destroy(ge)),y.stderr.pipe(z),ru({evaluate:()=>z,onError:ge=>To("fromReadable(stderr)",oi(ge),p)})})():Mc;yf(S.stream)&&(C=Zm(C,S.stream)),yf(v.stream)&&(O=Zm(O,v.stream));let D=lP(C,O);return{stdout:C,stderr:O,all:D}},m=(p,y)=>nn(S=>{let v=dm(),C=Th.spawn(p.command,p.args,y);return C.on("error",O=>{S(I(To("spawn",O,p)))}),C.on("exit",(...O)=>{pm(v,Ko(O))}),C.on("spawn",()=>{S(b([C,v]))}),pe(()=>{C.kill("SIGTERM")})}),g=(p,y,S)=>globalThis.process.platform==="win32"?nn(v=>{eM(y,C=>{v(C?I(To("kill",oi(C),p)):ye)})}):lt({try:()=>{globalThis.process.kill(-y.pid,S)},catch:v=>To("kill",oi(v),p)}),x=(p,y)=>{if(globalThis.process.platform==="win32"){eM(p);return}try{globalThis.process.kill(-p.pid,y)}catch{}},E=(p,y,S)=>ke(()=>{if(!y.kill(S)){let C=new globalThis.Error("Failed to kill child process");return I(To("kill",C,p))}return ye}),k=(p,y,S)=>nn(v=>{let C=Date.now()+S,O,D=()=>{clearTimeout(O),p.removeListener("exit",z)},z=()=>{if(clearTimeout(O),Date.now()>=C||!XR(p,y)){D(),v(ye);return}O=setTimeout(z,zV)};return p.on("exit",z),z(),pe(D)}),w=B(function*(p,y,S,v){let C=O=>g(p,y,O).pipe(Er(()=>E(p,y,O)));yield*C(v?.killSignal??"SIGTERM"),bs(v?.forceKillAfter)?yield*k(y,S,YR):(yield*k(y,S,Bo(v.forceKillAfter)),XR(y,S)&&(yield*C("SIGKILL"),yield*k(y,S,YR))),yield*dc(S)}),P=(p,y)=>{let S=y??"stdout";switch(S){case"stdout":return p.stdout;case"stderr":return p.stderr;case"all":return p.all;default:{let v=Ch(S);return ct(v)?p.getOutputFd(v):p.stdout}}},T=B(function*(p){switch(p._tag){case"StandardCommand":{let y=a(p.options),S=i(p.options,"stdout"),v=i(p.options,"stderr"),C=c(p.options),O=!0,D=yield*n(p.options),z=r(p.options),ge=u(y,S,v,C),[X,we]=yield*ir(m(p,QR(p.options,{cwd:D,env:z,stdio:ge},process.platform)),B(function*([Pn,Fi]){if(yield*Sb(Fi)){let[Hk]=yield*dc(Fi);Hk!==0&&Qu(Hk)?yield*wc(g(p,Pn,p.options.killSignal??"SIGTERM")):O&&process.platform!=="win32"&&p.options.detached!==!1&&(yield*wc(w(p,Pn,Fi,p.options)));return}O&&(yield*wc(w(p,Pn,Fi,p.options)))})),Ue=zR(X.pid);X.on("exit",Pn=>{Pn!==0&&Qu(Pn)&&x(X,p.options.killSignal??"SIGTERM")});let at=pe(()=>{O||(X.ref(),O=!0)}),ht=pe(()=>(O&&(X.unref(),O=!1),at)),yn=yield*f(p,X,y),{all:tr,stderr:Mo,stdout:Vu}=d(p,X,S,v),{getInputFd:gB,getOutputFd:xB}=yield*l(p,X,C),yB=ne(Sb(we),Pn=>!Pn),bB=q(dc(we),([Pn,Fi])=>{if(Qu(Pn))return b(jR(Pn));let Wk=new globalThis.Error(`Process interrupted due to receipt of signal: '${Fi}'`);return I(To("exitCode",Wk,p))});return JE({pid:Ue,exitCode:bB,isRunning:yB,kill:Pn=>w(p,X,we,Pn),stdin:yn,stdout:Vu,stderr:Mo,all:tr,getInputFd:gB,getOutputFd:xB,unref:ht})}case"PipedCommand":{let{commands:y,pipeOptions:S}=nM(p),[v,...C]=y,O=[yield*T(v)];for(let X=0;X<C.length;X++){let we=C[X],Ue=S[X]??{},at=a(we.options),ht=Ws(b(P(O[O.length-1],Ue.from))),yn=Ue.to??"stdin";if(yn==="stdin")O.push(yield*T(Ih(we.command,we.args,{...we.options,stdin:{...at,stream:ht}})));else{let tr=Ch(yn);if(ct(tr)){let Mo=ZR(tr),Vu=we.options.additionalFds??{};O.push(yield*T(Ih(we.command,we.args,{...we.options,additionalFds:{...Vu,[Mo]:{type:"input",stream:ht}}})))}else O.push(yield*T(Ih(we.command,we.args,{...we.options,stdin:{...at,stream:ht}})))}}let D=O[O.length-1],z=X=>ja([...O].reverse(),we=>wc(we.kill(X)),{discard:!0}),ge=Dt(function*(){let X=[];for(let we of O)X.push(yield*we.unref);return ja([...X].reverse(),we=>we,{discard:!0})});return JE({pid:D.pid,exitCode:D.exitCode,isRunning:D.isRunning,kill:z,stdin:O[0].stdin,stdout:D.stdout,stderr:D.stderr,all:D.all,getInputFd:D.getInputFd,getOutputFd:D.getOutputFd,unref:ge})}}});return qR(T)}),tM=mc(ri,qV),nM=e=>{let t=[],n=[],r=i=>{switch(i._tag){case"StandardCommand":{t.push(i);break}case"PipedCommand":{r(i.left),n.push(i.options),r(i.right);break}}};if(r(e),t.length===0)throw new Error("flattenCommand produced empty commands array");let[o,...s]=t;return{commands:[o,...s],pipeOptions:n}};var QE="~effect/http/Cookies",oM=e=>_(e,QE),YE="~effect/http/Cookies/Cookie",sM=e=>_(e,YE),rM="~effect/http/Cookies/CookieError",XE=class extends Op{},si=class e extends hr("CookiesError"){static fromReason(t,n){return new e({reason:new XE({_tag:t,cause:n})})}[rM]=rM;get message(){return this.reason._tag}};var WV={[QE]:QE,...Es,toJSON(){return{_id:"effect/Cookies",cookies:hp(this.cookies,e=>e.toJSON())}},pipe(){return re(this,arguments)}},tv=e=>{let t=Object.create(WV);return t.cookies=e,t},nv=e=>{let t={};for(let n of e)N(t,n.name,n);return tv(t)},aM=e=>{let t=typeof e=="string"?[e]:e,n=[];for(let r of t){let o=HV(r.trim());o&&n.push(o)}return nv(n)};function HV(e){let t=e.split(";").map(i=>i.trim()).filter(i=>i!=="");if(t.length===0)return;let n=t[0].indexOf("=");if(n===-1)return;let r=t[0].slice(0,n);if(!iM.test(r))return;let o=t[0].slice(n+1),s=QV(o);if(t.length===1)return Object.assign(Object.create(ev),{name:r,value:s,valueEncoded:o});let a={};for(let i=1;i<t.length;i++){let c=t[i],u=c.indexOf("="),l=u===-1?c:c.slice(0,u).trim(),f=u===-1?void 0:c.slice(u+1).trim();switch(l.toLowerCase()){case"domain":{if(f===void 0)break;let d=f.trim().replace(/^\./,"");d&&(a.domain=d);break}case"expires":{if(f===void 0)break;let d=new Date(f);isNaN(d.getTime())||(a.expires=d);break}case"max-age":{if(f===void 0)break;let d=parseInt(f,10);isNaN(d)||(a.maxAge=Yx(d));break}case"path":{if(f===void 0)break;f[0]==="/"&&(a.path=f);break}case"priority":{if(f===void 0)break;switch(f.toLowerCase()){case"low":a.priority="low";break;case"medium":a.priority="medium";break;case"high":a.priority="high";break}break}case"httponly":{a.httpOnly=!0;break}case"secure":{a.secure=!0;break}case"partitioned":{a.partitioned=!0;break}case"samesite":{if(f===void 0)break;switch(f.toLowerCase()){case"lax":a.sameSite="lax";break;case"strict":a.sameSite="strict";break;case"none":a.sameSite="none";break}break}}}return Object.assign(Object.create(ev),{name:r,value:s,valueEncoded:o,options:Object.keys(a).length>0?a:void 0})}var VV=/^[\u0009\u0020-\u007e\u0080-\u00ff]+$/,iM=/^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/,GV=/^[\u0009\u0020-\u003a\u003c-\u007e\u0080-\u00ff]+$/,KV=/^[\u0020-\u003a\u003c-\u007e]+$/,ev={[YE]:YE,...Es,toJSON(){return{_id:"effect/Cookies/Cookie",name:this.name,value:this.value,options:this.options}}};function JV(e,t,n){let r=encodeURIComponent(t),o=cM(e,r,n);return o!==void 0?K(o):$(Object.assign(Object.create(ev),{name:e,value:t,valueEncoded:r,options:n}))}function cM(e,t,n){if(!iM.test(e))return si.fromReason("InvalidCookieName");if(t&&!VV.test(t))return si.fromReason("InvalidCookieValue");if(n?.domain!==void 0&&!GV.test(n.domain))return si.fromReason("InvalidCookieDomain");if(n?.path!==void 0&&!KV.test(n.path))return si.fromReason("InvalidCookiePath");if(n?.maxAge!==void 0&&!Ap(Rt(n.maxAge)))return si.fromReason("CookieInfinityMaxAge")}var uM=(e,t,n)=>Ea(JV(e,t,n));function ZV(e){let t=cM(e.name,e.valueEncoded,e.options);if(t!==void 0)throw t;let n=e.name+"="+e.valueEncoded;if(e.options===void 0)return n;let r=e.options;if(r.maxAge!==void 0){let o=uC(Rt(r.maxAge));n+="; Max-Age="+Math.trunc(o)}if(r.domain!==void 0&&(n+="; Domain="+r.domain),r.path!==void 0&&(n+="; Path="+r.path),r.priority!==void 0)switch(r.priority){case"low":n+="; Priority=Low";break;case"medium":n+="; Priority=Medium";break;case"high":n+="; Priority=High";break}if(r.expires!==void 0&&(n+="; Expires="+r.expires.toUTCString()),r.httpOnly&&(n+="; HttpOnly"),r.secure&&(n+="; Secure"),r.partitioned&&(n+="; Partitioned"),r.sameSite!==void 0)switch(r.sameSite){case"lax":n+="; SameSite=Lax";break;case"strict":n+="; SameSite=Strict";break;case"none":n+="; SameSite=None";break}return n}var lM=e=>{let t={},n=Object.values(e.cookies);for(let r=0;r<n.length;r++){let o=n[r];N(t,o.name,o.value)}return t},fM=e=>Object.values(e.cookies).map(ZV);var QV=e=>{try{return decodeURIComponent(e)}catch{return e}};var ai=new WeakMap,dM=e=>{if(ai.has(e))return ai.get(e);throw new Error("Unable to get redacted value"+(e.label?` with label: "${e.label}"`:""))};var pM="~effect/Redacted",rv=e=>_(e,pM),_r=(e,t)=>{let n=Object.create(e5);return t?.label&&(n.label=t.label),ai.set(n,e),n},e5={[pM]:{_A:e=>e},label:void 0,...Jt,toJSON(){return this.toString()},toString(){return`<redacted${pr(this.label)?":"+this.label:""}>`},[oe](){return G(ai.get(this))},[se](e){return rv(e)&&Q(ai.get(this),ai.get(e))}},Zs=dM;var mM=e=>Qt((t,n)=>e(Zs(t),Zs(n)));var ov=Symbol.for("~effect/http/Headers"),hM=e=>_(e,ov),sv=Object.defineProperties(Object.create(null),{[ov]:{value:ov},[da]:{value(e){return n5(this,rt(e,r5))}},toJSON:{value(){return Ss(this)}},[se]:{value(e){return av(this,e)}},[oe]:{value(){return Xu(this)}},toString:{value:Es.toString},[Ee]:{value:Es[Ee]}});var av=WI(ya()),t5=Object.create(sv),gM=e=>{if(e===void 0)return t5;if(Symbol.iterator in e){let n=Object.create(sv);for(let[r,o]of e)n[r.toLowerCase()]=o;return n}let t=Object.create(sv);for(let[n,r]of Object.entries(e))Array.isArray(r)?t[n.toLowerCase()]=r.join(", "):r!==void 0&&(t[n.toLowerCase()]=r);return t};var n5=h(2,(e,t)=>{let n={...e},r=o=>{if(typeof o=="string"){let s=o.toLowerCase();s in e&&(n[s]=_r(e[s]))}else for(let s in e)s.search(o)!==-1&&(n[s]=_r(e[s]))};if(Array.isArray(t))for(let o=0;o<t.length;o++)r(t[o]);else r(t);return n});var r5=xe("effect/Headers/CurrentRedactedNames",{defaultValue:()=>["authorization","cookie","set-cookie","x-api-key"]});var fs={};qr(fs,{Any:()=>eK,Array:()=>Se,ArrayEnsure:()=>fK,BigDecimal:()=>T2,BigDecimalFromString:()=>HJ,BigInt:()=>Eu,BigIntFromString:()=>OJ,Boolean:()=>Cw,BooleanFromBit:()=>DJ,BooleanLiterals:()=>_w,ByteSize:()=>kg,ByteSizeFromBigInt:()=>GJ,ByteSizeFromNumber:()=>KJ,ByteSizeFromString:()=>VJ,Cause:()=>vw,CauseReason:()=>Ew,Char:()=>hJ,Chunk:()=>JJ,Class:()=>oU,Cookie:()=>eU,Cookies:()=>tU,Date:()=>Iu,DateFromMillis:()=>vJ,DateFromString:()=>EJ,DateTimeUtc:()=>Ig,DateTimeUtcFromDate:()=>t8,DateTimeUtcFromMillis:()=>r8,DateTimeUtcFromString:()=>n8,DateTimeZoned:()=>W2,DateTimeZonedFromString:()=>i8,Defect:()=>Uw,Duration:()=>Tg,DurationFromMillis:()=>Q8,DurationFromNanos:()=>Z8,DurationFromString:()=>J8,Enum:()=>Y6,Error:()=>Ag,ErrorInstance:()=>gJ,Exit:()=>Y8,FalseLiterals:()=>bg,File:()=>S2,Finite:()=>ku,FiniteFromString:()=>AJ,FormData:()=>E2,Graph:()=>nZ,HashMap:()=>rZ,HashSet:()=>oZ,Headers:()=>uZ,InetAddress:()=>Y2,InetAddressFromString:()=>z8,InetAddressV4:()=>B8,InetAddressV6:()=>j8,Int:()=>_o,IpAddress:()=>bi,IpAddressFromString:()=>Tu,IpInterface:()=>K2,IpInterfaceFromString:()=>D8,IpLinkLocalAddress:()=>v8,IpLinkLocalAddressFromString:()=>w8,IpLoopbackAddress:()=>S8,IpLoopbackAddressFromString:()=>E8,IpMulticastAddress:()=>c8,IpMulticastAddressFromString:()=>u8,IpNetwork:()=>Q2,IpNetworkFromString:()=>L8,IpUnicastAddress:()=>d8,IpUnicastAddressFromString:()=>p8,IpUnspecifiedAddress:()=>k8,IpUnspecifiedAddressFromString:()=>I8,Ipv4Address:()=>Cg,Ipv4AddressFromString:()=>Bw,Ipv4BroadcastAddress:()=>g8,Ipv4BroadcastAddressFromString:()=>x8,Ipv4Interface:()=>V2,Ipv4InterfaceFromString:()=>M8,Ipv4Network:()=>J2,Ipv4NetworkFromString:()=>U8,Ipv4PrivateAddress:()=>C8,Ipv4PrivateAddressFromString:()=>T8,Ipv6Address:()=>jw,Ipv6AddressFromString:()=>H2,Ipv6Interface:()=>G2,Ipv6InterfaceFromString:()=>N8,Ipv6Network:()=>Z2,Ipv6NetworkFromString:()=>$8,Ipv6UniqueLocalAddress:()=>A8,Ipv6UniqueLocalAddressFromString:()=>O8,Json:()=>Og,JsonFromUrlParamsField:()=>lZ,JsonObject:()=>UZ,Literal:()=>St,Literals:()=>ea,MacAddress:()=>yi,MacAddressFromString:()=>Cu,MacBroadcastAddress:()=>y8,MacBroadcastAddressFromString:()=>b8,MacLocallyAdministeredAddress:()=>_8,MacLocallyAdministeredAddressFromString:()=>P8,MacMulticastAddress:()=>l8,MacMulticastAddressFromString:()=>f8,MacUnicastAddress:()=>m8,MacUnicastAddressFromString:()=>h8,MacUniversallyAdministeredAddress:()=>F8,MacUniversallyAdministeredAddressFromString:()=>R8,MutableJson:()=>LZ,Natural:()=>hi,Never:()=>X6,NonEmptyArray:()=>Aw,NonEmptyString:()=>mJ,Null:()=>hg,NullOr:()=>Ow,NullishOr:()=>KD,Number:()=>md,NumberFromString:()=>TJ,ObjectKeyword:()=>rK,Opaque:()=>kK,Option:()=>Si,OptionFromNullOr:()=>sZ,OptionFromNullishOr:()=>iZ,OptionFromOptional:()=>pZ,OptionFromOptionalKey:()=>dZ,OptionFromOptionalNullOr:()=>mZ,OptionFromUndefinedOr:()=>aZ,PropertyKey:()=>Sw,ReadonlyMap:()=>xJ,ReadonlySet:()=>yJ,Record:()=>xi,RecordFromCookies:()=>cZ,RecordFromUrlParams:()=>fZ,Redacted:()=>nU,RedactedFromValue:()=>hZ,RegExp:()=>bJ,Result:()=>gZ,SchemaError:()=>gi,SocketAddress:()=>W8,StandardSchemaV1FailureResult:()=>NJ,String:()=>L,StringForLiteralAutocomplete:()=>tK,StringFromBase64:()=>PJ,StringFromBase64Url:()=>FJ,StringFromHex:()=>RJ,StringFromUriComponent:()=>MJ,Struct:()=>Te,StructWithRest:()=>uK,Symbol:()=>HD,TaggedClass:()=>SZ,TaggedError:()=>Lr,TaggedStruct:()=>Sg,TaggedUnion:()=>wK,TemplateLiteral:()=>Z6,TemplateLiteralParser:()=>Q6,TimeZone:()=>z2,TimeZoneFromString:()=>a8,TimeZoneNamed:()=>B2,TimeZoneNamedFromString:()=>s8,TimeZoneOffset:()=>o8,Tree:()=>DZ,Trim:()=>_J,Trimmed:()=>w2,TrueLiterals:()=>yg,Tuple:()=>Oo,TupleWithRest:()=>lK,URL:()=>y2,URLFromString:()=>SJ,URLSearchParams:()=>v2,Uint8Array:()=>wg,Uint8ArrayFromBase64:()=>UJ,Uint8ArrayFromBase64Url:()=>$J,Uint8ArrayFromHex:()=>LJ,Undefined:()=>Iw,UndefinedOr:()=>xg,Union:()=>st,UniqueArray:()=>dK,UniqueSymbol:()=>oK,UnixPathAddress:()=>X2,UnixPathAddressFromString:()=>q8,Unknown:()=>pd,UnknownFromJsonString:()=>kJ,UrlParams:()=>zw,Void:()=>nK,annotate:()=>k6,annotateEncoded:()=>I6,annotateKey:()=>C6,asserts:()=>_6,brand:()=>QD,catchDecoding:()=>gK,catchDecodingWithContext:()=>e2,catchEncoding:()=>xK,catchEncodingWithContext:()=>t2,check:()=>mK,declare:()=>Be,declareConstructor:()=>Cn,decode:()=>yK,decodeEffect:()=>P6,decodeExit:()=>F6,decodeOption:()=>M6,decodePromise:()=>D6,decodeResult:()=>N6,decodeSync:()=>U6,decodeTo:()=>Z,decodeUnknownEffect:()=>us,decodeUnknownExit:()=>DD,decodeUnknownOption:()=>R6,decodeUnknownPromise:()=>$D,decodeUnknownResult:()=>UD,decodeUnknownSync:()=>LD,encode:()=>bK,encodeEffect:()=>$6,encodeExit:()=>L6,encodeKeys:()=>iK,encodeOption:()=>j6,encodePromise:()=>q6,encodeResult:()=>z6,encodeSync:()=>W6,encodeTo:()=>Pw,encodeUnknownEffect:()=>pg,encodeUnknownExit:()=>BD,encodeUnknownOption:()=>B6,encodeUnknownPromise:()=>zD,encodeUnknownResult:()=>jD,encodeUnknownSync:()=>qD,extendTo:()=>cK,fieldsAssign:()=>sK,flip:()=>bw,fromBrand:()=>hK,fromFormData:()=>IJ,fromJsonString:()=>$w,fromURLSearchParams:()=>CJ,instanceOf:()=>ta,is:()=>dg,isBase64:()=>i2,isBase64Url:()=>RK,isBetween:()=>Eg,isBetweenBigDecimal:()=>WJ,isBetweenBigInt:()=>rJ,isBetweenCodePoints:()=>aJ,isBetweenDate:()=>XK,isBetweenLength:()=>Mw,isBetweenProperties:()=>dJ,isBetweenSize:()=>uJ,isCapitalized:()=>LK,isEndingWith:()=>NK,isFinite:()=>jK,isGUID:()=>PK,isGreaterThan:()=>qK,isGreaterThanBigDecimal:()=>BJ,isGreaterThanBigInt:()=>eJ,isGreaterThanDate:()=>JK,isGreaterThanOrEqualTo:()=>c2,isGreaterThanOrEqualToBigDecimal:()=>jJ,isGreaterThanOrEqualToBigInt:()=>u2,isGreaterThanOrEqualToDate:()=>ZK,isIncluding:()=>DK,isInt:()=>vg,isInt32:()=>GK,isLessThan:()=>WK,isLessThanBigDecimal:()=>zJ,isLessThanBigInt:()=>tJ,isLessThanDate:()=>QK,isLessThanOrEqualTo:()=>HK,isLessThanOrEqualToBigDecimal:()=>qJ,isLessThanOrEqualToBigInt:()=>nJ,isLessThanOrEqualToDate:()=>YK,isLowercased:()=>$K,isMaxCodePoints:()=>sJ,isMaxLength:()=>p2,isMaxProperties:()=>fJ,isMaxSize:()=>cJ,isMinCodePoints:()=>oJ,isMinLength:()=>l2,isMinProperties:()=>lJ,isMinSize:()=>iJ,isMultipleOf:()=>VK,isNonEmpty:()=>d2,isPattern:()=>wu,isPropertyNames:()=>pJ,isSchema:()=>mg,isSchemaError:()=>PD,isStartingWith:()=>MK,isStringBigInt:()=>TK,isStringFinite:()=>CK,isStringSymbol:()=>AK,isTrimmed:()=>a2,isULID:()=>FK,isUUID:()=>_K,isUint32:()=>KK,isUncapitalized:()=>BK,isUnique:()=>Dw,isUniqueKey:()=>m2,isUppercased:()=>UK,link:()=>ve,linkDecoding:()=>vu,make:()=>H,makeFilter:()=>Fe,makeFilterGroup:()=>IK,makeIsBetween:()=>bd,makeIsGreaterThan:()=>hd,makeIsGreaterThanOrEqualTo:()=>gd,makeIsLessThan:()=>xd,makeIsLessThanOrEqualTo:()=>yd,makeIsMultipleOf:()=>zK,middlewareDecoding:()=>YD,middlewareEncoding:()=>XD,mutable:()=>pK,mutableKey:()=>G6,optional:()=>ls,optionalKey:()=>is,overrideToCodecIso:()=>MZ,overrideToEquivalence:()=>wZ,overrideToFormatter:()=>EZ,readonlyKey:()=>K6,refine:()=>ZD,required:()=>V6,requiredKey:()=>H6,resolveAnnotations:()=>BZ,resolveAnnotationsKey:()=>jZ,revealBottom:()=>w6,revealCodec:()=>T6,suspend:()=>JD,tag:()=>cs,tagDefaultOmit:()=>vK,toCodecArrayFromSingle:()=>OZ,toCodecIso:()=>AZ,toCodecJson:()=>TZ,toCodecStringTree:()=>Ww,toDifferJsonPatch:()=>NZ,toEncoded:()=>Su,toEncoderXml:()=>_Z,toEquivalence:()=>kZ,toFormatter:()=>vZ,toIso:()=>PZ,toIsoFocus:()=>RZ,toIsoSource:()=>FZ,toJsonSchemaDocument:()=>CZ,toRepresentation:()=>IZ,toStandardJSONSchemaV1:()=>O6,toStandardSchemaV1:()=>A6,toTaggedUnion:()=>s2,toType:()=>Tn,withArrayLengthConstraints:()=>gg,withConstructorDefault:()=>n2,withDecodingDefault:()=>o2,withDecodingDefaultKey:()=>Fw,withDecodingDefaultType:()=>EK,withDecodingDefaultTypeKey:()=>SK});var Oh="~effect/HashMap",Pr=5,zf=1<<Pr,s5=zf/4,xM=zf/2,a5=zf-1,i5=e=>(e=e-(e>>>1&1431655765),e=(e&858993459)+(e>>>2&858993459),(e+(e>>>4)&252645135)*16843009>>>24),jf=(e,t)=>e>>>t&a5,Qs=(e,t)=>1<<jf(e,t),Ah=(e,t)=>i5(e&t-1);function yM(e,t,n,r,o,s){if(t>32)throw new Error("HashMap: max depth exceeded");let a=Qs(n,t),i=Qs(o,t);if(a===i){let l=yM(e,t+Pr,n,r,o,s);return new ui(e,a,[l])}let c=a|i,u=a>>>0<i>>>0?[r,s]:[s,r];return new ui(e,c,u)}var c5=Ie("HashMap"),bM=(e,t)=>ce(G(e),G(t)),SM=e=>{let t=0;for(let n=0;n<e.length;n++){let r=e[n];r&&(t^=r.subtreeHash())}return t},ii=class{canEdit(t){return this.edit===t}subtreeHash(){let t=this._hash;if(t===void 0){let n=la;t=this.computeHash(),n===la&&(this._hash=t)}return t}},iv=class extends ii{_tag="EmptyNode";edit=0;get size(){return 0}get(t,n,r){return A()}has(t,n,r){return!1}set(t,n,r,o,s,a){return a.value=!0,new ci(t,r,o,s)}remove(t,n,r,o,s){return this}canEdit(t){return!1}computeHash(){return 0}},ci=class e extends ii{_tag="LeafNode";edit;hash;key;value;constructor(t,n,r,o){super(),this.edit=t,this.hash=n,this.key=r,this.value=o}get size(){return 1}get(t,n,r){return this.hash===n&&Q(this.key,r)?R(this.value):A()}has(t,n,r){return this.hash===n&&Q(this.key,r)}set(t,n,r,o,s,a){if(this.canEdit(t)&&(this._hash=void 0),this.hash===r&&Q(this.key,o))return Q(this.value,s)?this:this.canEdit(t)?(this.value=s,this):new e(t,r,o,s);if(a.value=!0,this.hash===r)return new cv(t,r,[[this.key,this.value],[o,s]]);let i=Qs(r,n),c=Qs(this.hash,n);if(i===c)return new ui(t,i,[this.set(t,n+Pr,r,o,s,a)]);let u=i|c,l=i>>>0<c>>>0?[new e(t,r,o,s),this]:[this,new e(t,r,o,s)];return new ui(t,u,l)}remove(t,n,r,o,s){if(this.hash===r&&Q(this.key,o)){s.value=!0;return}return this}computeHash(){return bM(this.key,this.value)}},cv=class e extends ii{_tag="CollisionNode";edit;hash;entries;constructor(t,n,r){super(),this.edit=t,this.hash=n,this.entries=r}get size(){return this.entries.length}get(t,n,r){if(this.hash!==n)return A();for(let[o,s]of this.entries)if(Q(o,r))return R(s);return A()}has(t,n,r){if(this.hash!==n)return!1;for(let[o]of this.entries)if(Q(o,r))return!0;return!1}set(t,n,r,o,s,a){if(this.canEdit(t)&&(this._hash=void 0),this.hash!==r)return a.value=!0,yM(t,n,this.hash,this,r,new ci(t,r,o,s));for(let i=0;i<this.entries.length;i++)if(Q(this.entries[i][0],o)){if(Q(this.entries[i][1],s))return this;if(this.canEdit(t))return this.entries[i]=[o,s],this;let c=[...this.entries];return c[i]=[o,s],new e(t,this.hash,c)}return a.value=!0,this.canEdit(t)?(this.entries.push([o,s]),this):new e(t,this.hash,[...this.entries,[o,s]])}remove(t,n,r,o,s){if(this.canEdit(t)&&(this._hash=void 0),this.hash!==r)return this;let a=this.entries.findIndex(([c])=>Q(c,o));if(a===-1)return this;if(s.value=!0,this.entries.length===1)return;if(this.entries.length===2){let c=this.entries[a===0?1:0];return new ci(t,this.hash,c[0],c[1])}if(this.canEdit(t))return this.entries.splice(a,1),this;let i=[...this.entries];return i.splice(a,1),new e(t,this.hash,i)}computeHash(){let t=0,n=this.entries;for(let r=0;r<n.length;r++)t^=bM(n[r][0],n[r][1]);return t}},ui=class e extends ii{_tag="IndexedNode";edit;_size;bitmap;children;constructor(t,n,r){super(),this.edit=t,this.bitmap=n,this.children=r}get size(){return this._size===void 0&&(this._size=this.children.reduce((t,n)=>t+n.size,0)),this._size}get(t,n,r){let o=Qs(n,t);if((this.bitmap&o)===0)return A();let s=Ah(this.bitmap,o);return this.children[s].get(t+Pr,n,r)}has(t,n,r){let o=Qs(n,t);if((this.bitmap&o)===0)return!1;let s=Ah(this.bitmap,o);return this.children[s].has(t+Pr,n,r)}set(t,n,r,o,s,a){this.canEdit(t)&&(this._hash=void 0);let i=Qs(r,n),c=Ah(this.bitmap,i);if((this.bitmap&i)!==0){let u=this.children[c],l=u.set(t,n+Pr,r,o,s,a);if(u===l)return this;if(this.canEdit(t))return this.children[c]=l,this;let f=[...this.children];return f[c]=l,new e(t,this.bitmap,f)}else{a.value=!0;let u=new ci(t,r,o,s),l=this.bitmap|i;if(this.canEdit(t))return this.children.splice(c,0,u),this.bitmap=l,this._size=void 0,this.children.length>xM?this.expand(t,l,this.children):this;let f=[...this.children];return f.splice(c,0,u),f.length>xM?this.expand(t,l,f):new e(t,l,f)}}remove(t,n,r,o,s){this.canEdit(t)&&(this._hash=void 0);let a=Qs(r,n);if((this.bitmap&a)===0)return this;let i=Ah(this.bitmap,a),c=this.children[i],u=c.remove(t,n+Pr,r,o,s);if(!s.value)return this;if(u===void 0){let f=this.bitmap^a;if(f===0)return;if(this.children.length===2){let m=this.children[i===0?1:0];if(m._tag==="LeafNode")return m}if(this.canEdit(t))return this.children.splice(i,1),this.bitmap=f,this._size=void 0,this;let d=[...this.children];return d.splice(i,1),new e(t,f,d)}if(c===u)return this;if(this.canEdit(t))return this.children[i]=u,this;let l=[...this.children];return l[i]=u,new e(t,this.bitmap,l)}expand(t,n,r){let o=new globalThis.Array(zf),s=0;for(let a=0;a<zf;a++)(n&1<<a)!==0&&(o[a]=r[s++]);return new uv(t,r.length,o)}computeHash(){return SM(this.children)}},uv=class e extends ii{_tag="ArrayNode";edit;_size;count;children;constructor(t,n,r){super(),this.edit=t,this.count=n,this.children=r}get size(){return this._size===void 0&&(this._size=this.children.reduce((t,n)=>t+(n?.size??0),0)),this._size}get(t,n,r){let o=jf(n,t),s=this.children[o];return s?s.get(t+Pr,n,r):A()}has(t,n,r){let o=jf(n,t),s=this.children[o];return s?s.has(t+Pr,n,r):!1}set(t,n,r,o,s,a){this.canEdit(t)&&(this._hash=void 0);let i=jf(r,n),c=this.children[i];if(c){let u=c.set(t,n+Pr,r,o,s,a);if(c===u)return this;if(this.canEdit(t))return this.children[i]=u,this;let l=[...this.children];return l[i]=u,new e(t,this.count,l)}else{a.value=!0;let u=new ci(t,r,o,s);if(this.canEdit(t))return this.children[i]=u,this.count++,this._size=void 0,this;let l=[...this.children];return l[i]=u,new e(t,this.count+1,l)}}remove(t,n,r,o,s){this.canEdit(t)&&(this._hash=void 0);let a=jf(r,n),i=this.children[a];if(!i)return this;let c=i.remove(t,n+Pr,r,o,s);if(!s.value)return this;let u=this.count-(c?0:1);if(u<s5)return this.pack(t,a,c);if(i===c)return this;if(this.canEdit(t))return this.children[a]=c,c||(this.count=u),this._size=void 0,this;let l=[...this.children];return l[a]=c,new e(t,u,l)}pack(t,n,r){let o=[],s=0,a=1;for(let i=0;i<this.children.length;i++){let c=i===n?r:this.children[i];c&&(o.push(c),s|=a),a<<=1}return new ui(t,s,o)}computeHash(){return SM(this.children)}},_h=class{stack;project;entries=[];index=0;constructor(t,n){this.stack=[t],this.project=n}next(){for(;;){if(this.index<this.entries.length){let n=this.entries[this.index++];return{done:!1,value:this.project(n[0],n[1])}}if(this.stack.length===0)return{done:!0,value:void 0};let t=this.stack.pop();switch(t._tag){case"LeafNode":{let n=t;return{done:!1,value:this.project(n.key,n.value)}}case"CollisionNode":{this.entries=t.entries,this.index=0;break}case"IndexedNode":case"ArrayNode":{let n=t.children;for(let r=n.length-1;r>=0;r--){let o=n[r];o&&this.stack.push(o)}}}}}[Symbol.iterator](){return this}},u5=(e,t)=>[e,t];var qf=class{[Oh]=Oh;_editable;_edit;_root;_size;constructor(t,n,r,o){this._editable=t,this._edit=n,this._root=r,this._size=o}get size(){return this._size}[Symbol.iterator](){return new _h(this._root,u5)}[se](t){if(lv(t)){let n=t;if(this.size!==n.size)return!1;for(let[r,o]of this){let s=Wr(t,wM(r));if(He(s)||!Q(o,s.value))return!1}return!0}return!1}[oe](){return $t(c5^this._root.subtreeHash())}[Ee](){return Lt(this)}toString(){return`HashMap(${M(Array.from(this))})`}toJSON(){return{_id:"HashMap",values:Array.from(this).map(([t,n])=>[Lt(t),Lt(n)])}}pipe(){return re(this,arguments)}},EM=new iv,lv=e=>_(e,Oh),fv=()=>new qf(!1,0,EM,0);var vM=e=>{let t=EM,n=0,r={value:!1};for(let[o,s]of e){let a=G(o);r.value=!1,t=t.set(NaN,0,a,o,s,r),r.value&&n++}return new qf(!1,0,t,n)};var wM=h(2,(e,t)=>e._root.get(0,G(t),t));var dv=h(2,(e,t)=>e._root.has(0,G(t),t));var l5=(e,t,n,r)=>{let o=e,s={value:!1},a=o._editable?o._edit:NaN,i=o._root.set(a,0,n,t,r,s);return o._editable?(o._root=i,s.value&&o._size++,e):o._root===i?e:new qf(!1,o._edit,i,o._size+(s.value?1:0))},pv=h(3,(e,t,n)=>l5(e,t,G(t),n)),mv=e=>new _h(e._root,F);var kM=e=>e[Symbol.iterator](),Ph=e=>e.size;var CM=lv;var hv=vM;var p5=kM,Wf=e=>Array.from(p5(e)),TM=Ph;var Hf="~effect/HashSet",m5=Ie(Hf),h5={[oe](){return $t(ce(m5,G(Fh(this))))},[se](e){return xv(e)&&Rh(this)===Rh(e)&&_M(this,t=>OM(e,t))},[Symbol.iterator](){return mv(Fh(this))},toString(){return`HashSet(${M(Array.from(this))})`},toJSON(){return{_id:"HashSet",values:Lt(Array.from(this))}},[Ee](){return this.toJSON()},pipe(){return re(this,arguments)}},g5=e=>{let t=Object.create(h5);return t[Hf]=Hf,t.keyMap=e,t},xv=e=>_(e,Hf),Fh=e=>e.keyMap;var AM=e=>{let t=fv();for(let n of e)t=pv(t,n,!0);return g5(t)},OM=(e,t)=>dv(Fh(e),t);var Rh=e=>Ph(Fh(e));var _M=(e,t)=>{for(let n of e)if(!t(n))return!1;return!0};var yv=AM,PM=xv;var FM=Rh;var Sv="~effect/http/UrlParams",Ev=e=>_(e,Sv),y5={...Jt,[Sv]:Sv,[Symbol.iterator](){return this.params[Symbol.iterator]()},toJSON(){return{_id:"UrlParams",params:Object.fromEntries(this.params)}},[se](e){return vv(this,e)},[oe](){return Vr(this.params.flat())}},Mh=e=>{let t=Object.create(y5);return t.params=e,t},RM=e=>{if(Ev(e))return e;let t=MM(e),n=[];for(let r=0;r<t.length;r++)if(Array.isArray(t[r][0])){let[o,s]=t[r];n.push([`${o[0]}[${o.slice(1).join("][")}]`,s])}else n.push(t[r]);return Mh(n)},MM=e=>{let t=typeof e[Symbol.iterator]=="function"?Yt(e):Object.entries(e),n=[];for(let[r,o]of t)if(Array.isArray(o))for(let s=0;s<o.length;s++)o[s]!==void 0&&n.push([r,String(o[s])]);else if(o!==null&&typeof o=="object"){let s=MM(o);for(let[a,i]of s)n.push([[r,...typeof a=="string"?[a]:a],i])}else o!==void 0&&n.push([r,String(o)]);return n},vv=Qt((e,t)=>b5(e.params,t.params)),b5=HI(LI([ya(),ya()]));var NM=h(2,(e,t)=>hl(e.params,([n])=>n===t).pipe(As(([,n])=>n)));var S5=e=>{let t={};for(let[n,r]of e.params)if(!Object.hasOwn(t,n))N(t,n,r);else{let o=t[n];typeof o=="string"?N(t,n,[o,r]):o.push(r)}return t},DM=S5;var wv="~effect/Graph",kv=e=>_(e,wv),UM=e=>e;var v5=(e,t,n)=>(e==="directed"?t.source===n.source&&t.target===n.target:t.source===n.source&&t.target===n.target||t.source===n.target&&t.target===n.source)&&Q(t.data,n.data),w5=(e,t)=>e==="directed"?G(t):$t(ce(G(t.data),k5(t.source,t.target))),k5=(e,t)=>ce(0,G(e))+ce(0,G(t)),I5=Ie("Graph"),C5={[wv]:{_N:e=>e,_E:e=>e},[Symbol.iterator](){return this.nodes[Symbol.iterator]()},[Ee](){return this.toJSON()},[se](e){if(_(e,wv)){let t=UM(e);if(this.nodes.size!==t.nodes.size||this.edges.size!==t.edges.size||this.type!==t.type)return!1;for(let[n,r]of this.nodes)if(!t.nodes.has(n)||!Q(r,t.nodes.get(n)))return!1;for(let[n,r]of this.edges){let o=t.edges.get(n);if(o===void 0||!v5(this.type,r,o))return!1}return!0}return!1},[oe](){let e=I5;e=e^Ie(this.type),e=e^Et(this.nodes.size),e=e^Et(this.edges.size);for(let[t,n]of this.nodes)e^=ce(G(t),G(n));for(let[t,n]of this.edges)e^=ce(G(t),w5(this.type,n));return $t(e)},toJSON(){return{_id:"Graph",nodeCount:this.nodes.size,edgeCount:this.edges.size,type:this.type}},toString(){return`Graph(${this.type}, ${this.nodes.size}, ${this.edges.size})`},pipe(){return re(this,arguments)}},T5=(e,t)=>{let n=Object.create(C5);return n.type=e,n.mutable=t,n.transforming=!1,n.nodes=new Map,n.edges=new Map,n.adjacency=new Map,n.reverseAdjacency=new Map,n.nextNodeIndex=0,n.nextEdgeIndex=0,n.acyclic=R(!0),n};var Vf=e=>{let t=UM(e);return{type:e.type,nodes:Array.from(t.nodes,([n,r])=>({index:n,data:r})).sort((n,r)=>n.index-r.index),edges:Array.from(t.edges,([n,r])=>({index:n,source:r.source,target:r.target,data:r.data})).sort((n,r)=>n.index-r.index)}},Nh=e=>{let t=T5(e.type,!1);for(let n of e.nodes)t.nodes.set(n.index,n.data),t.adjacency.set(n.index,[]),t.reverseAdjacency.set(n.index,[]);for(let n of e.edges)t.edges.set(n.index,{source:n.source,target:n.target,data:n.data}),t.adjacency.get(n.source).push(n.index),t.reverseAdjacency.get(n.target).push(n.index),e.type==="undirected"&&(t.adjacency.get(n.target).push(n.index),t.reverseAdjacency.get(n.source).push(n.index));return t.nextNodeIndex=e.nodes.length===0?0:e.nodes[e.nodes.length-1].index+1,t.nextEdgeIndex=e.edges.length===0?0:e.edges[e.edges.length-1].index+1,t.acyclic=A(),t};var Dh=(e,t,n)=>e===je?n(t):_t(e,n);function LM(e){if(e._tag==="Middleware")return(n,r,o)=>{let s=n===je?e.decode(qt(wf(r)),o):e.decode(Wa(n,wf),o);return $M(s)};let t=e.decode;switch(t._tag){case"Passthrough":return(n,r)=>n===je?qt(r):n;case"Transform":{let n=r=>r===me?wn:qt(t.transform(r));return(r,o)=>Dh(r,o,n)}case"TransformOptional":{let n=r=>zS(t.transform(wf(r)));return(r,o)=>Dh(r,o,n)}case"TransformEffect":return(n,r,o)=>Dh(n,r,s=>s===me?wn:t.transform(s,o));case"TransformOptionalEffect":return(n,r,o)=>Dh(n,r,s=>$M(t.transform(wf(s),o)))}}var $M=e=>_t(e,zS),BM=(e,t,n,r)=>Vn(r,o=>Ls(()=>$s(o,s=>new EP(e,s,t,n))));function O5(e,t){let n=LM(e.link.transformation),r;return(o,s)=>{if(o===me)return wn;if(e.isConstructed(o))return je;let a=(r??=t(e.link.to))(o,s);return n(a,o,s)}}function _5(e,t){let n=e.context.constructorDefault;return(r,o)=>{if(r!==me&&r!==void 0)return t(r,o);let s=n;if(Ne(s)&&s._tag==="Success"){let a=t(s[fe],o);return a===je?s:a}return _t(BM(e,r,o,s),a=>{let i=t(a,o);return i===je?qt(a):i})}}function Iv(e,t){let n=t(e);return e.context?.constructorDefault===void 0?n:_5(e,n)}function Gf(e,t,n,r,o){if(e._tag==="Declaration")for(let g of e.typeParameters)t(g);let s=n?NR(e):void 0,a=s?O5(s,t):r??e.getParser(t,n),i=e.checks,c=e.encoding,u=c?.map(g=>LM(g.transformation)),l=e.encodingChecks;if(!c&&!i&&!l)return a;let f,d=(g,x)=>{let E=a(g,x);if(l&&!x.disableChecks)if(Ne(E)){if(E._tag==="Success"){let k=E===je?g:E[fe];if(g!==me&&k!==me){let w=Or(l,g,void 0,e,x);w&&(E=I(new Ct(e,w,g,x)))}}}else E=q(E,k=>{if(g!==me&&k!==me){let w=Or(l,g,void 0,e,x);if(w)return I(new Ct(e,w,g,x))}return b(k)});if(i&&!x.disableChecks)if(Ne(E)){if(E._tag==="Success"){let k=E===je?g:E[fe];if(k===me)return E;let w=Or(i,k,void 0,e,x);w&&(E=I(new Ct(e,w,k,x)))}}else E=q(E,k=>{if(k!==me){let w=Or(i,k,void 0,e,x);if(w)return I(new Ct(e,w,k,x))}return b(k)});return E},m=o===void 0?d:o(d);return c?(g,x)=>{let E=f??=c.map(P=>t(P.to)),k=g,w=E[E.length-1](g,x);for(let P=c.length-1;P>=0;P--)if(w=u[P](w,k,x),P!==0){let T=E[P-1];w._tag==="Success"?(k=w[fe],w=T(k,x)):w=_t(w,p=>{let y=T(p,x);return y===je?qt(p):y})}if(w._tag==="Success"){let P=w[fe],T=m(P,x);return T===je?w:T}return w=BM(e,g,x,w),_t(w,P=>{let T=m(P,x);return T===je?qt(P):T})}:m}var Lh=Symbol(),jM=new WeakMap,zM,su=!1;var F5=e=>su?$h(Xn,e,"parser"):Xn(e).parser,qM=e=>su?$h(Xn,e,"makeEffect"):Xn(e).makeEffect,R5=e=>Iv(e,qM),Uh=class{ast;constructor(t){this.ast=t}get decodeEffect(){return this.cachedDecodeEffect??=Gf(this.ast,F5)}get parser(){return this.decodeEffect}get makeEffect(){return this.cachedMakeEffect??=Gf(this.ast,qM,R5)}},Cv=class extends Uh{compiled;resolve;constructor(t,n,r){super(t),this.compiled=n,this.resolve=r}save(t,n){return Object.defineProperty(this,t,{value:n}),n}operation(t){let n=this.compiled;return typeof n=="function"?n(this.ast,this.resolve,t):n?.[t]}get is(){return this.save("is",this.operation("is"))}get decode(){return this.save("decode",this.operation("decode"))}get make(){return this.save("make",this.operation("make"))}get decodeEffect(){return this.save("decodeEffect",this.operation("decodeEffect")??Gf(this.ast,t=>$h(this.resolve,t,"parser")))}get parser(){let t=this.decode;return t===void 0?this.decodeEffect:this.save("parser",M5(t,()=>this.decodeEffect))}get makeEffect(){let t=this.operation("makeEffect");if(t!==void 0)return this.save("makeEffect",t);let n=r=>$h(this.resolve,r,"makeEffect");return this.save("makeEffect",Gf(this.ast,n,r=>Iv(r,n)))}};function M5(e,t){let n;return(r,o)=>{if(r!==me)try{let s=e(r,o);if(s!==Lh)return s===r?je:qt(s)}catch(s){return jt(s)}return(n??=t())(r,o)}}function $h(e,t,n){let r=e(t);if(r.compiled===void 0||Object.hasOwn(r,n))return r[n];let o;return(s,a)=>(o??=r[n])(s,a)}function Xn(e){let t=jM.get(e);if(t!==void 0)return t;let n=zM===void 0?new Uh(e):new Cv(e,zM(e,Xn),Xn);return jM.set(e,n),n}function Av(e){let t=e.ast,n;return(r,o)=>(n??=Nv(q5,yt(t)))(r,o?.disableChecks?o?.parseOptions?{...o.parseOptions,disableChecks:!0}:{disableChecks:!0}:o?.parseOptions)}function jh(e){let t=Av(e);return(n,r)=>{let o=xo(t(n,r));return xt(o)?R(o.value):(Jn(o.cause,"Option adapter can only return none for schema issues"),A())}}function zh(e){return j5(yt(e.ast))}function Ov(e){return Kf(e.ast)}function D5(e){if(!su){let o=au(Hh(e));return s=>{let a=o(s,Io);return xt(a)?!0:(Jn(a.cause,"Type guard adapter can only return false for schema issues"),!1)}}let t=Xn(e),n=t.is;if(n!==void 0)return o=>{try{return n(o,Io)}catch(s){return Jn(ql(s),"Type guard adapter can only return false for schema issues"),!1}};let r=t.parser;return o=>{let s=xo(Mv(r(o,Io),o));return xt(s)?!0:(Jn(s.cause,"Type guard adapter can only return false for schema issues"),!1)}}function Kf(e){let t=yt(e),n=r=>(n=D5(t),n(r));return r=>n(r)}function WM(e){let t=Hh(e);return(n,r)=>{let o=xo(t(n,r));if(!xt(o))return Jn(o.cause,"Issue adapter can only return schema issues")}}function HM(e,t){let n=yt(e.ast),r=Xn(n).parser(t,Io),o=xo(Mv(r,t));if(Dl(o)){let s=Jn(o.cause,"Assertion adapter can only throw schema issues");throw new Error("Schema validation failed",{cause:s})}}function mt(e,t){let n=Hh(e.ast);return t===void 0?n:(r,o)=>n(r,Rv(t,o))}var _v=mt;function VM(e,t){return au(mt(e,t))}function Pv(e,t){return XM(mt(e,t))}var GM=Pv;function KM(e,t){return eN(mt(e,t))}function U5(e,t){return su?tN(e.ast,t):Dv(mt(e,t))}var qh=U5;function li(e,t){let n=Hh(Yn(e.ast));return t===void 0?n:(r,o)=>n(r,Rv(t,o))}var JM=li;function ZM(e,t){return au(li(e,t))}function Fv(e,t){return XM(li(e,t))}var QM=Fv;function YM(e,t){return eN(li(e,t))}function $5(e,t){return su?tN(Yn(e.ast),t):Dv(li(e,t))}var Wh=$5,Rv=(e,t)=>t?{...e,...t}:e,Bh=e=>e===me?I(new de):b(e);function Hh(e){return Nv(z5,e)}function Mv(e,t){return e===je?b(t):Ne(e)?e[fe]===me?Bh(me):e:_t(e,Bh)}function Nv(e,t){let n;return(r,o)=>{let s=(n??=e(t))(r,o??Io);return s===je?b(r):Ne(s)?s[fe]===me?Bh(me):s:_t(s,Bh)}}function au(e){return(t,n)=>xo(e(t,n))}function XM(e){let t=au(e);return(n,r)=>{let o=t(n,r);return xt(o)?R(o.value):(Jn(o.cause,"Option adapter can only return none for schema issues"),A())}}function eN(e){let t=au(e);return(n,r)=>{let o=t(n,r);return xt(o)?$(o.value):K(Jn(o.cause,"Result adapter can only return schema issues"))}}function tN(e,t){let n;return(r,o)=>(n??=L5(Xn(e),t))(r,o)}function L5(e,t){let n=e.decode,r,o=n===void 0?(s,a=Io)=>(r??=Tv(e))(s,a):(s,a=Io)=>{if(s===me)return(r??=Tv(e))(s,a);let i;try{i=n(s,a)}catch(c){throw Jn(ql(c),"Sync adapter can only throw schema issues"),c}return i!==Lh?i:(r??=Tv(e))(s,a)};return t===void 0?o:(s,a)=>o(s,Rv(t,a))}function Tv(e){return Dv(Nv(()=>e.decodeEffect,e.ast))}function Dv(e){let t=au(e);return(n,r)=>{let o=t(n,r);if(xt(o))return o.value;let s=Jn(o.cause,"Sync adapter can only throw schema issues");throw new Error("Schema validation failed",{cause:s})}}function B5(e,t){let n=xo(e);if(xt(n))return n.value;let r=Jn(n.cause,t);throw new Error("Schema validation failed",{cause:r})}function j5(e){let t,n;return(r,o)=>{t??=Xn(e);let s=o?.disableChecks?o.parseOptions?{...o.parseOptions,disableChecks:!0}:{disableChecks:!0}:o?.parseOptions??Io,a=t.make;if(a!==void 0&&r!==me){let c;try{c=a(r,s)}catch(u){throw Jn(ql(u),"Constructor adapter can only throw schema issues"),u}if(c!==Lh&&c!==me)return c}let i=(n??=t.makeEffect)(r,s);return B5(Mv(i,r),"Constructor adapter can only throw schema issues")}}var z5=e=>Xn(e).parser,q5=e=>Xn(e).makeEffect;var Vh="~effect/Schema/Schema",nN=Symbol(),W5={[Vh]:Vh,get make(){let e=zh(this);return Object.defineProperty(this,"make",{value:e,enumerable:!0}),e},get makeEffect(){let e=Av(this);return Object.defineProperty(this,"makeEffect",{value:e,enumerable:!0}),e},get makeOption(){let e=jh(this);return Object.defineProperty(this,"makeOption",{value:e,enumerable:!0}),e},pipe(){return re(this,arguments)},annotate(e){return this.rebuild(Cr(this.ast,e))},annotateKey(e){return this.rebuild(Bf(this.ast,e))},check(...e){return this.rebuild(Co(this.ast,e))},rebuild(e){return Fr(e,this[nN])}};function Fr(e,t){function n(){}let r=Object.setPrototypeOf(n,W5);return t&&(Object.hasOwn(t,"name")||Object.hasOwn(t,"length")||Object.hasOwn(t,"__proto__"))?Object.defineProperties(r,Object.getOwnPropertyDescriptors({...t})):Object.assign(r,t),r[nN]=t,r.ast=e,r}function Uv(e){return e.replace(/~/g,"~0").replace(/\//g,"~1")}function Jf(e){return e.replace(/~1/g,"/").replace(/~0/g,"~")}function $v(e){return encodeURI(Uv(e)).replace(/#/g,"%23")}function Lv(e){if(e.length===0||e==="#")return"";if(!e.startsWith("#"))return;let t=e.slice(1);try{if(encodeURI(t).replace(/%25/g,"%").replace(/#/g,"%23")!==t)return;let n=decodeURIComponent(t);return n.startsWith("/")&&!/~(?:[^01]|$)/.test(n)?n:void 0}catch{return}}function oN(e){let t=Lv(e);return t===void 0?void 0:t.length===0?[]:t.slice(1).split("/").map(Jf)}function sN(e){return e.reduce((t,n)=>`${t}/${$v(n)}`,"#")}var V5="http://json-schema.org/draft-07/schema#",aN="https://json-schema.org/draft/2020-12/schema";function iN(e,t){return e===t||e===(t.endsWith("#")?t.slice(0,-1):`${t}#`)}function lN(e){return{dialect:"draft-07",...Q5(e,iG)}}function G5(e,t){return n(e,!1,!0);function n(r,o,s=!1){if(!Mn(r))return r;let a=o||!s&&pN(r.$id),i={};for(let c of Object.keys(r)){let u=r[c],l=u;switch(c){case"$defs":case"properties":case"patternProperties":case"dependentSchemas":l=jv(u,f=>n(f,a))??u;break;case"allOf":case"anyOf":case"oneOf":case"prefixItems":l=Array.isArray(u)?u.map(f=>n(f,a)):u;break;case"not":case"additionalProperties":case"propertyNames":case"unevaluatedProperties":case"items":case"contains":case"unevaluatedItems":case"if":case"then":case"else":case"contentSchema":l=n(u,a)}N(i,c,l)}return t(i,a),i}}function fN(e,t){return G5(e,n=>{K5(n,t)})}function K5(e,t){typeof e.$ref=="string"&&N(e,"$ref",t(e.$ref,"$ref")),typeof e.$dynamicRef=="string"&&N(e,"$dynamicRef",t(e.$dynamicRef,"$dynamicRef"))}function jv(e,t){if(!Mn(e))return;let n={};for(let r of Object.keys(e))N(n,r,t(e[r],r));return n}function J5(e,t,n){let r=new Map,o=[],s=Bv;function a(d,m=[],g=[]){if(m.length===0&&t?.trackIds){let x=Mn(d)?l(d):void 0;s=cN(x,Bv)??Bv}return u(d,m,g,{sourceRoot:[],targetRoot:[],uri:s})}function i(){for(let[d,m,g]of o){let x=m,E=dN(m,g);if(E!==void 0){let k=oN(E.hash);if(E.hash="",k!==void 0){let w=r.get(uN(E.href,k));w!==void 0&&(x=Z5(m,w))}}N(d,"$ref",x)}}let c=n(a);return i(),c;function u(d,m,g,x){if(typeof d=="boolean")return f(m,g,x),t?.booleanAdapter?.(d)??d;if(!Mn(d))return d;let E=x,k=l(d);if(m.length>0&&t?.trackIds&&pN(k)){let T=cN(k,x.uri);T!==void 0&&(E={parent:x,sourceRoot:m,targetRoot:g,uri:T})}f(m,g,E);let w=E.uri,P={isDocumentRoot:m.length===0,schema(T,p,y=p){return u(T,[...m,p],[...g,y],E)},schemaAt(T,p,y){return u(T,[...m,...p],[...g,...y],E)},schemaArray(T,p,y=p){return Array.isArray(T)?T.map((S,v)=>u(S,[...m,p,String(v)],[...g,y,String(v)],E)):T},schemaMap(T,p,y=p){return Mn(T)?jv(T,(S,v)=>u(S,[...m,p,v],[...g,y,v],E)):T},reference(T,p){typeof p=="string"?o.push([T,p,w]):N(T,"$ref",p)}};return e(d,P)}function l(d){return t?.ignoreRefSiblings===!0&&typeof d.$ref=="string"?void 0:d.$id}function f(d,m,g){g.parent!==void 0&&f(d,m,g.parent),r.set(uN(g.uri,d.slice(g.sourceRoot.length)),m.slice(g.targetRoot.length))}}var Bv="https://effect.invalid/.json-schema/";function dN(e,t){return URL.canParse(e,t)?new URL(e,t):void 0}function cN(e,t){if(typeof e!="string")return;let n=dN(e,t);if(n!==void 0)return n.hash="",n.href}function Z5(e,t){let n=e.indexOf("#");return n===-1&&t.length===0?e:`${n===-1?e:e.slice(0,n)}${sN(t)}`}function uN(e,t){return`${e}\0${JSON.stringify(t)}`}function pN(e){return typeof e=="string"&&e.length>0&&e[0]!=="#"}function Q5(e,t,n){return J5(t,{...n,trackIds:!0},r=>({schema:r(e.schema),definitions:jv(e.definitions,(o,s)=>r(o,["$defs",s],["definitions",s]))}))}var Y5=new Set(["properties","patternProperties"]),X5=new Set(["allOf","anyOf","oneOf"]),eG=new Set(["not","additionalProperties","propertyNames","contains","if","then","else","contentSchema"]);function tG(e,t,n,r,o,s=Y5){let a;if(s.has(t))a=r.schemaMap(n,t);else if(X5.has(t))a=r.schemaArray(n,t);else if(o.has(t))a=r.schema(n,t);else return!1;return N(e,t,a),!0}var mN=["$anchor","$defs","$dynamicAnchor","$dynamicRef","$vocabulary","contentSchema","dependentRequired","dependentSchemas","maxContains","minContains","prefixItems","unevaluatedItems","unevaluatedProperties"],Yue=[...mN,"deprecated"],Xue=[...mN,"$comment","$id","$schema","const","contains","contentEncoding","contentMediaType","else","examples","if","patternProperties","propertyNames","then"],nG=/^[A-Za-z_][-A-Za-z0-9._]*$/,rG=/^[A-Za-z][-A-Za-z0-9._:]*$/;function fi(e,t,n){throw new Error(`Cannot convert JSON Schema keyword "${e}" to ${t}: ${n}`)}function oG(e,t,n,r){for(let o of t)Object.hasOwn(e,o)&&fi(o,n,`it is not active in ${r} but would become active in the target`)}var sG=["additionalItems","definitions","dependencies"];function aG(e,t,n,r,o){n.isDocumentRoot?N(e,"$schema",iN(t,aN)?r:t):iN(t,aN)||fi("$schema",o,"an embedded resource cannot declare a different dialect")}function iG(e,t){oG(e,sG,"Draft-07","Draft 2020-12");let n={},r,o,s;for(let a of Object.keys(e)){let i=e[a];if(!tG(n,a,i,t,eG))switch(a){case"$ref":r=i;break;case"$schema":aG(n,i,t,V5,"Draft-07");break;case"$id":case"$anchor":break;case"$defs":N(n,"definitions",t.schemaMap(i,a,"definitions"));break;case"prefixItems":o=i;break;case"items":s=i;break;case"dependentRequired":case"dependentSchemas":case"minContains":case"maxContains":break;case"$dynamicRef":case"$dynamicAnchor":case"$vocabulary":case"unevaluatedProperties":case"unevaluatedItems":fi(a,"Draft-07","the target dialect has no equivalent");case"required":if(Array.isArray(i)&&i.length===0)break;N(n,a,i);break;default:N(n,a,i)}}if(cG(n,o,s,t),Object.hasOwn(e,"contains")){let a=e.minContains,i=e.maxContains;(a!==void 0&&a!==1||i!==void 0)&&fi("minContains/maxContains","Draft-07","contains cardinality cannot be represented"),Object.hasOwn(e,"minContains")&&N(n,"minContains",a)}else Object.hasOwn(e,"minContains")&&N(n,"minContains",e.minContains),Object.hasOwn(e,"maxContains")&&N(n,"maxContains",e.maxContains);return lG(e,n,t,"draft-07"),dG(e,n,"$id","Draft-07"),uG(n,r,t),n}function cG(e,t,n,r){if(t===void 0){n!==void 0&&N(e,"items",r.schema(n,"items"));return}N(e,"items",r.schemaArray(t,"prefixItems","items")),n!==void 0&&N(e,"additionalItems",r.schema(n,"items","additionalItems"))}function uG(e,t,n){if(t!==void 0)if(typeof t=="string"&&Object.keys(e).length>0){let r={};n.reference(r,t),fG(e,r)}else n.reference(e,t)}function lG(e,t,n,r){let o=Mn(e.dependentRequired)?e.dependentRequired:void 0,s=Mn(e.dependentSchemas)?e.dependentSchemas:void 0;if(o===void 0&&s===void 0)return;let a={},i=new Set([...Object.keys(o??{}),...Object.keys(s??{})]);for(let c of i){let u=o?.[c],l=s?.[c],f=r==="draft-04"&&Array.isArray(u)&&u.length===0;l===void 0?f||N(a,c,u):u===void 0||f?N(a,c,n.schemaAt(l,["dependentSchemas",c],["dependencies",c])):N(a,c,{allOf:[n.schemaAt(l,["dependentSchemas",c],["dependencies",c,"allOf","0"]),{required:u}]})}Object.keys(a).length>0&&N(t,"dependencies",a)}function fG(e,t){Array.isArray(e.allOf)?e.allOf.push(t):N(e,"allOf",[t])}function dG(e,t,n,r){let o=e.$id,s=e.$anchor;if(s===void 0){o!==void 0&&N(t,n,o);return}(typeof s!="string"||!nG.test(s))&&fi("$anchor",r,"the anchor is not valid"),rG.test(s)||fi("$anchor",r,"the anchor cannot be represented as a plain-name fragment identifier"),o===void 0?N(t,n,`#${s}`):fi("$anchor",r,"it cannot be combined with the schema $id")}function Gh(e){return Fr(iu(e.ast),{schema:e})}var iu=ti(e=>{let t=mG(e,iu),n=e.context;return t===e||n===void 0?t:Eh(t,zv(n))});function zv(e){return e.constructorDefault===void 0?e:new ko(e.isOptional,e.isMutable,void 0,e.annotations)}function xN(e){if(e.propertySignatures.some(t=>typeof t.name!="string"))throw new globalThis.Error("Objects property names must be strings",{cause:e})}function yN(e){return t=>{let n=[...t].sort((o,s)=>e(Tr(o))-e(Tr(s)));return n.some((o,s)=>o!==t[s])?n:t}}var pG=yN(e=>{switch(e._tag){case"BigInt":case"Symbol":case"UniqueSymbol":return 0;default:return 1}});function mG(e,t){switch(e._tag){case"Declaration":{let n=e.annotations?.toCodecJson??e.annotations?.toCodec;if(!bn(n))return Ge(e,[VE]);let r=e.typeParameters.map(s=>Fr(Tr(s))),o=n(r);return o===void 0?e:Ge(e,[Xc(o,t)])}case"Unknown":return Ge(e,[VE]);case"ObjectKeyword":return Ge(e,[$R]);case"Undefined":case"Void":case"Literal":case"Number":return e.toCodecJson();case"UniqueSymbol":case"Symbol":case"BigInt":return e.toCodecStringTree();case"Objects":return xN(e),e.recur(t,wh);case"Union":{let n=pG(e.types);return n!==e.types?new In(n,e.options,e.annotations,e.checks,e.encoding,e.context,e.encodingChecks).recur(t):e.recur(t)}case"Arrays":case"Suspend":return e.recur(t)}return e}function Kh(e){return Fr(bN(yt(e.ast)))}var bN=dr(e=>{let t=hG(e,bN);return t!==e&&e.context!==void 0?Eh(t,zv(e.context)):t});function hG(e,t){switch(e._tag){case"Declaration":{let n=e.annotations?.toCodecIso??e.annotations?.toCodec;if(bn(n)){let r=n(e.typeParameters.map(o=>Fr(o)));return Ge(e,[Xc(r,t)])}return e}case"Arrays":case"Objects":case"Union":case"Suspend":return e.recur(t)}return e}function Jh(e){return Fr(wN(e.ast),{schema:e})}function SN(e){return Fr(kN(e.ast))}var gG=yN(e=>{switch(e._tag){case"Null":case"Boolean":case"Number":case"BigInt":case"Symbol":case"UniqueSymbol":return 0;default:return 1}});function xG(e,t,n){switch(e._tag){case"Declaration":{let r=e.typeParameters.map(u=>Fr(t(Tr(u)))),o=e.annotations?.toCodecStringTree;if(bn(o)){let u=o(r);return u===void 0?e:Ge(e,[Xc(u,t)])}let s=e.annotations?.toCodecJson,a=bn(s)?s(r):void 0,i=a===void 0?e.annotations?.toCodec:void 0,c=a??(bn(i)?i(r):void 0);return c===void 0?n(e):Ge(e,[Xc(c,t)])}case"Null":return Ge(e,[yG]);case"Boolean":return Ge(e,[bG]);case"Unknown":case"ObjectKeyword":return Ge(e,[GE]);case"Enum":case"Number":case"Literal":case"UniqueSymbol":case"Symbol":case"BigInt":return e.toCodecStringTree();case"Objects":return xN(e),e.recur(t,wh);case"Union":{let r=gG(e.types);return r!==e.types?new In(r,e.options,e.annotations,e.checks,e.encoding,e.context,e.encodingChecks).recur(t):e.recur(t)}case"Arrays":case"Suspend":return e.recur(t)}return e}var yG=new ot(new Qn("null"),new Pe(le(()=>null),le(()=>"null"))),bG=new ot(new In([new Qn("true"),new Qn("false")]),new Pe(le(e=>e==="true"),Qa())),EN=new Pe(le(e=>typeof e=="string"?[e]:e),wo()),vN=e=>e.transformation===EN,wN=ti(e=>{let t=xG(e,wN,n=>{throw new globalThis.Error("Missing structural codec for StringTree",{cause:n})});return t!==e&&e.context!==void 0?Eh(t,zv(e.context)):t},{stopAt:vN}),gN=e=>Ht(e)?ni(rs):rs,kN=ti(e=>{let t=SG(e);if(wE(t)){let n=eu(new In([new lr(t.isMutable,t.elements.map(gN),t.rest.map(gN)),Zn],{mode:"anyOf"}),t,EN);return Ht(e)?ni(n):n}return t},{stopAt:vN});function SG(e){return e._tag==="Declaration"||e._tag==="Arrays"||e._tag==="Objects"||e._tag==="Union"||e._tag==="Suspend"?e.recur(kN):e}var tle=globalThis.RegExp;var ss=e=>e.replace(/[/\\^$*+?.()|[\]{}]/g,"\\$&");function Ys(e,t){return t.length>0&&(e+=`
  at ${Jd(t)}`),new Error(e)}function IN(e){return`#/$defs/${$v(e)}`}var EG=new Set([...bP,Ja,...yP]);function Qf(e,t){if(e===void 0)return;let n={},r=e.title;typeof r=="string"&&(n.title=r);let o=e.description,s=e.expected;typeof o=="string"?n.description=o:t?.generateDescriptions===!0&&typeof s=="string"&&(n.description=s);let a=e.default;tu(a)&&(n.default=a);let i=e.examples;Array.isArray(i)&&tu(i)&&(n.examples=i);let c=e.readOnly;typeof c=="boolean"&&(n.readOnly=c);let u=e.writeOnly;typeof u=="boolean"&&(n.writeOnly=u);let l=e.format;typeof l=="string"&&(n.format=l);let f=e.contentEncoding;typeof f=="string"&&(n.contentEncoding=f);let d=e.contentMediaType;typeof d=="string"&&(n.contentMediaType=d);let m=e.contentSchema;if(tu(m)&&(n.contentSchema=m),t?.includeAnnotationKey!==void 0)for(let[g,x]of Object.entries(e))EG.has(g)||!t.includeAnnotationKey(g)||tu(x)&&N(n,g,x);return Object.keys(n).length===0?void 0:n}function TN(e){let t=e.type==="number"||e.type==="integer"?e.type:void 0,n=e;if(t!==void 0&&(n={...e},delete n.type),Array.isArray(n.allOf)){let r=[],o=!1;for(let s of n.allOf){let a=TN(s);a.type!==void 0&&(o=!0,(t===void 0||a.type==="integer")&&(t=a.type)),Object.keys(a.schema).length>0&&r.push(a.schema)}if(o){let{allOf:s,...a}=n;n=r.length===0?a:{...a,allOf:r}}}return{type:t,schema:n}}function vG(e){if(!Array.isArray(e.anyOf)||e.anyOf.length!==2||e.anyOf[0]?.type!=="number")return!1;let t=e.anyOf[1];return t?.type==="string"&&Array.isArray(t.enum)&&t.enum.length===3&&t.enum.includes("NaN")&&t.enum.includes("Infinity")&&t.enum.includes("-Infinity")}var AN="|type|format|pattern|multipleOf|minimum|maximum|exclusiveMinimum|exclusiveMaximum|minLength|maxLength|minItems|maxItems|uniqueItems|minProperties|maxProperties|propertyNames|";function Zh(e,t){return Object.keys(e).every(n=>t.includes(`|${n}|`))}function CN(e,t){return typeof e.$ref!="string"&&t.every(n=>!Object.hasOwn(e,n))}var Hv="|title|description|default|examples|readOnly|writeOnly|",wG=AN+Hv;function Yf(e,t,n){if(Object.keys(e).length===0)return t;let r=Object.keys(t);if(r.length===0)return e;let o=e.type==="number"||e.type==="integer"?e.type:void 0,s=vG(e);if(o!==void 0||s){let i=TN(t);if(i.type!==void 0){let c=o==="integer"||i.type==="integer"?"integer":"number",u={...e,type:c};s&&delete u.anyOf;let l=Object.keys(i.schema);return l.length===0?u:Zh(i.schema,Hv)&&CN(u,l)?{...u,...i.schema}:Yf(u,i.schema,n)}}if(n&&CN(e,r))return{...e,...t};let a=Array.isArray(t.allOf)&&r.length===1?t.allOf:[t];return Array.isArray(e.allOf)?{...e,allOf:[...e.allOf,...a]}:typeof e.$ref=="string"?{allOf:[e,...a]}:{...e,allOf:a}}function Wv(e,t=new Set){return typeof e=="boolean"?e:t.has(e)?!0:(t.add(e),e.every(n=>Wv(n,t)))}function kG(e){return Array.isArray(e)}function IG(e,t,n,r){let o=new Map,s=new Map,a=new WeakMap,i=new Map,c=new Map,u=Object.keys(n);for(let p of u)g(p,["references",p]);let l=At(e,(p,y)=>w(p,t[y],[]));for(let[p,y]of i.values())if(!Wv(p))for(let S of y)Array.isArray(S.oneOf)&&(S.anyOf=S.oneOf,delete S.oneOf);for(let p of u){let y=n[p],S=E(y);if(S===void 0)continue;let v=o.get(p)[0],C=c.get(S),O=C?.find(D=>Q(o.get(D)[0],v));O===void 0?C===void 0?c.set(S,[p]):C.push(p):s.set(p,O)}let f=At(l,x),d={};for(let p of u)s.has(p)||N(d,p,x(o.get(p)[0]));return{dialect:"draft-2020-12",schemas:f,definitions:d};function m(p){return Array.isArray(p.oneOf)&&i.get(p.oneOf)?.[1].push(p),p}function g(p,y){if(!Object.hasOwn(n,p))throw Ys(`Invalid reference ${p}`,[...y,"$ref"]);let S=o.get(p);if(S!==void 0)return S;let v=[{},[]];return o.set(p,v),v[0]=w(n[p],["references",p],v[1]),v}function x(p){return fN(p,y=>{let S=Lv(y);if(S===void 0){if(/^#(?:\/|%2f)/i.test(y))throw new Error(`Invalid JSON Pointer URI fragment ${JSON.stringify(y)}`);return y}if(!S.startsWith("/$defs/"))return y;let v=S.indexOf("/",7),C=s.get(Jf(S.slice(7,v<0?void 0:v)));return C===void 0?y:y.replace(/^#(?:\/|%2f).*?(?:\/|%2f).*?(?=\/|%2f|$)/i,IN(C))})}function E(p){if(p._tag==="Reference")return;let y=p.checks.length===0?p.annotations:p.checks[p.checks.length-1].annotations;return typeof y?.identifier!="string"&&typeof y?.[Ja]=="string"?y[Ja]:void 0}function k(p,y,S,v){let C=p.annotations,O=C?.toJsonSchema;if(O!==void 0){let X=p.representation?.schemas?.map((Mo,Vu)=>w(Mo,[...S,"representation","schemas",Vu],v))??[],we=O({type:y,schemas:X}),Ue=kG(we);Ue&&v.push(!1);let at=Ue?we[0]:we,ht=Qf(C,r),yn=ht===void 0?at:{...at,...ht},tr=ht===void 0?AN:wG;return[yn,p._tag==="Filter"&&Zh(yn,tr)&&(ht===void 0||Zh(ht,Hv))?!0:void 0]}if(p._tag==="Filter"){v.push(!1);return}let D=p.checks.flatMap((X,we)=>{let Ue=k(X,y,[...S,"checks",we],v);return Ue===void 0?[]:[Ue[0]]});if(D.length===0)return;let z=Qf(C,r),ge={allOf:D};return[z===void 0?ge:{...ge,...z}]}function w(p,y,S){if(p._tag==="Reference")return S.push(g(p.$ref,y)[1]),{$ref:IN(p.$ref)};let v=a.get(p);if(v!==void 0)return S.push(v[1]),v[0];let C=[];S.push(C);let O=P(p,y,C),D=Qf(p.annotations,r);D!==void 0&&(O={...O,...D});for(let z=0;z<p.checks.length;z++){let ge=typeof O.type=="string"&&CG(O.type)?O.type:void 0,X=k(p.checks[z],ge,[...y,"checks",z],C);X!==void 0&&(O=Yf(O,...X))}return a.set(p,[O,C]),m(O)}function P(p,y,S){switch(p._tag){case"Any":case"Unknown":return{};case"ObjectKeyword":return{anyOf:[{type:"object"},{type:"array"}]};case"Void":case"Undefined":case"Null":return{type:"null"};case"BigInt":return{type:"string",allOf:[{pattern:"^-?\\d+$"}]};case"Symbol":return{type:"string",allOf:[{pattern:"^Symbol\\(([\\s\\S]*)\\)$"}]};case"UniqueSymbol":return globalThis.Symbol.keyFor(p.symbol)===void 0?{not:{}}:{type:"string",enum:[globalThis.String(p.symbol)]};case"Declaration":return S.push(!1),{};case"Suspend":return w(p.thunk,[...y,"thunk"],S);case"Never":return{not:{}};case"String":return{type:"string"};case"Number":return{anyOf:[{type:"number"},{type:"string",enum:["NaN","Infinity","-Infinity"]}]};case"Boolean":return{type:"boolean"};case"Literal":{let v=p.literal;return typeof v=="bigint"?{type:"string",enum:[globalThis.String(v)]}:{type:typeof v,enum:[v]}}case"Enum":{let v=p.enums.map(([C,O],D)=>{if(typeof O=="number"&&!globalThis.Number.isFinite(O))throw Ys(`Invalid numeric enum value ${globalThis.String(O)}`,[...y,"enums",D,1]);return{type:typeof O,enum:[O],title:C}});return v.length===0?{not:{}}:{anyOf:v}}case"TemplateLiteral":return{type:"string",pattern:`^${p.parts.map(Qh).join("")}$`};case"Arrays":{if(p.rest.length>1)throw Ys("Invalid schema representation document",[...y,"rest"]);let v={type:"array"},C=p.elements.length,O=p.elements.map((D,z)=>{D.isOptional&&C--;let ge=w(D.type,[...y,"elements",z,"type"],S),X=Qf(D.annotations,r);return X===void 0?ge:m(Yf(ge,X))});if(O.length>0?(v.prefixItems=O,v.maxItems=p.elements.length,C>0&&(v.minItems=C)):v.items=!1,p.rest.length===1){delete v.maxItems;let D=w(p.rest[0],[...y,"rest",0],S);Object.keys(D).length>0?v.items=D:delete v.items}return v}case"Objects":{if(p.propertySignatures.length===0&&p.indexSignatures.length===0)return{not:{type:"null"}};let v={type:"object"},C={},O=[];for(let Ue=0;Ue<p.propertySignatures.length;Ue++){let at=p.propertySignatures[Ue];if(typeof at.name!="string")throw Ys("Invalid schema representation document",[...y,"propertySignatures",Ue,"name"]);let ht=at.name,yn=w(at.type,[...y,"propertySignatures",Ue,"type"],S),tr=Qf(at.annotations,r);N(C,ht,tr===void 0?yn:m(Yf(yn,tr))),at.isOptional||O.push(ht)}p.propertySignatures.length>0&&(v.properties=C),O.length>0&&(v.required=O);let D={},z=[],ge=[],X=!1;for(let Ue=0;Ue<p.indexSignatures.length;Ue++){let at=p.indexSignatures[Ue],ht=w(at.type,[...y,"indexSignatures",Ue,"type"],S);Q(ht,{not:{}})&&(ht=!1),ge.push(ht);let yn=T(at.parameter,[...y,"indexSignatures",Ue,"parameter"],new Set);if(yn===void 0){X=!0,S.push(!1);continue}if(yn.length===0)z.push(ht);else for(let tr of yn){let Mo=D[tr];N(D,tr,Mo===void 0?ht:Mo===!1||ht===!1?!1:m(Yf(Mo,ht)))}}let we=Object.keys(D).length>0;if(we&&(v.patternProperties=D),X&&r?.onExcessProperty==="error"){let Ue=[];p.propertySignatures.length>0&&Ue.push({enum:Object.keys(C)});for(let at=0;at<p.indexSignatures.length;at++)Ue.push(w(p.indexSignatures[at].parameter,[...y,"indexSignatures",at,"parameter"],S));v.propertyNames=Ue.length===1?Ue[0]:{anyOf:Ue},v.additionalProperties=ge.length===1?ge[0]:{anyOf:ge},z.length>0&&(v.allOf=z.map(at=>({type:"object",additionalProperties:at})))}else z.length===0?v.additionalProperties=X||r?.onExcessProperty!=="error":z.length===1&&p.propertySignatures.length===0&&!we?v.additionalProperties=z[0]:z.length>0&&(v.allOf=z.map(Ue=>({type:"object",additionalProperties:Ue})));return typeof v.additionalProperties=="object"&&v.additionalProperties!==null&&Object.keys(v.additionalProperties).length===0&&delete v.additionalProperties,v}case"Union":{let v=[],C=p.types.map((D,z)=>w(D,[...y,"types",z],v));if(S.push(v),C.length===0)return{not:{}};let O=p.options?.mode??"anyOf";if(O==="anyOf"&&C.length>1){let D=TG(C);if(D!==void 0)return D}return O==="oneOf"&&i.set(C,[v,[]]),{[O]:C}}}}function T(p,y,S){switch(p._tag){case"Reference":{if(!Object.hasOwn(n,p.$ref))throw Ys(`Invalid reference ${p.$ref}`,[...y,"$ref"]);if(g(p.$ref,y),S.has(p.$ref))return;let v=new Set(S).add(p.$ref);return T(n[p.$ref],["references",p.$ref],v)}case"String":{if(p.checks.length===0)return[];if(p.checks.length!==1||p.checks[0]._tag!=="Filter"||p.checks[0].annotations?.toJsonSchema===void 0)return;let v=[],C=w(p,y,v);return Wv(v)&&C.type==="string"&&typeof C.pattern=="string"&&Zh(C,"|type|pattern|title|description|default|examples|readOnly|writeOnly|")?[C.pattern]:void 0}case"TemplateLiteral":return p.checks.length===0?[`^${p.parts.map(Qh).join("")}$`]:void 0;case"Union":{if(p.types.length===0||p.checks.length>0||p.options?.mode==="oneOf")return;let v=[];for(let C=0;C<p.types.length;C++){let O=T(p.types[C],[...y,"types",C],S);if(O===void 0)return;if(O.length===0)return[];v.push(...O)}return v}default:throw Ys("Invalid schema representation document",y)}}}function CG(e){return e==="string"||e==="number"||e==="boolean"||e==="array"||e==="object"||e==="null"||e==="integer"}function TG(e){let t,n=[];for(let r of e){if(Object.keys(r).length!==2||r.type===void 0||!Array.isArray(r.enum)||r.enum.length===0)return;if(t===void 0)t=r.type;else if(r.type!==t)return;for(let s of r.enum){if(n.includes(s))return;n.push(s)}}return{type:t,enum:n}}function Qh(e){switch(e._tag){case"Literal":return ss(globalThis.String(e.literal));case"String":return PR;case"Number":return gh;case"TemplateLiteral":return e.parts.map(Qh).join("");case"Union":return`(?:${e.types.map(Qh).join("|")})`;default:throw Ys("Invalid schema representation document",[])}}function Yh(e,t){let n=IG([e.representation],[["representation"]],e.references,t);return{dialect:n.dialect,schema:n.schemas[0],definitions:n.definitions}}var AG=({identifier:e})=>e;function Rr(e){return e===void 0?void 0:{annotations:e}}function Xf(e,t){let{references:n,representations:r}=OG([e],t);return{representation:r[0],references:n}}function OG(e,t){let n={},r=new Map,o=new Set,s=new Map,a=new Set;for(let p of e)m(p);let i=t?.referencePolicy??AG;for(let p of s.values())for(let y of p.values()){let S=i({ast:y.ast,occurrences:y.occurrences,identifier:y.identifier});if(S!==void 0){let v=S===y.identifier||!S.endsWith("_")?"_":"";y.reference=u(S,y,v)}else y.isRecursive&&(y.reference=u(`${y.ast._tag}_`,y,""))}return{representations:At(e,p=>x(p)),references:n};function u(p,y,S="_"){let v=p,C=0;for(;r.has(v);){if(r.get(v)===y)return v;v=`${p}${S}${++C}`}return r.set(v,y),v}function l(p,y,S){let v=y.fallback;return v!==void 0?BS(p)===v?p:Cr(p,{[Ja]:v}):S===y.identifier?p:Cr(p,{identifier:S})}function f(p,y){if(!Object.hasOwn(n,p)&&!o.has(p)){o.add(p);let S=E(y);o.delete(p),N(n,p,S)}return{_tag:"Reference",$ref:p}}function d(p){let y=Yc(p),S=Qc(y),v=$c(y),C=v===void 0?(y!==p?$c(p):void 0)??BS(y):void 0;C!==void 0&&(v=`${C}Encoded`);let O=s.get(S);O===void 0&&(O=new Map,s.set(S,O));let D=O.get(v);return D===void 0&&(D={ast:S,identifier:v,fallback:C,occurrences:0,isRecursive:!1,reference:void 0},O.set(v,D)),D}function m(p){let y=d(p),S=y.ast;if(y.occurrences++,a.has(y)){y.isRecursive=!0;return}if(!(y.occurrences>1)){switch(a.add(y),g(S.checks),S._tag){case"Declaration":case"Arrays":case"Objects":case"Union":S.recur(v=>(m(v),v));break;case"TemplateLiteral":S.parts.forEach(m);break;case"Suspend":m(S.thunk());break}a.delete(y)}}function g(p){p?.forEach(y=>{y.annotations?.representation?.schemas?.forEach(S=>m(yt(S))),y._tag==="FilterGroup"&&g(y.checks)})}function x(p){let y=d(p),S=y.ast,v=y.reference;if(v!==void 0){let C=y.identifier===void 0?S:l(S,y,v);return f(v,C)}return E(S)}function E(p){let y=k(p.checks);switch(p._tag){case"Declaration":return{_tag:"Declaration",typeParameters:p.typeParameters.map(S=>x(S)),checks:y,...P(p.annotations)};case"Null":case"Undefined":case"Void":case"Never":case"Unknown":case"Any":case"String":case"Boolean":case"Number":case"BigInt":case"Symbol":case"ObjectKeyword":return{_tag:p._tag,checks:y,...Rr(p.annotations)};case"Literal":return{_tag:"Literal",literal:p.literal,checks:y,...Rr(p.annotations)};case"UniqueSymbol":return{_tag:"UniqueSymbol",symbol:p.symbol,checks:y,...Rr(p.annotations)};case"Enum":return{_tag:"Enum",enums:p.enums,checks:y,...Rr(p.annotations)};case"TemplateLiteral":return{_tag:"TemplateLiteral",parts:p.parts.map(S=>x(S)),checks:y,...Rr(p.annotations)};case"Arrays":return{_tag:"Arrays",elements:p.elements.map(S=>{let v=Yc(S),C=v.context?.annotations;return{isOptional:Ht(v),type:x(S),...Rr(C)}}),rest:p.rest.map(S=>x(S)),checks:y,...Rr(p.annotations)};case"Objects":return{_tag:"Objects",propertySignatures:p.propertySignatures.map(S=>{let v=Yc(S.type),C=v.context?.annotations;return{name:S.name,type:x(S.type),isOptional:Ht(v),isMutable:TR(v),...Rr(C)}}),indexSignatures:p.indexSignatures.map(S=>({parameter:x(S.parameter),type:x(S.type)})),checks:y,...Rr(p.annotations)};case"Union":return{_tag:"Union",types:p.types.map(S=>x(S)),...p.options===void 0?{}:{options:p.options},checks:y,...Rr(p.annotations)};case"Suspend":return{_tag:"Suspend",checks:[],thunk:x(p.thunk()),...Rr(p.annotations)}}}function k(p){return p?.map(w)??[]}function w(p){switch(p._tag){case"Filter":return{_tag:"Filter",aborted:p.aborted,...T(p.annotations)};case"FilterGroup":return{_tag:"FilterGroup",checks:At(p.checks,w),...T(p.annotations)}}}function P(p){if(p===void 0)return;let{representation:y,...S}=p;return{...y===void 0?void 0:{representation:y},...Object.keys(S).length===0?void 0:{annotations:S}}}function T(p){if(p===void 0)return;let{representation:y,...S}=p,v=y===void 0?void 0:y.schemas===void 0?y:{...y,schemas:y.schemas.map(C=>x(yt(C)))};return{...v===void 0?void 0:{representation:v},...Object.keys(S).length===0?void 0:{annotations:S}}}}function PN(e){return xt(e)?e.value:{issues:[{message:BO(e.cause)}]}}function RN(e,t){let n=mt(e),r={errors:"all",...t?.parseOptions},o=TP(t),s=a=>{let i=new Ta("sync"),c=go(js(n(a,r),{onFailure:o,onSuccess:l=>({value:l})}),{scheduler:i});c.currentDispatcher?.flush();let u=c.pollUnsafe();return u?PN(u):new Promise(l=>{c.addObserver(f=>{l(PN(f))})})};if("~standard"in e){let a=e;return"validate"in a["~standard"]||Object.assign(a["~standard"],{validate:s}),a}return Object.assign(e,{"~standard":{version:1,vendor:"effect",validate:s}})}function _G(e){let t=Xf(iu(e));return Yh(t)}function FN(e,t){let n=_G(e);if(t==="draft-2020-12"){let r=n.schema;return Object.keys(n.definitions).length>0&&(r.$defs=n.definitions),r}else if(t==="draft-07"){let r=lN(n),o=r.schema;return Object.keys(r.definitions).length>0&&(o.definitions=r.definitions),o}throw new globalThis.Error(`Unsupported target: ${t}`)}function MN(e){let t={input(n){return FN(e.ast,n.target)},output(n){return FN(yt(e.ast),n.target)}};if("~standard"in e){let n=e;return"jsonSchema"in n["~standard"]||Object.assign(n["~standard"],{jsonSchema:t}),n}return Object.assign(e,{"~standard":{version:1,vendor:"effect",jsonSchema:t}})}function DN(e,t){let n=[];return Vv(e,t,"",n),n}function Vv(e,t,n,r){if(!Object.is(e,t)){if(Array.isArray(e)&&Array.isArray(t)){let o=e.length,s=t.length,a=Math.min(o,s);for(let i=0;i<a;i++)Vv(e[i],t[i],`${n}/${i}`,r);for(let i=o-1;i>=s;i--)r.push({op:"remove",path:`${n}/${i}`});for(let i=o;i<s;i++)r.push({op:"add",path:`${n}/${i}`,value:t[i]});return}if(Xh(e)&&Xh(t)){let o=Object.keys(e),s=Object.keys(t),a=Array.from(new Set([...o,...s])).sort();for(let i of a){let c=`${n}/${Uv(i)}`,u=Object.hasOwn(e,i),l=Object.hasOwn(t,i);u&&l?Vv(e[i],t[i],c,r):!u&&l?r.push({op:"add",path:c,value:t[i]}):r.push({op:"remove",path:c})}return}r.push({op:"replace",path:n,value:t})}}function UN(e,t){let n=t;for(let r of e)n=RG(n,r);return n}function Xh(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function FG(e){if(e==="")return[];if(e.charCodeAt(0)!==47)throw new Error(`Invalid JSON Pointer, it must start with "/": ${JSON.stringify(e)}`);return e.split("/").slice(1).map(Jf)}function $N(e){if(!/^(0|[1-9]\d*)$/.test(e))throw new Error(`Invalid array index: "${e}"`);return Number(e)}function RG(e,t){if(t.path===""){if(t.op==="remove")throw new Error("Unsupported operation at the root");return t.value}let n=MG(e,t.path);if(n===null)throw new Error(`Cannot ${t.op} at "${t.path}" (parent not found or not a container).`);let{lastToken:r,parent:o,stack:s}=n;if(Array.isArray(o)){if(r==="-"&&t.op!=="add")throw new Error(`"-" is not valid for ${t.op} at "${t.path}".`);let a=r==="-"?o.length:$N(r),i=t.op==="add"?o.length:o.length-1;if(a>i)throw new Error(`Array index out of bounds at "${t.path}".`);let c=o.slice();return t.op==="add"?c.splice(a,0,t.value):t.op==="remove"?c.splice(a,1):c[a]=t.value,NN(s,c)}if(Xh(o)){if(t.op!=="add"&&!Object.hasOwn(o,r))throw new Error(`Property "${r}" does not exist at "${t.path}".`);let a={...o};return t.op==="remove"?delete a[r]:N(a,r,t.value),NN(s,a)}throw new Error(`Cannot ${t.op} at "${t.path}" (parent not found or not a container).`)}function MG(e,t){let n=FG(t);if(n.length===0)return null;let r=n[n.length-1],o=[],s=e;for(let a=0;a<n.length-1;a++){let i=n[a];if(Array.isArray(s)){let c=$N(i);if(c>=s.length)return null;o.push({container:s,token:c}),s=s[c];continue}if(Xh(s)){if(!Object.hasOwn(s,i))return null;o.push({container:s,token:i}),s=s[i];continue}return null}return{stack:o,parent:s,lastToken:r}}function NN(e,t){let n=t;for(let r=e.length-1;r>=0;r--){let{container:o,token:s}=e[r];if(Array.isArray(o)){let a=o.slice();a[s]=n,n=a}else{let a={...o};N(a,s,n),n=a}}return n}function BN(e){let t=Gh(e),n=Wh(t),r=qh(t);return{empty:[],diff:(o,s)=>DN(n(o),n(s)),combine:(o,s)=>[...o,...s],patch:(o,s)=>{let a=n(o),i=UN(s,a);return Object.is(i,a)?o:r(i)}}}function jN(e,t){let n=$c(e.ast)??jS(e.ast),r=JM(Jh(e));return o=>r(o).pipe(ne(s=>DG(s,{rootName:n,...t})))}function DG(e,t){let n=t.rootName??"root",r=t.arrayItemName??"item",o=t.pretty??!0,s=t.indent??"  ",a=t.sortKeys??!0,i=new Set,c=[];return l(n,e,0),c.join(o?`
`:"");function u(f,d){c.push(o?s.repeat(f)+d:d)}function l(f,d,m,g){let{attrs:x,safe:E}=cu.tagInfo(f,g);if(d===void 0)u(m,`<${E}${x}/>`);else if(typeof d=="string")u(m,`<${E}${x}>${cu.escapeText(d)}</${E}>`);else if(typeof d!="object"||d===null)u(m,`<${E}${x}>${cu.escapeText(M(d))}</${E}>`);else{if(i.has(d))throw new globalThis.Error("Cycle detected while serializing to XML.",{cause:d});i.add(d);try{if(globalThis.Array.isArray(d)){if(d.length===0){u(m,`<${E}${x}/>`);return}u(m,`<${E}${x}>`);for(let P of d)l(r,P,m+1);u(m,`</${E}>`);return}let k=d,w=Object.keys(k);if(a&&w.sort(),w.length===0){u(m,`<${E}${x}/>`);return}u(m,`<${E}${x}>`);for(let P of w)l(cu.parseTagName(P).safe,k[P],m+1,P);u(m,`</${E}>`)}finally{i.delete(d)}}}}var cu={escapeText(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")},escapeAttribute(e){return e.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")},parseTagName(e){let t=e,n=e;return/^[A-Za-z_]/.test(n)||(n="_"+n),n=n.replace(/[^A-Za-z0-9._-]/g,"_"),/^xml/i.test(n)&&(n="_"+n),{safe:n,changed:n!==t}},tagInfo(e,t){let{changed:n,safe:r}=cu.parseTagName(e),s=n||t&&t!==e?` data-name="${cu.escapeAttribute(t??e)}"`:"";return{safe:r,attrs:s}}};var Gv=dr(e=>Xs(e));function Xs(e){let t=ts(e)?.toEquivalence;if(t)return t(Jc(e)?e.typeParameters.map(Xs):[]);switch(e._tag){case"Never":return ya();case"Declaration":return $G(e);case"Null":case"Undefined":case"Void":case"Unknown":case"Any":case"String":case"Number":case"Boolean":case"BigInt":case"Symbol":case"Literal":case"UniqueSymbol":case"ObjectKeyword":case"Enum":case"TemplateLiteral":return Q;case"Arrays":{let n=e.elements.map(Xs),r=e.rest.map(Xs),[o,...s]=r,a=s.length;return Qt((i,c)=>{if(!Array.isArray(i)||!Array.isArray(c))return!1;let u=i.length;if(u!==c.length)return!1;let l=0;for(;l<Math.min(u,e.elements.length);l++)if(!n[l](i[l],c[l]))return!1;if(r.length>0){for(;l<u-a;l++)if(!o(i[l],c[l]))return!1;for(let f=0;f<a;f++)if(!s[f](i[l+f],c[l+f]))return!1}return!0})}case"Objects":{if(e.propertySignatures.length===0&&e.indexSignatures.length===0)return Q;let n=e.propertySignatures.map(o=>Xs(o.type)),r=e.indexSignatures.map(o=>Xs(o.type));return Qt((o,s)=>{if(!Mn(o)||!Mn(s))return!1;for(let a=0;a<n.length;a++){let i=e.propertySignatures[a],c=i.name,u=Object.hasOwn(o,c),l=Object.hasOwn(s,c);if(Ht(i.type)&&u!==l||u&&l&&!n[a](o[c],s[c]))return!1}for(let a=0;a<r.length;a++){let i=e.indexSignatures[a],c=Ks(o,i.parameter),u=Ks(s,i.parameter);if(c.length!==u.length)return!1;for(let l=0;l<c.length;l++){let f=c[l];if(!Object.hasOwn(s,f)||!r[a](o[f],s[f]))return!1}}return!0})}case"Union":{let n=yt(e).types,r=Uf(n),o=n.map((s,a)=>[Kf(s),Xs(e.types[a])]);return Qt((s,a)=>{let i=r(s,!1);for(let c=0;c<i.length;c++){let[u,l]=o[i[c]];if(u(s)&&u(a))return l(s,a)}return!1})}case"Suspend":{let n;return Qt((r,o)=>(n??=Gv(e.thunk()))(r,o))}}}function $G(e){let t=e.annotations?.representation;if(t===void 0)return Q;switch(t.id){case"effect/schema/Option":{let[n]=di(e);return(r,o)=>r._tag===o._tag&&(r._tag==="None"||n(r.value,o.value))}case"effect/schema/Result":{let[n,r]=di(e);return(o,s)=>o._tag===s._tag&&(o._tag==="Success"?n(o.success,s.success):r(o.failure,s.failure))}case"effect/schema/CauseReason":{let[n,r]=di(e);return qN(n,r)}case"effect/schema/Cause":{let[n,r]=di(e);return zN(n,r)}case"effect/schema/Exit":{let[n,r,o]=di(e),s=zN(r,o);return(a,i)=>a._tag===i._tag&&(a._tag==="Success"?n(a.value,i.value):s(a.cause,i.cause))}case"effect/schema/ReadonlyMap":{let[n,r]=di(e);return Kd(n,r)}case"effect/schema/ReadonlySet":return el(di(e)[0]);case"effect/schema/RegExp":return(n,r)=>n.source===r.source&&n.flags===r.flags;case"effect/schema/URL":return(n,r)=>n.toString()===r.toString();default:return Q}}function di(e){return e.typeParameters.map(Xs)}function qN(e,t){return(n,r)=>{if(n._tag!==r._tag)return!1;switch(n._tag){case"Fail":return e(n.error,r.error);case"Die":return t(n.defect,r.defect);case"Interrupt":return n.fiberId===r.fiberId}}}function zN(e,t){let n=ep(qN(e,t));return(r,o)=>n(r.reasons,o.reasons)}function HN(e,t){return n=>{switch(n._tag){case"Fail":return`Fail(${e(n.error)})`;case"Die":return`Die(${t(n.defect)})`;case"Interrupt":return"Interrupt"}}}function WN(e,t){let n=HN(e,t);return r=>`Cause([${r.reasons.map(n).join(", ")}])`}function VN(e,t){let n=new Map;return r(e);function r(a){let i=n.get(a);return i===void 0&&(i=o(a),n.set(a,i)),i}function o(a){let i=ts(a)?.toFormatter;if(typeof i=="function")return i(Jc(a)?a.typeParameters.map(r):[]);if(t?.onBefore){let c=t.onBefore(a,r);if(c!==void 0)return c}return s(a)}function s(a){switch(a._tag){default:return M;case"Never":return()=>"never";case"Void":return()=>"void";case"Declaration":{let i=a.annotations?.representation;if(i===void 0)return M;let c=a.typeParameters.map(r);switch(i.id){case"effect/schema/Option":{let[u]=c;return _e({onNone:()=>"none()",onSome:l=>`some(${u(l)})`})}case"effect/schema/Result":{let[u,l]=c;return on({onSuccess:f=>`success(${u(f)})`,onFailure:f=>`failure(${l(f)})`})}case"effect/schema/CauseReason":return HN(c[0],c[1]);case"effect/schema/Cause":return WN(c[0],c[1]);case"effect/schema/Exit":{let[u,l,f]=c,d=WN(l,f);return m=>{switch(m._tag){case"Success":return`Exit.Success(${u(m.value)})`;case"Failure":return`Exit.Failure(${d(m.cause)})`}}}case"effect/schema/ReadonlyMap":{let[u,l]=c;return f=>{let d=f.size;if(d===0)return"ReadonlyMap(0) {}";let m=globalThis.Array.from(f.entries()).sort().map(([g,x])=>`${u(g)} => ${l(x)}`);return`ReadonlyMap(${d}) { ${m.join(", ")} }`}}case"effect/schema/HashMap":{let[u,l]=c;return f=>{let d=TM(f);if(d===0)return"HashMap(0) {}";let m=Wf(f).sort().map(([g,x])=>`${u(g)} => ${l(x)}`);return`HashMap(${d}) { ${m.join(", ")} }`}}case"effect/schema/ReadonlySet":{let[u]=c;return l=>{let f=l.size;if(f===0)return"ReadonlySet(0) {}";let d=globalThis.Array.from(l.values()).sort().map(m=>`${u(m)}`);return`ReadonlySet(${f}) { ${d.join(", ")} }`}}case"effect/schema/HashSet":{let[u]=c;return l=>{let f=FM(l);if(f===0)return"HashSet(0) {}";let d=globalThis.Array.from(l).sort().map(m=>`${u(m)}`);return`HashSet(${f}) { ${d.join(", ")} }`}}case"effect/schema/Chunk":{let[u]=c;return l=>{let f=u1(l);if(f===0)return"Chunk(0) {}";let d=globalThis.Array.from(l).sort().map(m=>`${u(m)}`);return`Chunk(${f}) { ${d.join(", ")} }`}}default:return M}}case"Arrays":{let i=a.elements.map(d=>r(d)),c=a.rest.map(r),[u,...l]=c,f=l.length;return d=>{let m=[],g=0;for(;g<i.length;g++)if(d.length<g+1){if(Ht(a.elements[g]))continue}else m.push(i[g](d[g]));if(c.length>0){for(;g<d.length-f;g++)m.push(u(d[g]));for(let x=0;x<f;x++)m.push(l[x](d[g+x]))}return"["+m.join(", ")+"]"}}case"Objects":{let i=a.propertySignatures.map(u=>r(u.type)),c=a.indexSignatures.map(u=>r(u.type));return a.propertySignatures.length===0&&a.indexSignatures.length===0?M:u=>{let l=[],f=new Set;for(let d=0;d<i.length;d++){let m=a.propertySignatures[d],g=m.name;f.add(g),!(Ht(m.type)&&!Object.hasOwn(u,g))&&l.push(`${Gr(g)}: ${i[d](u[g])}`)}for(let d=0;d<c.length;d++){let m=Ks(u,a.indexSignatures[d].parameter);for(let g of m)f.has(g)||(f.add(g),l.push(`${Gr(g)}: ${c[d](u[g])}`))}return l.length>0?"{ "+l.join(", ")+" }":"{}"}}case"Union":{let i=yt(a).types,c=Uf(i),u=i.map((l,f)=>[Kf(l),r(a.types[f])]);return l=>{let f=c(l,!1);for(let d=0;d<f.length;d++){let[m,g]=u[f[d]];if(m(l))return g(l)}return M(l)}}case"Suspend":{let i;return c=>(i??=r(a.thunk()))(c)}}}}var Kv=h(2,(e,t)=>Qv(e,(n,r)=>KN(t,n)?[n,r]:void 0)),Jv=h(2,(e,t)=>Qv(e,(n,r)=>KN(t,n)?void 0:[n,r])),GN=h(2,(e,t)=>({...e,...t}));var Zv=h(2,(e,t)=>Qv(e,(n,r)=>[Object.hasOwn(t,n)?t[n]:n,r]));var un=e=>e;function KN(e,t){return e.some(n=>n===t||typeof n=="number"&&String(n)===t)}function Qv(e,t){let n={};for(let r of Reflect.ownKeys(e)){if(!Object.prototype.propertyIsEnumerable.call(e,r))continue;let o=t(r,e[r]);if(o){let[s,a]=o;N(n,s,a)}}return n}function QN(e,t){return Mr(uu("Iso",e,t))}function JN(e,t){return Mr(uu("Lens",e,t))}function uu(e,t,n){return[{_tag:"PrimitiveNode",kind:e,get:t,set:n}]}var jG={kind:"Iso",get:F,set:F},eg=class{_tag="PathNode";kind="Lens";path;get;set;constructor(t){this.path=t,this.get=n=>{let r=n;for(let o=0;o<t.length;o++)r=r[t[o]];return r},this.set=(n,r)=>{let o=tg(r),s=o,a=0;for(;a<t.length-1;a++){let i=t[a];N(s,i,tg(s[i])),s=s[i]}return N(s,t[a],n),o}}},ed=class{_tag="CheckNode";kind="Prism";checks;get;set=F;constructor(t){this.checks=t,this.get=n=>MR(t,n)}};function pi(e,t){if(e.length===0)return t;if(t.length===0)return e;let n=e.slice();for(let r=0;r<t.length;r++){let o=t[r],s=n[n.length-1];s._tag==="PathNode"&&o._tag==="PathNode"?n[n.length-1]=new eg([...s.path,...o.path]):s._tag==="CheckNode"&&o._tag==="CheckNode"?n[n.length-1]=new ed([...s.checks,...o.checks]):n.push(o)}return n}function zG(e,t){return Mr(uu("Optional",e,t))}var lu=class{node;getResult;replaceResult;constructor(t,n,r){this.node=t,this.getResult=n,this.replaceResult=r}replace(t,n){return Os(this.replaceResult(t,n),()=>n)}modify(t){return n=>Os(ut(this.getResult(n),r=>this.replaceResult(t(r),n)),()=>n)}compose(t){return Mr(pi(this.node,t.node))}key(t){return Mr(pi(this.node,[new eg([t])]))}optionalKey(t){return Mr(pi(this.node,uu("Lens",n=>n[t],(n,r)=>{let o=tg(r);return n===void 0?Array.isArray(o)&&(typeof t=="number"||typeof t=="string"&&Hi(t))?o.splice(Number(t),1):delete o[t]:N(o,t,n),o})))}check(...t){return Mr(pi(this.node,[new ed(t)]))}refine(t,n){return Mr(pi(this.node,[new ed([Sh(t,n)])]))}tag(t){let n=K(new de({expected:`${JSON.stringify(t)} tag`}));return Mr(pi(this.node,uu("Prism",r=>r._tag===t?$(r):n,F)))}at(t,...n){let r=K(new It([t],new Gs(void 0)));return Mr(pi(this.node,uu("Optional",o=>Object.hasOwn(o,t)?$(o[t]):r,(o,s)=>{if(Object.hasOwn(s,t)){let a=tg(s);return N(a,t,o),$(a)}else return r})))}pick(t){return this.compose(JN(Kv(t),(n,r)=>({...Jv(r,t),...n})))}omit(t){return this.compose(JN(Jv(t),(n,r)=>({...Kv(r,t),...n})))}notUndefined(){return this.refine(ct,{expected:"a value other than `undefined`"})}forEach(t){let n=t(ng());return zG(r=>wt(this.getResult(r),o=>{let s=[];for(let a=0;a<o.length;a++){let i=n.getResult(o[a]);Ft(i)&&s.push(i.success)}return s}),(r,o)=>ut(this.getResult(o),s=>{let a=[];for(let c=0;c<s.length;c++)Ft(n.getResult(s[c]))&&a.push(c);if(r.length!==a.length)return K(new de({message:`each: replacement length mismatch: ${r.length} !== ${a.length}`}));let i=s.slice();for(let c=0;c<a.length;c++){let u=a[c],l=n.replaceResult(r[c],s[u]);if(he(l))return K(new It([u],l.failure));i[u]=l.success}return this.replaceResult(i,o)}))}modifyAll(t){return n=>Os(ut(this.getResult(n),r=>this.replaceResult(r.map(t),n)),()=>n)}},Xv=class extends lu{get;set;constructor(t,n,r){super(t,o=>$(n(o)),o=>$(r(o))),this.get=n,this.set=r}replace(t,n){return this.set(t)}modify(t){return n=>this.set(t(this.get(n)))}},ew=class extends lu{get;constructor(t,n,r){super(t,o=>$(n(o)),(o,s)=>$(r(o,s))),this.get=n,this.replace=r}modify(t){return n=>this.replace(t(this.get(n)),n)}},tw=class extends lu{set;constructor(t,n,r){super(t,n,(o,s)=>$(r(o))),this.set=r}replace(t,n){return this.set(t)}modify(t){return n=>Os(wt(this.getResult(n),r=>this.set(t(r))),()=>n)}};function Mr(e){let t=e[0]??jG;if(e.length>1){let n=e.reduce((r,o)=>HG(r,o.kind),"Iso");t={kind:n,get:qG(e,n),set:WG(e,n)}}switch(t.kind){case"Iso":return new Xv(e,t.get,t.set);case"Lens":return new ew(e,t.get,t.set);case"Prism":return new tw(e,t.get,t.set);case"Optional":return new lu(e,t.get,t.set)}}function tg(e){if(Array.isArray(e))return e.slice();if(typeof e=="object"&&e!==null){let t=Object.getPrototypeOf(e);if(t!==Object.prototype&&t!==null)throw new Error("Cannot clone object with non-Object constructor or null prototype");return{...e}}return e}function qG(e,t){return n=>{for(let r=0;r<e.length;r++){let o=e[r],s=o.get(n);if(nw(o.kind)){if(he(s))return s;n=s.success}else n=s}return nw(t)?$(n):n}}function WG(e,t){return ZN(t)?n=>{for(let r=e.length-1;r>=0;r--)n=e[r].set(n);return n}:(n,r)=>{let o=e.length,s=new Array(o);for(let a=0;a<o;a++){s[a]=r;let i=e[a];if(nw(i.kind)){let c=i.get(r);if(he(c))return c;r=c.success}else r=i.get(r)}for(let a=o-1;a>=0;a--){let i=e[a];if(ZN(i.kind))n=i.set(n);else if(i.kind==="Lens")n=i.set(n,s[a]);else{let c=i.set(n,s[a]);if(he(c))return c;n=c.success}}return t==="Optional"?$(n):n}}function nw(e){return e==="Prism"||e==="Optional"}function ZN(e){return e==="Iso"||e==="Prism"}function HG(e,t){return e==="Iso"?t:t==="Iso"||e===t?e:"Optional"}var VG=Mr([]);function ng(){return VG}function XN(e){let t=Kh(e);return QN(Wh(t),qh(t))}function eD(e){return ng()}function tD(e){return ng()}var fu="~effect/Schema/SchemaError";function nD(e){return _(e,fu)&&e[fu]===fu}var er="~effect/net/NetAddress";var Nr=e=>e.value,Dr=e=>e,as=e=>e.bytes,mi=class extends hr("NetAddressError"){},du=e=>_(e,er),ln=e=>du(e)&&e._tag==="Ipv4Address",Ao=e=>du(e)&&e._tag==="Ipv6Address",rD=e=>ln(e)||Ao(e),pu=e=>ln(e)?32:128,mu=e=>du(e)&&e._tag==="MacAddress",nd=e=>du(e)&&e._tag==="InetAddressV4",rd=e=>du(e)&&e._tag==="InetAddressV6",rw=e=>nd(e)||rd(e),rg=e=>du(e)&&e._tag==="UnixPathAddress",oD=e=>rw(e)||rg(e),KG={_tag:"Ipv4Address",[er]:er,[se](e){return ln(e)&&Nr(this)===Nr(e)},[oe](){return $t(ce(YG,Nr(this)|0))},toString(){return Ur(this)},toJSON(){return this.toString()},[Ee](){return this.toJSON()}},JG={_tag:"Ipv6Address",[er]:er,[se](e){if(!Ao(e))return!1;let t=Dr(this),n=Dr(e);return t.w0===n.w0&&t.w1===n.w1&&t.w2===n.w2&&t.w3===n.w3},[oe](){let e=Dr(this),t=ce(XG,e.w0|0);return t=ce(t,e.w1|0),t=ce(t,e.w2|0),$t(ce(t,e.w3|0))},toString(){return Ur(this)},toJSON(){return this.toString()},[Ee](){return this.toJSON()}},ZG={_tag:"MacAddress",[er]:er,[se](e){return mu(e)&&QG(as(this),as(e))},[oe](){return ce(e6,Vr(as(this)))},toString(){return sw(this)},toJSON(){return this.toString()},[Ee](){return this.toJSON()}},QG=(e,t)=>{if(e.length!==t.length)return!1;for(let n=0;n<e.length;n++)if(e[n]!==t[n])return!1;return!0},YG=Ie("Ipv4Address"),XG=Ie("Ipv6Address"),e6=Ie("MacAddress"),t6=e=>{let t=Object.create(KG);return t.value=e>>>0,Object.freeze(t)},n6=(e,t,n,r)=>{let o=Object.create(JG);return o.w0=e>>>0,o.w1=t>>>0,o.w2=n>>>0,o.w3=r>>>0,Object.freeze(o)},r6=(e,t,n,r)=>(e<<24|t<<16|n<<8|r)>>>0;var td=e=>[e>>>24,e>>>16&255,e>>>8&255,e&255],o6=e=>{let t=Object.assign(Object.create(ZG),{bytes:new Uint8Array(e)});return Object.freeze(t)};var bt=(e,t)=>K(new mi({input:e,message:t})),s6=e=>e.every(t=>Number.isInteger(t)&&t>=0&&t<=255)?$(t6(r6(e[0],e[1],e[2],e[3]))):bt(e,"octets must be integers from 0 through 255"),a6=e=>e.every(t=>Number.isInteger(t)&&t>=0&&t<=65535)?$(n6(e[0]*65536+e[1],e[2]*65536+e[3],e[4]*65536+e[5],e[6]*65536+e[7])):bt(e,"segments must be integers from 0 through 65535");var sD=e=>/^(?:[0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$/.test(e)?$(o6(new Uint8Array(e.split(":").map(t=>Number.parseInt(t,16))))):bt(e,"expected six two-digit hexadecimal octets separated by colons");var hu=e=>{let t=e.split(".");if(t.length!==4||t.some(r=>!/^\d{1,3}$/.test(r)))return bt(e,"expected exactly four decimal octets");if(t.some(r=>r.length>1&&r[0]==="0"))return bt(e,"leading zeroes are not allowed");let n=t.map(Number);return n.some(r=>r>255)?bt(e,"octets must be at most 255"):s6([n[0],n[1],n[2],n[3]])},i6=e=>{if(e.includes("[")||e.includes("]")||e.includes("%"))return bt(e,"brackets and zone identifiers are not valid in a bare IPv6 address");let t=e.split("::");if(t.length>2)return bt(e,"only one compression marker is allowed");let n=t[0]===""?[]:t[0].split(":"),r=t.length===2&&t[1]!==""?t[1].split(":"):[];if(n.some(l=>l==="")||r.some(l=>l===""))return bt(e,"empty segments are only valid in the compression marker");let o=r.length>0?r[r.length-1]:n.length>0?n[n.length-1]:"",s;if(o.includes(".")){if(t.length===2&&r.length===0)return bt(e,"embedded IPv4 syntax must be trailing");let l=wt(hu(o),f=>{let d=Nr(f);return[d>>>16,d&65535]});if(he(l))return l;s=l.success,r.length>0?r.pop():n.pop()}let a=n.length+r.length+(s?2:0);if(t.length===1?a!==8:a>=8)return bt(e,t.length===1?"expected eight segments":"compression must replace at least one segment");let i=l=>/^[0-9a-fA-F]{1,4}$/.test(l)?Number.parseInt(l,16):void 0,c=n.map(i),u=r.map(i);return c.some(l=>l===void 0)||u.some(l=>l===void 0)?bt(e,"segments must contain one through four hexadecimal digits"):$([...c,...Array(8-a).fill(0),...u,...s??[]])},od=e=>ut(i6(e),t=>a6(t)),sd=e=>e.includes(":")?od(e):hu(e);var ow=e=>td(Nr(e)),c6=e=>{let{w0:t,w1:n,w2:r,w3:o}=Dr(e);return[t>>>16,t&65535,n>>>16,n&65535,r>>>16,r&65535,o>>>16,o&65535]},aD=e=>{let{w0:t,w1:n,w2:r,w3:o}=Dr(e);return[...td(t),...td(n),...td(r),...td(o)]};var sw=e=>Array.from(as(e),t=>t.toString(16).padStart(2,"0")).join(":"),og=e=>as(e).every(t=>t===255),u6=e=>(as(e)[0]&1)!==0,sg=e=>(as(e)[0]&1)===0,aw=e=>(as(e)[0]&2)!==0,iw=e=>(as(e)[0]&2)===0;var Ur=e=>{if(ln(e))return ow(e).join(".");let t=c6(e);if(l6(e))return`::ffff:${t[6]>>8}.${t[6]&255}.${t[7]>>8}.${t[7]&255}`;let n=-1,r=0,o=-1;for(let i=0;i<=8;i++)i<8&&t[i]===0?o===-1&&(o=i):o!==-1&&(i-o>r&&(n=o,r=i-o),o=-1);if(r<2)return t.map(i=>i.toString(16)).join(":");let s=t.slice(0,n).map(i=>i.toString(16)).join(":"),a=t.slice(n+r).map(i=>i.toString(16)).join(":");return`${s}::${a}`},ag=e=>{if(ln(e))return Nr(e)===0;let{w0:t,w1:n,w2:r,w3:o}=Dr(e);return t===0&&n===0&&r===0&&o===0},cw=e=>{if(ln(e))return Nr(e)>>>24===127;let{w0:t,w1:n,w2:r,w3:o}=Dr(e);return t===0&&n===0&&r===0&&o===1},gu=e=>mu(e)?u6(e):ln(e)?Nr(e)>>>28===14:Dr(e).w0>>>24===255,ig=e=>mu(e)?og(e):Nr(e)===4294967295,uw=e=>mu(e)?sg(e):!gu(e)&&!ag(e)&&(!ln(e)||!ig(e)),lw=e=>ln(e)?Nr(e)>>>16===43518:(Dr(e).w0>>>16&65472)===65152,fw=e=>{let t=Nr(e);return t>>>24===10||(t>>>16&65520)===44048||t>>>16===49320},dw=e=>(Dr(e).w0>>>24&254)===252,l6=e=>{let{w0:t,w1:n,w2:r}=Dr(e);return t===0&&n===0&&r===65535};var f6={_tag:"InetAddressV4",[er]:er,[se](e){return nd(e)&&this.port===e.port&&Q(this.address,e.address)},[oe](){return ce(G(this.address),Et(this.port))},toString(){return cg(this)},toJSON(){return this.toString()},[Ee](){return this.toJSON()}},d6={_tag:"InetAddressV6",[er]:er,[se](e){return rd(e)&&this.port===e.port&&this.scopeId===e.scopeId&&Q(this.address,e.address)},[oe](){return ce(ce(G(this.address),Et(this.port)),Et(this.scopeId))},toString(){return cg(this)},toJSON(){return this.toString()},[Ee](){return this.toJSON()}},iD=e=>Number.isInteger(e)&&e>=0&&e<=65535,p6=(e,t)=>{if(!iD(t))return bt(e,"port must be an integer from 0 through 65535");let n=Object.create(f6);return n.address=e,n.port=t,$(Object.freeze(n))},m6=(e,t,n)=>{if(!iD(t))return bt(e,"port must be an integer from 0 through 65535");let r=n?.scopeId??0;if(!Number.isInteger(r)||r<0||r>4294967295)return bt(e,"scopeId must be an unsigned 32-bit integer");let o=Object.create(d6);return o.address=e,o.port=t,o.scopeId=r,$(Object.freeze(o))};var cD=e=>{let t,n,r=0,o=e.startsWith("[");if(o){let s=e.indexOf("]");if(s<0||e[s+1]!==":"||e.indexOf("]",s+1)!==-1)return bt(e,"expected [IPv6]:port");t=e.slice(1,s),n=e.slice(s+2);let a=t.indexOf("%");if(a!==-1){let i=t.slice(a+1);if(t.indexOf("%",a+1)!==-1||!/^\d+$/.test(i))return bt(e,"scope identifier must be decimal");if(r=Number(i),!Number.isInteger(r)||r>4294967295)return bt(e,"scope identifier must be an unsigned 32-bit integer");t=t.slice(0,a)}}else{let s=e.lastIndexOf(":");if(s<0)return bt(e,"expected host:port or [IPv6]:port");if(e.indexOf(":")!==s)return bt(e,"IPv6 addresses must be bracketed");t=e.slice(0,s),n=e.slice(s+1)}return/^(0|[1-9]\d*)$/.test(n)?ut(sd(t),s=>o!==Ao(s)?bt(e,"only IPv6 addresses use brackets"):Ao(s)?m6(s,Number(n),{scopeId:r}):p6(s,Number(n))):bt(e,"port must be an unpadded decimal integer")};var h6=e=>Ur(e.address)+(rd(e)&&e.scopeId!==0?`%${e.scopeId}`:"");var cg=e=>{let t=h6(e);return nd(e)?`${t}:${e.port}`:`[${t}]:${e.port}`};var g6={_tag:"UnixPathAddress",[er]:er,[se](e){return rg(e)&&this.path===e.path},[oe](){return ce(Ie("UnixPathAddress"),Ie(this.path))},toString(){return this.path},toJSON(){return this.toString()},[Ee](){return this.toJSON()}},uD=e=>{let t=Object.create(g6);return t.path=e,Object.freeze(t)};var mw="~effect/net/IpInterface",lD=e=>ad(e)&&ln(e.address),fD=e=>ad(e)&&Ao(e.address),ad=e=>_(e,mw),x6={_tag:"IpInterface",[mw]:mw,[se](e){return ad(e)&&this.prefixLength===e.prefixLength&&Q(this.address,e.address)},[oe](){return ce(G(this.address),Et(this.prefixLength))},toString(){return cd(this)},toJSON(){return this.toString()},[Ee](){return this.toJSON()}},hw=(e,t)=>K(new mi({input:e,message:t})),id=(e,t)=>{let n=pu(e);if(!Number.isInteger(t)||t<0||t>n)return hw(e,`prefix length must be an integer from 0 through ${n}`);let r=Object.assign(Object.create(x6),{address:e,prefixLength:t});return $(Object.freeze(r))},gw=(e,t)=>{let n=e.indexOf("/");if(n===-1&&t?.prefix!=="required")return $({address:e,prefixLength:void 0});if(n<=0||n!==e.lastIndexOf("/")||n===e.length-1)return hw(e,"expected an address and prefix length separated by one slash");let r=e.slice(n+1);return/^(0|[1-9][0-9]*)$/.test(r)?$({address:e.slice(0,n),prefixLength:Number(r)}):hw(e,"prefix length must be an unpadded ASCII decimal integer")},ug=(e,t)=>ut(gw(e,t),n=>ut(hu(n.address),r=>id(r,n.prefixLength??pu(r)))),lg=(e,t)=>ut(gw(e,t),n=>ut(od(n.address),r=>id(r,n.prefixLength??pu(r)))),fg=(e,t)=>ut(gw(e,t),n=>ut(sd(n.address),r=>id(r,n.prefixLength??pu(r))));var cd=e=>`${Ur(e.address)}/${e.prefixLength}`;var xw="~effect/net/IpNetwork",pD=e=>ud(e)&&ln(e.address),mD=e=>ud(e)&&Ao(e.address),ud=e=>_(e,xw),y6={_tag:"IpNetwork",[xw]:xw,[se](e){return ud(e)&&this.prefixLength===e.prefixLength&&Q(this.address,e.address)},[oe](){return ce(G(this.address),Et(this.prefixLength))},toString(){return ld(this)},toJSON(){return this.toString()},[Ee](){return this.toJSON()}},b6=e=>{let t=Object.assign(Object.create(y6),{address:e.address,prefixLength:e.prefixLength});return Object.freeze(t)},S6=e=>ln(e)?ow(e):aD(e);var E6=(e,t)=>{let n=Math.floor(t/8),r=t%8;return e.map((o,s)=>s<n?o:s===n&&r!==0?o&(255<<8-r&255):0)},yw=(e,t)=>ut(id(e,t),n=>{let r=S6(e),o=E6(r,t);return r.some((s,a)=>s!==o[a])?K(new mi({input:e,message:"address has non-zero host bits"})):$(b6(n))});var hD=e=>ut(ug(e,{prefix:"required"}),t=>yw(t.address,t.prefixLength)),gD=e=>ut(lg(e,{prefix:"required"}),t=>yw(t.address,t.prefixLength)),xD=e=>ut(fg(e,{prefix:"required"}),t=>yw(t.address,t.prefixLength));var ld=e=>`${Ur(e.address)}/${e.prefixLength}`;var fd=Vh;function Cn(){return(e,t,n)=>H(new Zc(e.map(Df),r=>t(r.map(o=>H(o))),n))}function Be(e,t){return Cn()([],()=>(n,r,o)=>e(n)?b(n):I(new dt(r,n,o)),t)}function w6(e){return e}function k6(e){return t=>t.annotate(e)}function I6(e){return t=>bw(bw(t).annotate(e))}function C6(e){return t=>t.rebuild(Bf(t.ast,e))}function T6(e){return e}var gi=class extends hr("SchemaError"){[fu]=fu;constructor(t){let n=Kr();Dn(0);try{super({issue:t})}finally{Dn(n)}}get message(){return AP(this.issue)}toString(){return`SchemaError(${this.message})`}};function PD(e){return nD(e)}function FD(e){return Ne(e)?kw(e):Vn(e,t=>Ls(()=>$s(t,n=>new gi(n))))}function kw(e){return xt(e)?e:uo($s(e.cause,t=>new gi(t)))}function RD(e,t){let n;for(let r of e.reasons){if(!ym(r)||!PD(r.error))throw new globalThis.Error(t,{cause:e});n??=r.error}if(n===void 0)throw new globalThis.Error(t,{cause:e});return n}function MD(e){return Lm(e).then(t=>{if(xt(t))return t.value;throw RD(t.cause,"Promise adapter can only reject schema errors")})}function ND(e){let t=xo(e);if(xt(t))return t.value;throw RD(t.cause,"Sync adapter can only throw schema errors")}function A6(e,t){return RN(e,t)}function O6(e){return MN(e)}var dg=Ov,_6=HM;function us(e,t){let n=mt(e,t);return(r,o)=>FD(n(r,o))}var P6=us;function DD(e,t){let n=VM(e,t);return(r,o)=>kw(n(r,o))}var F6=DD,R6=Pv,M6=GM;function UD(e,t){let n=KM(e,t);return(r,o)=>pl(n(r,o),s=>new gi(s))}var N6=UD;function $D(e,t){let n=us(e,t);return(r,o)=>MD(n(r,o))}var D6=$D;function LD(e,t){let n=us(e,t);return(r,o)=>ND(n(r,o))}var U6=LD;function pg(e,t){let n=li(e,t);return(r,o)=>FD(n(r,o))}var $6=pg;function BD(e,t){let n=ZM(e,t);return(r,o)=>kw(n(r,o))}var L6=BD,B6=Fv,j6=QM;function jD(e,t){let n=YM(e,t);return(r,o)=>pl(n(r,o),s=>new gi(s))}var z6=jD;function zD(e,t){let n=pg(e,t);return(r,o)=>MD(n(r,o))}var q6=zD;function qD(e,t){let n=pg(e,t);return(r,o)=>ND(n(r,o))}var W6=qD,H=Fr;function mg(e){return _(e,fd)&&e[fd]===fd}var is=un(e=>H(ni(e.ast),{schema:e})),H6=un(e=>e.schema),ls=un(e=>{let t=xg(e);return H(kR(e.ast),{schema:t})}),V6=un(e=>e.schema.members[0]),G6=un(e=>H(LE(e.ast),{schema:e})),K6=un(e=>e.schema),Tn=un(e=>H(yt(e.ast),{schema:e})),Su=un(e=>H(Tr(e.ast),{schema:e})),dd="~effect/Schema/flip";function J6(e){return _(e,dd)&&e[dd]===dd}function bw(e){return J6(e)?e.schema.rebuild(Yn(e.ast)):H(Yn(e.ast),{[dd]:dd,schema:e})}function St(e){let t=H(new Qn(e),{literal:e,transform(n){return t.pipe(Z(St(n),{decode:le(()=>n),encode:le(()=>e)}))}});return t}function WD(e){return e.map(t=>mg(t)?t.ast:new Qn(t))}function Z6(e){return H(new TE(WD(e)),{parts:e})}function Q6(e){return H(oR(WD(e)),{parts:e})}function Y6(e){return H(new rR(Object.keys(e).filter(t=>typeof e[e[t]]!="number").map(t=>[t,e[t]])),{enums:e})}var X6=H(CE),eK=H(tR),pd=H(rs),hg=H(kE),Iw=H(IE),L=H(Zn),tK=L,md=H(AE),Cw=H(iR),HD=H(cR),Eu=H(uR),nK=H(eR),rK=H(nR);function oK(e){return H(new aR(e))}function Tw(e,t){return H(e,{fields:t,mapFields(n,r){let o=n(this.fields);return Tw(xh(o,r?.unsafePreserveChecks?this.ast.checks:void 0),o)}})}function Te(e){return Tw(xh(e,void 0),e)}function sK(e){return un(t=>t.mapFields(GN(e)))}var aK=e=>typeof e=="symbol"?e:globalThis.String(e);function iK(e){return function(t){let n={},r=Object.create(null),o=Object.create(null),s=new Set;for(let a of Reflect.ownKeys(t.fields)){let i=Su(t.fields[a]),c=Object.hasOwn(e,a),u=c?e[a]:a,l=aK(u);if(s.has(l))throw new globalThis.Error(`Duplicate encoded keys: ${Gr(u)}`);s.add(l),N(n,u,i),c&&(r[a]=u,o[u]=a)}return Te(n).pipe(Z(t,Ce({decode:Zv(o),encode:Zv(r)})))}}function cK(e,t){return n=>{let r=hp(n.fields,Tn),o=Te({...r,...e});return n.pipe(Z(o,Ce({decode:s=>{let a={...s};for(let i in e){let c=t[i],u=c(s);$e(u)&&N(a,i,u.value)}return a},encode:s=>{let a={...s};for(let i in e)delete a[i];return a}})))}}function xi(e,t){return H(CR(e.ast,t.ast),{key:e,value:t})}function uK(e,t){return H(mR(e.ast,t.map(Df)),{schema:e,records:t})}function VD(e,t){return H(e,{elements:t,mapElements(n,r){let o=n(this.elements);return VD(FE(o,r?.unsafePreserveChecks?this.ast.checks:void 0),o)}})}function Oo(e){return VD(FE(e),e)}function lK(e,t){return H(hR(e.ast,t.map(Df)),{schema:e,rest:t})}var Se=un(e=>H(new lr(!1,[],[e.ast]),{value:e}));function gg(e,t,n){return t!==void 0&&n!==void 0?e.check(Mw(t,n)):t!==void 0?e.check(l2(t)):n!==void 0?e.check(p2(n)):e}var Aw=un(e=>H(new lr(!1,[e.ast],[e.ast]),{value:e}));function fK(e){let t=Se(e),n=Se(Tn(e)),r=Z(Oo([pd]),Ce({decode:o=>[o],encode:([o])=>o}))(e);return H(st([r,t]).pipe(Z(n)).ast,{from:st([e,t]),to:n})}function dK(e){return Se(e).check(Dw())}var pK=un(e=>H(gR(e.ast),{schema:e}));function GD(e,t){return H(e,{members:t,mapMembers(n,r){let o=n(this.members);return GD(yh(o,this.ast.options,r?.unsafePreserveChecks?this.ast.checks:void 0),o)}})}function st(e,t){return GD(yh(e,t,void 0),e)}function ea(e){let t=e.map(St);return H(yh(t,void 0,void 0),{literals:e,members:t,mapMembers(n){return st(n(this.members))},pick(n){return ea(n)},transform(n){return st(t.map((r,o)=>r.transform(n[o])))}})}var Ow=un(e=>st([e,hg])),xg=un(e=>st([e,Iw])),KD=un(e=>st([e,hg,Iw]));function JD(e){return H(new ME(()=>e().ast))}function mK(...e){return t=>t.check(...e)}function ZD(e,t){return n=>H(Co(n.ast,[Sh(e,t)]),{schema:n})}function QD(e){return t=>H(t.ast,{schema:t,identifier:e})}function hK(e,t){return n=>(t.checks?n.check(...t.checks):n).pipe(QD(e))}function YD(e){return t=>H(vR(t.ast,new ch(e,F)),{schema:t})}function XD(e){return t=>H(wR(t.ast,new ch(F,e)),{schema:t})}function gK(e){return e2(e)}function e2(e){return t=>YD(af(e))(t)}function xK(e){return t2(e)}function t2(e){return t=>XD(af(e))(t)}function Z(e,t){return n=>H(eu(n.ast,e.ast,t?uh(t):qc()),{from:n,to:e})}function vu(){return(e,t)=>ve()(e,{decode:t,encode:KP})}var yg=ea(["true","yes","on","1","y"]),bg=ea(["false","no","off","0","n"]),_w=ea([...yg.literals,...bg.literals]).pipe(Z(Cw,Ce({decode:e=>e==="true"||e==="yes"||e==="on"||e==="1"||e==="y",encode:e=>e?"true":"false"})));function yK(e){return t=>Z(Tn(t),e)(t)}function Pw(e,t){return n=>t?Z(n,t)(e):Z(n)(e)}function bK(e){return t=>Z(t,e)(Su(t))}function n2(e){return t=>H(IR(t.ast,e),{schema:t})}function r2(e){return Vn(e,t=>Ls(()=>$s(t,n=>n.issue)))}function Fw(e,t){let n=t?.encodingStrategy==="omit"?nE():wo();return r=>is(Su(r)).pipe(Z(r,{decode:rE(r2(e)),encode:n}))}function SK(e,t){return n=>Tn(n).pipe(Fw(e,t),Pw(is(n)))}function o2(e,t){let n=t?.encodingStrategy==="omit"?nE():wo();return r=>ls(Su(r)).pipe(Z(r,{decode:rE(r2(e)),encode:n}))}function EK(e,t){return n=>Tn(n).pipe(o2(e,t),Pw(ls(n)))}function cs(e){return St(e).pipe(n2(b(e)))}function vK(e){return cs(e).pipe(Fw(b(e),{encodingStrategy:"omit"}))}function Sg(e,t){return Te({_tag:cs(e),...t})}function s2(e){return t=>{let n={},r=[],o=new Set,s={},a=l=>f=>l.includes(f[e]);return i(t),Object.assign(t,{cases:n,discriminants:r,isAnyOf:a,guards:s,match:c,matchOrElse:u});function i(l){let f=l.ast;if(QF(f)&&"members"in l&&globalThis.Array.isArray(l.members)&&l.members.every(mg))return l.members.forEach(i);let d=Gc(f);if(d.length>0){let m=d.find(g=>g.key===e)?.literal;if(Wd(m)){let g=typeof m=="number"?globalThis.String(m):m;if(o.has(g))throw new globalThis.Error(`Duplicate discriminant: ${globalThis.String(m)}`);o.add(g),r.push(m),N(n,m,l),N(s,m,Ov(Tn(l)));return}}throw new globalThis.Error("No literal or unique symbol found")}function c(){if(arguments.length===1){let g=arguments[0];return function(x){let E=x[e];return(Object.hasOwn(g,E)?g[E]:void 0)(x)}}let l=arguments[0],f=arguments[1],d=l[e];return(Object.hasOwn(f,d)?f[d]:void 0)(l)}function u(){if(arguments.length===2){let x=arguments[0],E=arguments[1];return function(k){let w=k[e];return(Object.hasOwn(x,w)?x[w]??E:E)(k)}}let l=arguments[0],f=arguments[1],d=arguments[2],m=l[e];return(Object.hasOwn(f,m)?f[m]??d:d)(l)}}}function wK(e){let t={},n=[];for(let c of Object.keys(e)){let u=Sg(c,e[c]);N(t,c,u),n.push(u)}let r=st(n),{guards:o,isAnyOf:s,match:a,matchOrElse:i}=s2("_tag")(r);return H(r.ast,{cases:t,isAnyOf:s,guards:o,match:a,matchOrElse:i})}function kK(){return e=>e}function ta(e,t){return Be(n=>n instanceof e,t)}function ve(){return(e,t)=>new ot(e.ast,uh(t))}var Fe=bh;function IK(e,t=void 0){return new Ya(e,t)}var yD="^\\S[\\s\\S]*\\S$|^\\S$|^$";function a2(e){let t=new globalThis.RegExp(yD);return Fe(n=>n.trim()===n,{expected:"a string with no leading or trailing whitespace",representation:{id:"effect/schema/isTrimmed",payload:null},toJsonSchema:()=>({pattern:t.source}),toCode:()=>({runtime:"Schema.isTrimmed()"}),arbitraryConstraint:{patterns:[{source:yD,flags:""}]},...e})}function wu(e,t){let n=e.source,r=e.flags,o=/^[dg]*uy?$/.test(r),s=r===""?`new RegExp(${M(n)})`:`new RegExp(${M(n)}, ${M(r)})`;return $f(e,{toJsonSchema:()=>o?{pattern:r.endsWith("y")?`^(?:${n})`:n}:[{},!0],toCode:()=>({runtime:`Schema.isPattern(${s})`}),...t})}function CK(e){return zE({toCode:()=>({runtime:"Schema.isStringFinite()"}),...e})}function TK(e){return qE({toCode:()=>({runtime:"Schema.isStringBigInt()"}),...e})}function AK(e){return HE({toCode:()=>({runtime:"Schema.isStringSymbol()"}),...e})}var OK=e=>e?new globalThis.RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`):/^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|[fF]{8}-[fF]{4}-[fF]{4}-[fF]{4}-[fF]{12})$/;function _K(e,t){let n=OK(e);return wu(n,{expected:e?`a UUID v${e}`:"a UUID",representation:{id:"effect/schema/isUUID",payload:{version:e??null}},toJsonSchema:()=>({pattern:n.source,format:"uuid"}),toCode:()=>({runtime:e===void 0?"Schema.isUUID()":`Schema.isUUID(${e})`}),...t})}var bD=/^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;function PK(e){return wu(bD,{expected:"a GUID",representation:{id:"effect/schema/isGUID",payload:null},toJsonSchema:()=>({pattern:bD.source}),toCode:()=>({runtime:"Schema.isGUID()"}),...e})}function FK(e){let t=/^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/;return wu(t,{representation:{id:"effect/schema/isULID",payload:null},toJsonSchema:()=>({pattern:t.source}),toCode:()=>({runtime:"Schema.isULID()"}),...e})}function i2(e){let t=/^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;return wu(t,{expected:"a base64 encoded string",representation:{id:"effect/schema/isBase64",payload:null},toJsonSchema:()=>({pattern:t.source}),toCode:()=>({runtime:"Schema.isBase64()"}),...e})}function RK(e){let t=/^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;return wu(t,{expected:"a base64url encoded string",representation:{id:"effect/schema/isBase64Url",payload:null},toJsonSchema:()=>({pattern:t.source}),toCode:()=>({runtime:"Schema.isBase64Url()"}),...e})}function Rw(e,t,n){if(e.length===0)return t.length===0?{}:[{},!0];let r={pattern:new globalThis.RegExp(n).source};return e===t?r:[r,!0]}function MK(e,t){let n=JSON.stringify(e),r=new globalThis.RegExp(`^${ss(e)}`),o=e.replace(/[\uD800-\uDBFF]$/,"");return Fe(s=>s.startsWith(e),{expected:`a string starting with ${n}`,representation:{id:"effect/schema/isStartingWith",payload:{startsWith:e}},toJsonSchema:()=>Rw(o,e,`^${ss(o)}`),toCode:()=>({runtime:`Schema.isStartingWith(${M(e)})`}),arbitraryConstraint:{patterns:[{source:r.source,flags:r.flags}]},...t})}function NK(e,t){let n=JSON.stringify(e),r=new globalThis.RegExp(`${ss(e)}$`),o=e.replace(/^[\uDC00-\uDFFF]/,"");return Fe(s=>s.endsWith(e),{expected:`a string ending with ${n}`,representation:{id:"effect/schema/isEndingWith",payload:{endsWith:e}},toJsonSchema:()=>Rw(o,e,`${ss(o)}$`),toCode:()=>({runtime:`Schema.isEndingWith(${M(e)})`}),arbitraryConstraint:{patterns:[{source:r.source,flags:r.flags}]},...t})}function DK(e,t){let n=JSON.stringify(e),r=new globalThis.RegExp(ss(e)),o=e.replace(/^[\uDC00-\uDFFF]|[\uD800-\uDBFF]$/g,"");return Fe(s=>s.includes(e),{expected:`a string including ${n}`,representation:{id:"effect/schema/isIncluding",payload:{includes:e}},toJsonSchema:()=>Rw(o,e,ss(o)),toCode:()=>({runtime:`Schema.isIncluding(${M(e)})`}),arbitraryConstraint:{patterns:[{source:r.source,flags:r.flags}]},...t})}var SD="^[^a-z]*$";function UK(e){let t=new globalThis.RegExp(SD);return Fe(n=>n.toUpperCase()===n,{expected:"a string with all characters in uppercase",representation:{id:"effect/schema/isUppercased",payload:null},toJsonSchema:()=>[{pattern:t.source},!0],toCode:()=>({runtime:"Schema.isUppercased()"}),arbitraryConstraint:{patterns:[{source:SD,flags:""}]},...e})}var ED="^[^A-Z]*$";function $K(e){let t=new globalThis.RegExp(ED);return Fe(n=>n.toLowerCase()===n,{expected:"a string with all characters in lowercase",representation:{id:"effect/schema/isLowercased",payload:null},toJsonSchema:()=>[{pattern:t.source},!0],toCode:()=>({runtime:"Schema.isLowercased()"}),arbitraryConstraint:{patterns:[{source:ED,flags:""}]},...e})}var vD="^(?:[^a-z][\\s\\S]*)?$";function LK(e){let t=new globalThis.RegExp(vD);return Fe(n=>n.charAt(0).toUpperCase()===n.charAt(0),{expected:"a string with the first character in uppercase",representation:{id:"effect/schema/isCapitalized",payload:null},toJsonSchema:()=>[{pattern:t.source},!0],toCode:()=>({runtime:"Schema.isCapitalized()"}),arbitraryConstraint:{patterns:[{source:vD,flags:""}]},...e})}var wD="^(?:[^A-Z][\\s\\S]*)?$";function BK(e){let t=new globalThis.RegExp(wD);return Fe(n=>n.charAt(0).toLowerCase()===n.charAt(0),{expected:"a string with the first character in lowercase",representation:{id:"effect/schema/isUncapitalized",payload:null},toJsonSchema:()=>[{pattern:t.source},!0],toCode:()=>({runtime:"Schema.isUncapitalized()"}),arbitraryConstraint:{patterns:[{source:wD,flags:""}]},...e})}var ku=H(DE),jK=NE;function hd(e){let t=zi(e.order),n=e.formatter??M;return(r,o)=>Fe(s=>t(s,r),{expected:`a value greater than ${n(r)}`,arbitraryConstraint:{order:e.order,minimum:r,exclusiveMinimum:!0},...e.annotate?.(r),...o})}function gd(e){let t=lp(e.order),n=e.formatter??M;return(r,o)=>Fe(s=>t(s,r),{expected:`a value greater than or equal to ${n(r)}`,arbitraryConstraint:{order:e.order,minimum:r},...e.annotate?.(r),...o})}function xd(e){let t=cp(e.order),n=e.formatter??M;return(r,o)=>Fe(s=>t(s,r),{expected:`a value less than ${n(r)}`,arbitraryConstraint:{order:e.order,maximum:r,exclusiveMaximum:!0},...e.annotate?.(r),...o})}function yd(e){let t=up(e.order),n=e.formatter??M;return(r,o)=>Fe(s=>t(s,r),{expected:`a value less than or equal to ${n(r)}`,arbitraryConstraint:{order:e.order,maximum:r},...e.annotate?.(r),...o})}function bd(e){let t=lp(e.order),n=zi(e.order),r=up(e.order),o=cp(e.order),s=e.formatter??M;return(a,i)=>{let c=a.exclusiveMinimum?n:t,u=a.exclusiveMaximum?o:r;return Fe(l=>c(l,a.minimum)&&u(l,a.maximum),{expected:`a value between ${s(a.minimum)}${a.exclusiveMinimum?" (excluded)":""} and ${s(a.maximum)}${a.exclusiveMaximum?" (excluded)":""}`,arbitraryConstraint:{order:e.order,minimum:a.minimum,maximum:a.maximum,...a.exclusiveMinimum&&{exclusiveMinimum:!0},...a.exclusiveMaximum&&{exclusiveMaximum:!0}},...e.annotate?.(a),...i})}}function zK(e){return(t,n)=>{let r=e.formatter??M;return Fe(o=>e.remainder(o,t)===e.zero,{expected:`a value that is a multiple of ${r(t)}`,...e.annotate?.(t),...n})}}function xu(e){if(!globalThis.Number.isFinite(e))throw new globalThis.RangeError(`Expected a finite number, got ${M(e)}`);return e}var qK=hd({order:$o,annotate:e=>({representation:{id:"effect/schema/isGreaterThan",payload:{exclusiveMinimum:xu(e)}},toJsonSchema:()=>({exclusiveMinimum:e}),toCode:()=>({runtime:`Schema.isGreaterThan(${M(e)})`})})}),c2=gd({order:$o,annotate:e=>({representation:{id:"effect/schema/isGreaterThanOrEqualTo",payload:{minimum:xu(e)}},toJsonSchema:()=>({minimum:e}),toCode:()=>({runtime:`Schema.isGreaterThanOrEqualTo(${M(e)})`})})}),WK=xd({order:$o,annotate:e=>({representation:{id:"effect/schema/isLessThan",payload:{exclusiveMaximum:xu(e)}},toJsonSchema:()=>({exclusiveMaximum:e}),toCode:()=>({runtime:`Schema.isLessThan(${M(e)})`})})}),HK=yd({order:$o,annotate:e=>({representation:{id:"effect/schema/isLessThanOrEqualTo",payload:{maximum:xu(e)}},toJsonSchema:()=>({maximum:e}),toCode:()=>({runtime:`Schema.isLessThanOrEqualTo(${M(e)})`})})}),Eg=bd({order:$o,annotate:e=>{let t=e.exclusiveMinimum?!0:void 0,n=e.exclusiveMaximum?!0:void 0;return{representation:{id:"effect/schema/isBetween",payload:{minimum:xu(e.minimum),maximum:xu(e.maximum),...t&&{exclusiveMinimum:t},...n&&{exclusiveMaximum:n}}},toJsonSchema:()=>({[t?"exclusiveMinimum":"minimum"]:e.minimum,[n?"exclusiveMaximum":"maximum"]:e.maximum}),toCode:()=>({runtime:`Schema.isBetween({ minimum: ${M(e.minimum)}, maximum: ${M(e.maximum)}, exclusiveMinimum: ${M(t)}, exclusiveMaximum: ${M(n)} })`})}}});function VK(e,t){if(!globalThis.Number.isFinite(e)||e===0)throw new globalThis.RangeError(`Expected a finite non-zero number, got ${globalThis.String(e)}`);return e=globalThis.Math.abs(e),Fe(n=>r_(n,e)===0,{expected:`a value that is a multiple of ${e}`,representation:{id:"effect/schema/isMultipleOf",payload:{divisor:e}},toJsonSchema:()=>({multipleOf:e}),toCode:()=>({runtime:`Schema.isMultipleOf(${M(e)})`}),...t})}function vg(e){return Fe(t=>globalThis.Number.isSafeInteger(t),{expected:"an integer",representation:{id:"effect/schema/isInt",payload:null},toJsonSchema:()=>[{type:"integer"},!0],toCode:()=>({runtime:"Schema.isInt()"}),arbitraryConstraint:{number:"integer"},...e})}var _o=md.check(vg()),hi=_o.check(c2(0));function GK(e){return new Ya([vg(),Eg({minimum:-2147483648,maximum:2147483647})],{expected:"a 32-bit integer",...e})}function KK(e){return new Ya([vg(),Eg({minimum:0,maximum:4294967295})],{expected:"a 32-bit unsigned integer",...e})}function yu(e){if(globalThis.Number.isNaN(e.getTime()))throw new globalThis.RangeError(`Expected a valid Date, got ${M(e)}`);return e.toISOString()}function bu(e){return`new Date(${M(e.getTime())})`}var JK=hd({order:ji,annotate:e=>({representation:{id:"effect/schema/isGreaterThanDate",payload:{exclusiveMinimum:yu(e)}},toJsonSchema:()=>[{},!0],toCode:()=>({runtime:`Schema.isGreaterThanDate(${bu(e)})`})})}),ZK=gd({order:ji,annotate:e=>({representation:{id:"effect/schema/isGreaterThanOrEqualToDate",payload:{minimum:yu(e)}},toJsonSchema:()=>[{},!0],toCode:()=>({runtime:`Schema.isGreaterThanOrEqualToDate(${bu(e)})`})})}),QK=xd({order:ji,annotate:e=>({representation:{id:"effect/schema/isLessThanDate",payload:{exclusiveMaximum:yu(e)}},toJsonSchema:()=>[{},!0],toCode:()=>({runtime:`Schema.isLessThanDate(${bu(e)})`})})}),YK=yd({order:ji,annotate:e=>({representation:{id:"effect/schema/isLessThanOrEqualToDate",payload:{maximum:yu(e)}},toJsonSchema:()=>[{},!0],toCode:()=>({runtime:`Schema.isLessThanOrEqualToDate(${bu(e)})`})})}),XK=bd({order:ji,annotate:e=>{let t=e.exclusiveMinimum?!0:void 0,n=e.exclusiveMaximum?!0:void 0;return{representation:{id:"effect/schema/isBetweenDate",payload:{minimum:yu(e.minimum),maximum:yu(e.maximum),...t&&{exclusiveMinimum:t},...n&&{exclusiveMaximum:n}}},toJsonSchema:()=>[{},!0],toCode:()=>({runtime:`Schema.isBetweenDate({ minimum: ${bu(e.minimum)}, maximum: ${bu(e.maximum)}, exclusiveMinimum: ${M(t)}, exclusiveMaximum: ${M(n)} })`})}}}),eJ=hd({order:Bi,annotate:e=>({representation:{id:"effect/schema/isGreaterThanBigInt",payload:{exclusiveMinimum:e.toString(10)}},toJsonSchema:()=>[{},!0],toCode:()=>({runtime:`Schema.isGreaterThanBigInt(${M(e)})`})})}),u2=gd({order:Bi,annotate:e=>({representation:{id:"effect/schema/isGreaterThanOrEqualToBigInt",payload:{minimum:e.toString(10)}},toJsonSchema:()=>[{},!0],toCode:()=>({runtime:`Schema.isGreaterThanOrEqualToBigInt(${M(e)})`})})}),tJ=xd({order:Bi,annotate:e=>({representation:{id:"effect/schema/isLessThanBigInt",payload:{exclusiveMaximum:e.toString(10)}},toJsonSchema:()=>[{},!0],toCode:()=>({runtime:`Schema.isLessThanBigInt(${M(e)})`})})}),nJ=yd({order:Bi,annotate:e=>({representation:{id:"effect/schema/isLessThanOrEqualToBigInt",payload:{maximum:e.toString(10)}},toJsonSchema:()=>[{},!0],toCode:()=>({runtime:`Schema.isLessThanOrEqualToBigInt(${M(e)})`})})}),rJ=bd({order:Bi,annotate:e=>{let t=e.exclusiveMinimum?!0:void 0,n=e.exclusiveMaximum?!0:void 0;return{representation:{id:"effect/schema/isBetweenBigInt",payload:{minimum:e.minimum.toString(10),maximum:e.maximum.toString(10),...t&&{exclusiveMinimum:t},...n&&{exclusiveMaximum:n}}},toJsonSchema:()=>[{},!0],toCode:()=>({runtime:`Schema.isBetweenBigInt({ minimum: ${M(e.minimum)}, maximum: ${M(e.maximum)}, exclusiveMinimum: ${M(t)}, exclusiveMaximum: ${M(n)} })`})}}});function l2(e,t){return e=fn(e),f2(e,Math.ceil(e/2),t)}function f2(e,t,n){return Fe(r=>r.length>=e,{expected:`a value with a length of at least ${e}`,representation:{id:"effect/schema/isMinLength",payload:{minLength:e}},toJsonSchema:({type:r})=>r==="string"?e<=1?{minLength:t}:[{minLength:t},!0]:r==="array"?{minItems:e}:r===void 0?[{minLength:t,minItems:e},!0]:[{},!0],toCode:()=>({runtime:`Schema.isMinLength(${e})`}),[vn]:!0,arbitraryConstraint:{minLength:e},...n})}function d2(e){return f2(1,1,e)}function p2(e,t){return e=fn(e),Fe(n=>n.length<=e,{expected:`a value with a length of at most ${e}`,representation:{id:"effect/schema/isMaxLength",payload:{maxLength:e}},toJsonSchema:({type:n})=>n==="string"?e===0?{maxLength:e}:[{maxLength:e},!0]:n==="array"?{maxItems:e}:n===void 0?[{maxLength:e,maxItems:e},!0]:[{},!0],toCode:()=>({runtime:`Schema.isMaxLength(${e})`}),[vn]:!0,arbitraryConstraint:{maxLength:e},...t})}function Mw(e,t,n){return e=fn(e),t=fn(t),Fe(r=>r.length>=e&&r.length<=t,{expected:e===t?`a value with a length of ${e}`:`a value with a length between ${e} and ${t}`,representation:{id:"effect/schema/isBetweenLength",payload:{minimum:e,maximum:t}},toJsonSchema:({type:r})=>r==="string"?t===0||Math.ceil(e/2)>t?{minLength:Math.ceil(e/2),maxLength:t}:[{minLength:Math.ceil(e/2),maxLength:t},!0]:r==="array"?{minItems:e,maxItems:t}:r===void 0?[{minLength:Math.ceil(e/2),maxLength:t,minItems:e,maxItems:t},!0]:[{},!0],toCode:()=>({runtime:`Schema.isBetweenLength(${e}, ${t})`}),[vn]:!0,arbitraryConstraint:{minLength:e,maxLength:t},...n})}function oJ(e,t){return e=fn(e),Fe(n=>Nw(n,e)>=e,{expected:`a string with at least ${e} code points`,representation:{id:"effect/schema/isMinCodePoints",payload:{minCodePoints:e}},toJsonSchema:()=>({minLength:e}),toCode:()=>({runtime:`Schema.isMinCodePoints(${e})`}),arbitraryConstraint:{minCodePoints:e},...t})}function sJ(e,t){return e=fn(e),Fe(n=>Nw(n,e+1)<=e,{expected:`a string with at most ${e} code points`,representation:{id:"effect/schema/isMaxCodePoints",payload:{maxCodePoints:e}},toJsonSchema:()=>({maxLength:e}),toCode:()=>({runtime:`Schema.isMaxCodePoints(${e})`}),arbitraryConstraint:{maxCodePoints:e},...t})}function aJ(e,t,n){return e=fn(e),t=fn(t),Fe(r=>{let o=Nw(r,t+1);return o>=e&&o<=t},{expected:e===t?`a string with ${e} code points`:`a string with between ${e} and ${t} code points`,representation:{id:"effect/schema/isBetweenCodePoints",payload:{minimum:e,maximum:t}},toJsonSchema:()=>({allOf:[{minLength:e},{maxLength:t}]}),toCode:()=>({runtime:`Schema.isBetweenCodePoints(${e}, ${t})`}),arbitraryConstraint:{minCodePoints:e,maxCodePoints:t},...n})}function Nw(e,t){if(t===0)return 0;let n=0;for(let r of e)if(++n>=t)break;return n}function fn(e){if(!globalThis.Number.isFinite(e))throw new globalThis.RangeError(`Expected a finite number, got ${e}`);return Math.max(0,Math.floor(e))}function iJ(e,t){return e=fn(e),Fe(n=>n.size>=e,{expected:`a value with a size of at least ${e}`,representation:{id:"effect/schema/isMinSize",payload:{minSize:e}},toJsonSchema:()=>[{},!0],toCode:()=>({runtime:`Schema.isMinSize(${e})`}),[vn]:!0,arbitraryConstraint:{minSize:e},...t})}function cJ(e,t){return e=fn(e),Fe(n=>n.size<=e,{expected:`a value with a size of at most ${e}`,representation:{id:"effect/schema/isMaxSize",payload:{maxSize:e}},toJsonSchema:()=>[{},!0],toCode:()=>({runtime:`Schema.isMaxSize(${e})`}),[vn]:!0,arbitraryConstraint:{maxSize:e},...t})}function uJ(e,t,n){return e=fn(e),t=fn(t),Fe(r=>r.size>=e&&r.size<=t,{expected:e===t?`a value with a size of ${e}`:`a value with a size between ${e} and ${t}`,representation:{id:"effect/schema/isBetweenSize",payload:{minimum:e,maximum:t}},toJsonSchema:()=>[{},!0],toCode:()=>({runtime:`Schema.isBetweenSize(${e}, ${t})`}),[vn]:!0,arbitraryConstraint:{minSize:e,maxSize:t},...n})}function lJ(e,t){return e=fn(e),Fe(n=>Reflect.ownKeys(n).length>=e,{expected:`a value with at least ${e===1?"1 entry":`${e} entries`}`,representation:{id:"effect/schema/isMinProperties",payload:{minProperties:e}},toJsonSchema:({type:n})=>n==="object"?{minProperties:e}:[{minProperties:e},!0],toCode:()=>({runtime:`Schema.isMinProperties(${e})`}),[vn]:!0,arbitraryConstraint:{minProperties:e},...t})}function fJ(e,t){return e=fn(e),Fe(n=>Reflect.ownKeys(n).length<=e,{expected:`a value with at most ${e===1?"1 entry":`${e} entries`}`,representation:{id:"effect/schema/isMaxProperties",payload:{maxProperties:e}},toJsonSchema:({type:n})=>n==="object"?{maxProperties:e}:[{maxProperties:e},!0],toCode:()=>({runtime:`Schema.isMaxProperties(${e})`}),[vn]:!0,arbitraryConstraint:{maxProperties:e},...t})}function dJ(e,t,n){return e=fn(e),t=fn(t),Fe(r=>Reflect.ownKeys(r).length>=e&&Reflect.ownKeys(r).length<=t,{expected:e===t?`a value with exactly ${e===1?"1 entry":`${e} entries`}`:`a value with between ${e} and ${t} entries`,representation:{id:"effect/schema/isBetweenProperties",payload:{minimum:e,maximum:t}},toJsonSchema:({type:r})=>r==="object"?{minProperties:e,maxProperties:t}:[{minProperties:e,maxProperties:t},!0],toCode:()=>({runtime:`Schema.isBetweenProperties(${e}, ${t})`}),[vn]:!0,arbitraryConstraint:{minProperties:e,maxProperties:t},...n})}function pJ(e,t){let n=Su(e),r=WM(n.ast);return Fe((o,s,a)=>{let i=Reflect.ownKeys(o),c=[];for(let u of i){let l=r(u,a);if(l!==void 0&&(c.push(new It([u],l)),a.errors==="first"))break}return va(c)?new Ct(s,c,o,a):!0},{expected:"an object with property names matching the schema",representation:{id:"effect/schema/isPropertyNames",payload:null,schemas:[n.ast]},toJsonSchema:({schemas:o,type:s})=>s==="object"?{propertyNames:o[0]}:[{propertyNames:o[0]},!0],toCode:({schemas:o})=>({runtime:`Schema.isPropertyNames(${o[0].runtime})`}),[vn]:!0,...t})}function Dw(e){return Fe(t=>Sp(t).length===t.length,{expected:"an array with unique items",representation:{id:"effect/schema/isUnique",payload:null},toJsonSchema:()=>({uniqueItems:!0}),toCode:()=>({runtime:"Schema.isUnique()"}),arbitraryConstraint:{uniqueBy:F},...e})}function m2(e){return Fe(t=>Sp(t.map(([n])=>n)).length===t.length,{expected:"an array with unique keys",representation:{id:"effect/schema/isUniqueKey",payload:null},toCode:()=>({runtime:"Schema.isUniqueKey()"}),arbitraryConstraint:{uniqueBy:t=>t[0]},...e})}var mJ=L.check(d2()),hJ=L.check(Mw(1,1)),h2=e=>(e?.includeStack===!0?1:0)|(e?.excludeCause===!0?2:0),g2=e=>{switch(e){case 0:return;case 1:return{includeStack:!0};case 2:return{excludeCause:!0};case 3:return{includeStack:!0,excludeCause:!0}}},kD=[];function gJ(e){let t=h2(e),n=kD[t];if(n!==void 0)return n;let r=g2(t),o=ta(globalThis.Error,{representation:{id:"effect/schema/Error",payload:r??null},toCode:()=>({runtime:r!==void 0?`Schema.ErrorInstance(${M(r)})`:"Schema.ErrorInstance()",Type:"globalThis.Error"}),expected:"Error",toCodecJson:()=>ve()($Z,_F(r))});return kD[t]=o,o}var ID=[];function Uw(e){let t=h2(e),n=ID[t];if(n!==void 0)return n;let r=Og.pipe(Z(pd,PF(g2(t))));return ID[t]=r,r}function xJ(e,t){let n=Cn()([e,t],([r,o])=>{let s=Se(Oo([r,o]));return(a,i,c)=>a instanceof globalThis.Map?zt(mt(s)([...a],c),{onSuccess:u=>new globalThis.Map(u),onFailure:u=>kn(i,"entries",u,a,c)}):I(new dt(i,a,c))},{representation:{id:"effect/schema/ReadonlyMap",payload:null},toCode:({typeParameters:r})=>({runtime:`Schema.ReadonlyMap(${r[0].runtime}, ${r[1].runtime})`,Type:`globalThis.ReadonlyMap<${r[0].Type}, ${r[1].Type}>`}),expected:"ReadonlyMap",toCodec:([r,o])=>ve()(Se(Oo([r,o])),Ce({decode:s=>new globalThis.Map(s),encode:s=>[...s.entries()]}))});return H(n.ast,{key:e,value:t})}function yJ(e){let t=Cn()([e],([n])=>{let r=Se(n);return(o,s,a)=>o instanceof globalThis.Set?zt(mt(r)([...o],a),{onSuccess:i=>new globalThis.Set(i),onFailure:i=>kn(s,"values",i,o,a)}):I(new dt(s,o,a))},{representation:{id:"effect/schema/ReadonlySet",payload:null},toCode:({typeParameters:n})=>({runtime:`Schema.ReadonlySet(${n[0].runtime})`,Type:`globalThis.ReadonlySet<${n[0].Type}>`}),expected:"ReadonlySet",toCodec:([n])=>ve()(Se(n),Ce({decode:r=>new globalThis.Set(r),encode:r=>[...r.values()]}))});return H(t.ast,{value:e})}var bJ=ta(globalThis.RegExp,{representation:{id:"effect/schema/RegExp",payload:null},toCode:()=>({runtime:"Schema.RegExp",Type:"globalThis.RegExp"}),expected:"RegExp",toCodecJson:()=>ve()(Te({source:L,flags:L}),Wt({decode:(e,t)=>lt({try:()=>new globalThis.RegExp(e.source,e.flags),catch:()=>new de({expected:"valid RegExp source and flags"},e,t)}),encode:e=>b({source:e.source,flags:e.flags})}))}),x2=L.annotate({expected:"a string that will be decoded as a URL"}),y2=ta(globalThis.URL,{representation:{id:"effect/schema/URL",payload:null},toCode:()=>({runtime:"Schema.URL",Type:"globalThis.URL"}),expected:"URL",toCodecJson:()=>ve()(x2,dE)}),SJ=x2.pipe(Z(y2,dE)),b2=L.annotate({expected:"a string that will be decoded as a Date"}),Iu=Be(e=>e instanceof globalThis.Date&&!globalThis.Number.isNaN(e.getTime()),{representation:{id:"effect/schema/Date",payload:null},toCode:()=>({runtime:"Schema.Date",Type:"globalThis.Date"}),expected:"a valid Date",toCodecJson:()=>ve()(b2,lE)}),EJ=b2.pipe(Z(Iu,lE)),vJ=_o.pipe(Z(Iu,kF)),wJ=L.annotate({expected:"a string that will be decoded as JSON",contentMediaType:"application/json"});function $w(e,t){return wJ.pipe(Z(e,jF(t)))}var kJ=$w(pd),S2=ta(globalThis.File,{representation:{id:"effect/schema/File",payload:null},toCode:()=>({runtime:"Schema.File",Type:"globalThis.File"}),expected:"File",toCodecJson:()=>ve()(Te({data:L.check(i2()),type:L,name:L,lastModified:_o}),Wt({decode:(e,t)=>on(Za(e.data),{onFailure:()=>I(new de({expected:"a valid Base64 string"},e.data,t)),onSuccess:n=>{let r=new globalThis.Uint8Array(n);return b(new globalThis.File([r],e.name,{type:e.type,lastModified:e.lastModified}))}}),encode:(e,t)=>Sc({try:async()=>{let n=new globalThis.Uint8Array(await e.arrayBuffer());return{data:jc(n),type:e.type,name:e.name,lastModified:e.lastModified}},catch:()=>new de({expected:"a readable File"},e,t)})}))}),E2=ta(globalThis.FormData,{representation:{id:"effect/schema/FormData",payload:null},toCode:()=>({runtime:"Schema.FormData",Type:"globalThis.FormData"}),expected:"FormData",toCodecJson:()=>ve()(Se(Oo([L,st([Te({_tag:cs("String"),value:L}),Te({_tag:cs("File"),value:S2})])])),Wt({decode:e=>{let t=new globalThis.FormData;for(let[n,r]of e)t.append(n,r.value);return b(t)},encode:e=>b(globalThis.Array.from(e.entries()).map(([t,n])=>typeof n=="string"?[t,{_tag:"String",value:n}]:[t,{_tag:"File",value:n}]))}))});function IJ(e){return E2.pipe(Z(e,zF))}var v2=ta(globalThis.URLSearchParams,{representation:{id:"effect/schema/URLSearchParams",payload:null},toCode:()=>({runtime:"Schema.URLSearchParams",Type:"globalThis.URLSearchParams"}),expected:"URLSearchParams",toCodecJson:()=>ve()(L.annotate({expected:"a query string that will be decoded as URLSearchParams"}),Ce({decode:e=>new globalThis.URLSearchParams(e),encode:e=>e.toString()}))});function CJ(e){return v2.pipe(Z(e,qF))}var TJ=L.annotate({expected:"a string that will be decoded as a number"}).pipe(Z(md,Wc)),AJ=L.annotate({expected:"a string that will be decoded as a finite number"}).pipe(Z(ku,Wc)),OJ=H(WE).pipe(Z(Eu,fh)),w2=L.check(a2()),_J=L.annotate({expected:"a string that will be decoded as a trimmed string"}).pipe(Z(w2,wF())),PJ=L.annotate({expected:"a base64 encoded string that will be decoded as a UTF-8 string"}).pipe(Z(L,UF)),FJ=L.annotate({expected:"a base64 (URL) encoded string that will be decoded as a UTF-8 string"}).pipe(Z(L,$F)),RJ=L.annotate({expected:"a hex encoded string that will be decoded as a UTF-8 string"}).pipe(Z(L,LF)),MJ=L.annotate({expected:"a URI component encoded string that will be decoded as a UTF-8 string"}).pipe(Z(L,BF)),Sw=st([ku,HD,L]),NJ=Te({issues:Se(Te({message:L,path:ls(Se(st([Sw,Te({key:Sw})])))}))}),DJ=ea([0,1]).pipe(Z(Cw,Ce({decode:e=>e===1,encode:e=>e?1:0}))),k2=L.annotate({expected:"a base64 encoded string that will be decoded as Uint8Array",format:"byte",contentEncoding:"base64"}),wg=ta(globalThis.Uint8Array,{representation:{id:"effect/schema/Uint8Array",payload:null},toCode:()=>({runtime:"Schema.Uint8Array",Type:"globalThis.Uint8Array"}),expected:"Uint8Array",toCodecJson:()=>ve()(k2,pE)}),UJ=k2.pipe(Z(wg,pE)),$J=L.annotate({expected:"a base64 (URL) encoded string that will be decoded as a Uint8Array"}).pipe(Z(wg,{decode:nF(),encode:ah()})),LJ=L.annotate({expected:"a hex encoded string that will be decoded as a Uint8Array"}).pipe(Z(wg,{decode:oF(),encode:ih()})),I2=Wt({decode:(e,t)=>{let n=EF(e);return He(n)?I(new de({expected:"a valid BigDecimal string"},e,t)):b(n.value)},encode:e=>b(ns(e))}),BJ=hd({order:zc,formatter:e=>ns(e)}),jJ=gd({order:zc,formatter:e=>ns(e)}),zJ=xd({order:zc,formatter:e=>ns(e)}),qJ=yd({order:zc,formatter:e=>ns(e)}),WJ=bd({order:zc,formatter:e=>ns(e)}),C2=L.annotate({expected:"a string that will be decoded as a BigDecimal"}),T2=Be(cE,{representation:{id:"effect/schema/BigDecimal",payload:null},toCode:()=>({runtime:"Schema.BigDecimal",Type:"BigDecimal.BigDecimal",importDeclarations:['import * as BigDecimal from "effect/BigDecimal"']}),expected:"BigDecimal",toCodecJson:()=>ve()(C2,I2),toFormatter:()=>e=>ns(e)}),HJ=C2.pipe(Z(T2,I2)),kg=Be(n1,{representation:{id:"effect/schema/ByteSize",payload:null},toCode:()=>({runtime:"Schema.ByteSize",Type:"ByteSize.ByteSize",importDeclarations:['import * as ByteSize from "effect/ByteSize"']}),expected:"ByteSize",toCodecJson:()=>ve()(Eu.check(u2(globalThis.BigInt(0))),Ce({decode:uf,encode:zm})),toCodecStringTree:()=>ve()(A2,fE)}),A2=L.annotate({expected:"a string that will be decoded as a ByteSize"}),VJ=A2.pipe(Z(kg,fE)),GJ=Eu.pipe(Z(kg,IF)),KJ=md.pipe(Z(kg,CF));function Ew(e,t){let n=Cn()([e,t],([r,o])=>(s,a,i)=>{if(!UO(s))return I(new dt(a,s,i));switch(s._tag){case"Fail":return zt(mt(r)(s.error,i),{onSuccess:Cb,onFailure:c=>kn(a,"error",c,s,i)});case"Die":return zt(mt(o)(s.defect,i),{onSuccess:Tb,onFailure:c=>kn(a,"defect",c,s,i)});case"Interrupt":return b(s)}},{representation:{id:"effect/schema/CauseReason",payload:null},toCode:({typeParameters:r})=>({runtime:`Schema.CauseReason(${r[0].runtime}, ${r[1].runtime})`,Type:`Cause.Failure<${r[0].Type}, ${r[1].Type}>`,importDeclarations:['import * as Cause from "effect/Cause"']}),expected:"Cause.Failure",toCodec:([r,o])=>ve()(st([Te({_tag:St("Fail"),error:r}),Te({_tag:St("Die"),defect:o}),Te({_tag:St("Interrupt"),fiberId:xg(ku)})]),Ce({decode:s=>{switch(s._tag){case"Fail":return Cb(s.error);case"Die":return Tb(s.defect);case"Interrupt":return LO(s.fiberId)}},encode:s=>{switch(s._tag){case"Fail":return{_tag:"Fail",error:s.error};case"Die":return{_tag:"Die",defect:s.defect};case"Interrupt":return{_tag:"Interrupt",fiberId:s.fiberId}}}}))});return H(n.ast,{error:e,defect:t})}function vw(e,t){let n=Cn()([e,t],([r,o])=>{let s=Se(Ew(r,o));return(a,i,c)=>DO(a)?zt(mt(s)(a.reasons,c),{onSuccess:zl,onFailure:u=>kn(i,"failures",u,a,c)}):I(new dt(i,a,c))},{representation:{id:"effect/schema/Cause",payload:null},toCode:({typeParameters:r})=>({runtime:`Schema.Cause(${r[0].runtime}, ${r[1].runtime})`,Type:`Cause.Cause<${r[0].Type}, ${r[1].Type}>`,importDeclarations:['import * as Cause from "effect/Cause"']}),expected:"Cause",toCodec:([r,o])=>ve()(Se(Ew(r,o)),Ce({decode:zl,encode:({reasons:s})=>s}))});return H(n.ast,{error:e,defect:t})}function CD(e){return ve()(e,Ce({decode:ES,encode:Yt}))}function JJ(e){let t=Cn()([e],([n])=>{let r=Se(n);return(o,s,a)=>Wm(o)?zt(mt(r)(Yt(o),a),{onSuccess:ES,onFailure:i=>kn(s,"values",i,o,a)}):I(new dt(s,o,a))},{representation:{id:"effect/schema/Chunk",payload:null},toCode:({typeParameters:n})=>({runtime:`Schema.Chunk(${n[0].runtime})`,Type:`Chunk.Chunk<${n[0].Type}>`}),expected:"Chunk",toCodec:([n])=>CD(Se(n)),toCodecArbitrary:({constraint:n,typeParameters:[r]})=>CD(gg(Se(r),n?.minLength,n?.maxLength)),toEquivalence:([n])=>bS(n)});return H(t.ast,{value:e})}function O2(){return rn((e,t)=>_e(JS(e),{onNone:()=>I(new de({message:"Invalid DateTime input"},e,t)),onSome:n=>b(ZS(n))}))}var ZJ=Ce({decode:e=>YS(e),encode:e=>e.offset}),_2=Wt({decode:(e,t)=>_e(LP(e),{onNone:()=>I(new de({expected:"a valid IANA time zone"},e,t)),onSome:b}),encode:e=>b(e.id)}),P2=Wt({decode:(e,t)=>_e(BP(e),{onNone:()=>I(new de({expected:"a valid time zone"},e,t)),onSome:b}),encode:e=>b(_f(e))}),F2=Wt({decode:(e,t)=>_e(JS(e),{onNone:()=>I(new de({expected:"a valid UTC DateTime string"},e,t)),onSome:n=>b(ZS(n))}),encode:e=>b(qP(e))}),R2=Wt({decode:(e,t)=>_e($P(e),{onNone:()=>I(new de({expected:"a valid Zoned DateTime string"},e,t)),onSome:b}),encode:e=>b(XS(e))}),M2=-864e13,N2=864e13,QJ=M2+840*60*1e3,YJ=N2-840*60*1e3,XJ=-720*60*1e3,e8=840*60*1e3,D2=["UTC","Europe/London","America/New_York","Asia/Tokyo","Australia/Sydney"];function U2(e,t,n){let r=Math.max(t,e?.minimum===void 0?t:e.minimum.epochMilliseconds+(e.exclusiveMinimum===!0?1:0)),o=Math.min(n,e?.maximum===void 0?n:e.maximum.epochMilliseconds-(e.exclusiveMaximum===!0?1:0));return r<=o?[r,o]:[t,n]}function Lw(e,t){return _o.check(Eg({minimum:e,maximum:t}))}function $2(){return st([Lw(XJ,e8),ea(D2)])}var Ig=Be(e=>KS(e)&&RP(e),{representation:{id:"effect/schema/DateTimeUtc",payload:null},toCode:()=>({runtime:"Schema.DateTimeUtc",Type:"DateTime.Utc",importDeclarations:['import * as DateTime from "effect/DateTime"']}),expected:"DateTime.Utc",toCodecArbitrary:({constraint:e})=>{let[t,n]=U2(e,M2,N2);return vu()(Lw(t,n),le(DP))},toCodecJson:()=>ve()(L,F2),toFormatter:()=>e=>e.toString()}),t8=Iu.pipe(Z(Ig,{decode:O2(),encode:le(jP)})),n8=L.annotate({expected:"a string that will be decoded as a DateTime.Utc"}).pipe(Z(Ig,F2)),r8=_o.pipe(Z(Ig,{decode:O2(),encode:le(zP)})),o8=Be(PP,{representation:{id:"effect/schema/TimeZoneOffset",payload:null},toCode:()=>({runtime:"Schema.TimeZoneOffset",Type:"DateTime.TimeZone.Offset",importDeclarations:['import * as DateTime from "effect/DateTime"']}),expected:"DateTime.TimeZone.Offset",toCodecJson:()=>ve()(_o,ZJ),toFormatter:()=>e=>_f(e)}),L2=L.annotate({expected:"an IANA time zone identifier"}),B2=Be(FP,{representation:{id:"effect/schema/TimeZoneNamed",payload:null},toCode:()=>({runtime:"Schema.TimeZoneNamed",Type:"DateTime.TimeZone.Named",importDeclarations:['import * as DateTime from "effect/DateTime"']}),expected:"DateTime.TimeZone.Named",toCodecArbitrary:()=>vu()(ea(D2),le(QS)),toCodecJson:()=>ve()(L2,_2),toFormatter:()=>e=>_f(e)}),s8=L2.pipe(Z(B2,_2)),j2=L.annotate({expected:"a time zone string (IANA identifier or offset like +03:00)"}),z2=Be(_P,{representation:{id:"effect/schema/TimeZone",payload:null},toCode:()=>({runtime:"Schema.TimeZone",Type:"DateTime.TimeZone",importDeclarations:['import * as DateTime from "effect/DateTime"']}),expected:"DateTime.TimeZone",toCodecArbitrary:()=>vu()($2(),le(e=>typeof e=="number"?YS(e):QS(e))),toCodecJson:()=>ve()(j2,P2),toFormatter:()=>e=>_f(e)}),a8=j2.pipe(Z(z2,P2)),q2=L.annotate({expected:"a zoned DateTime string (e.g. 2024-01-01T00:00:00.000+00:00[Europe/London])"}),W2=Be(e=>KS(e)&&MP(e),{representation:{id:"effect/schema/DateTimeZoned",payload:null},toCode:()=>({runtime:"Schema.DateTimeZoned",Type:"DateTime.Zoned",importDeclarations:['import * as DateTime from "effect/DateTime"']}),expected:"DateTime.Zoned",toCodecArbitrary:({constraint:e})=>{let[t,n]=U2(e,QJ,YJ);return vu()(Te({epochMilliseconds:Lw(t,n),timeZone:$2()}),le(({epochMilliseconds:r,timeZone:o})=>UP(r,{timeZone:o})))},toCodecJson:()=>ve()(q2,R2),toFormatter:()=>e=>XS(e),toEquivalence:()=>NP}),i8=q2.pipe(Z(W2,R2)),$r=(e,t,n,r)=>L.pipe(Z(e,Wt({decode:(o,s)=>{let a=t(o);return Ft(a)?b(a.success):I(new de({message:a.failure.message},o,s))},encode:o=>b(n(o))}))).annotate({identifier:r}),yi=Be(mu,{identifier:"MacAddress"}),Cu=$r(yi,sD,sw,"MacAddressFromString"),Cg=Be(ln,{identifier:"Ipv4Address"}),Bw=$r(Cg,hu,Ur,"Ipv4AddressFromString"),jw=Be(Ao,{identifier:"Ipv6Address"}),H2=$r(jw,od,Ur,"Ipv6AddressFromString"),bi=Be(rD,{identifier:"IpAddress"}),Tu=$r(bi,sd,Ur,"IpAddressFromString"),Qe=(e,t,n,r)=>ZD(t,{expected:n})(e).annotate({identifier:r}),c8=Qe(bi,gu,"a multicast address","IpMulticastAddress"),u8=Qe(Tu,gu,"a multicast address","IpMulticastAddressFromString"),l8=Qe(yi,gu,"a multicast address","MacMulticastAddress"),f8=Qe(Cu,gu,"a multicast address","MacMulticastAddressFromString"),d8=Qe(bi,uw,"a unicast address","IpUnicastAddress"),p8=Qe(Tu,uw,"a unicast address","IpUnicastAddressFromString"),m8=Qe(yi,sg,"a unicast address","MacUnicastAddress"),h8=Qe(Cu,sg,"a unicast address","MacUnicastAddressFromString"),g8=Qe(Cg,ig,"a broadcast address","Ipv4BroadcastAddress"),x8=Qe(Bw,ig,"a broadcast address","Ipv4BroadcastAddressFromString"),y8=Qe(yi,og,"a broadcast address","MacBroadcastAddress"),b8=Qe(Cu,og,"a broadcast address","MacBroadcastAddressFromString"),S8=Qe(bi,cw,"a loopback address","IpLoopbackAddress"),E8=Qe(Tu,cw,"a loopback address","IpLoopbackAddressFromString"),v8=Qe(bi,lw,"a link-local address","IpLinkLocalAddress"),w8=Qe(Tu,lw,"a link-local address","IpLinkLocalAddressFromString"),k8=Qe(bi,ag,"an unspecified address","IpUnspecifiedAddress"),I8=Qe(Tu,ag,"an unspecified address","IpUnspecifiedAddressFromString"),C8=Qe(Cg,fw,"a private address","Ipv4PrivateAddress"),T8=Qe(Bw,fw,"a private address","Ipv4PrivateAddressFromString"),A8=Qe(jw,dw,"a unique-local address","Ipv6UniqueLocalAddress"),O8=Qe(H2,dw,"a unique-local address","Ipv6UniqueLocalAddressFromString"),_8=Qe(yi,aw,"a locally administered address","MacLocallyAdministeredAddress"),P8=Qe(Cu,aw,"a locally administered address","MacLocallyAdministeredAddressFromString"),F8=Qe(yi,iw,"a universally administered address","MacUniversallyAdministeredAddress"),R8=Qe(Cu,iw,"a universally administered address","MacUniversallyAdministeredAddressFromString"),V2=Be(lD,{identifier:"Ipv4Interface"}),M8=$r(V2,ug,cd,"Ipv4InterfaceFromString"),G2=Be(fD,{identifier:"Ipv6Interface"}),N8=$r(G2,lg,cd,"Ipv6InterfaceFromString"),K2=Be(ad,{identifier:"IpInterface"}),D8=$r(K2,fg,cd,"IpInterfaceFromString"),J2=Be(pD,{identifier:"Ipv4Network"}),U8=$r(J2,hD,ld,"Ipv4NetworkFromString"),Z2=Be(mD,{identifier:"Ipv6Network"}),$8=$r(Z2,gD,ld,"Ipv6NetworkFromString"),Q2=Be(ud,{identifier:"IpNetwork"}),L8=$r(Q2,xD,ld,"IpNetworkFromString"),B8=Be(nd,{identifier:"InetAddressV4"}),j8=Be(rd,{identifier:"InetAddressV6"}),Y2=Be(rw,{identifier:"InetAddress"}),z8=$r(Y2,cD,cg,"InetAddressFromString"),X2=Be(rg,{identifier:"UnixPathAddress"}),q8=L.pipe(Z(X2,Ce({decode:uD,encode:e=>e.path}))).annotate({identifier:"UnixPathAddressFromString"}),W8=Be(oD,{identifier:"SocketAddress"}),H8=Wt({decode:(e,t)=>_e(cC(e),{onNone:()=>I(new de({expected:"a valid Duration string"},e,t)),onSome:b}),encode:e=>b(globalThis.String(e))}),V8=Wt({decode:e=>b(ro(e)),encode:(e,t)=>_e(lC(e),{onNone:()=>I(new de({expected:"a Duration representable as a bigint"},e,t)),onSome:n=>b(n)})}),G8=Ce({decode:e=>Qi(e),encode:e=>Bo(e)}),Tg=Be(Qx,{representation:{id:"effect/schema/Duration",payload:null},toCode:()=>({runtime:"Schema.Duration",Type:"Duration.Duration",importDeclarations:['import * as Duration from "effect/Duration"']}),expected:"Duration",toCodecJson:()=>ve()(st([Te({_tag:St("Infinity")}),Te({_tag:St("NegativeInfinity")}),Te({_tag:St("Nanos"),value:Eu}),Te({_tag:St("Millis"),value:_o})]),Ce({decode:e=>{switch(e._tag){case"Infinity":return Ca;case"NegativeInfinity":return Zi;case"Nanos":return ro(e.value);case"Millis":return Qi(e.value)}},encode:e=>{switch(e.value._tag){case"Infinity":return{_tag:"Infinity"};case"NegativeInfinity":return{_tag:"NegativeInfinity"};case"Nanos":return{_tag:"Nanos",value:e.value.nanos};case"Millis":return{_tag:"Millis",value:e.value.millis}}}}))}),K8=L.annotate({expected:"a string that will be decoded as a Duration"}),J8=K8.pipe(Z(Tg,H8)),Z8=Eu.pipe(Z(Tg,V8)),Q8=md.pipe(Z(Tg,G8));function Y8(e,t,n){let r=Cn()([e,t,n],([o,s,a])=>{let i=vw(s,a);return(c,u,l)=>{if(!xO(c))return I(new dt(u,c,l));switch(c._tag){case"Success":return zt(mt(o)(c.value,l),{onSuccess:Ko,onFailure:f=>kn(u,"value",f,c,l)});case"Failure":return zt(mt(i)(c.cause,l),{onSuccess:uo,onFailure:f=>kn(u,"cause",f,c,l)})}}},{representation:{id:"effect/schema/Exit",payload:null},toCode:({typeParameters:o})=>({runtime:`Schema.Exit(${o[0].runtime}, ${o[1].runtime}, ${o[2].runtime})`,Type:`Exit.Exit<${o[0].Type}, ${o[1].Type}, ${o[2].Type}>`,importDeclarations:['import * as Exit from "effect/Exit"']}),expected:"Exit",toCodec:([o,s,a])=>ve()(st([Te({_tag:St("Success"),value:o}),Te({_tag:St("Failure"),cause:vw(s,a)})]),Ce({decode:i=>i._tag==="Success"?Ko(i.value):uo(i.cause),encode:i=>xt(i)?{_tag:"Success",value:i.value}:{_tag:"Failure",cause:i.cause}}))});return H(r.ast,{value:e,error:t,defect:n})}function TD(e,t,n){return Te({type:St(e),nodes:Se(Te({index:hi,data:t})),edges:Se(Te({index:hi,source:hi,target:hi,data:n}))})}function AD(e,t){let n=-1,r=new Set;for(let o=0;o<e.nodes.length;o++){let s=e.nodes[o].index;if(s<=n)return I(new It(["nodes",o,"index"],new de({expected:"a strictly increasing node index"},s,t)));n=s,r.add(s)}n=-1;for(let o=0;o<e.edges.length;o++){let s=e.edges[o];if(s.index<=n)return I(new It(["edges",o,"index"],new de({expected:"a strictly increasing edge index"},s.index,t)));if(n=s.index,!r.has(s.source))return I(new It(["edges",o,"source"],new de({expected:"an encoded node index"},s.source,t)));if(!r.has(s.target))return I(new It(["edges",o,"target"],new de({expected:"an encoded node index"},s.target,t)))}return b(Nh(e))}function X8(e,t,n){return!kv(e)||e.mutable||e.type!==t?I(new de({expected:`an immutable ${t} Graph`},e,n)):b(Vf(e))}function eZ(e,t){return(n,r)=>{let o=Vf(n),s=Vf(r);if(o.type!==s.type||o.nodes.length!==s.nodes.length||o.edges.length!==s.edges.length)return!1;for(let a=0;a<o.nodes.length;a++)if(o.nodes[a].index!==s.nodes[a].index||!e(o.nodes[a].data,s.nodes[a].data))return!1;for(let a=0;a<o.edges.length;a++){let i=o.edges[a],c=s.edges[a],u=o.type==="directed"?i.source===c.source&&i.target===c.target:i.source===c.source&&i.target===c.target||i.source===c.target&&i.target===c.source;if(i.index!==c.index||!u||!t(i.data,c.data))return!1}return!0}}function tZ(e,t,n){return vu()(st([hg,Te({nodes:Aw(t),edges:Se(Oo([hi,hi,n]))})]),le(r=>{if(r===null)return Nh({type:e,nodes:[],edges:[]});let o=r.nodes.map((s,a)=>({index:a,data:s}));return Nh({type:e,nodes:o,edges:r.edges.map(([s,a,i],c)=>({index:c,source:s%o.length,target:a%o.length,data:i}))})}))}function nZ(e,t,n){let r=Cn()([t,n],([o,s])=>{let a=TD(e,o,s);return(i,c,u)=>!kv(i)||i.mutable||i.type!==e?I(new dt(c,i,u)):q(mt(a)(Vf(i),u),l=>AD(l,u))},{representation:{id:"effect/schema/Graph",payload:e},toCode:({typeParameters:o})=>({runtime:`Schema.Graph(${M(e)}, ${o[0].runtime}, ${o[1].runtime})`,Type:`Graph.Graph<${o[0].Type}, ${o[1].Type}, ${M(e)}>`,importDeclarations:['import * as Graph from "effect/Graph"']}),expected:`an immutable ${e} Graph`,toCodec:([o,s])=>ve()(TD(e,o,s),Wt({decode:AD,encode:(a,i)=>X8(a,e,i)})),toCodecArbitrary:({typeParameters:[o,s]})=>tZ(e,o,s),toEquivalence:([o,s])=>eZ(o,s)});return H(r.ast,{type:e,node:t,edge:n})}function OD(e){return ve()(e,Ce({decode:hv,encode:Wf}))}function rZ(e,t){let n=Cn()([e,t],([r,o])=>{let s=Se(Oo([r,o]));return(a,i,c)=>CM(a)?zt(mt(s)(Wf(a),c),{onSuccess:hv,onFailure:u=>kn(i,"entries",u,a,c)}):I(new dt(i,a,c))},{representation:{id:"effect/schema/HashMap",payload:null},toCode:({typeParameters:r})=>({runtime:`Schema.HashMap(${r[0].runtime}, ${r[1].runtime})`,Type:`HashMap.HashMap<${r[0].Type}, ${r[1].Type}>`,importDeclarations:['import * as HashMap from "effect/HashMap"']}),expected:"HashMap",toCodec:([r,o])=>OD(Se(Oo([r,o]))),toCodecArbitrary:({constraint:r,typeParameters:[o,s]})=>OD(gg(Se(Oo([o,s])).check(m2()),r?.minSize,r?.maxSize)),toEquivalence:([r,o])=>Kd(r,o)});return H(n.ast,{key:e,value:t})}function _D(e){return ve()(e,Ce({decode:yv,encode:Yt}))}function oZ(e){let t=Cn()([e],([n])=>{let r=Se(n);return(o,s,a)=>PM(o)?zt(mt(r)(Yt(o),a),{onSuccess:yv,onFailure:i=>kn(s,"values",i,o,a)}):I(new dt(s,o,a))},{representation:{id:"effect/schema/HashSet",payload:null},toCode:({typeParameters:n})=>({runtime:`Schema.HashSet(${n[0].runtime})`,Type:`HashSet.HashSet<${n[0].Type}>`}),expected:"HashSet",toCodec:([n])=>_D(Se(n)),toCodecArbitrary:({constraint:n,typeParameters:[r]})=>_D(gg(Se(r).check(Dw()),n?.minSize,n?.maxSize)),toEquivalence:([n])=>el(n)});return H(t.ast,{value:e})}function Si(e){let t=Cn()([e],([n])=>(r,o,s)=>dp(r)?He(r)?Yl:zt(mt(n)(r.value,s),{onSuccess:R,onFailure:a=>kn(o,"value",a,r,s)}):I(new dt(o,r,s)),{representation:{id:"effect/schema/Option",payload:null},toCode:({typeParameters:n})=>({runtime:`Schema.Option(${n[0].runtime})`,Type:`Option.Option<${n[0].Type}>`,importDeclarations:['import * as Option from "effect/Option"']}),expected:"Option",toCodec:([n])=>ve()(st([Te({_tag:St("Some"),value:n}),Te({_tag:St("None")})]),Ce({decode:r=>r._tag==="None"?A():R(r.value),encode:r=>$e(r)?{_tag:"Some",value:r.value}:{_tag:"None"}}))});return H(t.ast,{value:e})}function sZ(e){return Ow(e).pipe(Z(Si(Tn(e)),FF()))}function aZ(e){return xg(e).pipe(Z(Si(Tn(e)),RF()))}function iZ(e,t){return KD(e).pipe(Z(Si(Tn(e)),MF(t)))}var eU=Be(sM,{representation:{id:"effect/http/Cookie",payload:null},toCode:()=>({runtime:"Schema.Cookie",Type:"Cookies.Cookie",importDeclarations:['import * as Cookies from "effect/http/Cookies"']}),expected:"Cookie"}),tU=Be(oM,{representation:{id:"effect/http/Cookies",payload:null},toCode:()=>({runtime:"Schema.Cookies",Type:"Cookies.Cookies",importDeclarations:['import * as Cookies from "effect/http/Cookies"']}),expected:"Cookies",toCodecJson:()=>ve()(Se(L),Ce({decode:aM,encode:fM})),toCodecIso:()=>ve()(xi(L,eU),Ce({decode:tv,encode:e=>e.cookies}))}),cZ=tU.pipe(Z(xi(L,L),Ce({decode:lM,encode:e=>nv(globalThis.Object.entries(e).map(([t,n])=>uM(t,n)))}))),uZ=Be(hM,{representation:{id:"effect/http/Headers",payload:null},toCode:()=>({runtime:"Schema.Headers",Type:"Headers.Headers",importDeclarations:['import * as Headers from "effect/http/Headers"']}),expected:"Headers",toEquivalence:()=>av,toCodec:()=>ve()(xi(L,L),Ce({decode:gM,encode:e=>({...e})}))}),zw=Be(Ev,{representation:{id:"effect/http/UrlParams",payload:null},toCode:()=>({runtime:"Schema.UrlParams",Type:"UrlParams.UrlParams",importDeclarations:['import * as UrlParams from "effect/http/UrlParams"']}),expected:"UrlParams",toEquivalence:()=>vv,toCodec:()=>ve()(Se(Oo([L,L])),Ce({decode:Mh,encode:e=>e.params}))}),lZ=(e,t)=>zw.pipe(Z($w(pd,t),Wt({decode:n=>_e(NM(n,e),{onNone:()=>I(new It([e],new Gs(void 0))),onSome:b}),encode:n=>b(Mh([[e,n]]))}))),fZ=zw.pipe(Z(xi(L,st([L,Aw(L)])),Ce({decode:DM,encode:RM})));function dZ(e){return is(e).pipe(Z(Si(Tn(e)),NF()))}function pZ(e){return ls(e).pipe(Z(Si(Tn(e)),DF()))}function mZ(e,t){let n=t===void 0?"omit":t.onNoneEncoding,r=n===null?null:void 0;return ls(Ow(e)).pipe(Z(Si(Tn(e)),lh({decode:o=>o.pipe(Wi(Hd),R),encode:n==="omit"?qi:o=>R(gt(qi(o),()=>r))})))}function nU(e,t){let n=typeof t?.label=="string"?t.label:void 0,r=t?.disallowJsonEncode===!0,o=n!==void 0?r?{label:n,disallowJsonEncode:!0}:{label:n}:r?{disallowJsonEncode:!0}:void 0,s=n!==void 0?mt(St(n)):void 0,a=Cn()([e],([i])=>(c,u,l)=>{if(rv(c)){let f=s!==void 0?sf(s(c.label,l),d=>new It(["label"],d)):ye;return _t(f,()=>zt(mt(i)(Zs(c),l),{onSuccess:d=>_r(d,{label:c.label}),onFailure:()=>new Ct(u,[new It(["value"],new de(void 0,c,l))],c,l)}))}return I(new dt(u,c,l))},{representation:{id:"effect/schema/Redacted",payload:o??null},toCode:({typeParameters:i})=>({runtime:o!==void 0?`Schema.Redacted(${i[0].runtime}, ${M(o)})`:`Schema.Redacted(${i[0].runtime})`,Type:`Redacted.Redacted<${i[0].Type}>`,importDeclarations:['import * as Redacted from "effect/Redacted"']}),expected:"Redacted",toCodecJson:([i])=>ve()(i,{decode:le(c=>_r(c,{label:n})),encode:r?rh(c=>"Cannot serialize Redacted"+($e(c)&&typeof c.value.label=="string"?` with label: "${c.value.label}"`:"")):le(Zs)}),toEquivalence:([i])=>mM(i)});return H(a.ast,{value:e})}function hZ(e,t){return Z(nU(Tn(e),{label:t?.label,disallowJsonEncode:t?.disallowEncode}),{decode:le(n=>_r(n,{label:t?.label})),encode:t?.disallowEncode?rh(n=>"Cannot encode Redacted"+($e(n)&&typeof n.value.label=="string"?` with label: "${n.value.label}"`:"")):le(Zs)})(e)}function gZ(e,t){let n=Cn()([e,t],([r,o])=>(s,a,i)=>{if(!mp(s))return I(new dt(a,s,i));switch(s._tag){case"Success":return zt(_v(r)(s.success,i),{onSuccess:$,onFailure:c=>kn(a,"success",c,s,i)});case"Failure":return zt(_v(o)(s.failure,i),{onSuccess:K,onFailure:c=>kn(a,"failure",c,s,i)})}},{representation:{id:"effect/schema/Result",payload:null},toCode:({typeParameters:r})=>({runtime:`Schema.Result(${r[0].runtime}, ${r[1].runtime})`,Type:`Result.Result<${r[0].Type}, ${r[1].Type}>`,importDeclarations:['import * as Result from "effect/Result"']}),expected:"Result",toCodec:([r,o])=>ve()(st([Te({_tag:St("Success"),success:r}),Te({_tag:St("Failure"),failure:o})]),Ce({decode:s=>s._tag==="Success"?$(s.success):K(s.failure),encode:s=>Ft(s)?{_tag:"Success",success:s.success}:{_tag:"Failure",failure:s.failure}}))});return H(n.ast,{success:e,failure:t})}var xZ=globalThis.Symbol.for("immer-draftable"),ww={};function qw(e,t,n,r,o){let s=bZ(n,t,r),a=rU(t),i=class extends e{constructor(...[c,u]){let f=u?.["~payload"],d=f?.token===ww?f.value:n.make(c??{},u);super(d,{...u,disableChecks:!0,"~payload":{token:ww,value:d}})}static[fd]=fd;get[a](){return a}static[xZ]=!0;static identifier=t;static fields=n.fields;static get ast(){return s(this).ast}static pipe(){return re(this,arguments)}static rebuild(c){return s(this).rebuild(c)}static make(c,u){return zh(s(this))(c??{},u)}static makeOption(c,u){return jh(s(this))(c??{},u)}static makeEffect(c,u){return s(this).makeEffect(c??{},u)}static annotate(c){return this.rebuild(Cr(this.ast,c))}static annotateKey(c){return this.rebuild(Bf(this.ast,c))}static check(...c){return this.rebuild(Co(this.ast,c))}static extend(c){return(u,l)=>{let f=Sd(u)?u:Te(u),d={...n.fields,...f.fields},m=xh(d,n.ast.checks,{identifier:c});return qw(this,c,Tw(Co(m,f.ast.checks),d),l,o)}}static mapFields(c,u){return n.mapFields(c,u)}};return o!==void 0&&Object.assign(i.prototype,o(t)),i}function yZ(e){return new Pe(le(t=>new e(t,{"~payload":{token:ww,value:t}})),wo())}function rU(e){return`~effect/Schema/Class/${e}`}function bZ(e,t,n){let r;return o=>{if(r!==void 0)return r;let s=rU(t),a=u=>u instanceof o||_(u,s),i=yZ(o),c=H(new Zc([e.ast],()=>(u,l,f)=>a(u)?b(u):I(new dt(l,u,f)),{identifier:t,[eh]:([u])=>({isConstructed:a,link:new ot(u,i)}),toCodec:([u])=>new ot(u.ast,i),toEquivalence:([u])=>u,toFormatter:([u])=>l=>`${o.identifier}(${u(l)})`,[Ef]:Gc(e.ast),...n}));return r=Z(c,i)(e)}}function Sd(e){return mg(e)}var oU=e=>(t,n)=>{let r=Sd(t)?t:Te(t);return qw(yC,e,r,n,o=>({toString(){return`${o}(${M({...this})})`}}))},SZ=e=>(t,n,r)=>{let o=Sd(n)?n.mapFields(s=>({_tag:cs(t),...s}),{unsafePreserveChecks:!0}):Sg(t,n);return oU(e??t)(o,r)},Ag=e=>(t,n)=>{let r=Sd(t)?t:Te(t);return qw(ll,e,r,n,s=>({name:s}))},Lr=e=>(t,n,r)=>{let o=Sd(n)?n.mapFields(s=>({_tag:cs(t),...s}),{unsafePreserveChecks:!0}):Sg(t,n);return Ag(e??t)(o,r)};function EZ(e){return t=>t.annotate({toFormatter:e})}function vZ(e,t){return VN(e.ast,t)}function wZ(e){return t=>t.annotate({toEquivalence:e})}function kZ(e){return Gv(e.ast)}function IZ(e,t){return Xf(e.ast,t)}function CZ(e,t){let n=Xf(iu(e.ast),t);return Yh(n,t)}var TZ=Gh,AZ=Kh,Ww=Jh,OZ=SN;function _Z(e,t){return jN(e,t)}function PZ(e){return XN(e)}function FZ(e){return eD(e)}function RZ(e){return tD(e)}function MZ(e,t){return n=>H(Cr(n.ast,{toCodecIso:()=>new ot(e.ast,uh(t))}),{schema:n})}function NZ(e){return BN(e)}function DZ(e){let t=JD(()=>n),n=st([e,Se(t),xi(L,t)]);return n}var Og=H(Cr(Kc,{toCode:()=>({runtime:"Schema.Json",Type:"Schema.Json"})})),UZ=xi(L,Og),$Z=Te({message:L,name:is(L),stack:is(L),cause:is(Og)}),LZ=H(Cr(UR,{toCode:()=>({runtime:"Schema.MutableJson",Type:"Schema.MutableJson"})}));function BZ(e){return ts(e.ast)}function jZ(e){return e.ast.context?.annotations}var Hw="~effect/Stdio",_g=Je(Hw),sU=e=>({[Hw]:Hw,stdinIsTerminal:b(!1),stdoutIsTerminal:b(!1),...e});function zZ(e){return{_tag:"Value",value:e}}function qZ(e,t){return{_tag:"Record",keys:e,value:t}}function WZ(e,t){return{_tag:"Array",length:e,value:t}}var aU=xe("effect/ConfigProvider",{defaultValue:()=>QZ()}),HZ={...Jt,toJSON(){return{_id:"ConfigProvider"}}},VZ=e=>e;function GZ(e,t){let n=Object.create(HZ);return n.load=e,n.mapInput=t,n}function iU(e,t){return GZ(n=>e(t(n)),n=>iU(e,r=>n(t(r))))}function KZ(e){return iU(e,VZ)}function JZ(e,t){return e===""&&!t?void 0:e}function ZZ(e,t){let n=t?.preserveEmptyStrings===!0,r=YZ(e);return KZ(o=>b(XZ(r,e,o,n)))}function QZ(e){let t=e?.env??{...globalThis.process?.env,...import.meta?.env};return ZZ(t,{preserveEmptyStrings:e?.preserveEmptyStrings})}function YZ(e){let t={};for(let[n,r]of Object.entries(e)){if(r===void 0)continue;let o=n.split("_"),s=t;for(let a of o){let i=s.children??=Object.create(null);s=i[a]??={}}}return t}function XZ(e,t,n,r){let o=n.map(String).join("_"),s=JZ(Object.hasOwn(t,o)?t[o]:void 0,r),a=e7(e,n),i=a?.children?Object.keys(a.children):[];if(i.length===0)return s===void 0?void 0:zZ(s);if(i.every(Hi)){let u=Math.max(...i.map(l=>parseInt(l,10)))+1;return WZ(u,s)}return qZ(new Set(i),s)}function e7(e,t){if(t.length===0)return e;let n=e;for(let r of t)if(n=n?.children?.[String(r)],!n)return;return n}var uU="~effect/Config";var t7={...to({label:"Config",evaluate(e){return this.parse(e.getRef(aU))}}),[uU]:uU,toJSON(){return{_id:"Config"}}};function lU(e){let t=Object.create(t7);return t.evaluator=e,t.parse=n=>_t(e(n,[]),ef),t}var fU=(e,t,n)=>e.evaluator(t,n),n7=h(2,(e,t)=>lU((n,r)=>ne(fU(e,n,r),wt(t))));var r7=h(2,(e,t)=>lU((n,r)=>Wa(fU(e,n,r),o=>he(o)?$(t):o))),dU=e=>e.pipe(n7(R),r7(A()));var mU="0123456789ABCDEFGHJKMNPQRSTVWXYZ",hU=(e,t)=>{if(t.length!==10)throw new Error(`ULID randomness must be exactly 10 bytes, received ${t.length}`);let n=Math.min(Math.max(0,Math.trunc(e)),0xffffffffffff),r="";for(let a=45;a>=0;a-=5)r+=mU[Math.floor(n/2**a)&31];let o=0,s=0;for(let a of t){for(o=o<<8|a,s+=8;s>=5;)s-=5,r+=mU[o>>>s&31];o&=(1<<s)-1}return r};var s7=e=>e.toString(16).padStart(2,"0"),yU=e=>[e.subarray(0,4),e.subarray(4,6),e.subarray(6,8),e.subarray(8,10),e.subarray(10,16)].map(n=>Array.from(n,s7).join("")).join("-"),bU=()=>globalThis.crypto.getRandomValues(new Uint8Array(16));function gU(e=bU()){return e[6]=e[6]&15|64,e[8]=e[8]&63|128,e}var SU=e=>yU(e===void 0?gU():gU(e)),a7=2**48-1;function xU(e,t=bU()){let n=Math.min(Math.max(0,Math.trunc(e)),a7);return t[0]=Math.floor(n/2**40),t[1]=Math.floor(n/2**32)&255,t[2]=Math.floor(n/2**24)&255,t[3]=Math.floor(n/2**16)&255,t[4]=Math.floor(n/2**8)&255,t[5]=n&255,t[6]=t[6]&15|112,t[8]=t[8]&63|128,t}var EU=(e,t)=>yU(t===void 0?xU(e):xU(e,t));var vU="~effect/Crypto",Gw=Je("effect/Crypto"),wU=e=>{let t=e.randomBytes,n=a=>ne(c7("randomBytes",a),t),r=a=>(a[0]&31)*2**48+a[1]*2**40+a[2]*2**32+a[3]*2**24+a[4]*2**16+a[5]*2**8+a[6],o=()=>r(t(7))/2**53,s=()=>{for(;;){let a=t(7),i=r(a);if((a[0]&32)===0)return i+Number.MIN_SAFE_INTEGER;if(i<Number.MAX_SAFE_INTEGER)return i+1}};return Gw.of({[vU]:vU,randomBytes:n,nextDoubleUnsafe:o,nextIntUnsafe:s,digest:e.digest,random:pe(()=>o()),randomBoolean:pe(()=>o()>.5),randomInt:pe(()=>s()),randomBetween:(a,i)=>pe(()=>c_(a,i,o())),randomIntBetween(a,i,c){let u=c?.halfOpen===!0?0:1;return pe(()=>{let l=Math.ceil(a),f=Math.floor(i);return Math.floor(o()*(f-l+u))+l})},randomShuffle:a=>pe(()=>{let i=Array.from(a);for(let c=i.length-1;c>=1;c=c-1){let u=Math.min(c,Math.floor(o()*(c+1))),l=i[c];i[c]=i[u],i[u]=l}return i}),randomUUIDv4:pe(()=>SU(t(16))),randomUUIDv7:Oc(a=>b(EU(a.currentTimeMillisUnsafe(),t(16)))),randomULID:Oc(a=>b(hU(a.currentTimeMillisUnsafe(),t(10))))})},c7=(e,t)=>Number.isSafeInteger(t)&&t>=0?b(t):I(So({module:"Crypto",method:e,description:"size must be a non-negative safe integer"}));import*as Pg from"node:crypto";var u7=e=>{switch(e){case"SHA-1":return"sha1";case"SHA-256":return"sha256";case"SHA-384":return"sha384";case"SHA-512":return"sha512"}},l7=(e,t)=>lt({try:()=>Uint8Array.from(Pg.createHash(u7(e)).update(t).digest()),catch:n=>Gn({module:"Crypto",method:"digest",_tag:"Unknown",description:"Could not compute digest",cause:n})}),f7=wU({randomBytes:Pg.randomBytes,digest:l7}),IU=sr(Gw,f7);var CU=IU;import*as OU from"node:crypto";import*as J from"node:fs";import*as _U from"node:os";import*as ds from"node:path";var ze=e=>t=>So({module:"FileSystem",method:e,description:t.message??String(t)}),Kw=(e,t)=>{let n=Number(e);if(!Number.isSafeInteger(n))throw new RangeError(`${t} exceeds the safe integer range: ${e}`);return n},Au=e=>pp(Sa(e),jm),AU=(e,t)=>lt({try:()=>Kw(e,"position"),catch:ze(t)}),p7=(()=>{let e=Ze(J.access,Le("FileSystem","access"),ze("access"));return(t,n)=>{let r=J.constants.F_OK;return n?.readable&&(r|=J.constants.R_OK),n?.writable&&(r|=J.constants.W_OK),e(t,r)}})(),m7=(()=>{let e=Ze(J.cp,Le("FileSystem","copy"),ze("copy"));return(t,n,r)=>e(t,n,{force:r?.overwrite??!1,preserveTimestamps:r?.preserveTimestamps??!1,recursive:!0})})(),h7=(()=>{let e=Ze(J.copyFile,Le("FileSystem","copyFile"),ze("copyFile"));return(t,n)=>e(t,n)})(),g7=(()=>{let e=Ze(J.chmod,Le("FileSystem","chmod"),ze("chmod"));return(t,n)=>e(t,n)})(),x7=(()=>{let e=Ze(J.chown,Le("FileSystem","chown"),ze("chown"));return(t,n,r)=>e(t,n,r)})(),y7=(()=>{let e=Ze(J.glob,Le("FileSystem","glob"),ze("glob"));return(t,n)=>e(t,{cwd:n?.root,exclude:n?.exclude})})(),b7=(()=>{let e=Ze(J.link,Le("FileSystem","link"),ze("link"));return(t,n)=>e(t,n)})(),S7=(()=>{let e=Ze(J.mkdir,Le("FileSystem","makeDirectory"),ze("makeDirectory"));return(t,n)=>e(t,{recursive:n?.recursive??!1,mode:n?.mode})})(),Jw=e=>{let t=Ze(J.mkdtemp,Le("FileSystem",e),ze(e));return n=>ke(()=>{let r=n?.prefix??"",o=typeof n?.directory=="string"?ds.join(n.directory,"."):_U.tmpdir();return t(r?ds.join(o,r):o+"/")})},E7=Jw("makeTempDirectory"),Zw=e=>{let t=Ze(J.rm,Le("FileSystem",e),ze(e));return(n,r)=>t(n,{recursive:r?.recursive??!1,force:r?.force??!1})},v7=Zw("remove"),w7=(()=>{let e=Jw("makeTempDirectoryScoped"),t=Zw("makeTempDirectoryScoped");return n=>ir(e(n),r=>po(t(r,{recursive:!0})))})(),k7=e=>{let t=Ze(J.open,Le("FileSystem",e),ze(e)),n=Ze(J.close,Le("FileSystem",e),ze(e));return(r,o)=>Wr(ir(t(r,o?.flag??"r",o?.mode),s=>po(n(s))),ne(s=>C7(s,o?.flag?.startsWith("a")??!1)))},I7=k7("open"),C7=(()=>{let e=l=>Ze(J.read,Le("FileSystem",l),ze(l)),t=e("read"),n=e("readAlloc"),r=Ze(J.fstat,Le("FileSystem","stat"),ze("stat")),o=Ze(J.ftruncate,Le("FileSystem","truncate"),ze("truncate")),s=Ze(J.fsync,Le("FileSystem","sync"),ze("sync")),a=l=>Ze(J.write,Le("FileSystem",l),ze(l)),i=a("write"),c=a("writeAll");class u{[Dc];fd;append;position=BigInt(0);constructor(f,d){this[Dc]=Dc,this.fd=f,this.append=d}get stat(){return q(r(this.fd,{bigint:!0}),FU)}get sync(){return s(this.fd)}seek(f,d){return ke(()=>{let m=d==="start"?f:this.position+f;return m<BigInt(0)?I(So({module:"FileSystem",method:"seek",description:"Cannot seek before the start of the file"})):(this.position=m,b(m))})}read(f){return ke(()=>{let d=this.position;return ne(t(this.fd,{buffer:f,position:d}),m=>(this.position=d+BigInt(m),m))})}readAlloc(f){return ke(()=>{try{if(!Number.isInteger(f)||f<0)throw new RangeError("size must be a non-negative integer");let d=Buffer.allocUnsafeSlow(f),m=this.position;return ne(n(this.fd,{buffer:d,position:m}),g=>{if(g===0)return A();if(this.position=m+BigInt(g),g===f)return R(d);let x=Buffer.allocUnsafeSlow(g);return d.copy(x,0,0,g),R(x)})}catch(d){return I(ze("readAlloc")(d))}})}truncate(f){return ne(o(this.fd,f||void 0),()=>{if(!this.append){let d=BigInt(f??0);this.position>d&&(this.position=d)}})}write(f){return ke(()=>{let d=this.position;return q(this.append?b(void 0):AU(d,"write"),m=>ne(i(this.fd,f,void 0,void 0,m),g=>(this.append||(this.position=d+BigInt(g)),g)))})}writeAllChunk(f){return ke(()=>{let d=this.position;return q(this.append?b(void 0):AU(d,"writeAll"),m=>q(c(this.fd,f,void 0,void 0,m),g=>g===0?I(Gn({module:"FileSystem",method:"writeAll",_tag:"WriteZero",pathOrDescriptor:this.fd,description:"write returned 0 bytes written"})):(this.append||(this.position=d+BigInt(g)),g<f.length?this.writeAllChunk(f.subarray(g)):ye)))})}writeAll(f){return f.length===0?ye:this.writeAllChunk(f)}}return(l,f)=>new u(l,f)})(),PU=e=>{let t=Jw(e);return B(function*(n){let r=yield*t(n),o=OU.randomBytes(6).toString("hex"),s=ds.join(r,n?.suffix?`${o}${n.suffix}`:o);return yield*RU(s,new Uint8Array(0)),s})},T7=PU("makeTempFile"),A7=(()=>{let e=PU("makeTempFileScoped"),t=Zw("makeTempFileScoped");return n=>ir(e(n),r=>po(t(ds.dirname(r),{recursive:!0})))})(),O7=(e,t)=>Sc({try:()=>J.promises.readdir(e,t),catch:n=>Le("FileSystem","readDirectory")(n,[e])}),_7=e=>nn((t,n)=>{try{J.readFile(e,{signal:n},(r,o)=>{t(r?I(Le("FileSystem","readFile")(r,[e])):b(o))})}catch(r){t(I(ze("readFile")(r)))}}),P7=(()=>{let e=Ze(J.readlink,Le("FileSystem","readLink"),ze("readLink"));return t=>e(t)})(),F7=(()=>{let e=Ze(J.realpath,Le("FileSystem","realPath"),ze("realPath"));return t=>e(t)})(),R7=(()=>{let e=Ze(J.rename,Le("FileSystem","rename"),ze("rename"));return(t,n)=>e(t,n)})(),FU=e=>lt({try:()=>({type:e.isFile()?"File":e.isDirectory()?"Directory":e.isSymbolicLink()?"SymbolicLink":e.isBlockDevice()?"BlockDevice":e.isCharacterDevice()?"CharacterDevice":e.isFIFO()?"FIFO":e.isSocket()?"Socket":"Unknown",mtime:Sa(e.mtime),atime:Sa(e.atime),birthtime:Sa(e.birthtime),dev:Kw(e.dev,"dev"),rdev:Au(e.rdev),ino:Au(e.ino),mode:Kw(e.mode,"mode"),nlink:Au(e.nlink),uid:Au(e.uid),gid:Au(e.gid),size:uf(e.size),blksize:e.blksize!==void 0?R(uf(e.blksize)):A(),blocks:Au(e.blocks)}),catch:ze("stat")}),Qw=(()=>{let e=Ze(J.stat,Le("FileSystem","stat"),ze("stat"));return t=>q(e(t,{bigint:!0}),FU)})(),M7=(()=>{let e=Ze(J.symlink,Le("FileSystem","symlink"),ze("symlink"));return(t,n)=>e(t,n)})(),N7=(()=>{let e=Ze(J.truncate,Le("FileSystem","truncate"),ze("truncate"));return(t,n)=>e(t,n)})(),D7=(()=>{let e=Ze(J.utimes,Le("FileSystem","utime"),ze("utime"));return(t,n,r)=>e(t,n,r)})(),U7=(e,t,n)=>cP(r=>ir(pe(()=>{let o=t.type==="Directory"?e:ds.dirname(e),s=J.watch(e,{recursive:n?.recursive??!1},(a,i)=>{if(i)switch(a){case"rename":{go(Nm(Qw(ds.resolve(o,i)),{onSuccess:c=>df(r,{_tag:"Create",path:i}),onFailure:c=>df(r,{_tag:"Remove",path:i})}));return}case"change":{Va(r,{_tag:"Update",path:i});return}}});return s.on("error",a=>{mf(r,$O(Gn({module:"FileSystem",_tag:"Unknown",method:"watch",pathOrDescriptor:e,cause:a})))}),s.on("close",()=>{Xo(r)}),s}),o=>pe(()=>o.close()))),$7=(e,t,n)=>Qw(t).pipe(ne(r=>e.pipe(pp(o=>o.register(t,r,n)),gt(()=>U7(t,r,n)))),Ws),RU=(e,t,n)=>nn((r,o)=>{try{J.writeFile(e,t,{signal:o,flag:n?.flag,mode:n?.mode},s=>{r(s?I(Le("FileSystem","writeFile")(s,[e])):ye)})}catch(s){r(I(ze("writeFile")(s)))}}),L7=ne(Um(Sf),e=>LS({access:p7,chmod:g7,chown:x7,copy:m7,copyFile:h7,glob:y7,link:b7,makeDirectory:S7,makeTempDirectory:E7,makeTempDirectoryScoped:w7,makeTempFile:T7,makeTempFileScoped:A7,open:I7,readDirectory:O7,readFile:_7,readLink:P7,realPath:F7,remove:v7,rename:R7,stat:Qw,symlink:M7,truncate:N7,utimes:D7,watch(t,n){return $7(e,t,n)},writeFile:RU})),MU=mc(wr)(L7);var NU=MU;var Ng={};qr(Ng,{layer:()=>G7});import*as Ed from"node:path";import*as Fg from"node:url";var Yw=e=>({fromFileUrl:t=>lt({try:()=>Fg.fileURLToPath(t,{windows:e}),catch:n=>new bo({module:"Path",method:"fromFileUrl",cause:n})}),toFileUrl:t=>lt({try:()=>Fg.pathToFileURL(t,{windows:e}),catch:n=>new bo({module:"Path",method:"toFileUrl",cause:n})})}),j7=sr(ur)({[Eo]:Eo,...Ed.posix,...Yw(!1)}),z7=sr(ur)({[Eo]:Eo,...Ed.win32,...Yw(!0)}),UU=sr(ur)({[Eo]:Eo,...Ed,...Yw(void 0)});var $U=UU;var BU=sr(_g,sU({args:pe(()=>process.argv.slice(2)),stdinIsTerminal:pe(()=>process.stdin.isTTY===!0),stdoutIsTerminal:pe(()=>process.stdout.isTTY===!0),stdout:e=>nu({evaluate:()=>process.stdout,onError:t=>Gn({module:"Stdio",method:"stdout",_tag:"Unknown",cause:t}),endOnDone:e?.endOnDone??!1}),stderr:e=>nu({evaluate:()=>process.stderr,onError:t=>Gn({module:"Stdio",method:"stderr",_tag:"Unknown",cause:t}),endOnDone:e?.endOnDone??!1}),stdin:ru({evaluate:()=>process.stdin,onError:e=>Gn({module:"Stdio",method:"stdin",_tag:"Unknown",cause:e}),closeOnDone:!1})}));var jU=BU;var qU="~effect/Terminal",Xw="~effect/Terminal/QuitError",Ou=class extends Ag("QuitError")({_tag:cs("QuitError")}){[Xw]=Xw},WU=e=>_(e,Xw),Br=Je("effect/Terminal"),HU=e=>Br.of({...e,[qU]:qU});import*as Mg from"node:readline";var VU=B(function*(e=KU){let t=process.stdin,n=process.stdout,r=yield*Rc(),o=t.readableEnded,s=!1,a=()=>{o=!0,s||Xo(r)};t.once("end",a),yield*$m(()=>pe(()=>t.off("end",a)));let i=yield*sP({acquire:ir(pe(()=>{let m=Mg.createInterface({input:t,escapeCodeTimeout:50}),g=E=>Va(r,E),x=()=>{s=!1,Xo(r)};return s=!0,Mg.emitKeypressEvents(t,m),m.on("line",g),m.once("close",x),t.isTTY&&t.setRawMode(!0),{rl:m,onClose:x,onLine:g}}),({rl:m,onClose:g,onLine:x})=>pe(()=>{s=!1,m.off("line",x),m.off("close",g),t.isTTY&&t.setRawMode(!1),m.close(),o&&Xo(r)})),idleTimeToLive:"10 millis"}),c=pe(()=>n.columns??0),u=pe(()=>n.rows??0),l=Dt(function*(){let m=yield*Rc(),g=(k,w)=>{let P={input:Ts(k),key:{name:w.name??"",ctrl:!!w.ctrl,meta:!!w.meta,shift:!!w.shift}};Va(m,P),e(P)&&Xo(m)},x=setInterval(()=>{},2147483647),E=()=>{clearInterval(x),Xo(m)};return yield*$m(()=>pe(()=>{clearInterval(x),t.off("keypress",g),t.off("end",E)})),t.on("keypress",g),o?E():(yield*NS(i),t.once("end",E)),m}),f=ke(()=>C1(r).pipe(q(_e({onNone:()=>zs(fo(NS(i),es(r))),onSome:b})),kt(()=>new Ou({}))));return HU({columns:c,rows:u,readInput:l,readLine:f,display:m=>rf(nn(g=>{n.write(m,x=>Kk(x)?g(ye):g(I(So({module:"Terminal",method:"display",description:"Failed to write prompt to stdout",cause:x}))))}))})}),GU=mc(Br,VU(KU));function KU(e){return e.key.ctrl&&(e.key.name==="c"||e.key.name==="d")}var JU=GU;var G7=FO(tM,xm(NU,CU,$U,jU,JU));var $g={};qr($g,{runMain:()=>Y7});var K7=(e,t)=>xt(e)?t(0):bm(e.cause)?t(130):t(J7(Wl(e.cause))),QU=e=>h(t=>Sn(t[0]),(t,n)=>{let r=n?.disableErrorReporting===!0?go(t):go(Rm(t,s=>bm(s)?ye:Z7(Wl(s))?Bm(s):ye));try{let s=globalThis.setInterval(No,2147483647);r.addObserver(()=>{clearInterval(s)})}catch{}let o=n?.teardown??K7;return e({fiber:r,teardown:o})}),Dg="~effect/Runtime/errorExitCode",J7=e=>{if(typeof e=="object"&&e!==null&&Dg in e){let t=e[Dg];if(typeof t=="number")return t}return 1},Ei="~effect/Runtime/errorReported",Z7=e=>{if(typeof e=="object"&&e!==null&&Ei in e){let t=e[Ei];if(typeof t=="boolean")return t}return!0};var YU=QU(({fiber:e,teardown:t})=>{let n=!1;e.addObserver(o=>{process.removeListener("SIGINT",r),process.removeListener("SIGTERM",r),t(o,s=>{(n||s!==0)&&process.exit(s)})});function r(){n=!0,e.interruptUnsafe(e.id)}process.on("SIGINT",r),process.on("SIGTERM",r)});var Y7=YU;var Po={};qr(Po,{Console:()=>XU,assert:()=>X7,clear:()=>eQ,consoleWith:()=>Ut,count:()=>tQ,countReset:()=>nQ,debug:()=>rQ,dir:()=>oQ,dirxml:()=>sQ,error:()=>Lg,group:()=>aQ,info:()=>iQ,log:()=>Vt,table:()=>cQ,time:()=>uQ,timeLog:()=>lQ,trace:()=>fQ,warn:()=>dQ,withGroup:()=>pQ,withTime:()=>mQ});var XU=xb,Ut=e=>te(t=>e(t.getRef(XU))),X7=(e,...t)=>Ut(n=>W(()=>{n.assert(e,...t)})),eQ=Ut(e=>W(()=>{e.clear()})),tQ=e=>Ut(t=>W(()=>{t.count(e)})),nQ=e=>Ut(t=>W(()=>{t.countReset(e)})),rQ=(...e)=>Ut(t=>W(()=>{t.debug(...e)})),oQ=(e,t)=>Ut(n=>W(()=>{n.dir(e,t)})),sQ=(...e)=>Ut(t=>W(()=>{t.dirxml(...e)})),Lg=(...e)=>Ut(t=>W(()=>{t.error(...e)})),aQ=e=>Ut(t=>Ma(W(()=>{e?.collapsed?t.groupCollapsed(e.label):t.group(e?.label)}),()=>W(()=>{t.groupEnd()}))),iQ=(...e)=>Ut(t=>W(()=>{t.info(...e)})),Vt=(...e)=>Ut(t=>W(()=>{t.log(...e)})),cQ=(e,t)=>Ut(n=>W(()=>{n.table(e,t)})),uQ=e=>Ut(t=>Ma(W(()=>{t.time(e)}),()=>W(()=>{t.timeEnd(e)}))),lQ=(e,...t)=>Ut(n=>W(()=>{n.timeLog(e,...t)})),fQ=(...e)=>Ut(t=>W(()=>{t.trace(...e)})),dQ=(...e)=>Ut(t=>W(()=>{t.warn(...e)})),pQ=h(e=>ae(e[0]),(e,t)=>Ut(n=>Fl(W(()=>{t?.collapsed?n.groupCollapsed(t.label):n.group(t?.label)}),()=>e,()=>W(()=>{n.groupEnd()})))),mQ=h(e=>ae(e[0]),(e,t)=>Ut(n=>Fl(W(()=>{n.time(t)}),()=>e,()=>W(()=>{n.timeEnd(t)}))));var Pi={};qr(Pi,{ChoiceWithValue:()=>v9,Date:()=>t9,Directory:()=>XY,File:()=>YY,FileParse:()=>a9,FileSchema:()=>i9,FileText:()=>s9,Finite:()=>e9,Int:()=>QY,Literals:()=>n9,Never:()=>c9,Path:()=>r9,Redacted:()=>o9,String:()=>ZY,atLeast:()=>y9,atMost:()=>b9,between:()=>S9,filter:()=>k9,filterMap:()=>I9,map:()=>h9,mapEffect:()=>g9,mapTryCatch:()=>x9,optional:()=>u9,orElse:()=>C9,orElseResult:()=>T9,variadic:()=>m9,withDefault:()=>f9,withDescription:()=>l9,withFallbackConfig:()=>d9,withFallbackPrompt:()=>p9,withMetavar:()=>w9,withSchema:()=>E9});var We="~effect/cli/CliError",t0=e=>_(e,We),na=class extends Lr(`${We}/UnrecognizedOption`)("UnrecognizedOption",{option:L,command:ls(Se(L)),suggestions:Se(L)}){[We]=We;get message(){let t=this.suggestions.length>0?`

  Did you mean this?
    ${this.suggestions.join(`
    `)}`:"";return(this.command?`Unrecognized flag: ${this.option} in command ${this.command.join(" ")}`:`Unrecognized flag: ${this.option}`)+t}},vd=class extends Lr(`${We}/DuplicateOption`)("DuplicateOption",{option:L,parentCommand:L,childCommand:L}){[We]=We;get message(){return`Duplicate flag name "${this.option}" in parent command "${this.parentCommand}" and subcommand "${this.childCommand}". Parent will always claim this flag (Mode A semantics). Consider renaming one of them to avoid confusion.`}},_u=class extends Lr(`${We}/MissingOption`)("MissingOption",{option:L}){[We]=We;get message(){return`Missing required flag: --${this.option}`}},Pu=class extends Lr(`${We}/MissingArgument`)("MissingArgument",{argument:L}){[We]=We;get message(){return`Missing required argument: ${this.argument}`}},wd=class extends Lr(`${We}/UnexpectedArgument`)("UnexpectedArgument",{arguments:Se(L)}){[We]=We;get message(){return`Unexpected positional ${this.arguments.length===1?"argument":"arguments"}: ${this.arguments.map(n=>JSON.stringify(n)).join(", ")}`}},dn=class extends Lr(`${We}/InvalidValue`)("InvalidValue",{option:L,value:L,expected:L,kind:st([St("flag"),St("argument")])}){[We]=We;get message(){let t=this.expected.startsWith("Expected ")||this.expected.startsWith("Expected:")?this.expected:`Expected: ${this.expected}`;return this.kind==="argument"?`Invalid value for argument <${this.option}>: "${this.value}". ${t}`:this.value.length===0?`Missing value for flag --${this.option}. ${t}`:`Invalid value for flag --${this.option}: "${this.value}". ${t}`}},kd=class extends Lr(`${We}/UnknownSubcommand`)("UnknownSubcommand",{subcommand:L,parent:ls(Se(L)),suggestions:Se(L)}){[We]=We;get message(){let t=this.suggestions.length>0?`

  Did you mean this?
    ${this.suggestions.join(`
    `)}`:"";return this.parent?`Unknown subcommand "${this.subcommand}" for "${this.parent.join(" ")}"${t}`:`Unknown subcommand "${this.subcommand}"${t}`}},e0=class extends Lr(`${We}/UserError`)("UserError",{cause:Uw(),userMessage:is(L)}){[We]=We;[Ei]=!0;get message(){return this.userMessage?this.userMessage:typeof this.cause=="string"&&this.cause?this.cause:this.cause instanceof Error&&this.cause.message?this.cause.message:"An error occurred"}},hQ=st([na,vd,_u,Pu,wd,dn,kd,e0]),ps=class extends Lr(`${We}/ShowHelp`)("ShowHelp",{commandPath:Se(L),errors:Se(hQ)}){[We]=We;[Dg]=this.errors.length?1:0;[Ei]=!1;get message(){return"Help requested"}};var e$=Object.prototype.hasOwnProperty,gQ=e=>{let t=[],n=0,r=0;for(;(r=e.indexOf(".",r))!==-1;)(r===0||e[r-1]!=="\\")&&(t.push(e.slice(n,r)),n=r+1),r++;return t.push(e.slice(n)),t},xQ=e=>e.length>=2&&(e.startsWith('"')&&e.endsWith('"')||e.startsWith("'")&&e.endsWith("'")),n0=e=>{let t=(e??"").trim();if(xQ(t)){t[0]==="'"&&(t=t.slice(1,-1));try{return JSON.parse(t)}catch{return t}}let n=!1,r="";for(let o of t)if(n)r+=o===";"||o==="#"||o==="\\"?o:`\\${o}`,n=!1;else{if(o===";"||o==="#")break;o==="\\"?n=!0:r+=o}return r.trim()},t$=e=>{let t=Object.create(null),n=t,r=/^\[([^\]]*)\]\s*$/,o=/^([^=]+)(=(.*))?$/;for(let a of e.split(/[\r\n]+/g)){if(a.length===0||/^\s*(?:[;#]|$)/.test(a))continue;let i=r.exec(a);if(i!==null){let g=n0(i[1]);g==="__proto__"?n=Object.create(null):n=t[g]??=Object.create(null);continue}let c=o.exec(a);if(c===null)continue;let u=n0(c[1]),l=u.length>2&&u.endsWith("[]"),f=l?u.slice(0,-2):u;if(f==="__proto__")continue;let d=c[2]===void 0?!0:n0(c[3]),m=d==="true"||d==="false"||d==="null"?JSON.parse(d):d;l&&(e$.call(n,f)?Array.isArray(n[f])||(n[f]=[n[f]]):n[f]=[]),Array.isArray(n[f])?n[f].push(m):n[f]=m}let s=[];for(let a of Object.keys(t)){if(typeof t[a]!="object"||t[a]===null||Array.isArray(t[a]))continue;let i=gQ(a),c=i.pop(),u=c.replace(/\\\./g,".");n=t;for(let l of i)l!=="__proto__"&&((!e$.call(n,l)||typeof n[l]!="object"||n[l]===null)&&(n[l]=Object.create(null)),n=n[l]);n===t&&u===c||(n[u]=t[a],s.push(a))}for(let a of s)delete t[a];return t};var n$=Object.prototype.hasOwnProperty,Cd=()=>Object.create(null),r$=e=>typeof e=="object"&&e!==null&&!Array.isArray(e)&&!(e instanceof Date),r0=class{root=Cd();input;current=this.root;index=0;line=1;column=1;explicitTables=new Set;constructor(t){this.input=t}parse(){for(;;){if(this.skipDocumentWhitespace(),this.done)return this.root;if(this.peek()==="[")this.parseHeader();else{let t=this.parseKeyPath("=");this.skipInlineWhitespace(),this.expect("="),this.skipInlineWhitespace(),this.assign(this.current,t,this.parseValue()),this.finishStatement()}}}parseHeader(){this.expect("[");let t=this.peek()==="[";t&&this.advance(),this.skipInlineWhitespace();let n=this.parseKeyPath("]");this.skipInlineWhitespace(),this.expect("]"),t&&this.expect("]"),this.finishStatement();let r=this.resolveTable(n,t);!t&&this.explicitTables.has(r)&&this.fail(`Cannot redefine table '${n.join(".")}'`),t||this.explicitTables.add(r),this.current=r}resolveTable(t,n){let r=this.root;for(let o=0;o<t.length;o++){let s=t[o],a=o===t.length-1,i=r[s];if(a&&n){i===void 0&&(i=[],r[s]=i),Array.isArray(i)||this.fail(`Cannot redefine existing key '${t.slice(0,o+1).join(".")}'`);let c=Cd();return i.push(c),c}i===void 0&&(i=Cd(),r[s]=i),Array.isArray(i)&&(i=i[i.length-1]),r$(i)||this.fail(`Cannot redefine existing key '${t.slice(0,o+1).join(".")}'`),r=i}return r}assign(t,n,r){let o=t;for(let a=0;a<n.length-1;a++){let i=n[a],c=o[i];if(c===void 0){let u=Cd();o[i]=u,o=u}else r$(c)?o=c:this.fail(`Cannot redefine existing key '${n.slice(0,a+1).join(".")}'`)}let s=n[n.length-1];n$.call(o,s)&&this.fail(`Cannot redefine existing key '${n.join(".")}'`),o[s]=r}parseKeyPath(t){let n=[];for(;;){this.skipInlineWhitespace();let r=this.peek(),o;if(r==='"')o=this.parseBasicString(!1);else if(r==="'")o=this.parseLiteralString(!1);else{let s=this.index;for(;/[A-Za-z0-9_-]/.test(this.peek());)this.advance();o=this.input.slice(s,this.index)}if(o.length===0&&this.fail("Expected a key"),n.push(o),this.skipInlineWhitespace(),this.peek()==="."){this.advance();continue}return this.peek()!==t&&this.fail(`Expected '${t}'`),n}}parseValue(){let t=this.peek();if(t==='"')return this.parseBasicString(this.input.startsWith('"""',this.index));if(t==="'")return this.parseLiteralString(this.input.startsWith("'''",this.index));if(t==="[")return this.parseArray();if(t==="{")return this.parseInlineTable();let n=/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:[Zz]|[+-]\d{2}:\d{2})?)/.exec(this.input.slice(this.index));if(n!==null)return this.advance(n[0].length),this.parseDate(`${n[1]}T${n[2]}`);let r=this.index;for(;!this.done&&!/[\s,#\]}]/.test(this.peek());)this.advance();let o=this.input.slice(r,this.index);if(o==="true")return!0;if(o==="false")return!1;o.length===0&&this.fail("Expected a value");let s=this.parseDate(o);if(s!==void 0)return s;let a=this.parseNumber(o);if(a!==void 0)return a;this.fail(`Invalid value '${o}'`)}parseDate(t){let n="\\d{4}-\\d{2}-\\d{2}",r="\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?";if(new RegExp(`^${n}[Tt]${r}(?:[Zz]|[+-]\\d{2}:\\d{2})$`).test(t)){let o=new Date(t.replace("t","T").replace("z","Z"));return Number.isNaN(o.getTime())&&this.fail(`Invalid date-time '${t}'`),o}if(new RegExp(`^${n}[Tt]${r}$`).test(t)||new RegExp(`^${n}$`).test(t)||new RegExp(`^${r}$`).test(t))return t.replace("t","T")}parseNumber(t){let n=t.replace(/_/g,"");if(/^[+-]?(?:inf|nan)$/.test(t))return n.endsWith("nan")?Number.NaN:n[0]==="-"?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY;if(/^0x[0-9A-Fa-f](?:_?[0-9A-Fa-f])*$/.test(t))return Number.parseInt(n.slice(2),16);if(/^0o[0-7](?:_?[0-7])*$/.test(t))return Number.parseInt(n.slice(2),8);if(/^0b[01](?:_?[01])*$/.test(t))return Number.parseInt(n.slice(2),2);if(/^[+-]?(?:0|[1-9](?:_?\d)*)$/.test(t)||/^[+-]?(?:(?:0|[1-9](?:_?\d)*)\.\d(?:_?\d)*(?:[eE][+-]?\d(?:_?\d)*)?|(?:0|[1-9](?:_?\d)*)[eE][+-]?\d(?:_?\d)*)$/.test(t))return Number(n)}parseBasicString(t){this.expect('"'),t&&(this.expect('"'),this.expect('"'),this.peek()===`
`&&this.advance());let n="";for(;!this.done;){if(t&&this.input.startsWith('"""',this.index))return this.advance(3),n;let r=this.peek();if(!t&&r==='"')return this.advance(),n;if(!t&&(r===`
`||r==="\r")&&this.fail("Basic strings cannot contain newlines"),r!=="\\"){n+=r,this.advance();continue}if(this.advance(),t&&/[ \t\r\n]/.test(this.peek())){for(;/[ \t]/.test(this.peek());)this.advance();for(this.peek()!==`
`&&this.peek()!=="\r"&&this.fail("Invalid multiline string continuation");/[ \t\r\n]/.test(this.peek());)this.advance();continue}let o=this.peek();this.advance();let s={b:"\b",t:"	",n:`
`,f:"\f",r:"\r",'"':'"',"\\":"\\"};if(n$.call(s,o))n+=s[o];else if(o==="u"||o==="U"){let a=o==="u"?4:8,i=this.input.slice(this.index,this.index+a);new RegExp(`^[0-9A-Fa-f]{${a}}$`).test(i)||this.fail("Invalid unicode escape"),n+=String.fromCodePoint(Number.parseInt(i,16)),this.advance(a)}else this.fail(`Invalid escape '\\${o}'`)}this.fail("Unterminated basic string")}parseLiteralString(t){this.expect("'"),t&&(this.expect("'"),this.expect("'"),this.peek()===`
`&&this.advance());let n=this.index;for(;!this.done;){if(t&&this.input.startsWith("'''",this.index)){let r=this.input.slice(n,this.index);return this.advance(3),r}if(!t&&this.peek()==="'"){let r=this.input.slice(n,this.index);return this.advance(),r}!t&&(this.peek()===`
`||this.peek()==="\r")&&this.fail("Literal strings cannot contain newlines"),this.advance()}this.fail("Unterminated literal string")}parseArray(){this.expect("[");let t=[];for(;;){if(this.skipArrayWhitespace(),this.peek()==="]")return this.advance(),t;if(t.push(this.parseValue()),this.skipArrayWhitespace(),this.peek()==="]")return this.advance(),t;this.expect(",")}}parseInlineTable(){this.expect("{");let t=Cd();if(this.skipInlineWhitespace(),this.peek()==="}")return this.advance(),t;for(;;){let n=this.parseKeyPath("=");if(this.skipInlineWhitespace(),this.expect("="),this.skipInlineWhitespace(),this.assign(t,n,this.parseValue()),this.skipInlineWhitespace(),this.peek()==="}")return this.advance(),t;this.expect(","),this.skipInlineWhitespace(),this.peek()==="}"&&this.fail("Inline tables cannot end with a trailing comma")}}skipDocumentWhitespace(){for(;!this.done;)if(/[ \t\r\n]/.test(this.peek()))this.advance();else if(this.peek()==="#")this.skipComment();else return}skipInlineWhitespace(){for(;this.peek()===" "||this.peek()==="	";)this.advance()}skipArrayWhitespace(){for(;!this.done;)if(/[ \t\r\n]/.test(this.peek()))this.advance();else if(this.peek()==="#")this.skipComment();else return}finishStatement(){this.skipInlineWhitespace(),this.peek()==="#"&&this.skipComment(),!this.done&&this.peek()!==`
`&&this.peek()!=="\r"&&this.fail("Expected the end of the line")}skipComment(){for(;!this.done&&this.peek()!==`
`;)this.advance()}expect(t){this.peek()!==t&&this.fail(`Expected '${t}'`),this.advance()}advance(t=1){for(let n=0;n<t;n++)this.input[this.index]===`
`?(this.line++,this.column=1):this.column++,this.index++}peek(){return this.input[this.index]??""}get done(){return this.index>=this.input.length}fail(t){throw new SyntaxError(`${t} at line ${this.line}, column ${this.column}`)}},o$=e=>new r0(e.replace(/^\uFEFF/,"")).parse();var i0=Object.prototype.hasOwnProperty,a$=(e,t,n)=>{Object.defineProperty(e,t,{configurable:!0,enumerable:!0,writable:!0,value:n})},c0=(e,t,n)=>{for(let r=n;r<e.length;r++){let o=e[r];if(t==='"'&&o==="\\")r++;else if(o===t)if(t==="'"&&e[r+1]===t)r++;else return r}return-1},u0=(e,t)=>{let n=0,r=!0;for(let o=0;o<e.length;o++){let s=e[o];if(r&&(s==="'"||s==='"')){if(o=c0(e,s,o+1),o===-1)return-1;r=!1}else if(r&&s==="&")for(;o+1<e.length&&!/[\s,[\]{}]/.test(e[o+1]);)o++;else{if(s==="#"&&(o===0||/\s/.test(e[o-1])))return t==="#"?o:-1;if(r&&(s==="["||s==="{"))n++;else if(n>0&&(s==="]"||s==="}"))n--,r=!1;else if(n>0&&s===",")r=!0;else if(s===":"&&(n>0||e[o+1]===void 0||/\s/.test(e[o+1]))){if(n===0&&t===":")return o;r=!0}else{if(r&&s==="-"&&/\s/.test(e[o+1]??""))continue;/\s/.test(s)||(r=!1)}}}return-1},SQ=e=>{let t=u0(e,"#");return t===-1?e:e.slice(0,t).trimEnd()},o0=e=>u0(e,":"),Bg=e=>e==="-"||e.startsWith("- "),s$=e=>e===0?" ":`
`.repeat(e),i$=e=>/\\*$/.exec(e)[0].length%2===1,EQ=(e,t)=>{let n=/[ \t]+$/.exec(e);if(n===null)return e;let r=t==='"'&&i$(e.slice(0,n.index));return e.slice(0,n.index+(r?1:0))},vQ=e=>{if(!e.endsWith('"')||e.length<2)throw new SyntaxError("Unterminated double-quoted YAML string");let t="";for(let n=1;n<e.length-1;n++){let r=e[n];if(r!=="\\"){t+=r;continue}let o=e[++n],s={0:"\0",a:"\x07",b:"\b",t:"	",n:`
`,v:"\v",f:"\f",r:"\r",e:"\x1B"," ":" ",'"':'"',"/":"/","\\":"\\",N:"\x85",_:"\xA0",L:"\u2028",P:"\u2029"};if(i0.call(s,o)){t+=s[o];continue}if(o==="x"||o==="u"||o==="U"){let a=o==="x"?2:o==="u"?4:8,i=e.slice(n+1,n+1+a);if(!new RegExp(`^[0-9A-Fa-f]{${a}}$`).test(i))throw new SyntaxError("Invalid unicode escape in YAML string");t+=String.fromCodePoint(Number.parseInt(i,16)),n+=a;continue}throw new SyntaxError(`Invalid YAML escape '\\${o}'`)}return t},Td=e=>{let t=e.trim();if(t.length===0)return null;if(t.startsWith('"')&&t.endsWith('"'))return vQ(t);if(t.startsWith("'")&&t.endsWith("'"))return t.slice(1,-1).replace(/''/g,"'");if(/^(?:null|~)$/i.test(t))return null;if(/^true$/i.test(t))return!0;if(/^false$/i.test(t))return!1;if(/^[+-]?\.inf$/i.test(t))return t[0]==="-"?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY;if(/^\.nan$/i.test(t))return Number.NaN;let n=t.replace(/_/g,"");return/^[+-]?0x[0-9a-f]+$/i.test(n)?(n[0]==="-"?-1:1)*Number.parseInt(n.replace(/^[+-]?0x/i,""),16):/^[+-]?0o[0-7]+$/i.test(n)?(n[0]==="-"?-1:1)*Number.parseInt(n.replace(/^[+-]?0o/i,""),8):/^[+-]?(?:0|[1-9]\d*)$/.test(n)||/^[+-]?(?:(?:0|[1-9]\d*)?\.\d+|(?:0|[1-9]\d*)\.?\d*[eE][+-]?\d+)$/.test(n)?Number(n):t},c$=e=>{let t=Td(e);return t==null?"":String(t)},s0=class{input;anchors;index=0;constructor(t,n){this.input=t,this.anchors=n}parse(){let t=this.parseValue();return this.skipWhitespace(),this.index!==this.input.length&&this.fail("Unexpected flow collection content"),t}parseValue(){this.skipWhitespace();let t=this.peek();if(t==="[")return this.parseSequence();if(t==="{")return this.parseMapping();if(t==='"'||t==="'")return Td(this.readQuoted(t));if(t==="*"){this.index++;let n=this.readUntil(/[,\]}\s]/);return this.anchors.has(n)||this.fail(`Unknown alias '*${n}'`),this.anchors.get(n)}return Td(this.readUntil(/[,\]}]/).trim())}parseSequence(){this.expect("[");let t=[];if(this.skipWhitespace(),this.peek()==="]")return this.index++,t;for(;;){if(t.push(this.parseValue()),this.skipWhitespace(),this.peek()==="]")return this.index++,t;if(this.expect(","),this.skipWhitespace(),this.peek()==="]")return this.index++,t}}parseMapping(){this.expect("{");let t={};if(this.skipWhitespace(),this.peek()==="}")return this.index++,t;for(;;){let n=this.parseKey();if(this.skipWhitespace(),this.expect(":"),i0.call(t,n)&&this.fail(`Duplicate key '${n}'`),a$(t,n,this.parseValue()),this.skipWhitespace(),this.peek()==="}")return this.index++,t;if(this.expect(","),this.skipWhitespace(),this.peek()==="}")return this.index++,t}}parseKey(){this.skipWhitespace();let t=this.peek();return t==='"'||t==="'"?c$(this.readQuoted(t)):this.readUntil(/:/).trim()}readQuoted(t){let n=this.index,r=c0(this.input,t,n+1);return r===-1&&this.fail("Unterminated quoted scalar"),this.index=r+1,this.input.slice(n,this.index)}readUntil(t){let n=this.index;for(;this.index<this.input.length&&!t.test(this.peek());)this.index++;return this.input.slice(n,this.index)}skipWhitespace(){for(;/\s/.test(this.peek());)this.index++}expect(t){this.peek()!==t&&this.fail(`Expected '${t}'`),this.index++}peek(){return this.input[this.index]??""}fail(t){throw new SyntaxError(`${t} at flow offset ${this.index}`)}},a0=class{lines;index=0;documentStarted=!1;anchors=new Map;constructor(t){this.lines=t}parse(){if(this.skipIgnored(),this.index>=this.lines.length)return null;this.documentStarted=!0;let t=this.parseNode(this.lines[this.index].indent);return this.skipIgnored(),this.index<this.lines.length&&this.fail(this.lines[this.index],"Unexpected content"),t}parseNode(t,n=t-1){this.skipIgnored();let r=this.lines[this.index];return r===void 0?null:(r.indent!==t&&this.fail(r,`Expected indentation of ${t} spaces`),Bg(r.text)?this.parseSequence(t):o0(r.text)!==-1?this.parseMapping(t):(this.index++,this.parseNodeValue(r.text,n)))}parseMapping(t,n={}){for(;;){this.skipIgnored();let r=this.lines[this.index];if(r===void 0||r.indent<t)return n;r.indent>t&&this.fail(r,`Unexpected indentation of ${r.indent} spaces`);let o=o0(r.text);if(o===-1)return n;this.index++,this.parseMappingEntry(n,r.text,o,t,r)}}parseMappingEntry(t,n,r,o,s){let a=c$(n.slice(0,r).trim()),i=n.slice(r+1).trimStart(),c=this.parseNodeValue(i,o,!0);i0.call(t,a)&&this.fail(s,`Duplicate key '${a}'`),a$(t,a,c)}parseSequence(t){let n=[];for(;;){this.skipIgnored();let r=this.lines[this.index];if(r===void 0||r.indent<t||(r.indent>t&&this.fail(r,`Unexpected indentation of ${r.indent} spaces`),!Bg(r.text)))return n;this.index++;let o=r.text.slice(1).trimStart();Bg(o)&&this.fail(r,"Compact nested block sequences are not supported");let s=o0(o);if(s===-1)n.push(this.parseNodeValue(o,t));else{let a={};this.parseMappingEntry(a,o,s,t+2,r),n.push(this.parseMapping(t+2,a))}}}parseNodeValue(t,n,r=!1){let o=/^&([^\s,[\]{}]+)(?:\s+(.*))?$/.exec(t);if(o===null)return this.parseValue(t,n,r);let s=this.parseValue(o[2]??"",n,r);return this.anchors.set(o[1],s),s}parseValue(t,n,r){let o=t.trimEnd();if(o.length===0){this.skipIgnored();let s=this.lines[this.index];return s===void 0?null:s.indent>n?this.parseNode(s.indent,n):r&&s.indent===n&&Bg(s.text)?this.parseSequence(n):null}if(/^[|>](?:[1-9]?[+-]?|[+-]?[1-9]?)$/.test(o))return this.parseBlockScalar(o,n);if(t.startsWith('"')||t.startsWith("'"))return this.parseQuotedValue(t,n);if(o.startsWith("*")){let s=o.slice(1).trim();if(!this.anchors.has(s))throw new SyntaxError(`Unknown YAML alias '*${s}'`);return this.anchors.get(s)}return o.startsWith("[")||o.startsWith("{")?new s0(o,this.anchors).parse():this.parsePlainValue(o,n)}parsePlainValue(t,n){let r=this.lines[this.index-1];/:(?:\s|$)/.test(t)&&this.fail(r,"Invalid colon in plain scalar");let o=t,s=u0(r.raw,"#")!==-1;for(;!s;){let a=this.skipBlankLines(),i=this.lines[this.index];if(i===void 0||i.indent<=n)break;let c=i.raw.slice(i.indent),u=c.search(/(?:^|[ \t])#/),l=(u===-1?c:c.slice(0,u)).trimEnd();if(l.length===0||i.indent===0&&/^(?:---|\.\.\.)(?:\s|$)/.test(l))break;/:(?:\s|$)/.test(l)&&this.fail(i,"Invalid colon in plain scalar"),o+=s$(a)+l,this.index++,s=u!==-1}return Td(o)}parseQuotedValue(t,n){let r=t[0],o=r,s=t.slice(1);for(;;){let a=c0(s,r,0);if(a!==-1){let c=s.slice(a+1);if(c.trim().length>0&&!/^[ \t]+#/.test(c))throw new SyntaxError("Unexpected content after quoted YAML scalar");return Td(o+s.slice(0,a+1))}r==='"'&&i$(s)?o+=s.slice(0,-1):o+=EQ(s,r)+s$(this.skipBlankLines());let i=this.lines[this.index++];if(i===void 0)throw new SyntaxError("Unterminated quoted YAML scalar");i.raw.trim().length>0&&i.indent<=n&&this.fail(i,"Invalid quoted scalar indentation"),s=i.raw.trimStart()}}parseBlockScalar(t,n){let r=t[0],o=t.includes("-")?"strip":t.includes("+")?"keep":"clip",s=Number.parseInt(t.replace(/[^1-9]/g,""),10),a=this.index,i=a,c=Number.isNaN(s)?Number.POSITIVE_INFINITY:n+s;for(;i<this.lines.length;){let f=this.lines[i];if(f.raw.trim().length!==0&&f.indent<=n)break;f.raw.trim().length!==0&&(c=Math.min(c,f.indent)),i++}c===Number.POSITIVE_INFINITY&&(c=n+1);let u=[];for(let f=a;f<i;f++){let d=this.lines[f];d.raw.trim().length===0?u.push(""):d.indent<c?this.fail(d,`Expected block scalar indentation of ${c} spaces`):u.push(d.raw.slice(c))}this.index=i;let l="";if(r==="|")l=u.join(`
`);else{let f=0,d;for(let m of u)if(m.length===0)f++;else{let g=m.startsWith(" "),x=g||d===!0;d===void 0?l+=`
`.repeat(f):f===0?l+=x?`
`:" ":l+=`
`.repeat(f+(x?1:0)),l+=m,f=0,d=g}l+=`
`.repeat(f)}return o==="keep"?l.endsWith(`
`)?l:`${l}
`:(l=l.replace(/\n+$/,""),o==="strip"?l:`${l}
`)}skipBlankLines(){let t=this.index;for(;this.index<this.lines.length&&this.lines[this.index].raw.trim().length===0;)this.index++;return this.index-t}skipIgnored(){for(;this.index<this.lines.length;){let t=this.lines[this.index],n=t.text.trimEnd();if(n.length===0||n.startsWith("%"))this.index++;else if(t.indent===0&&n==="---")this.documentStarted&&this.fail(t,"Multiple YAML documents are not supported"),this.documentStarted=!0,this.index++;else if(t.indent===0&&n==="..."){for(this.index++;this.index<this.lines.length&&this.lines[this.index].text.trimEnd().length===0;)this.index++;this.index<this.lines.length&&this.fail(this.lines[this.index],"Multiple YAML documents are not supported")}else return}}fail(t,n){throw new SyntaxError(`${n} at line ${t.number}`)}},l0=e=>{let n=e.replace(/^\uFEFF/,"").replace(/\r\n?/g,`
`).split(`
`).map((r,o)=>{let s=/^( *)/.exec(r)[1].length;if(r.slice(0,s+1).includes("	"))throw new SyntaxError(`Tabs cannot be used for YAML indentation at line ${o+1}`);return{raw:r,text:SQ(r.slice(s)),indent:s,number:o+1}});return new a0(n).parse()};var kQ="~effect/cli/Primitive",IQ={[kQ]:{_A:F}},u$=dg(yg),l$=dg(bg),jg=e=>e._tag==="Boolean",ms=(e,t)=>Object.assign(Object.create(IQ),{_tag:e,parse:t}),zg=(e,t)=>{let n=Ww(t),r=us(n);return ms(e,o=>kt(r(o),s=>s.message))},f$=zg("Boolean",_w),d$=zg("Finite",ku),p$=zg("Int",_o),m$=zg("Date",Iu),h$=ms("String",e=>b(e)),g$=e=>{let t=new Map(e),n=e.map(([o])=>M(o)).join(" | "),r=ms("Choice",o=>t.has(o)?b(t.get(o)):I(n));return Object.assign(r,{choiceKeys:e.map(([o])=>o)})},x$=(e,t)=>{let n=ms("Path",B(function*(r){let o=yield*wr,s=yield*ur,a=s.isAbsolute(r)?r:s.resolve(r),i=yield*kt(o.exists(a),c=>`Failed to check path existence: ${c.message}`);if(t===!0&&!i)return yield*I(`Path does not exist: ${a}`);if(i&&e!=="either"){let c=yield*kt(o.stat(a),u=>`Failed to stat path: ${u.message}`);if(e==="file"&&c.type!=="File")return yield*I(`Path is not a file: ${a}`);if(e==="directory"&&c.type!=="Directory")return yield*I(`Path is not a directory: ${a}`)}return a}));return Object.assign(n,{pathType:e})},y$=ms("Redacted",e=>b(_r(e))),f0=ms("FileText",B(function*(e){let t=yield*wr,n=yield*ur,r=n.isAbsolute(e)?e:n.resolve(e);return(yield*kt(t.exists(r),i=>`Failed to check file existence: ${i.message}`))?(yield*kt(t.stat(r),i=>`Failed to stat file: ${i.message}`)).type!=="File"?yield*I(`Path is not a file: ${r}`):yield*kt(t.readFileString(r),i=>`Failed to read file: ${i.message}`):yield*I(`File does not exist: ${r}`)})),CQ={ini:e=>t$(e),json:e=>JSON.parse(e),toml:e=>o$(e),yml:e=>l0(e),yaml:e=>l0(e)},d0=e=>ms("FileParse",B(function*(t){let n=e?.format??t.split(".").pop(),r=CQ[n];if(r===void 0)return yield*I(`Unsupported file format: ${n}`);let o=yield*f0.parse(t);return yield*lt({try:()=>r(o),catch:s=>`Failed to parse '.${n}' file content: ${s}`})})),b$=(e,t)=>{let n=us(e);return ms("FileSchema",B(function*(r){let o=yield*d0(t).parse(r);return yield*kt(n(o),s=>t?.errorFormatter?.(s.issue)??s.toString())}))};var S$=ms("Never",()=>I("This option does not accept values")),Ad=e=>{switch(e._tag){case"Boolean":return"boolean";case"String":return"string";case"Int":return"integer";case"Finite":return"number";case"Date":return"date";case"Path":return"path";case"Choice":return"choice";case"Redacted":return"string";case"FileText":return"file";case"FileParse":return"file";case"FileSchema":return"file";case"KeyValuePair":return"key=value";case"Never":return"none";default:return"value"}},hs=e=>e._tag==="Choice"?e.choiceKeys:void 0,p0=e=>e._tag==="Path"?e.pathType:void 0;var TQ="\x1B[0m",gs="\x1B[1m",E$="\x1B[3m",vi="\x1B[4m",v$="\x1B[9m",w$="\x1B[?25h",Od="\x1B[?25l";var ra="\x1B[2K";var qg="\x1B[31m",Wg="\x1B[32m",k$="\x1B[35m",wi="\x1B[37m",_d="\x1B[90m",Ru="\x1B[96m",Ye=(e,...t)=>`${t.flat().join("")}${e}${TQ}`,Fo=(...e)=>e,I$=(e,t)=>t===void 0?`\x1B[${Math.max(e+1,0)}G`:`\x1B[${t+1};${Math.max(e+1,0)}H`,C$=(e=1)=>`\x1B[${e}B`,T$=(e,t=0)=>{let n="";return t<0&&(n+=`\x1B[${-t}A`),t>0&&(n+=`\x1B[${t}B`),e>0&&(n+=`\x1B[${e}C`),e<0&&(n+=`\x1B[${-e}D`),n},A$=e=>{let t="";for(let n=0;n<e;n++)t+="\x1B[2K"+(n<e-1?"\x1B[1A":"");return e>0&&(t+="\x1B[G"),t};var N$="~effect/cli/Prompt",D$=e=>_(e,N$),U$={prefix:"?",arrowUp:"\u2191",arrowDown:"\u2193",checkboxOn:"\u2612",checkboxOff:"\u2610",tick:"\u2714",ellipsis:"\u2026",pointerSmall:"\u203A",pointer:"\u276F",descriptionSeparator:"- ",passwordMask:"*",toggleSeparator:"/",primaryColor:Ru,mutedColor:_d,successColor:Wg,errorColor:qg,submittedColor:wi},OQ={...U$,checkboxOn:"[*]",checkboxOff:"[ ]",tick:"\u221A",ellipsis:"...",pointerSmall:"\xBB",pointer:">"},_Q=e=>({...process.platform==="win32"?OQ:U$,...e}),PQ=xe("effect/cli/Prompt/Theme",{defaultValue:_Q}),Gt=e=>ne(PQ,t=>({...t,...e.theme}));var FQ=e=>Ye(e,gs),I0=(e,t)=>Ye(e,Fo(E$,t)),De=(e,...t)=>e.length===0?"":Ye(e,...t),oa=(e,t)=>e.length===0?t:e+" "+t,RQ=(e,t,n)=>{let r=Math.max(e.arrowUp.length,e.arrowDown.length);return t?e.arrowUp.padEnd(r):n?e.arrowDown.padEnd(r):" ".repeat(r)},C0=e=>{let t={initial:!1,...e,label:{confirm:"yes",deny:"no",...e.label},placeholder:{defaultConfirm:"(Y/n)",defaultDeny:"(y/N)",...e.placeholder}},n={value:t.initial};return ki(n,{render:qQ(t),process:r=>VQ(r,t.initial),clear:BQ(t)})},ki=(e,...t)=>{let[n,r]=t.length===1?[void 0,t[0]]:[t[0],t[1]],o=Object.create(O0);return o._tag="Loop",o.initialState=e,o.render=r.render,o.process=r.process,o.clear=r.clear,o.events=n,o},$$=e=>{let t={initial:new globalThis.Date,dateMask:"YYYY-MM-DD HH:mm:ss",validate:b,...e,locales:{...rY,...e.locales}},n=iY(t.dateMask,t.initial,t.locales),r=n.findIndex(s=>!s.isToken()),o={dateParts:n,typed:"",cursor:r,value:t.initial,error:A()};return ki(o,{render:oY(t),process:sY(t),clear:GQ(t)})};var MQ=h(2,(e,t)=>{let n=Object.create(O0);return n._tag="OnSuccess",n.prompt=e,n.onSuccess=t,n}),L$=e=>{let t={default:0,min:globalThis.Number.NEGATIVE_INFINITY,max:globalThis.Number.POSITIVE_INFINITY,incrementBy:1,decrementBy:1,precision:2,validate:o=>o<t.min?I(`${o} must be greater than or equal to ${t.min}`):o>t.max?I(`${o} must be less than or equal to ${t.max}`):b(o),...e},n=e.default===void 0?"":`${t.default}`,r={cursor:n.length,value:n,error:A()};return ki(r,{render:mY(t),process:hY(t),clear:W$(t)})};var T0=e=>{let t={default:0,min:globalThis.Number.NEGATIVE_INFINITY,max:globalThis.Number.POSITIVE_INFINITY,incrementBy:1,decrementBy:1,validate:o=>o<t.min?I(`${o} must be greater than or equal to ${t.min}`):o>t.max?I(`${o} must be less than or equal to ${t.max}`):b(o),...e},n=e.default===void 0?"":`${t.default}`,r={cursor:n.length,value:n,error:A()};return ki(r,{render:dY(t),process:pY(t),clear:W$(t)})};var NQ=h(2,(e,t)=>MQ(e,n=>UQ(t(n)))),B$=e=>X$(e,"password").pipe(NQ(_r)),pn=B(function*(e){let t=yield*Br,n=yield*t.readInput;return yield*m0(e,t,n)},kt(()=>new Ou({})),zs),DQ=e=>{let t=0,n=-1;for(let r=0;r<e.length;r++)if(e[r].selected===!0){if(n!==-1)throw new Error("InvalidArgumentException: only a single choice can be selected by default for Prompt.Select");n=r}return n!==-1&&(t=n),t},A0=e=>{let t={maxPerPage:10,...e},n=DQ(t.choices);return ki(n,{render:wY(t),process:IY(t),clear:kY(t)})};var UQ=e=>{let t=Object.create(O0);return t._tag="Succeed",t.value=e,t},j$=e=>X$(e,"text"),z$=e=>{let t={initial:!1,active:"on",inactive:"off",...e};return ki(t.initial,{render:zY(t),process:qY,clear:()=>LY(t)})},O0={...to({label:"Prompt",evaluate(){return pn(this)}}),[N$]:{_Output:e=>e}};var m0=(e,t,n)=>ke(()=>{let r=e;switch(r._tag){case"Loop":return $Q(r,t,n);case"OnSuccess":return q(m0(r.prompt,t,n),o=>m0(r.onSuccess(o),t,n));case"Succeed":return b(r.value)}}),$Q=B(function*(e,t,n){let r=Sn(e.initialState)?yield*e.initialState:e.initialState,o=j.NextFrame({state:r}),s="";for(;;){let a=yield*e.render(r,o);if(yield*po(t.display(s+a)),s="",e.events){let i=es(n).pipe(ne(u=>({_tag:"Input",input:u}))),c=yield*za(i,es(e.events).pipe(ne(u=>({_tag:"Event",value:u}))));o=yield*e.process(c,r)}else{let i=yield*es(n);o=yield*e.process(i,r)}switch(o._tag){case"Beep":continue;case"NextFrame":{s=yield*e.clear(r,o),r=o.state;continue}case"Submit":{s=yield*e.clear(r,o);let i=yield*e.render(r,o);return yield*po(t.display(s+i)),o.value}}}},(e,t,n)=>kc(e,po(n.display(w$)))),j=bC(),Mu=(e,t)=>{if(t===0)return ra+I$(0);let n=0,r=e.split(Ci);for(let o of r)n+=1+Math.floor(Math.max(o.length-1,0)/t);return A$(n)},LQ=(e,t)=>{let n=e.split(Ci);return t===0?n.length:Wr(At(n,r=>Math.ceil(r.length/t)),Vi(0,(r,o)=>r+o))},_0=(e,t,n)=>n!==void 0&&n.length>0?C$(LQ(n,t))+Mu(`
${n}`,t)+Mu(e,t):Mu(e,t),Ii="\x07",Ci=/\r?\n/,BQ=e=>B(function*(t,n){let o=yield*(yield*Br).columns,s=yield*Gt(e),a=t.value?e.placeholder.defaultConfirm:e.placeholder.defaultDeny,i=P0(a,s.prefix,s.pointerSmall,e,{plain:!0}),c=Mu(i,o),u=ra+"\x1B[G";return c+u}),P0=(e,t,n,r,o)=>Ti(e,r.message,t,n,o),jQ=B(function*(e,t){let n=yield*Gt(t),r=De(n.prefix,n.primaryColor),o=De(n.pointerSmall,n.mutedColor),s=e.value?t.placeholder.defaultConfirm:t.placeholder.defaultDeny,a=Ye(s,n.mutedColor),i=P0(a,r,o,t);return Od+i}),zQ=B(function*(e,t){let n=yield*Gt(t),r=De(n.tick,n.successColor),o=De(n.ellipsis,n.mutedColor),s=e?t.label.confirm:t.label.deny;return P0(s,r,o,t)+`
`}),qQ=e=>(t,n)=>j.$match(n,{Beep:()=>b(Ii),NextFrame:({state:r})=>jQ(r,e),Submit:({value:r})=>zQ(r,e)}),WQ=/^y|t$/,HQ=/^n|f$/,VQ=(e,t)=>{let n=gt(e.input,()=>"");return e.key.name==="enter"||e.key.name==="return"?b(j.Submit({value:t})):WQ.test(n.toLowerCase())?b(j.Submit({value:!0})):HQ.test(n.toLowerCase())?b(j.Submit({value:!1})):b(j.Beep())},GQ=e=>B(function*(t,n){let o=yield*(yield*Br).columns,s=yield*Gt(e),a=ra+"\x1B[G",i=Vi(t.dateParts,"",(f,d)=>f+d.toString()),c=F0(s.prefix,s.pointerSmall,i,e,{plain:!0}),u=$e(t.error)?ml(t.error.value.split(Ci),{onEmpty:()=>"",onNonEmpty:f=>oa(s.pointerSmall,f.join(`
`))}):"";return _0(c,o,u)+a}),KQ=(e,t,n)=>{if($e(e.error)){let r=e.error.value.split(Ci);if(_s(r)){let o=De(t,n.errorColor),s=At(r,a=>I0(a,n.errorColor));return`\x1B[s
`+oa(o,s.join(`
`))+"\x1B[u"}}return""},q$=(e,t,n=!1)=>Vi(e.dateParts,"",(r,o,s)=>{let a=o.toString();if(s===e.cursor&&!n){let i=Fo(vi,t.primaryColor);return r+Ye(a,i)}return r+a}),F0=(e,t,n,r,o)=>Ti(n,r.message,e,t,o),JQ=B(function*(e,t){let n=yield*Gt(t),r=De(n.prefix,n.primaryColor),o=De(n.pointerSmall,n.mutedColor),s=q$(e,n),a=F0(r,o,s,t),i=KQ(e,n.pointerSmall,n);return Od+a+i}),ZQ=B(function*(e,t){let n=yield*Gt(t),r=De(n.tick,n.successColor),o=De(n.ellipsis,n.mutedColor),s=q$(e,n,!0);return F0(r,o,s,t)+`
`}),QQ=e=>(e.dateParts[e.cursor].increment(),j.NextFrame({state:{...e,typed:""}})),YQ=e=>(e.dateParts[e.cursor].decrement(),j.NextFrame({state:{...e,typed:""}})),XQ=e=>{let t=e.dateParts[e.cursor].previousPart();return $e(t)?j.NextFrame({state:{...e,typed:"",cursor:e.dateParts.indexOf(t.value)}}):j.Beep()},eY=e=>{let t=e.dateParts[e.cursor].nextPart();return $e(t)?j.NextFrame({state:{...e,typed:"",cursor:e.dateParts.indexOf(t.value)}}):j.Beep()},tY=e=>{let t=e.dateParts[e.cursor].nextPart(),n=_e(t,{onNone:()=>e.dateParts.findIndex(r=>!r.isToken()),onSome:r=>e.dateParts.indexOf(r)});return j.NextFrame({state:{...e,typed:"",cursor:n}})},nY=(e,t)=>{if(/\d/.test(e)){let n=t.typed+e;return t.dateParts[t.cursor].setValue(n),j.NextFrame({state:{...t,typed:n}})}return j.Beep()},rY={months:["January","February","March","April","May","June","July","August","September","October","November","December"],monthsShort:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],weekdays:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],weekdaysShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]},oY=e=>(t,n)=>j.$match(n,{Beep:()=>b(Ii),NextFrame:({state:r})=>JQ(r,e),Submit:()=>ZQ(t,e)}),sY=e=>(t,n)=>{switch(t.key.name){case"left":return b(XQ(n));case"right":return b(eY(n));case"k":case"up":return b(QQ(n));case"j":case"down":return b(YQ(n));case"tab":return b(tY(n));case"enter":case"return":return js(e.validate(n.value),{onFailure:r=>j.NextFrame({state:{...n,error:R(r)}}),onSuccess:r=>j.Submit({value:r})});default:return b(nY(gt(t.input,()=>""),n))}},aY=/\\(.)|"((?:\\["\\]|[^"])+)"|(D[Do]?|d{3,4}|d)|(M{1,4})|(YY(?:YY)?)|([aA])|([Hh]{1,2})|(m{1,2})|(s{1,2})|(S{1,4})|./g,_$={1:({token:e,...t})=>new Hg({token:e.replace(/\\(.)/g,"$1"),...t}),2:e=>new b0(e),3:e=>new S0(e),4:e=>new E0(e),5:e=>new v0(e),6:e=>new y0(e),7:e=>new x0(e),8:e=>new g0(e),9:e=>new h0(e)},iY=(e,t,n)=>{let r=[],o=null;for(;o=aY.exec(e);){let a=o.shift(),i=o.findIndex(c=>c!==void 0);if(i in _$){let c=o[i]||a;r.push(_$[i]({token:c,date:t,parts:r,locales:n}))}else r.push(new Hg({token:o[i]||a,date:t,parts:r,locales:n}))}let s=r.reduce((a,i)=>{let c=a[a.length-1];return i.isToken()&&c!==void 0&&c.isToken()?c.setValue(i.token):a.push(i),a},wa());return r.splice(0,r.length,...s),r},jr=class{token;date;parts;locales;constructor(t){this.token=t.token,this.locales=t.locales,this.date=t.date||new globalThis.Date,this.parts=t.parts||[this]}isToken(){return!1}nextPart(){let t=gt(yp(this.parts,n=>n===this),()=>0);return hl(this.parts.slice(t+1),n=>!n.isToken())}previousPart(){let t=yp(this.parts,n=>n===this);return $e(t)?bp(this.parts.slice(0,t.value),n=>!n.isToken()):A()}toString(){return globalThis.String(this.date)}},Hg=class extends jr{increment(){}decrement(){}setValue(t){this.token=this.token+t}isToken(){return!0}toString(){return this.token}},h0=class extends jr{increment(){this.date.setMilliseconds(this.date.getMilliseconds()+1)}decrement(){this.date.setMilliseconds(this.date.getMilliseconds()-1)}setValue(t){this.date.setMilliseconds(globalThis.Number.parseInt(t.slice(-this.token.length)))}toString(){return`${this.date.getMilliseconds()}`.padStart(4,"0").substring(0,this.token.length)}},g0=class extends jr{increment(){this.date.setSeconds(this.date.getSeconds()+1)}decrement(){this.date.setSeconds(this.date.getSeconds()-1)}setValue(t){this.date.setSeconds(globalThis.Number.parseInt(t.slice(-2)))}toString(){let t=`${this.date.getSeconds()}`;return this.token.length>1?t.padStart(2,"0"):t}},x0=class extends jr{increment(){this.date.setMinutes(this.date.getMinutes()+1)}decrement(){this.date.setMinutes(this.date.getMinutes()-1)}setValue(t){this.date.setMinutes(globalThis.Number.parseInt(t.slice(-2)))}toString(){let t=`${this.date.getMinutes()}`;return this.token.length>1?t.padStart(2,"0"):t}},y0=class extends jr{increment(){this.date.setHours(this.date.getHours()+1)}decrement(){this.date.setHours(this.date.getHours()-1)}setValue(t){this.date.setHours(globalThis.Number.parseInt(t.slice(-2)))}toString(){let t=/h/.test(this.token)?this.date.getHours()%12||12:this.date.getHours();return this.token.length>1?`${t}`.padStart(2,"0"):`${t}`}},b0=class extends jr{increment(){this.date.setDate(this.date.getDate()+1)}decrement(){this.date.setDate(this.date.getDate()-1)}setValue(t){this.date.setDate(globalThis.Number.parseInt(t.slice(-2)))}toString(){let t=this.date.getDate(),n=this.date.getDay();switch(this.token){case"DD":return`${t}`.padStart(2,"0");case"Do":return`${t}${this.ordinalIndicator(t)}`;case"d":return`${n+1}`;case"ddd":return this.locales.weekdaysShort[n];case"dddd":return this.locales.weekdays[n];default:return`${t}`}}ordinalIndicator(t){if(t>=11&&t<=13)return"th";switch(t%10){case 1:return"st";case 2:return"nd";case 3:return"rd";default:return"th"}}},S0=class extends jr{increment(){this.date.setMonth(this.date.getMonth()+1)}decrement(){this.date.setMonth(this.date.getMonth()-1)}setValue(t){let n=globalThis.Number.parseInt(t.slice(-2))-1;this.date.setMonth(n<0?0:n)}toString(){let t=this.date.getMonth();switch(this.token.length){case 2:return`${t+1}`.padStart(2,"0");case 3:return this.locales.monthsShort[t];case 4:return this.locales.months[t];default:return`${t+1}`}}},E0=class extends jr{increment(){this.date.setFullYear(this.date.getFullYear()+1)}decrement(){this.date.setFullYear(this.date.getFullYear()-1)}setValue(t){this.date.setFullYear(globalThis.Number.parseInt(t.slice(-4)))}toString(){let t=`${this.date.getFullYear()}`.padStart(4,"0");return this.token.length===2?t.slice(-2):t}},v0=class extends jr{increment(){this.date.setHours((this.date.getHours()+12)%24)}decrement(){this.increment()}setValue(t){}toString(){let t=this.date.getHours()>=12?"pm":"am";return/A/.test(this.token)?t.toUpperCase():t}};var Ti=(e,t,n,r,o)=>{let s=n.length===0?"":n+" ",a=c=>{let u=s+c;return r.length>0&&(u+=" "+r),e.length>0?u+=" "+e:r.length>0&&(u+=" "),u},i=o?.plain===!0?c=>c:FQ;return ml(t.split(Ci),{onEmpty:()=>a(""),onNonEmpty:c=>{let u=At(c,l=>i(l));return a(u.join(`
`))}})};var cY=(e,t,n,r)=>{if(!e.disabled&&e.description&&t){let o=n.descriptionSeparator+e.description;return r?.plain===!0?o:Ye(o,n.mutedColor)}return""};var W$=e=>B(function*(t,n){let o=yield*(yield*Br).columns,s=yield*Gt(e),a=ra+"\x1B[G",i=H$(t,s.pointerSmall,s,{plain:!0}),c=R0(t,s.prefix,s.pointerSmall,e,s,{plain:!0});return _0(c,o,i)+a}),uY=(e,t,n,r)=>{let o=e.value===""?"":`${e.value}`;if(t||r?.plain===!0)return o;let s=$e(e.error)?n.errorColor:Fo(vi,n.primaryColor);return Ye(o,s)},H$=(e,t,n,r)=>$e(e.error)?ml(e.error.value.split(Ci),{onEmpty:()=>"",onNonEmpty:o=>{if(r?.plain===!0)return oa(t,o.join(`
`));let s=De(t,n.errorColor),a=At(o,i=>I0(i,n.errorColor));return`\x1B[s
`+oa(s,a.join(`
`))+"\x1B[u"}}):"",R0=(e,t,n,r,o,s,a=!1)=>{let i=uY(e,a,o,s);return Ti(i,r.message,t,n,s)},V$=B(function*(e,t){let n=yield*Gt(t),r=De(n.prefix,n.primaryColor),o=De(n.pointerSmall,n.mutedColor),s=H$(e,n.pointerSmall,n);return R0(e,r,o,t,n)+s}),G$=B(function*(e,t){let n=yield*Gt(t),r=De(n.tick,n.successColor),o=De(n.ellipsis,n.mutedColor);return R0(e,r,o,t,n,void 0,!0)+`
`}),K$=e=>{if(e.value.length<=0)return b(j.Beep());let t=e.value.slice(0,e.value.length-1);return b(j.NextFrame({state:{...e,value:t,error:A()}}))},J$=e=>b(j.NextFrame({state:{...e,cursor:0,value:"",error:A()}})),lY=(e,t)=>{if(t.value.length===0&&e==="-")return b(j.NextFrame({state:{...t,value:"-",error:A()}}));let n=globalThis.Number.parseInt(t.value+e);return globalThis.Number.isNaN(n)?b(j.Beep()):b(j.NextFrame({state:{...t,value:`${n}`,error:A()}}))},fY=(e,t)=>{if(e==="."&&t.value.includes("."))return b(j.Beep());if(t.value.length===0&&e==="-")return b(j.NextFrame({state:{...t,value:"-",error:A()}}));let n=globalThis.Number.parseFloat(t.value+e);return globalThis.Number.isNaN(n)?b(j.Beep()):b(j.NextFrame({state:{...t,value:e==="."?`${n}.`:t.value.includes(".")&&/^\d$/.test(e)?t.value+e:`${n}`,error:A()}}))},dY=e=>(t,n)=>j.$match(n,{Beep:()=>b(Ii),NextFrame:({state:r})=>V$(r,e),Submit:()=>G$(t,e)}),pY=e=>(t,n)=>{if(t.key.ctrl&&t.key.name==="u")return J$(n);switch(t.key.name){case"backspace":return K$(n);case"k":case"up":return b(j.NextFrame({state:{...n,value:n.value===""||n.value==="-"?`${e.incrementBy}`:`${globalThis.Number.parseInt(n.value)+e.incrementBy}`,error:A()}}));case"j":case"down":return b(j.NextFrame({state:{...n,value:n.value===""||n.value==="-"?`-${e.decrementBy}`:`${globalThis.Number.parseInt(n.value)-e.decrementBy}`,error:A()}}));case"enter":case"return":{let r=globalThis.Number.parseInt(n.value);return globalThis.Number.isNaN(r)?b(j.NextFrame({state:{...n,error:R("Must provide an integer value")}})):js(e.validate(r),{onFailure:o=>j.NextFrame({state:{...n,error:R(o)}}),onSuccess:o=>j.Submit({value:o})})}default:return lY(gt(t.input,()=>""),n)}},mY=e=>(t,n)=>j.$match(n,{Beep:()=>b(Ii),NextFrame:({state:r})=>V$(r,e),Submit:()=>G$(t,e)}),hY=e=>(t,n)=>{if(t.key.ctrl&&t.key.name==="u")return J$(n);switch(t.key.name){case"backspace":return K$(n);case"k":case"up":return b(j.NextFrame({state:{...n,value:n.value===""||n.value==="-"?`${e.incrementBy}`:`${globalThis.Number.parseFloat(n.value)+e.incrementBy}`,error:A()}}));case"j":case"down":return b(j.NextFrame({state:{...n,value:n.value===""||n.value==="-"?`-${e.decrementBy}`:`${globalThis.Number.parseFloat(n.value)-e.decrementBy}`,error:A()}}));case"enter":case"return":{let r=globalThis.Number.parseFloat(n.value);return globalThis.Number.isNaN(r)?b(j.NextFrame({state:{...n,error:R("Must provide a floating point value")}})):q(pe(()=>o_(r,e.precision)),o=>js(e.validate(o),{onFailure:s=>j.NextFrame({state:{...n,error:R(s)}}),onSuccess:s=>j.Submit({value:s})}))}default:return fY(gt(t.input,()=>""),n)}};var M0=(e,t,n,r)=>n.message===void 0?void 0:Ti("",n.message,e,t,r),Z$=(e,t)=>e===void 0?t:e+`
`+t;var gY=(e,t,n,r,o,s)=>{let a=RQ(o,r===n.startIndex&&n.startIndex>0,r===n.endIndex-1&&n.endIndex<t.length);if(s?.plain===!0)return e===r?o.pointer+a:a+" ".repeat(o.pointer.length);if(t[r].disabled){let i=Fo(gs,o.mutedColor);return e===r?De(o.pointer,i)+a:a+" ".repeat(o.pointer.length)}return e===r?De(o.pointer,o.primaryColor)+a:a+" ".repeat(o.pointer.length)};var xY=(e,t,n,r)=>{if(r?.plain===!0)return e.title;let o=e.title;return t?e.disabled?Ye(o,Fo(vi,n.mutedColor)):Ye(o,Fo(vi,n.primaryColor)):e.disabled?Ye(o,Fo(v$,n.mutedColor)):o},Q$=(e,t,n,r)=>{let o=t.choices,s=WY(e,o.length,t.maxPerPage),a=[];for(let i=s.startIndex;i<s.endIndex;i++){let c=o[i],u=e===i,l=gY(e,o,s,i,n,r),f=xY(c,u,n,r),d=cY(c,u,n,r);a.push(l+f+" "+d)}return a.join(`
`)};var yY=B(function*(e,t){let n=yield*Gt(t),r=Q$(e,t,n),o=De(n.prefix,n.primaryColor),s=De(n.pointerSmall,n.mutedColor),a=M0(o,s,t);return Od+Z$(a,r)});var bY=B(function*(e,t){let n=yield*Gt(t),r=t.choices[e].title,o=De(n.tick,n.successColor),s=De(n.ellipsis,n.mutedColor);return(M0(o,s,t)??o)+" "+Ye(r,n.submittedColor)+`
`});var SY=(e,t)=>e===0?b(j.NextFrame({state:t.length-1})):b(j.NextFrame({state:e-1})),EY=(e,t)=>e===t.length-1?b(j.NextFrame({state:0})):b(j.NextFrame({state:e+1})),vY=(e,t)=>b(j.NextFrame({state:(e+1)%t.length}));var wY=e=>(t,n)=>j.$match(n,{Beep:()=>b(Ii),NextFrame:({state:r})=>yY(r,e),Submit:()=>bY(t,e)});var kY=e=>B(function*(t,n){let o=yield*(yield*Br).columns,s=yield*Gt(e),a=ra+"\x1B[G",i=M0(s.prefix,s.pointerSmall,e,{plain:!0}),c=Q$(t,e,s,{plain:!0});return Mu(Z$(i,c),o)+a});var IY=e=>(t,n)=>{switch(t.key.name){case"k":case"up":return SY(n,e.choices);case"j":case"down":return EY(n,e.choices);case"tab":return vY(n,e.choices);case"enter":case"return":{let r=e.choices[n];return r.disabled?b(j.Beep()):b(j.Submit({value:r.value}))}default:return b(j.Beep())}};var CY=B(function*(e,t){let r=yield*(yield*Br).columns,o=yield*Gt(t),s=ra+"\x1B[G",a=Y$(e,o.pointerSmall,o,{plain:!0});return _0(N0(e,o.prefix,o.pointerSmall,t,o,{plain:!0}),r,a)+s}),TY=(e,t,n,r,o)=>{let s=e.value;if(o?.plain===!0)switch(t.type){case"hidden":return"";case"password":return n.passwordMask.repeat(s.length);case"text":return s}if(s.length===0)return"";let a=$e(e.error)?n.errorColor:r?n.submittedColor:Fo(vi,n.primaryColor);switch(t.type){case"hidden":return"";case"password":return De(n.passwordMask.repeat(s.length),a);case"text":return Ye(s,a)}},Y$=(e,t,n,r)=>$e(e.error)?ml(e.error.value.split(Ci),{onEmpty:()=>"",onNonEmpty:o=>{if(r?.plain===!0)return oa(t,o.join(`
`));let s=De(t,n.errorColor),a=At(o,i=>I0(i,n.errorColor));return`\x1B[s
`+oa(s,a.join(`
`))+"\x1B[u"}}):"",N0=(e,t,n,r,o,s,a=!1)=>{let i=TY(e,r,o,a,s);return Ti(i,r.message,t,n,s)},AY=B(function*(e,t){let n=yield*Gt(t),r=De(n.prefix,n.primaryColor),o=De(n.pointerSmall,n.mutedColor),s=N0(e,r,o,t,n),a=Y$(e,n.pointerSmall,n),i=t.type==="password"?n.passwordMask.length:1,c=(e.cursor-e.value.length)*i;return s+a+T$(c)}),OY=B(function*(e,t){let n=yield*Gt(t),r=De(n.tick,n.successColor),o=De(n.ellipsis,n.mutedColor);return N0(e,r,o,t,n,void 0,!0)+`
`}),_Y=e=>{if(e.cursor<=0)return b(j.Beep());let t=e.value.slice(0,e.cursor-1),n=e.value.slice(e.cursor),r=e.cursor-1,o=`${t}${n}`;return b(j.NextFrame({state:{...e,cursor:r,value:o,error:A()}}))},PY=e=>b(j.NextFrame({state:{...e,cursor:0,value:"",error:A()}})),FY=e=>{if(e.cursor<=0)return b(j.Beep());let t=e.cursor-1;return b(j.NextFrame({state:{...e,cursor:t,error:A()}}))},RY=e=>{if(e.cursor>=e.value.length)return b(j.Beep());let t=Math.min(e.cursor+1,e.value.length);return b(j.NextFrame({state:{...e,cursor:t,error:A()}}))},P$=e=>b(j.NextFrame({state:{...e,cursor:0,error:A()}})),F$=e=>b(j.NextFrame({state:{...e,cursor:e.value.length,error:A()}})),MY=(e,t)=>{if(e.value===t.default)return b(j.Beep());let n=e.value.length===0?t.default:e.value;return b(j.NextFrame({state:{...e,value:n,cursor:n.length,error:A()}}))},NY=(e,t)=>{let n=t.value.slice(0,t.cursor),r=t.value.slice(t.cursor),o=`${n}${e}${r}`,s=t.cursor+e.length;return b(j.NextFrame({state:{...t,cursor:s,value:o,error:A()}}))},DY=e=>(t,n)=>j.$match(n,{Beep:()=>b(Ii),NextFrame:({state:r})=>AY(r,e),Submit:()=>OY(t,e)}),UY=e=>(t,n)=>{if(t.key.ctrl)switch(t.key.name){case"u":return PY(n);case"a":return P$(n);case"e":return F$(n);default:return b(j.Beep())}switch(t.key.name){case"backspace":return _Y(n);case"left":return FY(n);case"right":return RY(n);case"home":return P$(n);case"end":return F$(n);case"enter":case"return":{let r=n.value;return js(e.validate(r),{onFailure:o=>j.NextFrame({state:{...n,value:r,error:R(o)}}),onSuccess:o=>j.Submit({value:o})})}case"tab":return MY(n,e);default:return NY(gt(t.input,()=>""),n)}},$Y=e=>(t,n)=>CY(t,e),X$=(e,t)=>{let n={default:"",type:t,validate:b,...e},r={cursor:n.default.length,value:n.default,error:A()};return ki(r,{render:DY(n),process:UY(n),clear:$Y(n)})},LY=B(function*(e){let n=yield*(yield*Br).columns,r=yield*Gt(e),o=ra+"\x1B[G",s=e.active+" "+oa(r.toggleSeparator,e.inactive),a=Ti(s,e.message,r.prefix,r.pointerSmall,{plain:!0});return Mu(a,n)+o}),eL=(e,t,n,r=!1)=>{let o=De(n.toggleSeparator,n.mutedColor),s=Fo(vi,r?n.submittedColor:n.primaryColor),a=e?t.inactive:Ye(t.inactive,s);return(e?Ye(t.active,s):t.active)+" "+oa(o,a)},tL=(e,t,n,r)=>Ti(e,r.message,t,n),BY=B(function*(e,t){let n=yield*Gt(t),r=De(n.prefix,n.primaryColor),o=De(n.pointerSmall,n.mutedColor),s=eL(e,t,n),a=tL(s,r,o,t);return Od+a}),jY=B(function*(e,t){let n=yield*Gt(t),r=De(n.tick,n.successColor),o=De(n.ellipsis,n.mutedColor),s=eL(e,t,n,!0);return tL(s,r,o,t)+`
`}),R$=b(j.NextFrame({state:!0})),M$=b(j.NextFrame({state:!1})),zY=e=>(t,n)=>{switch(n._tag){case"Beep":return b(Ii);case"NextFrame":return BY(t,e);case"Submit":return jY(t,e)}},qY=(e,t)=>{switch(e.key.name){case"0":case"j":case"delete":case"right":case"down":return M$;case"1":case"k":case"left":case"up":return R$;case" ":case"tab":return t?M$:R$;case"enter":case"return":return b(j.Submit({value:t}));default:return b(j.Beep())}},WY=(e,t,n)=>{let r=n===void 0?t:n,o=Math.min(t-r,e-Math.floor(r/2));o<0&&(o=0);let s=Math.min(o+r,t);return{startIndex:o,endIndex:s}};var nL="~effect/cli/Param",Kt="argument",xs="flag",Pd={[nL]:{_A:F},pipe(){return re(this,arguments)}},Gg=e=>_(e,nL);var Oi=e=>e.kind==="flag",xn=e=>{let t=n=>e.kind===Kt?VY(e.name,e.primitiveType,n):GY(e.name,e.primitiveType,n);return Object.setPrototypeOf({_tag:"Single",...e,description:e.description??A(),aliases:e.aliases??[],hidden:e.hidden??!1,parse:t},Pd)},D0=(e,t)=>xn({name:t,primitiveType:h$,kind:e}),rL=(e,t)=>xn({name:t,primitiveType:f$,kind:e}),U0=(e,t)=>xn({name:t,primitiveType:p$,kind:e}),$0=(e,t)=>xn({name:t,primitiveType:d$,kind:e}),L0=(e,t)=>xn({name:t,primitiveType:m$,kind:e}),Fd=(e,t,n)=>xn({name:t,primitiveType:g$(n),kind:e}),Kg=(e,t,n)=>{let r=n.map(o=>[o,o]);return Fd(e,t,r)},Rd=(e,t,n)=>xn({name:t,kind:e,primitiveType:x$(n?.pathType??"either",n?.mustExist),typeName:n?.typeName}),B0=(e,t,n)=>Rd(e,t,{pathType:"directory",typeName:"directory",mustExist:n?.mustExist}),j0=(e,t,n)=>Rd(e,t,{pathType:"file",typeName:"file",mustExist:n?.mustExist}),z0=(e,t)=>xn({name:t,primitiveType:y$,kind:e}),q0=(e,t)=>xn({name:t,primitiveType:f0,kind:e}),W0=(e,t,n)=>xn({name:t,primitiveType:d0(n),kind:e}),H0=(e,t,n,r)=>xn({name:t,primitiveType:b$(n,r),kind:e});var V0=e=>xn({name:"__never__",primitiveType:S$,kind:e}),HY=/^-+/,oL=h(2,(e,t)=>sa(e,n=>xn({...n,aliases:[...n.aliases,t.replace(HY,"")]}))),Jg=h(2,(e,t)=>sa(e,n=>xn({...n,description:R(t)})));var Du=h(2,(e,t)=>{let n=r=>ne(e.parse(r),([o,s])=>[o,t(s)]);return Object.assign(Object.create(Pd),{_tag:"Map",kind:e.kind,param:e,f:t,parse:n})}),_i=(e,t,n=[])=>{let r=n.map(o=>()=>o().parse);return Object.assign(Object.create(Pd),{_tag:"Transform",kind:e.kind,param:e,alternatives:n,f:t,parse:t(e.parse,r)})},Uu=h(2,(e,t)=>_i(e,n=>r=>q(n(r),([o,s])=>t(s).pipe(ne(a=>[o,a]))))),G0=h(3,(e,t,n)=>{let r=Lu(e);return _i(e,o=>s=>q(o(s),([a,i])=>lt({try:()=>t(i),catch:c=>n(c)}).pipe(kt(c=>new dn({option:r.name,value:globalThis.String(i),expected:c,kind:r.kind})),ne(c=>[a,c]))))}),Ai=e=>{let t=n=>e.parse(n).pipe(ne(([r,o])=>[r,R(o)]),rS({MissingOption:()=>b([n.arguments,A()]),MissingArgument:()=>b([n.arguments,A()])}));return Object.assign(Object.create(Pd),{_tag:"Optional",kind:e.kind,param:e,parse:t})},Zg=h(2,(e,t)=>Sn(t)?Uu(Ai(e),_e({onNone:()=>t,onSome:b})):Du(Ai(e),gt(()=>t))),K0=h(2,(e,t)=>{let n=(o,s)=>new dn({option:o._tag==="MissingOption"?o.option:o.argument,value:"config",expected:s.message,kind:o._tag==="MissingOption"?"flag":"argument"}),r=(o,s)=>dU(t).pipe(kt(a=>n(o,a)),q(_e({onNone:()=>I(o),onSome:a=>b([s.arguments,a])})));return _i(e,o=>s=>o(s).pipe(Jo(["MissingOption","MissingArgument"],a=>r(a,s))))}),J0=h(2,(e,t)=>{let n=(r,o)=>q(D$(t)?b(t):t,pn).pipe(ne(s=>[o.arguments,s]),Jo("QuitError",()=>I(r)));return _i(e,r=>o=>r(o).pipe(Jo(["MissingOption","MissingArgument"],s=>n(s,o))))}),$u=(e,t)=>{let n=Lu(e),r=o=>n.kind==="argument"?KY(e,n,o,t):JY(e,n,o,t);return Object.assign(Object.create(Pd),{_tag:"Variadic",kind:e.kind,param:e,min:Ts(t?.min),max:Ts(t?.max),parse:r})},Z0=h(3,(e,t,n)=>{if(t<0)throw new Error("between: min must be non-negative");if(n<t)throw new Error("between: max must be greater than or equal to min");return $u(e,{min:t,max:n})}),Q0=h(2,(e,t)=>{if(t<0)throw new Error("atMost: max must be non-negative");return $u(e,{max:t})}),Y0=h(2,(e,t)=>{if(t<0)throw new Error("atLeast: min must be non-negative");return $u(e,{min:t})}),Qg=h(3,(e,t,n)=>Uu(e,B(function*(r){let o=t(r);if($e(o))return o.value;let s=Lu(e);return yield*new dn({option:s.name,value:globalThis.String(r),expected:n(r),kind:s.kind})}))),X0=h(3,(e,t,n)=>Qg(e,MI(t),n)),Yg=h(2,(e,t)=>sa(e,n=>xn({...n,typeName:t}))),ek=h(2,(e,t)=>{let n=us(t);return Uu(e,r=>kt(n(r),o=>{let s=Lu(e);return new dn({option:s.name,value:globalThis.String(r),expected:`Schema validation failed: ${o.message}`,kind:s.kind})}))}),tk=h(2,(e,t)=>_i(e,(n,r)=>o=>Er(n(o),()=>r[0]()(o)),[t])),nk=h(2,(e,t)=>_i(e,(n,r)=>o=>Er(ne(n(o),([s,a])=>[s,$(a)]),()=>ne(r[0]()(o),([s,a])=>[s,K(a)])),[t])),VY=B(function*(e,t,n){if(n.arguments.length===0)return yield*new Pu({argument:e});let r=n.arguments[0],o=yield*kt(t.parse(r),s=>new dn({option:e,value:r,expected:s,kind:"argument"}));return[n.arguments.slice(1),o]}),GY=B(function*(e,t,n){let r=n.flags[e];if(r===void 0||r.length===0)return yield*new _u({option:e});let o=r[0],s=yield*kt(t.parse(o),a=>new dn({option:e,value:o,expected:a,kind:"flag"}));return[n.arguments,s]}),KY=B(function*(e,t,n,r){let o=[],s=r?.min??0,a=r?.max??Number.POSITIVE_INFINITY,i=0,c=n.arguments;for(;c.length>0&&i<a;){let[u,l]=yield*e.parse({flags:n.flags,arguments:c});o.push(l),c=u,i++}return i<s?yield*i===0?new Pu({argument:t.name}):new dn({option:t.name,value:`${i} values`,expected:`at least ${s} value${s===1?"":"s"}`,kind:t.kind}):[c,o]}),JY=B(function*(e,t,n,r){let o=[],a=[t.name,...t.aliases].flatMap(c=>n.flags[c]??[]),i=a.length;if(ct(r?.min)&&i<r.min)return yield*i===0?new _u({option:t.name}):new dn({option:t.name,value:`${i} occurrences`,expected:`at least ${r.min} value${r.min===1?"":"s"}`,kind:t.kind});if(ct(r?.max)&&i>r.max)return yield*new dn({option:t.name,value:`${i} occurrences`,expected:`at most ${r.max} value${r.max===1?"":"s"}`,kind:t.kind});for(let c of a){let[,u]=yield*e.parse({flags:{[t.name]:[c]},arguments:[]});o.push(u)}return[n.arguments,o]}),rk=(e,t)=>{let n=e;switch(n._tag){case"Single":return t.Single(n);case"Map":return t.Map(n);case"Transform":return t.Transform(n);case"Optional":return t.Optional(n);case"Variadic":return t.Variadic(n)}},sa=(e,t)=>rk(e,{Single:n=>t(n),Map:n=>Du(sa(n.param,t),n.f),Transform:n=>_i(sa(n.param,t),n.f,n.alternatives.map(r=>()=>sa(r(),t))),Optional:n=>Ai(sa(n.param,t)),Variadic:n=>$u(sa(n.param,t),{min:mn(n.min),max:mn(n.max)})}),Xe=e=>rk(e,{Single:t=>[t],Map:t=>Xe(t.param),Transform:t=>[...Xe(t.param),...t.alternatives.flatMap(n=>Xe(n()))],Optional:t=>Xe(t.param),Variadic:t=>Xe(t.param)}),Lu=e=>{let t=Xe(e);if(t.length===0)throw new Error("No Single param found in param structure");if(t.length>1)throw new Error(`Multiple Single params found: ${t.map(n=>n.name).join(", ")}`);return t[0]},An=e=>rk(e,{Single:()=>({isOptional:!1,isVariadic:!1,variadicMin:A(),variadicMax:A()}),Map:t=>An(t.param),Transform:t=>An(t.param),Optional:t=>({...An(t.param),isOptional:!0}),Variadic:t=>({...An(t.param),isVariadic:!0,variadicMin:t.min,variadicMax:t.max})});var ZY=e=>D0(Kt,e),QY=e=>U0(Kt,e),YY=(e,t)=>j0(Kt,e,t),XY=(e,t)=>B0(Kt,e,t),e9=e=>$0(Kt,e),t9=e=>L0(Kt,e),n9=(e,t)=>Kg(Kt,e,t),r9=(e,t)=>Rd(Kt,e,t),o9=e=>z0(Kt,e),s9=e=>q0(Kt,e),a9=(e,t)=>W0(Kt,e,t),i9=(e,t,n)=>H0(Kt,e,t,n),c9=V0(Kt),u9=e=>Ai(e),l9=h(2,(e,t)=>Jg(e,t)),f9=Zg,d9=h(2,(e,t)=>K0(e,t)),p9=h(2,(e,t)=>J0(e,t)),m9=h(e=>Gg(e[0]),(e,t)=>$u(e,t)),h9=h(2,(e,t)=>Du(e,t)),g9=h(2,(e,t)=>Uu(e,t)),x9=h(3,(e,t,n)=>G0(e,t,n)),y9=h(2,(e,t)=>Y0(e,t)),b9=h(2,(e,t)=>Q0(e,t)),S9=h(3,(e,t,n)=>Z0(e,t,n)),E9=h(2,(e,t)=>ek(e,t)),v9=(e,t)=>Fd(Kt,e,t),w9=h(2,(e,t)=>Yg(e,t)),k9=h(3,(e,t,n)=>X0(e,t,n)),I9=h(3,(e,t,n)=>Qg(e,t,n)),C9=h(2,(e,t)=>tk(e,t)),T9=h(2,(e,t)=>nk(e,t));var Bu=xe("effect/cli/CliOutput",{defaultValue:()=>A9()});var Xg=e=>e.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,t=>`\\x${t.charCodeAt(0).toString(16).padStart(2,"0")}`),A9=e=>{let t=globalThis.process,n=typeof t=="object"&&t!==null,r=e?.colors!==void 0?e.colors:n&&typeof t.stdout=="object"&&t.stdout!==null&&t.stdout.isTTY===!0&&!t.env?.NO_COLOR,o=r?{bold:c=>`\x1B[1m${c}\x1B[0m`,dim:c=>`\x1B[2m${c}\x1B[0m`,cyan:c=>`\x1B[36m${c}\x1B[0m`,green:c=>`\x1B[32m${c}\x1B[0m`,blue:c=>`\x1B[34m${c}\x1B[0m`,yellow:c=>`\x1B[33m${c}\x1B[0m`,magenta:c=>`\x1B[35m${c}\x1B[0m`}:{bold:c=>c,dim:c=>c,cyan:c=>c,green:c=>c,blue:c=>c,yellow:c=>c,magenta:c=>c},s=r?"\x1B[0m":"",a=r?"\x1B[31m":"",i=r?"\x1B[1m":"";return{formatHelpDoc:c=>D9(c,o),formatCliError:c=>Xg(c.message),formatError:c=>`
${i}${a}ERROR${s}
  ${Xg(c.message)}${s}`,formatErrors:c=>{if(c.length===0)return"";if(c.length===1)return`
${i}${a}ERROR${s}
  ${Xg(c[0].message)}${s}`;let u=new Map;for(let f of c){let d=f._tag??"Error",m=u.get(d)??[];m.push(f),u.set(d,m)}let l=[];l.push(`
${i}${a}ERRORS${s}`);for(let[,f]of u)for(let d of f)l.push(`  ${Xg(d.message)}${s}`);return l.join(`
`)},formatVersion:(c,u)=>`${o.bold(c)} ${o.dim("v")}${o.bold(u)}`}},O9=e=>e.replace(/\u001B\[[0-9;]*m/g,""),_9=new Intl.Segmenter(void 0,{granularity:"grapheme"}),P9=/[\p{Mark}\p{Control}\p{Default_Ignorable_Code_Point}]/gu,F9=new RegExp("\\p{Emoji_Presentation}","u"),R9=e=>e<4352?!1:e<=4447||e===9001||e===9002||e>=11904&&e<=12350||e>=12352&&e<=42191||e>=44032&&e<=55203||e>=63744&&e<=64255||e>=65040&&e<=65049||e>=65072&&e<=65135||e>=65280&&e<=65376||e>=65504&&e<=65510||e>=110592&&e<=111359||e>=127488&&e<=127569||e>=131072&&e<=262141,M9=e=>{let t=e.replace(P9,"");return t.length===0?0:F9.test(e)||e.includes("\uFE0F")||R9(t.codePointAt(0))?2:1},ok=e=>{let t=0;for(let{segment:n}of _9.segment(O9(e)))t+=M9(n);return t},N9=(e,t)=>{let n=ok(e),r=Math.max(0,t-n);return e+" ".repeat(r)},Md=(e,t)=>{let n=Math.max(...e.map(o=>ok(o.left)))+4,r=t===void 0?n:Math.min(n,t);return e.map(({left:o,right:s})=>`  ${N9(o,Math.max(r,ok(o)+1))}${s}`).join(`
`)},sL=(e,t)=>t?`${e}, ${t}`:e,D9=(e,t)=>{let n=[];if(e.description&&(n.push(t.bold("DESCRIPTION")),n.push(`  ${e.description}`),n.push("")),n.push(t.bold("USAGE")),n.push(`  ${t.cyan(e.usage)}`),n.push(""),e.args&&e.args.length>0){n.push(t.bold("ARGUMENTS"));let r=e.args.map(o=>{let s=o.name;o.variadic&&(s+="...");let a=t.green(s),i=t.dim(o.type),c=`${a} ${i}`,u=o.required?"":t.dim(" (optional)"),l=gt(o.description,()=>"")+u;return{left:c,right:l}});n.push(Md(r,25)),n.push("")}if(e.flags.length>0){n.push(t.bold("FLAGS"));let r=e.flags.map(o=>{let s=[];s.push(t.green(`--${o.name}`));for(let c of o.aliases)s.push(t.green(c));let a=s.join(", "),i=o.type!=="boolean"?` ${t.dim(o.type)}`:"";return{left:a+i,right:gt(o.description,()=>"")}});n.push(Md(r)),n.push("")}if(e.globalFlags&&e.globalFlags.length>0){n.push(t.bold("GLOBAL FLAGS"));let r=e.globalFlags.map(o=>{let s=[];s.push(t.green(`--${o.name}`));for(let c of o.aliases)s.push(t.green(c));let a=s.join(", "),i=o.type!=="boolean"?` ${t.dim(o.type)}`:"";return{left:a+i,right:gt(o.description,()=>"")}});n.push(Md(r)),n.push("")}if(e.subcommands&&e.subcommands.length>0){let r=e.subcommands.find(o=>o.group===void 0);r&&(n.push(t.bold("SUBCOMMANDS")),n.push(Md(r.commands.map(o=>({left:t.cyan(sL(o.name,o.alias)),right:o.shortDescription??o.description})),20)),e.subcommands.length>1&&n.push(""));for(let o of e.subcommands)o.group!==void 0&&(n.push(t.bold(`${o.group}:`)),n.push(Md(o.commands.map(s=>({left:t.cyan(sL(s.name,s.alias)),right:s.shortDescription??s.description})),20)),n.push(""))}if(e.examples&&e.examples.length>0){n.push(t.bold("EXAMPLES"));let r=!0,o=!1;for(let s of e.examples)s.description?(r||n.push(""),n.push(`  ${t.dim(`# ${s.description}`)}`)):o&&n.push(""),n.push(`  ${t.cyan(s.command)}`),r=!1,o=!!s.description;n.push("")}return n[n.length-1]===""&&n.pop(),n.join(`
`)};var Nd=e=>e.replace(/'/g,"'\\''"),ak=e=>e.replace(/[^a-zA-Z0-9_]/g,"_"),ik=e=>{let t=[`--${e.name}`];for(let n of e.aliases)t.push(n.length===1?`-${n}`:`--${n}`);return e.type._tag==="Boolean"&&t.push(`--no-${e.name}`),t},U9=(e,t)=>{if(e.length===0)return;let n=e.map(ik);t.push(`  local ${n.map((r,o)=>`_used_${o}=""`).join(" ")}`),t.push("  for ((i = 1; i < cword; i++)); do"),t.push('    case "${words[i]%%=*}" in'),n.forEach((r,o)=>{t.push(`      ${r.join("|")}) _used_${o}=1 ;;`)}),t.push("    esac"),t.push("  done"),t.push('  local _filtered_flags=""'),n.forEach((r,o)=>{t.push(`  [[ -n "$_used_${o}" ]] || _filtered_flags+=" ${r.join(" ")}"`)}),t.push("")},$9=(e,t)=>{t.push(`${e}()`),t.push("{"),t.push('  local _cur="$1" _word="$2"; shift 2'),t.push(""),t.push('  local _head="${_cur%"$_word"}"'),t.push('  local _open=""'),t.push('  case "$_head" in'),t.push(`    *\\') _open="'" ;;`),t.push(`    *\\") _open='"' ;;`),t.push("  esac"),t.push(""),t.push('  local _prefix="$_cur" _committed="$_head"'),t.push("  _prefix=${_prefix//\\\\/}; _prefix=${_prefix//\\\"/}; _prefix=${_prefix//\\'/}"),t.push("  _committed=${_committed//\\\\/}; _committed=${_committed//\\\"/}; _committed=${_committed//\\'/}"),t.push(""),t.push("  COMPREPLY=()"),t.push("  local _choice _rest _match"),t.push('  for _choice in "$@"; do'),t.push('    [[ "$_choice" == "$_prefix"* ]] || continue'),t.push('    _rest="${_choice#"$_committed"}"'),t.push('    case "$_open" in'),t.push(`      "'")`),t.push(`        if [[ "$_head" == "'" ]]; then`),t.push("          _match=${_rest//\\'/\\'\\\\\\'\\'}"),t.push("        else"),t.push(`          [[ "$_rest" == *\\'* ]] && continue`),t.push('          _match="$_rest"'),t.push("        fi"),t.push("        ;;"),t.push(`      '"')`),t.push('        _match="${_rest//\\\\/\\\\\\\\}"'),t.push('        _match="${_match//\\$/\\\\$}"'),t.push('        _match="${_match//\\`/\\\\\\`}"'),t.push('        _match="${_match//\\"/\\\\\\"}"'),t.push("        ;;"),t.push("      *)"),t.push(`        printf -v _match '%q' "$_rest"`),t.push(`        [[ -z "$_head" && "$_match" == '~'* ]] && _match="\\\\$_match"`),t.push("        ;;"),t.push("    esac"),t.push('    [[ -n "$_open" && "$_match" == *"$_open" ]] && _match+="$_open"'),t.push('    COMPREPLY+=("$_match")'),t.push("  done"),t.push("}"),t.push("")},aL=(e,t)=>`${e} "$cur" "$_comp_word" ${t.map(n=>`'${Nd(n)}'`).join(" ")}`,L9=(e,t)=>{switch(e._tag){case"Boolean":return;case"Choice":return aL(t,e.values);case"Path":return e.pathType==="directory"?'COMPREPLY=( $(compgen -d -- "$cur") )':'COMPREPLY=( $(compgen -f -- "$cur") )';default:return}},B9=(e,t)=>{switch(e._tag){case"Choice":return aL(t,e.values);case"Path":return e.pathType==="directory"?'COMPREPLY=( $(compgen -d -- "$cur") )':'COMPREPLY=( $(compgen -f -- "$cur") )';default:return}},iL=(e,t,n,r)=>{let o=[...t,e.name],s=`_${o.map(ak).join("_")}`;n.push(`${s}()`),n.push("{"),n.push("  local cur prev words cword i"),n.push(t.length===0?"  local _command_index=0":'  local _command_index="$1"'),n.push('  _init_completion -n "$COMP_WORDBREAKS" || return'),t.length===0&&n.push('  local _comp_word="$2"'),n.push("");let a=e.flags.filter(c=>c.type._tag!=="Boolean");if(a.length>0){n.push("  # Flag value completions"),n.push('  case "$prev" in');for(let c of a){let u=[`--${c.name}`];for(let f of c.aliases)u.push(f.length===1?`-${f}`:`--${f}`);let l=L9(c.type,r);l&&(n.push(`    ${u.join("|")})`),n.push(`      ${l}`),n.push("      return"),n.push("      ;;"))}n.push("  esac"),n.push("")}if(e.subcommands.length>0){n.push("  # Subcommand dispatch"),n.push("  local cmd _skip_next=0"),n.push("  for ((i = _command_index + 1; i < cword; i++)); do"),n.push("    if (( _skip_next )); then"),n.push("      _skip_next=0"),n.push("      continue"),n.push("    fi"),n.push('    case "${words[i]}" in');for(let c of e.flags){if(c.type._tag==="Boolean")continue;let u=ik(c);n.push(`      ${u.join("|")}) _skip_next=1 ;;`),n.push(`      ${u.map(l=>`${l}=*`).join("|")}) ;;`)}for(let c of e.subcommands){let u=`_${[...o,c.name].map(ak).join("_")}`;n.push(`      ${c.name})`),n.push(`        ${u} "$i"`),n.push("        return"),n.push("        ;;")}n.push("    esac"),n.push("  done"),n.push("")}U9(e.flags,n),(e.flags.length>0||e.subcommands.length>0)&&(n.push("  # Complete flags (filtered) and subcommands"),n.push('  if [[ "$cur" == -* ]]; then'),e.flags.length>0&&n.push('    COMPREPLY=( $(compgen -W "$_filtered_flags" -- "$cur") )'),n.push("    return"),n.push("  fi"),n.push(""));let i=e.arguments.flatMap((c,u)=>{let l=B9(c.type,r);return l===void 0?[]:[{argument:c,completion:l,index:u}]});if(i.length>0){n.push("  # Positional argument completions"),n.push("  local _position=0 _skip_next=0 _end_of_options=0"),n.push("  for ((i = _command_index + 1; i < cword; i++)); do"),n.push("    if (( _skip_next )); then"),n.push("      _skip_next=0"),n.push("      continue"),n.push("    fi"),n.push("    if (( _end_of_options )); then"),n.push("      ((_position += 1))"),n.push("      continue"),n.push("    fi"),n.push('    case "${words[i]}" in'),n.push("      --) _end_of_options=1 ;;");for(let u of e.flags){let l=ik(u);u.type._tag==="Boolean"?n.push(`      ${l.join("|")}) ;;`):(n.push(`      ${l.join("|")}) _skip_next=1 ;;`),n.push(`      ${l.map(f=>`${f}=*`).join("|")}) ;;`))}n.push("      -*) ;;"),n.push("      *) ((_position += 1)) ;;"),n.push("    esac"),n.push("  done"),n.push('  case "$_position" in');for(let{argument:u,completion:l,index:f}of i)u.variadic||(n.push(`    ${f})`),n.push(`      ${l}`),n.push("      return"),n.push("      ;;"));n.push("  esac");let c=i.find(({argument:u})=>u.variadic);c!==void 0&&(n.push(`  if (( _position >= ${c.index} )); then`),n.push(`    ${c.completion}`),n.push("    return"),n.push("  fi"))}else if(e.subcommands.length>0){let c=e.subcommands.map(u=>u.name);n.push(`  COMPREPLY=( $(compgen -W '${c.join(" ")}' -- "$cur") )`)}n.push("}"),n.push("");for(let c of e.subcommands)iL(c,o,n,r)},cL=(e,t)=>{let n=[],r=ak(e),o=`_${r}--choices`;return n.push(`###-begin-${Nd(e)}-completions-###`),n.push("#"),n.push("# Static completion script for Bash"),n.push("#"),n.push("# Installation:"),n.push(`#   ${Nd(e)} --completions bash >> ~/.bashrc`),n.push("#"),n.push(""),n.push("if ! type _init_completion &>/dev/null; then"),n.push("  _init_completion()"),n.push("  {"),n.push("    COMPREPLY=()"),n.push('    local _i _j=0 _piece _line="$COMP_LINE"'),n.push('    words=("${COMP_WORDS[0]}")'),n.push("    cword=0"),n.push('    _line="${_line#*"${COMP_WORDS[0]}"}"'),n.push("    for ((_i = 1; _i < ${#COMP_WORDS[@]}; _i++)); do"),n.push('      _piece="${COMP_WORDS[_i]}"'),n.push('      if [[ "$_line" == [[:blank:]]* ]]; then'),n.push("        ((_j++))"),n.push('        words[_j]="$_piece"'),n.push("      else"),n.push('        words[_j]="${words[_j]}$_piece"'),n.push("      fi"),n.push("      ((_i == COMP_CWORD)) && cword=$_j"),n.push('      _line="${_line#*"$_piece"}"'),n.push("    done"),n.push('    cur="${words[cword]}"'),n.push('    prev=""'),n.push('    ((cword > 0)) && prev="${words[cword-1]}"'),n.push("    return 0"),n.push("  }"),n.push("fi"),n.push(""),$9(o,n),iL(t,[],n,o),n.push(`complete -F _${r} ${Nd(e)}`),n.push(`###-end-${Nd(e)}-completions-###`),n.join(`
`)};var aa=e=>e.replace(/\\/g,"\\\\").replace(/'/g,"\\'"),uL=e=>aa(e.replace(/[^A-Za-z0-9_.,/@%+-]/gu,"\\$&")),z9=(e,t)=>{if(e.length===0)return t.length>0?"__fish_use_subcommand":"";let n=e.map(r=>`__fish_seen_subcommand_from ${r}`).join("; and ");return t.length>0?`${n}; and not __fish_seen_subcommand_from ${t.join(" ")}`:n},ck=e=>{let t=[];for(let n of e.aliases)n.length===1&&t.push(`-s ${n}`);t.push(e.name);for(let n of e.aliases)n.length>1&&t.push(n);return e.type._tag==="Boolean"&&t.push(`no-${e.name}`),`not __fish_contains_opt ${t.join(" ")}`},q9=e=>{let t=[`--${e.name}`];for(let n of e.aliases)t.push(n.length===1?`-${n}`:`--${n}`);return`begin; ${ck(e)}; or contains -- (commandline -poc)[-1] ${t.join(" ")}; end`},W9=e=>{let t=[`-l ${e.name}`];for(let r of e.aliases)r.length===1?t.push(`-s ${r}`):t.push(`-l ${r}`);e.description&&t.push(`-d '${aa(e.description)}'`);let n=H9(e.type);return n&&t.push(n),t},H9=e=>{switch(e._tag){case"Boolean":return;case"Choice":return`-r -f -a '${e.values.map(uL).join(" ")}'`;case"Path":return e.pathType==="directory","-r -F";default:return"-r -f"}},V9=e=>{switch(e._tag){case"Choice":return`-r -f -a '${e.values.map(uL).join(" ")}'`;case"Path":return"-r -F";default:return}},lL=(e,t,n,r)=>{let o=t.subcommands.map(c=>c.name),s=z9(n,o),a=s?`-n '${s}'`:"";if(!t.arguments.some(c=>c.type._tag==="Path")){let c=[`complete -c ${e}`];a&&c.push(a),c.push("-f"),r.push(c.join(" "))}for(let c of t.subcommands){let u=[`complete -c ${e}`];a&&u.push(a),u.push(`-f -a '${aa(c.name)}'`),c.description&&u.push(`-d '${aa(c.description)}'`),r.push(u.join(" "))}for(let c of t.flags){let u=c.type._tag==="Boolean",l=u?ck(c):q9(c),f=s?`${s}; and ${l}`:l,d=f?`-n '${f}'`:"",m=[`complete -c ${e}`];if(d&&m.push(d),m.push(...W9(c)),r.push(m.join(" ")),u){let g=[`complete -c ${e}`];d&&g.push(d),g.push(`-l no-${c.name}`),c.description&&g.push(`-d '${aa(`Disable ${c.name}`)}'`),r.push(g.join(" "))}}if(t.flags.length>0){let c='not string match -q -- "-*" (commandline -ct)',u=s?`${s}; and ${c}`:c;for(let l of t.flags){let f=`${u}; and ${ck(l)}`,d=l.type._tag==="Boolean",m=[`complete -c ${e}`];if(m.push(`-n '${f}'`),m.push(`-f -a '--${l.name}'`),l.description&&m.push(`-d '${aa(l.description)}'`),r.push(m.join(" ")),d){let g=[`complete -c ${e}`];g.push(`-n '${f}'`),g.push(`-f -a '--no-${l.name}'`),l.description&&g.push(`-d '${aa(`Disable ${l.name}`)}'`),r.push(g.join(" "))}}}for(let c of t.arguments){let u=V9(c.type);if(u){let l=[`complete -c ${e}`];a&&l.push(a),l.push(u),c.description&&l.push(`-d '${aa(c.description)}'`),r.push(l.join(" "))}}for(let c of t.subcommands)lL(e,c,[...n,c.name],r)},fL=(e,t)=>{let n=[];return n.push(`###-begin-${e}-completions-###`),n.push("#"),n.push("# Static completion script for Fish"),n.push("#"),n.push("# Installation:"),n.push(`#   ${e} --completions fish > ~/.config/fish/completions/${e}.fish`),n.push("#"),n.push(""),lL(e,t,[],n),n.push(""),n.push(`###-end-${e}-completions-###`),n.join(`
`)};var ex=e=>e.replace(/\\/g,"\\\\").replace(/'/g,"'\\''").replace(/:/g,"\\:"),mL=e=>e.replace(/[^A-Za-z0-9_.,/@%+-]/gu,"\\$&").replace(/'/g,"'\\''"),uk=e=>e.replace(/[^a-zA-Z0-9_]/g,"_"),K9=e=>{let t=[`--${e.name}`];for(let n of e.aliases)t.push(n.length===1?`-${n}`:`--${n}`);return e.type._tag==="Boolean"&&t.push(`--no-${e.name}`),t},J9=e=>{switch(e._tag){case"Boolean":return"";case"Choice":return`:value:(${e.values.map(mL).join(" ")})`;case"Path":return e.pathType==="directory"?":directory:_directories":":file:_files";case"Int":return":integer:";case"Finite":return":float:";case"Date":return":date:";default:return":value:"}},Z9=e=>{switch(e._tag){case"Choice":return`(${e.values.map(mL).join(" ")})`;case"Path":return e.pathType==="directory"?"_directories":"_files";default:return""}},dL=e=>{let t=[],n=e.description?`[${ex(e.description)}]`:"",r=J9(e.type),o=`(${K9(e).join(" ")})`;t.push(`'${o}--${e.name}${n}${r}'`);for(let s of e.aliases){let a=s.length===1?"-":"--";t.push(`'${o}${a}${s}${n}${r}'`)}if(e.type._tag==="Boolean"){let s=e.description?`[${ex(`Disable ${e.name}`)}]`:"";t.push(`'${o}--no-${e.name}${s}'`)}return t},pL=e=>{let t=e.description?ex(e.description):e.name,n=Z9(e.type);return`'${e.variadic?"*":""}:${t}:${n}'`},hL=(e,t,n)=>{let r=[...t,e.name],o=`_${r.map(uk).join("_")}`;if(n.push(`${o}() {`),e.subcommands.length>0){n.push("  local context state state_descr line"),n.push("  typeset -A opt_args"),n.push(""),n.push("  local -a commands"),n.push("  commands=(");for(let s of e.subcommands){let a=s.description?ex(s.description):"";n.push(`    '${s.name}:${a}'`)}n.push("  )"),n.push(""),n.push("  local -a specs"),n.push("  specs=(");for(let s of e.flags)for(let a of dL(s))n.push(`    ${a}`);if(e.arguments.length>0){n.push("    -"),n.push("    parent-arguments");for(let s of e.arguments)n.push(`    ${pL(s)}`);n.push("    -"),n.push("    subcommands")}n.push("    '1:command:->command'"),n.push("    '*::arg:->args'"),n.push("  )"),n.push(""),n.push('  _arguments -C "${specs[@]}"'),n.push(""),n.push('  case "$state" in'),n.push("    command)"),n.push("      _describe -t commands 'commands' commands"),n.push("      ;;"),n.push("    args)"),n.push('      case "$words[1]" in');for(let s of e.subcommands){let a=`_${[...r,s.name].map(uk).join("_")}`;n.push(`        ${s.name})`),n.push(`          ${a}`),n.push("          ;;")}n.push("      esac"),n.push("      ;;"),n.push("  esac")}else{let s=[];for(let a of e.flags)s.push(...dL(a));for(let a of e.arguments)s.push(pL(a));if(s.length>0){n.push("  local -a specs"),n.push("  specs=(");for(let a of s)n.push(`    ${a}`);n.push("  )"),n.push('  _arguments "${specs[@]}"')}}n.push("}"),n.push("");for(let s of e.subcommands)hL(s,r,n)},gL=(e,t)=>{let n=[],r=uk(e);return n.push(`#compdef ${e}`),n.push(`###-begin-${e}-completions-###`),n.push("#"),n.push("# Static completion script for Zsh"),n.push("#"),n.push("# Installation:"),n.push(`#   ${e} --completions zsh > ~/.zsh/completions/_${e}`),n.push("#   then add ~/.zsh/completions to your fpath"),n.push("#"),n.push(""),hL(t,[],n),n.push("# Handle both direct invocation and autoload"),n.push('if [[ "${zsh_eval_context[-1]}" == "loadautofunc" ]]; then'),n.push(`  _${r} "$@"`),n.push("else"),n.push(`  compdef _${r} ${e}`),n.push("fi"),n.push(`###-end-${e}-completions-###`),n.join(`
`)};var xL=(e,t,n)=>{switch(t){case"bash":return cL(e,n);case"zsh":return gL(e,n);case"fish":return fL(e,n)}};var tx=e=>rL(xs,e);var bL=(e,t)=>Fd(xs,e,t),SL=(e,t)=>Kg(xs,e,t);var lk=h(2,(e,t)=>oL(e,t)),ju=h(2,(e,t)=>Jg(e,t)),fk=h(2,(e,t)=>Yg(e,t));var dk=e=>Ai(e),nx=Zg;var EL=h(2,(e,t)=>Du(e,t));var rx="~effect/cli/Command/Config/Internal",ox=e=>{let t=[],n=[],r=[];function o(a){let i=Object.create(null);for(let c of Object.keys(a))i[c]=s(a[c]);return i}function s(a){if(Array.isArray(a))return{_tag:"Array",children:a.map(i=>s(i))};if(Gg(a)){let i=t.length;return t.push(a),a.kind==="argument"?r.push(a):n.push(a),{_tag:"Param",index:i}}else return{_tag:"Nested",tree:o(a)}}return{[rx]:rx,flags:n,arguments:r,orderedParams:t,tree:o(e)}},wL=ox({}),kL=(e,t)=>{switch(e._tag){case"Param":return{_tag:"Param",index:e.index+t};case"Array":return{_tag:"Array",children:e.children.map(n=>kL(n,t))};case"Nested":return{_tag:"Nested",tree:IL(e.tree,t)}}},IL=(e,t)=>{let n=Object.create(null);for(let r of Object.keys(e))n[r]=kL(e[r],t);return n},pk=(e,t)=>{let n=e.orderedParams.length;return{[rx]:rx,flags:[...e.flags,...t.flags],arguments:[...e.arguments,...t.arguments],orderedParams:[...e.orderedParams,...t.orderedParams],tree:Object.assign(Object.create(null),e.tree,IL(t.tree,n))}},mk=(e,t)=>{let n={};for(let o of Object.keys(e))N(n,o,r(e[o]));return n;function r(o){switch(o._tag){case"Param":return t[o.index];case"Array":return o.children.map(s=>r(s));case"Nested":return mk(o.tree,t)}}};var Dd="~effect/cli/Command",Ae=e=>e,Y9={...to({label:"Command",evaluate(){return Ae(this).service}})},On=e=>{let t=e.config,n=e.contextConfig??wL,r=e.service??Je(`${Dd}/${e.name}`),o=e.annotations??sn(),s=e.globalFlags??[],a=e.subcommands??[],i=(f,d)=>ct(e.handle)?e.handle(f,d):I(new ps({commandPath:d,errors:[]})),c=e.parse??sx(t),u=e.parseContext??sx(n,{allowLeftovers:!0}),l=f=>{let d=[],m=[];for(let k of t.arguments){let w=Xe(k),P=An(k);for(let T of w)d.push({name:T.name,type:T.typeName??Ad(T.primitiveType),description:T.description,required:!P.isOptional&&(!P.isVariadic||NI(P.variadicMin,p=>p>0)),variadic:P.isVariadic})}let g=f.length>0?f.join(" "):e.name;a.some(k=>k.commands.some(w=>!w.unlisted))&&(g+=" <subcommand>"),g+=" [flags]";for(let k of d){let w=k.variadic?`<${k.name}...>`:`<${k.name}>`;g+=` ${k.required?w:`[${w}]`}`}for(let k of t.flags){let w=Xe(k),P=An(k);for(let T of w)T.hidden||m.push(ax(T,P))}let x=[];for(let k of a){let w=k.commands.filter(P=>!P.unlisted);w.length!==0&&x.push({group:k.group,commands:At(w,P=>({name:P.name,alias:P.alias,shortDescription:P.shortDescription,description:P.description??""}))})}let E=e.examples??[];return{description:e.description??"",usage:g,flags:m,annotations:o,...d.length>0&&{args:d},...x.length>0&&{subcommands:x},...E.length>0&&{examples:E}}};return Object.assign(Object.create(Y9),{[Dd]:Dd,name:e.name,examples:e.examples??[],annotations:o,globalFlags:s,subcommands:a,unlisted:e.unlisted??!1,config:t,contextConfig:n,service:r,parse:c,parseContext:u,handle:i,buildHelpDoc:l,...ct(e.description)?{description:e.description}:{},...ct(e.shortDescription)?{shortDescription:e.shortDescription}:{},...ct(e.alias)?{alias:e.alias}:{}})},ax=(e,t)=>{let n=e.aliases.map(r=>r.length===1?`-${r}`:`--${r}`);return{name:e.name,aliases:n,type:e.typeName??Ad(e.primitiveType),description:X9(e.description,hs(e.primitiveType)),required:e.primitiveType._tag!=="Boolean"&&!t.isOptional}},X9=(e,t)=>{if(t===void 0||t.length===0)return e;let n=`(choices: ${t.join(", ")})`;return _e(e,{onNone:()=>R(n),onSome:r=>R(`${r} ${n}`)})},sx=(e,t)=>B(function*(n){let r={flags:n.flags,arguments:n.arguments},[o,s]=yield*eX(r,e.orderedParams);return t?.allowLeftovers!==!0&&o.length>0?yield*new wd({arguments:o}):mk(e.tree,s)}),eX=B(function*(e,t){let n=[],r=e.arguments;for(let o of t){let[s,a]=yield*o.parse({flags:e.flags,arguments:r});n.push(a),r=s}return[r,n]}),hk=(e,t,n)=>{let r=Ae(e),o=new Set;(a=>{for(let i of a){let c=Xe(i);for(let u of c)o.add(u.name)}})((n?.contextConfig??r.contextConfig).flags);for(let a of t){let i=Ae(a);for(let c of i.config.flags){let u=Xe(c);for(let l of u)if(o.has(l.name))throw new vd({option:l.name,parentCommand:e.name,childCommand:a.name})}}};var tX=e=>{switch(e.primitiveType._tag){case"Boolean":return{_tag:"Boolean"};case"Int":return{_tag:"Int"};case"Finite":return{_tag:"Finite"};case"Date":return{_tag:"Date"};case"Choice":return{_tag:"Choice",values:hs(e.primitiveType)??[]};case"Path":return{_tag:"Path",pathType:p0(e.primitiveType)??"either"};case"FileText":case"FileParse":case"FileSchema":return{_tag:"Path",pathType:"file"};default:return{_tag:"String"}}},nX=e=>{switch(e.primitiveType._tag){case"Int":return{_tag:"Int"};case"Finite":return{_tag:"Finite"};case"Date":return{_tag:"Date"};case"Choice":return{_tag:"Choice",values:hs(e.primitiveType)??[]};case"Path":return{_tag:"Path",pathType:p0(e.primitiveType)??"either"};case"FileText":case"FileParse":case"FileSchema":return{_tag:"Path",pathType:"file"};default:return{_tag:"String"}}},gk=(e,t=[])=>{let n=Ae(e),r=n.config,o=[],s=new Set;for(let[u,l]of[...r.flags,...t].entries()){let f=Xe(l);for(let d of f)d.kind==="flag"&&(d.hidden||u>=r.flags.length&&s.has(d.name)||(s.add(d.name),o.push({name:d.name,aliases:d.aliases,description:mn(d.description),type:tX(d)})))}let a=[];for(let u of r.arguments){let l=Xe(u),f=An(u);for(let d of l)d.kind==="argument"&&a.push({name:d.name,description:mn(d.description),required:!f.isOptional,variadic:f.isVariadic,type:nX(d)})}let i=[],c=[...t,...n.contextConfig.flags];for(let u of e.subcommands)for(let l of u.commands){if(l.unlisted)continue;let f=gk(l,c);i.push(f),l.alias&&l.alias!==l.name&&i.push({...f,name:l.alias})}return{name:e.name,description:e.shortDescription??e.description,flags:o,arguments:a,subcommands:i}};var xk=e=>{let t=new Set,n=[];for(let r of e)t.has(r)||(t.add(r),n.push(r));return n},CL=(e,t)=>{let n=[e],r=e;for(let o=1;o<t.length;o++){let s=t[o],a;for(let i of r.subcommands)if(a=i.commands.find(c=>c.name===s),a)break;if(!a)break;n.push(a),r=a}return n},yk=(e,t,n)=>{let o=CL(e,t).flatMap(s=>Ae(s).globalFlags);return xk([...n,...o])},oX=e=>{let t=[],n=r=>{let o=Ae(r);for(let s of o.globalFlags)t.push(s);for(let s of r.subcommands)for(let a of s.commands)n(a)};return n(e),xk(t)},sX=(e,t)=>{if(e.length<=1)return[];let n=new Set(t.map(o=>o.name)),r=[];for(let o of e.slice(0,-1)){let s=Ae(o);for(let a of s.contextConfig.flags){let i=Xe(a),c=An(a);for(let u of i)n.has(u.name)||u.hidden||(n.add(u.name),r.push(ax(u,c)))}}return r},TL=(e,t)=>xk([...t,...oX(e)]),ix=(e,t,n)=>Dt(function*(){let r=CL(e,t),o=r.length>0?r[r.length-1]:e,s=Ae(o).buildHelpDoc(t),a=sX(r,s.flags),i=yk(e,t,n),c=[];for(let u of i){let l=Xe(u.flag),f=An(u.flag);for(let d of l)d.hidden||c.push({...ax(d,f),required:!1})}return{...s,flags:[...a,...s.flags],globalFlags:c}});var cx=e=>({_tag:"Action",flag:e.flag,run:e.run}),iX=e=>t=>{AL+=1;let n=Je(`effect/cli/GlobalFlag/${e}/${AL}`);return Object.assign(n,{_tag:"Setting",id:e,flag:t.flag})},AL=0,cX=cx({flag:tx("help").pipe(lk("h"),ju("Show help information"),nx(!1)),run:B(function*(e,{builtIns:t,command:n,commandPath:r}){let o=yield*Bu,s=yield*ix(n,r,t);yield*Vt(o.formatHelpDoc(s))})}),uX=cx({flag:tx("version").pipe(lk("v"),ju("Show version information"),nx(!1)),run:B(function*(e,{command:t,version:n}){let r=yield*Bu;yield*Vt(r.formatVersion(t.name,n))})}),bk=cx({flag:tx("wizard").pipe(ju("Start wizard mode for a command"),nx(!1)),run:()=>ye}),lX=cx({flag:SL("completions",["bash","zsh","fish","sh"]).pipe(dk,EL(e=>As(e,t=>t==="sh"?"bash":t)),fk("<bash|zsh|fish|sh>"),ju("Print shell completion script")),run:B(function*(e,{command:t}){if(He(e))return;let n=gk(t);yield*Vt(xL(t.name,e.value,n))})}),zu=iX("log-level")({flag:bL("log-level",[["all","All"],["trace","Trace"],["debug","Debug"],["info","Info"],["warn","Warn"],["warning","Warn"],["error","Error"],["fatal","Fatal"],["none","None"]]).pipe(dk,ju("Sets the minimum log level"),fk("<all|trace|debug|info|warn|warning|error|fatal|none>"))}),OL=[cX,uX,bk,lX,zu];var Ud=class extends xe("effect/cli/CliConfig",{defaultValue:()=>fX}){},fX={builtIns:OL};var _n={};qr(_n,{annotate:()=>KX,annotateMerge:()=>JX,isCommand:()=>Ak,make:()=>$X,provide:()=>QX,provideEffect:()=>XX,provideEffectDiscard:()=>eee,provideSync:()=>YX,run:()=>see,runWith:()=>Ok,unlisted:()=>GX,withAlias:()=>VX,withDescription:()=>WX,withExamples:()=>ZX,withGlobalFlags:()=>qX,withHandler:()=>LX,withSharedFlags:()=>zX,withShortDescription:()=>HX,withSubcommands:()=>jX,wizard:()=>tee});function FL(e){let t=e.indexOf("--");return t===-1?{tokens:PL(e),trailingOperands:[]}:{tokens:PL(e.slice(0,t)),trailingOperands:e.slice(t+1)}}var dX=/^-(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/,PL=e=>{let t=[];for(let n of e)if(!n.startsWith("-")||dX.test(n))t.push({_tag:"Value",value:n});else if(n.startsWith("--")){let r=n.indexOf("=");if(r!==-1){let o=n.slice(2,r),s=n.slice(r+1);t.push({_tag:"LongOption",name:o,raw:n,value:s})}else t.push({_tag:"LongOption",name:n.slice(2),raw:n})}else if(n.length>1){let r=n.slice(1),o=r.indexOf("=");if(o!==-1){let s=r.slice(0,o),a=r.slice(o+1);t.push({_tag:"ShortOption",flag:s,raw:`-${s}`,value:a})}else for(let s of r)t.push({_tag:"ShortOption",flag:s,raw:`-${s}`})}else t.push({_tag:"Value",value:n});return t};var mX=(e,t)=>{let n=e.length,r=t.length,o=Array.from({length:n+1},()=>new Array(r+1).fill(0));for(let s=0;s<=n;s++)o[s][0]=s;for(let s=0;s<=r;s++)o[0][s]=s;for(let s=1;s<=n;s++)for(let a=1;a<=r;a++){let i=e[s-1]===t[a-1]?0:1;o[s][a]=Math.min(o[s-1][a]+1,o[s][a-1]+1,o[s-1][a-1]+i)}return o[n][r]},Ek=(e,t)=>{let n=t.map(o=>[mX(e,o),o]).filter(([o])=>o<=2).sort(([o],[s])=>o-s);if(n.length===0)return[];let r=n[0][0];return n.filter(([o])=>o===r).map(([,o])=>o)};var wk=e=>_e(e.subcommand,{onNone:()=>[],onSome:t=>[t.name,...wk(t.parsedInput)]}),kk=(e,t,n=[])=>Dt(function*(){let{tokens:r,trailingOperands:o}=e,s=[...n,t.name],a=Ae(t),c=a.config.flags.flatMap(Xe).filter(Oi),u=Wu(c),f=a.contextConfig.flags.flatMap(Xe).filter(Oi),d=Wu(f),m=new Set(f.map(P=>P.name)),g={command:t,commandPath:s,flagRegistry:u,inheritedFlagRegistry:d,localFlagNames:c.filter(P=>!m.has(P.name)).map(P=>P.name)},x=TX(r,g);if(x._tag==="Leaf")return{flags:x.flags,arguments:[...x.arguments,...o],subcommand:A(),...x.errors.length>0&&{errors:x.errors}};let E={tokens:x.childTokens,trailingOperands:o},k=yield*kk(E,x.sub,s),w=[...x.errors,...k.errors??[]];return{flags:x.flags,arguments:[],subcommand:R({name:x.sub.name,parsedInput:k}),...w.length>0&&{errors:w}}}),ux=e=>{let t=0;return{peek:()=>e[t],take:()=>e[t++],rest:()=>e.slice(t)}},Wu=e=>{let t=new Map;for(let n of e){if(t.has(n.name))throw new Error(`Duplicate flag name "${n.name}" in command definition`);t.set(n.name,n);for(let r of n.aliases){if(t.has(r))throw new Error(`Duplicate flag/alias "${r}" in command definition (conflicts with "${t.get(r).name}")`);t.set(r,n)}}return{params:e,index:t}},NL=e=>{let t=new Map,n=(r,o)=>{let s=t.get(r);if(s&&s!==o)throw new Error(`Duplicate subcommand name/alias "${r}" in command definition (conflicts with "${s.name}")`);t.set(r,o)};for(let r of e)for(let o of r.commands)n(o.name,o),o.alias&&o.alias!==o.name&&n(o.alias,o);return t},Ik=e=>Object.fromEntries(e.map(t=>[t.name,[]])),hX=e=>{let t=Ik(e);return{add:(n,r)=>{r!==void 0&&t[n].push(r)},merge:n=>{for(let r in n){let o=n[r];if(o?.length)for(let s=0;s<o.length;s++)t[r].push(o[s])}},snapshot:()=>t}},lx=e=>e._tag==="LongOption"||e._tag==="ShortOption",DL=e=>e._tag==="LongOption"?e.name:e.flag,qu=(e,t)=>{let n=DL(e),r=t.index.get(n);if(r&&r.name===n)return{param:r,negated:!1};if(e._tag==="LongOption"&&e.name.startsWith("no-")){let o=e.name.slice(3),s=t.index.get(o);if(s&&s.name===o&&jg(s.primitiveType))return{param:s,negated:!0}}if(r)return{param:r,negated:!1}},RL=(e,t,n)=>new dn({option:t.name,value:n,expected:`omit the value and use ${e.raw} by itself to set --${t.name} to false`,kind:"flag"}),gX=e=>{let t=hs(e.primitiveType);return new dn({option:e.name,value:"",expected:t===void 0?e.typeName??Ad(e.primitiveType):t.join(" | "),kind:"flag"})},ML=e=>e?._tag==="Value"&&(u$(e.value)||l$(e.value))?e.value:void 0,UL=(e,t,n,r=!1)=>{let o=$d(e,t,n,r);switch(o._tag){case"Value":return{_tag:"Value",value:o.value};case"Error":return{_tag:"Error",error:o.error}}},$d=(e,t,n,r=!1)=>{if(r){if(t.value!==void 0)return{_tag:"Error",error:RL(t,n,t.value),tokens:[]};let s=ML(e.peek());if(s!==void 0){let a=e.take();return{_tag:"Error",error:RL(t,n,s),tokens:a===void 0?[]:[a]}}return{_tag:"Value",value:"false",tokens:[]}}if(t.value!==void 0)return{_tag:"Value",value:t.value,tokens:[]};if(jg(n.primitiveType)){let s=ML(e.peek()),a=s!==void 0?e.take():void 0;return{_tag:"Value",value:s??"true",tokens:a===void 0?[]:[a]}}let o=e.peek();if(o?._tag==="Value"){let s=e.take();return{_tag:"Value",value:o.value,tokens:s===void 0?[]:[s]}}return{_tag:"Error",error:gX(n),tokens:[]}},xX=(e,t)=>{let n=Ik(t.params),r=[],o=[],s=ux(e);for(let a=s.take();a;a=s.take()){if(!lx(a)){r.push(a);continue}let i=qu(a,t);if(!i){r.push(a);continue}let c=UL(s,a,i.param,i.negated);if(c._tag==="Error"){o.push(c.error);continue}c.value!==void 0&&n[i.param.name].push(c.value)}return{flagMap:n,remainder:r,errors:o}},yX=e=>Ae(e).config.flags.flatMap(Xe).filter(Oi),bX=e=>Ae(e).contextConfig.flags.flatMap(Xe).filter(Oi),$L=(e,t)=>{for(let n of t){let r=qu(e,n);if(r!==void 0)return r}},vk=(e,t,n,r)=>{e.push(n);let o=$d(t,n,r.param,r.negated);e.push(...o.tokens)},SX=(e,t,n,r,o)=>{let s=ux(t);$d(s,e,n.param,n.negated);for(let a=s.take();a;a=s.take()){if(lx(a)){let i=$L(a,o);i!==void 0&&$d(s,a,i.param,i.negated);continue}if(a._tag==="Value")return r.has(a.value)}return!1},LL=(e,t,n)=>{let r=Ik(n.params),o=[],s=(a,i,c)=>{let u=Wu(yX(i)),l=Wu(bX(i)),f=NL(i.subcommands),d=ux(a),m=[],g=!0;for(let x=d.take();x;x=d.take()){if(lx(x)){let E=$L(x,c);if(E!==void 0){vk(m,d,x,E);continue}let k=qu(x,l);if(k!==void 0){vk(m,d,x,k);continue}let w=qu(x,u),P=qu(x,n);if(w!==void 0&&(P===void 0||!g||!SX(x,d.rest(),w,f,[u,l,n]))){vk(m,d,x,w);continue}if(P!==void 0){let T=$d(d,x,P.param,P.negated);if(T._tag==="Error"){o.push(T.error);continue}T.value!==void 0&&r[P.param.name].push(T.value);continue}m.push(x);continue}if(x._tag==="Value"&&g){let E=f.get(x.value);if(E!==void 0)return m.push(x),m.push(...s(d.rest(),E,[...c,l])),m;g=!1}m.push(x)}return m};return{flagMap:r,remainder:s(e,t,[]),errors:o}},EX=(e,t,n)=>{let r=e._tag==="LongOption"?`--${e.name}`:`-${e.flag}`,o=[];for(let a of t)if(!a.hidden){o.push(a.name),jg(a.primitiveType)&&o.push(`no-${a.name}`);for(let i of a.aliases)o.push(i)}let s=Ek(DL(e),o).map(a=>a.length===1?`-${a}`:`--${a}`);return new na({option:r,suggestions:s,command:n})},vX=e=>({flags:hX(e.params),arguments:[],errors:[],mode:{_tag:"AwaitingFirstValue"}}),wX=e=>({_tag:"Leaf",flags:e.flags.snapshot(),arguments:e.arguments,errors:e.errors}),kX=(e,t,n,r)=>{let{command:o,commandPath:s,inheritedFlagRegistry:a,localFlagNames:i}=n,c=NL(o.subcommands),u=c.get(e);if(u){let f=[...s,u.name],d=r.flags.snapshot();for(let g of i){let x=d[g];x!==void 0&&x.length>0&&r.errors.push(new na({option:`--${g}`,suggestions:[],command:f}))}let m=xX(t.rest(),a);return r.flags.merge(m.flagMap),r.errors.push(...m.errors),{_tag:"Subcommand",result:{_tag:"Sub",flags:r.flags.snapshot(),sub:u,childTokens:m.remainder,errors:r.errors}}}if(!(Ae(o).config.arguments.length>0)&&c.size>0){let f=[];for(let[m,g]of c)g.unlisted||f.push(m);let d=Ek(e,f);r.errors.push(new kd({subcommand:e,parent:s,suggestions:d}))}return{_tag:"Argument"}},IX=(e,t,n,r)=>{let{commandPath:o,flagRegistry:s}=n,a=qu(e,s);if(!a){r.errors.push(EX(e,s.params,o));return}let i=UL(t,e,a.param,a.negated);if(i._tag==="Error"){r.errors.push(i.error);return}r.flags.add(a.param.name,i.value)},CX=(e,t,n,r)=>{if(r.mode._tag==="AwaitingFirstValue"){let o=kX(e,t,n,r);if(o._tag==="Subcommand")return o.result;r.mode={_tag:"CollectingArguments"}}r.arguments.push(e)},TX=(e,t)=>{let n=ux(e),r=vX(t.flagRegistry);for(let o=n.take();o;o=n.take()){if(lx(o)){IX(o,n,t,r);continue}if(o._tag==="Value"){let s=CX(o.value,n,t,r);if(s)return s}}return wX(r)};var Tk=B(function*(e,t){let n=t?.commandPath??[e.name],r=OX(e,n),o=(t?.prefix??n).map(s=>zr(s));return yield*fx(o),yield*zL(r,o,r===e?"ROOT":r.name),{args:o.map(s=>s.value),displayArgs:o.map(s=>s.displayValue)}}),OX=(e,t)=>{let n=e;for(let r of t.slice(1)){let o=n.subcommands.flatMap(s=>s.commands).find(s=>s.name===r||s.alias===r);if(o===void 0)break;n=o}return n},zL=B(function*(e,t,n){let r=Ae(e),o=e.subcommands.flatMap(i=>i.commands.filter(c=>!c.unlisted)),s=o.length===0?r.config:r.contextConfig;if(s.flags.length>0){yield*Vt(jL(n,"FLAGS"));for(let i of s.flags)t.push(...yield*BL(i));(s.arguments.length>0||o.length>0)&&(yield*fx(t))}if(s.arguments.length>0){yield*Vt(jL(n,"ARGUMENTS"));for(let i of s.arguments)t.push(...yield*BL(i));o.length>0&&(yield*fx(t))}if(o.length===0)return;let a=yield*pn(A0({message:"Command",choices:o.map(i=>({title:i.name,value:i,...i.shortDescription!==void 0?{description:i.shortDescription}:i.description!==void 0?{description:i.description}:{}}))}));yield*Vt(),t.push(zr(a.name)),_X(a)&&(yield*fx(t)),yield*zL(a,t,a.name)}),_X=e=>e.subcommands.some(n=>n.commands.some(r=>!r.unlisted))||Ae(e).config.orderedParams.length>0,BL=B(function*(e){let t=Lu(e),n=An(e);if(n.isOptional&&!(yield*pn(C0({message:`Set ${Ck(t)}?`,initial:!1}))))return yield*Vt(),[];let r=n.isVariadic?yield*pn(T0({message:`${Ck(t)} count`,default:gt(n.variadicMin,()=>0),min:gt(n.variadicMin,()=>0),...$e(n.variadicMax)?{max:n.variadicMax.value}:{}})):1,o=[];for(let a=0;a<r;a++)o.push(yield*PX(t));let s=t.kind===xs?{flags:{[t.name]:o.map(a=>a.value)},arguments:[]}:{flags:{},arguments:o.map(a=>a.value)};return yield*e.parse(s),yield*Vt(),t.kind===Kt?o:o.flatMap(a=>a.value.startsWith("-")&&a.value.length>1?[zr(`--${t.name}=${a.value}`,`--${t.name}=${a.displayValue}`)]:[zr(`--${t.name}`),a])}),PX=e=>{let t=RX(e);switch(e.primitiveType._tag){case"Boolean":return ne(pn(C0({message:t,label:{confirm:"true",deny:"false"},placeholder:{defaultConfirm:"(T/f)",defaultDeny:"(t/F)"}})),n=>zr(String(n)));case"Choice":{let n=hs(e.primitiveType)??[];return ne(pn(A0({message:t,choices:n.map(r=>({title:r,value:r}))})),zr)}case"Date":return ne(pn($$({message:t})),n=>zr(n.toISOString()));case"Finite":return ne(pn(L$({message:t})),n=>zr(String(n)));case"Int":return ne(pn(T0({message:t})),n=>zr(String(n)));case"Redacted":return ne(pn(B$({message:t})),n=>zr(Zs(n),"<redacted>"));default:return ne(pn(j$({message:t})),zr)}},zr=(e,t=e)=>({value:e,displayValue:t}),FX=e=>e.kind===xs?`--${e.name}`:e.name,RX=e=>Ck(e),Ck=e=>{let t=mn(e.description)?.trim(),n=e.kind===xs&&t!==void 0&&t.length<=32?t:MX(e.name);return e.kind===xs?`${n} (${FX(e)})`:n},MX=e=>{let t=e.split(/[-_]+/).filter(n=>n.length>0);return t.length===0?e:[t[0][0].toUpperCase()+t[0].slice(1),...t.slice(1)].join(" ")},fx=e=>Vt(VL("Current command",e.map(t=>t.displayValue),k$)),jL=(e,t)=>`${Ye(e.toUpperCase(),gs,Ru)} ${Ye("\xB7",_d)} ${Ye(t,gs,wi)}`,qL=(e,t,n)=>[`${Ye(e,gs,Ru)} ${Ye(`v${t}`,wi)} ${Ye("\xB7 Command wizard",gs,wi)}`,...n===void 0||n.length===0?[]:[n],Ye("Build a command interactively. Press Ctrl+C to cancel.",_d),""].join(`
`),WL=e=>VL("Command ready",e,Ru,Wg),HL=()=>`
${Ye("Wizard cancelled.",qg)}`,VL=(e,t,n,r=wi)=>{let o=NX(t);return[Ye(e,gs,r),...o.map(s=>Ye(s,n)),""].join(`
`)},NX=e=>{let n="  $ ",r="    ",o=e.map(DX),s=[],a=n;for(let i of o){let c=a===n||a===r?"":" ";a.length+c.length+i.length>88&&a!==n?(s.push(`${a} \\`),a=`${r}${i}`):a+=`${c}${i}`}return a!==n&&s.push(a),s},DX=e=>/^[A-Za-z0-9_./:@%+=,-]+$/.test(e)?e:`'${e.replaceAll("'",`'"'"'`)}'`;var Ak=e=>_(e,Dd),$X=(e,t,n)=>{let r=ox(t??{});return On({name:e,config:r,...ct(n)?{handle:n}:{}})},LX=h(2,(e,t)=>On({...Ae(e),handle:t})),BX=e=>{let t=[],n=new Map,r=(a,i)=>{t.push(i);let c=n.get(a);c?c.push(i):n.set(a,[i])};for(let a of e){if(Ak(a)){r(void 0,a);continue}for(let i of a.commands)r(a.group,i)}let o=[],s=n.get(void 0);s&&s.length>0&&o.push({group:void 0,commands:s});for(let[a,i]of n)a!==void 0&&o.push({group:a,commands:i});return{flat:t,groups:o}},jX=h(2,(e,t)=>{let n=BX(t);hk(e,n.flat);let r=Ae(e),o=new Map(n.flat.map(c=>[c.name,Ae(c)])),s=Symbol("effect/cli/SubcommandState"),a=B(function*(c){if(He(c.subcommand))return yield*r.parse(c);let u=o.get(c.subcommand.value.name);if(!u)return yield*r.parse(c);let l=yield*r.parseContext(c),f=yield*u.parse(c.subcommand.value.parsedInput);return{...l,[s]:{name:u.name,result:f}}}),i=B(function*(c,u){let f=c[s];if(f){let d=o.get(f.name);return d?yield*d.handle(f.result,[...u,d.name]).pipe(mo(r.service,c)):yield*new ps({commandPath:u,errors:[]})}return yield*r.handle(c,u)});return On({name:r.name,config:r.config,contextConfig:r.contextConfig,description:r.description,shortDescription:r.shortDescription,alias:r.alias,unlisted:r.unlisted,annotations:r.annotations,globalFlags:r.globalFlags,examples:r.examples,service:r.service,subcommands:n.groups,parse:a,parseContext:r.parseContext,handle:i})}),zX=h(2,(e,t)=>{let n=Ae(e),r=ox(t),o=pk(n.config,r),s=pk(n.contextConfig,r);if(n.subcommands.length>0){let l=n.subcommands.flatMap(f=>f.commands);hk(e,l,{contextConfig:s})}let a=sx(r,{allowLeftovers:!0}),i=B(function*(l){let f=yield*n.parse(l),d=yield*a(l);return{...f,...d}}),c=B(function*(l){let f=yield*n.parseContext(l),d=yield*a(l);return{...f,...d}}),u=(l,f)=>n.handle(l,f);return On({name:n.name,config:o,contextConfig:s,description:n.description,shortDescription:n.shortDescription,alias:n.alias,unlisted:n.unlisted,annotations:n.annotations,globalFlags:n.globalFlags,examples:n.examples,service:n.service,subcommands:n.subcommands,parse:i,parseContext:c,handle:u})}),qX=h(2,(e,t)=>{let n=Ae(e),r=Array.from(new Set([...n.globalFlags,...t]));return On({...n,globalFlags:r})}),WX=h(2,(e,t)=>On({...Ae(e),description:t})),HX=h(2,(e,t)=>On({...Ae(e),shortDescription:t})),VX=h(2,(e,t)=>On({...Ae(e),alias:t})),GX=e=>On({...Ae(e),unlisted:!0}),KX=h(3,(e,t,n)=>{let r=Ae(e);return On({...r,annotations:Xt(r.annotations,t,n)})}),JX=h(2,(e,t)=>{let n=Ae(e);return On({...n,annotations:Ia(n.annotations,t)})}),ZX=h(2,(e,t)=>On({...Ae(e),examples:t})),dx=(e,t)=>{let n=Ae(e);return On({...n,handle:(r,o)=>t(n.handle(r,o),r)})},QX=h(e=>Ak(e[0]),(e,t,n)=>dx(e,(r,o)=>cS(r,typeof t=="function"?t(o):t,n))),YX=h(3,(e,t,n)=>dx(e,(r,o)=>mo(r,t,typeof n=="function"?n(o):n))),XX=h(3,(e,t,n)=>dx(e,(r,o)=>uS(r,t,typeof n=="function"?n(o):n))),eee=h(2,(e,t)=>dx(e,(n,r)=>fo(typeof t=="function"?t(r):t,n))),tee=(e,t)=>ne(Tk(e,t),n=>n.args),nee=(e,t,n,r)=>{let o=new Set(t),s=[],a=new Set;for(let i of e){if(o.has(i))continue;let c=Xe(i.flag);for(let u of c){let l=n[u.name];if(!l||l.length===0)continue;let f=`--${u.name}`;a.has(f)||(a.add(f),s.push(new na({option:f,suggestions:[],command:r})))}}return s},ree=(e,t,n)=>Dt(function*(){let{builtIns:r}=yield*Ud,o=yield*Bu,s=yield*ix(e,t.commandPath,r);yield*Vt(o.formatHelpDoc(s)),n&&t.errors.length>0&&(yield*Lg(o.formatErrors(t.errors)))}),oee=e=>Dt(function*(){let t=yield*Bu;yield*Lg(t.formatError(e)),e[Ei]=!1}),see=h(2,(e,t)=>_g.use(({args:n})=>q(n,r=>Ok(e,t)(r)))),Ok=(e,t)=>{let n=Ae(e);return B(function*(r){let{builtIns:o}=yield*Ud,{tokens:s,trailingOperands:a}=FL(r),i=TL(e,o),c=i.flatMap(S=>Xe(S.flag)),u=Wu(c.filter(Oi)),{flagMap:l,remainder:f,errors:d}=LL(s,e,u),m={flags:l,arguments:[]},g=yield*kk({tokens:f,trailingOperands:a},e),x=[e.name,...wk(g)],E={builtIns:o,command:e,commandPath:x,version:t.version},k=yk(e,x,o),w=nee(i,k,l,x);if(w.length>0||d.length>0){let S=g.errors??[];return yield*new ps({commandPath:x,errors:[...d,...w,...S]})}for(let S of k){if(S._tag!=="Action"||!Xe(S.flag).some(D=>{let z=l[D.name];return z!==void 0&&z.length>0}))continue;let[,O]=yield*S.flag.parse(m);if(S===bk)return yield*Dt(function*(){yield*Vt(qL(e.name,t.version,e.description));let D=[e.name,...r.filter(X=>X!=="--wizard"&&!X.startsWith("--wizard="))],z=yield*Tk(e,{commandPath:x,prefix:D});yield*Vt(WL(z.displayArgs)),(yield*pn(z$({message:"Run this command?",initial:!0,active:"yes",inactive:"no"})))&&(yield*Vt(),yield*Ok(e,{...t,renderErrors:!1})(z.args.slice(1)))}).pipe(Jo("QuitError",()=>Vt(HL())));yield*S.run(O,E);return}if(g.errors&&g.errors.length>0)return yield*new ps({commandPath:x,errors:g.errors});let P=yield*tS(n.parse(g));if(P._tag==="Failure")return yield*new ps({commandPath:x,errors:[P.failure]});let T=n.handle(P.success,[e.name]),p=k.includes(zu)?(yield*zu.flag.parse(m))[1]:A();T=mo(T,zu,p);for(let S of k){if(S._tag!=="Setting"||S===zu)continue;let[,v]=yield*S.flag.parse(m);T=mo(T,S,v)}let y=_e(p,{onNone:()=>sn(),onSome:S=>Lo(SO,S)});yield*Zo(T,y)},tf(r=>t0(r)&&r._tag==="ShowHelp"?$(r):K(r),r=>fo(ree(e,r,t.renderErrors!==!1),I(r))),tf(r=>t.renderErrors!==!1&&t0(r)&&r._tag==="UserError"?$(r):K(r),r=>fo(oee(r),I(r))),tf(r=>WU(r)?$(r):K(r),r=>qa))};var _k=[{category:"widgets",criteria:["STD-SC-2.1.1","STD-SC-4.1.2","STD-SC-4.1.3"],demo:`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Combobox demo</title>
    <style>
      :root {
        color-scheme: light dark;
        --bg: #ffffff;
        --fg: #1a1a1a;
        --hl: #dbe6fd;
        --accent: #0b57d0;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --bg: #121212;
          --fg: #f0f0f0;
          --hl: #263248;
          --accent: #8ab4f8;
        }
      }
      body {
        margin: 0;
        padding: 2rem 1rem;
        font:
          1rem/1.5 system-ui,
          sans-serif;
        background: var(--bg);
        color: var(--fg);
      }
      main {
        max-width: 40rem;
        margin: 0 auto;
      }
      .field {
        position: relative;
        max-width: 20rem;
      }
      label {
        display: block;
        font-weight: 600;
        margin-bottom: 0.25rem;
      }
      input {
        box-sizing: border-box;
        width: 100%;
        font: inherit;
        padding: 0.5rem;
        border: 2px solid var(--fg);
        border-radius: 0.375rem;
        background: var(--bg);
        color: var(--fg);
      }
      :focus-visible {
        outline: 3px solid var(--accent);
        outline-offset: 2px;
      }
      [role="listbox"] {
        position: absolute;
        left: 0;
        right: 0;
        margin: 0.25rem 0 0;
        padding: 0.25rem;
        list-style: none;
        border: 2px solid var(--fg);
        border-radius: 0.375rem;
        background: var(--bg);
        max-height: 12rem;
        overflow-y: auto;
        z-index: 1;
      }
      [role="option"] {
        padding: 0.375rem 0.5rem;
        border-radius: 0.25rem;
        cursor: pointer;
      }
      [role="option"][aria-selected="true"] {
        background: var(--hl);
        outline: 2px solid var(--accent);
        outline-offset: -2px;
      }
      .visually-hidden {
        position: absolute;
        width: 1px;
        height: 1px;
        margin: -1px;
        padding: 0;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
        border: 0;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Find a store</h1>
      <div class="field">
        <label for="city">City</label>
        <input
          id="city"
          type="text"
          role="combobox"
          autocomplete="off"
          aria-autocomplete="list"
          aria-expanded="false"
          aria-controls="city-list"
        />
        <ul id="city-list" role="listbox" aria-label="Cities" hidden></ul>
      </div>
      <div id="city-status" role="status" class="visually-hidden"></div>
      <p id="chosen"></p>
    </main>
    <script>
      const cities = [
        "Amsterdam",
        "Athens",
        "Barcelona",
        "Berlin",
        "Bratislava",
        "Brno",
        "Brussels",
        "Budapest",
        "Copenhagen",
        "Dublin",
        "Helsinki",
        "Lisbon",
        "Ljubljana",
        "Madrid",
        "Paris",
        "Prague",
        "Riga",
        "Rome",
        "Sofia",
        "Stockholm",
        "Tallinn",
        "Vienna",
        "Vilnius",
        "Warsaw",
        "Zagreb",
      ];
      const input = document.getElementById("city");
      const list = document.getElementById("city-list");
      const status = document.getElementById("city-status");
      const chosen = document.getElementById("chosen");
      let timer;

      function render(matches) {
        list.replaceChildren(
          ...matches.map((city, i) => {
            const li = document.createElement("li");
            li.id = "city-opt-" + i;
            li.setAttribute("role", "option");
            li.setAttribute("aria-selected", "false");
            li.textContent = city;
            return li;
          })
        );
        setOpen(matches.length > 0);
        clearTimeout(timer);
        timer = setTimeout(() => {
          status.textContent =
            matches.length === 0
              ? "No cities found"
              : matches.length +
                (matches.length === 1 ? " city" : " cities") +
                " available";
        }, 300);
      }
      function setOpen(open) {
        list.hidden = !open;
        input.setAttribute("aria-expanded", String(open));
        if (!open) input.removeAttribute("aria-activedescendant");
      }
      const options = () => [...list.querySelectorAll('[role="option"]')];
      const current = () =>
        options().findIndex(
          (o) => o.id === input.getAttribute("aria-activedescendant")
        );
      function highlight(option) {
        for (const o of options())
          o.setAttribute("aria-selected", String(o === option));
        input.setAttribute("aria-activedescendant", option.id);
        option.scrollIntoView({ block: "nearest" });
      }
      function accept(option) {
        input.value = option.textContent;
        chosen.textContent = "Showing stores in " + option.textContent + ".";
        setOpen(false);
      }
      const filter = () => {
        const q = input.value.trim().toLowerCase();
        return q === ""
          ? []
          : cities.filter((c) => c.toLowerCase().startsWith(q));
      };

      input.addEventListener("input", () => render(filter()));
      input.addEventListener("keydown", (e) => {
        const opts = options();
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          if (list.hidden) {
            render(input.value ? filter() : cities);
          }
          const all = options();
          if (all.length === 0) return;
          const i = current();
          const next =
            e.key === "ArrowDown"
              ? (i + 1) % all.length
              : i <= 0
                ? all.length - 1
                : i - 1;
          highlight(all[next]);
        } else if (e.key === "Enter") {
          const i = current();
          if (!list.hidden && i >= 0) {
            e.preventDefault();
            accept(opts[i]);
          }
        } else if (e.key === "Escape") {
          if (!list.hidden) setOpen(false);
          else input.value = "";
        } else if (e.key === "Tab") {
          setOpen(false);
        }
      });
      input.addEventListener("blur", () => setOpen(false));
      list.addEventListener("pointerdown", (e) => e.preventDefault());
      list.addEventListener("click", (e) => {
        const option = e.target.closest('[role="option"]');
        if (option) accept(option);
      });
    </script>
  </body>
</html>
`,description:"Build an accessible autocomplete, typeahead, searchable picker (country, city) or search suggestions input with role combobox, listbox and aria-activedescendant",expectations:'# Expectations: combobox-autocomplete\n\n1. The text input has role `combobox`, an accessible name from a visible label, and `aria-expanded="false"` before typing.\n2. Typing a letter that matches options shows an element with role `listbox` and sets `aria-expanded="true"` on the input.\n3. Pressing Arrow Down keeps `document.activeElement` on the input and sets its `aria-activedescendant` to the id of an element with role `option` and `aria-selected="true"`.\n4. Pressing Enter after highlighting an option puts that option\'s text in the input and sets `aria-expanded="false"`.\n5. Pressing Escape with the list open hides the listbox and sets `aria-expanded="false"`, with focus still on the input.\n6. After typing, an element with role `status` (or `aria-live`) that existed before typing contains the number of available results.\n',headings:["Combobox and autocomplete","When to use","Markup (ARIA 1.2 pattern)","Focus stays in the input","DO","DO NOT","React and frameworks","What to verify"],id:"combobox-autocomplete",name:"Combobox and autocomplete",text:`---
name: Combobox and autocomplete
description: Build an accessible autocomplete, typeahead, searchable picker (country, city) or search suggestions input with role combobox, listbox and aria-activedescendant
criteria:
  - STD-SC-2.1.1
  - STD-SC-4.1.2
  - STD-SC-4.1.3
---

# Combobox and autocomplete

## When to use

A combobox is a text input with a popup list of suggestions the user can pick from with the keyboard: city search, tag picker, product search with suggestions. If the user must pick one of a short, fixed set and never types, use a native \`<select>\`. If the input only filters a results list already on the page, use a plain search input plus a status message with the result count.

## Markup (ARIA 1.2 pattern)

The input itself has \`role="combobox"\`. Do not wrap it in a \`div role="combobox"\`; that older pattern is not supported well.

\`\`\`html
<label for="city">City</label>
<input
  id="city"
  type="text"
  role="combobox"
  autocomplete="off"
  aria-autocomplete="list"
  aria-expanded="false"
  aria-controls="city-list"
/>
<ul id="city-list" role="listbox" aria-label="Cities" hidden></ul>
<div id="city-status" role="status" class="visually-hidden"></div>
\`\`\`

## Focus stays in the input

DOM focus never leaves the text field, so the user can keep typing. Arrow keys move a virtual highlight, which you expose with \`aria-activedescendant\` set to the highlighted option's id.

| Key        | Action                                             |
| ---------- | -------------------------------------------------- |
| Arrow Down | Open the list if closed; highlight the next option |
| Arrow Up   | Highlight the previous option                      |
| Enter      | Accept the highlighted option, close the list      |
| Escape     | Close the list; if already closed, clear the input |
| Tab        | Close the list, keep what is typed, move on        |
| Typing     | Filter options, reset the highlight                |

\`\`\`js
function render(matches) {
  list.replaceChildren(
    ...matches.map((city, i) => {
      const li = document.createElement("li");
      li.id = \`city-opt-\${i}\`;
      li.role = "option";
      li.setAttribute("aria-selected", "false");
      li.textContent = city;
      return li;
    })
  );
  const open = matches.length > 0;
  list.hidden = !open;
  input.setAttribute("aria-expanded", String(open));
  input.removeAttribute("aria-activedescendant");
  status.textContent =
    matches.length === 0
      ? "No cities found"
      : \`\${matches.length} cities available\`;
}

function highlight(option) {
  for (const o of list.children)
    o.setAttribute("aria-selected", String(o === option));
  input.setAttribute("aria-activedescendant", option.id);
  option.scrollIntoView({ block: "nearest" });
}

list.addEventListener("pointerdown", (e) => e.preventDefault());
list.addEventListener("click", (e) => {
  if (e.target.role === "option") accept(e.target);
});
\`\`\`

\`pointerdown\` with \`preventDefault\` keeps focus in the input when an option is clicked; without it the input blurs, your blur handler closes the list, and the click lands on nothing.

## DO

- Label the input with a visible \`<label>\`. The combobox's name comes from it.
- Keep \`aria-expanded\` true only while the listbox is visible, and update it every time the list opens or closes.
- Give each option a unique, stable id; clear \`aria-activedescendant\` when the highlighted option is removed.
- Mark the highlighted option \`aria-selected="true"\` and style it with more than color.
- Announce the number of results through a status region that exists in the page before the first keystroke. Debounce it so it does not speak on every letter.
- Set \`autocomplete="off"\` so the browser's own autofill popup does not cover yours. Keep a real \`autocomplete\` token instead when the field is personal data, such as an address line, and skip the custom list.

## DO NOT

- Do not move DOM focus into the list with \`.focus()\` on options. The user loses the caret and screen readers leave the edit field.
- Do not make options \`<button>\` or \`<a>\` elements or give them \`tabindex="0"\`. They are options, reached by arrows.
- Do not select the first option automatically on Enter unless it is visibly highlighted and announced (\`aria-autocomplete="both"\` with inline completion).
- Do not open the list on focus with content the user did not ask for; open on typing or Arrow Down.
- Do not use a listbox for rich, interactive results (rows with buttons). That is a grid, a different pattern.

## React and frameworks

Derive \`aria-activedescendant\` from the active index in state, and build option ids from \`useId()\` plus the index. Re-rendering the option list with new keys on every keystroke can make screen readers lose the active option; keep keys tied to the item value. The \`onBlur\` close bug above is the most common failure: prevent default on the list's \`onPointerDown\`.

## What to verify

- Focus stays on the input during all arrow navigation; the caret is still there.
- The accessibility tree shows a combobox, expanded true or false matching the screen, and the active option announced as you arrow.
- Enter puts the option text in the input and closes the list; Escape closes it.
- A screen reader hears the result count after typing pauses.
`},{category:"widgets",criteria:["STD-SC-1.3.1","STD-SC-2.1.1","STD-SC-3.3.2","STD-SC-4.1.2"],demo:`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Select demo</title>
    <style>
      :root {
        color-scheme: light dark;
        --bg: #ffffff;
        --fg: #1a1a1a;
        --accent: #0b57d0;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --bg: #121212;
          --fg: #f0f0f0;
          --accent: #8ab4f8;
        }
      }
      body {
        margin: 0;
        padding: 2rem 1rem;
        font:
          1rem/1.5 system-ui,
          sans-serif;
        background: var(--bg);
        color: var(--fg);
      }
      main {
        max-width: 32rem;
        margin: 0 auto;
      }
      label {
        display: block;
        font-weight: 600;
        margin-bottom: 0.25rem;
      }
      .field {
        margin-bottom: 1.25rem;
      }
      select {
        appearance: none;
        font: inherit;
        min-width: 14rem;
        padding: 0.5rem 2.5rem 0.5rem 0.75rem;
        border: 2px solid var(--fg);
        border-radius: 0.375rem;
        color: var(--fg);
        cursor: pointer;
        background: var(--bg)
          url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M3 6l5 5 5-5' fill='none' stroke='%23767676' stroke-width='2'/%3E%3C/svg%3E")
          no-repeat right 0.75rem center / 1rem;
      }
      :focus-visible {
        outline: 3px solid var(--accent);
        outline-offset: 2px;
      }
      @supports (appearance: base-select) {
        select,
        select::picker(select) {
          appearance: base-select;
        }
        select {
          background-image: none;
        }
        select::picker(select) {
          border: 2px solid var(--fg);
          border-radius: 0.375rem;
          background: var(--bg);
          color: var(--fg);
          padding: 0.25rem;
        }
        option {
          padding: 0.375rem 0.5rem;
          border-radius: 0.25rem;
        }
        option:checked {
          font-weight: 700;
        }
      }
      button {
        font: inherit;
        padding: 0.5rem 1rem;
        border: 2px solid var(--fg);
        border-radius: 0.375rem;
        background: var(--fg);
        color: var(--bg);
        cursor: pointer;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Trail running shoe</h1>
      <form id="buy">
        <div class="field">
          <label for="size">Size (EU)</label>
          <select id="size" name="size" required>
            <option value="">Choose a size</option>
            <option>40</option>
            <option>41</option>
            <option>42</option>
            <option>43</option>
            <option>44</option>
          </select>
        </div>
        <div class="field">
          <label for="color">Color</label>
          <select id="color" name="color">
            <optgroup label="In stock">
              <option>Moss green</option>
              <option>Slate grey</option>
            </optgroup>
            <optgroup label="Ships in 2 weeks">
              <option>Rust orange</option>
            </optgroup>
          </select>
        </div>
        <button>Add to cart</button>
      </form>
      <p id="out" role="status"></p>
    </main>
    <script>
      document.getElementById("buy").addEventListener("submit", (event) => {
        event.preventDefault();
        const data = new FormData(event.target);
        document.getElementById("out").textContent = data.get("size")
          ? "Added size " + data.get("size") + " in " + data.get("color") + "."
          : "Choose a size first.";
      });
    </script>
  </body>
</html>
`,description:"Style a dropdown select accessibly with native select, appearance base-select, or a select-only combobox when custom is required",expectations:`# Expectations: custom-select

1. The control has role \`combobox\` (a native \`select\` or the select-only combobox pattern) and its accessible name equals its visible label text.
2. Clicking the visible label moves focus to the control.
3. With the control focused, pressing Arrow Down (opening and then choosing with Enter for the custom pattern) changes the selected value, and the control exposes the new value.
4. The control is reached with Tab, and no option is a separate Tab stop.
5. Changing the value does not navigate away or move focus off the control.
`,headings:["Custom select vs native select","When to use","1. Native select, styled","2. Customizable select, as an enhancement","3. Select-only combobox, only when the above cannot work","DO","DO NOT","React and frameworks","What to verify"],id:"custom-select",name:"Custom select vs native select",text:`---
name: Custom select vs native select
description: Style a dropdown select accessibly with native select, appearance base-select, or a select-only combobox when custom is required
criteria:
  - STD-SC-1.3.1
  - STD-SC-2.1.1
  - STD-SC-3.3.2
  - STD-SC-4.1.2
---

# Custom select vs native select

## When to use

The user picks one value from a list: country, size, sort order, quantity. The most common accessibility bug here is a "dropdown" rebuilt from \`div\`s to get a custom look, which then has no keyboard support, no label and no value for screen readers. Choose in this order.

## 1. Native select, styled

A \`<select>\` gives you the label association, keyboard (arrows, type to jump, Enter, Escape), the platform picker on phones, form submission and validation. Most of the look is styleable.

\`\`\`html
<label for="size">Size</label>
<select id="size" name="size" required>
  <option value="">Choose a size</option>
  <option>S</option>
  <option>M</option>
  <option>L</option>
</select>
\`\`\`

\`\`\`css
select {
  appearance: none;
  font: inherit;
  padding: 0.5rem 2.5rem 0.5rem 0.75rem;
  border: 2px solid currentColor;
  border-radius: 0.375rem;
  background: var(--bg) url("data:image/svg+xml,...") no-repeat right 0.75rem
    center / 1rem;
  color: inherit;
}
\`\`\`

Keep a visible focus style; \`appearance: none\` does not remove it, but resets often do.

## 2. Customizable select, as an enhancement

Browsers that support it let you style the button and the open picker, and put rich content in options, while keeping native behavior:

\`\`\`css
@supports (appearance: base-select) {
  select,
  select::picker(select) {
    appearance: base-select;
  }
  select::picker(select) {
    border: 2px solid currentColor;
    border-radius: 0.375rem;
  }
  option:checked {
    font-weight: 700;
  }
}
\`\`\`

Browsers without support show the styled native select from step 1. Do not ship a JavaScript replacement to cover them.

## 3. Select-only combobox, only when the above cannot work

If the design truly needs something a select cannot hold, build the select-only combobox pattern: one focusable element with \`role="combobox"\`, a \`role="listbox"\` popup and \`aria-activedescendant\`.

\`\`\`html
<span id="sort-label">Sort by</span>
<div
  role="combobox"
  tabindex="0"
  aria-labelledby="sort-label"
  aria-haspopup="listbox"
  aria-expanded="false"
  aria-controls="sort-list"
>
  Price, low to high
</div>
<ul role="listbox" id="sort-list" aria-labelledby="sort-label" hidden>
  <li role="option" id="sort-1" aria-selected="true">Price, low to high</li>
  <li role="option" id="sort-2" aria-selected="false">Price, high to low</li>
</ul>
\`\`\`

Required keyboard: Enter, Space and Arrow Down open; arrows move the highlight; Home and End; typing a letter jumps; Enter selects and closes; Escape closes without change; Tab selects the highlight and moves on. Focus stays on the combobox. Also add a hidden input carrying the value if it is inside a form. That is a lot to maintain, which is why it is the last choice.

## DO

- Label every select with a visible \`<label for>\`.
- Use a first option like "Choose a size" with \`value=""\` plus \`required\` instead of a pre-selected value the user did not choose.
- Group long lists with \`<optgroup label>\`.
- Use radio buttons instead of a select for 2 to 5 options the user should compare; they show all choices at once.

## DO NOT

- Do not hide a native select with \`display: none\` and show a div dropdown on top; the label then points at nothing.
- Do not build options from \`<button>\` or \`<a>\` elements inside a div.
- Do not change the page or navigate on \`change\` of a select. Keyboard users fire \`change\` with each arrow press on some platforms; add an "Apply" button or act on submit.
- Do not use a select for navigation menus.

## React and frameworks

A controlled \`<select value={size} onChange={...}>\` keeps native behavior; use it before reaching for a component library dropdown. If you use a library select, check it renders a real \`<select>\` or the combobox pattern above with \`aria-activedescendant\`, and that its label prop produces a visible, associated label.

## What to verify

- Clicking the label focuses the select.
- With the select focused, arrow keys change the value and the accessibility tree reports the new value.
- The control's name equals its visible label.
- On a phone, the native picker opens.
`},{category:"widgets",criteria:["STD-SC-2.1.1","STD-SC-2.1.2","STD-SC-2.4.3","STD-SC-4.1.2"],demo:`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Modal dialog demo</title>
    <style>
      :root {
        color-scheme: light dark;
        --bg: #ffffff;
        --fg: #1a1a1a;
        --muted: #4a4a4a;
        --accent: #0b57d0;
        --danger: #b3261e;
        --surface: #f3f4f6;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --bg: #121212;
          --fg: #f0f0f0;
          --muted: #c4c4c4;
          --accent: #8ab4f8;
          --danger: #f2b8b5;
          --surface: #1f1f1f;
        }
      }
      body {
        margin: 0;
        padding: 2rem 1rem;
        font:
          1rem/1.5 system-ui,
          sans-serif;
        background: var(--bg);
        color: var(--fg);
      }
      main {
        max-width: 40rem;
        margin: 0 auto;
      }
      button {
        font: inherit;
        padding: 0.5rem 1rem;
        border: 2px solid var(--fg);
        border-radius: 0.375rem;
        background: var(--bg);
        color: var(--fg);
        cursor: pointer;
      }
      button.danger {
        border-color: var(--danger);
        color: var(--danger);
      }
      :focus-visible {
        outline: 3px solid var(--accent);
        outline-offset: 2px;
      }
      dialog {
        max-width: min(32rem, calc(100vw - 2rem));
        border: 2px solid var(--fg);
        border-radius: 0.5rem;
        background: var(--bg);
        color: var(--fg);
        padding: 1.5rem;
      }
      dialog::backdrop {
        background: rgb(0 0 0 / 0.6);
      }
      .actions {
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;
        flex-wrap: wrap;
      }
      body.locked {
        overflow: hidden;
      }
      p.muted {
        color: var(--muted);
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Project settings</h1>
      <p>Deleting a project removes its files for everyone on the team.</p>
      <p>
        <button type="button" id="open-delete" class="danger">
          Delete project
        </button>
      </p>
      <p class="muted" id="result" role="status"></p>
      <p><a href="#top">Back to top</a></p>
    </main>

    <dialog
      id="delete-dialog"
      aria-labelledby="delete-title"
      aria-describedby="delete-desc"
    >
      <h2 id="delete-title">Delete this project?</h2>
      <p id="delete-desc">
        The project and its 12 files are removed. This cannot be undone.
      </p>
      <form method="dialog" class="actions">
        <button value="cancel" autofocus>Cancel</button>
        <button value="delete" class="danger">Delete</button>
      </form>
    </dialog>

    <script>
      const opener = document.getElementById("open-delete");
      const dialog = document.getElementById("delete-dialog");
      const result = document.getElementById("result");

      opener.addEventListener("click", () => {
        document.body.classList.add("locked");
        dialog.showModal();
      });

      dialog.addEventListener("close", () => {
        document.body.classList.remove("locked");
        result.textContent =
          dialog.returnValue === "delete"
            ? "Project deleted."
            : "Nothing was deleted.";
        opener.focus();
      });

      dialog.addEventListener("click", (event) => {
        if (event.target === dialog) dialog.close("cancel");
      });
    </script>
  </body>
</html>
`,description:"Build an accessible modal dialog or popup with focus trap, Escape to close and focus return",expectations:"# Expectations: dialog-modal\n\n1. Activating the opener button shows an element with role `dialog` whose accessible name equals the dialog's visible heading text.\n2. After opening, `document.activeElement` is inside the dialog.\n3. While the dialog is open, pressing Tab 10 times never moves focus to a page element outside the dialog (focus leaving the document for browser chrome, seen as `document.body`, is allowed).\n4. While the dialog is open, every element outside it is inert or hidden from the accessibility tree: an element behind the dialog cannot be focused with `.focus()`.\n5. Pressing Escape closes the dialog (it is no longer in the accessibility tree) and focus returns to the opener.\n6. Activating the dialog's cancel or close button closes it and focus returns to the opener.\n",headings:["Modal dialog","When to use","Use the native dialog element","DO","DO NOT","React and frameworks","What to verify"],id:"dialog-modal",name:"Modal dialog",text:`---
name: Modal dialog
description: Build an accessible modal dialog or popup with focus trap, Escape to close and focus return
criteria:
  - STD-SC-2.1.1
  - STD-SC-2.1.2
  - STD-SC-2.4.3
  - STD-SC-4.1.2
---

# Modal dialog

## When to use

A modal dialog blocks the page until the user answers it: confirm a delete, edit an address, sign in. If the user can keep working with the page behind it, build a non-modal panel or a disclosure instead. Do not use a modal for a plain notice; use a status message.

## Use the native dialog element

\`<dialog>\` opened with \`showModal()\` gives you, with no extra code: the dialog role, the top layer above every z-index, a backdrop, Escape to close, and everything outside the dialog made inert (not clickable, not focusable, hidden from screen readers). Hand-rolled modals almost always miss one of these.

\`\`\`html
<button type="button" id="open-delete">Delete project</button>

<dialog
  id="delete-dialog"
  aria-labelledby="delete-title"
  aria-describedby="delete-desc"
>
  <h2 id="delete-title">Delete this project?</h2>
  <p id="delete-desc">
    The project and its 12 files are removed. This cannot be undone.
  </p>
  <form method="dialog">
    <button value="cancel" autofocus>Cancel</button>
    <button value="delete">Delete</button>
  </form>
</dialog>
\`\`\`

\`\`\`js
const opener = document.getElementById("open-delete");
const dialog = document.getElementById("delete-dialog");

opener.addEventListener("click", () => dialog.showModal());

dialog.addEventListener("close", () => {
  if (dialog.returnValue === "delete") deleteProject();
  opener.focus();
});

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close("cancel");
});
\`\`\`

\`form method="dialog"\` closes the dialog and sets \`returnValue\` from the pressed button, without a network request. Browsers return focus to the opener on close, but not when the opener was re-rendered or removed; the explicit \`opener.focus()\` covers that case.

## DO

- Open with \`showModal()\`. \`show()\` and the \`open\` attribute make a non-modal dialog: no inert background, no Escape.
- Name the dialog with \`aria-labelledby\` pointing at its visible heading. Add \`aria-describedby\` only for a short message the user must hear on open.
- Put initial focus on the first thing the user needs. For a destructive confirm, focus the safe button (Cancel). For a form, focus the first field. For long content, focus the heading with \`tabindex="-1"\` so the start is read first.
- Give every dialog a visible close or cancel control, as a real \`<button>\`.
- On close, move focus back to the control that opened it. If that control is gone (the row was deleted), focus the next logical element, such as the list heading.
- Lock page scroll while open (\`body { overflow: hidden }\` toggled on open and close) so the background does not move under the dialog.

## DO NOT

- Do not build a modal from a \`div\` with \`role="dialog"\` unless you also trap Tab, close on Escape, make the rest of the page \`inert\`, and restore focus. That is four things to get right; \`<dialog>\` does them.
- Do not put \`aria-hidden="true"\` on a container that holds the focused element or the dialog. Use \`inert\` on siblings if you must hide the background by hand.
- Do not add \`aria-modal="true"\` to a native \`<dialog>\` opened with \`showModal()\`; it is already modal. Add it only on a custom \`role="dialog"\`.
- Do not use \`tabindex\` values above 0 to force order inside the dialog. Order the DOM.
- Do not open a dialog on page load or on focus. Open it only from a user action.
- Do not close the dialog on outside click when it holds unsaved input; ask first or keep it open.

## React and frameworks

The most common bug: rendering \`<dialog open>\` from state. That is a non-modal dialog. Call the method in an effect instead:

\`\`\`jsx
function Modal({ open, onClose, titleId, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog ref={ref} aria-labelledby={titleId} onClose={onClose}>
      {children}
    </dialog>
  );
}
\`\`\`

Keep state in sync through \`onClose\`: Escape closes the dialog natively, and if React state still says \`open\`, the next open does nothing. Store the opener in a ref before opening if it may unmount.

## What to verify

- Tab and Shift+Tab reach only controls inside the dialog. With native \`<dialog>\`, Tab past the last control may go to the browser's own toolbar; that is expected. It must never land on page content behind the dialog.
- Escape closes it and focus lands on the opener.
- The accessibility tree shows a dialog with the heading text as its name.
- Content behind the dialog is not reachable with a screen reader's virtual cursor while it is open.
- At 400% zoom the dialog content scrolls inside the viewport and the close button stays reachable.
`},{category:"widgets",criteria:["STD-SC-1.3.1","STD-SC-2.1.1","STD-SC-4.1.2"],demo:`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Accordion demo</title>
    <style>
      :root {
        color-scheme: light dark;
        --bg: #ffffff;
        --fg: #1a1a1a;
        --line: #6b6b6b;
        --accent: #0b57d0;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --bg: #121212;
          --fg: #f0f0f0;
          --line: #9a9a9a;
          --accent: #8ab4f8;
        }
      }
      body {
        margin: 0;
        padding: 2rem 1rem;
        font:
          1rem/1.5 system-ui,
          sans-serif;
        background: var(--bg);
        color: var(--fg);
      }
      main {
        max-width: 40rem;
        margin: 0 auto;
      }
      h2 {
        margin: 0;
        border-top: 1px solid var(--line);
      }
      h2 button {
        all: unset;
        box-sizing: border-box;
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding: 1rem 0.25rem;
        font:
          600 1.125rem/1.4 system-ui,
          sans-serif;
        cursor: pointer;
      }
      h2 button:focus-visible {
        outline: 3px solid var(--accent);
        outline-offset: 2px;
      }
      .chevron {
        width: 1rem;
        height: 1rem;
        transition: transform 0.2s;
      }
      [aria-expanded="true"] .chevron {
        transform: rotate(180deg);
      }
      @media (prefers-reduced-motion: reduce) {
        .chevron {
          transition: none;
        }
      }
      .panel {
        padding: 0 0.25rem 1rem;
      }
      a {
        color: var(--accent);
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Frequently asked questions</h1>
      <div class="accordion">
        <h2>
          <button
            type="button"
            aria-expanded="false"
            aria-controls="ship-panel"
            id="ship-button"
          >
            Shipping
            <svg
              class="chevron"
              viewBox="0 0 16 16"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M3 6l5 5 5-5"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
          </button>
        </h2>
        <div class="panel" id="ship-panel" hidden="until-found">
          <p>
            Orders ship within two working days.
            <a href="#tracking">Track an order</a>.
          </p>
        </div>
        <h2>
          <button
            type="button"
            aria-expanded="false"
            aria-controls="returns-panel"
            id="returns-button"
          >
            Returns
            <svg
              class="chevron"
              viewBox="0 0 16 16"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M3 6l5 5 5-5"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
          </button>
        </h2>
        <div class="panel" id="returns-panel" hidden="until-found">
          <p>
            Unused items can be returned within 30 days.
            <a href="#returns-form">Start a return</a>.
          </p>
        </div>
      </div>
      <p id="tracking">Need more help? Write to support.</p>
      <p id="returns-form">Returns are free within the EU.</p>
    </main>
    <script>
      for (const button of document.querySelectorAll(
        "[aria-controls][aria-expanded]"
      )) {
        const panel = document.getElementById(
          button.getAttribute("aria-controls")
        );
        const set = (open) => {
          button.setAttribute("aria-expanded", String(open));
          if (open) panel.removeAttribute("hidden");
          else panel.setAttribute("hidden", "until-found");
        };
        button.addEventListener("click", () =>
          set(button.getAttribute("aria-expanded") !== "true")
        );
        panel.addEventListener("beforematch", () => set(true));
      }
    </script>
  </body>
</html>
`,description:"Build an accessible show/hide toggle, FAQ accordion or expandable section with aria-expanded",expectations:"# Expectations: disclosure-accordion\n\n1. Each section toggle has role `button` and exposes `aria-expanded` as `false` while its panel is closed.\n2. Pressing Enter on a focused toggle sets its `aria-expanded` to `true` and makes the content of the controlled panel visible.\n3. Pressing Space on an expanded toggle sets `aria-expanded` to `false` and the content of the panel is no longer visible.\n4. While a panel is closed, no focusable element inside it can be reached with Tab.\n5. Each toggle button sits inside a heading element, so the heading's accessible name equals the toggle's name.\n",headings:["Disclosure and accordion","When to use","Simplest correct version: details and summary","Button pattern for accordions with headings","DO","DO NOT","React and frameworks","What to verify"],id:"disclosure-accordion",name:"Disclosure and accordion",text:`---
name: Disclosure and accordion
description: Build an accessible show/hide toggle, FAQ accordion or expandable section with aria-expanded
criteria:
  - STD-SC-1.3.1
  - STD-SC-2.1.1
  - STD-SC-4.1.2
---

# Disclosure and accordion

## When to use

A disclosure is one button that shows and hides one region: "Show details", a "Read more", a filter group. An accordion is a stack of disclosures, each with a heading, often an FAQ. Neither is a tab list (one panel visible at a time, arrow keys between tabs) and neither is a menu.

## Simplest correct version: details and summary

For a single disclosure or an FAQ with no extra behavior, use \`<details>\` and \`<summary>\`. Keyboard, state announcement and find-in-page all work with no script.

\`\`\`html
<details>
  <summary>What is the return policy?</summary>
  <p>Unused items can be returned within 30 days.</p>
</details>
\`\`\`

Do not put a heading inside \`<summary>\` if you need heading navigation to work across screen readers; use the button pattern below instead. The \`name\` attribute (\`<details name="faq">\`) gives you an exclusive accordion where opening one closes the others.

## Button pattern for accordions with headings

When each section needs a real heading, or you need to control open state from code, wrap a \`<button>\` in the heading and point it at its panel.

\`\`\`html
<h3>
  <button
    type="button"
    aria-expanded="false"
    aria-controls="ship-panel"
    id="ship-button"
  >
    Shipping
  </button>
</h3>
<div id="ship-panel" hidden>
  <p>Orders ship within two working days.</p>
</div>
\`\`\`

\`\`\`js
for (const button of document.querySelectorAll(
  "[aria-controls][aria-expanded]"
)) {
  const panel = document.getElementById(button.getAttribute("aria-controls"));
  button.addEventListener("click", () => {
    const open = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!open));
    panel.hidden = open;
  });
}
\`\`\`

## DO

- Put \`aria-expanded\` on the button, and keep it in sync with the panel on every toggle, including toggles from code.
- Hide the closed panel with \`hidden\` (or \`display: none\`). Hidden content must be gone from the tab order and from the accessibility tree, not just collapsed to zero height.
- Use \`hidden="until-found"\` when users should still find closed content with the browser's find in page; listen for \`beforematch\` to set \`aria-expanded="true"\` when the browser opens it.
- Keep the button text the same in both states ("Shipping"); the expanded state is announced for you. If the text changes ("Show more" to "Show less"), do not also use \`aria-expanded\`.
- Wrap the button inside the heading (\`h3 > button\`), never the heading inside the button. A button's content is flattened; the heading role is lost.
- Show the state visually too: a chevron that rotates, with the icon \`aria-hidden="true"\`.

## DO NOT

- Do not put \`aria-expanded\` on the panel, or on a \`div\` with a click handler. It belongs on the focusable element that toggles.
- Do not use a \`div\` or \`span\` as the toggle. A \`<button>\` gives Enter, Space and focus for free.
- Do not add \`role="region"\` to every panel. It creates a landmark per panel; use it only for a few panels (about six or fewer) whose content is large, and name it with \`aria-labelledby\` pointing at its button.
- Do not hide panels with \`opacity: 0\`, \`height: 0\` with \`overflow: hidden\`, or by moving them off screen while links inside stay focusable.
- Do not require arrow keys. Arrow navigation between accordion headers is optional; Tab must always work.
- Do not use \`role="button"\` on a \`summary\`; it is already a button.

## React and frameworks

Derive both attributes from one state value so they cannot drift: \`aria-expanded={open}\` on the button and \`hidden={!open}\` on the panel. React renders a boolean \`aria-expanded\` as the strings "true" and "false", which is correct. Generate stable ids with \`useId()\` for \`aria-controls\`; never reuse a hardcoded id inside a list. If you animate height, keep the panel \`hidden\` once the closing animation ends, or links inside stay reachable.

## What to verify

- Tab reaches each toggle; Enter and Space both toggle it.
- The accessibility tree shows the toggle as a button with expanded true or false that matches what is on screen.
- With a panel closed, Tab skips every link and field inside it.
- Heading navigation in a screen reader lists each accordion section.
`},{category:"focus-and-keyboard",criteria:["STD-SC-1.4.11","STD-SC-2.4.7","STD-SC22-2.4.11"],demo:`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Focus styles demo</title>
    <style>
      :root {
        color-scheme: light dark;
        --bg: #ffffff;
        --fg: #1a1a1a;
        --band: #1a1a1a;
        --band-fg: #ffffff;
        --focus: #0b57d0;
        --band-focus: #ffd54f;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --bg: #121212;
          --fg: #f0f0f0;
          --band: #2a2a2a;
          --band-fg: #ffffff;
          --focus: #8ab4f8;
          --band-focus: #ffd54f;
        }
      }
      html {
        scroll-padding-top: 5rem;
      }
      body {
        margin: 0;
        font:
          1rem/1.5 system-ui,
          sans-serif;
        background: var(--bg);
        color: var(--fg);
      }
      :focus-visible {
        outline: 3px solid var(--focus);
        outline-offset: 2px;
      }
      a {
        color: var(--focus);
      }
      header {
        position: sticky;
        top: 0;
        height: 4rem;
        display: flex;
        align-items: center;
        gap: 1.5rem;
        padding: 0 1rem;
        background: var(--band);
        color: var(--band-fg);
        z-index: 1;
      }
      header a {
        color: var(--band-fg);
      }
      header :focus-visible {
        outline-color: var(--band-focus);
      }
      main {
        max-width: 40rem;
        margin: 0 auto;
        padding: 2rem 1rem;
      }
      section {
        padding: 1rem 0;
        border-bottom: 1px solid var(--fg);
      }
      label {
        display: block;
        font-weight: 600;
      }
      input {
        font: inherit;
        padding: 0.5rem;
        border: 2px solid var(--fg);
        border-radius: 0.375rem;
        background: var(--bg);
        color: var(--fg);
      }
      button {
        font: inherit;
        padding: 0.5rem 1rem;
        border: 2px solid var(--fg);
        border-radius: 0.375rem;
        background: var(--fg);
        color: var(--bg);
        cursor: pointer;
      }
      .card {
        overflow: hidden;
        border: 2px solid var(--fg);
        border-radius: 0.5rem;
        padding: 1rem;
      }
      .card a:focus-visible {
        outline-offset: -3px;
      }
    </style>
  </head>
  <body>
    <header>
      <a href="#top">Acme</a>
      <a href="#shop">Shop</a>
      <a href="#journal">Journal</a>
    </header>
    <main>
      <h1>Account</h1>
      <section>
        <h2>Profile</h2>
        <label for="display-name">Display name</label>
        <input
          id="display-name"
          name="display-name"
          type="text"
          autocomplete="nickname"
        />
        <p><button type="button">Save profile</button></p>
      </section>
      <section>
        <h2>Orders</h2>
        <p><a href="#order-1042">Order 1042, delivered</a></p>
        <p><a href="#order-1043">Order 1043, on the way</a></p>
      </section>
      <section>
        <h2>Saved items</h2>
        <div class="card"><a href="#rain-jacket">Rain jacket</a></div>
      </section>
      <section>
        <h2>Newsletter</h2>
        <label for="email">Email address</label>
        <input id="email" name="email" type="email" autocomplete="email" />
        <p><button type="button">Subscribe</button></p>
      </section>
      <section style="min-height: 120vh">
        <h2>Privacy</h2>
        <p><a href="#delete">Delete my account</a></p>
      </section>
    </main>
  </body>
</html>
`,description:"Style a visible keyboard focus indicator with focus-visible and outline that is never removed or hidden under sticky headers",expectations:"# Expectations: focus-visible\n\n1. For every element reached with Tab, the computed `outline-style` is not `none` and `outline-width` is at least 2px while it has keyboard focus (or a non-transparent `box-shadow` is present together with a transparent outline for forced colors).\n2. The focused element's outline color differs from the page background color it sits on (the outline is not transparent and not equal to the background).\n3. After a mouse click on a `button`, the button does not match `:focus-visible`.\n4. When an element below a sticky header receives focus by Tab or Shift+Tab, its bounding box top is not above the sticky header's bottom edge (it is not covered by the header).\n5. No element in the page has an author style that sets `outline: none` on `:focus` without a `:focus-visible` replacement: the computed outline on keyboard focus is visible for links, buttons and inputs alike.\n",headings:["Visible focus styles","When to use","A global focus style","Contrast of the indicator","Not hidden by sticky or fixed content","DO","DO NOT","React and frameworks","What to verify"],id:"focus-visible",name:"Visible focus styles",text:`---
name: Visible focus styles
description: Style a visible keyboard focus indicator with focus-visible and outline that is never removed or hidden under sticky headers
criteria:
  - STD-SC-1.4.11
  - STD-SC-2.4.7
  - STD-SC22-2.4.11
---

# Visible focus styles

## When to use

Every interactive element on every page: links, buttons, inputs, custom widgets. Keyboard users need to see where they are. The usual failure is a CSS reset or a design request ("remove the blue ring") that sets \`outline: none\` with nothing in its place.

## A global focus style

\`\`\`css
:root {
  --focus: #0b57d0;
}
@media (prefers-color-scheme: dark) {
  :root {
    --focus: #8ab4f8;
  }
}

:focus-visible {
  outline: 3px solid var(--focus);
  outline-offset: 2px;
}

html {
  scroll-padding-top: 5rem;
}
\`\`\`

- \`:focus-visible\` shows the ring for keyboard focus and hides it for mouse clicks on buttons. Text inputs show it on click too, which is correct.
- \`outline\` follows border radius in current browsers, does not change layout, and stays visible in Windows forced colors mode. \`box-shadow\` rings disappear in forced colors; if you use one, add \`outline: 2px solid transparent\` as well so forced colors draws it.
- \`outline-offset\` keeps the ring off the element's own border, so it contrasts with the page background instead of the button fill.
- \`scroll-padding-top\` equal to a sticky header's height stops focused elements from scrolling under the header.

## Contrast of the indicator

The ring must stand out against what is next to it: aim for 3:1 against the background it sits on. One brand color rarely works on both light and dark sections. For mixed backgrounds use a two-tone ring:

\`\`\`css
:focus-visible {
  outline: 3px solid #ffffff;
  box-shadow: 0 0 0 6px #1a1a1a;
}
\`\`\`

## Not hidden by sticky or fixed content

A focused element must not be fully covered by a sticky header, a cookie banner, a chat button or a bottom bar. Fixes: \`scroll-padding-top\` and \`scroll-padding-bottom\` on \`html\` sized to the sticky elements; make cookie banners modal or move them out of the way; never let a fixed footer cover the last form field.

## DO

- Put the focus style in your base stylesheet, before components, so every element has it by default.
- Keep custom widgets focusable where they should be (\`tabindex="0"\` on a widget root, roving \`tabindex\` inside composites) so they get the same ring.
- For components with dark fills, set a per-component focus color that contrasts with the surrounding background.
- Check that the ring is not clipped by \`overflow: hidden\` on a parent; use a negative \`outline-offset\` inside clipped containers (cards, carousels).

## DO NOT

- Do not write \`*:focus { outline: none }\`, \`button:focus { outline: 0 }\` or Tailwind \`outline-none\` / \`focus:outline-none\` without a \`focus-visible:\` replacement.
- Do not signal focus only by a color change of text or background with low contrast; a 1 px color shift is not visible.
- Do not use \`:focus-within\` as the only focus style for a composite; the focused child still needs its own.
- Do not remove the ring because "it looks odd on click"; \`:focus-visible\` already solves that.

## React and frameworks

Component libraries and CSS resets (Tailwind preflight, some normalize variants) keep or remove outlines differently; check one button, one link and one input after adding them. In Tailwind, use \`focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700\`, not \`focus:ring\` alone. In CSS-in-JS, put the focus rule in the global style, not per component, so nothing ships without it.

## What to verify

- Tab through the whole page: every stop shows a ring you can see from a normal viewing distance, in light and dark mode.
- Clicking a button with the mouse does not leave a ring; clicking into a text field does.
- Tab to elements just below a sticky header and just above a fixed footer: each one is fully in view.
- In Windows high contrast or forced colors emulation, the ring is still drawn.
`},{category:"forms",criteria:["STD-SC-1.3.1","STD-SC-3.3.1","STD-SC-3.3.3","STD-SC-4.1.3"],demo:`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Form errors demo</title>
    <style>
      :root {
        color-scheme: light dark;
        --bg: #ffffff;
        --fg: #1a1a1a;
        --error: #b3261e;
        --accent: #0b57d0;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --bg: #121212;
          --fg: #f0f0f0;
          --error: #ffb4ab;
          --accent: #8ab4f8;
        }
      }
      body {
        margin: 0;
        padding: 2rem 1rem;
        font:
          1rem/1.5 system-ui,
          sans-serif;
        background: var(--bg);
        color: var(--fg);
      }
      main {
        max-width: 32rem;
        margin: 0 auto;
      }
      .field {
        margin-bottom: 1.25rem;
      }
      label {
        display: block;
        font-weight: 600;
      }
      input {
        box-sizing: border-box;
        width: 100%;
        font: inherit;
        padding: 0.5rem;
        border: 2px solid var(--fg);
        border-radius: 0.375rem;
        background: var(--bg);
        color: var(--fg);
      }
      input[aria-invalid="true"] {
        border-color: var(--error);
        border-width: 3px;
      }
      .error {
        color: var(--error);
        font-weight: 600;
        margin: 0.25rem 0 0;
      }
      #error-summary {
        border: 3px solid var(--error);
        border-radius: 0.375rem;
        padding: 0.75rem 1rem;
        margin-bottom: 1.5rem;
      }
      #error-summary h2 {
        margin: 0 0 0.5rem;
        font-size: 1.125rem;
      }
      #error-summary a {
        color: var(--error);
      }
      button {
        font: inherit;
        padding: 0.5rem 1rem;
        border: 2px solid var(--fg);
        border-radius: 0.375rem;
        background: var(--fg);
        color: var(--bg);
        cursor: pointer;
      }
      :focus-visible {
        outline: 3px solid var(--accent);
        outline-offset: 2px;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Create an account</h1>
      <div id="error-summary" hidden>
        <h2 tabindex="-1"></h2>
        <ul></ul>
      </div>
      <form id="signup" novalidate>
        <div class="field">
          <label for="full-name">Full name</label>
          <input
            id="full-name"
            name="name"
            type="text"
            autocomplete="name"
            required
            aria-describedby="full-name-error"
          />
          <p id="full-name-error" class="error" hidden></p>
        </div>
        <div class="field">
          <label for="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            required
            aria-describedby="email-error"
          />
          <p id="email-error" class="error" hidden></p>
        </div>
        <div class="field">
          <label for="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autocomplete="new-password"
            required
            minlength="12"
            aria-describedby="password-error"
          />
          <p id="password-error" class="error" hidden></p>
        </div>
        <button>Create account</button>
      </form>
      <p id="done" role="status"></p>
    </main>
    <script>
      const form = document.getElementById("signup");
      const summary = document.getElementById("error-summary");
      const summaryHeading = summary.querySelector("h2");
      const summaryList = summary.querySelector("ul");
      const labelOf = (field) =>
        document.querySelector('label[for="' + field.id + '"]').textContent;

      function messageFor(field) {
        const v = field.validity;
        if (v.valueMissing) return "Enter your " + labelOf(field).toLowerCase();
        if (v.typeMismatch)
          return "Enter an email address like name@example.com";
        if (v.tooShort)
          return "Use at least " + field.minLength + " characters";
        return null;
      }
      function showSummary(errors) {
        summaryHeading.textContent =
          errors.length === 1
            ? "There is 1 problem with your details"
            : "There are " + errors.length + " problems with your details";
        summaryList.replaceChildren(
          ...errors.map(({ id, message }) => {
            const li = document.createElement("li");
            const a = document.createElement("a");
            a.href = "#" + id;
            a.textContent =
              labelOf(document.getElementById(id)) + ": " + message;
            li.append(a);
            return li;
          })
        );
        summary.hidden = false;
      }
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const errors = [];
        for (const field of form.elements) {
          if (!field.willValidate || field.tagName === "BUTTON") continue;
          const message = messageFor(field);
          const errorEl = document.getElementById(field.id + "-error");
          if (message === null) field.removeAttribute("aria-invalid");
          else field.setAttribute("aria-invalid", "true");
          errorEl.hidden = message === null;
          errorEl.textContent = message === null ? "" : "Error: " + message;
          if (message !== null) errors.push({ id: field.id, message });
        }
        if (errors.length === 0) {
          summary.hidden = true;
          document.getElementById("done").textContent = "Account created.";
          return;
        }
        showSummary(errors);
        summaryHeading.focus();
      });
      summaryList.addEventListener("click", (event) => {
        const link = event.target.closest("a");
        if (!link) return;
        event.preventDefault();
        document.getElementById(link.hash.slice(1)).focus();
      });
    </script>
  </body>
</html>
`,description:"Show accessible form validation errors with aria-invalid, aria-describedby, an error summary and focus on submit",expectations:`# Expectations: form-errors-validation

1. Submitting the form with required fields empty does not navigate, and focus moves to an error summary (or, with no summary, to the first invalid field).
2. Every invalid field has \`aria-invalid="true"\` after the failed submit, and no field has it before the first submit.
3. Each invalid field's accessible description contains its visible error message text.
4. The error summary contains one link per error, and activating a link moves focus to the matching field.
5. Correcting a field and submitting again removes \`aria-invalid\` and the error message for that field.
6. The submit button stays enabled while the form has errors.
`,headings:["Form errors and validation","When to use","The pattern","Write messages that fix the problem","DO","DO NOT","React and frameworks","What to verify"],id:"form-errors-validation",name:"Form errors and validation",text:`---
name: Form errors and validation
description: Show accessible form validation errors with aria-invalid, aria-describedby, an error summary and focus on submit
criteria:
  - STD-SC-1.3.1
  - STD-SC-3.3.1
  - STD-SC-3.3.3
  - STD-SC-4.1.3
---

# Form errors and validation

## When to use

Any form that can reject input: sign up, checkout, contact, settings. The user must learn that something failed, which field, and how to fix it, without seeing the screen and without using a mouse.

## The pattern

1. Validate on submit. Optionally validate a field again on blur after the user has left it once with a problem; never on every keystroke of a fresh field.
2. For each invalid field: set \`aria-invalid="true"\` and connect a visible error message with \`aria-describedby\`.
3. Above the form, show an error summary: a heading with the count and a list of links, one per error, each pointing at its field.
4. Move focus to the summary heading. One focus move announces the problem; the links let users jump to each field.
5. When a field becomes valid, remove \`aria-invalid\` and its message, and update the summary.

\`\`\`html
<div id="error-summary" hidden>
  <h2 tabindex="-1">There are 2 problems with your details</h2>
  <ul></ul>
</div>

<form id="signup" novalidate>
  <label for="email">Email address</label>
  <input
    id="email"
    name="email"
    type="email"
    autocomplete="email"
    required
    aria-describedby="email-error"
  />
  <p id="email-error" class="error" hidden></p>
  <button>Create account</button>
</form>
\`\`\`

\`\`\`js
form.addEventListener("submit", (event) => {
  const errors = [];
  for (const field of form.elements) {
    if (!field.willValidate) continue;
    const message = messageFor(field);
    const errorEl = document.getElementById(\`\${field.id}-error\`);
    if (message === null) field.removeAttribute("aria-invalid");
    else field.setAttribute("aria-invalid", "true");
    errorEl.hidden = message === null;
    errorEl.textContent = message ?? "";
    if (message !== null) errors.push({ id: field.id, message });
  }
  if (errors.length === 0) return;
  event.preventDefault();
  showSummary(errors);
  summary.querySelector("h2").focus();
});

summaryList.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link) return;
  event.preventDefault();
  document.getElementById(link.hash.slice(1)).focus();
});
\`\`\`

\`messageFor(field)\` returns a specific message from \`field.validity\` (\`valueMissing\`, \`typeMismatch\`, \`tooShort\`) or \`null\`. \`novalidate\` turns off the browser's bubbles so your messages are the only ones; keep \`required\`, \`type\` and \`minlength\` on the fields so the Constraint Validation API still does the checking.

## Write messages that fix the problem

- Say what is wrong and what to do: "Enter an email address like name@example.com", not "Invalid input".
- Name the field in the summary link text: "Email address: enter an email address like name@example.com".
- Keep the same text inline and in the summary.
- Prefix inline errors with a visible word or icon ("Error:"), so color is not the only signal. If you use an icon, it is decorative (\`aria-hidden="true"\`) and the text says "Error".

## DO

- Keep the submit button enabled. A disabled button tells no one why it is disabled and is skipped by Tab.
- Put the error message element in the page from the start (hidden) and keep its id stable, so \`aria-describedby\` always resolves.
- Keep the user's input. Never clear a field because it was invalid, except passwords if your policy requires it.
- Prefix the page \`<title>\` with "Error: " when a server-side validation reloads the page.
- For server errors after an async submit, show them the same way: inline, in the summary, focus the summary.

## DO NOT

- Do not show errors only with a red border or red text.
- Do not use \`alert()\` for validation.
- Do not put the error text only in a \`title\` attribute, a tooltip, or \`placeholder\`.
- Do not set \`aria-invalid="true"\` on fields before the user has submitted or left them.
- Do not use \`role="alert"\` on every inline message; when ten fields fail at once, the screen reader reads ten interruptions. Focusing the summary is the announcement.
- Do not move focus on blur validation. Only show the inline message.

## React and frameworks

Keep errors in state keyed by field name and render \`aria-invalid={Boolean(errors.email) || undefined}\` (React would render \`aria-invalid="false"\` for \`false\`, which is fine, but omitting it is cleaner). Focus the summary heading in an effect that runs when a submit attempt produced errors, since the summary is not in the DOM until that render. Form libraries often set \`aria-invalid\` but do not link the message: check that \`aria-describedby\` points at the rendered error id.

## What to verify

- Submit an empty form with the keyboard only: focus lands on the summary and a screen reader reads the count.
- Each summary link moves focus to its field.
- Each invalid field announces its label, "invalid", and its error message.
- Fixing a field and resubmitting removes its error everywhere.
`},{category:"widgets",criteria:["STD-SC-1.1.1","STD-SC-2.5.3","STD-SC-4.1.2","STD-SC22-2.5.8"],demo:`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Icon buttons demo</title>
    <style>
      :root {
        color-scheme: light dark;
        --bg: #ffffff;
        --fg: #1a1a1a;
        --accent: #0b57d0;
        --heart: #b3261e;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --bg: #121212;
          --fg: #f0f0f0;
          --accent: #8ab4f8;
          --heart: #ffb4ab;
        }
      }
      body {
        margin: 0;
        padding: 2rem 1rem;
        font:
          1rem/1.5 system-ui,
          sans-serif;
        background: var(--bg);
        color: var(--fg);
      }
      main {
        max-width: 40rem;
        margin: 0 auto;
      }
      .icon-button {
        display: inline-grid;
        place-items: center;
        width: 2.75rem;
        height: 2.75rem;
        padding: 0;
        border: 2px solid var(--fg);
        border-radius: 0.375rem;
        background: var(--bg);
        color: var(--fg);
        cursor: pointer;
      }
      .icon-button svg {
        width: 1.5rem;
        height: 1.5rem;
      }
      .icon-button[aria-pressed="true"] {
        color: var(--heart);
        border-color: var(--heart);
      }
      .icon-button[aria-pressed="true"] .heart {
        fill: currentColor;
      }
      :focus-visible {
        outline: 3px solid var(--accent);
        outline-offset: 2px;
      }
      ul {
        list-style: none;
        padding: 0;
      }
      li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        padding: 0.5rem 0;
        border-bottom: 1px solid var(--fg);
      }
      .bar {
        display: flex;
        gap: 0.75rem;
        align-items: center;
      }
      .tip {
        position: relative;
      }
      .tip [role="tooltip"] {
        position: absolute;
        top: calc(100% + 0.25rem);
        left: 50%;
        translate: -50% 0;
        padding: 0.125rem 0.5rem;
        border-radius: 0.25rem;
        background: var(--fg);
        color: var(--bg);
        font-size: 0.875rem;
        white-space: nowrap;
        pointer-events: none;
        opacity: 0;
      }
      .tip:hover [role="tooltip"],
      .tip:focus-within [role="tooltip"] {
        opacity: 1;
      }
      .visually-hidden {
        position: absolute;
        width: 1px;
        height: 1px;
        margin: -1px;
        padding: 0;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
        border: 0;
      }
    </style>
  </head>
  <body>
    <main>
      <div class="bar">
        <h1>Your cart</h1>
        <span class="tip">
          <button
            type="button"
            class="icon-button"
            id="fav"
            aria-pressed="false"
            aria-describedby="fav-tip"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                class="heart"
                d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6C19 16.5 12 21 12 21z"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
            <span class="visually-hidden">Save cart for later</span>
          </button>
          <span role="tooltip" id="fav-tip">Save cart for later</span>
        </span>
      </div>
      <ul>
        <li>
          <span id="item-1">Rain jacket</span>
          <button
            type="button"
            class="icon-button"
            aria-label="Remove Rain jacket"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
          </button>
        </li>
        <li>
          <span id="item-2">Hiking boot</span>
          <button
            type="button"
            class="icon-button"
            aria-label="Remove Hiking boot"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
          </button>
        </li>
      </ul>
      <p>
        <a href="#help" class="icon-button" aria-label="Help">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <circle
              cx="12"
              cy="12"
              r="9"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            />
            <path
              d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5V14M12 17h.01"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
        </a>
      </p>
      <p id="log" role="status"></p>
    </main>
    <script>
      const fav = document.getElementById("fav");
      const log = document.getElementById("log");
      fav.addEventListener("click", () => {
        const pressed = fav.getAttribute("aria-pressed") === "true";
        fav.setAttribute("aria-pressed", String(!pressed));
      });
      for (const button of document.querySelectorAll("li .icon-button")) {
        button.addEventListener("click", () => {
          const li = button.closest("li");
          log.textContent = li.querySelector("span").textContent + " removed.";
          li.remove();
        });
      }
    </script>
  </body>
</html>
`,description:"Give icon-only buttons and SVG icon links an accessible name, toggle state with aria-pressed and a big enough target",expectations:`# Expectations: icon-buttons

1. Every \`button\` and \`a[href]\` that shows only an icon has a non-empty accessible name.
2. Icon buttons repeated per list item (such as remove buttons) have distinct accessible names that include the item's name.
3. SVG icons inside named buttons have \`aria-hidden="true"\`, so they add nothing to the name.
4. A toggle icon button exposes \`aria-pressed\`; activating it with Enter or Space flips the value and leaves the accessible name unchanged.
5. Each icon button's bounding box is at least 24 by 24 CSS pixels.
`,headings:["Icon-only buttons","When to use","Name the control, hide the icon","Repeated icons need distinct names","Toggle buttons","DO","DO NOT","React and frameworks","What to verify"],id:"icon-buttons",name:"Icon-only buttons",text:`---
name: Icon-only buttons
description: Give icon-only buttons and SVG icon links an accessible name, toggle state with aria-pressed and a big enough target
criteria:
  - STD-SC-1.1.1
  - STD-SC-2.5.3
  - STD-SC-4.1.2
  - STD-SC22-2.5.8
---

# Icon-only buttons

## When to use

Any control that shows only an icon: close (X), search (magnifier), menu (hamburger), favourite (heart), play, delete (trash), social links. Without a name, a screen reader says "button" and nothing else, and voice control users cannot say what to click.

## Name the control, hide the icon

\`\`\`html
<button type="button" class="icon-button" aria-label="Close">
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" />
  </svg>
</button>
\`\`\`

Or, with text that also shows when CSS fails:

\`\`\`html
<button type="button" class="icon-button">
  <svg aria-hidden="true" focusable="false">...</svg>
  <span class="visually-hidden">Close</span>
</button>
\`\`\`

\`\`\`css
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
\`\`\`

The name describes the action or destination, not the picture: "Search", not "Magnifying glass"; "Remove Rain jacket from cart", not "Trash icon".

## Repeated icons need distinct names

A list with a trash icon on each row has ten buttons called "Delete". Add the item: \`aria-label="Delete Rain jacket"\`, or reference the row title with \`aria-labelledby="delete-3 item-3-title"\` where \`delete-3\` is the button's own id holding the word "Delete".

## Toggle buttons

For a button that turns something on and off (favourite, mute, bold), keep the name fixed and expose the state with \`aria-pressed\`:

\`\`\`html
<button type="button" aria-pressed="false" aria-label="Favourite">
  <svg aria-hidden="true" focusable="false">...</svg>
</button>
\`\`\`

Toggle \`aria-pressed\` between "true" and "false" on click, and change the icon (outline to filled) for sighted users. Either change the name ("Mute" to "Unmute") or use \`aria-pressed\`, never both; "Unmute, pressed" contradicts itself.

## DO

- Use a real \`<button>\` for actions and \`<a href>\` for navigation; put the name on that element.
- Add \`aria-hidden="true"\` to decorative SVGs and icon font elements inside named controls, so the icon's own title or glyph is not read.
- Make the target at least 24 by 24 CSS pixels, or keep 24 px of spacing around a smaller one. 44 by 44 is better for touch.
- When there is visible text next to the icon, use that text as the name, and if you add \`aria-label\`, start it with the same words, so voice users can say what they see.
- Show a tooltip with the same text on hover and focus for sighted users who do not know the icon; it helps, but it does not replace the name.

## DO NOT

- Do not rely on \`title\` alone for the name. It is not shown on touch or keyboard focus and is announced inconsistently.
- Do not put \`aria-label\` on the \`<svg>\` and leave the button unnamed; name the button.
- Do not use an \`<img>\` icon without \`alt\` inside a button; give it \`alt="Close"\` or make it \`alt=""\` and name the button.
- Do not use a \`div\` or \`span\` with a click handler as an icon button.
- Do not use \`aria-label\` on an element that already has visible text that differs from it.

## React and frameworks

Icon components from libraries often render an \`<svg>\` without \`aria-hidden\`, and some add a \`<title>\` you did not ask for. Pass \`aria-hidden\` through, and require an accessible name in your \`IconButton\` component's props (a required \`label\` prop), so the type system catches unnamed buttons. In JSX the attribute is \`aria-label\` and \`aria-pressed={pressed}\` (boolean renders as "true"/"false").

## What to verify

- Every button and link in the accessibility tree has a non-empty name that says what it does.
- Repeated icon buttons in a list have distinct names.
- Toggle buttons report pressed state, and the name stays the same when toggled.
- Each icon target is at least 24 by 24 CSS pixels.
`},{category:"content",criteria:["STD-SC-1.1.1","STD-SC-2.4.4"],demo:`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Image alt text demo</title>
    <style>
      :root {
        color-scheme: light dark;
        --bg: #ffffff;
        --fg: #1a1a1a;
        --card: #f3f4f6;
        --accent: #0b57d0;
        --star: #8a5a00;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --bg: #121212;
          --fg: #f0f0f0;
          --card: #1f1f1f;
          --accent: #8ab4f8;
          --star: #ffd54f;
        }
      }
      body {
        margin: 0;
        padding: 2rem 1rem;
        font:
          1rem/1.5 system-ui,
          sans-serif;
        background: var(--bg);
        color: var(--fg);
      }
      main {
        max-width: 48rem;
        margin: 0 auto;
      }
      header a {
        display: inline-block;
      }
      img {
        max-width: 100%;
        height: auto;
        display: block;
      }
      .cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
        gap: 1rem;
        padding: 0;
        list-style: none;
      }
      .card {
        display: block;
        background: var(--card);
        border-radius: 0.5rem;
        padding: 0.75rem;
        color: var(--fg);
        text-decoration: none;
      }
      .card h3 {
        margin: 0.5rem 0 0;
        color: var(--accent);
        text-decoration: underline;
      }
      :focus-visible {
        outline: 3px solid var(--accent);
        outline-offset: 2px;
      }
      .rating {
        width: 6rem;
        height: 1.25rem;
        color: var(--star);
      }
      table {
        border-collapse: collapse;
        margin-top: 0.5rem;
      }
      th,
      td {
        border: 1px solid var(--fg);
        padding: 0.25rem 0.75rem;
        text-align: right;
      }
      th:first-child,
      td:first-child {
        text-align: left;
      }
      figure {
        margin: 2rem 0;
      }
    </style>
  </head>
  <body>
    <header>
      <a href="#home"
        ><img
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='32'%3E%3Crect width='120' height='32' rx='6' fill='%230b57d0'/%3E%3Ctext x='60' y='22' font-family='sans-serif' font-size='16' font-weight='700' fill='white' text-anchor='middle'%3EACME%3C/text%3E%3C/svg%3E"
          width="120"
          height="32"
          alt="Acme home"
      /></a>
    </header>
    <main>
      <h1>Trail gear</h1>
      <img
        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='768' height='120'%3E%3Cpath d='M0 120 L180 30 L320 90 L470 10 L620 80 L768 40 L768 120 Z' fill='%2387a96b'/%3E%3C/svg%3E"
        width="768"
        height="120"
        alt=""
      />
      <h2>Popular this week</h2>
      <ul class="cards" role="list">
        <li>
          <a class="card" href="#trail-shoe">
            <img
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='120'%3E%3Crect width='200' height='120' fill='%23d9e4cf'/%3E%3Cpath d='M30 80 Q60 40 110 60 L170 70 L170 90 L30 90 Z' fill='%23506b3a'/%3E%3C/svg%3E"
              width="200"
              height="120"
              alt=""
            />
            <h3>Trail running shoe</h3>
          </a>
          <svg
            class="rating"
            role="img"
            aria-labelledby="rating-1"
            viewBox="0 0 100 20"
          >
            <title id="rating-1">Rated 4 out of 5</title>
            <g fill="currentColor">
              <circle cx="10" cy="10" r="8" />
              <circle cx="30" cy="10" r="8" />
              <circle cx="50" cy="10" r="8" />
              <circle cx="70" cy="10" r="8" />
            </g>
            <circle
              cx="90"
              cy="10"
              r="7"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
        </li>
        <li>
          <a class="card" href="#rain-jacket">
            <img
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='120'%3E%3Crect width='200' height='120' fill='%23d6e2f5'/%3E%3Cpath d='M70 20 L130 20 L150 100 L50 100 Z' fill='%23294a7a'/%3E%3C/svg%3E"
              width="200"
              height="120"
              alt=""
            />
            <h3>Rain jacket</h3>
          </a>
          <svg
            class="rating"
            role="img"
            aria-labelledby="rating-2"
            viewBox="0 0 100 20"
          >
            <title id="rating-2">Rated 5 out of 5</title>
            <g fill="currentColor">
              <circle cx="10" cy="10" r="8" />
              <circle cx="30" cy="10" r="8" />
              <circle cx="50" cy="10" r="8" />
              <circle cx="70" cy="10" r="8" />
              <circle cx="90" cy="10" r="8" />
            </g>
          </svg>
        </li>
      </ul>
      <h2>Shoe detail</h2>
      <img
        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='160'%3E%3Crect width='400' height='160' fill='%23d9e4cf'/%3E%3Cpath d='M40 110 Q100 40 200 80 L340 95 L340 125 L40 125 Z' fill='%23506b3a'/%3E%3Cpath d='M40 125 L340 125 L340 135 L40 135 Z' fill='%23222'/%3E%3C/svg%3E"
        width="400"
        height="160"
        alt="Moss green trail shoe, side view, with a deep black lug sole"
      />
      <figure>
        <img
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='140'%3E%3Crect x='20' y='90' width='50' height='40' fill='%230b57d0'/%3E%3Crect x='95' y='70' width='50' height='60' fill='%230b57d0'/%3E%3Crect x='170' y='45' width='50' height='85' fill='%230b57d0'/%3E%3Crect x='245' y='20' width='50' height='110' fill='%230b57d0'/%3E%3C/svg%3E"
          width="320"
          height="140"
          alt="Bar chart: shoe sales rose each quarter of 2026."
        />
        <figcaption>Trail shoe sales by quarter, 2026.</figcaption>
        <table>
          <thead>
            <tr>
              <th scope="col">Quarter</th>
              <th scope="col">Pairs sold</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Q1</td>
              <td>400</td>
            </tr>
            <tr>
              <td>Q2</td>
              <td>600</td>
            </tr>
            <tr>
              <td>Q3</td>
              <td>850</td>
            </tr>
            <tr>
              <td>Q4</td>
              <td>1,100</td>
            </tr>
          </tbody>
        </table>
      </figure>
    </main>
  </body>
</html>
`,description:"Decide alt text for images, decorative images, image links, logos, icons, charts and inline SVG",expectations:'# Expectations: image-alt\n\n1. Every `img` element has an `alt` attribute.\n2. No `alt` value looks like a file name (ends in .jpg, .png, .svg, .webp or .gif) or starts with "image of", "picture of" or "photo of" (case-insensitive).\n3. Every link or button whose only content is an image has a non-empty accessible name.\n4. In a card where image and title link to the same destination, there is a single link (no two adjacent links with the same `href`), and its accessible name is the title text.\n5. Inline SVGs are either `aria-hidden="true"` or have role `img` with a non-empty accessible name.\n6. A chart or diagram image is accompanied by its data as text (a `table` or list) in the same `figure` or immediately after it.\n',headings:["Image alt text decisions","When to use","Decide by the image's job","Common cases","DO","DO NOT","React and frameworks","What to verify"],id:"image-alt",name:"Image alt text decisions",text:`---
name: Image alt text decisions
description: Decide alt text for images, decorative images, image links, logos, icons, charts and inline SVG
criteria:
  - STD-SC-1.1.1
  - STD-SC-2.4.4
---

# Image alt text decisions

## When to use

Every \`<img>\`, \`<svg>\`, \`<picture>\`, \`<input type="image">\`, \`<area>\` and CSS background image that carries meaning. The failure agents make is rarely a missing \`alt\`; it is a wrong one: "image of a product", a filename, a duplicate of the text next to it, or a description where the image is a link that needs a destination.

## Decide by the image's job

Ask what the image does on this page, then pick one:

| The image is | alt | Example |
| --- | --- | --- |
| Decorative, or its meaning is already in nearby text | \`alt=""\` | A hero photo of a trail above an article titled "Trail running" |
| Informative | What it shows that matters here, in a sentence or less | \`alt="Moss green trail shoe, side view, with a deep lug sole"\` |
| The only content of a link or button | Where it goes or what it does | \`alt="Acme home"\` for a logo link, \`alt="Search"\` |
| Text in an image | The same text | \`alt="Autumn sale, 30% off jackets"\` |
| Complex (chart, diagram, map) | A short summary, plus the full data as text nearby | \`alt="Sales rose each quarter of 2026, see table below"\` |

The same photo can need different alt text on different pages. A product photo on its product page is informative; the same photo inside a card whose link already says the product name is decorative.

## Common cases

\`\`\`html
<a href="/">
  <img src="logo.svg" alt="Acme home" />
</a>

<a href="/products/trail-shoe" class="card">
  <img src="trail-shoe.jpg" alt="" />
  <h3>Trail running shoe</h3>
</a>

<figure>
  <img src="q-sales.png" alt="Bar chart: sales rose each quarter of 2026." />
  <figcaption>
    Quarterly sales, 2026. Full figures in the table below.
  </figcaption>
</figure>

<svg role="img" aria-labelledby="rating-title" viewBox="0 0 100 20">
  <title id="rating-title">Rated 4 out of 5</title>
  ...
</svg>

<svg aria-hidden="true" focusable="false">...</svg>
\`\`\`

In the card, one link wraps image and heading and the image is \`alt=""\`, so the link's name is the heading. Two separate links (image and title) to the same place double the Tab stops and the announcement.

## DO

- Always include the \`alt\` attribute. Without it, screen readers often read the file name.
- Use \`alt=""\` (empty, no space) for decorative images; they are then skipped entirely.
- Keep informative alt short and specific to why the image is there. Mention color, text or detail only when it matters to the page (color matters on a product page).
- For inline SVG with meaning, use \`role="img"\` and name it with \`aria-label\` or a \`<title>\` referenced by \`aria-labelledby\`. For decorative SVG, \`aria-hidden="true"\`.
- For CSS background images that carry meaning, add the meaning as real text (visually hidden if needed), or use an \`<img>\`.
- For a chart, put the data in a table or list next to it; the alt only summarizes.

## DO NOT

- Do not start with "Image of", "Picture of" or "Photo of"; screen readers already say "image". Say "Photo:" only when the medium matters, such as in a gallery of paintings and photos.
- Do not use the file name, a product SKU or "logo" alone as alt.
- Do not repeat the caption or adjacent heading in alt; make one of them carry it.
- Do not put keywords for search engines in alt.
- Do not give a decorative image \`alt\` text and \`role="presentation"\` together; \`alt=""\` is enough.
- Do not use \`title\` instead of \`alt\`.

## React and frameworks

JSX and image components (\`next/image\` and similar) require \`alt\` as a prop; pass \`alt=""\` for decorative images instead of omitting it to silence a lint rule. When alt comes from a CMS, give editors a separate "decorative" checkbox that outputs \`alt=""\`, and do not fall back to the file name or the product name blindly. SVG icon components should default to \`aria-hidden="true"\` and only take a name when used alone.

## What to verify

- Every \`img\` has an \`alt\` attribute; decorative ones are empty.
- Image-only links and buttons have names that say where they go or what they do.
- No alt text is a file name, starts with "image of", or repeats adjacent text.
- Informative SVGs are exposed as images with a name; decorative ones are hidden.
- Each chart's data is available as text.
`},{category:"widgets",criteria:["STD-SC-2.1.1","STD-SC-2.4.3","STD-SC-4.1.2"],demo:`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Menu button demo</title>
    <style>
      :root {
        color-scheme: light dark;
        --bg: #ffffff;
        --fg: #1a1a1a;
        --hover: #e8eefc;
        --accent: #0b57d0;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --bg: #121212;
          --fg: #f0f0f0;
          --hover: #263248;
          --accent: #8ab4f8;
        }
      }
      body {
        margin: 0;
        padding: 2rem 1rem;
        font:
          1rem/1.5 system-ui,
          sans-serif;
        background: var(--bg);
        color: var(--fg);
      }
      main {
        max-width: 40rem;
        margin: 0 auto;
      }
      .wrap {
        position: relative;
        display: inline-block;
      }
      button {
        font: inherit;
        padding: 0.5rem 1rem;
        border: 2px solid var(--fg);
        border-radius: 0.375rem;
        background: var(--bg);
        color: var(--fg);
        cursor: pointer;
      }
      :focus-visible {
        outline: 3px solid var(--accent);
        outline-offset: 2px;
      }
      [role="menu"] {
        position: absolute;
        top: calc(100% + 0.25rem);
        left: 0;
        min-width: 10rem;
        margin: 0;
        padding: 0.25rem;
        list-style: none;
        border: 2px solid var(--fg);
        border-radius: 0.375rem;
        background: var(--bg);
        z-index: 1;
      }
      [role="menuitem"] {
        padding: 0.5rem 0.75rem;
        border-radius: 0.25rem;
        cursor: pointer;
      }
      [role="menuitem"]:hover,
      [role="menuitem"]:focus {
        background: var(--hover);
        outline: 2px solid var(--accent);
        outline-offset: -2px;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Quarterly report.pdf</h1>
      <div class="wrap">
        <button
          type="button"
          id="actions-button"
          aria-haspopup="menu"
          aria-expanded="false"
          aria-controls="actions-menu"
        >
          Actions
        </button>
        <ul
          id="actions-menu"
          role="menu"
          aria-labelledby="actions-button"
          hidden
        >
          <li role="menuitem" tabindex="-1">Rename</li>
          <li role="menuitem" tabindex="-1">Duplicate</li>
          <li role="menuitem" tabindex="-1">Delete</li>
        </ul>
      </div>
      <p id="log" role="status"></p>
      <p><a href="#top">Back to files</a></p>
    </main>
    <script>
      const button = document.getElementById("actions-button");
      const menu = document.getElementById("actions-menu");
      const log = document.getElementById("log");
      const items = [...menu.querySelectorAll('[role="menuitem"]')];
      const activate = (item) => {
        log.textContent = item.textContent + " chosen.";
      };

      function open(index) {
        menu.hidden = false;
        button.setAttribute("aria-expanded", "true");
        items.at(index).focus();
      }
      function close(returnFocus) {
        menu.hidden = true;
        button.setAttribute("aria-expanded", "false");
        if (returnFocus) button.focus();
      }
      button.addEventListener("click", () =>
        menu.hidden ? open(0) : close(true)
      );
      button.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          open(0);
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          open(-1);
        }
      });
      menu.addEventListener("keydown", (e) => {
        const i = items.indexOf(document.activeElement);
        const moves = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: -1 };
        if (e.key in moves) {
          e.preventDefault();
          items.at(moves[e.key] % items.length).focus();
          return;
        }
        if (e.key === "Escape") {
          e.preventDefault();
          close(true);
          return;
        }
        if (e.key === "Tab") {
          close(false);
          return;
        }
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activate(document.activeElement);
          close(true);
          return;
        }
        if (e.key.length === 1) {
          const next =
            items.find(
              (item, n) =>
                n > i &&
                item.textContent.toLowerCase().startsWith(e.key.toLowerCase())
            ) ??
            items.find((item) =>
              item.textContent.toLowerCase().startsWith(e.key.toLowerCase())
            );
          next?.focus();
        }
      });
      menu.addEventListener("click", (e) => {
        const item = e.target.closest('[role="menuitem"]');
        if (item) {
          activate(item);
          close(true);
        }
      });
      document.addEventListener("pointerdown", (e) => {
        if (!menu.hidden && !menu.contains(e.target) && e.target !== button)
          close(false);
      });
    </script>
  </body>
</html>
`,description:"Build an accessible actions dropdown menu button with role menu, arrow keys and Escape, or a nav dropdown without it",expectations:'# Expectations: menu-button\n\n1. The trigger is a `button` with `aria-haspopup` of `menu` or `true` and `aria-expanded="false"` while the menu is closed.\n2. Pressing Arrow Down on the focused trigger opens an element with role `menu`, sets `aria-expanded="true"` and focuses its first `menuitem`.\n3. Pressing Arrow Down on the last menu item moves focus to the first item; Arrow Up on the first moves to the last.\n4. Pressing Escape in the open menu closes it, sets `aria-expanded="false"` and focuses the trigger.\n5. Menu items are not in the Tab order: pressing Tab in the open menu closes the menu and focus leaves it.\n6. Pressing Enter on a menu item runs its action, closes the menu and focuses the trigger.\n',headings:["Menu button","When to use: action menu or navigation dropdown","Action menu markup","Keyboard model","DO","DO NOT","React and frameworks","What to verify"],id:"menu-button",name:"Menu button",text:`---
name: Menu button
description: Build an accessible actions dropdown menu button with role menu, arrow keys and Escape, or a nav dropdown without it
criteria:
  - STD-SC-2.1.1
  - STD-SC-2.4.3
  - STD-SC-4.1.2
---

# Menu button

## When to use: action menu or navigation dropdown

Decide first which one you are building. The two look the same and need different markup.

- **Action menu** (a "More" or "..." button with Edit, Duplicate, Delete; a toolbar menu in an app): use \`role="menu"\` with \`role="menuitem"\` children and the full keyboard model below.
- **Navigation dropdown** (site header "Products" that opens a list of links): do not use \`role="menu"\`. Build a disclosure: a \`<button aria-expanded>\` that shows a plain list of links. Screen readers switch into an application mode for menus, and users expect arrow keys there; a list of links in a menu role breaks normal link reading and Tab.

Agents most often get this wrong by putting \`role="menu"\` on site navigation.

## Action menu markup

\`\`\`html
<button
  type="button"
  id="actions-button"
  aria-haspopup="menu"
  aria-expanded="false"
  aria-controls="actions-menu"
>
  Actions
</button>
<ul id="actions-menu" role="menu" aria-labelledby="actions-button" hidden>
  <li role="menuitem" tabindex="-1">Edit</li>
  <li role="menuitem" tabindex="-1">Duplicate</li>
  <li role="menuitem" tabindex="-1">Delete</li>
</ul>
\`\`\`

## Keyboard model

| Key | On the button | In the open menu |
| --- | --- | --- |
| Enter, Space, Arrow Down | Open, focus first item | Enter or Space activates the item and closes |
| Arrow Up | Open, focus last item | Previous item, wraps to last |
| Arrow Down |  | Next item, wraps to first |
| Home, End |  | First, last item |
| Escape |  | Close, focus the button |
| Tab |  | Close, let focus move on naturally |
| A letter |  | Optional: next item starting with it |

\`\`\`js
const button = document.getElementById("actions-button");
const menu = document.getElementById("actions-menu");
const items = [...menu.querySelectorAll('[role="menuitem"]')];

function open(index) {
  menu.hidden = false;
  button.setAttribute("aria-expanded", "true");
  items.at(index).focus();
}
function close(returnFocus) {
  menu.hidden = true;
  button.setAttribute("aria-expanded", "false");
  if (returnFocus) button.focus();
}
button.addEventListener("click", () => (menu.hidden ? open(0) : close(true)));
button.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    open(0);
  }
  if (e.key === "ArrowUp") {
    e.preventDefault();
    open(-1);
  }
});
menu.addEventListener("keydown", (e) => {
  const i = items.indexOf(document.activeElement);
  const moves = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: -1 };
  if (e.key in moves) {
    e.preventDefault();
    items.at(moves[e.key] % items.length).focus();
  }
  if (e.key === "Escape") close(true);
  if (e.key === "Tab") close(false);
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    activate(document.activeElement);
    close(true);
  }
});
menu.addEventListener("click", (e) => {
  if (e.target.role === "menuitem") {
    activate(e.target);
    close(true);
  }
});
document.addEventListener("pointerdown", (e) => {
  if (!menu.hidden && !menu.contains(e.target) && e.target !== button)
    close(false);
});
\`\`\`

## DO

- Give menu items \`tabindex="-1"\` and move focus with \`.focus()\` (roving focus). Only one place in the menu takes focus at a time; Tab leaves the menu.
- Toggle \`aria-expanded\` on the button and \`hidden\` on the menu together.
- Name the menu with \`aria-labelledby\` pointing at the button.
- Use \`menuitemcheckbox\` or \`menuitemradio\` with \`aria-checked\` for toggles inside a menu ("Show grid").
- Close on Escape, on Tab, on item activation and on a click outside.

## DO NOT

- Do not use \`role="menu"\` for site navigation or for a list of links.
- Do not leave menu items in the Tab order (\`tabindex="0"\` on every item). Arrow keys move between items.
- Do not put buttons or links inside a \`menuitem\`; the item itself is the control. If you need real links, you are building navigation.
- Do not open the menu on hover only. Hover may open it for pointer users; the button must still open it on click and keyboard.
- Do not forget the button's own name. An icon-only "..." trigger needs \`aria-label="More actions"\`.

## React and frameworks

Keep focus logic in an effect that runs after the menu renders: calling \`.focus()\` in the same handler that sets \`open\` state fails because the items do not exist yet. Store item refs in an array, and the active index in state. A headless library that already implements this model (for example the menu from a maintained component library) is a better choice than a fresh one; check that it does not apply \`role="menu"\` to your navigation.

## What to verify

- Arrow Down on the button opens the menu with focus on the first item; Arrow Up on the button focuses the last.
- Arrow keys wrap; Home and End jump.
- Escape closes and focus is back on the button; \`aria-expanded\` is false.
- Tab from an open menu closes it.
- A screen reader announces "menu" and the item count on open.
`},{category:"motion",criteria:["STD-SC-2.2.2","STD-SC-2.3.1"],demo:`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Reduced motion demo</title>
    <style>
      :root {
        color-scheme: light dark;
        --bg: #ffffff;
        --fg: #1a1a1a;
        --slide: #e8eefc;
        --accent: #0b57d0;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --bg: #121212;
          --fg: #f0f0f0;
          --slide: #263248;
          --accent: #8ab4f8;
        }
      }
      html {
        scroll-behavior: smooth;
      }
      @media (prefers-reduced-motion: reduce) {
        html {
          scroll-behavior: auto;
        }
      }
      body {
        margin: 0;
        padding: 2rem 1rem;
        font:
          1rem/1.5 system-ui,
          sans-serif;
        background: var(--bg);
        color: var(--fg);
      }
      main {
        max-width: 40rem;
        margin: 0 auto;
      }
      button {
        font: inherit;
        padding: 0.5rem 1rem;
        border: 2px solid var(--fg);
        border-radius: 0.375rem;
        background: var(--bg);
        color: var(--fg);
        cursor: pointer;
      }
      :focus-visible {
        outline: 3px solid var(--accent);
        outline-offset: 2px;
      }
      .carousel {
        border: 2px solid var(--fg);
        border-radius: 0.5rem;
        padding: 1rem;
      }
      .controls {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-bottom: 1rem;
      }
      .slide {
        background: var(--slide);
        border-radius: 0.375rem;
        padding: 2rem 1rem;
      }
      .slide h3 {
        margin-top: 0;
      }
      .panel {
        margin-top: 1rem;
        padding: 1rem;
        border: 2px solid var(--fg);
        border-radius: 0.375rem;
        transition:
          transform 300ms ease,
          opacity 300ms ease;
      }
      .panel[data-state="closed"] {
        transform: translateY(1rem);
        opacity: 0;
        visibility: hidden;
      }
      @media (prefers-reduced-motion: reduce) {
        .panel {
          transition: opacity 150ms linear;
        }
        .panel[data-state="closed"] {
          transform: none;
        }
      }
      a {
        color: var(--accent);
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Autumn collection</h1>
      <section
        class="carousel"
        aria-roledescription="carousel"
        aria-labelledby="carousel-title"
      >
        <h2 id="carousel-title">Featured</h2>
        <div class="controls">
          <button type="button" id="toggle" aria-pressed="false">
            Pause slides
          </button>
          <button type="button" id="prev">Previous slide</button>
          <button type="button" id="next">Next slide</button>
        </div>
        <div class="slide" id="slide" aria-live="off">
          <h3 id="slide-title">Rain jackets</h3>
          <p id="slide-text">Waterproof shells for wet hikes.</p>
        </div>
      </section>
      <p>
        <button
          type="button"
          id="reveal"
          aria-expanded="false"
          aria-controls="details"
        >
          Show size guide
        </button>
      </p>
      <div class="panel" id="details" data-state="closed">
        <p>Measure your chest and compare it with the chart on the label.</p>
      </div>
      <p><a href="#carousel-title">Back to featured</a></p>
    </main>
    <script>
      const slides = [
        ["Rain jackets", "Waterproof shells for wet hikes."],
        ["Hiking boots", "Grippy soles for rock and mud."],
        ["Wool layers", "Warm when wet, soft on skin."],
      ];
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
      const slide = document.getElementById("slide");
      const title = document.getElementById("slide-title");
      const text = document.getElementById("slide-text");
      const toggle = document.getElementById("toggle");
      const carousel = document.querySelector(".carousel");
      let index = 0;
      let timer = null;
      let userPaused = reduce.matches;
      let hovering = false;

      function show(i) {
        index = (i + slides.length) % slides.length;
        [title.textContent, text.textContent] = slides[index];
      }
      function sync() {
        const running = !userPaused && !hovering && !reduce.matches;
        clearInterval(timer);
        timer = running ? setInterval(() => show(index + 1), 5000) : null;
        toggle.setAttribute("aria-pressed", String(userPaused));
        slide.setAttribute(
          "aria-live",
          userPaused || reduce.matches ? "polite" : "off"
        );
      }
      toggle.addEventListener("click", () => {
        userPaused = !userPaused;
        sync();
      });
      document
        .getElementById("prev")
        .addEventListener("click", () => show(index - 1));
      document
        .getElementById("next")
        .addEventListener("click", () => show(index + 1));
      carousel.addEventListener("pointerenter", () => {
        hovering = true;
        sync();
      });
      carousel.addEventListener("pointerleave", () => {
        hovering = false;
        sync();
      });
      carousel.addEventListener("focusin", () => {
        hovering = true;
        sync();
      });
      carousel.addEventListener("focusout", (e) => {
        if (!carousel.contains(e.relatedTarget)) {
          hovering = false;
          sync();
        }
      });
      reduce.addEventListener("change", () => {
        if (reduce.matches) userPaused = true;
        sync();
      });

      const reveal = document.getElementById("reveal");
      const details = document.getElementById("details");
      reveal.addEventListener("click", () => {
        const open = reveal.getAttribute("aria-expanded") === "true";
        reveal.setAttribute("aria-expanded", String(!open));
        details.dataset.state = open ? "closed" : "open";
      });
      sync();
    </script>
  </body>
</html>
`,description:"Respect prefers-reduced-motion in CSS and JavaScript animations, and give carousels and autoplay a pause control",expectations:"# Expectations: reduced-motion\n\n1. With `prefers-reduced-motion: reduce` emulated, an auto-advancing carousel or ticker does not change its visible slide within 10 seconds of load.\n2. Without reduced motion, auto-moving content has a visible `button` reachable with Tab that stops the movement; after activating it, the visible slide does not change for 10 seconds.\n3. With `prefers-reduced-motion: reduce` emulated, the computed `scroll-behavior` of the root element is `auto`.\n4. With `prefers-reduced-motion: reduce` emulated, elements that animate on open or reveal have no computed `transform` other than `none` during the animation (only opacity or color may change).\n5. With reduced motion emulated, every control in the page still works: activating a reveal or open control still shows its content.\n",headings:["Reduced motion and moving content","When to use","CSS: reduce, do not just delete","JavaScript animations and autoplay","Carousels and auto-advance","DO","DO NOT","React and frameworks","What to verify"],id:"reduced-motion",name:"Reduced motion and moving content",text:`---
name: Reduced motion and moving content
description: Respect prefers-reduced-motion in CSS and JavaScript animations, and give carousels and autoplay a pause control
criteria:
  - STD-SC-2.2.2
  - STD-SC-2.3.1
---

# Reduced motion and moving content

## When to use

Any animation, transition, parallax, smooth scrolling, auto-advancing carousel, marquee, autoplaying video or animated background. Two separate jobs:

1. **Moving content that starts by itself** and lasts more than five seconds (carousels, tickers, background video, animated illustrations) needs a visible way to pause, stop or hide it. This applies to everyone, whatever their settings.
2. **The user's reduced motion setting** (\`prefers-reduced-motion: reduce\`, set in the operating system) asks for less movement. People with vestibular disorders get dizzy or nauseous from large movement, zoom and parallax. Honor it in CSS and in JavaScript.

Separately, keep any flashing to at most three flashes in any one second, unless the flashes are small and dim enough to stay below the general and red flash thresholds.

## CSS: reduce, do not just delete

\`\`\`css
.panel {
  transition:
    transform 300ms ease,
    opacity 300ms ease;
}
.panel[data-state="closed"] {
  transform: translateY(1rem);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .panel {
    transition: opacity 150ms linear;
  }
  .panel[data-state="closed"] {
    transform: none;
  }
}

html {
  scroll-behavior: smooth;
}
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
\`\`\`

Replace movement (slide, zoom, spin, parallax) with a short fade or an instant change. Fades and color changes are fine; it is motion across the screen that triggers symptoms. You can also write motion only for users who did not ask for less: \`@media (prefers-reduced-motion: no-preference) { ... }\`.

## JavaScript animations and autoplay

\`\`\`js
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

function scrollToSection(el) {
  el.scrollIntoView({ behavior: reduce.matches ? "auto" : "smooth" });
}

reduce.addEventListener("change", () => {
  if (reduce.matches) carousel.pause();
});
\`\`\`

Check the query at the moment you animate (or listen for \`change\`); users can switch it while the page is open. Web Animations, GSAP, Motion and similar libraries do not read the setting for you unless you configure them to.

## Carousels and auto-advance

- Do not auto-advance when reduced motion is set.
- Otherwise, give a visible Pause button as the first control of the carousel, and keep it a real \`<button>\` with a name that matches its action ("Pause slides" / "Play slides", or a fixed name with \`aria-pressed\`).
- Pause on hover and on keyboard focus inside the carousel, and do not resume on its own after the user paused.
- Do not use a live region for slide changes while auto-advancing; it talks over everything. Use \`aria-live="polite"\` on the slide container only when auto-advance is off.

## DO

- Ship \`<video>\` backgrounds without \`autoplay\` when reduced motion is set, or with a visible pause button in all cases.
- Keep animations short (under 300 ms for UI feedback) and avoid large scale and rotation even without the setting.
- Test with the setting on: macOS Accessibility, Display, Reduce motion; Windows Settings, Accessibility, Visual effects, Animation effects off; or DevTools rendering emulation.

## DO NOT

- Do not use a global \`* { animation: none !important; transition: none !important; }\` as your only handling. Code waiting for \`animationend\` or \`transitionend\` then never runs, and menus stop opening. Handle motion per component; if you add a safety net, use \`animation-duration: 1ms; animation-iteration-count: 1; transition-duration: 1ms;\` so end events still fire.
- Do not autoplay animated GIFs that loop forever; show a still with a play control.
- Do not use parallax or scroll-linked zoom without a reduced motion fallback.
- Do not flash content (alerts, game effects, video intros) more than three times per second.

## React and frameworks

Read the setting in a hook backed by \`matchMedia\` and its \`change\` event, and pass it to your animation library (Motion's \`useReducedMotion\`, or a global config such as \`MotionConfig reducedMotion="user"\`). Server rendering cannot know the setting; render the reduced version or the static first frame by default and start motion after mount.

## What to verify

- With reduced motion emulated: no element moves across the screen, carousels do not advance, smooth scrolling is off, and every feature still works.
- Without it: every auto-moving thing has a visible pause control reachable by keyboard, and pausing sticks.
- Nothing flashes more than three times a second.
`},{category:"forms",criteria:["STD-SC-1.3.1","STD-SC-1.3.5","STD-SC-1.4.1","STD-SC-3.3.2"],demo:`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Delivery details demo</title>
    <style>
      :root {
        color-scheme: light dark;
        --bg: #ffffff;
        --fg: #1a1a1a;
        --muted: #4a4a4a;
        --accent: #0b57d0;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --bg: #121212;
          --fg: #f0f0f0;
          --muted: #c4c4c4;
          --accent: #8ab4f8;
        }
      }
      body {
        margin: 0;
        padding: 2rem 1rem;
        font:
          1rem/1.5 system-ui,
          sans-serif;
        background: var(--bg);
        color: var(--fg);
      }
      main {
        max-width: 32rem;
        margin: 0 auto;
      }
      .field {
        margin-bottom: 1.25rem;
      }
      label {
        display: block;
        font-weight: 600;
      }
      .hint {
        margin: 0 0 0.25rem;
        color: var(--muted);
      }
      .opt {
        font-weight: 400;
      }
      input[type="text"],
      input[type="email"],
      input[type="tel"] {
        box-sizing: border-box;
        width: 100%;
        font: inherit;
        padding: 0.5rem;
        border: 2px solid var(--fg);
        border-radius: 0.375rem;
        background: var(--bg);
        color: var(--fg);
      }
      fieldset {
        border: 2px solid var(--muted);
        border-radius: 0.375rem;
        margin: 0 0 1.25rem;
        padding: 0.75rem 1rem;
      }
      legend {
        font-weight: 600;
        padding: 0 0.25rem;
      }
      fieldset label {
        font-weight: 400;
        display: flex;
        gap: 0.5rem;
        align-items: center;
        padding: 0.25rem 0;
      }
      input[type="radio"] {
        width: 1.25rem;
        height: 1.25rem;
        accent-color: var(--accent);
      }
      button {
        font: inherit;
        padding: 0.5rem 1rem;
        border: 2px solid var(--fg);
        border-radius: 0.375rem;
        background: var(--fg);
        color: var(--bg);
        cursor: pointer;
      }
      :focus-visible {
        outline: 3px solid var(--accent);
        outline-offset: 2px;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Delivery details</h1>
      <p>All fields are required unless marked optional.</p>
      <form>
        <div class="field">
          <label for="full-name">Full name</label>
          <input
            id="full-name"
            name="name"
            type="text"
            autocomplete="name"
            required
          />
        </div>
        <div class="field">
          <label for="email">Email address</label>
          <p id="email-hint" class="hint">
            We send the receipt and tracking link here.
          </p>
          <input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            required
            aria-describedby="email-hint"
          />
        </div>
        <div class="field">
          <label for="phone">Phone number</label>
          <p id="phone-hint" class="hint">
            Include the country code, like +420.
          </p>
          <input
            id="phone"
            name="phone"
            type="tel"
            autocomplete="tel"
            required
            aria-describedby="phone-hint"
          />
        </div>
        <div class="field">
          <label for="company"
            >Company <span class="opt">(optional)</span></label
          >
          <input
            id="company"
            name="company"
            type="text"
            autocomplete="organization"
          />
        </div>
        <div class="field">
          <label for="postal">Postal code</label>
          <input
            id="postal"
            name="postal"
            type="text"
            inputmode="numeric"
            autocomplete="shipping postal-code"
            required
          />
        </div>
        <fieldset>
          <legend>Delivery speed</legend>
          <label
            ><input
              type="radio"
              name="speed"
              value="standard"
              checked
              required
            />
            Standard, 3 to 5 days</label
          >
          <label
            ><input type="radio" name="speed" value="express" /> Express, next
            day</label
          >
        </fieldset>
        <button>Continue to payment</button>
      </form>
    </main>
  </body>
</html>
`,description:"Label form inputs, mark required fields and attach hint text with label, required, aria-describedby and autocomplete",expectations:'# Expectations: required-and-hints\n\n1. Every text input, select and textarea has an accessible name that matches (or starts with) its visible label text, and none relies on `placeholder` alone.\n2. Fields shown as required have the `required` attribute (or `aria-required="true"` on a custom control), and the visible required marker is text, not color alone.\n3. A field with a visible hint has that hint text in its accessible description.\n4. Radio buttons that answer one question are inside a `fieldset` whose `legend` text is the group\'s accessible name.\n5. Name, email and phone fields have the matching `autocomplete` tokens `name` (or `given-name`/`family-name`), `email` and `tel`.\n6. Clicking a visible label moves focus to its field.\n',headings:["Labels, required fields and hints","When to use","The field","Required and optional","Group related controls","autocomplete tokens agents miss","DO","DO NOT","React and frameworks","What to verify"],id:"required-and-hints",name:"Labels, required fields and hints",text:'---\nname: Labels, required fields and hints\ndescription: Label form inputs, mark required fields and attach hint text with label, required, aria-describedby and autocomplete\ncriteria:\n  - STD-SC-1.3.1\n  - STD-SC-1.3.5\n  - STD-SC-1.4.1\n  - STD-SC-3.3.2\n---\n\n# Labels, required fields and hints\n\n## When to use\n\nEvery form field. Most form failures are not exotic widgets; they are a field with no real label, a required marker only in color, or a format hint that a screen reader never reads.\n\n## The field\n\n```html\n<div class="field">\n  <label for="phone">Phone number <span class="req">(required)</span></label>\n  <p id="phone-hint" class="hint">\n    We only call about your delivery. Include the country code, like +420.\n  </p>\n  <input\n    id="phone"\n    name="phone"\n    type="tel"\n    autocomplete="tel"\n    required\n    aria-describedby="phone-hint"\n  />\n</div>\n```\n\n- `<label for>` gives the input its accessible name and a bigger click target.\n- The hint sits between label and input, so it is seen before typing, and `aria-describedby` makes screen readers read it after the name.\n- `required` exposes the state to assistive technology and to the Constraint Validation API. The visible "(required)" text is for everyone else.\n- `autocomplete="tel"` lets browsers and password managers fill it and tells assistive tools what the field is for.\n\n## Required and optional\n\n- If most fields are required, mark the few optional ones with "(optional)" in the label and say so once above the form. If most are optional, mark the required ones.\n- If you use an asterisk, explain it above the form ("Fields marked * are required") and keep it in the label text. Hide the asterisk itself from screen readers only when `required` is set: `<span aria-hidden="true">*</span>`.\n- Never signal required only with red text or a colored border.\n\n## Group related controls\n\nRadio buttons and checkboxes that answer one question go in a `<fieldset>` with a `<legend>` holding the question. Without it, a screen reader hears "Express, radio button" with no idea what is being asked.\n\n```html\n<fieldset>\n  <legend>Delivery speed</legend>\n  <label\n    ><input type="radio" name="speed" value="standard" checked /> Standard, 3 to\n    5 days</label\n  >\n  <label\n    ><input type="radio" name="speed" value="express" /> Express, next\n    day</label\n  >\n</fieldset>\n```\n\nUse the same for a date split into day, month and year fields, and for an address block.\n\n## autocomplete tokens agents miss\n\nUse the exact tokens: `name`, `given-name`, `family-name`, `email`, `tel`, `street-address`, `address-line1`, `address-level2` (city), `postal-code`, `country-name`, `organization`, `cc-name`, `cc-number`, `cc-exp`, `cc-csc`, `bday`, `username`, `current-password`, `new-password`, `one-time-code`. Prefix with `shipping` or `billing` when a form has both. Do not invent tokens (`autocomplete="phone"` is not valid; it is `tel`). Use `autocomplete="off"` only for fields that are not about the user, such as a search box or a coupon code.\n\n## DO\n\n- Keep labels visible at all times. A floating label that shrinks into the border is fine; one that disappears is not.\n- Use the right `type`: `email`, `tel`, `url`, `number` only for quantities (not for card numbers or postal codes; use `inputmode="numeric"` with `type="text"` there).\n- Put units and formats in the label or hint ("Weight in kg", "Date, for example 27 3 2026"), not only in the placeholder.\n- Make the visible label text the start of the accessible name. If you add `aria-label`, it must contain the visible text.\n\n## DO NOT\n\n- Do not use `placeholder` as the label. It disappears on input, is often low contrast, and is not reliably announced as a name.\n- Do not put the label in `aria-label` when a visible `<label>` could be used; visible labels help everyone.\n- Do not wrap the hint inside the `<label>`; the whole hint then becomes the field\'s name. Link it with `aria-describedby`.\n- Do not use `aria-required="true"` on a native input that can take `required`.\n- Do not split one value into several inputs (code fields with one character each) unless each has its own label ("Digit 1 of 6").\n\n## React and frameworks\n\n`htmlFor`, not `for`. Generate ids with `useId()` and derive the hint id from it (`${id}-hint`) so `aria-describedby` always matches. Component libraries often render a label element that is not associated with the input; inspect the accessibility tree, not the screen. When a field has both a hint and an error, list both ids: `aria-describedby="phone-hint phone-error"`.\n\n## What to verify\n\n- Clicking each label focuses its field.\n- The accessibility tree shows each input\'s name equal to its visible label, the hint as its description, and required where marked.\n- Radio and checkbox groups announce their legend.\n- Browser autofill offers the right values for name, email, address and phone fields.\n'},{category:"navigation",criteria:["STD-SC-1.3.1","STD-SC-2.4.1","STD-SC-2.4.6"],demo:`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Shop - Acme demo</title>
    <style>
      :root {
        color-scheme: light dark;
        --bg: #ffffff;
        --fg: #1a1a1a;
        --band: #f3f4f6;
        --accent: #0b57d0;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --bg: #121212;
          --fg: #f0f0f0;
          --band: #1f1f1f;
          --accent: #8ab4f8;
        }
      }
      body {
        margin: 0;
        font:
          1rem/1.5 system-ui,
          sans-serif;
        background: var(--bg);
        color: var(--fg);
      }
      a {
        color: var(--accent);
      }
      .skip-link {
        position: absolute;
        left: 0.5rem;
        top: 0.5rem;
        z-index: 10;
        padding: 0.5rem 1rem;
        background: var(--fg);
        color: var(--bg);
        font-weight: 600;
        border-radius: 0.375rem;
        transform: translateY(-200%);
      }
      .skip-link:focus {
        transform: none;
      }
      :focus-visible {
        outline: 3px solid var(--accent);
        outline-offset: 2px;
      }
      main:focus {
        outline: none;
      }
      header,
      footer {
        background: var(--band);
        padding: 1rem;
      }
      header {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem 2rem;
        align-items: center;
      }
      nav ul {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin: 0;
        padding: 0;
        list-style: none;
      }
      [aria-current="page"] {
        font-weight: 700;
        text-decoration-thickness: 3px;
      }
      main {
        max-width: 48rem;
        margin: 0 auto;
        padding: 2rem 1rem;
      }
      .logo {
        font-weight: 800;
        color: var(--fg);
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to main content</a>
    <header>
      <a class="logo" href="#home">Acme</a>
      <nav aria-label="Main">
        <ul role="list">
          <li><a href="#shop" aria-current="page">Shop</a></li>
          <li><a href="#journal">Journal</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#cart">Cart</a></li>
        </ul>
      </nav>
      <search>
        <form>
          <label for="q">Search products</label>
          <input id="q" name="q" type="search" />
          <button>Search</button>
        </form>
      </search>
    </header>
    <main id="main" tabindex="-1">
      <h1>Shop</h1>
      <p>New arrivals for the autumn season.</p>
      <h2>Jackets</h2>
      <p><a href="#rain-jacket">Rain jacket</a></p>
      <h2>Boots</h2>
      <p><a href="#hiking-boot">Hiking boot</a></p>
    </main>
    <footer>
      <nav aria-label="Footer">
        <ul role="list">
          <li><a href="#contact">Contact</a></li>
          <li><a href="#accessibility">Accessibility statement</a></li>
        </ul>
      </nav>
    </footer>
  </body>
</html>
`,description:"Add a skip to main content link and page landmarks (header, nav, main, footer) with correct labels and heading structure",expectations:'# Expectations: skip-link-landmarks\n\n1. The first Tab press from page load focuses a link whose accessible name starts with "Skip", and that link is visible (inside the viewport, non-zero size) while focused.\n2. Activating the skip link moves focus to the `main` element or to an element inside it.\n3. After activating the skip link, the next Tab press focuses an element inside `main`.\n4. The page has exactly one `main` landmark, one `banner` and one `contentinfo` landmark.\n5. When the page has more than one `navigation` landmark, each has a distinct accessible name.\n6. The page has exactly one `h1`, and it is inside `main`.\n',headings:["Skip link and landmarks","When to use","The shell","Skip link","Landmarks","Headings","DO NOT","React and frameworks","What to verify"],id:"skip-link-landmarks",name:"Skip link and landmarks",text:`---
name: Skip link and landmarks
description: Add a skip to main content link and page landmarks (header, nav, main, footer) with correct labels and heading structure
criteria:
  - STD-SC-1.3.1
  - STD-SC-2.4.1
  - STD-SC-2.4.6
---

# Skip link and landmarks

## When to use

Every page layout. Keyboard users press Tab through every header link on every page unless a skip link lets them jump; screen reader users jump by landmark and by heading. Both come from the page shell, so fix them once in the layout component.

## The shell

\`\`\`html
<body>
  <a class="skip-link" href="#main">Skip to main content</a>
  <header>
    <a href="/">Acme home</a>
    <nav aria-label="Main">
      <ul>
        <li><a href="/shop" aria-current="page">Shop</a></li>
        <li><a href="/journal">Journal</a></li>
      </ul>
    </nav>
  </header>
  <main id="main" tabindex="-1">
    <h1>Shop</h1>
    ...
  </main>
  <footer>
    <nav aria-label="Footer">...</nav>
  </footer>
</body>
\`\`\`

\`\`\`css
.skip-link {
  position: absolute;
  left: 0.5rem;
  top: 0.5rem;
  transform: translateY(-200%);
}
.skip-link:focus {
  transform: none;
}
main:focus {
  outline: none;
}
\`\`\`

## Skip link

- Make it the first focusable element in the body, before the logo.
- Hide it off screen until focused, then show it fully, with readable contrast. Do not use \`display: none\` or \`visibility: hidden\`; those remove it from the Tab order.
- Point it at the \`<main>\` element's id. Give \`main\` \`tabindex="-1"\` so focus actually lands there in every browser and the next Tab continues inside main. Suppress the focus ring on \`main\` only, since it is not an interactive control.
- Keep the text plain: "Skip to main content".
- With a hash router, \`href="#main"\` changes the route. Handle the click instead: \`event.preventDefault(); main.focus();\`.

## Landmarks

- \`header\` directly in \`body\` is the banner; \`footer\` directly in \`body\` is the content info. Inside \`article\` or \`section\` they are not landmarks, which is fine.
- Exactly one \`<main>\` per page, not nested in another landmark.
- When there is more than one \`<nav>\`, give each a distinct \`aria-label\` ("Main", "Footer", "Breadcrumb"). Do not put the word "navigation" in the label; the role already says it.
- Use \`<aside>\` for content that stands apart (related links, a filter sidebar), and \`<section aria-labelledby>\` only for regions worth jumping to; an unnamed \`section\` is not a landmark.
- Search forms: wrap them in \`<search>\` (or \`role="search"\` on the form).
- Mark the current page link with \`aria-current="page"\`.

## Headings

- One \`<h1>\` per page naming the page's own content, not the site name.
- Do not skip levels going down (h2 then h4). Pick the level by structure, then style it any size.
- Headings describe the section under them. A card title is a heading if users would jump to it.

## DO NOT

- Do not add \`role="navigation"\`, \`role="main"\` or \`role="banner"\` to the elements that already have them.
- Do not wrap the whole page in \`<main>\` including header and footer.
- Do not make headings out of styled \`div\`s, and do not use heading tags for visual size alone (a "Sale!" badge is not an h2).
- Do not use \`aria-label\` on a \`div\` without a role to make it a region; it does nothing.
- Do not put the skip link inside the header's \`nav\`.

## React and frameworks

Put the skip link and \`<main>\` in the root layout, not in each page, and keep \`main\`'s id stable across routes. In Next.js, Remix and similar, the root layout renders once; the \`href="#main"\` approach works there as long as the router uses real paths. Hash routers need the click handler above.

## What to verify

- The first Tab on a fresh page shows the skip link; Enter moves focus into main, and the next Tab reaches the first control inside main.
- The accessibility tree shows banner, navigation landmarks with distinct names, one main, and content info.
- The heading outline starts at one h1 and does not skip levels.
`},{category:"navigation",criteria:["STD-SC-2.4.2","STD-SC-2.4.3","STD-SC-4.1.3"],demo:`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Shop - Acme</title>
    <style>
      :root {
        color-scheme: light dark;
        --bg: #ffffff;
        --fg: #1a1a1a;
        --band: #f3f4f6;
        --accent: #0b57d0;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --bg: #121212;
          --fg: #f0f0f0;
          --band: #1f1f1f;
          --accent: #8ab4f8;
        }
      }
      body {
        margin: 0;
        font:
          1rem/1.5 system-ui,
          sans-serif;
        background: var(--bg);
        color: var(--fg);
      }
      a {
        color: var(--accent);
      }
      :focus-visible {
        outline: 3px solid var(--accent);
        outline-offset: 2px;
      }
      h1:focus {
        outline: none;
      }
      header {
        background: var(--band);
        padding: 1rem;
      }
      nav ul {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin: 0;
        padding: 0;
        list-style: none;
      }
      [aria-current="page"] {
        font-weight: 700;
        text-decoration-thickness: 3px;
      }
      main {
        max-width: 48rem;
        margin: 0 auto;
        padding: 2rem 1rem;
      }
    </style>
  </head>
  <body>
    <header>
      <nav aria-label="Main">
        <ul role="list">
          <li><a href="?view=shop" data-route aria-current="page">Shop</a></li>
          <li><a href="?view=journal" data-route>Journal</a></li>
          <li><a href="?view=about" data-route>About</a></li>
        </ul>
      </nav>
    </header>
    <main id="outlet"></main>
    <script>
      const views = {
        shop: {
          title: "Shop",
          html: '<h1>Shop</h1><p>New arrivals for the autumn season.</p><p><a href="#rain-jacket">Rain jacket</a></p>',
        },
        journal: {
          title: "Journal",
          html: '<h1>Journal</h1><p>Stories from the trail.</p><p><a href="#first-post">Crossing the Tatras in October</a></p>',
        },
        about: {
          title: "About",
          html: '<h1>About</h1><p>Acme makes outdoor gear in Brno.</p><p><a href="#contact">Contact us</a></p>',
        },
      };
      const outlet = document.getElementById("outlet");
      const nav = document.querySelector("nav");
      const viewOf = (url) =>
        new URL(url, location.href).searchParams.get("view") ?? "shop";

      function render(url, { focus }) {
        const key = viewOf(url);
        const view = views[key] ?? {
          title: "Page not found",
          html: "<h1>Page not found</h1><p>Use the navigation to continue.</p>",
        };
        outlet.innerHTML = view.html;
        document.title = view.title + " - Acme";
        for (const link of nav.querySelectorAll("a")) {
          if (viewOf(link.href) === key)
            link.setAttribute("aria-current", "page");
          else link.removeAttribute("aria-current");
        }
        if (focus) {
          const heading = outlet.querySelector("h1");
          heading.tabIndex = -1;
          heading.focus();
          window.scrollTo(0, 0);
        }
      }
      document.addEventListener("click", (event) => {
        const link = event.target.closest("a[data-route]");
        if (
          !link ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.button !== 0
        )
          return;
        event.preventDefault();
        history.pushState({}, "", link.href);
        render(link.href, { focus: true });
      });
      window.addEventListener("popstate", () =>
        render(location.href, { focus: true })
      );
      render(location.href, { focus: false });
    </script>
  </body>
</html>
`,description:"Manage focus, page title and announcements on client-side route changes in a React, Vue or SPA router",expectations:"# Expectations: spa-route-change\n\n1. Activating an in-app navigation link with the keyboard changes `document.title` to a value that contains the new view's `h1` text.\n2. After the route change, `document.activeElement` is the new view's `h1` (or the `main` element), not `body` and not the activated link.\n3. After the route change, the next Tab press focuses an element inside `main`.\n4. The navigation link for the current view has `aria-current=\"page\"` and no other navigation link has it.\n5. Pressing the browser Back button restores the previous view and its `document.title`.\n6. On initial page load, focus is not moved by script (`document.activeElement` is `body`).\n",headings:["Route change in single-page apps","When to use","What every route change must do","Focus target choices","DO","DO NOT","React and frameworks","What to verify"],id:"spa-route-change",name:"Route change in single-page apps",text:`---
name: Route change in single-page apps
description: Manage focus, page title and announcements on client-side route changes in a React, Vue or SPA router
criteria:
  - STD-SC-2.4.2
  - STD-SC-2.4.3
  - STD-SC-4.1.3
---

# Route change in single-page apps

## When to use

Any app where a link click swaps the view with JavaScript instead of loading a new document: React Router, Next.js client navigation, Vue Router, SvelteKit, Astro view transitions, a hand-rolled \`pushState\` router. A full page load resets focus to the top and makes screen readers read the new title. A client-side swap does neither: focus stays on a link that may no longer exist, the title is stale, and a blind user hears nothing.

## What every route change must do

1. Set \`document.title\` to the new page's title ("Journal - Acme"). Page first, site second.
2. Move focus to the new page's \`<h1>\`, which has \`tabindex="-1"\`. Screen readers read it, and the next Tab starts inside the new content.
3. Scroll to the top for a new page; restore the saved scroll position on Back and Forward.
4. Leave focus alone for changes that are not a new page: a filter, sort or tab that only updates the query string.

\`\`\`js
async function navigate(url, { push = true } = {}) {
  const view = await loadView(url);
  outlet.replaceChildren(view.content);
  document.title = \`\${view.title} - Acme\`;
  if (push) history.pushState({}, "", url);
  for (const link of nav.querySelectorAll("a")) {
    if (link.pathname === new URL(url, location.href).pathname)
      link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
  const heading = outlet.querySelector("h1");
  heading.tabIndex = -1;
  heading.focus();
  window.scrollTo(0, 0);
}

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[data-route]");
  if (
    !link ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.button !== 0
  )
    return;
  event.preventDefault();
  navigate(link.href);
});

window.addEventListener("popstate", () =>
  navigate(location.href, { push: false })
);
\`\`\`

\`\`\`css
h1:focus {
  outline: none;
}
\`\`\`

Suppressing the outline on the focused \`h1\` is fine: it is not a control, and the user did not Tab to it.

## Focus target choices

- **The \`h1\`** of the new view (preferred). It is the shortest useful announcement and puts the user right at the content.
- **The \`main\` element** with \`tabindex="-1"\`, when views have no reliable \`h1\`. Screen readers may read the whole main region.
- **A visually hidden live region** saying "Navigated to Journal", as an addition when focus cannot be moved, such as when the user is typing in a global search box that triggers the route. Create the region once at app start.

Do not focus the \`<body>\` or the skip link; that throws the user back to the top of the header on every navigation.

## DO

- Do not move focus on the initial page load. The browser already handles that.
- Keep links as real \`<a href>\` elements so they can be opened in a new tab and announced as links; intercept only plain left clicks.
- Update \`aria-current="page"\` on the navigation.
- Show a loading state for slow routes in a status region ("Loading journal"), and move focus only after the new content is in the DOM.
- For a 404 or error route, set a title and \`h1\` that say so, and focus that \`h1\`.

## DO NOT

- Do not use \`<div onclick>\` or \`<button>\` for navigation that changes the URL.
- Do not rely on \`autofocus\` inside route components; it fires on mount, including the first load, and is ignored in some browsers.
- Do not announce every route change with \`role="alert"\`.
- Do not forget the title. A tab bar full of "Acme" makes history and tab switching useless to everyone.

## React and frameworks

Run the focus and title code in an effect keyed on the location (\`useEffect(() => {...}, [location.pathname])\`), and skip the first run with a ref. Next.js App Router announces route changes through its own live region and sets titles from \`metadata\`, but does not move focus; add the \`h1\` focus in a client component that watches \`usePathname()\`. React Router's \`ScrollRestoration\` handles scroll; it does not handle focus. Vue Router: use \`router.afterEach\` with \`nextTick\` before focusing.

## What to verify

- After clicking a route link with the keyboard, focus is on the new \`h1\` and the next Tab is inside the new content, not in the header.
- \`document.title\` changes on every route and names the page.
- Back and Forward update content, title and focus the same way.
- Changing a filter does not steal focus from the filter control.
`},{category:"content",criteria:["STD-SC-2.2.1","STD-SC-4.1.3"],demo:`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Status messages demo</title>
    <style>
      :root {
        color-scheme: light dark;
        --bg: #ffffff;
        --fg: #1a1a1a;
        --toast: #1a1a1a;
        --toast-fg: #ffffff;
        --accent: #0b57d0;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --bg: #121212;
          --fg: #f0f0f0;
          --toast: #f0f0f0;
          --toast-fg: #121212;
          --accent: #8ab4f8;
        }
      }
      body {
        margin: 0;
        padding: 2rem 1rem;
        font:
          1rem/1.5 system-ui,
          sans-serif;
        background: var(--bg);
        color: var(--fg);
      }
      main {
        max-width: 40rem;
        margin: 0 auto;
      }
      button {
        font: inherit;
        padding: 0.5rem 1rem;
        border: 2px solid var(--fg);
        border-radius: 0.375rem;
        background: var(--bg);
        color: var(--fg);
        cursor: pointer;
      }
      :focus-visible {
        outline: 3px solid var(--accent);
        outline-offset: 2px;
      }
      .visually-hidden {
        position: absolute;
        width: 1px;
        height: 1px;
        margin: -1px;
        padding: 0;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
        border: 0;
      }
      #toast {
        position: fixed;
        bottom: 1rem;
        left: 50%;
        translate: -50% 0;
        display: flex;
        gap: 1rem;
        align-items: center;
        padding: 0.75rem 1rem;
        border-radius: 0.5rem;
        background: var(--toast);
        color: var(--toast-fg);
        max-width: calc(100vw - 2rem);
        box-sizing: border-box;
      }
      #toast button {
        background: transparent;
        color: var(--toast-fg);
        border-color: var(--toast-fg);
        padding: 0.25rem 0.75rem;
      }
      #toast:not([hidden]) {
        animation: rise 0.2s ease-out;
      }
      @keyframes rise {
        from {
          translate: -50% 1rem;
          opacity: 0;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        #toast:not([hidden]) {
          animation: none;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Rain jacket</h1>
      <p>Waterproof, breathable, 380 g.</p>
      <p><button type="button" id="add">Add to cart</button></p>
      <p>Items in cart: <span id="count">0</span></p>
    </main>
    <div id="status" role="status" class="visually-hidden"></div>
    <div id="toast" hidden>
      <span id="toast-text" aria-hidden="true"></span>
      <button type="button" id="dismiss">Dismiss</button>
    </div>
    <script>
      const add = document.getElementById("add");
      const count = document.getElementById("count");
      const status = document.getElementById("status");
      const toast = document.getElementById("toast");
      const toastText = document.getElementById("toast-text");
      let items = 0;
      let timer;
      let paused = false;

      function announce(message) {
        status.textContent = "";
        setTimeout(() => {
          status.textContent = message;
        }, 50);
      }
      function schedule() {
        clearTimeout(timer);
        timer = setTimeout(() => {
          if (!paused) toast.hidden = true;
        }, 8000);
      }
      function showToast(message) {
        toastText.textContent = message;
        toast.hidden = false;
        schedule();
      }
      add.addEventListener("click", () => {
        items += 1;
        count.textContent = String(items);
        const message =
          "Rain jacket added to cart. " +
          items +
          (items === 1 ? " item" : " items") +
          " in cart.";
        announce(message);
        showToast(message);
      });
      document.getElementById("dismiss").addEventListener("click", () => {
        toast.hidden = true;
        add.focus();
      });
      for (const [type, value] of [
        ["pointerenter", true],
        ["pointerleave", false],
        ["focusin", true],
        ["focusout", false],
      ]) {
        toast.addEventListener(type, () => {
          paused = value;
          if (!value) schedule();
        });
      }
    </script>
  </body>
</html>
`,description:'Announce toasts, snackbars, "added to cart" and save confirmations to screen readers with role status, aria-live and no focus move',expectations:'# Expectations: status-messages-toast\n\n1. An element with role `status` (or `aria-live="polite"`) is in the DOM on page load, before any action.\n2. Activating the action (for example "Add to cart") puts a message naming the result into that same pre-existing live region.\n3. After the action, `document.activeElement` is still the control that was activated.\n4. Success messages are not in an element with role `alert` or `aria-live="assertive"`.\n5. A visible toast remains visible for at least 5 seconds, and stays visible while it has focus or is hovered.\n6. A toast close button has an accessible name.\n',headings:["Status messages and toasts","When to use","The rule that agents break: the region must exist first","Polite or assertive","Visible toasts","DO","DO NOT","React and frameworks","What to verify"],id:"status-messages-toast",name:"Status messages and toasts",text:`---
name: Status messages and toasts
description: Announce toasts, snackbars, "added to cart" and save confirmations to screen readers with role status, aria-live and no focus move
criteria:
  - STD-SC-2.2.1
  - STD-SC-4.1.3
---

# Status messages and toasts

## When to use

Any time the page changes as a result of an action without moving focus: "Added to cart", "Saved", "3 results", "Upload failed", a cart count update, a toast or snackbar. Sighted users see it; screen reader users hear nothing unless the text lands in a live region.

## The rule that agents break: the region must exist first

Screen readers watch live regions that are already in the page. Creating \`<div role="status">\` and filling it in the same tick is often not announced. Render the empty region at page load, then change only its text.

\`\`\`html
<div id="status" role="status" class="visually-hidden"></div>
<div id="alerts" role="alert" class="visually-hidden"></div>
\`\`\`

\`\`\`js
const status = document.getElementById("status");

function announce(message) {
  status.textContent = "";
  setTimeout(() => {
    status.textContent = message;
  }, 50);
}

addButton.addEventListener("click", async () => {
  await addToCart(product);
  announce(\`\${product.name} added to cart. \${cart.count} items in cart.\`);
});
\`\`\`

Clearing and setting after a short delay makes the same message announce again when the user repeats the action.

## Polite or assertive

- \`role="status"\` (polite, atomic): confirmations, counts, progress. Waits until the screen reader is done speaking. Use this for almost everything.
- \`role="alert"\` (assertive): errors and warnings that need attention now, such as "Connection lost, changes are not saved". It interrupts. Use rarely.
- \`aria-live="polite"\` on any element works the same as \`role="status"\` without the role; add \`aria-atomic="true"\` if the whole region should be read, not only the changed part.

## Visible toasts

A visible toast and the live region can be the same element, but toasts are often animated, stacked and removed, which breaks announcements. The robust split: render the toast visually, and send its text to the persistent status region.

- Do not move focus to the toast. Focus stays where the user was working.
- Do not auto-dismiss in under about 5 seconds, and pause the timer while the toast is hovered or has focus. A user who needs longer to read must not lose the message.
- If the toast holds an action ("Undo"), that action must also be reachable some other way, or the toast must stay until dismissed. Keyboard users cannot reach a button that vanishes before they Tab to it.
- Give a close button an accessible name ("Dismiss").
- Do not put long or important content only in a toast; errors that block progress belong next to the field or at the top of the form.

## DO

- Keep messages short and complete on their own: "Rain jacket added to cart", not "Success!".
- Announce search and filter result counts after typing stops (debounce 300 to 500 ms).
- Put loading progress in a status region at milestones ("Uploading, 50%"), not every percent.
- Hide the status region visually with a visually-hidden class when the visible toast shows the same text, not with \`display: none\` or \`hidden\`, which silence it.

## DO NOT

- Do not add \`aria-live\` to large containers that re-render (a whole results list); everything in them gets read.
- Do not use \`role="alert"\` for success messages.
- Do not toggle a live region with \`hidden\` or \`display: none\` just before setting its text.
- Do not use \`aria-live="assertive"\` together with \`role="status"\`; pick one meaning.

## React and frameworks

Mount the live region once in the root layout and expose an \`announce()\` function through context, instead of rendering \`<div role="status">\` inside each toast component that mounts with its message. Toast libraries vary; check that the library keeps a persistent region, does not move focus, and pauses on hover and focus. Conditional rendering like \`{message && <div role="status">{message}</div>}\` is the classic bug: the region and its text appear together.

## What to verify

- With a screen reader on, trigger each action: the message is spoken once, without focus moving.
- Repeat the same action: the message is spoken again.
- The status region element is in the DOM before the first message.
- A toast stays while hovered or focused, and any action in it is also available elsewhere or the toast waits for dismissal.
`},{category:"widgets",criteria:["STD-SC-1.3.1","STD-SC-2.1.1","STD-SC-4.1.2"],demo:`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Tabs demo</title>
    <style>
      :root {
        color-scheme: light dark;
        --bg: #ffffff;
        --fg: #1a1a1a;
        --muted: #595959;
        --accent: #0b57d0;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --bg: #121212;
          --fg: #f0f0f0;
          --muted: #b8b8b8;
          --accent: #8ab4f8;
        }
      }
      body {
        margin: 0;
        padding: 2rem 1rem;
        font:
          1rem/1.5 system-ui,
          sans-serif;
        background: var(--bg);
        color: var(--fg);
      }
      main {
        max-width: 40rem;
        margin: 0 auto;
      }
      [role="tablist"] {
        display: flex;
        gap: 0.25rem;
        border-bottom: 2px solid var(--muted);
        flex-wrap: wrap;
      }
      [role="tab"] {
        font: inherit;
        padding: 0.5rem 1rem;
        border: 0;
        border-bottom: 4px solid transparent;
        margin-bottom: -2px;
        background: none;
        color: var(--muted);
        cursor: pointer;
      }
      [role="tab"][aria-selected="true"] {
        color: var(--fg);
        font-weight: 600;
        border-bottom-color: var(--accent);
      }
      :focus-visible {
        outline: 3px solid var(--accent);
        outline-offset: 2px;
      }
      [role="tabpanel"] {
        padding: 1rem 0.25rem;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Trail running shoe</h1>
      <h2 id="info-heading">Product information</h2>
      <div role="tablist" aria-labelledby="info-heading">
        <button
          type="button"
          role="tab"
          id="tab-details"
          aria-selected="true"
          aria-controls="panel-details"
        >
          Details
        </button>
        <button
          type="button"
          role="tab"
          id="tab-specs"
          aria-selected="false"
          aria-controls="panel-specs"
          tabindex="-1"
        >
          Specs
        </button>
        <button
          type="button"
          role="tab"
          id="tab-reviews"
          aria-selected="false"
          aria-controls="panel-reviews"
          tabindex="-1"
        >
          Reviews
        </button>
      </div>
      <div
        role="tabpanel"
        id="panel-details"
        aria-labelledby="tab-details"
        tabindex="0"
      >
        <p>A light shoe with a grippy sole for wet rock and mud.</p>
      </div>
      <div
        role="tabpanel"
        id="panel-specs"
        aria-labelledby="tab-specs"
        tabindex="0"
        hidden
      >
        <p>Weight 280 g. Drop 6 mm. Lug depth 5 mm.</p>
      </div>
      <div
        role="tabpanel"
        id="panel-reviews"
        aria-labelledby="tab-reviews"
        tabindex="0"
        hidden
      >
        <p>4.6 out of 5 from 212 reviews.</p>
      </div>
    </main>
    <script>
      const tabs = [...document.querySelectorAll('[role="tab"]')];
      function select(tab) {
        for (const other of tabs) {
          const selected = other === tab;
          other.setAttribute("aria-selected", String(selected));
          other.tabIndex = selected ? 0 : -1;
          document.getElementById(other.getAttribute("aria-controls")).hidden =
            !selected;
        }
        tab.focus();
      }
      for (const tab of tabs) {
        tab.addEventListener("click", () => select(tab));
        tab.addEventListener("keydown", (e) => {
          const i = tabs.indexOf(tab);
          const target = {
            ArrowRight: i + 1,
            ArrowLeft: i - 1,
            Home: 0,
            End: -1,
          }[e.key];
          if (target === undefined) return;
          e.preventDefault();
          select(tabs.at(target % tabs.length));
        });
      }
    </script>
  </body>
</html>
`,description:"Build accessible tabs with tablist, tab and tabpanel roles, roving tabindex and arrow key navigation",expectations:'# Expectations: tabs\n\n1. The tabs sit in an element with role `tablist` that has an accessible name; each tab has role `tab`.\n2. Exactly one tab has `aria-selected="true"`, and only that tab has `tabindex="0"`; the others have `tabindex="-1"`.\n3. With focus on the selected tab, pressing Arrow Right moves focus to the next tab; on the last tab it wraps to the first.\n4. Pressing Home focuses the first tab and End focuses the last.\n5. Each visible panel has role `tabpanel` and its accessible name equals the selected tab\'s name; panels of unselected tabs are not visible.\n6. Pressing Tab from the selected tab moves focus into or onto the visible panel, never to another tab.\n',headings:["Tabs","When to use","Markup","Keyboard: one Tab stop, arrows inside","DO","DO NOT","React and frameworks","What to verify"],id:"tabs",name:"Tabs",text:`---
name: Tabs
description: Build accessible tabs with tablist, tab and tabpanel roles, roving tabindex and arrow key navigation
criteria:
  - STD-SC-1.3.1
  - STD-SC-2.1.1
  - STD-SC-4.1.2
---

# Tabs

## When to use

Tabs switch between panels of related content in place, one panel visible at a time: product details, specs and reviews; a settings page with sections. If each "tab" loads a different URL, it is navigation: use a \`<nav>\` with links and \`aria-current="page"\` on the active one, not tab roles. If several sections may be open at once, use an accordion.

## Markup

\`\`\`html
<div role="tablist" aria-label="Product information">
  <button
    type="button"
    role="tab"
    id="tab-details"
    aria-selected="true"
    aria-controls="panel-details"
  >
    Details
  </button>
  <button
    type="button"
    role="tab"
    id="tab-specs"
    aria-selected="false"
    aria-controls="panel-specs"
    tabindex="-1"
  >
    Specs
  </button>
  <button
    type="button"
    role="tab"
    id="tab-reviews"
    aria-selected="false"
    aria-controls="panel-reviews"
    tabindex="-1"
  >
    Reviews
  </button>
</div>
<div
  role="tabpanel"
  id="panel-details"
  aria-labelledby="tab-details"
  tabindex="0"
>
  ...
</div>
<div
  role="tabpanel"
  id="panel-specs"
  aria-labelledby="tab-specs"
  tabindex="0"
  hidden
>
  ...
</div>
<div
  role="tabpanel"
  id="panel-reviews"
  aria-labelledby="tab-reviews"
  tabindex="0"
  hidden
>
  ...
</div>
\`\`\`

## Keyboard: one Tab stop, arrows inside

The whole tab list is one stop in the Tab order. The selected tab has \`tabindex="0"\`, every other tab \`tabindex="-1"\` (roving tabindex). Tab from the tab list goes to the visible panel.

| Key | Action |
| --- | --- |
| Arrow Right / Arrow Left | Next / previous tab, wrapping. Use Up and Down for a vertical list (\`aria-orientation="vertical"\`) |
| Home / End | First / last tab |
| Enter / Space | Activate the focused tab (manual activation only) |

\`\`\`js
const tabs = [...document.querySelectorAll('[role="tab"]')];

function select(tab) {
  for (const other of tabs) {
    const selected = other === tab;
    other.setAttribute("aria-selected", String(selected));
    other.tabIndex = selected ? 0 : -1;
    document.getElementById(other.getAttribute("aria-controls")).hidden =
      !selected;
  }
  tab.focus();
}

for (const tab of tabs) {
  tab.addEventListener("click", () => select(tab));
  tab.addEventListener("keydown", (e) => {
    const i = tabs.indexOf(tab);
    const target = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: -1 }[
      e.key
    ];
    if (target === undefined) return;
    e.preventDefault();
    select(tabs.at(target % tabs.length));
  });
}
\`\`\`

This is automatic activation: arrows select as they move. Use it when panels are already in the page. When showing a panel is slow (a network fetch), use manual activation: arrows only move focus and \`tabindex\`, and Enter or Space selects.

## DO

- Put \`role="tab"\` on \`<button>\` elements so click and focus work without extra code.
- Keep \`aria-selected\` "true" on exactly one tab, and change it, \`tabindex\` and \`hidden\` together.
- Name the tab list with \`aria-label\` or \`aria-labelledby\` pointing at a nearby heading.
- Give a panel \`tabindex="0"\` when it has no focusable content, so keyboard users can reach and scroll it. Drop it when the panel starts with a link or field.
- Show the selected tab visually with more than color: a thick underline or a border.

## DO NOT

- Do not leave every tab at \`tabindex="0"\`. Users must Tab through all of them to reach the panel.
- Do not use \`aria-current\` or \`aria-pressed\` on tabs. Tabs use \`aria-selected\`.
- Do not use \`aria-expanded\` on tabs.
- Do not hide inactive panels with only \`visibility\` toggles on children or off-screen positioning; use \`hidden\` so their content leaves the Tab order.
- Do not wrap each tab in a \`<li>\` inside the tablist without giving the \`<li>\` \`role="presentation"\`; the list semantics get in the way of the tab roles.
- Do not use tab roles for page-level navigation.

## React and frameworks

Keep the selected index in state, and derive \`aria-selected\`, \`tabIndex\` and \`hidden\` from it in render. Move focus in the key handler by ref (\`tabRefs.current[next].focus()\`) after updating state; the tab elements already exist, so this works without an effect. Do not unmount inactive panels if they hold form input the user would lose; \`hidden\` keeps their state. Generate ids with \`useId()\`.

## What to verify

- Tab reaches the selected tab only, then the panel.
- Arrow keys move between tabs and wrap; Home and End work.
- The accessibility tree shows a tab list with names, one tab selected, and each panel named by its tab.
- Inactive panels are hidden from the tree.
`}];var aee="ENTRIES",QL="KEYS",YL="VALUES";var Ld=class{constructor(t,n){let r=t._tree,o=Array.from(r.keys());this.set=t,this._type=n,this._path=o.length>0?[{node:r,keys:o}]:[]}next(){let t=this.dive();return this.backtrack(),t}dive(){if(this._path.length===0)return{done:!0,value:void 0};let{node:t,keys:n}=Hu(this._path);if(Hu(n)==="")return{done:!1,value:this.result()};let r=t.get(Hu(n));return this._path.push({node:r,keys:Array.from(r.keys())}),this.dive()}backtrack(){if(this._path.length===0)return;let t=Hu(this._path).keys;t.pop(),!(t.length>0)&&(this._path.pop(),this.backtrack())}key(){return this.set._prefix+this._path.map(({keys:t})=>Hu(t)).filter(t=>t!=="").join("")}value(){return Hu(this._path).node.get("")}result(){switch(this._type){case YL:return this.value();case QL:return this.key();default:return[this.key(),this.value()]}}[Symbol.iterator](){return this}},Hu=e=>e[e.length-1],iee=(e,t,n)=>{let r=new Map;if(t===void 0)return r;let o=t.length+1,s=o+n,a=new Uint8Array(s*o).fill(n+1);for(let i=0;i<o;++i)a[i]=i;for(let i=1;i<s;++i)a[i*o]=i;return XL(e,t,n,r,a,1,o,""),r},XL=(e,t,n,r,o,s,a,i)=>{let c=s*a;e:for(let u of e.keys())if(u===""){let l=o[c-1];l<=n&&r.set(i,[e.get(u),l])}else{let l=s;for(let f=0;f<u.length;++f,++l){let d=u[f],m=a*l,g=m-a,x=o[m],E=Math.max(0,l-n-1),k=Math.min(a-1,l+n);for(let w=E;w<k;++w){let P=d!==t[w],T=o[g+w]+ +P,p=o[g+w+1]+1,y=o[m+w]+1,S=o[m+w+1]=Math.min(T,p,y);S<x&&(x=S)}if(x>n)continue e}XL(e.get(u),t,n,r,o,l,a,i+u)}},Bd=class e{constructor(t=new Map,n=""){this._size=void 0,this._tree=t,this._prefix=n}atPrefix(t){if(!t.startsWith(this._prefix))throw new Error("Mismatched prefix");let[n,r]=hx(this._tree,t.slice(this._prefix.length));if(n===void 0){let[o,s]=$k(r);for(let a of o.keys())if(a!==""&&a.startsWith(s)){let i=new Map;return i.set(a.slice(s.length),o.get(a)),new e(i,t)}}return new e(n,t)}clear(){this._size=void 0,this._tree.clear()}delete(t){return this._size=void 0,cee(this._tree,t)}entries(){return new Ld(this,aee)}forEach(t){for(let[n,r]of this)t(n,r,this)}fuzzyGet(t,n){return iee(this._tree,t,n)}get(t){let n=Nk(this._tree,t);return n!==void 0?n.get(""):void 0}has(t){let n=Nk(this._tree,t);return n!==void 0&&n.has("")}keys(){return new Ld(this,QL)}set(t,n){if(typeof t!="string")throw new Error("key must be a string");return this._size=void 0,Pk(this._tree,t).set("",n),this}get size(){if(this._size)return this._size;this._size=0;let t=this.entries();for(;!t.next().done;)this._size+=1;return this._size}update(t,n){if(typeof t!="string")throw new Error("key must be a string");this._size=void 0;let r=Pk(this._tree,t);return r.set("",n(r.get(""))),this}fetch(t,n){if(typeof t!="string")throw new Error("key must be a string");this._size=void 0;let r=Pk(this._tree,t),o=r.get("");return o===void 0&&r.set("",o=n()),o}values(){return new Ld(this,YL)}[Symbol.iterator](){return this.entries()}static from(t){let n=new e;for(let[r,o]of t)n.set(r,o);return n}static fromObject(t){return e.from(Object.entries(t))}},hx=(e,t,n=[])=>{if(t.length===0||e==null)return[e,n];for(let r of e.keys())if(r!==""&&t.startsWith(r))return n.push([e,r]),hx(e.get(r),t.slice(r.length),n);return n.push([e,t]),hx(void 0,"",n)},Nk=(e,t)=>{if(t.length===0||e==null)return e;for(let n of e.keys())if(n!==""&&t.startsWith(n))return Nk(e.get(n),t.slice(n.length))},Pk=(e,t)=>{let n=t.length;e:for(let r=0;e&&r<n;){for(let s of e.keys())if(s!==""&&t[r]===s[0]){let a=Math.min(n-r,s.length),i=1;for(;i<a&&t[r+i]===s[i];)++i;let c=e.get(s);if(i===s.length)e=c;else{let u=new Map;u.set(s.slice(i),c),e.set(t.slice(r,r+i),u),e.delete(s),e=u}r+=i;continue e}let o=new Map;return e.set(t.slice(r),o),o}return e},cee=(e,t)=>{let[n,r]=hx(e,t);if(n!==void 0){if(n.delete(""),n.size===0)eB(r);else if(n.size===1){let[o,s]=n.entries().next().value;tB(r,o,s)}}},eB=e=>{if(e.length===0)return;let[t,n]=$k(e);if(t.delete(n),t.size===0)eB(e.slice(0,-1));else if(t.size===1){let[r,o]=t.entries().next().value;r!==""&&tB(e.slice(0,-1),r,o)}},tB=(e,t,n)=>{if(e.length===0)return;let[r,o]=$k(e);r.set(o+t,n),r.delete(o)},$k=e=>e[e.length-1],Lk="or",nB="and",uee="and_not",jd=class e{constructor(t){if(t?.fields==null)throw new Error('MiniSearch: option "fields" must be provided');let n=t.autoVacuum==null||t.autoVacuum===!0?Mk:t.autoVacuum;this._options={...Rk,...t,autoVacuum:n,searchOptions:{...GL,...t.searchOptions||{}},autoSuggestOptions:{...mee,...t.autoSuggestOptions||{}}},this._index=new Bd,this._documentCount=0,this._documentIds=new Map,this._idToShortId=new Map,this._fieldIds={},this._fieldLength=new Map,this._avgFieldLength=[],this._nextId=0,this._storedFields=new Map,this._dirtCount=0,this._currentVacuum=null,this._enqueuedVacuum=null,this._enqueuedVacuumConditions=Uk,this.addFields(this._options.fields)}add(t){let{extractField:n,stringifyField:r,tokenize:o,processTerm:s,fields:a,idField:i}=this._options,c=n(t,i);if(c==null)throw new Error(`MiniSearch: document does not have ID field "${i}"`);if(this._idToShortId.has(c))throw new Error(`MiniSearch: duplicate ID ${c}`);let u=this.addDocumentId(c);this.saveStoredFields(u,t);for(let l of a){let f=n(t,l);if(f==null)continue;let d=o(r(f,l),l),m=this._fieldIds[l],g=new Set(d).size;this.addFieldLength(u,m,this._documentCount-1,g);for(let x of d){let E=s(x,l);if(Array.isArray(E))for(let k of E)this.addTerm(m,u,k);else E&&this.addTerm(m,u,E)}}}addAll(t){for(let n of t)this.add(n)}addAllAsync(t,n={}){let{chunkSize:r=10}=n,o={chunk:[],promise:Promise.resolve()},{chunk:s,promise:a}=t.reduce(({chunk:i,promise:c},u,l)=>(i.push(u),(l+1)%r===0?{chunk:[],promise:c.then(()=>new Promise(f=>setTimeout(f,0))).then(()=>this.addAll(i))}:{chunk:i,promise:c}),o);return a.then(()=>this.addAll(s))}remove(t){let{tokenize:n,processTerm:r,extractField:o,stringifyField:s,fields:a,idField:i}=this._options,c=o(t,i);if(c==null)throw new Error(`MiniSearch: document does not have ID field "${i}"`);let u=this._idToShortId.get(c);if(u==null)throw new Error(`MiniSearch: cannot remove document with ID ${c}: it is not in the index`);for(let l of a){let f=o(t,l);if(f==null)continue;let d=n(s(f,l),l),m=this._fieldIds[l],g=new Set(d).size;this.removeFieldLength(u,m,this._documentCount,g);for(let x of d){let E=r(x,l);if(Array.isArray(E))for(let k of E)this.removeTerm(m,u,k);else E&&this.removeTerm(m,u,E)}}this._storedFields.delete(u),this._documentIds.delete(u),this._idToShortId.delete(c),this._fieldLength.delete(u),this._documentCount-=1}removeAll(t){if(t)for(let n of t)this.remove(n);else{if(arguments.length>0)throw new Error("Expected documents to be present. Omit the argument to remove all documents.");this._index=new Bd,this._documentCount=0,this._documentIds=new Map,this._idToShortId=new Map,this._fieldLength=new Map,this._avgFieldLength=[],this._storedFields=new Map,this._nextId=0}}discard(t){let n=this._idToShortId.get(t);if(n==null)throw new Error(`MiniSearch: cannot discard document with ID ${t}: it is not in the index`);this._idToShortId.delete(t),this._documentIds.delete(n),this._storedFields.delete(n),(this._fieldLength.get(n)||[]).forEach((r,o)=>{this.removeFieldLength(n,o,this._documentCount,r)}),this._fieldLength.delete(n),this._documentCount-=1,this._dirtCount+=1,this.maybeAutoVacuum()}maybeAutoVacuum(){if(this._options.autoVacuum===!1)return;let{minDirtFactor:t,minDirtCount:n,batchSize:r,batchWait:o}=this._options.autoVacuum;this.conditionalVacuum({batchSize:r,batchWait:o},{minDirtCount:n,minDirtFactor:t})}discardAll(t){let n=this._options.autoVacuum;try{this._options.autoVacuum=!1;for(let r of t)this.discard(r)}finally{this._options.autoVacuum=n}this.maybeAutoVacuum()}replace(t){let{idField:n,extractField:r}=this._options,o=r(t,n);this.discard(o),this.add(t)}vacuum(t={}){return this.conditionalVacuum(t)}conditionalVacuum(t,n){return this._currentVacuum?(this._enqueuedVacuumConditions=this._enqueuedVacuumConditions&&n,this._enqueuedVacuum!=null?this._enqueuedVacuum:(this._enqueuedVacuum=this._currentVacuum.then(()=>{let r=this._enqueuedVacuumConditions;return this._enqueuedVacuumConditions=Uk,this.performVacuuming(t,r)}),this._enqueuedVacuum)):this.vacuumConditionsMet(n)===!1?Promise.resolve():(this._currentVacuum=this.performVacuuming(t),this._currentVacuum)}async performVacuuming(t,n){let r=this._dirtCount;if(this.vacuumConditionsMet(n)){let o=t.batchSize||Dk.batchSize,s=t.batchWait||Dk.batchWait,a=1;for(let[i,c]of this._index){for(let[u,l]of c)for(let[f]of l)this._documentIds.has(f)||(l.size<=1?c.delete(u):l.delete(f));this._index.get(i).size===0&&this._index.delete(i),a%o===0&&await new Promise(u=>setTimeout(u,s)),a+=1}this._dirtCount-=r}await null,this._currentVacuum=this._enqueuedVacuum,this._enqueuedVacuum=null}vacuumConditionsMet(t){if(t==null)return!0;let{minDirtCount:n,minDirtFactor:r}=t;return n=n||Mk.minDirtCount,r=r||Mk.minDirtFactor,this.dirtCount>=n&&this.dirtFactor>=r}get isVacuuming(){return this._currentVacuum!=null}get dirtCount(){return this._dirtCount}get dirtFactor(){return this._dirtCount/(1+this._documentCount+this._dirtCount)}has(t){return this._idToShortId.has(t)}getStoredFields(t){let n=this._idToShortId.get(t);if(n!=null)return this._storedFields.get(n)}search(t,n={}){let{searchOptions:r}=this._options,o={...r,...n},s=this.executeQuery(t,n),a=[];for(let[i,{score:c,terms:u,match:l}]of s){let f=u.length||1,d={id:this._documentIds.get(i),score:c*f,terms:Object.keys(l),queryTerms:u,match:l};Object.assign(d,this._storedFields.get(i)),(o.filter==null||o.filter(d))&&a.push(d)}return t===e.wildcard&&o.boostDocument==null||a.sort(JL),a}autoSuggest(t,n={}){n={...this._options.autoSuggestOptions,...n};let r=new Map;for(let{score:s,terms:a}of this.search(t,n)){let i=a.join(" "),c=r.get(i);c!=null?(c.score+=s,c.count+=1):r.set(i,{score:s,terms:a,count:1})}let o=[];for(let[s,{score:a,terms:i,count:c}]of r)o.push({suggestion:s,terms:i,score:a/c});return o.sort(JL),o}get documentCount(){return this._documentCount}get termCount(){return this._index.size}static loadJSON(t,n){if(n==null)throw new Error("MiniSearch: loadJSON should be given the same options used when serializing the index");return this.loadJS(JSON.parse(t),n)}static async loadJSONAsync(t,n){if(n==null)throw new Error("MiniSearch: loadJSON should be given the same options used when serializing the index");return this.loadJSAsync(JSON.parse(t),n)}static getDefault(t){if(Rk.hasOwnProperty(t))return Fk(Rk,t);throw new Error(`MiniSearch: unknown option "${t}"`)}static loadJS(t,n){let{index:r,documentIds:o,fieldLength:s,storedFields:a,serializationVersion:i}=t,c=this.instantiateMiniSearch(t,n);c._documentIds=px(o),c._fieldLength=px(s),c._storedFields=px(a);for(let[u,l]of c._documentIds)c._idToShortId.set(l,u);for(let[u,l]of r){let f=new Map;for(let d of Object.keys(l)){let m=l[d];i===1&&(m=m.ds),f.set(parseInt(d,10),px(m))}c._index.set(u,f)}return c}static async loadJSAsync(t,n){let{index:r,documentIds:o,fieldLength:s,storedFields:a,serializationVersion:i}=t,c=this.instantiateMiniSearch(t,n);c._documentIds=await mx(o),c._fieldLength=await mx(s),c._storedFields=await mx(a);for(let[l,f]of c._documentIds)c._idToShortId.set(f,l);let u=0;for(let[l,f]of r){let d=new Map;for(let m of Object.keys(f)){let g=f[m];i===1&&(g=g.ds),d.set(parseInt(m,10),await mx(g))}++u%1e3===0&&await rB(0),c._index.set(l,d)}return c}static instantiateMiniSearch(t,n){let{documentCount:r,nextId:o,fieldIds:s,averageFieldLength:a,dirtCount:i,serializationVersion:c}=t;if(c!==1&&c!==2)throw new Error("MiniSearch: cannot deserialize an index created with an incompatible version");let u=new e(n);return u._documentCount=r,u._nextId=o,u._idToShortId=new Map,u._fieldIds=s,u._avgFieldLength=a,u._dirtCount=i||0,u._index=new Bd,u}executeQuery(t,n={}){if(t===e.wildcard)return this.executeWildcardQuery(n);if(typeof t!="string"){let d={...n,...t,queries:void 0},m=t.queries.map(g=>this.executeQuery(g,d));return this.combineResults(m,d.combineWith)}let{tokenize:r,processTerm:o,searchOptions:s}=this._options,a={tokenize:r,processTerm:o,...s,...n},{tokenize:i,processTerm:c}=a,f=i(t).flatMap(d=>c(d)).filter(d=>!!d).map(pee(a)).map(d=>this.executeQuerySpec(d,a));return this.combineResults(f,a.combineWith)}executeQuerySpec(t,n){let r={...this._options.searchOptions,...n},o=(r.fields||this._options.fields).reduce((x,E)=>({...x,[E]:Fk(r.boost,E)||1}),{}),{boostDocument:s,weights:a,maxFuzzy:i,bm25:c}=r,{fuzzy:u,prefix:l}={...GL.weights,...a},f=this._index.get(t.term),d=this.termResults(t.term,t.term,1,t.termBoost,f,o,s,c),m,g;if(t.prefix&&(m=this._index.atPrefix(t.term)),t.fuzzy){let x=t.fuzzy===!0?.2:t.fuzzy,E=x<1?Math.min(i,Math.round(t.term.length*x)):x;E&&(g=this._index.fuzzyGet(t.term,E))}if(m)for(let[x,E]of m){let k=x.length-t.term.length;if(!k)continue;g?.delete(x);let w=l*x.length/(x.length+.3*k);this.termResults(t.term,x,w,t.termBoost,E,o,s,c,d)}if(g)for(let x of g.keys()){let[E,k]=g.get(x);if(!k)continue;let w=u*x.length/(x.length+k);this.termResults(t.term,x,w,t.termBoost,E,o,s,c,d)}return d}executeWildcardQuery(t){let n=new Map,r={...this._options.searchOptions,...t};for(let[o,s]of this._documentIds){let a=r.boostDocument?r.boostDocument(s,"",this._storedFields.get(o)):1;n.set(o,{score:a,terms:[],match:{}})}return n}combineResults(t,n=Lk){if(t.length===0)return new Map;let r=n.toLowerCase(),o=lee[r];if(!o)throw new Error(`Invalid combination operator: ${n}`);return t.reduce(o)||new Map}toJSON(){let t=[];for(let[n,r]of this._index){let o={};for(let[s,a]of r)o[s]=Object.fromEntries(a);t.push([n,o])}return{documentCount:this._documentCount,nextId:this._nextId,documentIds:Object.fromEntries(this._documentIds),fieldIds:this._fieldIds,fieldLength:Object.fromEntries(this._fieldLength),averageFieldLength:this._avgFieldLength,storedFields:Object.fromEntries(this._storedFields),dirtCount:this._dirtCount,index:t,serializationVersion:2}}termResults(t,n,r,o,s,a,i,c,u=new Map){if(s==null)return u;for(let l of Object.keys(a)){let f=a[l],d=this._fieldIds[l],m=s.get(d);if(m==null)continue;let g=m.size,x=this._avgFieldLength[d];for(let E of m.keys()){if(!this._documentIds.has(E)){this.removeTerm(d,E,n),g-=1;continue}let k=i?i(this._documentIds.get(E),n,this._storedFields.get(E)):1;if(!k)continue;let w=m.get(E),P=this._fieldLength.get(E)[d],T=dee(w,g,this._documentCount,P,x,c),p=r*o*f*k*T,y=u.get(E);if(y){y.score+=p,hee(y.terms,t);let S=Fk(y.match,n);S?S.push(l):y.match[n]=[l]}else u.set(E,{score:p,terms:[t],match:{[n]:[l]}})}}return u}addTerm(t,n,r){let o=this._index.fetch(r,ZL),s=o.get(t);if(s==null)s=new Map,s.set(n,1),o.set(t,s);else{let a=s.get(n);s.set(n,(a||0)+1)}}removeTerm(t,n,r){if(!this._index.has(r)){this.warnDocumentChanged(n,t,r);return}let o=this._index.fetch(r,ZL),s=o.get(t);s==null||s.get(n)==null?this.warnDocumentChanged(n,t,r):s.get(n)<=1?s.size<=1?o.delete(t):s.delete(n):s.set(n,s.get(n)-1),this._index.get(r).size===0&&this._index.delete(r)}warnDocumentChanged(t,n,r){for(let o of Object.keys(this._fieldIds))if(this._fieldIds[o]===n){this._options.logger("warn",`MiniSearch: document with ID ${this._documentIds.get(t)} has changed before removal: term "${r}" was not present in field "${o}". Removing a document after it has changed can corrupt the index!`,"version_conflict");return}}addDocumentId(t){let n=this._nextId;return this._idToShortId.set(t,n),this._documentIds.set(n,t),this._documentCount+=1,this._nextId+=1,n}addFields(t){for(let n=0;n<t.length;n++)this._fieldIds[t[n]]=n}addFieldLength(t,n,r,o){let s=this._fieldLength.get(t);s==null&&this._fieldLength.set(t,s=[]),s[n]=o;let i=(this._avgFieldLength[n]||0)*r+o;this._avgFieldLength[n]=i/(r+1)}removeFieldLength(t,n,r,o){if(r===1){this._avgFieldLength[n]=0;return}let s=this._avgFieldLength[n]*r-o;this._avgFieldLength[n]=s/(r-1)}saveStoredFields(t,n){let{storeFields:r,extractField:o}=this._options;if(r==null||r.length===0)return;let s=this._storedFields.get(t);s==null&&this._storedFields.set(t,s={});for(let a of r){let i=o(n,a);i!==void 0&&(s[a]=i)}}};jd.wildcard=Symbol("*");var Fk=(e,t)=>Object.prototype.hasOwnProperty.call(e,t)?e[t]:void 0,lee={[Lk]:(e,t)=>{for(let n of t.keys()){let r=e.get(n);if(r==null)e.set(n,t.get(n));else{let{score:o,terms:s,match:a}=t.get(n);r.score=r.score+o,r.match=Object.assign(r.match,a),KL(r.terms,s)}}return e},[nB]:(e,t)=>{let n=new Map;for(let r of t.keys()){let o=e.get(r);if(o==null)continue;let{score:s,terms:a,match:i}=t.get(r);KL(o.terms,a),n.set(r,{score:o.score+s,terms:o.terms,match:Object.assign(o.match,i)})}return n},[uee]:(e,t)=>{for(let n of t.keys())e.delete(n);return e}},fee={k:1.2,b:.7,d:.5},dee=(e,t,n,r,o,s)=>{let{k:a,b:i,d:c}=s;return Math.log(1+(n-t+.5)/(t+.5))*(c+e*(a+1)/(e+a*(1-i+i*r/o)))},pee=e=>(t,n,r)=>{let o=typeof e.fuzzy=="function"?e.fuzzy(t,n,r):e.fuzzy||!1,s=typeof e.prefix=="function"?e.prefix(t,n,r):e.prefix===!0,a=typeof e.boostTerm=="function"?e.boostTerm(t,n,r):1;return{term:t,fuzzy:o,prefix:s,termBoost:a}},Rk={idField:"id",extractField:(e,t)=>e[t],stringifyField:(e,t)=>e.toString(),tokenize:e=>e.split(gee),processTerm:e=>e.toLowerCase(),fields:void 0,searchOptions:void 0,storeFields:[],logger:(e,t)=>{typeof console?.[e]=="function"&&console[e](t)},autoVacuum:!0},GL={combineWith:Lk,prefix:!1,fuzzy:!1,maxFuzzy:6,boost:{},weights:{fuzzy:.45,prefix:.375},bm25:fee},mee={combineWith:nB,prefix:(e,t,n)=>t===n.length-1},Dk={batchSize:1e3,batchWait:10},Uk={minDirtFactor:.1,minDirtCount:20},Mk={...Dk,...Uk},hee=(e,t)=>{e.includes(t)||e.push(t)},KL=(e,t)=>{for(let n of t)e.includes(n)||e.push(n)},JL=({score:e},{score:t})=>t-e,ZL=()=>new Map,px=e=>{let t=new Map;for(let n of Object.keys(e))t.set(parseInt(n,10),e[n]);return t},mx=async e=>{let t=new Map,n=0;for(let r of Object.keys(e))t.set(parseInt(r,10),e[r]),++n%1e3===0&&await rB(0);return t},rB=e=>new Promise(t=>setTimeout(t,e)),gee=/[\n\r\p{Z}\p{P}]+/u;var xee={ational:"ate",tional:"tion",enci:"ence",anci:"ance",izer:"ize",bli:"ble",alli:"al",entli:"ent",eli:"e",ousli:"ous",ization:"ize",ation:"ate",ator:"ate",alism:"al",iveness:"ive",fulness:"ful",ousness:"ous",aliti:"al",iviti:"ive",biliti:"ble",logi:"log"},yee={icate:"ic",ative:"",alize:"al",iciti:"ic",ical:"ic",ful:"",ness:""},bee="[^aeiou]",jk="[aeiouy]",ia="("+bee+"[^aeiouy]*)",xx="("+jk+"[aeiou]*)",Bk=new RegExp("^"+ia+"?"+xx+ia),See=new RegExp("^"+ia+"?"+xx+ia+xx+"?$"),gx=new RegExp("^"+ia+"?("+xx+ia+"){2,}"),oB=new RegExp("^"+ia+"?"+jk),sB=new RegExp("^"+ia+jk+"[^aeiouwxy]$"),Eee=/ll$/,vee=/^(.+?)e$/,wee=/^(.+?)y$/,kee=/^(.+?(s|t))(ion)$/,Iee=/^(.+?)(ed|ing)$/,Cee=/(at|bl|iz)$/,Tee=/^(.+?)eed$/,Aee=/^.+?[^s]s$/,Oee=/^.+?(ss|i)es$/,_ee=/([^aeiouylsz])\1$/,Pee=/^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/,Fee=/^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/,Ree=/^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;function aB(e){let t=String(e).toLowerCase();if(t.length<3)return t;let n=!1;t.codePointAt(0)===121&&(n=!0,t="Y"+t.slice(1)),Oee.test(t)?t=t.slice(0,-2):Aee.test(t)&&(t=t.slice(0,-1));let r;return(r=Tee.exec(t))?Bk.test(r[1])&&(t=t.slice(0,-1)):(r=Iee.exec(t))&&oB.test(r[1])&&(t=r[1],Cee.test(t)?t+="e":_ee.test(t)?t=t.slice(0,-1):sB.test(t)&&(t+="e")),(r=wee.exec(t))&&oB.test(r[1])&&(t=r[1]+"i"),(r=Pee.exec(t))&&Bk.test(r[1])&&(t=r[1]+xee[r[2]]),(r=Fee.exec(t))&&Bk.test(r[1])&&(t=r[1]+yee[r[2]]),(r=Ree.exec(t))?gx.test(r[1])&&(t=r[1]):(r=kee.exec(t))&&gx.test(r[1])&&(t=r[1]),(r=vee.exec(t))&&(gx.test(r[1])||See.test(r[1])&&!sB.test(r[1]))&&(t=r[1]),Eee.test(t)&&gx.test(t)&&(t=t.slice(0,-1)),n&&(t="y"+t.slice(1)),t}var yx=class extends fs.TaggedError()("GuideNotFound",{id:fs.String}){get message(){return`No guide with id "${this.id}". Run \`good-a11y list\` for every id, or \`good-a11y search "<2-5 words>"\`.`}},cB=8,iB=({description:e,id:t})=>({description:e,id:t}),zk=e=>{let t=new Map(e.map(a=>[a.id,a])),n=new jd({fields:["slug","name","description","headings"],idField:"id",processTerm:a=>aB(a.toLowerCase()),searchOptions:{boost:{description:2,name:3,slug:2},combineWith:"OR",fuzzy:.2,prefix:!0}});return n.addAll(e.map(a=>({description:a.description,headings:a.headings.join(`
`),id:a.id,name:a.name,slug:a.id.replaceAll("-"," ")}))),{list:()=>e.map(iB),retrieve:a=>{let i=[];for(let c of a){let u=t.get(c);if(u===void 0)return Ke.fail(new yx({id:c}));i.push(u)}return Ke.succeed(i)},search:a=>n.search(a).slice(0,cB).flatMap(i=>{let c=t.get(String(i.id));return c===void 0?[]:[iB(c)]})}};var Mee=9.5*1024,uB=ie.fn("deliverText")(function*(t,n){if(new TextEncoder().encode(t).byteLength<=Mee)return t;let r=yield*Ka.FileSystem,o=yield*Uc.Path,s=yield*r.makeTempDirectory({prefix:"good-a11y-"}),a=o.join(s,`${n}.md`);return yield*r.writeFileString(a,t),a});var qk=zk(_k),lB=e=>Po.log(JSON.stringify(e,null,2)),fB=_n.make("list",{},()=>lB(qk.list())).pipe(_n.withDescription("Print every guide as JSON: [{ id, description }]")),dB=_n.make("search",{query:Pi.String("query").pipe(Pi.withDescription('What you are building, in 2-5 words, e.g. "modal dialog focus"'))},({query:e})=>lB(qk.search(e))).pipe(_n.withDescription("Find guides for a task. Prints the best 8 as JSON: [{ id, description }], or [] when nothing matches")),pB=_n.make("retrieve",{ids:Pi.String("ids").pipe(Pi.withDescription('One guide id or several separated by commas, e.g. "modal-dialog,form-errors"'))},ie.fn("retrieve")(function*({ids:t}){let n=t.split(",").map(s=>s.trim()).filter(s=>s!==""),o=(yield*ie.fromResult(qk.retrieve(n))).map(s=>s.text.trimEnd()).join(`

`);yield*Po.log(yield*uB(o,n.join("+")))})).pipe(_n.withDescription("Print the guide text. Over 9.5 KB it is written to a temp file and the file path is printed instead"));var mB="0.1.0";var Nee=_n.make("good-a11y").pipe(_n.withDescription("Accessibility guidance for coding agents: search the guides, retrieve one, build with it"),_n.withSubcommands([dB,pB,fB])),hB=_n.runWith(Nee,{version:mB});var Dee=hB(process.argv.slice(2)).pipe(ie.catchTag("GuideNotFound",e=>Po.error(e.message).pipe(ie.andThen(ie.sync(()=>{process.exitCode=1})))),ie.provide(Ng.layer));$g.runMain(Dee);
