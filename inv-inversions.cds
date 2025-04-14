namespace inv;


entity priceshistory{

    key ID      :Integer;
    DATE        :DateTime;
    OPEN        :Decimal;
    HIGH        :Decimal;
    LOW         :Decimal;
    CLOSE       :Decimal;
    VOLUME      :Decimal;

};


entity strategies  {
    key ID      :Integer;
    NAME        :String;
    DESCRIPTION :String;
    TIME        :Time;
    RISE        :Double;
    
}

// ENTIDADES PARA CATÁLOGOS

entity ztlabels {
    key LABELID     : String;
    COMPANYID       : String;
    CEDIID          : String;
    LABEL           : String;
    INDEX           : String;
    COLLECTION      : String;
    SECTION         : String;
    SEQUENCE        : Integer;
    IMAGE           : String;
    DESCRIPTION     : String;
    DETAIL_ROW      : Composition of one DetailRow;
};

entity ztvalues {
    key VALUEID     : String;
    LABELID         : String;
    COMPANYID       : String;
    CEDIID          : String;
    VALUE           : String;
    VALUEPAID       : String;
    VALUESAPID      : String;
    ALIAS           : String;
    SEQUENCE        : Integer;
    IMAGE           : String;
    DESCRIPTION     : String;
    ROUTE           : String;
    DETAIL_ROW      : Composition of one DetailRow;
};

entity DetailRow {
    key ID          : Integer;
    ACTIVED         : Boolean;
    DELETED         : Boolean;
    DETAIL_ROW_REG  : Composition of many DetailRowReg;
};

entity DetailRowReg {
    key ID          : Integer;
    CURRENT         : Boolean;
    REGDATE         : DateTime;
    REGTIME         : DateTime;
    REGUSER         : String;
};