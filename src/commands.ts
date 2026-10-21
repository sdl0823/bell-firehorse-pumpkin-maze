export type Command={type:'move';dx:number;dy:number}|{type:'skip'|'tutorial'|'new';seed?:string}|{type:'interact'|'help'|'pause'|'replay'|'menu'};
