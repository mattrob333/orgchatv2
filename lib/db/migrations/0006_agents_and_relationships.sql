CREATE TABLE IF NOT EXISTS "Agent" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" varchar(128) NOT NULL,
    "title" varchar(128) NOT NULL,
    "department" varchar(128),
    "userId" uuid,
    "systemPrompt" text,
    "modelId" varchar(64) NOT NULL,
    "avatarUrl" varchar(256)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "OrgRelationship" (
    "parentId" uuid NOT NULL,
    "childId" uuid NOT NULL,
    CONSTRAINT "OrgRelationship_parentId_childId_pk" PRIMARY KEY("parentId","childId")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Agent" ADD CONSTRAINT "Agent_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "OrgRelationship" ADD CONSTRAINT "OrgRelationship_parentId_Agent_id_fk" FOREIGN KEY ("parentId") REFERENCES "public"."Agent"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "OrgRelationship" ADD CONSTRAINT "OrgRelationship_childId_Agent_id_fk" FOREIGN KEY ("childId") REFERENCES "public"."Agent"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
