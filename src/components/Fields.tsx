import { useId, type ReactNode } from 'react';
export function Field({label,error,hint,children}:{label:string;error?:string;hint?:string;children:(id:string,description:string)=>ReactNode}){
 const id=useId();return <div className="field"><label htmlFor={id}>{label}</label>{children(id,`${id}-help`)}{(hint||error)&&<p className={error?'field-error':'hint'} id={`${id}-help`}>{error||hint}</p>}</div>;
}
export function YesNo({label,value,onChange}:{label:string;value:boolean;onChange:(v:boolean)=>void}){
 const id=useId();return <fieldset className="yesno"><legend>{label}</legend><div className="choices">{[false,true].map(v=><label key={String(v)} className={`${v?'yes':'no'} ${value===v?'selected':''}`}><input type="radio" name={id} checked={value===v} onChange={()=>onChange(v)}/>{v?'Yes':'No'}</label>)}</div></fieldset>;
}
