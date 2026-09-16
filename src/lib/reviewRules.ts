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
 if(s.purpose.trim().length<30||words.length<6)add('purpose-short','error','purpose','Your purpose is too short to explain the study clearly.','Use at least 30 characters and 6 meaningful words.');
 if(placeholder.test(s.purpose))add('purpose-placeholder','error','purpose','Your purpose contains placeholder text.');
 if(s.purpose.length>1200)add('purpose-long','warning','purpose','Your purpose exceeds 1,200 characters. Check that it is concise and easy to understand.');
 if(s.activity.trim().length<30)add('activity-short','error','activity','Your participant activity description must contain at least 30 characters.');
 if(placeholder.test(s.activity))add('activity-placeholder','error','activity','Your participant activity description contains placeholder text.');
 const matches:Record<string,RegExp>={'Survey or questionnaire':/\b(survey|questionnaire|form|questions)\b/i,'Individual interview':/\b(interview|conversation|questions|discussion)\b/i,'Focus group or group discussion':/\b(focus group|group discussion|discussion|session)\b/i,'Observation':/\b(observe|observation|observed|observing)\b/i,'Workshop or activity':/\b(workshop|activity|session|exercise)\b/i};
 s.methods.forEach(m=>{if(matches[m]&&!matches[m].test(s.activity))add(`method-${m}`,'warning','activity',`You selected “${m}”, but the activity description does not mention related wording. Check that participants are clearly told what they will do.`);});
 const recording={audio:/\b(audio|record|recording|recorded)\b/i,video:/\b(video|filming|filmed)\b/i,photos:/\b(photo|photos|photograph|photographs|photography|photographed|pictures)\b/i};
 for(const key of ['audio','video','photos'] as const)if(s.permissions[key]&&!recording[key].test(s.activity))add(`recording-${key}`,'warning','activity',`You selected ${key==='photos'?'photography':key+' recording'}, but this is not mentioned in the participant activity description.`);
 if((s.unit==='minutes'&&Number(s.duration)>480)||(s.unit==='hours'&&Number(s.duration)>12))add('duration-long','warning','duration',`You entered ${s.duration} ${s.unit}. Please check that the duration is correct.`);
 // The official course title is the sole terminology exception.
 const disallowed=new RegExp('re'+'search|co-investigator','i');
 const fields:Record<string,string>={title:s.title,purpose:s.purpose,activity:s.activity,partner:s.partner,exclusion:s.exclusion,eligibility:s.hasEligibility?s.eligibility:'',otherMethod:s.methods.includes('Other')?s.otherMethod:'',fellowName:s.fellowName,fellowEmail:s.fellowEmail,...Object.fromEntries(s.students.map((p,i)=>[`student${i}`,p.name+' '+p.email]))};
 for(const [field,value] of Object.entries(fields))if(disallowed.test(value.replaceAll(COURSES[0],'')))add(`terminology-${field}`,'error',field,'Use coursework study terminology in this field: “study”, “student investigator” or “Principal Investigator”.');
 SAFEGUARDS.forEach(q=>{if(s.safeguards[q.key])add(`safeguard-${q.key}`,'fellow-review',q.key,q.reason);});
 return out;
}
