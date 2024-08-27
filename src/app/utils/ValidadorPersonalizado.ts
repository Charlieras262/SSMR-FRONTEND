import { AbstractControl } from "@angular/forms";

export class ValidadorPersonalizado {

static correoUmg(control: AbstractControl){
const correo = control.value;

if(!correo.endsWith('@miumg.edu.gt')){

return {correoUmg: true};
}
return null;
}

}
