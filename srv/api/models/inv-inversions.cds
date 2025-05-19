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

type Signal : {
    Date      : DateTime;    // "2024-05-08T12:00:00Z"
    Type      : String;      // "buy" | "sell"
    Price     : Decimal(18,8);
    Reasoning : String;
}
entity Simulation {
    key IdSimulation       : String;              // "SOL_USDT_TBS_20240501_001"
        IdUser             : String;              // "USER_TEST"
        IdStrategy         : String;              // "TBS"
        SimulationName     : String;              // "Turtle Soup Swing SOL/USDT"
        Symbol             : String;              // "SOL_USDT"
        StartDate          : DateTime;            // "2024-05-01"
        EndDate            : DateTime;            // "2024-06-30"
        Amount             : Decimal(18,8);       // "1000"
        Specs              : String;              // "Donchian:20&RR:1.5"
        Result             : Decimal(18,8);       // 30.00
        PercentageReturn   : Decimal(5,4);        // 0.03
        Signals            : array of Signal;     // array de señales
        DetailRow          : array of DetailRow;  // reuso de tu tipo existente
}

