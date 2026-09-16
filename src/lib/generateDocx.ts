import PizZip from 'pizzip';
import type { Study } from '../types/study';
import { CORE_CONSENT, DOC_TITLE, optionalPermissions, pisSections } from '../data/documentText';
import { reviewStudy } from './reviewRules';
const escapeXml=(s:string)=>s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&apos;');
function paragraph(text:string,{bold=false,title=false,before=0,keep=false,pageBreak=false}:{bold?:boolean;title?:boolean;before?:number;keep?:boolean;pageBreak?:boolean}={}) {
 const lines=text.split(/\r?\n/).map((line,i)=>`${i?'<w:br/>':''}<w:t xml:space="preserve">${escapeXml(line)}</w:t>`).join('');
 return `<w:p><w:pPr>${title?'<w:pStyle w:val="Title"/>':''}<w:jc w:val="${title?'center':bold||text.includes('\n')||text.includes('___')?'left':'both'}"/>${keep?'<w:keepNext/>':''}<w:widowControl/>${pageBreak?'<w:pageBreakBefore/>':''}<w:spacing w:before="${before}" w:after="120" w:line="240" w:lineRule="auto"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/><w:color w:val="000000"/><w:sz w:val="${title?28:20}"/>${bold||title?'<w:b/>':''}</w:rPr>${lines}</w:r></w:p>`;
}
export function documentBody(s:Study):string {
 let body=paragraph(DOC_TITLE,{title:true,keep:true,before:300});
 pisSections(s).forEach((sec,i)=>{body+=paragraph(`${i+1}. ${sec.heading}`,{bold:true,before:160,keep:true});sec.paragraphs.forEach((p,j)=>{body+=paragraph(p,{keep:p.endsWith(':')&&j<sec.paragraphs.length-1});});});
 body+=paragraph('INFORMED CONSENT FORM',{title:true,keep:true,pageBreak:true,before:180});
 body+=paragraph(`Study title: ${s.title.trim()}`,{bold:true,keep:true});
 body+=paragraph(`Course: ${s.course}`,{keep:true});
 CORE_CONSENT.forEach((p,i)=>body+=paragraph(`${i+1}. ${p}`));
 const optional=optionalPermissions(s);
 if(optional.length){body+=paragraph('Optional permissions',{bold:true,keep:true,before:160});body+=paragraph('For each item below, clearly circle either “agree” or “do not agree”. Each permission is a separate choice.',{keep:true});optional.forEach((p,i)=>body+=paragraph(`${CORE_CONSENT.length+i+1}. ${p.text}`));}
 for(const person of ['Participant','Consent Taker']){
 body+=paragraph(`Name of ${person}: ________________________________________`,{before:240,keep:true});
 body+=paragraph(`Signature of ${person}: _____________________________________`,{keep:true});
 body+=paragraph('Date: ______________________');
 }
 return body;
}
export function buildDocx(s:Study,base:ArrayBuffer|Uint8Array):Uint8Array {
 if(reviewStudy(s).some(i=>i.severity==='error'))throw new Error('Correct the validation errors before generating your document.');
 const zip=new PizZip(base);
 const xml=zip.file('word/document.xml')!.asText();
 const section=xml.match(/<w:sectPr\b[\s\S]*?<\/w:sectPr>/)?.[0];
 if(!section)throw new Error('The document template is missing its page layout.');
 zip.file('word/document.xml',xml.replace(/<w:body>[\s\S]*?<\/w:body>/,`<w:body>${documentBody(s)}${section}</w:body>`));
 return zip.generate({type:'uint8array',compression:'DEFLATE'});
}
export async function generateDocx(s:Study):Promise<Blob> {
 const response=await fetch(`${import.meta.env.BASE_URL}document-base.docx`);
 if(!response.ok)throw new Error('The document template could not be loaded. Please try again.');
 const bytes=buildDocx(s,await response.arrayBuffer());
 return new Blob([bytes as BlobPart],{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
}
export const filename=(s:Study)=>`Tembusu_PIS_CF_${s.title.trim().replace(/[^\p{L}\p{N}]+/gu,'_').replace(/^_+|_+$/g,'').slice(0,120)||'Study'}.docx`;
