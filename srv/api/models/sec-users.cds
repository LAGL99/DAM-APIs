namespace sec;

entity Users {
  key USERID: Integer;
  PASSWORD: String;
  USERNAME: String;
  ALIAS: String;
  FIRSTNAME: String;
  LASTNAME: String;
  BIRTHDAYDATE: String;
  COMPANYID: Integer;
  COMPANYNAME: String;
  COMPANYALIAS: String;
  CEDIID: String;
  EMPLOYEEID: String;
  EMAIL: String;
  PHONENUMBER: String;
  EXTENSION: String;
  DEPARTMENT: String;
  FUNCTION: String;
  STREET: String;
  POSTALCODE: Integer;
  CITY: String;
  REGION: String;
  STATE: String;
  COUNTRY: String;
  AVATAR: String;
  ROLES: Composition of many Roles;
  DETAIL_ROW: Composition of DetailRow;
}

entity Roles {
  key ROLEID: Integer;
  ROLEIDSAP: String;
  ROLENAME: String;
  DESCRIPTION: String;
  PROCESSES: Composition of many Processes;
  DETAIL_ROW: Composition of DetailRow;
}

entity Processes {
  key PROCESSID: Integer;
  PROCESSNAME: String;
  APPLICATIONID: String;
  APLICATIONNAME: String;
  VIEWID: String;
  VIEWNAME: String;
  PRIVILEGES: Composition of many Privileges;
}

entity Privileges {
  key PRIVILEGEID: Integer;
  PRIVILEGENAME: String;
}

entity DetailRow {
  key DETAILROWID: Integer;
  ACTIVED: Boolean;
  DELETED: Boolean;
  DETAIL_ROW_REG: Composition of many DetailRowReg;
}

entity DetailRowReg {
  key DETAILROWREGID: Integer;
  CURRENT: Boolean;
  REGDATE: Timestamp;
  REGTIME: Timestamp;
  REGUSER: String;
}
