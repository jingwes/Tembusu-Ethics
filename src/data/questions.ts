import type { Permission, Safeguard } from '../types/study';
export const METHODS = ['Survey or questionnaire','Individual interview','Focus group or group discussion','Observation','Workshop or activity','Other'];
export const PERMISSIONS: {key:Permission; label:string; short:string}[] = [
 {key:'audio',label:'Will participants be audio recorded?',short:'Audio recording'},
 {key:'video',label:'Will participants be video recorded?',short:'Video recording'},
 {key:'photos',label:'Will photographs of participants be taken?',short:'Photography'},
 {key:'quotes',label:'May direct quotations from participants be used?',short:'Direct quotations'},
 {key:'identity',label:"May a participant’s name, role or position be identified alongside their comments?",short:'Name, role or position'},
];
export const SAFEGUARDS: {key:Safeguard; label:string; reason:string}[] = [
 {key:'distress',label:'Could the study involve questions or activities that may reasonably cause significant distress, embarrassment or discomfort beyond ordinary conversation?',reason:'You indicated that questions or activities may reasonably cause significant distress, embarrassment or discomfort beyond ordinary conversation.'},
 {key:'deception',label:'Will participants be intentionally misled or will important information about the purpose of the study be deliberately withheld?',reason:'You indicated that participants will be intentionally misled or important information about the study’s purpose will be deliberately withheld.'},
 {key:'capacity',label:'Will participation involve people who may not be able to provide informed consent independently?',reason:'You indicated that participants may not be able to provide informed consent independently.'},
 {key:'pressure',label:'Could participants reasonably feel pressured to participate because of an authority, employment, caregiving, academic or dependent relationship?',reason:'You indicated that participants may reasonably feel pressured to participate because of an authority, employment, caregiving, academic or dependent relationship.'},
];
