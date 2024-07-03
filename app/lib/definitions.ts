
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

  export type Defunt = {
    id : string;
    celebrite: boolean;
    tombe : string;
    categorie : string;
    titre : string;
    nom : string;
    nomJFille : string;
    prenom : string;
    patronyme : string;
    pseudonyme : string;
    profession : string;
    dateNaissance: Date;
    jourNaissance: number;
    moisNaissance : number;
    anneeNaissance: number;
    villeNaissance : string;
    paysNaissance : string;
    dateDeces : Date;
    jourDeces : number;
    moisDeces : number;
    anneeDeces : number;
    lieuDeces : string;
    bio : string;
    carousel : boolean;
    validates : boolean;
    dynPageId : number;
  }

  export type Categorie = {
    categorie: string;
  }

  export type PageSlug = {
    pageSlug: string;
  }