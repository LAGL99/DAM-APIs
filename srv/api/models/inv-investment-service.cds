using { cuid } from '@sap/cds/common';

service InvestmentService {
    @readonly
    entity Company {
        SYMBOL : String;
        NAME   : String;
        EXCHANGE : String;
        ASSETTYPE : String;
        IPODATE   : String;
        DELISTINGDATE : String;
        STATUS : String;
    }

    @impl: './handlers/company.js'
    function getCompanies() returns array of Company;
}
