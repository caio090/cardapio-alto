export interface MetaReportData {
  since: string;
  until: string;
  timezone: string;
  currency: string;
  attribution: string;
  spend: number | null;
  impressions: number | null;
  linkClicks: number | null;
  landingPageViews: number | null;
  purchases: number | null;
  purchaseValue: number | null;
  fetchedAt: string;
  campaignFilter: string;
}
