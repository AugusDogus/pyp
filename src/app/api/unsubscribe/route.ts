import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/lib/db";
import { verifyUnsubscribeToken } from "~/lib/email";
import { savedSearch } from "~/schema";

// POST - One-click unsubscribe (required by Gmail/Yahoo List-Unsubscribe header)
export async function POST(request: NextRequest) {
  const searchId = request.nextUrl.searchParams.get("id");
  const token = request.nextUrl.searchParams.get("token");

  if (!searchId || !token || !verifyUnsubscribeToken(searchId, token)) {
    return new NextResponse(null, { status: 400 });
  }

  await db
    .update(savedSearch)
    .set({ emailAlertsEnabled: false })
    .where(eq(savedSearch.id, searchId));

  return new NextResponse(null, { status: 200 });
}
