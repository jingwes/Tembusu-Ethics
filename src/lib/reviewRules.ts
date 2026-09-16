import type { Study } from '../types/study';
import { placeholder, validateDetails, validateActivity } from './validation';
import { SAFEGUARDS } from '../data/questions';
import { COURSES } from '../data/courses';
export interface Issue {id:string;severity:'error'|'warning'|'fellow-review';field:string;message:string;suggestion?:string}
export function reviewStudy(s:Study):Issue[] {
 const out:Issue[]=[];
 const add=(id:string,severity:Issue['severity'],field:string,message:string,suggestion?:string)=>out.push({id,severity,field,message,suggestion});
 for(const [field,message] of Object.entries({...validateDetails(s),...validateActivity(s)}))add(`validation-${field}`,'error',field,message);
 const words=s.purpose.match(/\p{L}{2,}/gu)||[];
 if(!s.purpose.trim())add('purpose-short','error','purpose','Enter the purpose of your study.');
 else if(s.purpose.trim().length<30||words.length<6)add('purpose-brief','warning','purpose','Check that this brief purpose explains the study clearly.','You may keep concise wording if it gives participants enough information.');
 if(placeholder.test(s.purpose))add('purpose-placeholder','error','purpose','Your purpose contains placeholder text.');
 if(s.purpose.length>1200)add('purpose-long','warning','purpose','Your purpose exceeds 1,200 characters. Check that it is concise and easy to understand.');
 if(!s.activity.trim())add('activity-short','error','activity','Describe what participants will be asked to do.');
 else if(s.activity.trim().length<30)add('activity-brief','warning','activity','Check that this brief description explains what participants will do.');
 if(placeholder.test(s.activity))add('activity-placeholder','error','activity','Your participant activity description contains placeholder text.');
 if((s.unit==='minutes'&&Number(s.duration)>480)||(s.unit==='hours'&&Number(s.duration)>12))add('duration-long','warning','duration',`You entered ${s.duration} ${s.unit}. Please check that the duration is correct.`);
 // The official course title is the sole terminology exception.
 const disallowed=new RegExp('re'+'search|co-investigator','i');
 const fields:Record<string,string>={title:s.title,purpose:s.purpose,activity:s.activity,partner:s.partner,exclusion:s.exclusion,eligibility:s.hasEligibility?s.eligibility:'',otherMethod:s.methods.includes('Other')?s.otherMethod:'',fellowName:s.fellowName,fellowEmail:s.fellowEmail,...Object.fromEntries(s.students.map((p,i)=>[`student${i}`,p.name+' '+p.email]))};
 for(const [field,value] of Object.entries(fields))if(disallowed.test(value.replaceAll(COURSES[0],'')))add(`terminology-${field}`,'error',field,'Use coursework study terminology in this field: “study”, “student investigator” or “Principal Investigator”.');
 SAFEGUARDS.forEach(q=>{if(s.safeguards[q.key])add(`safeguard-${q.key}`,'fellow-review',q.key,q.reason);});
 return out;
}
