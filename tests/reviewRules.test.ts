import { describe,it,expect } from 'vitest';
import { readFileSync } from 'node:fs';
import PizZip from 'pizzip';
import { validStudy,cases } from './fixtures';
import { reviewStudy } from '../src/lib/reviewRules';
import { buildDocx,documentBody,filename } from '../src/lib/generateDocx';
import { optionalPermissions,pisSections } from '../src/data/documentText';
import { COURSES } from '../src/data/courses';
import { FELLOWS } from '../src/data/fellows';
const base=readFileSync('public/document-base.docx');
const banned=new RegExp('re'+'search','i');
describe('deterministic checks',()=>{
 it('accepts a valid simple interview',()=>expect(reviewStudy(validStudy())).toEqual([]));
 it('rejects empty purpose',()=>{const s=validStudy();s.purpose='';expect(reviewStudy(s).some(i=>i.id==='purpose-short'&&i.severity==='error')).toBe(true);});
 it('rejects placeholders',()=>{const s=validStudy();s.purpose='Fill in the purpose of the study in this space.';expect(reviewStudy(s).some(i=>i.id==='purpose-placeholder')).toBe(true);});
 it('adds audio consent without requiring repeated keywords',()=>{const s=validStudy();s.permissions.audio=true;expect(reviewStudy(s)).toEqual([]);expect(documentBody(s)).toContain('audio recording');expect(()=>buildDocx(s,base)).not.toThrow();});
 it('does not infer method mismatches from keywords',()=>{const s=validStudy();s.activity='Participants complete a survey about local community spaces.';expect(reviewStudy(s)).toEqual([]);});
 for(const key of ['distress','deception','capacity','pressure'] as const)it(`flags ${key} without blocking generation`,()=>{const s=validStudy();s.safeguards[key]=true;expect(reviewStudy(s).some(i=>i.id===`safeguard-${key}`&&i.severity==='fellow-review')).toBe(true);expect(()=>buildDocx(s,base)).not.toThrow();});
 it('does not claim low risk when distress is selected',()=>{const s=validStudy();s.safeguards.distress=true;expect(pisSections(s)[9].paragraphs[0]).not.toContain('No significant risks');});
 it('includes only separately selected optional consent clauses',()=>{const s=validStudy();expect(optionalPermissions(s)).toEqual([]);s.permissions.audio=true;s.permissions.identity=true;expect(optionalPermissions(s).map(p=>p.key)).toEqual(['audio','identity']);});
 it('does not promise anonymous quotations when identification is possible',()=>{const s=cases().D;expect(optionalPermissions(s).find(p=>p.key==='quotes')!.text).toContain('unless I separately agree');});
 it('retains all nine exact course names',()=>expect(COURSES).toEqual(['Tembusu Undergraduate Research Opportunity','Independent Study','The Tembusu Senior Learning Experience Project','Health and the Community in Singapore',"Singapore as 'Model' City?",'Happiness By Design','Picturing and Seeing Development','Technologies and Ageing in Singapore','Migrant Workers, Rhetoric, and Performance']));
 it('maps all ten fellows and rejects mismatched email',()=>{expect(FELLOWS).toHaveLength(10);for(const f of FELLOWS){const s={...validStudy(),fellowName:f.name,fellowEmail:f.email};expect(reviewStudy(s)).toEqual([]);expect(documentBody(s)).toContain(f.email);}const s=validStudy();s.fellowEmail='wrong@nus.edu.sg';expect(reviewStudy(s).some(i=>i.field==='fellowName')).toBe(true);});
 it('rejects invalid age bounds, zero duration, missing method and missing other text',()=>{const s=validStudy();s.maxAge='17';s.duration='0';s.methods=['Other'];expect(reviewStudy(s).filter(i=>i.severity==='error').map(i=>i.field)).toEqual(expect.arrayContaining(['maxAge','duration','otherMethod']));});
 it('supports decimal duration and no upper age limit',()=>{const s=validStudy();s.duration='1.5';s.unit='hours';s.noUpperAge=true;s.maxAge='';expect(reviewStudy(s)).toEqual([]);expect(documentBody(s)).toContain('1.5 hours');});
 it('warns for long duration without blocking',()=>{const s=validStudy();s.duration='481';expect(reviewStudy(s).some(i=>i.id==='duration-long')).toBe(true);expect(()=>buildDocx(s,base)).not.toThrow();});
 it('blocks terminology outside the course-name exception',()=>{const s=validStudy();s.purpose+=' This is a '+'re'+'search study.';expect(reviewStudy(s).some(i=>i.id==='terminology-purpose')).toBe(true);});
 it('escapes XML and creates a safe filename',()=>{const s=validStudy();s.title='Community <connections> & shared spaces';expect(documentBody(s)).toContain('&lt;connections&gt; &amp;');expect(filename(s)).not.toMatch(/[<>]/);});
 it('blocks generation with errors',()=>{const s=validStudy();s.purpose='';expect(()=>buildDocx(s,base)).toThrow();});
 for(const [name,s] of Object.entries(cases()))it(`generates clean editable DOCX for case ${name}`,()=>{const zip=new PizZip(buildDocx(s,base));const text=Object.keys(zip.files).filter(n=>n.endsWith('.xml')).map(n=>zip.file(n)!.asText()).join(' ');expect(banned.test(text)).toBe(false);expect(text).not.toMatch(/undefined|\{\{|w:highlight/);expect(zip.file('word/document.xml')!.asText()).toContain('<w:pageBreakBefore/>');expect(zip.file('word/footer1.xml')!.asText()).toContain('NUMPAGES');expect(zip.file('word/header1.xml')!.asText()).toEqual(new PizZip(base).file('word/header1.xml')!.asText());});
 it('allows the official course-name exception and no other occurrences',()=>{const s=validStudy();s.course=COURSES[0];const text=documentBody(s);expect(banned.test(text.replaceAll(COURSES[0],''))).toBe(false);expect(text.split(COURSES[0])).toHaveLength(3);});
});

it('fixes age criteria and prints optional exclusions only when supplied',()=>{
 const s=validStudy();expect(pisSections(s)[3].paragraphs.join(' ')).toContain('18 for NUS students, 21 for non-NUS students');
 expect(pisSections(s)[3].paragraphs.join(' ')).not.toContain('Exclusion criteria:');
 s.exclusion='People who have already completed this activity.';
 expect(pisSections(s)[3].paragraphs.join(' ')).toContain('Exclusion criteria: People who have already completed this activity.');
});
it('uses the requested investigator heading and one direct contact sentence',()=>{
 const s=validStudy();expect(pisSections(s)[1].heading).toBe('Study Investigators');
 expect(pisSections(s)[12].paragraphs).toEqual(['For questions about this study, please contact Dr Connor Graham (rctccg@nus.edu.sg).']);
 expect(documentBody(s)).not.toContain('Fellow-in-Charge');
 expect(documentBody(s)).toContain('<w:jc w:val="both"/>');
});
it('formats both page-number fields uniformly',()=>{
 const footer=new PizZip(buildDocx(validStudy(),base)).file('word/footer1.xml')!.asText();
 const runs=footer.match(/<w:r>[\s\S]*?<\/w:r>/g)||[];
 expect(runs.length).toBeGreaterThan(0);
 runs.forEach(run=>{expect(run).toContain('w:ascii="Arial"');expect(run).toContain('<w:sz w:val="22"/>');});
});

 describe('natural language use cases',()=>{
  it.each(['Participants test a prototype and explain their choices.','Participants sample different teas and rate their preferences.','Participants fill in a form about their daily commute.','Participants chat one to one about their neighbourhood.','Participants draw a map of places they visit each week.','Participants are watched as they navigate a shared space.'])('accepts everyday activity wording: %s',activity=>{const s=validStudy();s.activity=activity;expect(reviewStudy(s)).toEqual([]);expect(()=>buildDocx(s,base)).not.toThrow();});
  it('accepts test and sample as meaningful title and purpose words',()=>{const s=validStudy();s.title='A taste test of familiar local foods';s.purpose='We compare how a sample of students experience different foods.';expect(reviewStudy(s)).toEqual([]);});
  it('allows concise meaningful descriptions with dismissible advice',()=>{const s=validStudy();s.purpose='Explore belonging.';s.activity='Draw a neighbourhood map.';expect(reviewStudy(s).filter(i=>i.severity==='error')).toEqual([]);expect(reviewStudy(s).filter(i=>i.severity==='warning')).toHaveLength(2);expect(()=>buildDocx(s,base)).not.toThrow();});
  it.each(['test','TBC','xxx','lorem ipsum dolor sit amet','Fill in the purpose of the study here.'])('still detects obvious unfinished text: %s',purpose=>{const s=validStudy();s.purpose=purpose;expect(reviewStudy(s).some(i=>i.id==='purpose-placeholder')).toBe(true);});
  it('still blocks an empty activity',()=>{const s=validStudy();s.activity=' ';expect(()=>buildDocx(s,base)).toThrow();});
  it.each(['audio','video','photos'] as const)('generates selected %s permissions without requiring keywords',key=>{const s=validStudy();s.permissions[key]=true;expect(reviewStudy(s)).toEqual([]);expect(optionalPermissions(s).map(p=>p.key)).toContain(key);expect(()=>buildDocx(s,base)).not.toThrow();});
 });
