namespace security;

entity Catalog {
  COMPANYID   : String;
  CEDIID      : String;
  LABELID     : String;
  LABEL       : String;
  INDEX       : String;
  SECTION     : String;
  SEQUENCE    : Integer;
  IMAGE       : String;
  DESCRIPTION : String;
  DETAIL_ROW  : String;
}

entity Value {
  LABELID     : String;
  VALUEID     : String;
  VALUE       : String;
  ALIAS       : String;
  SEQUENCE    : Integer;
  IMAGE       : String;
  DESCRIPTION : String;
  DETAIL_ROW  : String;
}

entity CatalogWithValues {
  COMPANYID   : String;
  CEDIID      : String;
  LABELID     : String;
  LABEL       : String;
  INDEX       : String;
  SECTION     : String;
  SEQUENCE    : Integer;
  IMAGE       : String;
  DESCRIPTION : String;
  VALUES      : Composition of many Value;
}

entity User {
  USERID     : String;
  USERNAME   : String;
  EMAIL      : String;
  FIRSTNAME  : String;
  LASTNAME   : String;
  ROLES      : Composition of many Role;
  DETAIL_ROW : String;
}

entity Role {
  ROLEID     : String;
  ROLENAME   : String;
  DESCRIPTION: String;
  PRIVILEGES : String; // Array raw as JSON
  DETAIL_ROW : String;
}

entity View {
  VALUEID     : String;
  VALUE       : String;
  LABELID     : String;
  DESCRIPTION : String;
  ROUTE       : String;
  DETAIL_ROW  : String;
}

entity Process {
  VALUEID     : String;
  VALUE       : String;
  LABELID     : String;
  DESCRIPTION : String;
  DETAIL_ROW  : String;
}
