export type Permission = 'audio' | 'video' | 'photos' | 'quotes' | 'identity';
export type Safeguard = 'distress' | 'deception' | 'capacity' | 'pressure';
export interface Study {
 title: string; course: string; fellowName: string; fellowEmail: string;
 students: {name: string; email: string}[]; partner: string; count: string;
 purpose: string; activity: string; methods: string[]; otherMethod: string;
 duration: string; unit: 'minutes' | 'hours'; minAge: string; maxAge: string;
 noUpperAge: boolean; hasEligibility: boolean; eligibility: string;
 permissions: Record<Permission, boolean>; safeguards: Record<Safeguard, boolean>;
}
export const emptyStudy = (): Study => ({title:'',course:'',fellowName:'',fellowEmail:'',students:[{name:'',email:''}],partner:'',count:'',purpose:'',activity:'',methods:[],otherMethod:'',duration:'',unit:'minutes',minAge:'',maxAge:'',noUpperAge:false,hasEligibility:false,eligibility:'',permissions:{audio:false,video:false,photos:false,quotes:false,identity:false},safeguards:{distress:false,deception:false,capacity:false,pressure:false}});
