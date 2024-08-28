export namespace Catalog {
    export class UserStatus {
        static readonly ACTIVE = 1;
        static readonly INACTIVE = 2;
        static readonly FIRST_LOGIN = 3;
        static readonly DELETED = 4;
    }
    
    export class UserRoles {
        static readonly ROOT = 5;
        static readonly ADMIN = 6;
        static readonly AUDITOR = 7;
        static readonly INSTITUTION = 8;
    }

    export class AuditStatus {
        static readonly CREATED = 9;
        static readonly IN_PROCESS = 10;
        static readonly FINISHED = 11;
    }

    export class ResultStatus {
        static readonly SUCCEED = 12;
        static readonly FAIL = 13;
    }
}