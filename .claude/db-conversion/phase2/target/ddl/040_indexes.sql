CREATE UNIQUE INDEX "rolenameindex" ON "dbo"."aspnetroles" ("name");
CREATE INDEX "aspnetuserclaims_ix_userid" ON "dbo"."aspnetuserclaims" ("userid");
CREATE INDEX "aspnetuserlogins_ix_userid" ON "dbo"."aspnetuserlogins" ("userid");
CREATE INDEX "ix_roleid" ON "dbo"."aspnetuserroles" ("roleid");
CREATE INDEX "aspnetuserroles_ix_userid" ON "dbo"."aspnetuserroles" ("userid");
CREATE UNIQUE INDEX "usernameindex" ON "dbo"."aspnetusers" ("username");
