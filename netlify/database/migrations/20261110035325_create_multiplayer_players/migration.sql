CREATE TABLE "players" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"color" text NOT NULL,
	"x" integer NOT NULL,
	"y" integer NOT NULL,
	"jump_z" integer DEFAULT 0 NOT NULL,
	"dir_x" integer DEFAULT 0 NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"last_seen" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "players_last_seen_idx" ON "players" ("last_seen");