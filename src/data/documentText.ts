import type { Study, Permission } from '../types/study';
export const DOC_TITLE='PARTICIPANT INFORMATION SHEET (PIS) & CONSENT FORM (CF)';
export const MINIMUM_AGE_NOTICE='Minimum participant age is 18 for NUS students, 21 for non-NUS students.';
export const ADDRESS='Tembusu College, National University of Singapore';
export const PRIVACY_NOTICE='Information entered on this page is processed locally in your browser and is not uploaded or stored by this website.';
export const REVIEW_NOTICE='This study contains circumstances that require review by the Principal Investigator before participant recruitment begins.';
export const REVIEW_CONFIRMATION='This document can be generated, but the study should be reviewed by the Principal Investigator before participant recruitment begins.';
export const CORE_CONSENT=[
 'I have been informed about my participation in this study.',
 'I understand that taking part is voluntary and that I may decline to participate without penalty.',
 'I have had an opportunity to ask questions and have had my questions answered.',
 'I have received or been given access to the Participant Information Sheet and understand what participation involves.',
 'I understand that I may choose not to answer any question and may stop participating at any time without penalty.',
 'I agree to take part in this study.',
];
export const durationText=(s:Study)=>`${Number(s.duration)} ${Number(s.duration)===1?s.unit.slice(0,-1):s.unit}`;
export function optionalPermissions(s:Study):{key:Permission;text:string}[] {
 const p:{key:Permission;text:string}[]=[];
 if(s.permissions.audio)p.push({key:'audio',text:'I agree / do not agree to audio recording during my participation in this study.'});
 if(s.permissions.video)p.push({key:'video',text:'I agree / do not agree to video recording during my participation in this study.'});
 if(s.permissions.photos)p.push({key:'photos',text:'I agree / do not agree to photographs being taken during my participation in this study and used for the purposes described in the Participant Information Sheet.'});
 if(s.permissions.quotes)p.push({key:'quotes',text:s.permissions.identity?'I agree / do not agree for quotations from my participation to be used in study reports and presentations. Quotations will be de-identified unless I separately agree to identification below.':'I agree / do not agree for anonymised quotations from my participation to be used in study reports and presentations.'});
 if(s.permissions.identity)p.push({key:'identity',text:'I agree / do not agree for my name, role or position to be identified alongside my comments.'});
 return p;
}
export function pisSections(s:Study):{heading:string;paragraphs:string[]}[] {
 const contact=(p:{name:string;email:string},address=true)=>[p.name.trim(),p.email.trim(),...(address?[ADDRESS]:[])].join('\n');
 const disclosures:string[]=[];
 if(s.permissions.audio)disclosures.push('With your separate permission, audio recording will be used during your participation.');
 if(s.permissions.video)disclosures.push('With your separate permission, video recording will be used during your participation.');
 if(s.permissions.photos)disclosures.push('With your separate permission, photographs of you will be taken and may be used in coursework reports or presentations.');
 if(s.permissions.quotes)disclosures.push(s.permissions.identity?'With your separate permission, direct quotations may be used in reports and presentations. Quotations will be de-identified unless you also explicitly agree to identification.':'With your separate permission, anonymised direct quotations may be used in reports and presentations.');
 if(s.permissions.identity)disclosures.push('Your name, role or position may be identified alongside your comments only if you give separate, explicit permission.');
 return [
 {heading:'Study title',paragraphs:[s.title.trim()]},
 {heading:'Study Investigators',paragraphs:['Principal Investigator:',contact({name:s.fellowName,email:s.fellowEmail}),'Student Investigators:',...s.students.map(p=>contact(p))]},
 {heading:'What is the purpose of this study?',paragraphs:[s.purpose.trim(),'You are invited to participate in this study. This information sheet provides information about the study and what your participation will involve. The student investigators will also answer any questions you may have. Please read the information below and ask about anything you do not understand before deciding whether to take part.']},
 {heading:'Who can participate in the study?',paragraphs:[MINIMUM_AGE_NOTICE,s.noUpperAge?'There is no specific upper age limit.':`Participants must be no older than ${Number(s.maxAge)} years of age, inclusive.`,...(s.hasEligibility?[s.eligibility.trim()]:[]),...(s.exclusion.trim()?[`Exclusion criteria: ${s.exclusion.trim()}`]:[])]},
 {heading:'What is the expected duration of my participation?',paragraphs:[`You will be involved in the study for approximately ${durationText(s)}.`]},
 {heading:'What is the approximate number of participants involved?',paragraphs:[`Approximately ${Number(s.count)} participants will take part in this study.`]},
 {heading:'What will be done if I take part in this study?',paragraphs:[s.activity.trim(),...disclosures]},
 {heading:'How will information from the study be used?',paragraphs:[`Information is collected as part of a Tembusu College coursework study. The information collected will be used towards completion of coursework for the NUS course “${s.course}”, including a final report and/or presentation for assessment purposes.`,...(s.partner.trim()?[`The findings may also be shared with ${s.partner.trim()}. This does not include automatic sharing of raw identifiable study data.`]:[]),'The information collected as part of this study will not be used for academic publication without a separate process and, where appropriate, additional consent.']},
 {heading:'How will my privacy and the confidentiality of my study information be protected?',paragraphs:['Access to identifiable information is limited to the student investigators and Principal Investigator. Identifiable information will not be included in coursework reports or presentations unless you have explicitly agreed to identifiable use. Where practical, names and direct identifiers will be removed or replaced with codes.','The student team will collect only information needed for this study. Study materials will be stored securely, and participation records will not be publicly accessible. Study information will be kept confidential and de-identified where appropriate.']},
 {heading:'What are the possible discomforts or risks?',paragraphs:[s.safeguards.distress?'Potential discomforts or risks associated with this study will be explained to you before participation. You may choose not to answer any question or take part in any activity that makes you uncomfortable. You may also stop participating at any time.':'No significant risks beyond those ordinarily encountered in everyday conversation or activities are anticipated. You may choose not to answer any question or take part in any activity that makes you uncomfortable. You may also stop participating at any time.']},
 {heading:'What are the possible benefits to me and others?',paragraphs:["There may be no direct benefit to you from participating in this study. Your participation may contribute to the student team’s understanding of the topic and to the development of their coursework project.",...(s.partner.trim()?[`The findings may also help inform the student team’s work with ${s.partner.trim()}.`]:[])]},
 {heading:'Can I refuse to participate in this study?',paragraphs:['Yes. Your participation in this study is voluntary and completely up to you. You may choose not to answer any question and may stop participating at any time without giving a reason and without penalty.','If you withdraw before your information has been de-identified or combined with other participants’ information, you may ask the student team to discard information collected from you where reasonably practicable.']},
 {heading:'Whom should I contact if I have questions or concerns?',paragraphs:[`For questions about this study, please contact Dr ${s.fellowName.trim()} (${s.fellowEmail.trim()}).`]},
 ];
}
