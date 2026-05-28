import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { FullReport } from "@/lib/ai/report-generator";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import React from "react";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
    paddingTop: 48,
    paddingBottom: 64,
    paddingHorizontal: 56,
    fontSize: 10,
    color: "#1A1A18",
  },
  // Header
  header: { marginBottom: 32 },
  brand: { fontSize: 11, fontWeight: "bold", color: "#1A1A18", marginBottom: 4 },
  reportLabel: { fontSize: 9, color: "#888884", marginBottom: 24 },
  divider: { borderBottomWidth: 1, borderBottomColor: "#E8E8E4", marginBottom: 24 },

  // Status badge
  badgeRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, flexDirection: "row", alignItems: "center", gap: 6 },
  badgeDot: { width: 7, height: 7, borderRadius: 4 },
  badgeText: { fontSize: 9, fontWeight: 700 },

  // Headline
  headline: { fontSize: 22, fontWeight: "bold", lineHeight: 1.25, marginBottom: 10, color: "#1A1A18" },
  explanation: { fontSize: 10, color: "#636360", lineHeight: 1.6, marginBottom: 6 },
  confidence: { fontSize: 9, color: "#888884", marginBottom: 32 },

  // Section
  sectionTitle: { fontSize: 12, fontWeight: "bold", color: "#1A1A18", marginBottom: 10 },
  sectionBlock: { marginBottom: 28 },

  // Blocks
  dangerBlock: { backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FECACA", borderRadius: 10, padding: 14, marginBottom: 28 },
  dangerTitle: { fontSize: 10, fontWeight: "bold", color: "#EF4444", marginBottom: 8 },
  warningBlock: { backgroundColor: "#FFFBEB", borderWidth: 1, borderColor: "#FDE68A", borderRadius: 10, padding: 14, marginBottom: 28 },
  warningTitle: { fontSize: 10, fontWeight: "bold", color: "#F59E0B", marginBottom: 8 },

  listItem: { flexDirection: "row", gap: 8, marginBottom: 6 },
  bullet: { fontSize: 9, color: "#888884", marginTop: 1 },
  itemText: { fontSize: 9, color: "#3D3D3A", lineHeight: 1.5, flex: 1 },
  itemTextDanger: { fontSize: 9, color: "#B91C1C", lineHeight: 1.5, flex: 1 },
  itemTextWarning: { fontSize: 9, color: "#92400E", lineHeight: 1.5, flex: 1 },

  // Checklist card
  card: { backgroundColor: "#F7F7F5", borderWidth: 1, borderColor: "#E8E8E4", borderRadius: 10, padding: 16, marginBottom: 28 },
  subLabel: { fontSize: 8, fontWeight: "bold", color: "#888884", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8, marginTop: 12 },

  // Track card
  trackRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#F7F7F5", borderWidth: 1, borderColor: "#E8E8E4", borderRadius: 10, padding: 12, marginBottom: 8 },
  trackCountry: { fontSize: 10, fontWeight: "bold", color: "#1A1A18" },
  trackCategory: { fontSize: 9, color: "#636360", marginTop: 2 },
  trackScore: { fontSize: 18, fontWeight: "bold", color: "#1A1A18" },
  trackScoreSub: { fontSize: 8, color: "#888884", textAlign: "right" },

  // Steps
  stepRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  stepNum: { width: 20, height: 20, borderRadius: 10, backgroundColor: "#1A1A18", color: "#FFFFFF", fontSize: 8, fontWeight: "bold", textAlign: "center", paddingTop: 5 },
  stepText: { fontSize: 9, color: "#3D3D3A", lineHeight: 1.6, flex: 1, paddingTop: 3 },

  // Next actions
  nextBox: { borderWidth: 1, borderColor: "#E8E8E4", borderRadius: 8, padding: 12, marginBottom: 28 },
  nextText: { fontSize: 9, color: "#3D3D3A", lineHeight: 1.6 },
  nextBold: { fontWeight: "bold", color: "#1A1A18" },

  // Footer
  footer: { position: "absolute", bottom: 36, left: 56, right: 56 },
  footerDivider: { borderBottomWidth: 1, borderBottomColor: "#E8E8E4", marginBottom: 10 },
  footerText: { fontSize: 8, color: "#A0A09A", lineHeight: 1.5 },
});

const STATUS_COLORS = {
  ELIGIBLE: { bg: "#F0FDF4", border: "#BBF7D0", dot: "#22C55E", text: "#16A34A", label: "Eligible" },
  CONDITIONAL: { bg: "#FFFBEB", border: "#FDE68A", dot: "#F59E0B", text: "#D97706", label: "Conditionally Eligible" },
  NOT_ELIGIBLE: { bg: "#FEF2F2", border: "#FECACA", dot: "#EF4444", text: "#DC2626", label: "Not Currently Eligible" },
};

function buildDocument(report: FullReport, reportId: string) {
  const statusColor = STATUS_COLORS[report.status];

  return React.createElement(
    Document,
    { title: "Aspire Visa Pro — Eligibility Report" },
    React.createElement(
      Page,
      { size: "A4", style: styles.page },

      // Header
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, { style: styles.brand }, "Aspire Visa Pro"),
        React.createElement(Text, { style: styles.reportLabel }, `Nordic Visa Eligibility Report  ·  ID: ${reportId}`),
      ),
      React.createElement(View, { style: styles.divider }),

      // Status + headline
      React.createElement(
        View,
        { style: styles.badgeRow },
        React.createElement(
          View,
          { style: [styles.badge, { backgroundColor: statusColor.bg, borderWidth: 1, borderColor: statusColor.border }] },
          React.createElement(View, { style: [styles.badgeDot, { backgroundColor: statusColor.dot }] }),
          React.createElement(Text, { style: [styles.badgeText, { color: statusColor.text }] }, statusColor.label),
        ),
      ),
      React.createElement(Text, { style: styles.headline }, report.summary.headline),
      React.createElement(Text, { style: styles.explanation }, report.summary.plain_language_explanation),
      React.createElement(Text, { style: styles.confidence }, `Confidence level: ${report.eligibility.confidence_level}`),

      // Hard blocks
      report.eligibility.hard_blocks.length > 0 &&
        React.createElement(
          View,
          { style: styles.dangerBlock },
          React.createElement(Text, { style: styles.dangerTitle }, "Hard Blocks"),
          ...report.eligibility.hard_blocks.map((block, i) =>
            React.createElement(
              View,
              { key: i, style: styles.listItem },
              React.createElement(Text, { style: styles.bullet }, "✕"),
              React.createElement(Text, { style: styles.itemTextDanger }, block),
            ),
          ),
        ),

      // Risk flags
      report.eligibility.risk_flags.length > 0 &&
        React.createElement(
          View,
          { style: styles.warningBlock },
          React.createElement(Text, { style: styles.warningTitle }, "Risk Flags"),
          ...report.eligibility.risk_flags.map((flag, i) =>
            React.createElement(
              View,
              { key: i, style: styles.listItem },
              React.createElement(Text, { style: styles.bullet }, "▲"),
              React.createElement(Text, { style: styles.itemTextWarning }, flag),
            ),
          ),
        ),

      // Document checklist
      React.createElement(
        View,
        { style: styles.card },
        React.createElement(Text, { style: styles.sectionTitle }, "Document Checklist"),

        report.checklist.required_documents.length > 0 &&
          React.createElement(
            View,
            null,
            React.createElement(Text, { style: styles.subLabel }, "Required Documents"),
            ...report.checklist.required_documents.map((doc, i) =>
              React.createElement(
                View,
                { key: i, style: styles.listItem },
                React.createElement(Text, { style: [styles.bullet, { color: "#22C55E" }] }, "✓"),
                React.createElement(Text, { style: styles.itemText }, doc),
              ),
            ),
          ),

        report.checklist.missing_items.length > 0 &&
          React.createElement(
            View,
            null,
            React.createElement(Text, { style: styles.subLabel }, "Missing Items"),
            ...report.checklist.missing_items.map((item, i) =>
              React.createElement(
                View,
                { key: i, style: styles.listItem },
                React.createElement(Text, { style: [styles.bullet, { color: "#EF4444" }] }, "✕"),
                React.createElement(Text, { style: [styles.itemText, { color: "#B91C1C" }] }, item),
              ),
            ),
          ),

        report.checklist.optional_strengtheners.length > 0 &&
          React.createElement(
            View,
            null,
            React.createElement(Text, { style: styles.subLabel }, "Optional Strengtheners"),
            ...report.checklist.optional_strengtheners.map((item, i) =>
              React.createElement(
                View,
                { key: i, style: styles.listItem },
                React.createElement(Text, { style: styles.bullet }, "+"),
                React.createElement(Text, { style: styles.itemText }, item),
              ),
            ),
          ),
      ),

      // Visa tracks
      report.recommendations.primary_visa_tracks.length > 0 &&
        React.createElement(
          View,
          { style: styles.sectionBlock },
          React.createElement(Text, { style: styles.sectionTitle }, "Recommended Visa Tracks"),
          ...report.recommendations.primary_visa_tracks.map((track, i) =>
            React.createElement(
              View,
              { key: i, style: styles.trackRow },
              React.createElement(
                View,
                null,
                React.createElement(Text, { style: styles.trackCountry }, track.country),
                React.createElement(Text, { style: styles.trackCategory }, track.visa_category),
              ),
              React.createElement(
                View,
                { style: { alignItems: "flex-end" } },
                React.createElement(Text, { style: styles.trackScore }, `${track.score}`),
                React.createElement(Text, { style: styles.trackScoreSub }, "/ 100 match"),
              ),
            ),
          ),
        ),

      // Improvement steps
      report.improvement_steps.length > 0 &&
        React.createElement(
          View,
          { style: styles.sectionBlock },
          React.createElement(Text, { style: styles.sectionTitle }, "Improvement Steps"),
          ...report.improvement_steps.map((step, i) =>
            React.createElement(
              View,
              { key: i, style: styles.stepRow },
              React.createElement(Text, { style: styles.stepNum }, String(i + 1)),
              React.createElement(Text, { style: styles.stepText }, step),
            ),
          ),
        ),

      // Next actions
      report.next_actions.message &&
        React.createElement(
          View,
          { style: styles.nextBox },
          React.createElement(
            Text,
            { style: styles.nextText },
            React.createElement(Text, { style: styles.nextBold }, "What to do next:  "),
            report.next_actions.message,
          ),
        ),

      // Footer
      React.createElement(
        View,
        { style: styles.footer, fixed: true },
        React.createElement(View, { style: styles.footerDivider }),
        React.createElement(
          Text,
          { style: styles.footerText },
          `Generated ${new Date(report.generated_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}. Valid for 90 days. Advisory only — not legal advice. Does not guarantee visa approval.`,
        ),
      ),
    ),
  );
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const screening = await db.screening.findUnique({
    where: { id },
    select: { report: true, paymentStatus: true },
  });

  if (!screening) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isPaid =
    screening.paymentStatus === "MOCK_SUCCESS" ||
    screening.paymentStatus === "PAID";

  if (!isPaid || !screening.report) {
    return NextResponse.json({ error: "Report not available" }, { status: 403 });
  }

  let report: FullReport;
  try {
    report = JSON.parse(screening.report) as FullReport;
  } catch {
    return NextResponse.json({ error: "Invalid report data" }, { status: 500 });
  }

  const buffer = await renderToBuffer(buildDocument(report, id));

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="aspire-visa-report-${id}.pdf"`,
    },
  });
}
