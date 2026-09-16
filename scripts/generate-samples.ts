import { readFileSync,writeFileSync,mkdirSync } from 'node:fs';
import { cases,validStudy } from '../tests/fixtures';
import { buildDocx } from '../src/lib/generateDocx';
mkdirSync('qa',{recursive:true});
const all=cases();for(const [name,s] of Object.entries(all))writeFileSync(`qa/case-${name}.docx`,buildDocx(s,readFileSync('public/document-base.docx')));
const stress=validStudy();stress.students=Array.from({length:8},(_,i)=>({name:`Student ${i+1}`,email:`student${i+1}@u.nus.edu`}));for(const key of Object.keys(stress.permissions))stress.permissions[key as keyof typeof stress.permissions]=true;writeFileSync('qa/all-permissions.docx',buildDocx(stress,readFileSync('public/document-base.docx')));
console.log('Generated five requested cases and eight-student/all-permission case.');
