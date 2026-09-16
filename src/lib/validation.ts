import type { Study } from '../types/study';
import { COURSES } from '../data/courses';
import { FELLOWS } from '../data/fellows';
export type FieldErrors = Record<string,string>;
export const placeholder = /\b(test|tbc|xxx|asdf|lorem ipsum|fill in|title here|sample)\b/i;
const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const integer = (s:string) => s.trim() !== '' && Number.isSafeInteger(Number(s));
export function validateDetails(s:Study):FieldErrors {
 const e:FieldErrors={};
 if(s.title.trim().length<10 || s.title.trim().length>180) e.title='Enter a descriptive study title of 10–180 characters.';
 else if(placeholder.test(s.title)) e.title='Replace placeholder text with a formal study title.';
 if(!COURSES.includes(s.course as typeof COURSES[number])) e.course='Select a course.';
 if(!FELLOWS.some(f=>f.name===s.fellowName&&f.email===s.fellowEmail)) e.fellowName='Select a Principal Investigator from the list.';
 if(s.students.length<1 || s.students.length>8) e.students='Include between 1 and 8 students.';
 s.students.forEach((p,i)=>{if(!p.name.trim())e[`studentName${i}`]='Enter the student’s full name.';if(!email.test(p.email.trim()) || !/@(?:u\.)?nus\.edu(?:\.sg)?$/i.test(p.email.trim())) e[`studentEmail${i}`]='Enter a valid NUS email address.';});
 if(!integer(s.count)||Number(s.count)<=0)e.count='Enter a positive whole number of participants.';
 return e;
}
export function validateActivity(s:Study):FieldErrors {
 const e:FieldErrors={};
 if(!s.methods.length)e.methods='Select at least one participation method.';
 if(s.methods.includes('Other')&&!s.otherMethod.trim())e.otherMethod='Specify the other participation method.';
 if(!s.duration.trim()||!Number.isFinite(Number(s.duration))||Number(s.duration)<=0)e.duration='Enter a duration greater than zero.';
 if(!['minutes','hours'].includes(s.unit))e.unit='Select minutes or hours.';
 if(!s.noUpperAge&&(!integer(s.maxAge)||Number(s.maxAge)<18))e.maxAge='Enter a maximum age of at least 18. Non-NUS students must still be at least 21.';
 if(s.hasEligibility&&!s.eligibility.trim())e.eligibility='Describe the additional eligibility requirement.';
 return e;
}
