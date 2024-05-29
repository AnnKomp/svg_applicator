  export type Parcours = {
    id: number;
    nom: string;
  }

  ////////////
  export type Tombe = {
    id: string;
    nom : string;
    carre : string;
    x : number;
    y : number;
    vertical : boolean;
    photo : string;
  }

  export type Liason = {
    idparcours: string;
    idpersonne: string;
  }
  
  export type Personne = {
    id: string;
    nom: string;
    tombe: string;
    nom_site: string;
  };