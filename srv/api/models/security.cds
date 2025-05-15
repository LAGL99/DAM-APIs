namespace security;

// --- Tipos de detalle de registro ---
type DetailRowReg {
CURRENT   : Boolean;
REGDATE   : DateTime;
REGTIME   : DateTime;
REGUSER   : String;
}

type DetailRow {
ACTIVED         : Boolean;
DELETED         : Boolean;
DETAIL_ROW_REG  : Array of DetailRowReg;
}

// === ENTIDADES ZtLabel y ZtValue basadas en Mongoose ===
entity ZtLabel {
key COMPANYID   : String;
key CEDIID      : String;
key LABELID     : String;
LABEL       : String;
INDEX       : String;
COLLECTION  : String;
SECTION     : String;
SEQUENCE    : Integer;
IMAGE       : String;
DESCRIPTION : String;
DETAIL_ROW  : DetailRow;
// Composición de valores relacionados
VALUES        : Composition of many ZtValue on VALUES.LABELID = $self.LABELID;
}

entity ZtValue {
key COMPANYID    : String;
key CEDIID       : String;
key LABELID      : String;
key VALUEID      : String;
VALUEPAID    : String;
VALUE        : String;
ALIAS        : String;
SEQUENCE     : Integer;
IMAGE        : String;
VALUESAPID   : String;
DESCRIPTION  : String;
ROUTE        : String;
DETAIL_ROW   : DetailRow;
}

// Proyección combinada para exponer catálogo con valores
entity CatalogWithValues as projection on ZtLabel {
COMPANYID,
CEDIID,
LABELID,
LABEL,
INDEX,
COLLECTION,
SECTION,
SEQUENCE,
IMAGE,
DESCRIPTION,
DETAIL_ROW,
VALUES
}

// === Otros tipos y entidades, no modificados ===
type RoleData : {
ROLEID    : String;
ROLEIDSAP : String;
};

entity User {
USERID         : String;
PASSWORD       : String;
USERNAME       : String;
ALIAS          : String;
FIRSTNAME      : String;
LASTNAME       : String;
BIRTHDAYDATE   : Date;
COMPANYID      : Integer;
COMPANYNAME    : String;
COMPANYALIAS   : String;
CEDIID         : String;
EMPLOYEEID     : String;
EMAIL          : String;
PHONENUMBER    : String;
EXTENSION      : String;
DEPARTMENT     : String;
FUNCTION       : String;
STREET         : String;
POSTALCODE     : Integer;
CITY           : String;
REGION         : String;
STATE          : String;
COUNTRY        : String;
AVATAR         : String;
ROLES          : Array of RoleData;
DETAIL_ROW     : DetailRow;
}

type PrivilegeData : {
PROCESSID    : String;
PRIVILEGEID  : Array of String;
};

entity Role {
ROLEID        : String;
ROLENAME      : String;
DESCRIPTION   : String;
PRIVILEGES    : Array of PrivilegeData;
DETAIL_ROW    : DetailRow;
}

entity Process {
COMPANYID   : String;
CEDIID      : String;
LABELID     : String;
VALUEPAID   : String;
VALUEID     : String;
VALUE       : String;
ALIAS       : String;
SEQUENCE    : Integer;
IMAGE       : String;
VALUESAPID  : String;
DESCRIPTION : String;
DETAIL_ROW  : DetailRow;
}

entity View {
COMPANYID   : String;
CEDIID      : String;
LABELID     : String;
VALUEPAID   : String;
VALUEID     : String;
VALUE       : String;
ALIAS       : String;
SEQUENCE    : Integer;
IMAGE       : String;
VALUESAPID  : String;
DESCRIPTION : String;
ROUTE       : String;
DETAIL_ROW  : DetailRow;
}

