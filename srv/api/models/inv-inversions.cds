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


entity strategies {
    key ID          : String;
        NAME        : String;
        DESCRIPTION : String;
        RULES       : array of StrategyRule;
        DETAIL_ROW  : array of DetailRow;
}
type StrategyRule : {
    INDICATOR : String;
    PERIOD    : Integer;
    CONDITION : String;
    ACTION    : String;
};

type DetailRow : {
    ACTIVED        : Boolean;
    DELETED        : Boolean;
    DETAIL_ROW_REG : array of DetailRowReg;
};

type DetailRowReg : {
    CURRENT : Boolean;
    REGDATE : DateTime;
    REGTIME : DateTime; 
    REGUSER : String;
};