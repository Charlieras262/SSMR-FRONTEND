export interface CriterionEvalution{
    noCriterio: Number
    nombreCriterio:String
    ponderacion: String
    estadoColaborador: Number
    usuarioAgrega?: String
    fechaAgrega?: Date
    fechaModifica?: Date
    usuarioModifica?: String

}


export interface CriterionUpdate{

   noCriterio:number;
  nombreCriterio:String;
   estadoColaborador:number;
 usuarioModifica:String;
  ponderacion:number;
}
